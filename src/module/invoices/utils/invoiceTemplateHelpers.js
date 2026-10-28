/*
 * ============================================================
 * SHARED INVOICE HELPERS
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

export const CURRENCY_UNITS = {
  INR: ["Rupees", "Paise"],
  USD: ["Dollars", "Cents"],
  EUR: ["Euros", "Cents"],
  GBP: ["Pounds", "Pence"],
  AED: ["Dirhams", "Fils"],
  SGD: ["Dollars", "Cents"],
  AUD: ["Dollars", "Cents"],
  CAD: ["Dollars", "Cents"],
};

export const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
  SGD: "S$",
  AUD: "A$",
  CAD: "C$",
};

const twoDigitsToWords = (num) => {
  if (num < 20) return ONES[num];

  const ones = num % 10;

  return `${TENS[Math.floor(num / 10)]}${ones ? ` ${ONES[ones]}` : ""}`;
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

export const amountInWords = (amount, currency = "INR") => {
  const value = Math.max(0, Number(amount) || 0);

  const totalMinor = Math.round(value * 100);
  const major = Math.floor(totalMinor / 100);
  const minor = totalMinor % 100;

  const indian = currency === "INR";

  const [majorName, minorName] = CURRENCY_UNITS[currency] || ["", "Cents"];

  let words = `${currency} ${integerToWords(major, indian)}${majorName ? ` ${majorName}` : ""}`;

  if (minor > 0) {
    words += ` and ${integerToWords(minor, indian)} ${minorName}`;
  }

  return `${words} Only.`;
};

// ------------------------------------------------------------
// COMMON
// ------------------------------------------------------------

export const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

export const getText = (value) => {
  if (value === undefined || value === null) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
};

export const formatDate = (value) => {
  if (!value) return "-";

  if (typeof value !== "string") return String(value);

  const dateOnly = value.match(/^(\d{4}-\d{2}-\d{2})$/);

  if (dateOnly) {
    const [year, month, day] = dateOnly[1].split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const money = (value, currency = "INR") =>
  Number(value || 0).toLocaleString(currency === "INR" ? "en-IN" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const getCurrencyCode = (invoice = {}) => {
  const currency = invoice.currency;

  const value = firstValue(
    invoice.currencyCode,
    invoice.currency_code,
    typeof currency === "object" ? currency.currencyCode : null,
    typeof currency === "object" ? currency.code : null,
    typeof currency === "string" ? currency : null,
    "INR",
  );

  return String(value).toUpperCase();
};

export const getInvoiceItems = (invoice = {}) => {
  const items = firstValue(
    invoice.invoiceItems,
    invoice.items,
    invoice.lineItems,
    [],
  );

  return Array.isArray(items) ? items : [];
};

// ------------------------------------------------------------
// PARTY / CUSTOMER
// ------------------------------------------------------------

export const resolvePartyAddress = (invoice = {}) => {
  const party = invoice.party || {};
  const customer = invoice.customer || {};

  const candidates = [
    invoice.partyAddress,
    invoice.customerAddress,
    invoice.billingAddress,
    party.billingAddress,
    party.address,
    customer.billingAddress,
    customer.address,
    customer.shippingAddress,
    party.shippingAddress,
  ];

  for (const address of candidates) {
    if (typeof address === "string" && address.trim()) {
      return address.trim();
    }

    if (address && typeof address === "object") {
      const parts = [
        address.attention,
        address.addressLine1,
        address.addressLine2,
        address.address,
        address.city,
        address.state,
        address.country,
        address.zipCode || address.pincode,
      ]
        .filter(Boolean)
        .map((value) => String(value).trim())
        .filter(Boolean);

      if (parts.length) {
        return [...new Set(parts)].join(", ");
      }
    }
  }

  return "";
};

export const resolvePartyEmail = (invoice = {}) =>
  firstValue(
    invoice.partyEmail,
    invoice.customerEmail,
    invoice.party?.email,
    invoice.customer?.email,
    "",
  );

export const resolvePartyPhone = (invoice = {}) => {
  const party = invoice.party || {};
  const customer = invoice.customer || {};

  const code = firstValue(
    party.mobileCode,
    party.workPhoneCode,
    customer.mobileCode,
    customer.workPhoneCode,
    "",
  );

  const number = firstValue(
    invoice.partyPhone,
    invoice.customerPhone,
    party.mobile,
    party.workPhone,
    party.phone,
    customer.mobile,
    customer.workPhone,
    customer.phone,
    "",
  );

  return number ? `${code} ${number}`.trim() : "";
};

export const resolvePartyName = (invoice = {}) => {
  const party = invoice.party || {};
  const customer = invoice.customer || {};

  return firstValue(
    invoice.partyName,
    invoice.customerName,
    party.displayName,
    party.partyName,
    party.name,
    customer.displayName,
    customer.companyName,
    customer.customerName,
    customer.name,
    "-",
  );
};

export const resolvePartyGstin = (invoice = {}) => {
  const party = invoice.party || {};
  const customer = invoice.customer || {};

  return firstValue(
    invoice.partyGstin,
    invoice.customerGstin,
    invoice.gstin,
    party.gstin,
    party.gstNumber,
    party.gstNo,
    customer.gstin,
    customer.gstNumber,
    customer.gstNo,
    "",
  );
};

// ------------------------------------------------------------
// ASSET URL
// ------------------------------------------------------------

export const resolveAssetUrl = (path, invoice = {}) => {
  if (!path) return "";

  const value = String(path).trim();

  if (!value) return "";

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  const cleanPath = value.replace(/^\/+/, "");
  const absoluteLogo = invoice.logo || invoice.logoUrl;

  if (
    absoluteLogo &&
    typeof absoluteLogo === "string" &&
    absoluteLogo.includes("/uploads/")
  ) {
    try {
      const logoUrl = new URL(absoluteLogo);
      const apiPath = logoUrl.pathname.split("/uploads/")[0];

      return `${logoUrl.origin}${apiPath}/uploads/${cleanPath}`;
    } catch {
      // Use environment fallback.
    }
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (apiBaseUrl) {
    return `${apiBaseUrl.replace(/\/+$/, "")}/uploads/${cleanPath}`;
  }

  if (cleanPath.startsWith("uploads/")) {
    return `/${cleanPath}`;
  }

  return `/uploads/${cleanPath}`;
};

// ------------------------------------------------------------
// COMPANY / BANK
// ------------------------------------------------------------

export const resolveCompany = (invoice = {}) => {
  const companyObject =
    typeof invoice.company === "object" && invoice.company !== null
      ? invoice.company
      : {};

  const companyInfo = invoice.companyInfo || {};
  const pdfCompanyInfo = invoice.pdfCompanyInfo || {};

  const source = {
    ...companyObject,
    ...companyInfo,
    ...pdfCompanyInfo,
  };

  const address = firstValue(
    source.addressLines,
    source.address,
    invoice.companyAddress,
    invoice.address,
    [],
  );

  let addressLines = [];

  if (Array.isArray(address)) {
    addressLines = address.map((line) => getText(line).trim()).filter(Boolean);
  } else if (typeof address === "string") {
    addressLines = address
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  const companyName = firstValue(
    source.displayName,
    source.companyName,
    source.legalName,
    source.name,
    invoice.companyName,
    invoice.businessName,
    "",
  );

  const logoPath = firstValue(
    invoice.logo,
    invoice.logoUrl,
    source.logoUrl,
    source.logo,
    source.logoPath,
    "",
  );

  const signaturePath = firstValue(
    source.signatureUrl,
    source.signature,
    source.signaturePath,
    invoice.signature,
    invoice.signatureUrl,
    "",
  );

  const stampPath = firstValue(
    source.stampUrl,
    source.stamp,
    invoice.stamp,
    invoice.stampUrl,
    "",
  );

  const bankSource = source.bank || {};

  return {
    ...source,

    id: firstValue(source.id, invoice.companyId, ""),
    name: companyName,

    legalName: firstValue(
      source.legalName,
      source.companyName,
      invoice.companyName,
      "",
    ),

    companyCode: firstValue(source.companyCode, invoice.companyCode, ""),

    gstin: firstValue(
      source.gstNumber,
      source.gstin,
      invoice.companyGstin,
      invoice.gstin,
      "",
    ),

    panNumber: firstValue(source.panNumber, invoice.panNumber, ""),
    tanNumber: firstValue(source.tanNumber, invoice.tanNumber, ""),

    logo: resolveAssetUrl(logoPath, invoice),
    addressLines,

    addressLine1: firstValue(source.addressLine1, invoice.addressLine1, ""),
    addressLine2: firstValue(source.addressLine2, invoice.addressLine2, ""),
    city: firstValue(source.city, invoice.city, ""),
    state: firstValue(source.state, invoice.state, ""),
    country: firstValue(source.country, invoice.country, ""),
    pincode: firstValue(source.pincode, invoice.pincode, ""),

    contact: firstValue(
      source.phone,
      source.contact,
      source.mobile,
      source.contactNumber,
      source.alternatePhone,
      invoice.companyPhone,
      invoice.companyContact,
      "",
    ),

    alternatePhone: firstValue(
      source.alternatePhone,
      invoice.alternatePhone,
      "",
    ),
    email: firstValue(source.email, invoice.companyEmail, ""),
    website: firstValue(source.website, invoice.companyWebsite, ""),
    tagline: firstValue(source.tagline, ""),

    bank: {
      ...bankSource,

      bankName: firstValue(
        invoice.bankName,
        bankSource.bankName,
        source.bankName,
        "",
      ),
      accountHolder: firstValue(
        bankSource.accountHolder,
        bankSource.accountHolderName,
        source.accountHolder,
        source.accountHolderName,
        source.companyName,
        invoice.companyName,
        "",
      ),
      accountNumber: firstValue(
        invoice.accountNumber,
        bankSource.accountNumber,
        source.accountNumber,
        "",
      ),
      ifscNumber: firstValue(
        invoice.ifsc,
        invoice.ifscNumber,
        bankSource.ifscNumber,
        bankSource.ifsc,
        source.ifscNumber,
        source.ifsc,
        "",
      ),
      branchName: firstValue(
        bankSource.branchName,
        bankSource.branch,
        source.branchName,
        source.bankBranch,
        invoice.bankBranch,
        "",
      ),
      swiftCode: firstValue(
        bankSource.swiftCode,
        source.swiftCode,
        invoice.swiftCode,
        "",
      ),
    },

    upiQrCode: resolveAssetUrl(
      firstValue(
        source.upiQrCode,
        source.qrCode,
        invoice.upiQrCode,
        invoice.qrCode,
        "",
      ),
      invoice,
    ),

    signature: resolveAssetUrl(signaturePath, invoice),

    signatureName: firstValue(invoice.signatureName, source.signatureName, ""),
    signatureContent: firstValue(
      invoice.signatureContent,
      source.signatureContent,
      "",
    ),

    stamp: resolveAssetUrl(stampPath, invoice),
  };
};

// ------------------------------------------------------------
// SIGNATURE TEXT
// ------------------------------------------------------------

export const signatureContentToText = (content) => {
  if (!content) return "";

  return String(content)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
};

// ------------------------------------------------------------
// TAX
// ------------------------------------------------------------

export const getTaxMaster = (taxMasterId, taxMasters = []) => {
  if (!taxMasterId || !Array.isArray(taxMasters)) return null;

  return (
    taxMasters.find((tax) => String(tax.id) === String(taxMasterId)) || null
  );
};

export const getItemTaxBreakdown = (item, taxMasters = []) => {
  const quantity = Number(item?.quantity) || 0;
  const unitPrice = Number(item?.unitPrice) || 0;
  const discount = Number(item?.discountAmount) || 0;

  const grossAmount =
    item?.grossAmount != null
      ? Number(item.grossAmount) || 0
      : quantity * unitPrice;

  const taxableAmount =
    item?.taxableAmount != null
      ? Number(item.taxableAmount) || 0
      : Math.max(grossAmount - discount, 0);

  const taxMaster =
    item?.taxMaster || getTaxMaster(item?.taxMasterId, taxMasters);

  const taxType = String(
    firstValue(item?.taxType, taxMaster?.taxType, ""),
  ).toUpperCase();

  const taxRate =
    Number(
      firstValue(
        item?.taxPercentage,
        item?.taxRate,
        taxMaster?.taxPercentage,
        taxMaster?.taxRate,
        0,
      ),
    ) || 0;

  const cgstPercentage = Number(item?.cgstPercentage) || 0;
  const sgstPercentage = Number(item?.sgstPercentage) || 0;
  const igstPercentage = Number(item?.igstPercentage) || 0;

  const cgstAmount =
    item?.cgstAmount != null
      ? Number(item.cgstAmount) || 0
      : (taxableAmount * cgstPercentage) / 100;

  const sgstAmount =
    item?.sgstAmount != null
      ? Number(item.sgstAmount) || 0
      : (taxableAmount * sgstPercentage) / 100;

  const igstAmount =
    item?.igstAmount != null
      ? Number(item.igstAmount) || 0
      : (taxableAmount * igstPercentage) / 100;

  const calculatedTaxTotal = cgstAmount + sgstAmount + igstAmount;

  const taxAmount =
    item?.taxAmount != null
      ? Number(item.taxAmount) || 0
      : calculatedTaxTotal || (taxableAmount * taxRate) / 100;

  const isCgstSgst = ["CGST", "SGST", "CGST_SGST", "CGST+SGST", "GST"].includes(
    taxType,
  );

  const finalCgstAmount = cgstAmount || (isCgstSgst ? taxAmount / 2 : 0);
  const finalSgstAmount = sgstAmount || (isCgstSgst ? taxAmount / 2 : 0);
  const finalIgstAmount = igstAmount || (taxType === "IGST" ? taxAmount : 0);

  const finalTaxTotal = finalCgstAmount + finalSgstAmount + finalIgstAmount;

  return {
    grossAmount,
    taxableAmount,
    taxAmount: finalTaxTotal || taxAmount,
    taxRate,
    taxType,
    cgstPercentage,
    sgstPercentage,
    igstPercentage,
    cgstAmount: finalCgstAmount,
    sgstAmount: finalSgstAmount,
    igstAmount: finalIgstAmount,

    totalAmount:
      item?.totalAmount != null
        ? Number(item.totalAmount) || 0
        : taxableAmount + (finalTaxTotal || taxAmount),
  };
};

// ------------------------------------------------------------
// SHARED INVOICE DATA
// ------------------------------------------------------------

export const getInvoiceTemplateData = (invoice = {}, taxMasters = []) => {
  const items = getInvoiceItems(invoice);
  const company = resolveCompany(invoice);
  const bank = company.bank || {};

  const currency = getCurrencyCode(invoice);

  const symbol = firstValue(
    invoice.currencySymbol,
    typeof invoice.currency === "object" ? invoice.currency.symbol : null,
    CURRENCY_SYMBOLS[currency],
    `${currency} `,
  );

  const fmt = (value) => money(value, currency);

  const breakdowns = items.map((item) => getItemTaxBreakdown(item, taxMasters));

  const totalQuantity = items.reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0),
    0,
  );

  const taxableTotal = breakdowns.reduce(
    (sum, item) => sum + item.taxableAmount,
    0,
  );

  const cgstTotal = breakdowns.reduce((sum, item) => sum + item.cgstAmount, 0);

  const sgstTotal = breakdowns.reduce((sum, item) => sum + item.sgstAmount, 0);

  const igstTotal = breakdowns.reduce((sum, item) => sum + item.igstAmount, 0);

  const taxTotal = cgstTotal + sgstTotal + igstTotal;

  const shippingAmount = Number(invoice.shippingAmount) || 0;

  const calculatedGrandTotal = taxableTotal + taxTotal + shippingAmount;

  const grandTotal =
    invoice.grandTotal != null && invoice.grandTotal !== ""
      ? Number(invoice.grandTotal) || 0
      : calculatedGrandTotal;

  const status = String(invoice.status || "").toUpperCase();

  const partyName = resolvePartyName(invoice);
  const partyAddress = resolvePartyAddress(invoice);
  const partyEmail = resolvePartyEmail(invoice);
  const partyPhone = resolvePartyPhone(invoice);
  const partyGstin = resolvePartyGstin(invoice);

  const invoiceNumber = firstValue(
    invoice.invoiceNumber,
    invoice.invoiceNo,
    "-",
  );

  const invoiceDate = formatDate(firstValue(invoice.invoiceDate, invoice.date));

  const dueDate = invoice.dueDate ? formatDate(invoice.dueDate) : null;

  const placeOfSupply = firstValue(
    invoice.placeOfSupply,
    invoice.partyState,
    invoice.party?.billingAddress?.state,
    invoice.party?.state,
    invoice.customer?.billingAddress?.state,
    invoice.customer?.state,
    "-",
  );

  const signatureText = signatureContentToText(company.signatureContent);

  const bankRows = [
    ["Bank", bank.bankName],
    ["Account Holder", bank.accountHolder],
    ["Account #", bank.accountNumber],
    ["IFSC Code", bank.ifscNumber],
    ["Branch", bank.branchName],
    ["SWIFT Code", bank.swiftCode],
  ].filter(([, value]) => value);

  return {
    invoice,
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
    taxTotal,

    shippingAmount,
    grandTotal,

    hasTax: taxTotal > 0,
    hasIgst: igstTotal > 0,

    status,
    isPaid: status === "PAID",

    partyName,
    partyAddress,
    partyEmail,
    partyPhone,
    partyGstin,

    invoiceNumber,
    invoiceDate,
    dueDate,
    placeOfSupply,

    logo: company.logo,
    qrCode: company.upiQrCode,
    signature: company.signature,
    stamp: company.stamp,
    signatureText,

    amountInWords: amountInWords(grandTotal, currency),
  };
};
