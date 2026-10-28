
import React from "react";

import {
    firstValue,
    getInvoiceTemplateData,
} from "../../utils/invoiceTemplateHelpers";

export default function InvoiceTemplate1({
    invoice,
    taxMasters = [],
    preview = false,
}) {
    if (!invoice) return null;

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
        amountInWords: totalInWords,
    } = getInvoiceTemplateData(invoice, taxMasters);

    const companyAddress = [
        company.addressLine1,
        company.addressLine2,
        [
            company.city,
            company.state,
            company.country,
            company.pincode,
        ].filter(Boolean).join(", "),
    ].filter(Boolean);

    const pageClass = preview
        ? "relative mx-auto"
        : "fixed left-[-10000px] top-0";

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
                font-['Inter',Helvetica,Arial,sans-serif]
                text-[11px]
                leading-[1.4]
                text-[#1a1a1a]
                ${preview ? "shadow-[0_2px_12px_rgba(0,0,0,0.12)]" : ""}
            `}
        >
            {/* HEADER */}
            <div className="flex items-start justify-between border-b-[1.5px] border-[#111] pb-3">
                <div className="w-[230px]">
                    {logo ? (
                        <img
                            src={logo}
                            alt="Company Logo"
                            className="block max-h-[95px] max-w-full object-contain"
                        />
                    ) : (
                        <div className="h-[60px]" />
                    )}

                    {(company.tagline || currency !== "INR") && (
                        <div className="mt-1.5 text-[11px] font-bold tracking-[3px]">
                            {company.tagline || "MULTI CURRENCY"}
                        </div>
                    )}
                </div>

                <div className="max-w-[470px] text-right text-[11px] leading-[1.5] text-[#333]">
                    <div className="mb-[3px] text-[18px] font-black text-[#111]">
                        {company.name || "-"}
                    </div>

                    {company.legalName &&
                        company.legalName !== company.name && (
                            <div className="font-semibold">
                                {company.legalName}
                            </div>
                        )}

                    {company.gstin && (
                        <div className="font-bold text-[#111]">
                            GSTIN: {company.gstin}
                        </div>
                    )}

                    {company.panNumber && (
                        <div>
                            <strong>PAN:</strong> {company.panNumber}
                        </div>
                    )}

                    {company.tanNumber && (
                        <div>
                            <strong>TAN:</strong> {company.tanNumber}
                        </div>
                    )}

                    {companyAddress.length > 0 && (
                        <div className="font-medium text-[#111]">
                            {companyAddress.map((line, index) => (
                                <div key={index}>{line}</div>
                            ))}
                        </div>
                    )}

                    {company.contact && (
                        <div>
                            <strong className="text-[#111]">Phone:</strong>{" "}
                            {company.contact}
                        </div>
                    )}

                    {company.alternatePhone && (
                        <div>
                            <strong className="text-[#111]">
                                Alternate Phone:
                            </strong>{" "}
                            {company.alternatePhone}
                        </div>
                    )}

                    {company.email && (
                        <div>
                            <strong className="text-[#111]">Email:</strong>{" "}
                            {company.email}
                        </div>
                    )}

                    {company.website && (
                        <div>
                            <strong className="text-[#111]">Website:</strong>{" "}
                            {company.website}
                        </div>
                    )}
                </div>
            </div>

            {/* BILL TO + INVOICE META */}
            <div className="flex justify-between px-[6px] py-[14px]">
                <div className="max-w-[340px]">
                    <div className="mb-2 font-bold">Bill To:</div>

                    <div className="text-[13px] font-bold">
                        {partyName}
                    </div>

                    {partyAddress && (
                        <div className="mt-[3px] whitespace-pre-line leading-[1.6] text-[#333]">
                            {partyAddress}
                        </div>
                    )}

                    {partyGstin && (
                        <div className="mt-[3px]">
                            GSTIN: {partyGstin}
                        </div>
                    )}

                    {partyEmail && (
                        <div className="mt-[3px]">
                            Email: {partyEmail}
                        </div>
                    )}

                    {partyPhone && (
                        <div className="mt-[3px]">
                            Phone: {partyPhone}
                        </div>
                    )}
                </div>

                <table className="border-collapse">
                    <tbody>
                        {[
                            ["Invoice #:", invoiceNumber],
                            ["Invoice Date:", invoiceDate],
                            ["Place of Supply:", placeOfSupply],
                            ["Currency:", currency],
                            ...(dueDate ? [["Due Date:", dueDate]] : []),
                        ].map(([label, value]) => (
                            <tr key={label}>
                                <td className="whitespace-nowrap py-[3px] pr-[80px] text-right font-bold text-[#333]">
                                    {label}
                                </td>
                                <td className="py-[3px] text-right font-bold">
                                    {value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ITEMS */}
            <table className="w-full table-fixed border-collapse">
                <colgroup>
                    <col className="w-[5%]" />
                    <col className="w-[45%]" />
                    <col className="w-[20%]" />
                    <col className="w-[30%]" />
                </colgroup>

                <thead>
                    <tr>
                        <th className="bg-black px-[10px] py-[6px] text-left text-[11px] font-bold text-white">
                            #
                        </th>
                        <th className="bg-black px-[10px] py-[6px] text-left text-[11px] font-bold text-white">
                            Item
                        </th>
                        <th className="bg-black px-[10px] py-[6px] text-center text-[11px] font-bold text-white">
                            HSN/SAC
                        </th>
                        <th className="bg-black px-[10px] py-[6px] text-right text-[11px] font-bold text-white">
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

                        const quantity = Number(item.quantity) || 0;
                        const unitPrice = Number(item.unitPrice) || 0;

                        const unitName = firstValue(
                            item.unitName,
                            item.unit?.unitName,
                            item.unit?.name,
                            ""
                        );

                        const sizeName = firstValue(
                            item.sizeName,
                            item.size?.sizeName,
                            item.size?.name,
                            ""
                        );

                        const description = firstValue(item.description, "");

                        const itemDetails = [
                            `Qty: ${quantity}`,
                            unitName,
                            sizeName,
                        ].filter(Boolean).join(" | ");

                        return (
                            <React.Fragment
                                key={item.id || item.itemId || index}
                            >
                                <tr>
                                    <td className="px-[10px] pt-2 pb-[3px] text-left align-top text-xs">
                                        {index + 1}
                                    </td>

                                    <td className="px-[10px] pt-2 pb-[3px] text-left align-top text-xs font-bold">
                                        {itemName}
                                    </td>

                                    <td className="px-[10px] pt-2 pb-[3px] text-center align-top text-xs">
                                        {hsnCode}
                                    </td>

                                    <td className="px-[10px] pt-2 pb-[3px] text-right align-top text-xs">
                                        {fmt(breakdown.taxableAmount)}
                                    </td>
                                </tr>

                                <tr>
                                    <td
                                        colSpan={4}
                                        className="whitespace-pre-line border-b border-[#c8d4d4] py-[5px] pr-[10px] pb-[10px] pl-[42px] text-[11px] text-[#333]"
                                    >
                                        {description && description !== itemName && (
                                            <div>{description}</div>
                                        )}

                                        <div>
                                            {itemDetails} | Rate: {symbol}
                                            {fmt(unitPrice)}
                                        </div>

                                        {Number(item.discountAmount) > 0 && (
                                            <div>
                                                Discount: {symbol}
                                                {fmt(item.discountAmount)}
                                            </div>
                                        )}

                                        {breakdown.taxRate > 0 && (
                                            <div>
                                                Tax: {breakdown.taxRate}%
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>

            {/* TAX ROWS */}
            {hasTax && (
                <div className="flex justify-end">
                    <div className="w-[250px] pr-2 pt-[6px]">
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

            {/* TOTAL */}
            <div className="flex justify-end">
                <div className="flex w-[250px] items-baseline justify-between border-t-[3px] border-double border-[#bbb] box-border px-2 py-[6px]">
                    <span className="text-base font-bold">Total</span>
                    <span className="text-[19px] font-extrabold">
                        {symbol}{fmt(grandTotal)}
                    </span>
                </div>
            </div>

            {/* ITEMS COUNT + AMOUNT IN WORDS */}
            <div className="flex items-center justify-between border-b-[1.5px] border-[#111] px-[6px] py-[2px] pb-1 text-[10px] text-[#444]">
                <span>
                    Total Items / Qty : {items.length} / {totalQuantity}
                </span>

                <span>
                    Total amount (in words): {totalInWords}
                </span>
            </div>

            {/* AMOUNT PAYABLE */}
            <div className="flex justify-end gap-9 pr-2 pt-[3px] text-xs font-bold text-[#333]">
                <span>
                    {isPaid && (
                        <span className="mr-1 text-green-600">✓</span>
                    )}
                    {isPaid ? "Amount Paid:" : "Amount Payable:"}
                </span>

                <span>{symbol} {fmt(grandTotal)}</span>
            </div>

            {/* UPI / BANK / SIGNATORY */}
            <div className="mt-[22px] flex gap-9">
                {/* UPI */}
                <div className="w-[120px]">
                    <div className="mb-1 font-bold">Pay using UPI:</div>

                    {qrCode ? (
                        <img
                            src={qrCode}
                            alt="UPI QR"
                            className="block h-[115px] w-[115px] object-contain"
                        />
                    ) : (
                        <div className="flex h-[115px] w-[115px] items-center justify-center border border-dashed border-gray-400 text-[9px] text-gray-500">
                            UPI QR
                        </div>
                    )}
                </div>

                {/* BANK */}
                <div className="flex-1">
                    <div className="mb-1 font-bold">Bank Details:</div>

                    {bankRows.length > 0 ? (
                        <table className="border-collapse">
                            <tbody>
                                {bankRows.map(([label, value]) => (
                                    <tr key={label}>
                                        <td className="whitespace-nowrap py-[3px] pr-3 text-[#333] font-bold">
                                            {label}:
                                        </td>
                                        <td className="py-[3px] font-medium">
                                            {value}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-[10px] text-gray-500">
                            Bank details not provided.
                        </div>
                    )}
                </div>

                {/* SIGNATORY */}
                <div className="flex w-[200px] flex-col items-end text-right text-[10px] text-[#444]">
                    <div>For {company.name || ""}</div>

                    <div className="my-[10px] mb-3 flex min-h-[70px] w-[90px] items-center justify-center">
                        {(stamp || signature) && (
                            <img
                                src={stamp || signature}
                                alt="Seal / Signature"
                                className="h-[90px] w-[90px] object-contain"
                            />
                        )}

                        {!stamp && !signature && signatureText && (
                            <div className="w-full whitespace-pre-line break-words text-right text-[9px]">
                                {signatureText}
                            </div>
                        )}
                    </div>

                    {company.signatureName && (
                        <div className="mb-[3px] font-bold">
                            {company.signatureName}
                        </div>
                    )}

                    <div>Authorized Signatory</div>
                </div>
            </div>

            {/* NOTES / TERMS */}
            {(invoice.notes || invoice.termsAndConditions) && (
                <div className="mt-[18px] text-[10px] text-[#333]">
                    {invoice.notes && (
                        <div className="mb-2 whitespace-pre-line">
                            <strong>Notes:</strong> {invoice.notes}
                        </div>
                    )}

                    {invoice.termsAndConditions && (
                        <div className="whitespace-pre-line">
                            <strong>Terms and Conditions:</strong>
                            {"\n"}
                            {invoice.termsAndConditions}
                        </div>
                    )}
                </div>
            )}

            {/* FOOTER */}
            <div className="absolute bottom-[26px] left-[38px] text-[10px] font-bold text-[#222]">
                Page 1 / 1 &nbsp;•&nbsp; This is a digitally signed document.
            </div>
        </div>
    );
}

function TotalLine({ label, value }) {
    return (
        <div className="flex justify-between py-[2px] pl-[6px] text-[11px] font-bold text-[#333]">
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}
