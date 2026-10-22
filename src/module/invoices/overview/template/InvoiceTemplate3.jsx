
import React from "react";

/* ============================================================
   NUMBER TO WORDS — INDIAN NUMBERING SYSTEM
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

const numberToWords = (value) => {
    const num = Math.floor(Number(value) || 0);

    if (num < 0) return `Minus ${numberToWords(Math.abs(num))} `;
    if (num === 0) return "Zero";

    if (num < 20) return ONES[num];

    if (num < 100) {
        return `${TENS[Math.floor(num / 10)]}${num % 10 ? `-${ONES[num % 10]}` : ""
            } `;
    }

    if (num < 1000) {
        return `${ONES[Math.floor(num / 100)]} Hundred${num % 100 ? ` ${numberToWords(num % 100)}` : ""
            } `;
    }

    if (num < 100000) {
        return `${numberToWords(Math.floor(num / 1000))} Thousand${num % 1000 ? ` ${numberToWords(num % 1000)}` : ""
            } `;
    }

    if (num < 10000000) {
        return `${numberToWords(Math.floor(num / 100000))} Lakh${num % 100000 ? ` ${numberToWords(num % 100000)}` : ""
            } `;
    }

    return `${numberToWords(Math.floor(num / 10000000))} Crore${num % 10000000 ? ` ${numberToWords(num % 10000000)}` : ""
        } `;
};

/* ============================================================
   GENERAL HELPERS
============================================================ */

const firstDefined = (...values) =>
    values.find(
        (value) =>
            value !== undefined &&
            value !== null &&
            value !== ""
    );

