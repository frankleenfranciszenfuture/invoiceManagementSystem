
import React from "react";

import {
    firstValue,
    getInvoiceTemplateData,
} from "../../utils/invoiceTemplateHelpers";

export default function InvoiceTemplate3({
    invoice,
    taxMasters = [],
    preview = false,
    variant = "tata",
}) {
    if (!invoice) return null;

    const data = getInvoiceTemplateData(invoice, taxMasters);

    const {
        company,
        bank,
        bankRows,
        items,
        breakdowns,
        totalQuantity,
        currency,
        symbol,
        fmt,
        taxableTotal,
        cgstTotal,
        sgstTotal,
        igstTotal,
        grandTotal,
        hasTax,
        hasIgst,
        isPaid,
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

    const isTata = variant === "tata";

    const pageClass = preview
        ? "relative mx-auto"
        : "fixed left-[-10000px] top-0";

    const companyName =
        company.legalName || company.name || "-";

    const companyAddress = [
        [company.addressLine1, company.addressLine2]
            .filter(Boolean)
            .join(", "),
        [
            company.city,
            company.state,
            company.country,
            company.pincode,
        ].filter(Boolean).join(", "),
    ].filter(Boolean);

    const getItemData = (item, index) => {
        const breakdown = breakdowns[index] || {};

        const name = firstValue(
            item.productName,
            item.itemName,
            item.product?.productName,
            item.product?.name,
            item.serviceName,
            item.description,
            "-"
        );

        const description = firstValue(
            item.description,
            ""
        );

        const hsn = firstValue(
            item.hsnCode,
            item.sacCode,
            item.product?.hsnCode,
            item.product?.sacCode,
            "-"
        );

        const quantity = Number(item.quantity) || 0;
        const rate = Number(item.unitPrice) || 0;

        const taxable = Number(
            breakdown.taxableAmount ?? 0
        );

        const taxRate = Number(
            breakdown.taxRate ?? item.taxRate ?? 0
        );

        const taxAmount = Number(
            breakdown.taxAmount ??
            item.taxAmount ??
            (taxable * taxRate / 100)
        );

        const amount = Number(
            breakdown.totalAmount ??
            item.totalAmount ??
            (taxable + taxAmount)
        );

        const unit = firstValue(
            item.unitName,
            item.unit?.unitName,
            item.unit?.name,
            ""
        );

        const size = firstValue(
            item.sizeName,
            item.size?.sizeName,
            item.size?.name,
            ""
        );

        return {
            name,
            description,
            hsn,
            quantity,
            rate,
            taxable,
            taxRate,
            taxAmount,
            amount,
            unit,
            size,
        };
    };

    const itemData = items.map(getItemData);

    // Group items by HSN/SAC for tax summary.
    const hsnGroups = Object.values(
        itemData.reduce((groups, item) => {
            const key = `${item.hsn}-${item.taxRate}`;

            if (!groups[key]) {
                groups[key] = {
                    hsn: item.hsn,
                    taxable: 0,
                    taxRate: item.taxRate,
                    taxAmount: 0,
                };
            }

            groups[key].taxable += item.taxable;
            groups[key].taxAmount += item.taxAmount;

            return groups;
        }, {})
    );

    const dateRows = [
        ["Invoice #:", invoiceNumber],
        ["Invoice Date:", invoiceDate],
        ...(dueDate ? [["Due Date:", dueDate]] : []),
        ["Place of Supply:", placeOfSupply],
    ];

    const border = "border border-black";
    const cell = "border border-black px-2 py-1";
    const smallText = "text-[10px] leading-[1.4]";

    return (
        <div
            id="invoice-template-4"
            className={`
                ${pageClass}
                box-border
                min-h-[1123px]
                w-[794px]
                overflow-hidden
                bg-white
                px-[38px]
                pt-[34px]
                pb-[60px]
                font-['Arial',Helvetica,sans-serif]
                text-[11px]
                leading-[1.4]
                text-black
                ${preview ? "shadow-[0_2px_12px_rgba(0,0,0,0.12)]" : ""}
            `}
        >
            {/* =================================================
                COMMON TITLE
            ================================================= */}

            <div className="flex h-[30px] items-center justify-between border border-black px-2">
                <div className="flex-1 text-center text-[15px] font-bold tracking-[3px] text-blue-700">
                    TAX INVOICE
                </div>

                <div className="text-[10px] font-semibold tracking-[1px]">
                    ORIGINAL FOR RECIPIENT
                </div>
            </div>

            {/* =================================================
                DESIGN 1 - TATA MOTORS
            ================================================= */}

            {isTata && (
                <>
                    {/* COMPANY + INVOICE DETAILS */}

                    <div className="grid grid-cols-2">
                        <div className={`${border} flex min-h-[140px] items-center gap-4 p-3`}>
                            <div className="flex w-[125px] shrink-0 items-center justify-center">
                                {logo && (
                                    <img
                                        src={logo}
                                        alt="Company Logo"
                                        className="max-h-[100px] max-w-[120px] object-contain"
                                    />
                                )}
                            </div>

                            <CompanyInfo
                                company={company}
                                companyName={companyName}
                                companyAddress={companyAddress}
                            />
                        </div>

                        <div className="grid grid-cols-2">
                            {dateRows.map(([label, value]) => (
                                <div
                                    key={label}
                                    className={`${border} min-h-[35px] px-2 py-2`}
                                >
                                    <div className="font-bold">
                                        {label}
                                    </div>
                                    <div className="mt-1 font-semibold">
                                        {value || "-"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CUSTOMER + SHIPPING */}

                    <div className="grid grid-cols-2">
                        <div className={`${border} min-h-[143px] p-2`}>
                            <div className="mb-1 font-bold">
                                Customer Details:
                            </div>

                            <PartyInfo
                                partyName={partyName}
                                partyAddress={partyAddress}
                                partyEmail={partyEmail}
                                partyPhone={partyPhone}
                                partyGstin={partyGstin}
                            />
                        </div>

                        <div className={`${border} min-h-[143px] p-2`}>
                            <div className="mb-1 font-bold">
                                Shipping address:
                            </div>

                            <div className="whitespace-pre-line leading-[1.7]">
                                {firstValue(
                                    invoice.shippingAddress,
                                    invoice.shippingAddress?.address,
                                    partyAddress,
                                    "-"
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ITEM TABLE */}

                    <div className="mt-0">
                        <table className="w-full table-fixed border-collapse">
                            <colgroup>
                                <col className="w-[5%]" />
                                <col className="w-[29%]" />
                                <col className="w-[10%]" />
                                <col className="w-[13%]" />
                                <col className="w-[10%]" />
                                <col className="w-[11%]" />
                                <col className="w-[12%]" />
                                <col className="w-[10%]" />
                            </colgroup>

                            <thead>
                                <tr className="bg-gray-50">
                                    {[
                                        "#",
                                        "Item",
                                        "HSN/SAC",
                                        "Rate/Item",
                                        "Qty",
                                        "Taxable Value",
                                        "Tax Amount",
                                        "Amount",
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className={`${cell} text-[10px]`}
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {itemData.map((item, index) => (
                                    <tr key={items[index].id || index}>
                                        <td className={`${cell} align-top`}>
                                            {index + 1}
                                        </td>

                                        <td className={`${cell} align-top`}>
                                            <div className="font-bold">
                                                {item.name}
                                            </div>

                                            {item.description &&
                                                item.description !== item.name && (
                                                    <div className="mt-1 whitespace-pre-line">
                                                        {item.description}
                                                    </div>
                                                )}

                                            {item.unit || item.size ? (
                                                <div className="mt-1 text-[10px]">
                                                    {[item.unit, item.size]
                                                        .filter(Boolean)
                                                        .join(" / ")}
                                                </div>
                                            ) : null}
                                        </td>

                                        <td className={`${cell} text-center align-top`}>
                                            {item.hsn}
                                        </td>

                                        <td className={`${cell} text-right align-top`}>
                                            {fmt(item.rate)}
                                        </td>

                                        <td className={`${cell} text-right align-top`}>
                                            {item.quantity}
                                        </td>

                                        <td className={`${cell} text-right align-top`}>
                                            {fmt(item.taxable)}
                                        </td>

                                        <td className={`${cell} text-right align-top`}>
                                            {fmt(item.taxAmount)}
                                            <div className="text-[9px]">
                                                ({item.taxRate}%)
                                            </div>
                                        </td>

                                        <td className={`${cell} text-right align-top`}>
                                            {fmt(item.amount)}
                                        </td>
                                    </tr>
                                ))}

                                {/* Keep enough space for the first design */}

                                <tr>
                                    <td
                                        colSpan={8}
                                        className={`${border} h-[220px]`}
                                    />
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* TOTALS */}

                    <div className="border-x border-black">
                        <TotalRow
                            label={`Total Items / Qty : ${items.length} / ${totalQuantity}`}
                            value={`Taxable Amount       ${symbol}${fmt(taxableTotal)}`}
                        />

                        {hasIgst ? (
                            <TotalRow
                                label=""
                                labelRight="IGST"
                                value={`${symbol}${fmt(igstTotal)}`}
                            />
                        ) : (
                            <>
                                <TotalRow
                                    label=""
                                    labelRight="CGST"
                                    value={`${symbol}${fmt(cgstTotal)}`}
                                />
                                <TotalRow
                                    label=""
                                    labelRight="SGST"
                                    value={`${symbol}${fmt(sgstTotal)}`}
                                />
                            </>
                        )}

                        <div className="flex justify-between border-y border-black px-2 py-1">
                            <span className="text-[10px]">
                                Total amount (in words): {amountInWords}
                            </span>

                            <strong className="text-[17px]">
                                Total {symbol}{fmt(grandTotal)}
                            </strong>
                        </div>
                    </div>

                    {/* HSN TAX SUMMARY */}

                    <TaxSummary
                        groups={hsnGroups}
                        fmt={fmt}
                        symbol={symbol}
                        border={border}
                    />

                    {/* PAYMENT STATUS */}

                    <div className={`${border} flex justify-end px-2 py-1`}>
                        <strong>
                            {isPaid ? "✓ Amount Paid" : "Amount Payable"}
                            {" "}
                            {symbol}{fmt(grandTotal)}
                        </strong>
                    </div>

                    {/* BANK + QR + SIGNATURE */}

                    <div className="grid grid-cols-[1fr_1fr_1fr] min-h-[190px]">
                        <div className={`${border} p-2`}>
                            <div className="mb-2 font-bold">
                                Bank Details:
                            </div>

                            <BankInfo bankRows={bankRows} />

                            {bank?.upiId && (
                                <div className="mt-2">
                                    UPI ID: {bank.upiId}
                                </div>
                            )}
                        </div>

                        <div className={`${border} flex flex-col items-center p-2`}>
                            <div className="font-bold">
                                Pay using UPI:
                            </div>

                            {qrCode && (
                                <img
                                    src={qrCode}
                                    alt="UPI QR"
                                    className="mt-2 h-[115px] w-[115px] object-contain"
                                />
                            )}
                        </div>

                        <Signatory
                            companyName={companyName}
                            stamp={stamp}
                            signature={signature}
                            signatureText={signatureText}
                            company={company}
                            border={border}
                        />
                    </div>

                    {/* NOTES + TERMS */}

                    <div className="grid grid-cols-2">
                        <div className={`${border} min-h-[120px] p-2`}>
                            <strong>Notes:</strong>
                            <div className="mt-1 whitespace-pre-line">
                                {invoice.notes || "Thank you for the Business"}
                            </div>
                        </div>

                        <div className={`${border} min-h-[120px] p-2`}>
                            <strong>Terms and Conditions:</strong>
                            <div className="mt-1 whitespace-pre-line">
                                {invoice.termsAndConditions || "-"}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* =================================================
                DESIGN 2 - RELIANCE
            ================================================= */}

            {!isTata && (
                <>
                    {/* THREE COLUMN HEADER */}

                    <div className="grid grid-cols-[40%_30%_30%]">
                        <div className={`${border} flex gap-3 p-3`}>
                            {logo && (
                                <img
                                    src={logo}
                                    alt="Company Logo"
                                    className="h-[65px] w-[85px] object-contain"
                                />
                            )}

                            <CompanyInfo
                                company={company}
                                companyName={companyName}
                                companyAddress={companyAddress}
                            />
                        </div>

                        <div className={`${border} p-2`}>
                            <div className="font-bold">
                                Customer Details:
                            </div>

                            <PartyInfo
                                partyName={partyName}
                                partyAddress={partyAddress}
                                partyEmail={partyEmail}
                                partyPhone={partyPhone}
                                partyGstin={partyGstin}
                            />

                            <div className="mt-2 font-bold">
                                Place of Supply:
                            </div>
                            <div>{placeOfSupply || "-"}</div>
                        </div>

                        <div className={`${border} p-2`}>
                            {dateRows.map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex justify-between gap-2 py-[2px]"
                                >
                                    <strong>{label}</strong>
                                    <strong>{value || "-"}</strong>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ITEMS TABLE */}

                    <table className="w-full table-fixed border-collapse">
                        <colgroup>
                            <col className="w-[4%]" />
                            <col className="w-[28%]" />
                            <col className="w-[9%]" />
                            <col className="w-[17%]" />
                            <col className="w-[9%]" />
                            <col className="w-[11%]" />
                            <col className="w-[12%]" />
                            <col className="w-[10%]" />
                        </colgroup>

                        <thead>
                            <tr className="bg-gray-50">
                                {[
                                    "#",
                                    "Item",
                                    "HSN/SAC",
                                    "Rate / Item",
                                    "Qty",
                                    "Taxable Value",
                                    "Tax Amount",
                                    "Amount",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className={`${cell} text-[9px]`}
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {itemData.map((item, index) => (
                                <tr key={items[index].id || index}>
                                    <td className={`${cell} align-top`}>
                                        {index + 1}
                                    </td>

                                    <td className={`${cell} align-top`}>
                                        <div className="font-bold">
                                            {item.name}
                                        </div>

                                        {item.description &&
                                            item.description !== item.name && (
                                                <div className="mt-1">
                                                    {item.description}
                                                </div>
                                            )}

                                        {item.unit && (
                                            <div className="mt-1">
                                                {item.unit}
                                            </div>
                                        )}
                                    </td>

                                    <td className={`${cell} text-center align-top`}>
                                        {item.hsn}
                                    </td>

                                    <td className={`${cell} text-right align-top`}>
                                        {fmt(item.rate)}
                                    </td>

                                    <td className={`${cell} text-right align-top`}>
                                        {item.quantity}
                                    </td>

                                    <td className={`${cell} text-right align-top`}>
                                        {fmt(item.taxable)}
                                    </td>

                                    <td className={`${cell} text-right align-top`}>
                                        {fmt(item.taxAmount)}
                                        <div className="text-[9px]">
                                            ({item.taxRate}%)
                                        </div>
                                    </td>

                                    <td className={`${cell} text-right align-top`}>
                                        {fmt(item.amount)}
                                    </td>
                                </tr>
                            ))}

                            <tr>
                                <td
                                    colSpan={8}
                                    className={`${border} h-[115px]`}
                                />
                            </tr>
                        </tbody>
                    </table>

                    {/* TOTAL + BANK + QR */}

                    <div className="grid grid-cols-[60%_40%]">
                        <div className={`${border} p-2`}>
                            <div className="mb-1">
                                Total Items / Qty : {items.length} / {totalQuantity}
                            </div>

                            <div className="mb-2">
                                Total amount (in words): {amountInWords}
                            </div>

                            <div className="font-bold">
                                Bank Details:
                            </div>

                            <BankInfo bankRows={bankRows} />

                            {bank?.upiId && (
                                <div className="mt-1">
                                    UPI ID: {bank.upiId}
                                </div>
                            )}

                            {qrCode && (
                                <img
                                    src={qrCode}
                                    alt="UPI QR"
                                    className="absolute ml-[355px] -mt-[110px] h-[100px] w-[100px] object-contain"
                                />
                            )}
                        </div>

                        <div className={`${border} p-2`}>
                            <TotalRow
                                label="Taxable Amount"
                                value={`${symbol}${fmt(taxableTotal)}`}
                            />

                            {hasIgst ? (
                                <TotalRow
                                    label="IGST"
                                    value={`${symbol}${fmt(igstTotal)}`}
                                />
                            ) : (
                                <>
                                    <TotalRow
                                        label="CGST"
                                        value={`${symbol}${fmt(cgstTotal)}`}
                                    />
                                    <TotalRow
                                        label="SGST"
                                        value={`${symbol}${fmt(sgstTotal)}`}
                                    />
                                </>
                            )}

                            <div className="mt-1 flex justify-between border-t border-black py-2 text-[17px] font-bold">
                                <span>Total</span>
                                <span>{symbol}{fmt(grandTotal)}</span>
                            </div>

                            <div className="flex justify-between border-t border-black pt-1 font-bold">
                                <span>
                                    {isPaid ? "Amount Paid" : "Amount Payable"}
                                </span>
                                <span>{symbol}{fmt(grandTotal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* HSN SUMMARY */}

                    <TaxSummary
                        groups={hsnGroups}
                        fmt={fmt}
                        symbol={symbol}
                        border={border}
                    />

                    {/* NOTES + TERMS + SIGNATURE */}

                    <div className="grid grid-cols-[40%_40%_20%]">
                        <div className={`${border} min-h-[105px] p-2`}>
                            <strong>Notes:</strong>

                            <div className="mt-2 whitespace-pre-line">
                                {invoice.notes || "Thanks for your business."}
                            </div>

                            <div className="mt-8 w-[75%] border-t border-black pt-1">
                                Receiver's Signature
                            </div>
                        </div>

                        <div className={`${border} min-h-[105px] p-2`}>
                            <strong>Terms and Conditions:</strong>

                            <div className="mt-2 whitespace-pre-line">
                                {invoice.termsAndConditions || "-"}
                            </div>
                        </div>

                        <Signatory
                            companyName={companyName}
                            stamp={stamp}
                            signature={signature}
                            signatureText={signatureText}
                            company={company}
                            border={border}
                        />
                    </div>
                </>
            )}

            {/* FOOTER */}

            <div className="absolute bottom-[26px] left-[38px] text-[10px] font-bold">
                Page 1 / 1 &nbsp; This is a digitally signed document.
            </div>
        </div>
    );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function CompanyInfo({
    company,
    companyName,
    companyAddress,
}) {
    return (
        <div className="min-w-0 flex-1 text-[10px]">
            <div className="text-[14px] font-bold">
                {companyName}
            </div>

            {company.gstin && (
                <div className="font-bold">
                    GSTIN {company.gstin}
                </div>
            )}

            {companyAddress.map((line, index) => (
                <div key={index}>{line}</div>
            ))}

            {company.contact && (
                <div>
                    Mobile {company.countryCode || "+91"} {company.contact}
                </div>
            )}

            {company.email && (
                <div>Email {company.email}</div>
            )}

            {company.website && (
                <div>{company.website}</div>
            )}
        </div>
    );
}

function PartyInfo({
    partyName,
    partyAddress,
    partyEmail,
    partyPhone,
    partyGstin,
}) {
    return (
        <div className="text-[10px] leading-[1.5]">
            <div className="font-bold">{partyName}</div>

            {partyGstin && <div>GSTIN: {partyGstin}</div>}

            {partyAddress && (
                <div className="whitespace-pre-line">
                    {partyAddress}
                </div>
            )}

            {partyPhone && <div>Ph: {partyPhone}</div>}

            {partyEmail && <div>Email: {partyEmail}</div>}
        </div>
    );
}

function BankInfo({ bankRows = [] }) {
    return (
        <table className="text-[10px]">
            <tbody>
                {bankRows.map(([label, value]) => (
                    <tr key={label}>
                        <td className="pr-3 py-[2px]">{label}:</td>
                        <td className="font-semibold">{value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function TotalRow({
    label,
    labelRight,
    value,
}) {
    return (
        <div className="flex justify-between border-b border-gray-300 px-2 py-[3px] text-[10px]">
            <span>{label}</span>
            <div className="flex gap-4 font-bold">
                {labelRight && <span>{labelRight}</span>}
                <span>{value}</span>
            </div>
        </div>
    );
}

function TaxSummary({
    groups = [],
    fmt,
    border,
}) {
    const taxableTotal = groups.reduce(
        (sum, item) => sum + item.taxable,
        0
    );

    const taxTotal = groups.reduce(
        (sum, item) => sum + item.taxAmount,
        0
    );

    return (
        <table className="w-full border-collapse text-[10px]">
            <thead>
                <tr>
                    <th className={border}>HSN/SAC</th>
                    <th className={border}>Taxable Value</th>
                    <th className={border} colSpan={2}>
                        Integrated Tax
                    </th>
                    <th className={border}>Total Tax Amount</th>
                </tr>

                <tr>
                    <th className={border}></th>
                    <th className={border}></th>
                    <th className={border}>Rate</th>
                    <th className={border}>Amount</th>
                    <th className={border}></th>
                </tr>
            </thead>

            <tbody>
                {groups.map((item, index) => (
                    <tr key={`${item.hsn}-${index}`}>
                        <td className={`${border} px-2`}>
                            {item.hsn}
                        </td>

                        <td className={`${border} px-2 text-right`}>
                            {fmt(item.taxable)}
                        </td>

                        <td className={`${border} px-2 text-center`}>
                            {item.taxRate}%
                        </td>

                        <td className={`${border} px-2 text-right`}>
                            {fmt(item.taxAmount)}
                        </td>

                        <td className={`${border} px-2 text-right`}>
                            {fmt(item.taxAmount)}
                        </td>
                    </tr>
                ))}

                <tr className="font-bold">
                    <td className={`${border} px-2 text-right`}>
                        TOTAL
                    </td>

                    <td className={`${border} px-2 text-right`}>
                        {fmt(taxableTotal)}
                    </td>

                    <td className={border}></td>

                    <td className={`${border} px-2 text-right`}>
                        {fmt(taxTotal)}
                    </td>

                    <td className={`${border} px-2 text-right`}>
                        {fmt(taxTotal)}
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

function Signatory({
    companyName,
    stamp,
    signature,
    signatureText,
    company,
    border,
}) {
    return (
        <div className={`${border} flex min-w-0 flex-col items-center justify-between p-2 text-right`}>
            <div className="w-full text-[10px]">
                For {companyName}
            </div>

            <div className="flex min-h-[85px] items-center justify-center">
                {(stamp || signature) ? (
                    <img
                        src={stamp || signature}
                        alt="Authorized Signature"
                        className="h-[85px] w-[100px] object-contain"
                    />
                ) : (
                    <div className="whitespace-pre-line text-[10px]">
                        {signatureText || ""}
                    </div>
                )}
            </div>

            {company.signatureName && (
                <div className="text-[10px] font-bold">
                    {company.signatureName}
                </div>
            )}

            <div className="text-[10px]">
                Authorized Signatory
            </div>
        </div>
    );
}
