package com.ims.service.impl.invoice;



import com.ims.entity.InvoiceEntity;
import com.ims.entity.InvoiceSequenceEntity;
import com.ims.enums.InvoiceType;
import com.ims.repository.InvoiceRepository;
import com.ims.repository.InvoiceSequenceRepository;
import com.ims.service.serviceInterface.invoice.InvoiceNumberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceNumberServiceImpl
        implements InvoiceNumberService {

    private final InvoiceSequenceRepository invoiceSequenceRepository;
    private final InvoiceRepository invoiceRepository;


    // =====================================================
    // PURCHASE NUMBER
    // =====================================================

    @Override
    public String generatePurchaseNumber() {

        InvoiceSequenceEntity sequence =
                invoiceSequenceRepository
                        .findByInvoiceType(InvoiceType.PURCHASE)
                        .orElseGet(() -> {

                            InvoiceSequenceEntity entity =
                                    new InvoiceSequenceEntity();

                            entity.setInvoiceType(
                                    InvoiceType.PURCHASE
                            );

                            entity.setCurrentNumber(0L);

                            return entity;
                        });


        long nextNumber =
                sequence.getCurrentNumber() + 1;


        sequence.setCurrentNumber(
                nextNumber
        );


        invoiceSequenceRepository.save(sequence);


        return String.format(
                "PUR-%06d",
                nextNumber
        );
    }


    // =====================================================
    // PURCHASE INVOICE NUMBER
    // =====================================================

    @Override
    public String generatePurchaseInvoiceNumber() {

        InvoiceSequenceEntity sequence =
                invoiceSequenceRepository
                        .findByInvoiceType(
                                InvoiceType.PURCHASE_INVOICE
                        )
                        .orElseGet(() -> {

                            InvoiceSequenceEntity entity =
                                    new InvoiceSequenceEntity();

                            entity.setInvoiceType(
                                    InvoiceType.PURCHASE_INVOICE
                            );

                            entity.setCurrentNumber(
                                    10000L
                            );

                            return entity;
                        });


        long nextNumber =
                sequence.getCurrentNumber() + 1;


        sequence.setCurrentNumber(
                nextNumber
        );


        invoiceSequenceRepository.save(sequence);


        return String.format(
                "INV-P-%05d",
                nextNumber
        );
    }


    // =====================================================
    // SALE NUMBER
    // =====================================================

    @Override
    public String generateSaleNumber() {

        InvoiceSequenceEntity sequence =
                invoiceSequenceRepository
                        .findByInvoiceType(
                                InvoiceType.SALE
                        )
                        .orElseGet(() -> {

                            InvoiceSequenceEntity entity =
                                    new InvoiceSequenceEntity();

                            entity.setInvoiceType(
                                    InvoiceType.SALE
                            );

                            entity.setCurrentNumber(0L);

                            return entity;
                        });


        long nextNumber =
                sequence.getCurrentNumber() + 1;


        sequence.setCurrentNumber(
                nextNumber
        );


        invoiceSequenceRepository.save(sequence);


        return String.format(
                "SAL-%06d",
                nextNumber
        );
    }


    // =====================================================
    // SALE INVOICE NUMBER
    // =====================================================

    @Override
    public String generateSaleInvoiceNumber() {

        InvoiceSequenceEntity sequence =
                invoiceSequenceRepository
                        .findByInvoiceType(
                                InvoiceType.SALE_INVOICE
                        )
                        .orElseGet(() -> {

                            InvoiceSequenceEntity entity =
                                    new InvoiceSequenceEntity();

                            entity.setInvoiceType(
                                    InvoiceType.SALE_INVOICE
                            );

                            entity.setCurrentNumber(
                                    10000L
                            );

                            return entity;
                        });


        long nextNumber =
                sequence.getCurrentNumber() + 1;


        sequence.setCurrentNumber(
                nextNumber
        );


        invoiceSequenceRepository.save(sequence);


        return String.format(
                "INV-S-%05d",
                nextNumber
        );
    }


    // =====================================================
    // GENERAL INVOICE NUMBER
    // =====================================================

    @Override
    public String generateInvoiceNumber() {

        int year = LocalDate.now().getYear();

        String prefix = "INV-" + year + "-";
        String legacyPrefix = "INV" + year + " -";

        int nextNumber = 1;

        // Check invoices generated using the new format.
        Optional<InvoiceEntity> latestInvoice =
                invoiceRepository
                        .findTopByInvoiceNumberStartingWithOrderByInvoiceNumberDesc(prefix);

        if (latestInvoice.isPresent()) {
            String lastNumber = latestInvoice.get().getInvoiceNumber();
            String sequence = lastNumber.substring(prefix.length());
            nextNumber = Math.max(nextNumber, Integer.parseInt(sequence) + 1);
        }

        // Also consider invoices generated using the previous format.
        Optional<InvoiceEntity> latestLegacyInvoice =
                invoiceRepository
                        .findTopByInvoiceNumberStartingWithOrderByInvoiceNumberDesc(legacyPrefix);

        if (latestLegacyInvoice.isPresent()) {
            String lastNumber = latestLegacyInvoice.get().getInvoiceNumber();
            String sequence = lastNumber.substring(legacyPrefix.length());
            nextNumber = Math.max(nextNumber, Integer.parseInt(sequence) + 1);
        }

        return prefix + String.format("%04d", nextNumber);
    }
}