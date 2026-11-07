package com.ims.service.impl.invoice;


import com.ims.entity.InvoiceEntity;
import com.ims.entity.InvoiceItemEntity;
import com.ims.entity.AddressEntity;
import com.ims.exception.ResourceNotFoundException;
import com.ims.repository.InvoiceRepository;
import com.ims.service.serviceInterface.invoice.InvoicePdfService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InvoicePdfServiceImpl implements InvoicePdfService {

    private final InvoiceRepository invoiceRepository;

    private static final float PAGE_WIDTH = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();

    private static final float LEFT = 40;
    private static final float RIGHT = 40;
    private static final float TOP = 40;
    private static final float BOTTOM = 45;

    private static final float CONTENT_WIDTH =
            PAGE_WIDTH - LEFT - RIGHT;

    private static final float LINE_HEIGHT = 15;

    private PDDocument document;
    private PDPageContentStream stream;
    private float y;

    private final PDType1Font regular =
            new PDType1Font(Standard14Fonts.FontName.HELVETICA);

    private final PDType1Font bold =
            new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);


    @Override
    public byte[] generateInvoicePdf(Long invoiceId) {

        InvoiceEntity invoice =
                invoiceRepository.findByIdAndActiveTrue(invoiceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invoice not found with id: " + invoiceId
                                )
                        );

        try (PDDocument pdf = new PDDocument();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {

            this.document = pdf;

            startPage();

            drawCompanyDetails(invoice);

            drawInvoiceHeading(invoice);

            drawCustomerDetails(invoice);

            drawInvoiceItems(invoice);

            drawInvoiceTotals(invoice);

            drawBankDetails(invoice);

            drawNotesAndTerms(invoice);

            closeCurrentPage();

            pdf.save(output);

            log.info(
                    "Invoice PDF generated successfully. invoiceId={}, invoiceNumber={}",
                    invoice.getId(),
                    invoice.getInvoiceNumber()
            );

            return output.toByteArray();

        } catch (IOException exception) {

            log.error(
                    "Invoice PDF generation failed. invoiceId={}",
                    invoiceId,
                    exception
            );

            throw new IllegalStateException(
                    "Unable to generate invoice PDF.",
                    exception
            );
        }
    }


    // =========================================================
    // PAGE MANAGEMENT
    // =========================================================

    private void startPage() throws IOException {

        PDPage page = new PDPage(PDRectangle.A4);

        document.addPage(page);

        stream = new PDPageContentStream(document, page);

        y = PAGE_HEIGHT - TOP;
    }


    private void closeCurrentPage() throws IOException {

        if (stream != null) {

            stream.close();

            stream = null;
        }
    }


    private void ensureSpace(float requiredHeight) throws IOException {

        if (y - requiredHeight < BOTTOM) {

            closeCurrentPage();

            startPage();

            drawText(
                    "INVOICE - " + currentInvoiceNumber,
                    LEFT,
                    y,
                    bold,
                    10
            );

            y -= 30;
        }
    }

    private String currentInvoiceNumber = "";


    // =========================================================
    // COMPANY DETAILS
    // =========================================================

    private void drawCompanyDetails(
            InvoiceEntity invoice
    ) throws IOException {

        currentInvoiceNumber = invoice.getInvoiceNumber();

        if (invoice.getCompanyDetails() == null) {
            return;
        }

        var company = invoice.getCompanyDetails();

        drawText(
                safe(company.getCompanyName()),
                LEFT,
                y,
                bold,
                18
        );

        y -= 20;

        drawText(
                safe(company.getEmail()),
                LEFT,
                y,
                regular,
                9
        );

        y -= LINE_HEIGHT;

        drawText(
                safe(company.getPhone()),
                LEFT,
                y,
                regular,
                9
        );

        y -= 25;

        drawLine();
    }


    // =========================================================
    // INVOICE HEADING
    // =========================================================

    private void drawInvoiceHeading(
            InvoiceEntity invoice
    ) throws IOException {

        ensureSpace(45);

        drawText(
                "TAX INVOICE",
                LEFT,
                y,
                bold,
                16
        );

        y -= 22;

        drawText(
                "Invoice Number: " + safe(invoice.getInvoiceNumber()),
                LEFT,
                y,
                regular,
                10
        );

        drawText(
                "Invoice Date: " + safe(invoice.getInvoiceDate()),
                320,
                y,
                regular,
                10
        );

        y -= LINE_HEIGHT;

        drawText(
                "Due Date: " + safe(invoice.getDueDate()),
                LEFT,
                y,
                regular,
                10
        );

        drawText(
                "Status: " + safe(invoice.getStatus()),
                320,
                y,
                regular,
                10
        );

        y -= 25;

        drawLine();
    }


    // =========================================================
    // CUSTOMER DETAILS
    // =========================================================

    private void drawCustomerDetails(
            InvoiceEntity invoice
    ) throws IOException {

        ensureSpace(90);

        drawText(
                "BILL TO",
                LEFT,
                y,
                bold,
                11
        );

        y -= 18;

        if (invoice.getCustomer() != null) {

            var customer = invoice.getCustomer();

            drawText(
                    safe(customer.getDisplayName()),
                    LEFT,
                    y,
                    bold,
                    10
            );

            y -= LINE_HEIGHT;

            drawText(
                    safe(customer.getEmail()),
                    LEFT,
                    y,
                    regular,
                    9
            );

            y -= LINE_HEIGHT;

            drawText(
                    safe(customer.getMobile()),
                    LEFT,
                    y,
                    regular,
                    9
            );

            y -= LINE_HEIGHT;

            AddressEntity address = customer.getBillingAddress();

            if (address != null) {

                drawText(
                        safe(address.getAddress())
                                + ", "
                                + safe(address.getCity())
                                + ", "
                                + safe(address.getState())
                                + " "
                                + safe(address.getZipCode()),
                        LEFT,
                        y,
                        regular,
                        9
                );

                y -= LINE_HEIGHT;
            }
        }

        y -= 12;

        drawLine();
    }


    // =========================================================
    // INVOICE ITEMS
    // =========================================================

    private void drawInvoiceItems(
            InvoiceEntity invoice
    ) throws IOException {

        ensureSpace(45);

        drawText(
                "ITEM DETAILS",
                LEFT,
                y,
                bold,
                11
        );

        y -= 20;

        drawText("Description", LEFT, y, bold, 8);
        drawText("Qty", 235, y, bold, 8);
        drawText("Rate", 275, y, bold, 8);
        drawText("Discount", 330, y, bold, 8);
        drawText("Tax", 400, y, bold, 8);
        drawText("Total", 475, y, bold, 8);

        y -= 8;

        drawLine();

        List<InvoiceItemEntity> items =
                invoice.getInvoiceItems();

        if (items == null || items.isEmpty()) {

            y -= LINE_HEIGHT;

            drawText(
                    "No invoice items found.",
                    LEFT,
                    y,
                    regular,
                    9
            );

            return;
        }

        for (InvoiceItemEntity item : items) {

            ensureSpace(35);

            y -= 17;

            drawText(
                    safe(item.getDescription()),
                    LEFT,
                    y,
                    regular,
                    8
            );

            drawText(
                    number(item.getQuantity()),
                    235,
                    y,
                    regular,
                    8
            );

            drawText(
                    number(item.getUnitPrice()),
                    275,
                    y,
                    regular,
                    8
            );

            drawText(
                    number(item.getDiscountAmount()),
                    330,
                    y,
                    regular,
                    8
            );

            drawText(
                    number(item.getTaxAmount()),
                    400,
                    y,
                    regular,
                    8
            );

            drawText(
                    number(item.getTotalAmount()),
                    475,
                    y,
                    regular,
                    8
            );
        }

        y -= 20;

        drawLine();
    }


    // =========================================================
    // TOTALS
    // =========================================================

    private void drawInvoiceTotals(
            InvoiceEntity invoice
    ) throws IOException {

        ensureSpace(140);

        float labelX = 350;
        float valueX = 475;

        drawAmountRow(
                "Subtotal",
                invoice.getSubtotal(),
                labelX,
                valueX
        );

        drawAmountRow(
                "Discount",
                invoice.getDiscountAmount(),
                labelX,
                valueX
        );

        drawAmountRow(
                "Tax",
                invoice.getTaxAmount(),
                labelX,
                valueX
        );

        drawAmountRow(
                "Shipping",
                invoice.getShippingAmount(),
                labelX,
                valueX
        );

        y -= 5;

        drawLine();

        y -= 20;

        drawText(
                "GRAND TOTAL",
                labelX,
                y,
                bold,
                12
        );

        drawText(
                currency(invoice, invoice.getGrandTotal()),
                valueX,
                y,
                bold,
                12
        );

        y -= 30;
    }


    private void drawAmountRow(
            String label,
            BigDecimal amount,
            float labelX,
            float valueX
    ) throws IOException {

        ensureSpace(20);

        drawText(label, labelX, y, regular, 9);

        drawText(
                number(amount),
                valueX,
                y,
                regular,
                9
        );

        y -= LINE_HEIGHT;
    }


    // =========================================================
    // BANK DETAILS
    // =========================================================

    private void drawBankDetails(
            InvoiceEntity invoice
    ) throws IOException {

        if (invoice.getBankAccount() == null) {
            return;
        }

        ensureSpace(85);

        var bank = invoice.getBankAccount();

        drawText(
                "BANK DETAILS",
                LEFT,
                y,
                bold,
                11
        );

        y -= 18;

        drawText(
                "Bank: " + safe(bank.getBankName()),
                LEFT,
                y,
                regular,
                9
        );

        y -= LINE_HEIGHT;

        drawText(
                "Account Name: " + safe(bank.getAccountName()),
                LEFT,
                y,
                regular,
                9
        );

        y -= LINE_HEIGHT;

        drawText(
                "Account Number: " + safe(bank.getAccountNumber()),
                LEFT,
                y,
                regular,
                9
        );

        y -= LINE_HEIGHT;

        drawText(
                "IFSC: " + safe(bank.getIfsc()),
                LEFT,
                y,
                regular,
                9
        );

        y -= 25;
    }


    // =========================================================
    // NOTES AND TERMS
    // =========================================================

    private void drawNotesAndTerms(
            InvoiceEntity invoice
    ) throws IOException {

        if (invoice.getNotes() != null
                && !invoice.getNotes().isBlank()) {

            ensureSpace(45);

            drawText(
                    "NOTES",
                    LEFT,
                    y,
                    bold,
                    10
            );

            y -= LINE_HEIGHT;

            drawWrappedText(
                    invoice.getNotes(),
                    LEFT,
                    9
            );

            y -= 12;
        }

        if (invoice.getTermsAndConditions() != null
                && !invoice.getTermsAndConditions().isBlank()) {

            ensureSpace(45);

            drawText(
                    "TERMS AND CONDITIONS",
                    LEFT,
                    y,
                    bold,
                    10
            );

            y -= LINE_HEIGHT;

            drawWrappedText(
                    invoice.getTermsAndConditions(),
                    LEFT,
                    9
            );
        }

        ensureSpace(25);

        y -= 15;

        drawText(
                "This is a computer generated invoice.",
                LEFT,
                y,
                regular,
                8
        );
    }


    // =========================================================
    // PDF HELPERS
    // =========================================================

    private void drawText(
            String text,
            float x,
            float y,
            PDType1Font font,
            float fontSize
    ) throws IOException {

        if (text == null || text.isBlank()) {
            return;
        }

        stream.beginText();

        stream.setFont(font, fontSize);

        stream.newLineAtOffset(x, y);

        stream.showText(sanitize(text));

        stream.endText();
    }


    private void drawLine() throws IOException {

        stream.moveTo(LEFT, y);

        stream.lineTo(PAGE_WIDTH - RIGHT, y);

        stream.stroke();

        y -= 12;
    }


    private void drawWrappedText(
            String text,
            float x,
            float fontSize
    ) throws IOException {

        if (text == null || text.isBlank()) {
            return;
        }

        String[] words = sanitize(text).split("\\s+");

        StringBuilder line = new StringBuilder();

        for (String word : words) {

            String candidate = line.isEmpty()
                    ? word
                    : line + " " + word;

            float width =
                    regular.getStringWidth(candidate) / 1000 * fontSize;

            if (width > CONTENT_WIDTH && !line.isEmpty()) {

                ensureSpace(LINE_HEIGHT);

                drawText(
                        line.toString(),
                        x,
                        y,
                        regular,
                        fontSize
                );

                y -= LINE_HEIGHT;

                line = new StringBuilder(word);

            } else {

                line = new StringBuilder(candidate);
            }
        }

        if (!line.isEmpty()) {

            ensureSpace(LINE_HEIGHT);

            drawText(
                    line.toString(),
                    x,
                    y,
                    regular,
                    fontSize
            );

            y -= LINE_HEIGHT;
        }
    }


    private String currency(
            InvoiceEntity invoice,
            BigDecimal amount
    ) {

        String code = "INR";

        int decimalPlaces = 2;

        if (invoice.getCurrency() != null) {

            code = invoice.getCurrency().getCurrencyCode();

            if (invoice.getCurrency().getDecimalPlaces() != null) {
                decimalPlaces =
                        invoice.getCurrency().getDecimalPlaces();
            }
        }

        return code + " " +
                safe(amount).setScale(
                        decimalPlaces,
                        RoundingMode.HALF_UP
                ).toPlainString();
    }


    private String number(BigDecimal value) {

        return safe(value).toPlainString();
    }


    private BigDecimal safe(BigDecimal value) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }


    private String safe(Object value) {

        return value == null
                ? ""
                : value.toString();
    }


    private String sanitize(String value) {

        return value
                .replace("\u20B9", "INR ")
                .replace("\u2013", "-")
                .replace("\u2014", "-")
                .replace("\u2018", "'")
                .replace("\u2019", "'")
                .replace("\u201C", "\"")
                .replace("\u201D", "\"")
                .replaceAll("[^\\x20-\\x7E]", "?");
    }
}