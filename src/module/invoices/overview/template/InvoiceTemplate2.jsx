import React from "react";

/*
 * ============================================================
 * INDIAN NUMBER TO WORDS
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

const twoDigitsToWords = (num) => {
    if (num < 20) {
        return ONES[num];
    }

    const tens = Math.floor(num / 10);
    const ones = num % 10;

    return `${TENS[tens]}${ones ? ` ${ONES[ones]}` : ""}`;
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

const integerToIndianWords = (value) => {
    let num = Number(value) || 0;

    if (num === 0) {
        return "Zero";
    }

    num = Math.floor(num);

    const crore = Math.floor(num / 10000000);
    num %= 10000000;

    const lakh = Math.floor(num / 100000);
    num %= 100000;

    const thousand = Math.floor(num / 1000);
    num %= 1000;

    const hundred = num;

    const parts = [];

    if (crore) {
        parts.push(`${threeDigitsToWords(crore)} Crore`);
    }

    if (lakh) {
        parts.push(`${threeDigitsToWords(lakh)} Lakh`);
    }

    if (thousand) {
        parts.push(`${threeDigitsToWords(thousand)} Thousand`);
    }

    if (hundred) {
        parts.push(threeDigitsToWords(hundred));
    }

    return parts.join(" ");
};

const amountInWords = (amount) => {
    const value = Number(amount) || 0;

    const rupees = Math.floor(value);

    const paise = Math.round(
        (value - rupees) * 100
    );

    let words = `INR ${integerToIndianWords(rupees)}`;

    if (paise > 0) {
        words += ` and ${integerToIndianWords(paise)} Paise`;
    }

    return `${words} Only`;
};

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const money = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const resolvePartyAddress = (invoice) => {
    if (!invoice) {
        return "";
    }

    return (
        invoice.partyAddress ||
        invoice.party?.address ||
        invoice.billingAddress ||
        ""
    );
};

const resolveShippingAddress = (invoice) => {
    if (!invoice) {
        return "";
    }

    return (
        invoice.shippingAddress ||
        invoice.shipping?.address ||
        resolvePartyAddress(invoice) ||
        ""
    );
};

const getTaxMaster = (
    taxMasterId,
    taxMasters = []
) => {
    if (!taxMasterId) {
        return null;
    }

    return (
        taxMasters.find(
            (tax) =>
                String(tax.id) ===
                String(taxMasterId)
        ) || null
    );
};

const getItemTaxBreakdown = (
    item,
    taxMasters = []
) => {
    const quantity =
        Number(item?.quantity) || 0;

    const unitPrice =
        Number(item?.unitPrice) || 0;

    const discount =
        Number(item?.discountAmount) || 0;

    const grossAmount =
        quantity * unitPrice;

    const taxableAmount = Math.max(
        grossAmount - discount,
        0
    );

    const taxMaster =
        item?.taxMaster ||
        getTaxMaster(
            item?.taxMasterId,
            taxMasters
        );

    const taxType = (
        item?.taxType ||
        taxMaster?.taxType ||
        ""
    ).toUpperCase();

    const taxRate =
        item?.taxRate != null
            ? Number(item.taxRate) || 0
            : Number(taxMaster?.taxRate) || 0;

    let taxAmount;

    if (item?.taxAmount != null) {
        taxAmount =
            Number(item.taxAmount) || 0;
    } else {
        taxAmount =
            (taxableAmount * taxRate) / 100;
    }

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === "IGST") {
        igstAmount =
            item?.igstAmount != null
                ? Number(item.igstAmount) || 0
                : taxAmount;
    } else {
        cgstAmount =
            item?.cgstAmount != null
                ? Number(item.cgstAmount) || 0
                : taxAmount / 2;

        sgstAmount =
            item?.sgstAmount != null
                ? Number(item.sgstAmount) || 0
                : taxAmount / 2;
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
        totalAmount:
            taxableAmount + taxAmount,
    };
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function InvoiceTemplate2({
    invoice,
    taxMasters = [],
    preview = false,
}) {
    if (!invoice) {
        return null;
    }

    const items =
        invoice.invoiceItems ||
        invoice.items ||
        [];

    const company =
        invoice.pdfCompanyInfo || {};

    const bank =
        company.bank || {};

    const totalQuantity = items.reduce(
        (sum, item) =>
            sum +
            (Number(item?.quantity) || 0),
        0
    );

    const taxableTotal = items.reduce(
        (sum, item) =>
            sum +
            getItemTaxBreakdown(
                item,
                taxMasters
            ).taxableAmount,
        0
    );

    const cgstTotal = items.reduce(
        (sum, item) =>
            sum +
            getItemTaxBreakdown(
                item,
                taxMasters
            ).cgstAmount,
        0
    );

    const sgstTotal = items.reduce(
        (sum, item) =>
            sum +
            getItemTaxBreakdown(
                item,
                taxMasters
            ).sgstAmount,
        0
    );

    const igstTotal = items.reduce(
        (sum, item) =>
            sum +
            getItemTaxBreakdown(
                item,
                taxMasters
            ).igstAmount,
        0
    );

    const taxTotal =
        cgstTotal +
        sgstTotal +
        igstTotal;

    const grandTotal =
        Number(invoice.grandTotal) ||
        taxableTotal +
        taxTotal +
        Number(
            invoice.shippingAmount || 0
        );

    const isPaid =
        String(invoice.status || "")
            .toUpperCase() === "PAID";

    const hasIgst =
        igstTotal > 0;

    const logo =
        company.logo ||
        company.logoUrl ||
        company.logoPath;

    const qrCode =
        company.upiQrCode ||
        company.qrCode ||
        invoice.upiQrCode ||
        invoice.qrCode;

    const signature =
        company.signature ||
        company.signatureUrl;

    return (
        <div
            id="invoice-template-1"
            style={{
                position: preview
                    ? "relative"
                    : "fixed",

                left: preview
                    ? "auto"
                    : "-10000px",

                top: "0",

                width: "794px",

                minHeight: "1123px",

                margin: preview
                    ? "0 auto"
                    : "0",

                padding:
                    "24px 30px 18px 30px",

                boxSizing: "border-box",

                background: "#ffffff",

                color: "#111827",

                fontFamily:
                    "Arial, Helvetica, sans-serif",

                fontSize: "10px",

                lineHeight: "1.25",

                overflow: preview
                    ? "visible"
                    : "hidden",

                boxShadow: preview
                    ? "0 2px 12px rgba(0,0,0,0.12)"
                    : "none",
            }}
        >
            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                style={{
                    border: "1px solid #1f2937",
                }}
            >
                <div
                    style={{
                        height: "32px",
                        borderBottom:
                            "1px solid #1f2937",
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "space-between",
                        padding:
                            "0 10px",
                    }}
                >
                    <div
                        style={{
                            width: "33%",
                        }}
                    />

                    <div
                        style={{
                            width: "34%",
                            textAlign:
                                "center",
                            fontSize: "15px",
                            fontWeight:
                                "700",
                            letterSpacing:
                                "2px",
                            color:
                                "#2563a8",
                        }}
                    >
                        TAX INVOICE
                    </div>

                    <div
                        style={{
                            width: "33%",
                            textAlign:
                                "right",
                            fontSize: "9px",
                            fontWeight:
                                "700",
                        }}
                    >
                        ORIGINAL FOR RECIPIENT
                    </div>
                </div>

                {/* =================================================
                    COMPANY / INVOICE META
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "1fr 1fr",
                    }}
                >
                    {/* COMPANY */}

                    <div
                        style={{
                            borderRight:
                                "1px solid #1f2937",
                        }}
                    >
                        <div
                            style={{
                                height: "140px",
                                padding:
                                    "12px 10px",
                                display: "flex",
                                gap: "10px",
                                boxSizing:
                                    "border-box",
                            }}
                        >
                            {logo ? (
                                <img
                                    src={logo}
                                    alt="Company Logo"
                                    style={{
                                        width:
                                            "85px",
                                        height:
                                            "85px",
                                        objectFit:
                                            "contain",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width:
                                            "75px",
                                        height:
                                            "75px",
                                    }}
                                />
                            )}

                            <div
                                style={{
                                    flex: 1,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize:
                                            "15px",
                                        fontWeight:
                                            "700",
                                        marginBottom:
                                            "3px",
                                    }}
                                >
                                    {company.name ||
                                        "-"}
                                </div>

                                {company.gstin && (
                                    <div
                                        style={{
                                            fontWeight:
                                                "700",
                                        }}
                                    >
                                        GSTIN{" "}
                                        {
                                            company.gstin
                                        }
                                    </div>
                                )}

                                {(
                                    company.addressLines ||
                                    []
                                ).map(
                                    (
                                        line,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                index
                                            }
                                        >
                                            {
                                                line
                                            }
                                        </div>
                                    )
                                )}

                                {company.contact && (
                                    <div>
                                        Mobile{" "}
                                        {
                                            company.contact
                                        }
                                    </div>
                                )}

                                {company.email && (
                                    <div>
                                        Email{" "}
                                        {
                                            company.email
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CUSTOMER */}

                        <div
                            style={{
                                borderTop:
                                    "1px solid #1f2937",
                                minHeight:
                                    "145px",
                                padding:
                                    "8px",
                                boxSizing:
                                    "border-box",
                            }}
                        >
                            <div
                                style={{
                                    fontWeight:
                                        "700",
                                    marginBottom:
                                        "3px",
                                }}
                            >
                                Customer Details:
                            </div>

                            <div
                                style={{
                                    fontWeight:
                                        "700",
                                }}
                            >
                                {invoice.partyName ||
                                    invoice.party
                                        ?.name ||
                                    "-"}
                            </div>

                            <div
                                style={{
                                    fontWeight:
                                        "700",
                                    marginTop:
                                        "3px",
                                }}
                            >
                                Billing address:
                            </div>

                            <div
                                style={{
                                    whiteSpace:
                                        "pre-line",
                                }}
                            >
                                {resolvePartyAddress(
                                    invoice
                                ) || "-"}
                            </div>

                            {(invoice.partyGstin ||
                                invoice.party
                                    ?.gstin ||
                                invoice.party
                                    ?.gstNumber) && (
                                    <div>
                                        Ph / GSTIN:{" "}
                                        {invoice.partyGstin ||
                                            invoice.party
                                                ?.gstin ||
                                            invoice.party
                                                ?.gstNumber}
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* INVOICE DETAILS */}

                    <div>
                        <div
                            style={{
                                display:
                                    "grid",
                                gridTemplateColumns:
                                    "1fr 1fr",
                            }}
                        >
                            <MetaCell
                                label="Invoice #"
                                value={
                                    invoice.invoiceNumber ||
                                    "-"
                                }
                            />

                            <MetaCell
                                label="Invoice Date"
                                value={
                                    invoice.invoiceDate ||
                                    "-"
                                }
                            />

                            <MetaCell
                                label="Place of Supply"
                                value={
                                    invoice.placeOfSupply ||
                                    invoice.partyState ||
                                    "-"
                                }
                            />

                            <MetaCell
                                label="Due Date"
                                value={
                                    invoice.dueDate ||
                                    "-"
                                }
                            />
                        </div>

                        <div
                            style={{
                                borderTop:
                                    "1px solid #1f2937",
                                minHeight:
                                    "145px",
                                padding:
                                    "8px",
                            }}
                        >
                            <div
                                style={{
                                    fontWeight:
                                        "700",
                                    marginBottom:
                                        "4px",
                                }}
                            >
                                Shipping address:
                            </div>

                            <div
                                style={{
                                    whiteSpace:
                                        "pre-line",
                                }}
                            >
                                {resolveShippingAddress(
                                    invoice
                                ) || "-"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                ITEMS
            ===================================================== */}

            <table
                style={{
                    width: "100%",
                    borderCollapse:
                        "collapse",
                    tableLayout:
                        "fixed",
                }}
            >
                <colgroup>
                    <col
                        style={{
                            width: "5%",
                        }}
                    />
                    <col
                        style={{
                            width: "30%",
                        }}
                    />
                    <col
                        style={{
                            width: "11%",
                        }}
                    />
                    <col
                        style={{
                            width: "14%",
                        }}
                    />
                    <col
                        style={{
                            width: "9%",
                        }}
                    />
                    <col
                        style={{
                            width: "15%",
                        }}
                    />
                    <col
                        style={{
                            width: "16%",
                        }}
                    />
                </colgroup>

                <thead>
                    <tr>
                        <Th>#</Th>
                        <Th>Item</Th>
                        <Th>HSN/SAC</Th>
                        <Th>Rate / Item</Th>
                        <Th>Qty</Th>
                        <Th>Taxable Value</Th>
                        <Th>Amount</Th>
                    </tr>
                </thead>

                <tbody>
                    {items.map(
                        (item, index) => {
                            const breakdown =
                                getItemTaxBreakdown(
                                    item,
                                    taxMasters
                                );

                            return (
                                <tr
                                    key={
                                        item.id ||
                                        index
                                    }
                                >
                                    <Td>
                                        {index +
                                            1}
                                    </Td>

                                    <Td
                                        align="left"
                                    >
                                        <div
                                            style={{
                                                fontWeight:
                                                    "700",
                                            }}
                                        >
                                            {item.productName ||
                                                item.itemName ||
                                                item.product
                                                    ?.productName ||
                                                "-"}
                                        </div>

                                        {item.description && (
                                            <div
                                                style={{
                                                    marginTop:
                                                        "3px",
                                                    whiteSpace:
                                                        "pre-line",
                                                }}
                                            >
                                                {
                                                    item.description
                                                }
                                            </div>
                                        )}
                                    </Td>

                                    <Td>
                                        {item.hsnCode ||
                                            item.product
                                                ?.hsnCode ||
                                            "-"}
                                    </Td>

                                    <Td>
                                        {money(
                                            item.unitPrice
                                        )}
                                    </Td>

                                    <Td>
                                        {
                                            item.quantity
                                        }
                                    </Td>

                                    <Td>
                                        {money(
                                            breakdown.taxableAmount
                                        )}
                                    </Td>

                                    <Td
                                        align="right"
                                    >
                                        {money(
                                            breakdown.totalAmount
                                        )}

                                        {breakdown.taxRate >
                                            0 && (
                                                <div
                                                    style={{
                                                        fontSize:
                                                            "8px",
                                                    }}
                                                >
                                                    (
                                                    {
                                                        breakdown.taxRate
                                                    }
                                                    %)
                                                </div>
                                            )}
                                    </Td>
                                </tr>
                            );
                        }
                    )}

                    {/* EMPTY SPACE */}

                    <tr>
                        <td
                            colSpan={7}
                            style={{
                                height:
                                    "170px",
                                border:
                                    "1px solid #9ca3af",
                            }}
                        />
                    </tr>

                    {/* TAXABLE */}

                    <tr>
                        <td
                            colSpan={5}
                            style={{
                                border:
                                    "1px solid #9ca3af",
                                textAlign:
                                    "right",
                                fontWeight:
                                    "700",
                                padding:
                                    "5px",
                            }}
                        >
                            Total Items / Qty:{" "}
                            {items.length} /{" "}
                            {totalQuantity}
                        </td>

                        <td
                            style={{
                                border:
                                    "1px solid #9ca3af",
                                textAlign:
                                    "right",
                                fontWeight:
                                    "700",
                                padding:
                                    "5px",
                            }}
                        >
                            Taxable Amount
                        </td>

                        <td
                            style={{
                                border:
                                    "1px solid #9ca3af",
                                textAlign:
                                    "right",
                                fontWeight:
                                    "700",
                                padding:
                                    "5px",
                            }}
                        >
                            ₹ {money(
                                taxableTotal
                            )}
                        </td>
                    </tr>

                    {/* TAX */}

                    {hasIgst ? (
                        <tr>
                            <td
                                colSpan={5}
                                style={{
                                    border:
                                        "1px solid #9ca3af",
                                }}
                            />

                            <td
                                style={{
                                    border:
                                        "1px solid #9ca3af",
                                    textAlign:
                                        "right",
                                    fontWeight:
                                        "700",
                                    padding:
                                        "5px",
                                }}
                            >
                                IGST{" "}
                                {items[0]
                                    ? getItemTaxBreakdown(
                                        items[0],
                                        taxMasters
                                    ).taxRate
                                    : 0}
                                %
                            </td>

                            <td
                                style={{
                                    border:
                                        "1px solid #9ca3af",
                                    textAlign:
                                        "right",
                                    fontWeight:
                                        "700",
                                    padding:
                                        "5px",
                                }}
                            >
                                ₹{" "}
                                {money(
                                    igstTotal
                                )}
                            </td>
                        </tr>
                    ) : (
                        <>
                            <tr>
                                <td
                                    colSpan={5}
                                    style={{
                                        border:
                                            "1px solid #9ca3af",
                                    }}
                                />

                                <td
                                    style={{
                                        border:
                                            "1px solid #9ca3af",
                                        textAlign:
                                            "right",
                                        fontWeight:
                                            "700",
                                        padding:
                                            "5px",
                                    }}
                                >
                                    CGST
                                </td>

                                <td
                                    style={{
                                        border:
                                            "1px solid #9ca3af",
                                        textAlign:
                                            "right",
                                        fontWeight:
                                            "700",
                                        padding:
                                            "5px",
                                    }}
                                >
                                    ₹{" "}
                                    {money(
                                        cgstTotal
                                    )}
                                </td>
                            </tr>

                            <tr>
                                <td
                                    colSpan={5}
                                    style={{
                                        border:
                                            "1px solid #9ca3af",
                                    }}
                                />

                                <td
                                    style={{
                                        border:
                                            "1px solid #9ca3af",
                                        textAlign:
                                            "right",
                                        fontWeight:
                                            "700",
                                        padding:
                                            "5px",
                                    }}
                                >
                                    SGST
                                </td>

                                <td
                                    style={{
                                        border:
                                            "1px solid #9ca3af",
                                        textAlign:
                                            "right",
                                        fontWeight:
                                            "700",
                                        padding:
                                            "5px",
                                    }}
                                >
                                    ₹{" "}
                                    {money(
                                        sgstTotal
                                    )}
                                </td>
                            </tr>
                        </>
                    )}

                    {/* GRAND TOTAL */}

                    <tr>
                        <td
                            colSpan={6}
                            style={{
                                border:
                                    "1px solid #9ca3af",
                                textAlign:
                                    "right",
                                fontWeight:
                                    "700",
                                fontSize:
                                    "14px",
                                padding:
                                    "6px",
                            }}
                        >
                            Total
                        </td>

                        <td
                            style={{
                                border:
                                    "1px solid #9ca3af",
                                textAlign:
                                    "right",
                                fontWeight:
                                    "700",
                                fontSize:
                                    "14px",
                                padding:
                                    "6px",
                            }}
                        >
                            ₹ {money(
                                grandTotal
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* =====================================================
                AMOUNT IN WORDS
            ===================================================== */}

            <div
                style={{
                    borderLeft:
                        "1px solid #1f2937",
                    borderRight:
                        "1px solid #1f2937",
                    borderBottom:
                        "1px solid #1f2937",
                    padding:
                        "5px 7px",
                    fontSize: "9px",
                }}
            >
                <strong>
                    Total amount (in words):
                </strong>{" "}
                {amountInWords(
                    grandTotal
                )}
            </div>

            {/* =====================================================
                HSN SUMMARY
            ===================================================== */}

            <table
                style={{
                    width: "100%",
                    borderCollapse:
                        "collapse",
                    tableLayout:
                        "fixed",
                }}
            >
                <thead>
                    <tr>
                        <Th>HSN/SAC</Th>
                        <Th>Taxable Value</Th>

                        {hasIgst ? (
                            <>
                                <Th>Rate</Th>
                                <Th>Integrated Tax</Th>
                            </>
                        ) : (
                            <>
                                <Th>CGST</Th>
                                <Th>SGST</Th>
                            </>
                        )}

                        <Th>Total Tax Amount</Th>
                    </tr>
                </thead>

                <tbody>
                    {items.map(
                        (item, index) => {
                            const breakdown =
                                getItemTaxBreakdown(
                                    item,
                                    taxMasters
                                );

                            return (
                                <tr
                                    key={`tax-${index}`}
                                >
                                    <Td>
                                        {item.hsnCode ||
                                            item.product
                                                ?.hsnCode ||
                                            "-"}
                                    </Td>

                                    <Td>
                                        {money(
                                            breakdown.taxableAmount
                                        )}
                                    </Td>

                                    {hasIgst ? (
                                        <>
                                            <Td>
                                                {
                                                    breakdown.taxRate
                                                }
                                                %
                                            </Td>

                                            <Td>
                                                {money(
                                                    breakdown.igstAmount
                                                )}
                                            </Td>
                                        </>
                                    ) : (
                                        <>
                                            <Td>
                                                {money(
                                                    breakdown.cgstAmount
                                                )}
                                            </Td>

                                            <Td>
                                                {money(
                                                    breakdown.sgstAmount
                                                )}
                                            </Td>
                                        </>
                                    )}

                                    <Td>
                                        {money(
                                            breakdown.taxAmount
                                        )}
                                    </Td>
                                </tr>
                            );
                        }
                    )}

                    <tr>
                        <Td>
                            <strong>
                                TOTAL
                            </strong>
                        </Td>

                        <Td>
                            <strong>
                                {money(
                                    taxableTotal
                                )}
                            </strong>
                        </Td>

                        <Td />

                        <Td>
                            <strong>
                                {money(
                                    taxTotal
                                )}
                            </strong>
                        </Td>

                        <Td>
                            <strong>
                                {money(
                                    taxTotal
                                )}
                            </strong>
                        </Td>
                    </tr>
                </tbody>
            </table>

            {/* =====================================================
                PAID STATUS
            ===================================================== */}

            <div
                style={{
                    borderLeft:
                        "1px solid #1f2937",
                    borderRight:
                        "1px solid #1f2937",
                    borderBottom:
                        "1px solid #1f2937",
                    textAlign:
                        "right",
                    padding:
                        "4px 10px",
                    fontWeight:
                        "700",
                }}
            >
                {isPaid && (
                    <span
                        style={{
                            color:
                                "#16a34a",
                            marginRight:
                                "4px",
                        }}
                    >
                        ✓
                    </span>
                )}

                Amount{" "}
                {isPaid
                    ? "Paid"
                    : "Due"}
            </div>

            {/* =====================================================
                BANK / UPI / SIGNATURE
            ===================================================== */}

            <div
                style={{
                    display:
                        "grid",
                    gridTemplateColumns:
                        "1fr 1fr 1fr",
                    borderLeft:
                        "1px solid #1f2937",
                    borderRight:
                        "1px solid #1f2937",
                    borderBottom:
                        "1px solid #1f2937",
                    minHeight:
                        "175px",
                }}
            >
                {/* BANK */}

                <div
                    style={{
                        padding:
                            "10px",
                        borderRight:
                            "1px solid #1f2937",
                    }}
                >
                    <strong>
                        Bank Details:
                    </strong>

                    <div
                        style={{
                            marginTop:
                                "7px",
                            lineHeight:
                                "18px",
                        }}
                    >
                        <div>
                            Bank:{" "}
                            <strong>
                                {
                                    bank.bankName
                                }
                            </strong>
                        </div>

                        <div>
                            Account #:{" "}
                            <strong>
                                {
                                    bank.accountNumber
                                }
                            </strong>
                        </div>

                        <div>
                            IFSC:{" "}
                            <strong>
                                {
                                    bank.ifscNumber
                                }
                            </strong>
                        </div>

                        <div>
                            Branch:{" "}
                            <strong>
                                {
                                    bank.branchName
                                }
                            </strong>
                        </div>
                    </div>
                </div>

                {/* QR */}

                <div
                    style={{
                        padding:
                            "10px",
                        borderRight:
                            "1px solid #1f2937",
                        textAlign:
                            "center",
                    }}
                >
                    <strong>
                        Pay using UPI:
                    </strong>

                    {qrCode ? (
                        <img
                            src={qrCode}
                            alt="UPI QR"
                            style={{
                                display:
                                    "block",
                                width:
                                    "100px",
                                height:
                                    "100px",
                                objectFit:
                                    "contain",
                                margin:
                                    "8px auto",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width:
                                    "100px",
                                height:
                                    "100px",
                                margin:
                                    "8px auto",
                                border:
                                    "1px dashed #9ca3af",
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                fontSize:
                                    "8px",
                                color:
                                    "#6b7280",
                            }}
                        >
                            UPI QR
                        </div>
                    )}
                </div>

                {/* SIGNATURE */}

                <div
                    style={{
                        padding:
                            "10px",
                        textAlign:
                            "center",
                        position:
                            "relative",
                    }}
                >
                    <div>
                        For{" "}
                        <strong>
                            {company.name ||
                                ""}
                        </strong>
                    </div>

                    {signature && (
                        <img
                            src={signature}
                            alt="Signature"
                            style={{
                                width:
                                    "100px",
                                height:
                                    "70px",
                                objectFit:
                                    "contain",
                                margin:
                                    "10px auto",
                            }}
                        />
                    )}

                    <div
                        style={{
                            marginTop:
                                "50px",
                        }}
                    >
                        Authorized Signatory
                    </div>
                </div>
            </div>

            {/* =====================================================
                NOTES + TERMS
            ===================================================== */}

            <div
                style={{
                    display:
                        "grid",
                    gridTemplateColumns:
                        "1fr 1fr",
                    borderLeft:
                        "1px solid #1f2937",
                    borderRight:
                        "1px solid #1f2937",
                    borderBottom:
                        "1px solid #1f2937",
                    minHeight:
                        "105px",
                }}
            >
                <div
                    style={{
                        padding:
                            "8px",
                        borderRight:
                            "1px solid #1f2937",
                    }}
                >
                    <strong>
                        Notes:
                    </strong>

                    <div
                        style={{
                            marginTop:
                                "6px",
                            whiteSpace:
                                "pre-line",
                        }}
                    >
                        {invoice.notes ||
                            "Thank you for the Business"}
                    </div>
                </div>

                <div
                    style={{
                        padding:
                            "8px",
                    }}
                >
                    <strong>
                        Terms and Conditions:
                    </strong>

                    <div
                        style={{
                            marginTop:
                                "5px",
                            whiteSpace:
                                "pre-line",
                        }}
                    >
                        {invoice.termsAndConditions ||
                            `1. Goods once sold cannot be taken back or exchanged.
2. We are not the manufacturers, company will stand for warranty as per their terms and conditions.
3. Interest @24% p.a. will be charged for uncleared bills beyond 15 days.
4. Subject to local Jurisdiction.`}
                    </div>
                </div>
            </div>

            {/* =====================================================
                FOOTER
            ===================================================== */}

            <div
                style={{
                    display:
                        "flex",
                    justifyContent:
                        "space-between",
                    marginTop:
                        "32px",
                    fontSize:
                        "8px",
                }}
            >
                <span>
                    Page 1 / 1
                </span>

                <span>
                    This is a digitally signed
                    document.
                </span>
            </div>
        </div>
    );
}

/*
 * ============================================================
 * TABLE COMPONENTS
 * ============================================================
 */

function Th({ children }) {
    return (
        <th
            style={{
                border:
                    "1px solid #9ca3af",
                padding:
                    "5px 4px",
                background:
                    "#ffffff",
                fontWeight:
                    "700",
                textAlign:
                    "center",
                verticalAlign:
                    "middle",
                fontSize:
                    "9px",
            }}
        >
            {children}
        </th>
    );
}

function Td({
    children,
    align = "center",
}) {
    return (
        <td
            style={{
                border:
                    "1px solid #9ca3af",
                padding:
                    "5px 4px",
                textAlign:
                    align,
                verticalAlign:
                    "top",
                fontSize:
                    "9px",
            }}
        >
            {children}
        </td>
    );
}

function MetaCell({
    label,
    value,
}) {
    return (
        <div
            style={{
                minHeight:
                    "55px",
                padding:
                    "7px",
                borderBottom:
                    "1px solid #1f2937",
                borderRight:
                    "1px solid #1f2937",
                boxSizing:
                    "border-box",
            }}
        >
            <div
                style={{
                    fontWeight:
                        "700",
                    marginBottom:
                        "5px",
                }}
            >
                {label}:
            </div>

            <div>
                {value}
            </div>
        </div>
    );
}