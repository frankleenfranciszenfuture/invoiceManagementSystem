import React from "react";

/* ============================================================
   NUMBER TO WORDS
============================================================ */

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

const numberToWords = (num) => {
    num = Math.floor(Number(num) || 0);

    if (num < 20) {
        return ONES[num];
    }

    if (num < 100) {
        return `${TENS[Math.floor(num / 10)]}${num % 10 ? `-${ONES[num % 10]}` : ""
            }`;
    }

    if (num < 1000) {
        return `${ONES[Math.floor(num / 100)]} Hundred${num % 100
            ? ` ${numberToWords(num % 100)}`
            : ""
            }`;
    }

    if (num < 100000) {
        return `${numberToWords(Math.floor(num / 1000))} Thousand${num % 1000
            ? ` ${numberToWords(num % 1000)}`
            : ""
            }`;
    }

    if (num < 10000000) {
        return `${numberToWords(Math.floor(num / 100000))} Lakh${num % 100000
            ? ` ${numberToWords(num % 100000)}`
            : ""
            }`;
    }

    return `${numberToWords(Math.floor(num / 10000000))} Crore${num % 10000000
        ? ` ${numberToWords(num % 10000000)}`
        : ""
        }`;
};


/* ============================================================
   HELPERS
============================================================ */

const money = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const getItems = (invoice) =>
    invoice?.items ||
    invoice?.invoiceItems ||
    invoice?.lineItems ||
    [];

const getCustomer = (invoice) =>
    invoice?.customer ||
    invoice?.selectedCustomer ||
    {};

const getCompany = (invoice) =>
    invoice?.company ||
    invoice?.companyDetails ||
    {};


/* ============================================================
   TEMPLATE 2
============================================================ */

