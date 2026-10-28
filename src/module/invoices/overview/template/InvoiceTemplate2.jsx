import React from "react";
import { getInvoiceTemplateData } from "../../utils/invoiceTemplateHelpers";

export default function InvoiceTemplate2({
    invoice,
    taxMasters = [],
    preview = false,
}) {
    if (!invoice) return null;

    const data = getInvoiceTemplateData(invoice, taxMasters);

    return (
        <div>
            <h2>{data.company.name}</h2>

            <p>Invoice: {data.invoiceNumber}</p>

            <p>Customer: {data.partyName}</p>

            <p>Email: {data.partyEmail}</p>

            <p>Total: {data.symbol}{data.fmt(data.grandTotal)}</p>

            <p>{data.amountInWords}</p>
        </div>
    );
}