
import React from "react";

/*
 * ============================================================
 * NUMBER TO WORDS
 * Indian system for INR, International system otherwise
 * ============================================================
 */

const ONES = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
];

const TENS = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
];

const CURRENCY_UNITS = {
    INR: ["Rupees", "Paise"],
    USD: ["Dollars", "Cents"],
    EUR: ["Euros", "Cents"],
    GBP: ["Pounds", "Pence"],
    AED: ["Dirhams", "Fils"],
    SGD: ["Dollars", "Cents"],
    AUD: ["Dollars", "Cents"],
    CAD: ["Dollars", "Cents"],
};

const CURRENCY_SYMBOLS = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "AED ",
    SGD: "S$",
    AUD: "A$",
    CAD: "C$",
};

const twoDigitsToWords = (num) => {
    if (num < 20) return ONES[num];

    const ones = num % 10;

    return `${TENS[Math.floor(num / 10)]}${ones ? ` ${ONES[ones]}` : ""
        }`;
};

const threeDigitsToWords = (num) => {
    const hundreds = Math.floor(num / 100);
    const rest = num % 100;

    let words = "";

    if (hundreds) {
        words += `${ONES[hundreds]} Hundred`;
    }

    if (rest) {
        words += `${words ? " " : ""}${twoDigitsToWords(rest)}`;
    }

    return words;
};

const integerToWords = (value, indian) => {
    let num = Math.floor(Number(value) || 0);

    if (num === 0) return "Zero";

    const scales = indian
        ? [
            [10000000, "Crore"],
            [100000, "Lakh"],
            [1000, "Thousand"],
        ]
        : [
            [1000000000, "Billion"],
            [1000000, "Million"],
            [1000, "Thousand"],
        ];

    const parts = [];

    scales.forEach(([size, label]) => {
        const chunk = Math.floor(num / size);

        num %= size;

        if (chunk) {
            parts.push(
                `${integerToWords(chunk, indian)} ${label}`
            );
        }
    });

    if (num) {
        parts.push(threeDigitsToWords(num));
    }

    return parts.join(" ");
};

const amountInWords = (amount, currency = "INR") => {
    const value = Math.max(0, Number(amount) || 0);

    // Avoid a minor-unit value of 100 after rounding.
    const totalMinor = Math.round(value * 100);
    const major = Math.floor(totalMinor / 100);
    const minor = totalMinor % 100;

    const indian = currency === "INR";

    const [majorName, minorName] =
        CURRENCY_UNITS[currency] || ["", "Cents"];

    let words = `${currency} ${integerToWords(
        major,
        indian
    )}${majorName ? ` ${majorName}` : ""}`;

    if (minor > 0) {
        words += ` and ${integerToWords(
            minor,
            indian
        )} ${minorName}`;
    }

    return `${words} Only.`;
};

/*
 * ============================================================
 * SHARED DATA HELPERS
 *
 * Supports both the existing Template 4 data structure and
 * the shared invoice/company fields used by other templates.
 * ============================================================
 */

const firstValue = (...values) =>
    values.find(
        (value) =>
            value !== undefined &&
            value !== null &&
            value !== ""
    );

const getText = (value) => {
    if (value === undefined || value === null) return "";

    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    return "";
};

