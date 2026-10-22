// invoiceTemplateUtils.js

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

export const normalizeInvoice = (source = {}) => {
  const invoice = { ...source };

  // COMPANY DETAILS
  const company = {
    ...(source.company || {}),
    ...(source.companyInfo || {}),
    ...(source.pdfCompanyInfo || {}),
    companyId: firstValue(
      source.companyId,
      source.company?.companyId,
      source.company?.id,
    ),
    name: firstValue(
      source.companyName,
      source.company?.name,
      source.company?.companyName,
      source.companyInfo?.name,
    ),
    companyName: firstValue(
      source.companyName,
      source.company?.companyName,
      source.company?.name,
    ),
    companyCode: firstValue(source.companyCode, source.company?.companyCode),
    logo: firstValue(
      source.logo,
      source.companyLogo,
      source.company?.logo,
      source.companyInfo?.logo,
      source.pdfCompanyInfo?.logo,
    ),
  };

  // CUSTOMER DETAILS
  const customer = {
    ...(source.customer || {}),
    ...(source.party || {}),
    id: firstValue(source.customerId, source.customer?.id, source.party?.id),
    customerId: firstValue(source.customerId, source.customer?.customerId),
    name: firstValue(
      source.customerName,
      source.customer?.name,
      source.customer?.customerName,
      source.party?.name,
    ),
    customerName: firstValue(
      source.customerName,
      source.customer?.customerName,
      source.customer?.name,
    ),
  };

  // BANK DETAILS
  const bankDetails = {
    ...(source.bankDetails || {}),
    ...(source.bankAccount || {}),
    id: firstValue(
      source.bankAccountId,
      source.bankDetails?.id,
      source.bankAccount?.id,
    ),
    accountNumber: firstValue(
      source.accountNumber,
      source.bankDetails?.accountNumber,
      source.bankAccount?.accountNumber,
    ),
    bankName: firstValue(
      source.bankName,
      source.bankDetails?.bankName,
      source.bankAccount?.bankName,
    ),
    ifsc: firstValue(
      source.ifsc,
      source.bankDetails?.ifsc,
      source.bankAccount?.ifsc,
    ),
  };

  // CURRENCY
  const currency = {
    ...(typeof source.currency === "object" && source.currency !== null
      ? source.currency
      : {}),
    id: firstValue(source.currencyId, source.currency?.id),
    currencyId: firstValue(source.currencyId, source.currency?.currencyId),
    currencyName: firstValue(
      source.currencyName,
      source.currency?.currencyName,
    ),
    currencyCode: firstValue(
      source.currencyCode,
      source.currency?.currencyCode,
      source.currency?.code,
      typeof source.currency === "string" ? source.currency : undefined,
      "INR",
    ),
    exchangeRate: firstValue(
      source.exchangeRate,
      source.currency?.exchangeRate,
      1,
    ),
  };

  // SIGNATURE
  const signature = {
    ...(typeof source.signature === "object" && source.signature !== null
      ? source.signature
      : {}),
    id: firstValue(source.emailSignatureId, source.signature?.id),
    signatureName: firstValue(
      source.signatureName,
      source.signature?.signatureName,
    ),
    signatureContent: firstValue(
      source.signatureContent,
      source.signature?.signatureContent,
      typeof source.signature === "string" ? source.signature : undefined,
    ),
    defaultForNewMessages: source.defaultForNewMessages,
    defaultForReplies: source.defaultForReplies,
  };

  // ITEMS: preserve all persisted values and tax breakdowns
  const invoiceItems = (source.invoiceItems || source.items || []).map(
    (item) => ({
      ...item,

      quantity: firstValue(item.quantity, 0),
      unitPrice: firstValue(item.unitPrice, 0),
      baseUnitPrice: firstValue(item.baseUnitPrice, 0),

      grossAmount: firstValue(
        item.grossAmount,
        Number(item.quantity || 0) * Number(item.unitPrice || 0),
      ),

      discountAmount: firstValue(item.discountAmount, 0),

      taxableAmount: firstValue(
        item.taxableAmount,
        Number(
          item.grossAmount ??
            Number(item.quantity || 0) * Number(item.unitPrice || 0),
        ) - Number(item.discountAmount || 0),
      ),

      taxPercentage: firstValue(item.taxPercentage, 0),
      cgstPercentage: firstValue(item.cgstPercentage, 0),
      sgstPercentage: firstValue(item.sgstPercentage, 0),
      igstPercentage: firstValue(item.igstPercentage, 0),

      cgstAmount: firstValue(item.cgstAmount, 0),
      sgstAmount: firstValue(item.sgstAmount, 0),
      igstAmount: firstValue(item.igstAmount, 0),
      taxAmount: firstValue(item.taxAmount, 0),

      totalAmount: firstValue(
        item.totalAmount,
        Number(item.taxableAmount ?? 0) + Number(item.taxAmount || 0),
      ),
    }),
  );

  return {
    ...invoice,

    company,
    companyInfo: {
      ...(source.companyInfo || {}),
      ...company,
    },

    customer,
    party: {
      ...(source.party || {}),
      ...customer,
    },

    bankDetails,
    bankAccount: {
      ...(source.bankAccount || {}),
      ...bankDetails,
    },

    currency,
    currencyCode: currency.currencyCode,
    exchangeRate: currency.exchangeRate,

    signature,
    signatureName: signature.signatureName,
    signatureContent: signature.signatureContent,

    invoiceItems,
    items: invoiceItems,

    // Keep persisted invoice totals unchanged.
    subtotal: firstValue(source.subtotal, 0),
    discountAmount: firstValue(source.discountAmount, 0),
    taxAmount: firstValue(source.taxAmount, 0),
    shippingAmount: firstValue(source.shippingAmount, 0),
    grandTotal: firstValue(source.grandTotal, 0),
  };
};