export default function InvoicePdfTemplate2({
    invoice = {},
    preview = false,
}) {
    const items = getItems(invoice);
    const customer = getCustomer(invoice);
    const company = getCompany(invoice);

    const invoiceNumber =
        invoice?.invoiceNumber ||
        invoice?.number ||
        "INV-11";

    const invoiceDate =
        invoice?.invoiceDate ||
        invoice?.date ||
        "";

    const dueDate =
        invoice?.dueDate ||
        "";

    const companyName =
        company?.companyName ||
        invoice?.companyName ||
        "Hindustan Unilever";

    const gstin =
        company?.gstin ||
        invoice?.companyGstin ||
        "27AAACT2727Q1ZW";

    const customerName =
        customer?.customerName ||
        invoice?.customerName ||
        "Hein Schumacher";

    const billingAddress =
        customer?.billingAddress ||
        invoice?.billingAddress ||
        "Marathahalli - Sarjapur Outer Ring Road,";

    const placeOfSupply =
        invoice?.placeOfSupply ||
        "29-KARNATAKA";

    const shippingAddress =
        invoice?.shippingAddress ||
        billingAddress;

    const totalTaxable =
        Number(
            invoice?.taxableAmount ||
            invoice?.subtotal ||
            0
        );

    const cgst =
        Number(invoice?.cgstAmount || 0);

    const sgst =
        Number(invoice?.sgstAmount || 0);

    const igst =
        Number(invoice?.igstAmount || 0);

    const totalTax =
        cgst + sgst + igst;

    const grandTotal =
        Number(
            invoice?.grandTotal ||
            invoice?.totalAmount ||
            totalTaxable + totalTax
        );

    const totalQty = items.reduce(
        (sum, item) =>
            sum + Number(item?.quantity || item?.qty || 0),
        0
    );

    const amountWords =
        numberToWords(Math.round(grandTotal));

    return (
        <div
            id="invoice-pdf-template-2"
            style={{
                position: preview ? "relative" : "fixed",
                left: preview ? "auto" : "-10000px",
                top: "0",

                width: "794px",
                minHeight: "1123px",

                boxSizing: "border-box",

                padding: "20px 30px 15px 30px",

                background: "#ffffff",
                color: "#111827",

                fontFamily:
                    "Arial, Helvetica, sans-serif",

                fontSize: "12px",
                lineHeight: "1.25",

                margin: preview
                    ? "0 auto"
                    : undefined,

                overflow: preview
                    ? "visible"
                    : "hidden",
            }}
        >

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                style={{
                    border: "1px solid #222",
                }}
            >

                <div
                    style={{
                        height: "30px",
                        borderBottom: "1px solid #222",

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        position: "relative",
                        fontWeight: "700",
                        letterSpacing: "3px",
                        fontSize: "15px",
                    }}
                >
                    TAX INVOICE

                    <span
                        style={{
                            position: "absolute",
                            right: "8px",
                            fontSize: "11px",
                            letterSpacing: "1px",
                        }}
                    >
                        ORIGINAL FOR RECIPIENT
                    </span>
                </div>


                {/* =================================================
                    COMPANY + INVOICE META
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "52% 48%",
                    }}
                >

                    {/* COMPANY */}

                    <div
                        style={{
                            borderRight:
                                "1px solid #222",
                            minHeight: "112px",
                            padding: "8px",
                            display: "flex",
                            gap: "10px",
                        }}
                    >

                        <div
                            style={{
                                width: "100px",
                                height: "85px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                            }}
                        >
                            {company?.logo ? (
                                <img
                                    src={company.logo}
                                    alt="Company"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "80px",
                                        objectFit: "contain",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        fontSize: "25px",
                                        fontWeight: "700",
                                        color: "#172554",
                                        textAlign: "center",
                                    }}
                                >
                                    {companyName
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div>
                            <div
                                style={{
                                    fontSize: "15px",
                                    fontWeight: "700",
                                }}
                            >
                                {companyName}
                            </div>

                            <div>
                                GSTIN {gstin}
                            </div>

                            <div>
                                {company?.address ||
                                    "64, Whitefield Main Rd, Palm Meadows, Whitefield"}
                            </div>

                            <div>
                                {company?.city ||
                                    "Bengaluru, KARNATAKA, 560066"}
                            </div>

                            <div>
                                Mobile{" "}
                                {company?.phone ||
                                    "9999999999"}
                            </div>

                            {company?.email && (
                                <div>
                                    Email {company.email}
                                </div>
                            )}
                        </div>

                    </div>


                    {/* INVOICE META */}

                    <div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "1fr 1fr",
                            }}
                        >

                            <MetaCell
                                label="Invoice #:"
                                value={invoiceNumber}
                            />

                            <MetaCell
                                label="Invoice Date:"
                                value={invoiceDate}
                            />

                            <MetaCell
                                label="Place of Supply:"
                                value={placeOfSupply}
                            />

                            <MetaCell
                                label="Due Date:"
                                value={dueDate}
                            />

                        </div>

                        <div
                            style={{
                                padding: "8px",
                                minHeight: "60px",
                                borderTop:
                                    "1px solid #222",
                            }}
                        >

                            <strong>
                                Shipping address:
                            </strong>

                            <div
                                style={{
                                    whiteSpace: "pre-line",
                                    marginTop: "3px",
                                }}
                            >
                                {shippingAddress}
                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    CUSTOMER
                ================================================= */}

                <div
                    style={{
                        width: "52%",
                        borderTop:
                            "1px solid #222",
                        borderRight:
                            "1px solid #222",
                        padding: "8px",
                        minHeight: "125px",
                    }}
                >

                    <strong>
                        Customer Details:
                    </strong>

                    <div
                        style={{
                            fontWeight: "700",
                        }}
                    >
                        {customerName}
                    </div>

                    <div>
                        <strong>
                            Billing address:
                        </strong>
                    </div>

                    <div
                        style={{
                            whiteSpace: "pre-line",
                        }}
                    >
                        {billingAddress}
                    </div>

                    <div>
                        Ph:{" "}
                        {customer?.phone ||
                            "9999999999"}
                    </div>

                </div>


                {/* =================================================
                    ITEM TABLE
                ================================================= */}

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

                            <Th width="4%">#</Th>
                            <Th width="38%">
                                Item
                            </Th>
                            <Th width="11%">
                                HSN/SAC
                            </Th>
                            <Th width="6%">
                                Tax
                            </Th>
                            <Th width="10%">
                                Qty
                            </Th>
                            <Th width="14%">
                                Rate / Item
                            </Th>
                            <Th width="7%">
                                Per
                            </Th>
                            <Th width="14%">
                                Amount
                            </Th>

                        </tr>

                    </thead>

                    <tbody>

                        {items.length > 0 ? (
                            items.map(
                                (item, index) => {

                                    const qty =
                                        Number(
                                            item?.quantity ||
                                            item?.qty ||
                                            0
                                        );

                                    const rate =
                                        Number(
                                            item?.rate ||
                                            item?.unitPrice ||
                                            item?.sellingPrice ||
                                            0
                                        );

                                    const amount =
                                        Number(
                                            item?.amount ||
                                            qty * rate
                                        );

                                    const taxRate =
                                        item?.taxRate ||
                                        item?.taxPercentage ||
                                        "18%";

                                    return (
                                        <tr
                                            key={
                                                item?.id ||
                                                index
                                            }
                                        >

                                            <Td center>
                                                {index + 1}
                                            </Td>

                                            <Td>
                                                <strong>
                                                    {item?.productName ||
                                                        item?.itemName ||
                                                        "Item"}
                                                </strong>

                                                {item?.description && (
                                                    <div
                                                        style={{
                                                            marginTop:
                                                                "3px",
                                                        }}
                                                    >
                                                        {item.description}
                                                    </div>
                                                )}
                                            </Td>

                                            <Td center>
                                                {item?.hsnCode ||
                                                    item?.hsnSac ||
                                                    ""}
                                            </Td>

                                            <Td center>
                                                {taxRate}
                                            </Td>

                                            <Td center>
                                                {qty}{" "}
                                                {item?.unitName ||
                                                    item?.uom ||
                                                    ""}
                                            </Td>

                                            <Td right>
                                                {money(rate)}
                                            </Td>

                                            <Td center>
                                                {item?.unitName ||
                                                    item?.uom ||
                                                    "NOS"}
                                            </Td>

                                            <Td right>
                                                {money(amount)}
                                            </Td>

                                        </tr>
                                    );
                                }
                            )
                        ) : (
                            <tr>
                                <td
                                    colSpan="8"
                                    style={{
                                        height: "240px",
                                        textAlign:
                                            "center",
                                        verticalAlign:
                                            "top",
                                        paddingTop:
                                            "30px",
                                    }}
                                >
                                    No items
                                </td>
                            </tr>
                        )}

                    </tbody>


                    {/* =================================================
                        TAXABLE + TAX
                    ================================================= */}

                    <tbody>

                        <tr>

                            <td
                                colSpan="5"
                                style={{
                                    border:
                                        "1px solid #222",
                                    height: "115px",
                                }}
                            />

                            <td
                                colSpan="2"
                                style={{
                                    border:
                                        "1px solid #222",
                                    textAlign: "right",
                                    verticalAlign:
                                        "top",
                                    padding: "8px",
                                }}
                            >

                                <div
                                    style={{
                                        fontWeight: "700",
                                        fontStyle: "italic",
                                        marginBottom:
                                            "18px",
                                    }}
                                >
                                    Taxable Amount
                                </div>

                                {cgst > 0 && (
                                    <div
                                        style={{
                                            fontWeight:
                                                "700",
                                            fontStyle:
                                                "italic",
                                        }}
                                    >
                                        CGST 9.0%
                                    </div>
                                )}

                                {sgst > 0 && (
                                    <div
                                        style={{
                                            fontWeight:
                                                "700",
                                            fontStyle:
                                                "italic",
                                        }}
                                    >
                                        SGST 9.0%
                                    </div>
                                )}

                                {igst > 0 && (
                                    <div
                                        style={{
                                            fontWeight:
                                                "700",
                                            fontStyle:
                                                "italic",
                                        }}
                                    >
                                        IGST 18.0%
                                    </div>
                                )}

                            </td>

                            <td
                                style={{
                                    border:
                                        "1px solid #222",
                                    textAlign: "right",
                                    verticalAlign:
                                        "top",
                                    padding: "8px",
                                }}
                            >

                                <div
                                    style={{
                                        marginBottom:
                                            "18px",
                                    }}
                                >
                                    ₹{money(totalTaxable)}
                                </div>

                                {cgst > 0 && (
                                    <div>
                                        ₹{money(cgst)}
                                    </div>
                                )}

                                {sgst > 0 && (
                                    <div>
                                        ₹{money(sgst)}
                                    </div>
                                )}

                                {igst > 0 && (
                                    <div>
                                        ₹{money(igst)}
                                    </div>
                                )}

                            </td>

                        </tr>


                        {/* TOTAL */}

                        <tr>

                            <td
                                colSpan="4"
                                style={{
                                    border:
                                        "1px solid #222",
                                }}
                            />

                            <td
                                style={{
                                    border:
                                        "1px solid #222",
                                    textAlign: "center",
                                    fontWeight: "700",
                                }}
                            >
                                Total
                            </td>

                            <td
                                colSpan="2"
                                style={{
                                    border:
                                        "1px solid #222",
                                    textAlign: "right",
                                    fontWeight: "700",
                                }}
                            >
                                {totalQty.toFixed(3)}
                            </td>

                            <td
                                style={{
                                    border:
                                        "1px solid #222",
                                    textAlign: "right",
                                    fontWeight: "700",
                                    fontSize: "14px",
                                    padding: "7px",
                                }}
                            >
                                ₹{money(grandTotal)}
                            </td>

                        </tr>

                    </tbody>

                </table>


                {/* =================================================
                    AMOUNT IN WORDS
                ================================================= */}

                <div
                    style={{
                        borderTop:
                            "1px solid #222",
                        borderBottom:
                            "1px solid #222",
                        padding: "5px 8px",
                        fontWeight: "500",
                    }}
                >

                    Amount Chargeable (in words):{" "}

                    <strong>
                        INR {amountWords} Rupees Only.
                    </strong>

                    <span
                        style={{
                            float: "right",
                            fontWeight: "700",
                        }}
                    >
                        E & O.E
                    </span>

                </div>


                {/* =================================================
                    HSN TAX SUMMARY
                ================================================= */}

                <table
                    style={{
                        width: "100%",
                        borderCollapse:
                            "collapse",
                    }}
                >

                    <thead>

                        <tr>

                            <Th rowSpan="2">
                                HSN/SAC
                            </Th>

                            <Th rowSpan="2">
                                Taxable Value
                            </Th>

                            <Th colSpan="2">
                                Central Tax
                            </Th>

                            <Th colSpan="2">
                                State Tax
                            </Th>

                            <Th rowSpan="2">
                                Total Tax Amount
                            </Th>

                        </tr>

                        <tr>

                            <Th>
                                Rate
                            </Th>

                            <Th>
                                Amount
                            </Th>

                            <Th>
                                Rate
                            </Th>

                            <Th>
                                Amount
                            </Th>

                        </tr>

                    </thead>

                    <tbody>

                        {items.map(
                            (item, index) => {

                                const amount =
                                    Number(
                                        item?.amount ||
                                        item?.quantity *
                                        item?.unitPrice ||
                                        0
                                    );

                                const tax =
                                    amount * 0.18;

                                const halfTax =
                                    tax / 2;

                                return (
                                    <tr
                                        key={`tax-${index}`}
                                    >

                                        <Td>
                                            {item?.hsnCode ||
                                                item?.hsnSac ||
                                                ""}
                                        </Td>

                                        <Td right>
                                            {money(amount)}
                                        </Td>

                                        <Td center>
                                            9%
                                        </Td>

                                        <Td right>
                                            {money(halfTax)}
                                        </Td>

                                        <Td center>
                                            9%
                                        </Td>

                                        <Td right>
                                            {money(halfTax)}
                                        </Td>

                                        <Td right>
                                            {money(tax)}
                                        </Td>

                                    </tr>
                                );
                            }
                        )}

                        <tr>

                            <Td
                                style={{
                                    fontWeight: "700",
                                    textAlign: "right",
                                }}
                            >
                                TOTAL
                            </Td>

                            <Td
                                style={{
                                    fontWeight: "700",
                                    textAlign: "right",
                                }}
                            >
                                {money(totalTaxable)}
                            </Td>

                            <Td />

                            <Td
                                style={{
                                    fontWeight: "700",
                                    textAlign: "right",
                                }}
                            >
                                {money(cgst)}
                            </Td>

                            <Td />

                            <Td
                                style={{
                                    fontWeight: "700",
                                    textAlign: "right",
                                }}
                            >
                                {money(sgst)}
                            </Td>

                            <Td
                                style={{
                                    fontWeight: "700",
                                    textAlign: "right",
                                }}
                            >
                                {money(totalTax)}
                            </Td>

                        </tr>

                    </tbody>

                </table>


                {/* =================================================
                    PAYMENT STATUS
                ================================================= */}

                <div
                    style={{
                        borderTop:
                            "1px solid #222",
                        padding: "6px 8px",
                        textAlign: "right",
                        fontWeight: "700",
                    }}
                >

                    <span
                        style={{
                            color: "#16a34a",
                            marginRight: "5px",
                        }}
                    >
                        ●
                    </span>

                    Amount Paid

                    <div
                        style={{
                            marginTop: "5px",
                        }}
                    >
                        ₹{money(grandTotal)} Paid via UPI
                    </div>

                </div>


                {/* =================================================
                    BANK + UPI + SIGNATURE
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "50% 25% 25%",
                        borderTop:
                            "1px solid #222",
                    }}
                >

                    {/* BANK */}

                    <div
                        style={{
                            minHeight: "150px",
                            padding: "8px",
                            borderRight:
                                "1px solid #222",
                        }}
                    >

                        <strong>
                            Bank Details:
                        </strong>

                        <div style={{ marginTop: "6px" }}>
                            Bank:{" "}
                            <strong>
                                {invoice?.bankName ||
                                    "YES BANK"}
                            </strong>
                        </div>

                        <div>
                            Account #:{" "}
                            <strong>
                                {invoice?.accountNumber ||
                                    "66789999222445"}
                            </strong>
                        </div>

                        <div>
                            IFSC:{" "}
                            <strong>
                                {invoice?.ifsc ||
                                    "YESBBIN4567"}
                            </strong>
                        </div>

                        <div>
                            Branch:{" "}
                            <strong>
                                {invoice?.bankBranch ||
                                    "Kodihalli"}
                            </strong>
                        </div>

                    </div>


                    {/* UPI */}

                    <div
                        style={{
                            minHeight: "150px",
                            padding: "8px",
                            borderRight:
                                "1px solid #222",
                            textAlign: "center",
                        }}
                    >

                        <strong>
                            Pay using UPI:
                        </strong>

                        {invoice?.upiQr && (
                            <img
                                src={invoice.upiQr}
                                alt="UPI QR"
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    objectFit:
                                        "contain",
                                    display: "block",
                                    margin:
                                        "10px auto",
                                }}
                            />
                        )}

                    </div>


                    {/* SIGNATURE */}

                    <div
                        style={{
                            minHeight: "150px",
                            padding: "8px",
                            textAlign: "center",
                            position: "relative",
                        }}
                    >

                        <div
                            style={{
                                textAlign: "right",
                                marginBottom: "20px",
                            }}
                        >
                            For {companyName}
                        </div>

                        {invoice?.signature && (
                            <img
                                src={invoice.signature}
                                alt="Signature"
                                style={{
                                    width: "100px",
                                    height: "70px",
                                    objectFit:
                                        "contain",
                                    marginTop:
                                        "15px",
                                }}
                            />
                        )}

                        <div
                            style={{
                                marginTop: "20px",
                            }}
                        >
                            Authorized Signatory
                        </div>

                    </div>

                </div>


                {/* =================================================
                    NOTES + TERMS
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "50% 50%",
                        borderTop:
                            "1px solid #222",
                    }}
                >

                    <div
                        style={{
                            minHeight: "125px",
                            padding: "8px",
                            borderRight:
                                "1px solid #222",
                        }}
                    >

                        <strong>
                            Notes:
                        </strong>

                        <div
                            style={{
                                marginTop: "6px",
                            }}
                        >
                            {invoice?.notes ||
                                "Thank you for the Business"}
                        </div>

                    </div>


                    <div
                        style={{
                            minHeight: "125px",
                            padding: "8px",
                        }}
                    >

                        <strong>
                            Terms and Conditions:
                        </strong>

                        <ol
                            style={{
                                marginTop: "5px",
                                paddingLeft: "18px",
                            }}
                        >
                            <li>
                                Goods once sold cannot be
                                taken back or exchanged.
                            </li>

                            <li>
                                We are not the manufacturers,
                                company will stand for warranty
                                as per their terms and conditions.
                            </li>

                            <li>
                                Interest @24% p.a. will be
                                charged for uncleared bills
                                beyond 15 days.
                            </li>

                            <li>
                                Subject to local Jurisdiction.
                            </li>
                        </ol>

                    </div>

                </div>

            </div>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <div
                style={{
                    marginTop: "45px",
                    display: "flex",
                    gap: "20px",
                    fontSize: "11px",
                    fontWeight: "600",
                }}
            >
                <span>
                    Page 1 / 1
                </span>

                <span>
                    This is a digitally signed document.
                </span>
            </div>

        </div>
    );
}


/* ============================================================
   SMALL COMPONENTS
============================================================ */

function MetaCell({
    label,
    value,
}) {
    return (
        <div
            style={{
                minHeight: "45px",
                padding: "7px",
                borderBottom:
                    "1px solid #222",
                borderLeft:
                    "1px solid #222",
            }}
        >
            <strong>
                {label}
            </strong>

            <div
                style={{
                    marginTop: "3px",
                    fontWeight: "600",
                }}
            >
                {value || "-"}
            </div>
        </div>
    );
}


function Th({
    children,
    width,
    colSpan,
    rowSpan,
}) {
    return (
        <th
            colSpan={colSpan}
            rowSpan={rowSpan}
            style={{
                width,
                border:
                    "1px solid #222",
                padding: "4px 3px",
                textAlign: "center",
                fontWeight: "700",
                fontSize: "11px",
                background: "#fff",
            }}
        >
            {children}
        </th>
    );
}


function Td({
    children,
    width,
    center,
    right,
    colSpan,
    rowSpan,
    style = {},
}) {
    return (
        <td
            colSpan={colSpan}
            rowSpan={rowSpan}
            style={{
                width,
                border:
                    "1px solid #222",
                padding: "4px 4px",
                verticalAlign: "top",

                textAlign: center
                    ? "center"
                    : right
                        ? "right"
                        : "left",

                fontSize: "11px",

                ...style,
            }}
        >
            {children}
        </td>
    );
}