import React from "react";

/*
 * ============================================================
 * NUMBER TO WORDS (Indian system for INR, International otherwise)
 * ============================================================
 */

const ONES = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
];

const TENS = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

const twoDigitsToWords = (num) => {
    if (num < 20) return ONES[num];
    const ones = num % 10;
    return `${TENS[Math.floor(num / 10)]}${ones ? ` ${ONES[ones]}` : ""}`;
};

const threeDigitsToWords = (num) => {
    const hundreds = Math.floor(num / 100);
    const rest = num % 100;
    let words = "";
    if (hundreds) words += `${ONES[hundreds]} Hundred`;
    if (rest) words += `${words ? " " : ""}${twoDigitsToWords(rest)}`;
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
            parts.push(`${integerToWords(chunk, indian)} ${label}`);
        }
    });

    if (num) parts.push(threeDigitsToWords(num));

    return parts.join(" ");
};

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

const amountInWords = (amount, currency = "INR") => {
    const value = Number(amount) || 0;
    const major = Math.floor(value);
    const minor = Math.round((value - major) * 100);
    const indian = currency === "INR";
    const [majorName, minorName] = CURRENCY_UNITS[currency] || ["", "Cents"];

    let words = `${currency} ${integerToWords(major, indian)}${majorName ? ` ${majorName}` : ""}`;

    if (minor > 0) {
        words += ` and ${integerToWords(minor, indian)} ${minorName}`;
    }

    return `${words} Only.`;
};

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const money = (value, currency = "INR") =>
    Number(value || 0).toLocaleString(currency === "INR" ? "en-IN" : "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const resolvePartyAddress = (invoice) =>
    invoice?.partyAddress ||
    invoice?.party?.address ||
    invoice?.billingAddress ||
    "";

const getTaxMaster = (taxMasterId, taxMasters = []) => {
    if (!taxMasterId) return null;
    return taxMasters.find((tax) => String(tax.id) === String(taxMasterId)) || null;
};

const getItemTaxBreakdown = (item, taxMasters = []) => {
    const quantity = Number(item?.quantity) || 0;
    const unitPrice = Number(item?.unitPrice) || 0;
    const discount = Number(item?.discountAmount) || 0;

    const grossAmount = quantity * unitPrice;
    const taxableAmount = Math.max(grossAmount - discount, 0);

    const taxMaster = item?.taxMaster || getTaxMaster(item?.taxMasterId, taxMasters);

    const taxType = (item?.taxType || taxMaster?.taxType || "").toUpperCase();

    const taxRate =
        item?.taxRate != null
            ? Number(item.taxRate) || 0
            : Number(taxMaster?.taxRate) || 0;

    const taxAmount =
        item?.taxAmount != null
            ? Number(item.taxAmount) || 0
            : (taxableAmount * taxRate) / 100;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === "IGST") {
        igstAmount = item?.igstAmount != null ? Number(item.igstAmount) || 0 : taxAmount;
    } else {
        cgstAmount = item?.cgstAmount != null ? Number(item.cgstAmount) || 0 : taxAmount / 2;
        sgstAmount = item?.sgstAmount != null ? Number(item.sgstAmount) || 0 : taxAmount / 2;
    }

    return {
        grossAmount,
        taxableAmount,
        taxAmount,
        taxRate,
        taxType,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalAmount: taxableAmount + taxAmount,
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
        fontFamily: "'Inter', 'Helvetica Neue', Arial, Helvetica, sans-serif",
        fontSize: "11px",
        lineHeight: "1.4",
        overflow: preview ? "visible" : "hidden",
        boxShadow: preview ? "0 2px 12px rgba(0,0,0,0.12)" : "none",
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

export default function InvoiceTemplate4({
    invoice,
    taxMasters = [],
    preview = false,
}) {
    if (!invoice) return null;

    const items = invoice.invoiceItems || invoice.items || [];
    const company = invoice.pdfCompanyInfo || {};
    const bank = company.bank || {};

    const currency = (invoice.currencyCode || invoice.currency || "INR").toUpperCase();
    const symbol = invoice.currencySymbol || CURRENCY_SYMBOLS[currency] || `${currency} `;
    const fmt = (v) => money(v, currency);

    const totalQuantity = items.reduce((s, i) => s + (Number(i?.quantity) || 0), 0);

    const breakdowns = items.map((item) => getItemTaxBreakdown(item, taxMasters));

    const taxableTotal = breakdowns.reduce((s, b) => s + b.taxableAmount, 0);
    const cgstTotal = breakdowns.reduce((s, b) => s + b.cgstAmount, 0);
    const sgstTotal = breakdowns.reduce((s, b) => s + b.sgstAmount, 0);
    const igstTotal = breakdowns.reduce((s, b) => s + b.igstAmount, 0);
    const taxTotal = cgstTotal + sgstTotal + igstTotal;

    const grandTotal =
        Number(invoice.grandTotal) ||
        taxableTotal + taxTotal + Number(invoice.shippingAmount || 0);

    const isPaid = String(invoice.status || "").toUpperCase() === "PAID";
    const hasIgst = igstTotal > 0;
    const hasTax = taxTotal > 0;

    const logo = company.logo || company.logoUrl || company.logoPath;
    const qrCode =
        company.upiQrCode || company.qrCode || invoice.upiQrCode || invoice.qrCode;
    const signature = company.signature || company.signatureUrl;
    const stamp = company.stamp || company.stampUrl;

    const partyGstin =
        invoice.partyGstin || invoice.party?.gstin || invoice.party?.gstNumber;

    const bankRows = [
        ["Bank", bank.bankName],
        ["Account Holder", bank.accountHolder || company.name],
        ["Account #", bank.accountNumber],
        ["IFSC Code", bank.ifscNumber],
        ["Branch", bank.branchName],
        ["SWIFT Code", bank.swiftCode],
    ].filter(([, v]) => v);

    return (
        <div id="invoice-template-4" style={S.page(preview)}>
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
                            {company.tagline || "MULTI CURRENCY"}
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

                    {company.gstin && (
                        <div style={{ fontWeight: "700", color: "#111111" }}>
                            GSTIN {company.gstin}
                        </div>
                    )}

                    {(company.addressLines || []).map((line, index) => (
                        <div key={index}>{line}</div>
                    ))}

                    {company.contact && (
                        <div>
                            <strong style={{ color: "#111111" }}>Mobile</strong>{" "}
                            {company.contact}
                        </div>
                    )}

                    {company.email && (
                        <div>
                            <strong style={{ color: "#111111" }}>Email</strong>{" "}
                            {company.email}
                        </div>
                    )}

                    {company.website && (
                        <div>
                            <strong style={{ color: "#111111" }}>Website</strong>{" "}
                            {company.website}
                        </div>
                    )}
                </div>
            </div>

            {/* =====================================================
                BILL TO + INVOICE META
            ===================================================== */}
            <div style={{ ...S.rowBetween, padding: "14px 6px 14px" }}>
                <div style={{ maxWidth: "340px" }}>
                    <div style={{ fontWeight: "700", marginBottom: "8px" }}>Bill To:</div>

                    <div style={{ fontWeight: "700", fontSize: "13px" }}>
                        {invoice.partyName || invoice.party?.name || "-"}
                    </div>

                    {resolvePartyAddress(invoice) && (
                        <div
                            style={{
                                marginTop: "3px",
                                whiteSpace: "pre-line",
                                color: "#333333",
                            }}
                        >
                            {resolvePartyAddress(invoice)}
                        </div>
                    )}

                    {partyGstin && (
                        <div style={{ marginTop: "2px", color: "#333333" }}>
                            GSTIN: {partyGstin}
                        </div>
                    )}
                </div>

                <table style={{ borderCollapse: "collapse" }}>
                    <tbody>
                        {[
                            ["Invoice #:", invoice.invoiceNumber || "-"],
                            ["Invoice Date:", invoice.invoiceDate || "-"],
                            [
                                "Place of Supply:",
                                invoice.placeOfSupply || invoice.partyState || "-",
                            ],
                            ["Currency:", currency],
                            ...(invoice.dueDate ? [["Due Date:", invoice.dueDate]] : []),
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
                        <th style={S.th("right")}>Amount ({symbol.trim()})</th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((item, index) => {
                        const b = breakdowns[index];

                        return (
                            <React.Fragment key={item.id || index}>
                                <tr>
                                    <td style={S.td("left")}>{index + 1}</td>

                                    <td style={S.td("left", { fontWeight: "700" })}>
                                        {item.productName ||
                                            item.itemName ||
                                            item.product?.productName ||
                                            "-"}
                                    </td>

                                    <td style={S.td("center")}>
                                        {item.hsnCode || item.product?.hsnCode || "-"}
                                    </td>

                                    <td style={S.td("right")}>
                                        {fmt(b.taxableAmount)}
                                    </td>
                                </tr>

                                <tr>
                                    <td
                                        colSpan={4}
                                        style={{
                                            padding: "5px 10px 10px 42px",
                                            borderBottom: "1px solid #c8d4d4",
                                            fontSize: "11px",
                                            color: "#333333",
                                            whiteSpace: "pre-line",
                                        }}
                                    >
                                        {item.description ||
                                            (Number(item.quantity) > 1
                                                ? `Qty ${item.quantity} × ${fmt(item.unitPrice)}`
                                                : "\u00A0")}

                                        {b.taxRate > 0 && (
                                            <span style={{ marginLeft: "8px" }}>
                                                (Tax {b.taxRate}%)
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
                TAX ROWS (only when GST applies)
            ===================================================== */}
            {hasTax && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ width: "250px", padding: "6px 8px 0 0" }}>
                        <TotalLine label="Taxable Amount" value={`${symbol}${fmt(taxableTotal)}`} />

                        {hasIgst ? (
                            <TotalLine label="IGST" value={`${symbol}${fmt(igstTotal)}`} />
                        ) : (
                            <>
                                <TotalLine label="CGST" value={`${symbol}${fmt(cgstTotal)}`} />
                                <TotalLine label="SGST" value={`${symbol}${fmt(sgstTotal)}`} />
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* =====================================================
                TOTAL
            ===================================================== */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
                    <span style={{ fontSize: "16px", fontWeight: "700" }}>Total</span>
                    <span style={{ fontSize: "19px", fontWeight: "800" }}>
                        {symbol}
                        {fmt(grandTotal)}
                    </span>
                </div>
            </div>

            {/* ITEMS COUNT + WORDS */}
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
                    Total Items / Qty : {items.length} / {totalQuantity}
                </span>

                <span>
                    Total amount (in words): {amountInWords(grandTotal, currency)}
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
                        <span style={{ color: "#16a34a", marginRight: "4px" }}>✓</span>
                    )}
                    {isPaid ? "Amount Paid:" : "Amount Payable:"}
                </span>

                <span>
                    {symbol} {fmt(grandTotal)}
                </span>
            </div>

            {/* =====================================================
                UPI / BANK / SIGNATORY
            ===================================================== */}
            <div style={{ display: "flex", gap: "36px", marginTop: "22px" }}>
                {/* UPI */}
                <div style={{ width: "120px" }}>
                    <div style={{ fontWeight: "700", marginBottom: "4px" }}>
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
                    <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                        Bank Details:
                    </div>

                    <table style={{ borderCollapse: "collapse" }}>
                        <tbody>
                            {bankRows.map(([label, value]) => (
                                <tr key={label}>
                                    <td
                                        style={{
                                            padding: "3px 12px 3px 0",
                                            color: "#333333",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {label}:
                                    </td>
                                    <td style={{ padding: "3px 0", fontWeight: "700" }}>
                                        {value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                    <div>For {company.name || ""}</div>

                    <div style={{ width: "90px", height: "90px", margin: "10px 0 12px" }}>
                        {(stamp || signature) && (
                            <img
                                src={stamp || signature}
                                alt="Seal / Signature"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        )}
                    </div>

                    <div>Authorized Signatory</div>
                </div>
            </div>

            {/* =====================================================
                NOTES / TERMS (optional)
            ===================================================== */}
            {(invoice.notes || invoice.termsAndConditions) && (
                <div style={{ marginTop: "18px", fontSize: "10px", color: "#333333" }}>
                    {invoice.notes && (
                        <div style={{ marginBottom: "8px", whiteSpace: "pre-line" }}>
                            <strong>Notes:</strong> {invoice.notes}
                        </div>
                    )}

                    {invoice.termsAndConditions && (
                        <div style={{ whiteSpace: "pre-line" }}>
                            <strong>Terms and Conditions:</strong>
                            <br />
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
                Page 1 / 1 &nbsp;•&nbsp; This is a digitally signed document.
            </div>
        </div>
    );
}

/*
 * ============================================================
 * SMALL COMPONENTS
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