const asNumber = (value) => {
    if (value === null || value === undefined || value === "") {
        return 0;
    }

    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const getItems = (invoice) => {
    const items = firstDefined(
        invoice?.items,
        invoice?.invoiceItems,
        invoice?.lineItems
    );

    return Array.isArray(items) ? items : [];
};

const getCustomer = (invoice) =>
    invoice?.customer ||
    invoice?.selectedCustomer ||
    invoice?.customerDetails ||
    {};

const getCompany = (invoice) =>
    invoice?.pdfCompanyInfo ||
    invoice?.company ||
    invoice?.companyDetails ||
    invoice?.companyInfo ||
    {};

const getBank = (invoice, company) =>
    invoice?.bankAccount ||
    invoice?.bankDetails ||
    company?.bankAccount ||
    company?.bankDetails ||
    {};

const getCurrency = (invoice) =>
    invoice?.currency ||
    invoice?.currencyDetails ||
    {};

const formatMoney = (value, currencyCode) => {
    const amount = asNumber(value);

    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currencyCode || "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currencyCode || "INR"} ${amount.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )
            } `;
    }
};

const formatDate = (value) => {
    if (!value) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        const [year, month, day] = String(value).split("-");
        return `${day} -${month} -${year} `;
    }

    return String(value);
};

const getAddress = (entity) => {
    if (typeof entity === "string") return entity;

    return [
        entity?.addressLine1,
        entity?.addressLine2,
        entity?.address,
        entity?.street,
        entity?.city,
        entity?.state,
        entity?.postalCode || entity?.pinCode || entity?.zipCode,
        entity?.country,
    ]
        .filter(Boolean)
        .filter((value, index, array) => array.indexOf(value) === index)
        .join(", ");
};

const getItemQuantity = (item) =>
    asNumber(firstDefined(item?.quantity, item?.qty));

const getItemRate = (item) =>
    asNumber(
        firstDefined(
            item?.unitPrice,
            item?.rate,
            item?.sellingPrice,
            item?.price
        )
    );

const getItemDiscount = (item) =>
    asNumber(
        firstDefined(
            item?.discountAmount,
            item?.discount,
            item?.discountValue
        )
    );

const getItemTaxable = (item) => {
    const explicitTaxable = firstDefined(
        item?.taxableAmount,
        item?.taxableValue,
        item?.netAmount
    );

    if (explicitTaxable !== undefined) {
        return asNumber(explicitTaxable);
    }

    return Math.max(
        0,
        getItemQuantity(item) * getItemRate(item) -
        getItemDiscount(item)
    );
};

const getTaxRate = (item) =>
    asNumber(
        firstDefined(
            item?.taxRate,
            item?.taxPercentage,
            item?.taxPercent,
            item?.taxMaster?.taxRate,
            item?.taxMaster?.taxPercentage,
            item?.taxMaster?.rate,
            item?.taxMaster?.percentage
        )
    );

const getTaxBreakdown = (item) => {
    const taxable = getItemTaxable(item);

    const explicitCgst = firstDefined(
        item?.cgstAmount,
        item?.cgst,
        item?.centralTaxAmount
    );

    const explicitSgst = firstDefined(
        item?.sgstAmount,
        item?.sgst,
        item?.stateTaxAmount
    );

    const explicitIgst = firstDefined(
        item?.igstAmount,
        item?.igst,
        item?.integratedTaxAmount
    );

    const hasExplicitSplit =
        explicitCgst !== undefined ||
        explicitSgst !== undefined ||
        explicitIgst !== undefined;

    if (hasExplicitSplit) {
        const cgst = asNumber(explicitCgst);
        const sgst = asNumber(explicitSgst);
        const igst = asNumber(explicitIgst);

        return {
            cgst,
            sgst,
            igst,
            total: cgst + sgst + igst,
            cgstRate: taxable ? (cgst / taxable) * 100 : 0,
            sgstRate: taxable ? (sgst / taxable) * 100 : 0,
            igstRate: taxable ? (igst / taxable) * 100 : 0,
        };
    }

    const taxRate = getTaxRate(item);
    const taxAmount = asNumber(
        firstDefined(item?.taxAmount, item?.totalTaxAmount)
    );

    const tax = taxAmount || (taxable * taxRate) / 100;

    const isIgst =
        Boolean(item?.igstRate || item?.isIgst) ||
        String(item?.taxType || "").toUpperCase() === "IGST";

    if (isIgst) {
        return {
            cgst: 0,
            sgst: 0,
            igst: tax,
            total: tax,
            cgstRate: 0,
            sgstRate: 0,
            igstRate: taxRate,
        };
    }

    return {
        cgst: tax / 2,
        sgst: tax / 2,
        igst: 0,
        total: tax,
        cgstRate: taxRate / 2,
        sgstRate: taxRate / 2,
        igstRate: 0,
    };
};

const getItemAmount = (item) =>
    asNumber(
        firstDefined(
            item?.amount,
            item?.lineTotal,
            item?.totalAmount,
            item?.total
        )
    ) ||
    getItemTaxable(item) +
    getTaxBreakdown(item).total;

const getTerms = (invoice) => {
    const terms = firstDefined(
        invoice?.termsAndConditions,
        invoice?.terms,
        invoice?.paymentTerms
    );

    if (Array.isArray(terms)) return terms.filter(Boolean);

    if (typeof terms === "string" && terms.trim()) {
        return terms
            .split(/\r?\n/)
            .map((term) => term.trim())
            .filter(Boolean);
    }

    return [];
};

const getItemName = (item) =>
    firstDefined(
        item?.productName,
        item?.itemName,
        item?.product?.productName,
        item?.product?.name,
        item?.description,
        ""
    );

const getUnitName = (item) =>
    firstDefined(
        item?.unitName,
        item?.unit?.unitName,
        item?.unit?.name,
        item?.uom,
        item?.unitOfMeasure,
        ""
    );

const getCurrencyCode = (invoice, currency) =>
    firstDefined(
        currency?.currencyCode,
        currency?.code,
        invoice?.currencyCode,
        "INR"
    );

const formatRate = (rate) =>
    `${Number(rate || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })
    }% `;

/* ============================================================
   INVOICE TEMPLATE 3
============================================================ */

export default function InvoiceTemplate2({
    invoice = {},
    preview = false,
}) {
    const items = getItems(invoice);
    const customer = getCustomer(invoice);
    const company = getCompany(invoice);
    const bank = getBank(invoice, company);
    const currency = getCurrency(invoice);
    const currencyCode = getCurrencyCode(invoice, currency);

    const companyName = firstDefined(
        company?.companyName,
        company?.name,
        invoice?.companyName,
        ""
    );

    const companyGstin = firstDefined(
        company?.gstin,
        company?.gstNumber,
        company?.taxRegistrationNumber,
        invoice?.companyGstin,
        ""
    );

    const companyAddress = getAddress(company);

    const companyPhone = firstDefined(
        company?.phone,
        company?.mobile,
        company?.phoneNumber,
        ""
    );

    const companyEmail = firstDefined(
        company?.email,
        company?.emailAddress,
        ""
    );

    const companyLogo = firstDefined(
        company?.logo,
        company?.logoUrl,
        company?.companyLogo,
        ""
    );

    const invoiceNumber = firstDefined(
        invoice?.invoiceNumber,
        invoice?.number,
        invoice?.invoiceNo,
        ""
    );

    const invoiceDate = formatDate(
        firstDefined(invoice?.invoiceDate, invoice?.date, "")
    );

    const dueDate = formatDate(
        firstDefined(invoice?.dueDate, "")
    );

    const customerName = firstDefined(
        customer?.customerName,
        customer?.name,
        customer?.partyName,
        invoice?.customerName,
        ""
    );

    const customerGstin = firstDefined(
        customer?.gstin,
        customer?.gstNumber,
        customer?.taxRegistrationNumber,
        invoice?.customerGstin,
        ""
    );

    const billingAddress = firstDefined(
        getAddress(customer?.billingAddress),
        getAddress(customer?.address),
        getAddress(customer),
        invoice?.billingAddress,
        ""
    );

    const shippingAddress = firstDefined(
        getAddress(invoice?.shippingAddress),
        getAddress(customer?.shippingAddress),
        billingAddress,
        ""
    );

    const customerPhone = firstDefined(
        customer?.phone,
        customer?.mobile,
        customer?.phoneNumber,
        invoice?.customerPhone,
        ""
    );

    const placeOfSupply = firstDefined(
        invoice?.placeOfSupply,
        invoice?.placeOfSupplyName,
        customer?.state,
        ""
    );

    const calculatedTaxable = items.reduce(
        (sum, item) => sum + getItemTaxable(item),
        0
    );

    const taxableAmount = asNumber(
        firstDefined(
            invoice?.taxableAmount,
            invoice?.subtotal,
            invoice?.subTotal,
            invoice?.totalTaxableAmount,
            calculatedTaxable
        )
    );

    const itemTaxTotals = items.reduce(
        (totals, item) => {
            const tax = getTaxBreakdown(item);

            totals.cgst += tax.cgst;
            totals.sgst += tax.sgst;
            totals.igst += tax.igst;

            return totals;
        },
        { cgst: 0, sgst: 0, igst: 0 }
    );

    const cgst = asNumber(
        firstDefined(invoice?.cgstAmount, invoice?.totalCgst, itemTaxTotals.cgst)
    );

    const sgst = asNumber(
        firstDefined(invoice?.sgstAmount, invoice?.totalSgst, itemTaxTotals.sgst)
    );

    const igst = asNumber(
        firstDefined(invoice?.igstAmount, invoice?.totalIgst, itemTaxTotals.igst)
    );

    const totalTax = asNumber(
        firstDefined(invoice?.totalTax, invoice?.taxAmount, cgst + sgst + igst)
    );

    const calculatedGrandTotal = taxableAmount + totalTax;

    const grandTotal = asNumber(
        firstDefined(
            invoice?.grandTotal,
            invoice?.totalAmount,
            invoice?.total,
            calculatedGrandTotal
        )
    );

    const totalQty = items.reduce(
        (sum, item) => sum + getItemQuantity(item),
        0
    );

    const amountWords = numberToWords(Math.round(grandTotal));

    const bankName = firstDefined(
        bank?.bankName,
        bank?.name,
        invoice?.bankName,
        company?.bankName,
        ""
    );

    const accountNumber = firstDefined(
        bank?.accountNumber,
        bank?.accountNo,
        invoice?.accountNumber,
        company?.accountNumber,
        ""
    );

    const ifsc = firstDefined(
        bank?.ifsc,
        bank?.ifscCode,
        invoice?.ifsc,
        company?.ifsc,
        ""
    );

    const bankBranch = firstDefined(
        bank?.branchName,
        bank?.bankBranch,
        bank?.branch,
        invoice?.bankBranch,
        ""
    );

    const upiQr = firstDefined(
        invoice?.upiQr,
        invoice?.upiQrUrl,
        company?.upiQr,
        company?.upiQrUrl,
        ""
    );

    const signature = firstDefined(
        invoice?.signature,
        invoice?.signatureUrl,
        company?.signature,
        company?.signatureUrl,
        ""
    );

    const signatureName = firstDefined(
        invoice?.signatureName,
        company?.signatureName,
        ""
    );

    const notes = firstDefined(invoice?.notes, invoice?.note, "");

    const terms = getTerms(invoice);

    const paymentStatus = firstDefined(
        invoice?.paymentStatus,
        invoice?.status,
        ""
    );

    const amountPaid = asNumber(
        firstDefined(invoice?.amountPaid, invoice?.paidAmount, 0)
    );

    const paymentMethod = firstDefined(
        invoice?.paymentMethod,
        invoice?.paymentMode,
        ""
    );

    const hsnSummary = Object.values(
        items.reduce((summary, item) => {
            const hsn = firstDefined(
                item?.hsnCode,
                item?.hsnSac,
                item?.hsnSacCode,
                ""
            );

            const key = `${hsn}| ${getTaxRate(item)}| ${item?.taxType || ""} `;

            if (!summary[key]) {
                summary[key] = {
                    hsn,
                    taxable: 0,
                    cgst: 0,
                    sgst: 0,
                    igst: 0,
                };
            }

            const taxable = getItemTaxable(item);
            const tax = getTaxBreakdown(item);

            summary[key].taxable += taxable;
            summary[key].cgst += tax.cgst;
            summary[key].sgst += tax.sgst;
            summary[key].igst += tax.igst;

            return summary;
        }, {})
    );

    return (
        <div
            id="invoice-pdf-template-3"
            style={{
                position: preview ? "relative" : "fixed",
                left: preview ? "auto" : "-10000px",
                top: 0,
                width: "794px",
                minHeight: "1123px",
                boxSizing: "border-box",
                padding: "20px 30px 15px",
                background: "#ffffff",
                color: "#111827",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "12px",
                lineHeight: 1.25,
                margin: preview ? "0 auto" : undefined,
                overflow: preview ? "visible" : "hidden",
            }}
        >
            <div style={{ border: "1px solid #222" }}>
                {/* HEADER */}
                <div
                    style={{
                        height: "30px",
                        borderBottom: "1px solid #222",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        fontWeight: 700,
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

                {/* COMPANY + INVOICE META */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "52% 48%",
                    }}
                >
                    <div
                        style={{
                            borderRight: "1px solid #222",
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
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                            }}
                        >
                            {companyLogo ? (
                                <img
                                    src={companyLogo}
                                    alt="Company logo"
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
                                        fontWeight: 700,
                                        color: "#172554",
                                        textAlign: "center",
                                    }}
                                >
                                    {companyName
                                        ? companyName.substring(0, 2).toUpperCase()
                                        : ""}
                                </div>
                            )}
                        </div>

                        <div style={{ overflowWrap: "anywhere" }}>
                            <div
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 700,
                                }}
                            >
                                {companyName}
                            </div>

                            {companyGstin && <div>GSTIN: {companyGstin}</div>}
                            {companyAddress && <div>{companyAddress}</div>}
                            {companyPhone && <div>Mobile: {companyPhone}</div>}
                            {companyEmail && <div>Email: {companyEmail}</div>}
                        </div>
                    </div>

                    <div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                            }}
                        >
                            <MetaCell label="Invoice #:" value={invoiceNumber} />
                            <MetaCell label="Invoice Date:" value={invoiceDate} />
                            <MetaCell label="Place of Supply:" value={placeOfSupply} />
                            <MetaCell label="Due Date:" value={dueDate} />
                        </div>

                        <div
                            style={{
                                padding: "8px",
                                minHeight: "60px",
                                borderTop: "1px solid #222",
                            }}
                        >
                            <strong>Shipping address:</strong>
                            <div
                                style={{
                                    whiteSpace: "pre-line",
                                    overflowWrap: "anywhere",
                                    marginTop: "3px",
                                }}
                            >
                                {shippingAddress}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CUSTOMER */}
                <div
                    style={{
                        width: "52%",
                        boxSizing: "border-box",
                        borderTop: "1px solid #222",
                        borderRight: "1px solid #222",
                        padding: "8px",
                        minHeight: "125px",
                    }}
                >
                    <strong>Customer Details:</strong>

                    <div style={{ fontWeight: 700 }}>
                        {customerName}
                    </div>

                    {customerGstin && <div>GSTIN: {customerGstin}</div>}

                    <div><strong>Billing address:</strong></div>

                    <div style={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
                        {billingAddress}
                    </div>

                    {customerPhone && <div>Ph: {customerPhone}</div>}
                </div>

                {/* ITEM TABLE */}
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                    }}
                >
                    <thead>
                        <tr>
                            <Th width="4%">#</Th>
                            <Th width="28%">Item</Th>
                            <Th width="11%">HSN/SAC</Th>
                            <Th width="8%">Tax</Th>
                            <Th width="10%">Qty</Th>
                            <Th width="14%">Rate / Item</Th>
                            <Th width="7%">Per</Th>
                            <Th width="18%">Amount</Th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.length > 0 ? (
                            items.map((item, index) => {
                                const qty = getItemQuantity(item);
                                const rate = getItemRate(item);
                                const taxable = getItemTaxable(item);
                                const tax = getTaxBreakdown(item);
                                const taxRate = getTaxRate(item);
                                const amount = getItemAmount(item);

                                return (
                                    <tr key={item?.id || item?.invoiceItemId || index}>
                                        <Td center>{index + 1}</Td>

                                        <Td>
                                            <strong>{getItemName(item)}</strong>
                                            {item?.description && (
                                                <div style={{ marginTop: "3px" }}>
                                                    {item.description}
                                                </div>
                                            )}
                                        </Td>

                                        <Td center>
                                            {firstDefined(item?.hsnCode, item?.hsnSac, item?.hsnSacCode, "")}
                                        </Td>

                                        <Td center>
                                            {formatRate(taxRate)}
                                        </Td>

                                        <Td center>
                                            {qty} {getUnitName(item)}
                                        </Td>

                                        <Td right>{formatMoney(rate, currencyCode)}</Td>

                                        <Td center>{getUnitName(item)}</Td>

                                        <Td right>{formatMoney(amount || taxable + tax.total, currencyCode)}</Td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={8}
                                    style={{
                                        height: "120px",
                                        textAlign: "center",
                                        verticalAlign: "top",
                                        paddingTop: "30px",
                                        border: "1px solid #222",
                                    }}
                                >
                                    No items
                                </td>
                            </tr>
                        )}
                    </tbody>

                    {/* TAXABLE + TAX */}
                    <tbody>
                        <tr>
                            <td
                                colSpan={5}
                                style={{ border: "1px solid #222", height: "90px" }}
                            />

                            <td
                                colSpan={2}
                                style={{
                                    border: "1px solid #222",
                                    textAlign: "right",
                                    verticalAlign: "top",
                                    padding: "8px",
                                }}
                            >
                                <div style={{ fontWeight: 700, fontStyle: "italic", marginBottom: "12px" }}>
                                    Taxable Amount
                                </div>

                                {cgst > 0 && <div>CGST</div>}
                                {sgst > 0 && <div>SGST</div>}
                                {igst > 0 && <div>IGST</div>}
                            </td>

                            <td
                                style={{
                                    border: "1px solid #222",
                                    textAlign: "right",
                                    verticalAlign: "top",
                                    padding: "8px",
                                }}
                            >
                                <div style={{ marginBottom: "12px" }}>
                                    {formatMoney(taxableAmount, currencyCode)}
                                </div>

                                {cgst > 0 && <div>{formatMoney(cgst, currencyCode)}</div>}
                                {sgst > 0 && <div>{formatMoney(sgst, currencyCode)}</div>}
                                {igst > 0 && <div>{formatMoney(igst, currencyCode)}</div>}
                            </td>
                        </tr>

                        <tr>
                            <td colSpan={4} style={{ border: "1px solid #222" }} />

                            <td
                                style={{
                                    border: "1px solid #222",
                                    textAlign: "center",
                                    fontWeight: 700,
                                }}
                            >
                                Total
                            </td>

                            <td
                                colSpan={2}
                                style={{
                                    border: "1px solid #222",
                                    textAlign: "right",
                                    fontWeight: 700,
                                }}
                            >
                                {totalQty.toFixed(3)}
                            </td>

                            <td
                                style={{
                                    border: "1px solid #222",
                                    textAlign: "right",
                                    fontWeight: 700,
                                    fontSize: "13px",
                                    padding: "7px",
                                }}
                            >
                                {formatMoney(grandTotal, currencyCode)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* AMOUNT IN WORDS */}
                <div
                    style={{
                        borderTop: "1px solid #222",
                        borderBottom: "1px solid #222",
                        padding: "5px 8px",
                        fontWeight: 500,
                    }}
                >
                    Amount Chargeable (in words):{" "}
                    <strong>
                        {currency?.currencyName || currencyCode} {amountWords} Only.
                    </strong>

                    <span style={{ float: "right", fontWeight: 700 }}>
                        E &amp; O.E
                    </span>
                </div>

                {/* HSN TAX SUMMARY */}
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                    }}
                >
                    <thead>
                        <tr>
                            <Th rowSpan={2}>HSN/SAC</Th>
                            <Th rowSpan={2}>Taxable Value</Th>
                            <Th colSpan={2}>Central Tax</Th>
                            <Th colSpan={2}>State Tax</Th>
                            <Th rowSpan={2}>Total Tax Amount</Th>
                        </tr>

                        <tr>
                            <Th>Rate</Th>
                            <Th>Amount</Th>
                            <Th>Rate</Th>
                            <Th>Amount</Th>
                        </tr>
                    </thead>

                    <tbody>
                        {hsnSummary.map((entry, index) => {
                            const cgstRate = entry.taxable
                                ? (entry.cgst / entry.taxable) * 100
                                : 0;
                            const sgstRate = entry.taxable
                                ? (entry.sgst / entry.taxable) * 100
                                : 0;
                            const taxTotal = entry.cgst + entry.sgst + entry.igst;

                            return (
                                <tr key={`${entry.hsn} -${index} `}>
                                    <Td>{entry.hsn}</Td>
                                    <Td right>{formatMoney(entry.taxable, currencyCode)}</Td>
                                    <Td center>{formatRate(cgstRate)}</Td>
                                    <Td right>{formatMoney(entry.cgst, currencyCode)}</Td>
                                    <Td center>{formatRate(sgstRate)}</Td>
                                    <Td right>{formatMoney(entry.sgst, currencyCode)}</Td>
                                    <Td right>{formatMoney(taxTotal, currencyCode)}</Td>
                                </tr>
                            );
                        })}

                        <tr>
                            <Td style={{ fontWeight: 700, textAlign: "right" }}>TOTAL</Td>
                            <Td style={{ fontWeight: 700, textAlign: "right" }}>
                                {formatMoney(hsnSummary.reduce((sum, row) => sum + row.taxable, 0), currencyCode)}
                            </Td>
                            <Td />
                            <Td style={{ fontWeight: 700, textAlign: "right" }}>
                                {formatMoney(cgst, currencyCode)}
                            </Td>
                            <Td />
                            <Td style={{ fontWeight: 700, textAlign: "right" }}>
                                {formatMoney(sgst, currencyCode)}
                            </Td>
                            <Td style={{ fontWeight: 700, textAlign: "right" }}>
                                {formatMoney(totalTax, currencyCode)}
                            </Td>
                        </tr>
                    </tbody>
                </table>

                {/* PAYMENT DETAILS */}
                <div
                    style={{
                        borderTop: "1px solid #222",
                        padding: "6px 8px",
                        textAlign: "right",
                    }}
                >
                    <strong>Payment Details</strong>

                    <div style={{ marginTop: "5px" }}>
                        {paymentStatus && <>Status: {paymentStatus}</>}
                        {paymentStatus && (paymentMethod || amountPaid > 0) && " | "}
                        {paymentMethod && <>Method: {paymentMethod}</>}
                        {(paymentStatus || paymentMethod || amountPaid > 0) && amountPaid > 0 && " | "}
                        {amountPaid > 0 && <>Amount Paid: {formatMoney(amountPaid, currencyCode)}</>}
                        {!paymentStatus && !paymentMethod && amountPaid === 0 && "No payment recorded"}
                    </div>
                </div>

                {/* BANK + UPI + SIGNATURE */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "50% 25% 25%",
                        borderTop: "1px solid #222",
                    }}
                >
                    <div
                        style={{
                            minHeight: "150px",
                            padding: "8px",
                            borderRight: "1px solid #222",
                            overflowWrap: "anywhere",
                        }}
                    >
                        <strong>Bank Details:</strong>

                        {bankName && <div style={{ marginTop: "6px" }}>Bank: <strong>{bankName}</strong></div>}
                        {accountNumber && <div>Account #: <strong>{accountNumber}</strong></div>}
                        {ifsc && <div>IFSC: <strong>{ifsc}</strong></div>}
                        {bankBranch && <div>Branch: <strong>{bankBranch}</strong></div>}
                    </div>

                    <div
                        style={{
                            minHeight: "150px",
                            padding: "8px",
                            borderRight: "1px solid #222",
                            textAlign: "center",
                        }}
                    >
                        <strong>Pay using UPI:</strong>

                        {upiQr && (
                            <img
                                src={upiQr}
                                alt="UPI QR"
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    objectFit: "contain",
                                    display: "block",
                                    margin: "10px auto",
                                }}
                            />
                        )}
                    </div>

                    <div
                        style={{
                            minHeight: "150px",
                            padding: "8px",
                            textAlign: "center",
                            position: "relative",
                            overflowWrap: "anywhere",
                        }}
                    >
                        <div style={{ textAlign: "right", marginBottom: "20px" }}>
                            For {companyName}
                        </div>

                        {signature && (
                            <img
                                src={signature}
                                alt="Authorized signature"
                                style={{
                                    width: "100px",
                                    height: "70px",
                                    objectFit: "contain",
                                    marginTop: "15px",
                                }}
                            />
                        )}

                        {signatureName && (
                            <div style={{ marginTop: "6px", fontWeight: 700 }}>
                                {signatureName}
                            </div>
                        )}

                        <div style={{ marginTop: "20px" }}>
                            Authorized Signatory
                        </div>
                    </div>
                </div>

                {/* NOTES + TERMS */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "50% 50%",
                        borderTop: "1px solid #222",
                    }}
                >
                    <div
                        style={{
                            minHeight: "125px",
                            padding: "8px",
                            borderRight: "1px solid #222",
                            overflowWrap: "anywhere",
                        }}
                    >
                        <strong>Notes:</strong>
                        <div style={{ marginTop: "6px", whiteSpace: "pre-line" }}>
                            {notes}
                        </div>
                    </div>

                    <div style={{ minHeight: "125px", padding: "8px" }}>
                        <strong>Terms and Conditions:</strong>

                        {terms.length > 0 ? (
                            <ol style={{ marginTop: "5px", paddingLeft: "18px" }}>
                                {terms.map((term, index) => (
                                    <li key={index}>{term}</li>
                                ))}
                            </ol>
                        ) : (
                            <div style={{ marginTop: "6px" }}>
                                No terms and conditions provided.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div
                style={{
                    marginTop: "25px",
                    display: "flex",
                    gap: "20px",
                    fontSize: "11px",
                    fontWeight: 600,
                }}
            >
                <span>Page 1 / 1</span>
                <span>This is a digitally signed document.</span>
            </div>
        </div>
    );
}

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function MetaCell({ label, value }) {
    return (
        <div
            style={{
                minHeight: "45px",
                padding: "7px",
                borderBottom: "1px solid #222",
                borderLeft: "1px solid #222",
                overflowWrap: "anywhere",
            }}
        >
            <strong>{label}</strong>

            <div style={{ marginTop: "3px", fontWeight: 600 }}>
                {value || "-"}
            </div>
        </div>
    );
}

function Th({ children, width, colSpan, rowSpan }) {
    return (
        <th
            colSpan={colSpan}
            rowSpan={rowSpan}
            style={{
                width,
                border: "1px solid #222",
                padding: "4px 3px",
                textAlign: "center",
                fontWeight: 700,
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
                border: "1px solid #222",
                padding: "4px",
                verticalAlign: "top",
                textAlign: center ? "center" : right ? "right" : "left",
                fontSize: "11px",
                overflowWrap: "anywhere",
                ...style,
            }}
        >
            {children}
        </td>
    );
}
