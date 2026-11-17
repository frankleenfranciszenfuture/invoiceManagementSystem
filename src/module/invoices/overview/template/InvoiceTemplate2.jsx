
import React from "react";
import { getInvoiceTemplateData } from "../../utils/invoiceTemplateHelpers";

const text = (value, fallback = "-") => {
    if (value === null || value === undefined || value === "") return fallback;
    if (typeof value === "object") return fallback;
    return String(value);
};

const amount = (value, fmt) => {
    const number = Number(value ?? 0);
    return typeof fmt === "function" ? fmt(number) : number.toFixed(2);
};

const cellStyle = {
    border: "1px solid #777",
    padding: "5px 6px",
    verticalAlign: "top",
};

const headingStyle = {
    fontWeight: 700,
    background: "#f3f4f6",
    padding: "6px",
    border: "1px solid #777",
};

export default function InvoiceTemplate2({
    invoice,
    taxMasters = [],
    preview = false,
}) {
    if (!invoice) return null;

    const data = getInvoiceTemplateData(invoice, taxMasters);

    const {
        company = {},
        bank = {},
        bankRows = [],
        items = [],
        breakdowns = [],
        currency,
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
        isPaid = false,
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
    } = data;

    const companyAddress = Array.isArray(company.addressLines)
        ? company.addressLines.filter(Boolean).join(", ")
        : text(company.addressLines, "");

    const companyName = text(company.name, "Company Name");

    const invoiceStatus = text(
        invoice.status,
        "DRAFT"
    ).toUpperCase();

    const formatMoney = (value) =>
        `${symbol}${amount(value, fmt)}`;

    const getItem = (item, ...keys) => {
        for (const key of keys) {
            const value = item?.[key];

            if (
                value !== null &&
                value !== undefined &&
                value !== "" &&
                typeof value !== "object"
            ) {
                return value;
            }
        }

        return "-";
    };

    const getBreakdown = (row, ...keys) => {
        for (const key of keys) {
            const value = row?.[key];

            if (
                value !== null &&
                value !== undefined &&
                value !== "" &&
                typeof value !== "object"
            ) {
                return value;
            }
        }

        return "-";
    };

    const displayBankRows = bankRows.length
        ? bankRows
        : [
            ["Bank", bank.bankName],
            ["Account Name", bank.accountName],
            ["Account #", bank.accountNumber],
            ["IFSC", bank.ifsc],
            ["Branch", bank.branchName],
            ["UPI ID", bank.upiId],
        ];

    const validBankRows = displayBankRows.filter(
        ([, value]) =>
            value !== null &&
            value !== undefined &&
            value !== "" &&
            typeof value !== "object"
    );

    return (
        <div
            className="invoice-template-2 mx-auto bg-white text-black"
            style={{
                width: "100%",
                maxWidth: "1100px",
                minHeight: "760px",
                padding: "20px",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "12px",
                lineHeight: 1.35,
                color: "#222",
                boxSizing: "border-box",
            }}
        >
            {/* ================= HEADER ================= */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "2px solid #333",
                    paddingBottom: "8px",
                    marginBottom: "8px",
                }}
            >
                <div style={{ flex: 1 }}>
                    <span
                        style={{
                            color: "#2563eb",
                            fontWeight: 700,
                            fontSize: "15px",
                            letterSpacing: "3px",
                        }}
                    >
                        TAX INVOICE
                    </span>
                </div>

                <div
                    style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                    }}
                >
                    ORIGINAL FOR RECIPIENT
                </div>
            </div>

            {/* ================= COMPANY / CUSTOMER / INVOICE ================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.25fr 1fr 0.9fr",
                    border: "1px solid #444",
                }}
            >
                {/* Company */}

                <div
                    style={{
                        ...cellStyle,
                        display: "flex",
                        gap: "12px",
                    }}
                >
                    <div style={{ width: "90px", flexShrink: 0 }}>
                        {logo && (
                            <img
                                src={logo}
                                alt="Company Logo"
                                crossOrigin="anonymous"
                                style={{
                                    maxWidth: "85px",
                                    maxHeight: "70px",
                                    objectFit: "contain",
                                }}
                            />
                        )}
                    </div>

                    <div>
                        <div style={{ fontSize: "16px", fontWeight: 700 }}>
                            {companyName}
                        </div>

                        {company.legalName && (
                            <div>{text(company.legalName)}</div>
                        )}

                        {company.gstNumber && (
                            <div>
                                <strong>GSTIN:</strong>{" "}
                                {text(company.gstNumber)}
                            </div>
                        )}

                        {company.panNumber && (
                            <div>
                                <strong>PAN:</strong>{" "}
                                {text(company.panNumber)}
                            </div>
                        )}

                        {companyAddress && (
                            <div>{companyAddress}</div>
                        )}

                        {company.email && (
                            <div>Email: {text(company.email)}</div>
                        )}

                        {company.phone && (
                            <div>Phone: {text(company.phone)}</div>
                        )}

                        {company.website && (
                            <div>{text(company.website)}</div>
                        )}
                    </div>
                </div>

                {/* Customer */}

                <div style={cellStyle}>
                    <strong>Customer Details:</strong>

                    <div style={{ fontWeight: 700, marginTop: "3px" }}>
                        {text(partyName)}
                    </div>

                    {partyGstin && (
                        <div>
                            <strong>GSTIN:</strong> {text(partyGstin)}
                        </div>
                    )}

                    {partyAddress && (
                        <div style={{ whiteSpace: "pre-line" }}>
                            {text(partyAddress)}
                        </div>
                    )}

                    {partyEmail && (
                        <div>Email: {text(partyEmail)}</div>
                    )}

                    {partyPhone && (
                        <div>Ph: {text(partyPhone)}</div>
                    )}

                    {placeOfSupply && (
                        <div style={{ marginTop: "4px" }}>
                            <strong>Place of Supply:</strong>{" "}
                            {text(placeOfSupply)}
                        </div>
                    )}
                </div>

                {/* Invoice details */}

                <div style={cellStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong>Invoice #:</strong>
                        <strong>{text(invoiceNumber)}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong>Invoice Date:</strong>
                        <strong>{text(invoiceDate)}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong>Due Date:</strong>
                        <strong>{text(dueDate)}</strong>
                    </div>

                    <div style={{ marginTop: "8px" }}>
                        <strong>Status:</strong> {invoiceStatus}
                    </div>

                    {currency?.currencyCode && (
                        <div>
                            <strong>Currency:</strong>{" "}
                            {text(currency.currencyCode)}
                        </div>
                    )}
                </div>
            </div>

            {/* ================= ITEMS TABLE ================= */}

            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "8px",
                    fontSize: "11px",
                }}
            >
                <thead>
                    <tr>
                        {[
                            ["#", "4%"],
                            ["Item", "27%"],
                            ["HSN/SAC", "9%"],
                            ["Rate / Item", "12%"],
                            ["Qty", "9%"],
                            ["Taxable Value", "12%"],
                            ["Tax Amount", "13%"],
                            ["Amount", "14%"],
                        ].map(([label, width]) => (
                            <th
                                key={label}
                                style={{
                                    ...headingStyle,
                                    width,
                                    textAlign:
                                        label === "Item" ? "left" : "right",
                                }}
                            >
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {items.map((item, index) => {
                        const quantity = Number(
                            getItem(item, "quantity", "qty") === "-"
                                ? 0
                                : getItem(item, "quantity", "qty")
                        );

                        const rate = getItem(
                            item,
                            "unitPrice",
                            "rate",
                            "baseUnitPrice"
                        );

                        const taxable = getItem(
                            item,
                            "taxableValue",
                            "taxableAmount",
                            "taxableTotal",
                            "taxablePrice"
                        );

                        const tax = getItem(
                            item,
                            "taxAmount",
                            "totalTax",
                            "tax"
                        );

                        const total = getItem(
                            item,
                            "total",
                            "totalAmount",
                            "amount",
                            "lineTotal"
                        );

                        return (
                            <tr key={item.id ?? index}>
                                <td style={cellStyle}>{index + 1}</td>

                                <td style={cellStyle}>
                                    <strong>
                                        {text(
                                            getItem(
                                                item,
                                                "name",
                                                "itemName",
                                                "productName",
                                                "serviceName"
                                            )
                                        )}
                                    </strong>

                                    {getItem(item, "description") !== "-" && (
                                        <div style={{ marginTop: "3px" }}>
                                            {text(item.description)}
                                        </div>
                                    )}
                                </td>

                                <td style={{ ...cellStyle, textAlign: "right" }}>
                                    {text(
                                        getItem(item, "hsnCode", "hsn", "sacCode", "sac")
                                    )}
                                </td>

                                <td style={{ ...cellStyle, textAlign: "right" }}>
                                    {amount(rate === "-" ? 0 : rate, fmt)}
                                </td>

                                <td style={{ ...cellStyle, textAlign: "right" }}>
                                    {quantity}{" "}
                                    {text(getItem(item, "unitName", "unit"), "")}
                                </td>

                                <td style={{ ...cellStyle, textAlign: "right" }}>
                                    {amount(taxable === "-" ? 0 : taxable, fmt)}
                                </td>

                                <td style={{ ...cellStyle, textAlign: "right" }}>
                                    {amount(tax === "-" ? 0 : tax, fmt)}
                                </td>

                                <td style={{ ...cellStyle, textAlign: "right" }}>
                                    <strong>
                                        {amount(total === "-" ? 0 : total, fmt)}
                                    </strong>
                                </td>
                            </tr>
                        );
                    })}

                    {items.length === 0 && (
                        <tr>
                            <td colSpan={8} style={cellStyle}>
                                No invoice items found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* ================= BANK / TOTALS ================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr",
                    marginTop: "-1px",
                }}
            >
                {/* Bank information */}

                <div style={cellStyle}>
                    <div>
                        Total Items / Qty: {items.length} / {totalQuantity}
                    </div>

                    <div style={{ margin: "3px 0 7px" }}>
                        Total amount (in words):{" "}
                        <strong>{text(amountInWords)}</strong>
                    </div>

                    <div style={{ display: "flex", gap: "15px" }}>
                        <div style={{ flex: 1 }}>
                            <strong>Bank Details:</strong>

                            {validBankRows.map(([label, value], index) => (
                                <div
                                    key={`${label}-${index}`}
                                    style={{
                                        display: "flex",
                                        gap: "5px",
                                        marginTop: "2px",
                                    }}
                                >
                                    <span style={{ minWidth: "100px" }}>
                                        {label}:
                                    </span>
                                    <strong>{text(value)}</strong>
                                </div>
                            ))}
                        </div>

                        {qrCode && (
                            <div
                                style={{
                                    width: "115px",
                                    textAlign: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <img
                                    src={qrCode}
                                    alt="Payment QR Code"
                                    crossOrigin="anonymous"
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        objectFit: "contain",
                                    }}
                                />
                                <div style={{ fontSize: "9px" }}>
                                    Scan to Pay
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Totals */}

                <div>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                        }}
                    >
                        <tbody>
                            <tr>
                                <td style={cellStyle}>
                                    <strong>Taxable Amount</strong>
                                </td>
                                <td style={{ ...cellStyle, textAlign: "right" }}>
                                    <strong>{formatMoney(taxableTotal)}</strong>
                                </td>
                            </tr>

                            {hasTax && !hasIgst && (
                                <>
                                    <tr>
                                        <td style={cellStyle}>CGST</td>
                                        <td style={{ ...cellStyle, textAlign: "right" }}>
                                            {formatMoney(cgstTotal)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style={cellStyle}>SGST</td>
                                        <td style={{ ...cellStyle, textAlign: "right" }}>
                                            {formatMoney(sgstTotal)}
                                        </td>
                                    </tr>
                                </>
                            )}

                            {hasIgst && (
                                <tr>
                                    <td style={cellStyle}>IGST</td>
                                    <td style={{ ...cellStyle, textAlign: "right" }}>
                                        {formatMoney(igstTotal)}
                                    </td>
                                </tr>
                            )}

                            <tr>
                                <td style={cellStyle}>
                                    <strong style={{ fontSize: "15px" }}>
                                        Total
                                    </strong>
                                </td>
                                <td style={{ ...cellStyle, textAlign: "right" }}>
                                    <strong style={{ fontSize: "17px" }}>
                                        {formatMoney(grandTotal)}
                                    </strong>
                                </td>
                            </tr>

                            <tr>
                                <td style={cellStyle}>
                                    <strong>Amount Payable</strong>
                                </td>
                                <td style={{ ...cellStyle, textAlign: "right" }}>
                                    <strong>{formatMoney(grandTotal)}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= HSN TAX SUMMARY ================= */}

            {breakdowns.length > 0 && (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginTop: "-1px",
                        fontSize: "10px",
                    }}
                >
                    <thead>
                        <tr>
                            <th style={headingStyle}>HSN/SAC</th>
                            <th style={{ ...headingStyle, textAlign: "right" }}>
                                Taxable Value
                            </th>
                            <th style={{ ...headingStyle, textAlign: "center" }}>
                                Tax Rate
                            </th>
                            <th style={{ ...headingStyle, textAlign: "right" }}>
                                Tax Amount
                            </th>
                            <th style={{ ...headingStyle, textAlign: "right" }}>
                                Total Tax Amount
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {breakdowns.map((row, index) => {
                            const taxRate = getBreakdown(
                                row,
                                "taxRate",
                                "rate",
                                "igstRate",
                                "cgstRate"
                            );

                            const taxAmount = getBreakdown(
                                row,
                                "taxAmount",
                                "totalTax",
                                "igstAmount",
                                "cgstAmount"
                            );

                            return (
                                <tr key={row.id ?? index}>
                                    <td style={cellStyle}>
                                        {text(
                                            getBreakdown(
                                                row,
                                                "hsnCode",
                                                "hsn",
                                                "sacCode",
                                                "sac"
                                            )
                                        )}
                                    </td>

                                    <td style={{ ...cellStyle, textAlign: "right" }}>
                                        {amount(
                                            getBreakdown(
                                                row,
                                                "taxableValue",
                                                "taxableAmount"
                                            ) === "-"
                                                ? 0
                                                : getBreakdown(
                                                    row,
                                                    "taxableValue",
                                                    "taxableAmount"
                                                ),
                                            fmt
                                        )}
                                    </td>

                                    <td style={{ ...cellStyle, textAlign: "center" }}>
                                        {taxRate === "-" ? "-" : `${taxRate}%`}
                                    </td>

                                    <td style={{ ...cellStyle, textAlign: "right" }}>
                                        {amount(
                                            taxAmount === "-" ? 0 : taxAmount,
                                            fmt
                                        )}
                                    </td>

                                    <td style={{ ...cellStyle, textAlign: "right" }}>
                                        {amount(
                                            getBreakdown(
                                                row,
                                                "totalTaxAmount",
                                                "taxAmount",
                                                "totalTax"
                                            ) === "-"
                                                ? 0
                                                : getBreakdown(
                                                    row,
                                                    "totalTaxAmount",
                                                    "taxAmount",
                                                    "totalTax"
                                                ),
                                            fmt
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {/* ================= NOTES / TERMS / SIGNATURE ================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 0.65fr",
                    marginTop: "-1px",
                    minHeight: "125px",
                }}
            >
                {/* Notes */}

                <div style={cellStyle}>
                    <strong>Notes:</strong>

                    <div style={{ marginTop: "6px", whiteSpace: "pre-line" }}>
                        {text(invoice.notes, "Thank you for your business.", "")}
                    </div>
                </div>

                {/* Terms */}

                <div style={cellStyle}>
                    <strong>Terms and Conditions:</strong>

                    <div
                        style={{
                            marginTop: "6px",
                            whiteSpace: "pre-line",
                        }}
                    >
                        {text(
                            invoice.termsAndConditions ??
                            invoice.terms ??
                            invoice.paymentTerms,
                            "Goods once sold cannot be taken back or exchanged."
                        )}
                    </div>
                </div>

                {/* Signature */}

                <div
                    style={{
                        ...cellStyle,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        textAlign: "right",
                    }}
                >
                    <strong>For {companyName}</strong>

                    <div
                        style={{
                            minHeight: "65px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            gap: "5px",
                        }}
                    >
                        {stamp && (
                            <img
                                src={stamp}
                                alt="Company Stamp"
                                crossOrigin="anonymous"
                                style={{
                                    maxWidth: "65px",
                                    maxHeight: "65px",
                                    objectFit: "contain",
                                }}
                            />
                        )}

                        {signature && (
                            <img
                                src={signature}
                                alt="Authorized Signature"
                                crossOrigin="anonymous"
                                style={{
                                    maxWidth: "100px",
                                    maxHeight: "65px",
                                    objectFit: "contain",
                                }}
                            />
                        )}
                    </div>

                    {signatureText && (
                        <div>{text(signatureText)}</div>
                    )}

                    <strong>Authorized Signatory</strong>
                </div>
            </div>

            {/* ================= FOOTER ================= */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 10px 0",
                    fontSize: "10px",
                    fontWeight: 600,
                }}
            >
                <span>Page 1 / 1</span>

                <span>
                    {isPaid
                        ? "This invoice has been paid."
                        : "This is a digitally generated document."}
                </span>
            </div>
        </div>
    );
}