const formatDate = (value) => {
    if (!value) return "-";

    if (typeof value !== "string") return String(value);

    // Keep API date-only values from shifting due to time zones.
    const dateOnly = value.match(/^(\d{4}-\d{2}-\d{2})$/);

    if (dateOnly) {
        const [year, month, day] = dateOnly[1]
            .split("-")
            .map(Number);

        return new Date(year, month - 1, day).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const money = (value, currency = "INR") =>
    Number(value || 0).toLocaleString(
        currency === "INR" ? "en-IN" : "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );

const getCurrencyCode = (invoice = {}) => {
    const currency = invoice.currency;

    const value = firstValue(
        invoice.currencyCode,
        invoice.currency_code,
        typeof currency === "object"
            ? currency.currencyCode
            : null,
        typeof currency === "object"
            ? currency.code
            : null,
        typeof currency === "string"
            ? currency
            : null,
        "INR"
    );

    return String(value).toUpperCase();
};

const getInvoiceItems = (invoice = {}) => {
    const items = firstValue(
        invoice.invoiceItems,
        invoice.items,
        invoice.lineItems,
        []
    );

    return Array.isArray(items) ? items : [];
};

const resolvePartyAddress = (invoice = {}) => {
    const party = invoice.party || {};
    const customer = invoice.customer || {};

    return firstValue(
        invoice.partyAddress,
        invoice.billingAddress,
        party.address,
        party.billingAddress,
        customer.address,
        customer.billingAddress,
        ""
    );
};

const resolvePartyName = (invoice = {}) =>
    firstValue(
        invoice.partyName,
        invoice.customerName,
        invoice.party?.name,
        invoice.customer?.customerName,
        invoice.customer?.name,
        invoice.party?.partyName,
        "-"
    );

const resolvePartyGstin = (invoice = {}) =>
    firstValue(
        invoice.partyGstin,
        invoice.customerGstin,
        invoice.party?.gstin,
        invoice.party?.gstNumber,
        invoice.customer?.gstin,
        invoice.customer?.gstNumber,
        ""
    );

const resolveCompany = (invoice = {}) => {
    const company = invoice.pdfCompanyInfo || {};
    const companyInfo = invoice.companyInfo || {};
    const companyObject =
        typeof invoice.company === "object" &&
            invoice.company !== null
            ? invoice.company
            : {};

    const source = {
        ...companyObject,
        ...companyInfo,
        ...company,
    };

    const address = firstValue(
        source.addressLines,
        source.address,
        invoice.companyAddress,
        invoice.address,
        []
    );

    let addressLines = [];

    if (Array.isArray(address)) {
        addressLines = address
            .map((line) => getText(line).trim())
            .filter(Boolean);
    } else if (typeof address === "string") {
        addressLines = address
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
    }

    return {
        ...source,

        name: firstValue(
            source.name,
            source.companyName,
            invoice.companyName,
            invoice.businessName,
            ""
        ),

        companyCode: firstValue(
            source.companyCode,
            invoice.companyCode,
            ""
        ),

        logo: firstValue(
            source.logo,
            source.logoUrl,
            source.logoPath,
            invoice.logo,
            invoice.logoUrl,
            ""
        ),

        gstin: firstValue(
            source.gstin,
            source.gstNumber,
            invoice.companyGstin,
            invoice.gstin,
            ""
        ),

        addressLines,

        contact: firstValue(
            source.contact,
            source.phone,
            source.mobile,
            source.contactNumber,
            invoice.companyPhone,
            invoice.companyContact,
            ""
        ),

        email: firstValue(
            source.email,
            invoice.companyEmail,
            ""
        ),

        website: firstValue(
            source.website,
            invoice.companyWebsite,
            ""
        ),

        tagline: firstValue(
            source.tagline,
            source.companyCode,
            invoice.companyCode,
            ""
        ),

        bank: {
            ...(source.bank || {}),

            bankName: firstValue(
                source.bank?.bankName,
                source.bankName,
                invoice.bankName,
                ""
            ),

            accountHolder: firstValue(
                source.bank?.accountHolder,
                source.bank?.accountHolderName,
                source.accountHolder,
                source.accountHolderName,
                invoice.accountHolder,
                invoice.accountHolderName,
                source.name,
                invoice.companyName,
                ""
            ),

            accountNumber: firstValue(
                source.bank?.accountNumber,
                source.accountNumber,
                invoice.accountNumber,
                ""
            ),

            ifscNumber: firstValue(
                source.bank?.ifscNumber,
                source.bank?.ifsc,
                source.ifscNumber,
                source.ifsc,
                invoice.ifscNumber,
                invoice.ifsc,
                ""
            ),

            branchName: firstValue(
                source.bank?.branchName,
                source.bank?.branch,
                source.branchName,
                source.bankBranch,
                invoice.bankBranch,
                ""
            ),

            swiftCode: firstValue(
                source.bank?.swiftCode,
                source.swiftCode,
                invoice.swiftCode,
                ""
            ),
        },

        upiQrCode: firstValue(
            source.upiQrCode,
            source.qrCode,
            invoice.upiQrCode,
            invoice.qrCode,
            ""
        ),

        signature: firstValue(
            source.signature,
            source.signatureUrl,
            invoice.signature,
            invoice.signatureUrl,
            ""
        ),

        signatureName: firstValue(
            source.signatureName,
            invoice.signatureName,
            ""
        ),

        signatureContent: firstValue(
            source.signatureContent,
            invoice.signatureContent,
            ""
        ),

        stamp: firstValue(
            source.stamp,
            source.stampUrl,
            invoice.stamp,
            invoice.stampUrl,
            ""
        ),
    };
};

// Used only for displaying signature content as text.
// Do not inject API-provided HTML directly into the document.
const signatureContentToText = (content) => {
    if (!content) return "";

    return String(content)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(div|p|li)>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .trim();
};

/*
 * ============================================================
 * TAX HELPERS
 * ============================================================
 */

const getTaxMaster = (taxMasterId, taxMasters = []) => {
    if (!taxMasterId || !Array.isArray(taxMasters)) return null;

    return (
        taxMasters.find(
            (tax) => String(tax.id) === String(taxMasterId)
        ) || null
    );
};

const getItemTaxBreakdown = (item, taxMasters = []) => {
    const quantity = Number(item?.quantity) || 0;
    const unitPrice = Number(item?.unitPrice) || 0;
    const discount = Number(item?.discountAmount) || 0;

    const grossAmount = quantity * unitPrice;

    const taxableAmount = Math.max(
        grossAmount - discount,
        0
    );

    const taxMaster =
        item?.taxMaster ||
        getTaxMaster(
            item?.taxMasterId ||
            item?.taxMaster?.id,
            taxMasters
        );

    const taxType = String(
        firstValue(
            item?.taxType,
            taxMaster?.taxType,
            ""
        )
    ).toUpperCase();

    const taxRate =
        item?.taxRate != null
            ? Number(item.taxRate) || 0
            : Number(taxMaster?.taxRate) || 0;

    const calculatedTaxAmount =
        (taxableAmount * taxRate) / 100;

    const taxAmount =
        item?.taxAmount != null
            ? Number(item.taxAmount) || 0
            : calculatedTaxAmount;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === "IGST") {
        igstAmount =
            item?.igstAmount != null
                ? Number(item.igstAmount) || 0
                : taxAmount;
    } else if (
        taxType === "CGST" ||
        taxType === "SGST" ||
        taxType === "CGST_SGST" ||
        taxType === "CGST+SGST" ||
        taxType === "GST"
    ) {
        cgstAmount =
            item?.cgstAmount != null
                ? Number(item.cgstAmount) || 0
                : taxAmount / 2;

        sgstAmount =
            item?.sgstAmount != null
                ? Number(item.sgstAmount) || 0
                : taxAmount / 2;
    } else {
        cgstAmount = Number(item?.cgstAmount) || 0;
        sgstAmount = Number(item?.sgstAmount) || 0;
        igstAmount = Number(item?.igstAmount) || 0;
    }

    const calculatedTaxTotal =
        cgstAmount + sgstAmount + igstAmount;

    return {
        grossAmount,
        taxableAmount,
        taxAmount: calculatedTaxTotal || taxAmount,
        taxRate,
        taxType,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalAmount: taxableAmount + (
            calculatedTaxTotal || taxAmount
        ),
    };
};

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const S = {
    page: (preview) => ({
        position: preview ? "relative" : "fixed",
        left: preview ? "auto" : "-10000px",
        top: "0",
        width: "794px",
        minHeight: "1123px",
        margin: preview ? "0 auto" : "0",
        padding: "34px 38px 60px 38px",
        boxSizing: "border-box",
        background: "#ffffff",
        color: "#1a1a1a",
        fontFamily:
            "'Inter', 'Helvetica Neue', Arial, Helvetica, sans-serif",
        fontSize: "11px",
        lineHeight: "1.4",
        overflow: preview ? "visible" : "hidden",
        boxShadow: preview
            ? "0 2px 12px rgba(0,0,0,0.12)"
            : "none",
    }),

    rowBetween: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },

    th: (align = "left") => ({
        background: "#000000",
        color: "#ffffff",
        fontWeight: "700",
        fontSize: "11px",
        padding: "6px 10px",
        textAlign: align,
    }),

    td: (align = "left", extra = {}) => ({
        padding: "8px 10px 3px",
        fontSize: "12px",
        textAlign: align,
        verticalAlign: "top",
        ...extra,
    }),
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function InvoiceTemplate1({
    invoice,
    taxMasters = [],
    preview = false,
}) {
    if (!invoice) return null;

    const items = getInvoiceItems(invoice);

    const company = resolveCompany(invoice);
    const bank = company.bank || {};

    const currency = getCurrencyCode(invoice);

    const symbol = firstValue(
        invoice.currencySymbol,
        typeof invoice.currency === "object"
            ? invoice.currency.symbol
            : null,
        CURRENCY_SYMBOLS[currency],
        `${currency} `
    );

    const fmt = (value) => money(value, currency);

    const totalQuantity = items.reduce(
        (sum, item) =>
            sum + (Number(item?.quantity) || 0),
        0
    );

    const breakdowns = items.map((item) =>
        getItemTaxBreakdown(item, taxMasters)
    );

    const taxableTotal = breakdowns.reduce(
        (sum, breakdown) =>
            sum + breakdown.taxableAmount,
        0
    );

    const cgstTotal = breakdowns.reduce(
        (sum, breakdown) =>
            sum + breakdown.cgstAmount,
        0
    );

    const sgstTotal = breakdowns.reduce(
        (sum, breakdown) =>
            sum + breakdown.sgstAmount,
        0
    );

    const igstTotal = breakdowns.reduce(
        (sum, breakdown) =>
            sum + breakdown.igstAmount,
        0
    );

    const taxTotal =
        cgstTotal + sgstTotal + igstTotal;

    const shippingAmount =
        Number(invoice.shippingAmount) || 0;

    const calculatedGrandTotal =
        taxableTotal + taxTotal + shippingAmount;

    const grandTotal =
        invoice.grandTotal != null &&
            invoice.grandTotal !== ""
            ? Number(invoice.grandTotal) || 0
            : calculatedGrandTotal;

    const status = String(
        invoice.status || ""
    ).toUpperCase();

    const isPaid = status === "PAID";

    const hasIgst = igstTotal > 0;
    const hasTax = taxTotal > 0;

    const logo = company.logo;

    const qrCode = company.upiQrCode;

    const signature = company.signature;

    const stamp = company.stamp;

    const signatureText = signatureContentToText(
        company.signatureContent
    );

    const partyGstin = resolvePartyGstin(invoice);

    const partyAddress = resolvePartyAddress(invoice);

    const partyName = resolvePartyName(invoice);

    const bankRows = [
        ["Bank", bank.bankName],
        ["Account Holder", bank.accountHolder],
        ["Account #", bank.accountNumber],
        ["IFSC Code", bank.ifscNumber],
        ["Branch", bank.branchName],
        ["SWIFT Code", bank.swiftCode],
    ].filter(([, value]) => value);

    const invoiceNumber = firstValue(
        invoice.invoiceNumber,
        invoice.invoiceNo,
        "-"
    );

    const invoiceDate = formatDate(
        firstValue(invoice.invoiceDate, invoice.date)
    );

    const dueDate = invoice.dueDate
        ? formatDate(invoice.dueDate)
        : null;

    const placeOfSupply = firstValue(
        invoice.placeOfSupply,
        invoice.partyState,
        invoice.customer?.state,
        "-"
    );

    return (
        <div
            id="invoice-template-4"
            style={S.page(preview)}
        >
            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                style={{
                    ...S.rowBetween,
                    paddingBottom: "12px",
                    borderBottom: "1.5px solid #111111",
                }}
            >
                <div style={{ width: "230px" }}>
                    {logo ? (
                        <img
                            src={logo}
                            alt="Company Logo"
                            style={{
                                display: "block",
                                maxWidth: "100%",
                                maxHeight: "95px",
                                objectFit: "contain",
                            }}
                        />
                    ) : (
                        <div style={{ height: "60px" }} />
                    )}

                    {(company.tagline || currency !== "INR") && (
                        <div
                            style={{
                                marginTop: "6px",
                                fontSize: "11px",
                                fontWeight: "700",
                                letterSpacing: "3px",
                            }}
                        >
                            {invoice.taxType || "MULTI CURRENCY"}
                        </div>
                    )}
                </div>

                <div
                    style={{
                        textAlign: "right",
                        fontSize: "11px",
                        lineHeight: "1.5",
                        color: "#333333",
                        maxWidth: "470px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "21px",
                            fontWeight: "800",
                            color: "#111111",
                            marginBottom: "3px",
                            letterSpacing: "-0.2px",
                        }}
                    >
                        {company.name || "-"}
                    </div>

                    {company.companyCode && (
                        <div>{company.companyCode}</div>
                    )}

                    {company.gstin && (
                        <div
                            style={{
                                fontWeight: "700",
                                color: "#111111",
                            }}
                        >
                            GSTIN {company.gstin}
                        </div>
                    )}

                    {company.addressLines.map((line, index) => (
                        <div key={index}>{line}</div>
                    ))}

                    {company.contact && (
                        <div>
                            <strong
                                style={{ color: "#111111" }}
                            >
                                Mobile
                            </strong>{" "}
                            {company.contact}
                        </div>
                    )}

                    {company.email && (
                        <div>
                            <strong
                                style={{ color: "#111111" }}
                            >
                                Email
                            </strong>{" "}
                            {company.email}
                        </div>
                    )}

                    {company.website && (
                        <div>
                            <strong
                                style={{ color: "#111111" }}
                            >
                                Website
                            </strong>{" "}
                            {company.website}
                        </div>
                    )}
                </div>
            </div>

            {/* =====================================================
                BILL TO + INVOICE META
            ===================================================== */}

            <div
                style={{
                    ...S.rowBetween,
                    padding: "14px 6px 14px",
                }}
            >
                <div style={{ maxWidth: "340px" }}>
                    <div
                        style={{
                            fontWeight: "700",
                            marginBottom: "8px",
                        }}
                    >
                        Bill To:
                    </div>

                    <div
                        style={{
                            fontWeight: "700",
                            fontSize: "13px",
                        }}
                    >
                        {partyName}
                    </div>

                    {partyAddress && (
                        <div
                            style={{
                                marginTop: "3px",
                                whiteSpace: "pre-line",
                                color: "#333333",
                            }}
                        >
                            {typeof partyAddress === "string"
                                ? partyAddress
                                : ""}
                        </div>
                    )}

                    {partyGstin && (
                        <div
                            style={{
                                marginTop: "2px",
                                color: "#333333",
                            }}
                        >
                            GSTIN: {partyGstin}
                        </div>
                    )}
                </div>

                <table style={{ borderCollapse: "collapse" }}>
                    <tbody>
                        {[
                            ["Invoice #:", invoiceNumber],
                            ["Invoice Date:", invoiceDate],
                            ["Place of Supply:", placeOfSupply],
                            ["Currency:", currency],
                            ...(dueDate
                                ? [["Due Date:", dueDate]]
                                : []),
                        ].map(([label, value]) => (
                            <tr key={label}>
                                <td
                                    style={{
                                        padding: "3px 80px 3px 0",
                                        fontWeight: "700",
                                        textAlign: "right",
                                        color: "#333333",
                                    }}
                                >
                                    {label}
                                </td>

                                <td
                                    style={{
                                        padding: "3px 0",
                                        fontWeight: "700",
                                        textAlign: "right",
                                    }}
                                >
                                    {value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* =====================================================
                ITEMS
            ===================================================== */}

            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    tableLayout: "fixed",
                }}
            >
                <colgroup>
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "45%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "30%" }} />
                </colgroup>

                <thead>
                    <tr>
                        <th style={S.th("left")}>#</th>

                        <th style={S.th("left")}>Item</th>

                        <th style={S.th("center")}>HSN/SAC</th>

                        <th style={S.th("right")}>
                            Amount ({String(symbol).trim()})
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((item, index) => {
                        const breakdown = breakdowns[index];

                        const itemName = firstValue(
                            item.productName,
                            item.itemName,
                            item.product?.productName,
                            item.product?.name,
                            item.serviceName,
                            item.description,
                            "-"
                        );

                        const hsnCode = firstValue(
                            item.hsnCode,
                            item.sacCode,
                            item.product?.hsnCode,
                            item.product?.sacCode,
                            "-"
                        );

                        const quantity =
                            Number(item.quantity) || 0;

                        const unitPrice =
                            Number(item.unitPrice) || 0;

                        return (
                            <React.Fragment
                                key={item.id || item.itemId || index}
                            >
                                <tr>
                                    <td style={S.td("left")}>
                                        {index + 1}
                                    </td>

                                    <td
                                        style={S.td("left", {
                                            fontWeight: "700",
                                        })}
                                    >
                                        {itemName}
                                    </td>

                                    <td style={S.td("center")}>
                                        {hsnCode}
                                    </td>

                                    <td style={S.td("right")}>
                                        {fmt(
                                            breakdown.taxableAmount
                                        )}
                                    </td>
                                </tr>

                                <tr>
                                    <td
                                        colSpan={4}
                                        style={{
                                            padding:
                                                "5px 10px 10px 42px",
                                            borderBottom:
                                                "1px solid #c8d4d4",
                                            fontSize: "11px",
                                            color: "#333333",
                                            whiteSpace: "pre-line",
                                        }}
                                    >
                                        {item.description ||
                                            (quantity > 1
                                                ? `Qty ${quantity} × ${fmt(
                                                    unitPrice
                                                )}`
                                                : "\u00A0")}

                                        {breakdown.taxRate > 0 && (
                                            <span
                                                style={{
                                                    marginLeft: "8px",
                                                }}
                                            >
                                                (Tax {breakdown.taxRate}%)
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>

            {/* =====================================================
                TAX ROWS
            ===================================================== */}

            {hasTax && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                >
                    <div
                        style={{
                            width: "250px",
                            padding: "6px 8px 0 0",
                        }}
                    >
                        <TotalLine
                            label="Taxable Amount"
                            value={`${symbol}${fmt(taxableTotal)}`}
                        />

                        {hasIgst ? (
                            <TotalLine
                                label="IGST"
                                value={`${symbol}${fmt(igstTotal)}`}
                            />
                        ) : (
                            <>
                                <TotalLine
                                    label="CGST"
                                    value={`${symbol}${fmt(cgstTotal)}`}
                                />

                                <TotalLine
                                    label="SGST"
                                    value={`${symbol}${fmt(sgstTotal)}`}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* =====================================================
                TOTAL
            ===================================================== */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                <div
                    style={{
                        width: "250px",
                        borderTop: "3px double #bbbbbb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        padding: "6px 8px 3px 8px",
                        boxSizing: "border-box",
                    }}
                >
                    <span
                        style={{
                            fontSize: "16px",
                            fontWeight: "700",
                        }}
                    >
                        Total
                    </span>

                    <span
                        style={{
                            fontSize: "19px",
                            fontWeight: "800",
                        }}
                    >
                        {symbol}
                        {fmt(grandTotal)}
                    </span>
                </div>
            </div>

            {/* ITEMS COUNT + AMOUNT IN WORDS */}

            <div
                style={{
                    ...S.rowBetween,
                    alignItems: "center",
                    borderBottom: "1.5px solid #111111",
                    padding: "2px 6px 4px",
                    fontSize: "10px",
                    color: "#444444",
                }}
            >
                <span>
                    Total Items / Qty : {items.length} /{" "}
                    {totalQuantity}
                </span>

                <span>
                    Total amount (in words):{" "}
                    {amountInWords(grandTotal, currency)}
                </span>
            </div>

            {/* AMOUNT PAYABLE */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "36px",
                    padding: "3px 8px 0 0",
                    fontWeight: "700",
                    fontSize: "12px",
                    color: "#333333",
                }}
            >
                <span>
                    {isPaid && (
                        <span
                            style={{
                                color: "#16a34a",
                                marginRight: "4px",
                            }}
                        >
                            ✓
                        </span>
                    )}

                    {isPaid
                        ? "Amount Paid:"
                        : "Amount Payable:"}
                </span>

                <span>
                    {symbol} {fmt(grandTotal)}
                </span>
            </div>

            {/* =====================================================
                UPI / BANK / SIGNATORY
            ===================================================== */}

            <div
                style={{
                    display: "flex",
                    gap: "36px",
                    marginTop: "22px",
                }}
            >
                {/* UPI */}

                <div style={{ width: "120px" }}>
                    <div
                        style={{
                            fontWeight: "700",
                            marginBottom: "4px",
                        }}
                    >
                        Pay using UPI:
                    </div>

                    {qrCode ? (
                        <img
                            src={qrCode}
                            alt="UPI QR"
                            style={{
                                display: "block",
                                width: "115px",
                                height: "115px",
                                objectFit: "contain",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: "115px",
                                height: "115px",
                                border: "1px dashed #9ca3af",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "9px",
                                color: "#6b7280",
                            }}
                        >
                            UPI QR
                        </div>
                    )}
                </div>

                {/* BANK */}

                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            fontWeight: "700",
                            marginBottom: "4px",
                        }}
                    >
                        Bank Details:
                    </div>

                    {bankRows.length > 0 ? (
                        <table
                            style={{ borderCollapse: "collapse" }}
                        >
                            <tbody>
                                {bankRows.map(([label, value]) => (
                                    <tr key={label}>
                                        <td
                                            style={{
                                                padding:
                                                    "3px 12px 3px 0",
                                                color: "#333333",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {label}:
                                        </td>

                                        <td
                                            style={{
                                                padding: "3px 0",
                                                fontWeight: "700",
                                            }}
                                        >
                                            {value}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div
                            style={{
                                fontSize: "10px",
                                color: "#6b7280",
                            }}
                        >
                            Bank details not provided.
                        </div>
                    )}
                </div>

                {/* SIGNATORY */}

                <div
                    style={{
                        width: "200px",
                        textAlign: "right",
                        fontSize: "10px",
                        color: "#444444",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                    }}
                >
                    <div>
                        For {company.name || ""}
                    </div>

                    <div
                        style={{
                            width: "90px",
                            minHeight: "70px",
                            margin: "10px 0 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {(stamp || signature) && (
                            <img
                                src={stamp || signature}
                                alt="Seal / Signature"
                                style={{
                                    width: "90px",
                                    height: "90px",
                                    objectFit: "contain",
                                }}
                            />
                        )}

                        {!stamp && !signature && signatureText && (
                            <div
                                style={{
                                    width: "100%",
                                    whiteSpace: "pre-line",
                                    overflowWrap: "anywhere",
                                    textAlign: "right",
                                    fontSize: "9px",
                                }}
                            >
                                {signatureText}
                            </div>
                        )}
                    </div>

                    {company.signatureName && (
                        <div
                            style={{
                                fontWeight: "700",
                                marginBottom: "3px",
                            }}
                        >
                            {company.signatureName}
                        </div>
                    )}

                    <div>Authorized Signatory</div>
                </div>
            </div>

            {/* =====================================================
                NOTES / TERMS
            ===================================================== */}

            {(invoice.notes || invoice.termsAndConditions) && (
                <div
                    style={{
                        marginTop: "18px",
                        fontSize: "10px",
                        color: "#333333",
                    }}
                >
                    {invoice.notes && (
                        <div
                            style={{
                                marginBottom: "8px",
                                whiteSpace: "pre-line",
                            }}
                        >
                            <strong>Notes:</strong>{" "}
                            {invoice.notes}
                        </div>
                    )}

                    {invoice.termsAndConditions && (
                        <div style={{ whiteSpace: "pre-line" }}>
                            <strong>
                                Terms and Conditions:
                            </strong>

                            {"\n"}

                            {invoice.termsAndConditions}
                        </div>
                    )}
                </div>
            )}

            {/* =====================================================
                PAGE FOOTER
            ===================================================== */}

            <div
                style={{
                    position: "absolute",
                    left: "38px",
                    bottom: "26px",
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#222222",
                }}
            >
                Page 1 / 1 &nbsp;•&nbsp; This is a digitally signed
                document.
            </div>
        </div>
    );
}

/*
 * ============================================================
 * TOTAL LINE
 * ============================================================
 */

function TotalLine({ label, value }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "2px 0 2px 6px",
                fontSize: "11px",
                fontWeight: "700",
                color: "#333333",
            }}
        >
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}
