
import React from "react";
import { getInvoiceTemplateData } from "../../utils/invoiceTemplateHelpers";

const safe = (value, fallback = "-") => {
    if (value === null || value === undefined || value === "") return fallback;
    if (typeof value === "object") return fallback;
    return String(value);
};

export default function ProfessionalInvoiceLayout({
    invoice,
    taxMasters = [],
    variant = "blue",
}) {
    if (!invoice) return null;

    const d = getInvoiceTemplateData(invoice, taxMasters);

    const themes = {
        blue: {
            primary: "#17365D",
            secondary: "#EAF0F7",
            accent: "#315B91",
            border: "#CBD5E1",
            heading: "#17365D",
            background: "#FFFFFF",
        },
        premium: {
            primary: "#202020",
            secondary: "#F5F1E8",
            accent: "#A1844B",
            border: "#D8D1C4",
            heading: "#202020",
            background: "#FFFFFF",
        },
        green: {
            primary: "#176B52",
            secondary: "#EAF5EF",
            accent: "#21845F",
            border: "#B9D7C8",
            heading: "#176B52",
            background: "#FFFFFF",
        },
    };

    const theme = themes[variant] || themes.blue;

    const {
        company = {},
        bank = {},
        bankRows = [],
        items = [],
        breakdowns = [],
        symbol = "₹",
        fmt,
        taxableTotal = 0,
        cgstTotal = 0,
        sgstTotal = 0,
        igstTotal = 0,
        grandTotal = 0,
        totalQuantity = 0,
        hasTax = false,
        hasIgst = false,
        partyName,
        partyAddress,
        partyEmail,
        partyPhone,
        partyGstin,
        invoiceNumber,
        invoiceDate,
        dueDate,
        placeOfSupply,
        logo,
        qrCode,
        signature,
        stamp,
        signatureText,
        amountInWords,
    } = d;

    const money = (value) => {
        const number = Number(value ?? 0);
        return `${symbol}${typeof fmt === "function"
            ? fmt(number)
            : number.toFixed(2)}`;
    };

    const get = (obj, keys, fallback = "-") => {
        for (const key of keys) {
            const value = obj?.[key];
            if (
                value !== undefined &&
                value !== null &&
                value !== "" &&
                typeof value !== "object"
            ) {
                return value;
            }
        }
        return fallback;
    };

    const companyAddress = Array.isArray(company.addressLines)
        ? company.addressLines.filter(Boolean).join(", ")
        : safe(company.addressLines, "");

    const bankDetails = bankRows.length
        ? bankRows
        : [
            ["Bank", bank.bankName],
            ["Account Name", bank.accountName],
            ["Account Number", bank.accountNumber],
            ["IFSC", bank.ifsc],
            ["Branch", bank.branchName],
            ["UPI ID", bank.upiId],
        ];

    const validBankDetails = bankDetails.filter(
        ([, value]) =>
            value !== null &&
            value !== undefined &&
            value !== "" &&
            typeof value !== "object"
    );

    const css = {
        page: {
            width: "100%",
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "26px",
            background: theme.background,
            color: "#222",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: "12px",
            lineHeight: 1.5,
            boxSizing: "border-box",
        },
        sectionTitle: {
            color: theme.heading,
            fontWeight: 700,
            fontSize: "12px",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
        },
        border: {
            border: `1px solid ${theme.border}`,
        },
        cell: {
            padding: "8px",
            border: `1px solid ${theme.border}`,
            verticalAlign: "top",
        },
        th: {
            padding: "9px 7px",
            background: theme.secondary,
            color: theme.primary,
            border: `1px solid ${theme.border}`,
            textAlign: "left",
            fontWeight: 700,
        },
    };

    return (
        <div
            className={`professional-invoice professional-invoice-${variant}`}
            style={css.page}
        >
            {/* HEADER */}

            {variant === "blue" && (
                <div
                    style={{
                        background: theme.primary,
                        color: "#fff",
                        padding: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "20px",
                    }}
                >
                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                        {logo && (
                            <img
                                src={logo}
                                alt="Company logo"
                                crossOrigin="anonymous"
                                style={{ maxWidth: "85px", maxHeight: "65px", objectFit: "contain" }}
                            />
                        )}
                        <div>
                            <div style={{ fontSize: "21px", fontWeight: 700 }}>
                                {safe(company.name, "Company Name")}
                            </div>
                            <div>{companyAddress}</div>
                            <div>{safe(company.email, "")}</div>
                            <div>{safe(company.phone, "")}</div>
                        </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "25px", fontWeight: 800 }}>
                            INVOICE
                        </div>
                        <div>#{safe(invoiceNumber)}</div>
                        <div>{safe(invoiceDate)}</div>
                    </div>
                </div>
            )}

            {variant === "premium" && (
                <div
                    style={{
                        borderTop: `5px solid ${theme.accent}`,
                        borderBottom: `1px solid ${theme.border}`,
                        padding: "22px 5px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div>
                        {logo && (
                            <img
                                src={logo}
                                alt="Company logo"
                                crossOrigin="anonymous"
                                style={{ maxWidth: "100px", maxHeight: "65px", objectFit: "contain", marginBottom: "8px" }}
                            />
                        )}
                        <div style={{ fontSize: "22px", fontWeight: 700 }}>
                            {safe(company.name, "Company Name")}
                        </div>
                        <div>{companyAddress}</div>
                        <div>{safe(company.email, "")}</div>
                        <div>{safe(company.phone, "")}</div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                        <div
                            style={{
                                fontSize: "32px",
                                letterSpacing: "4px",
                                color: theme.accent,
                                fontWeight: 300,
                            }}
                        >
                            INVOICE
                        </div>
                        <div style={{ fontWeight: 700 }}>
                            {safe(invoiceNumber)}
                        </div>
                        <div>{safe(invoiceDate)}</div>
                    </div>
                </div>
            )}

            {variant === "green" && (
                <div
                    style={{
                        borderBottom: `4px solid ${theme.primary}`,
                        padding: "12px 5px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "15px",
                    }}
                >
                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                        {logo && (
                            <img
                                src={logo}
                                alt="Company logo"
                                crossOrigin="anonymous"
                                style={{ maxWidth: "85px", maxHeight: "65px", objectFit: "contain" }}
                            />
                        )}
                        <div>
                            <div style={{ color: theme.primary, fontSize: "21px", fontWeight: 800 }}>
                                {safe(company.name, "Company Name")}
                            </div>
                            <div>{companyAddress}</div>
                            <div>{safe(company.email, "")}</div>
                            <div>{safe(company.phone, "")}</div>
                        </div>
                    </div>

                    <div
                        style={{
                            background: theme.primary,
                            color: "#fff",
                            padding: "13px 22px",
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: "22px", fontWeight: 800 }}>
                            TAX INVOICE
                        </div>
                        <div>#{safe(invoiceNumber)}</div>
                    </div>
                </div>
            )}

            {/* COMPANY TAX DETAILS */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                    padding: "9px 4px",
                    borderBottom: `1px solid ${theme.border}`,
                }}
            >
                <span>
                    <strong>GSTIN:</strong> {safe(company.gstNumber)}
                </span>
                <span>
                    <strong>PAN:</strong> {safe(company.panNumber)}
                </span>
                <span>
                    <strong>Website:</strong> {safe(company.website)}
                </span>
            </div>

            {/* BILL TO AND INVOICE DETAILS */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.3fr 1fr",
                    gap: "15px",
                    margin: "18px 0",
                }}
            >
                <div
                    style={{
                        padding: "14px",
                        background: theme.secondary,
                        borderLeft: `4px solid ${theme.accent}`,
                    }}
                >
                    <div style={css.sectionTitle}>Bill To</div>
                    <div style={{ fontSize: "15px", fontWeight: 700 }}>
                        {safe(partyName)}
                    </div>
                    {partyGstin && <div>GSTIN: {safe(partyGstin)}</div>}
                    <div style={{ whiteSpace: "pre-line" }}>
                        {safe(partyAddress)}
                    </div>
                    {partyEmail && <div>Email: {safe(partyEmail)}</div>}
                    {partyPhone && <div>Phone: {safe(partyPhone)}</div>}
                    {placeOfSupply && (
                        <div>Place of Supply: {safe(placeOfSupply)}</div>
                    )}
                </div>

                <div style={{ padding: "12px", ...css.border }}>
                    <div style={css.sectionTitle}>Invoice Information</div>
                    {[
                        ["Invoice Number", invoiceNumber],
                        ["Invoice Date", invoiceDate],
                        ["Due Date", dueDate],
                        ["Status", invoice.status],
                        ["Place of Supply", placeOfSupply],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "8px",
                                padding: "4px 0",
                                borderBottom: `1px solid ${theme.border}`,
                            }}
                        >
                            <span>{label}</span>
                            <strong>{safe(value)}</strong>
                        </div>
                    ))}
                </div>
            </div>

            {/* ITEMS */}

            <div style={css.sectionTitle}>Invoice Items</div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                <thead>
                    <tr>
                        {[
                            "#",
                            "Description",
                            "HSN/SAC",
                            "Rate",
                            "Qty",
                            "Taxable Value",
                            "Tax",
                            "Amount",
                        ].map((heading, index) => (
                            <th
                                key={heading}
                                style={{
                                    ...css.th,
                                    textAlign: index === 1 ? "left" : "right",
                                }}
                            >
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {items.map((item, index) => {
                        const rate = get(item, ["unitPrice", "rate", "baseUnitPrice"], 0);
                        const quantity = get(item, ["quantity", "qty"], 0);
                        const taxable = get(item, ["taxableValue", "taxableAmount", "taxableTotal"], 0);
                        const tax = get(item, ["taxAmount", "totalTax", "tax"], 0);
                        const total = get(item, ["total", "totalAmount", "amount", "lineTotal"], 0);

                        return (
                            <tr key={item.id ?? index}>
                                <td style={css.cell}>{index + 1}</td>
                                <td style={css.cell}>
                                    <strong>
                                        {safe(get(item, ["name", "itemName", "productName", "serviceName"]))}
                                    </strong>
                                    {item.description && (
                                        <div>{safe(item.description, "")}</div>
                                    )}
                                </td>
                                <td style={{ ...css.cell, textAlign: "right" }}>
                                    {safe(get(item, ["hsnCode", "hsn", "sacCode", "sac"]))}
                                </td>
                                <td style={{ ...css.cell, textAlign: "right" }}>
                                    {money(rate)}
                                </td>
                                <td style={{ ...css.cell, textAlign: "right" }}>
                                    {safe(quantity, "0")} {safe(get(item, ["unitName", "unit"], ""), "")}
                                </td>
                                <td style={{ ...css.cell, textAlign: "right" }}>
                                    {money(taxable)}
                                </td>
                                <td style={{ ...css.cell, textAlign: "right" }}>
                                    {money(tax)}
                                </td>
                                <td style={{ ...css.cell, textAlign: "right", fontWeight: 700 }}>
                                    {money(total)}
                                </td>
                            </tr>
                        );
                    })}

                    {items.length === 0 && (
                        <tr>
                            <td colSpan={8} style={css.cell}>
                                No invoice items found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* QUANTITY AND TOTALS */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 0.9fr",
                    gap: "18px",
                    marginTop: "18px",
                }}
            >
                <div style={{ ...css.border, padding: "13px" }}>
                    <div style={css.sectionTitle}>Payment Details</div>
                    <div>Total Items: {items.length}</div>
                    <div>Total Quantity: {safe(totalQuantity, "0")}</div>

                    {amountInWords && (
                        <div style={{ marginTop: "8px" }}>
                            <strong>Amount in Words:</strong>
                            <div>{safe(amountInWords)}</div>
                        </div>
                    )}

                    <div style={{ marginTop: "14px" }}>
                        <strong>Bank Details</strong>
                        {validBankDetails.map(([label, value], index) => (
                            <div key={`${label}-${index}`} style={{ display: "flex", gap: "8px" }}>
                                <span style={{ minWidth: "105px" }}>{label}:</span>
                                <strong>{safe(value)}</strong>
                            </div>
                        ))}
                    </div>

                    {qrCode && (
                        <div style={{ marginTop: "10px" }}>
                            <img
                                src={qrCode}
                                alt="Payment QR"
                                crossOrigin="anonymous"
                                style={{ width: "105px", height: "105px", objectFit: "contain" }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ ...css.border, padding: "13px" }}>
                    <div style={css.sectionTitle}>Invoice Summary</div>

                    {[
                        ["Taxable Amount", taxableTotal],
                        ...(hasIgst
                            ? [["IGST", igstTotal]]
                            : hasTax
                                ? [["CGST", cgstTotal], ["SGST", sgstTotal]]
                                : []),
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "7px 0",
                                borderBottom: `1px solid ${theme.border}`,
                            }}
                        >
                            <span>{label}</span>
                            <strong>{money(value)}</strong>
                        </div>
                    ))}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: theme.primary,
                            color: "#fff",
                            padding: "13px",
                            marginTop: "12px",
                            fontSize: "17px",
                        }}
                    >
                        <strong>Grand Total</strong>
                        <strong>{money(grandTotal)}</strong>
                    </div>

                    <div style={{ textAlign: "right", marginTop: "8px" }}>
                        Amount Payable: <strong>{money(grandTotal)}</strong>
                    </div>
                </div>
            </div>

            {/* TAX BREAKDOWN */}

            {breakdowns.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                    <div style={css.sectionTitle}>Tax Summary</div>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {["HSN/SAC", "Taxable Value", "Tax Rate", "Tax Amount"].map((heading) => (
                                    <th key={heading} style={css.th}>{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {breakdowns.map((row, index) => (
                                <tr key={row.id ?? index}>
                                    <td style={css.cell}>
                                        {safe(get(row, ["hsnCode", "hsn", "sacCode", "sac"]))}
                                    </td>
                                    <td style={{ ...css.cell, textAlign: "right" }}>
                                        {money(get(row, ["taxableValue", "taxableAmount"], 0))}
                                    </td>
                                    <td style={{ ...css.cell, textAlign: "right" }}>
                                        {safe(get(row, ["taxRate", "rate", "igstRate", "cgstRate"]))}%
                                    </td>
                                    <td style={{ ...css.cell, textAlign: "right" }}>
                                        {money(get(row, ["taxAmount", "totalTax", "igstAmount", "cgstAmount"], 0))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* NOTES AND SIGNATURE */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                    marginTop: "22px",
                }}
            >
                <div style={{ ...css.border, padding: "13px" }}>
                    <div style={css.sectionTitle}>Notes & Terms</div>
                    <div style={{ whiteSpace: "pre-line" }}>
                        {safe(invoice.notes, "Thank you for your business.", "")}
                    </div>
                    {invoice.termsAndConditions && (
                        <div style={{ marginTop: "10px", whiteSpace: "pre-line" }}>
                            <strong>Terms and Conditions:</strong>
                            <div>{safe(invoice.termsAndConditions)}</div>
                        </div>
                    )}
                </div>

                <div
                    style={{
                        ...css.border,
                        padding: "13px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        minHeight: "125px",
                        textAlign: "right",
                    }}
                >
                    <strong>For {safe(company.name, "Company Name")}</strong>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {stamp && (
                            <img
                                src={stamp}
                                alt="Company stamp"
                                crossOrigin="anonymous"
                                style={{ maxWidth: "65px", maxHeight: "65px", objectFit: "contain" }}
                            />
                        )}
                        {signature && (
                            <img
                                src={signature}
                                alt="Signature"
                                crossOrigin="anonymous"
                                style={{ maxWidth: "110px", maxHeight: "65px", objectFit: "contain" }}
                            />
                        )}
                    </div>

                    {signatureText && <div>{safe(signatureText)}</div>}
                    <strong>Authorized Signatory</strong>
                </div>
            </div>

            <div
                style={{
                    borderTop: `2px solid ${theme.accent}`,
                    marginTop: "20px",
                    paddingTop: "9px",
                    textAlign: "center",
                    fontSize: "10px",
                    color: "#666",
                }}
            >
                This is a digitally generated invoice.
            </div>
        </div>
    );
}
