import React from "react";

/*
 * ============================================================
 * NUMBER → INDIAN WORDS
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

const twoDigitsToWords = (
  num
) => {
  if (num < 20) {
    return ONES[num];
  }

  const tens =
    Math.floor(num / 10);

  const ones =
    num % 10;

  return `${TENS[tens]}${
    ones
      ? ` ${ONES[ones]}`
      : ""
  }`;
};

const threeDigitsToWords = (
  num
) => {
  const hundreds =
    Math.floor(num / 100);

  const rest =
    num % 100;

  let words = "";

  if (hundreds) {
    words += `${ONES[hundreds]} Hundred`;
  }

  if (rest) {
    words += `${
      words ? " " : ""
    }${twoDigitsToWords(
      rest
    )}`;
  }

  return words;
};

const integerToIndianWords = (
  value
) => {
  let num = Number(value) || 0;

  if (num === 0) {
    return "Zero";
  }

  num = Math.floor(num);

  const crore =
    Math.floor(
      num / 10000000
    );

  num %= 10000000;

  const lakh =
    Math.floor(
      num / 100000
    );

  num %= 100000;

  const thousand =
    Math.floor(
      num / 1000
    );

  num %= 1000;

  const hundred = num;

  const parts = [];

  if (crore) {
    parts.push(
      `${threeDigitsToWords(
        crore
      )} Crore`
    );
  }

  if (lakh) {
    parts.push(
      `${threeDigitsToWords(
        lakh
      )} Lakh`
    );
  }

  if (thousand) {
    parts.push(
      `${threeDigitsToWords(
        thousand
      )} Thousand`
    );
  }

  if (hundred) {
    parts.push(
      threeDigitsToWords(
        hundred
      )
    );
  }

  return parts.join(" ");
};

const amountInWords = (
  amount,
  currency = "INR"
) => {
  const value =
    Number(amount) || 0;

  const rupees =
    Math.floor(value);

  const paise =
    Math.round(
      (value - rupees) *
        100
    );

  let words = `${currency} ${integerToIndianWords(
    rupees
  )}`;

  if (paise > 0) {
    words += ` and ${integerToIndianWords(
      paise
    )} Paise`;
  }

  return `${words} Only`;
};

/*
 * ============================================================
 * PARTY ADDRESS
 * ============================================================
 */

const resolvePartyAddress = (
  invoice
) => {
  if (!invoice) {
    return "";
  }

  if (
    invoice.partyAddress
  ) {
    return invoice.partyAddress;
  }

  if (
    invoice.party?.address
  ) {
    return invoice.party.address;
  }

  if (
    invoice.billingAddress
  ) {
    return invoice.billingAddress;
  }

  return "";
};

/*
 * ============================================================
 * TAX
 * ============================================================
 */

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
    Number(
      item?.discountAmount
    ) || 0;

  const grossAmount =
    quantity * unitPrice;

  const taxableAmount =
    Math.max(
      grossAmount -
        discount,
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
      ? Number(
          item.taxRate
        ) || 0
      : Number(
          taxMaster?.taxRate
        ) || 0;

  const hasExplicitTax =
    item?.taxAmount != null ||
    item?.cgstAmount != null ||
    item?.sgstAmount != null ||
    item?.igstAmount != null;

  let taxAmount = 0;
  let totalAmount =
    taxableAmount;

  if (hasExplicitTax) {
    taxAmount =
      item?.taxAmount != null
        ? Number(
            item.taxAmount
          ) || 0
        : (Number(
              item?.cgstAmount
            ) || 0) +
          (Number(
            item?.sgstAmount
          ) || 0) +
          (Number(
            item?.igstAmount
          ) || 0);

    totalAmount =
      item?.totalAmount !=
      null
        ? Number(
            item.totalAmount
          ) || 0
        : taxableAmount +
          taxAmount;
  } else {
    taxAmount =
      (taxableAmount *
        taxRate) /
      100;

    totalAmount =
      taxableAmount +
      taxAmount;
  }

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (
    taxType === "IGST"
  ) {
    igstAmount =
      item?.igstAmount != null
        ? Number(
            item.igstAmount
          ) || 0
        : taxAmount;
  } else {
    cgstAmount =
      item?.cgstAmount != null
        ? Number(
            item.cgstAmount
          ) || 0
        : taxAmount / 2;

    sgstAmount =
      item?.sgstAmount != null
        ? Number(
            item.sgstAmount
          ) || 0
        : taxAmount / 2;
  }

  return {
    grossAmount,
    taxableAmount,
    taxAmount,
    taxRate,
    taxType,
    totalAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
  };
};

/*
 * ============================================================
 * FINANCIAL YEAR
 * ============================================================
 */

const getFinancialYear = () => {
  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    today.getMonth() + 1;

  const startYear =
    month >= 4
      ? year
      : year - 1;

  const endYear =
    startYear + 1;

  return `${startYear}-${endYear}`;
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

const InvoicePdfTemplate = ({
  invoice,
  taxMasters = [],
}) => {
  if (!invoice) {
    return null;
  }

  const invoiceItems =
    invoice.invoiceItems ||
    [];

  const totalQuantity =
    invoiceItems.reduce(
      (sum, item) =>
        sum +
        (Number(
          item?.quantity
        ) || 0),
      0
    );

  const taxSummary =
    invoiceItems.reduce(
      (acc, item) => {
        const breakdown =
          getItemTaxBreakdown(
            item,
            taxMasters
          );

        acc.cgst +=
          breakdown.cgstAmount;

        acc.sgst +=
          breakdown.sgstAmount;

        acc.igst +=
          breakdown.igstAmount;

        return acc;
      },
      {
        cgst: 0,
        sgst: 0,
        igst: 0,
      }
    );

  const getInvoiceTitle = (
    invoiceType
  ) => {
    switch (
      invoiceType
    ) {
      case "SALE":
      case "SALE_INVOICE":
        return "Sale Invoice";

      case "PURCHASE":
      case "PURCHASE_INVOICE":
        return "Purchase Invoice";

      case "CREDIT_NOTE":
        return "Credit Note";

      case "DEBIT_NOTE":
        return "Debit Note";

      case "STOCK_TRANSFER":
        return "Stock Transfer";

      default:
        return "Tax Invoice";
    }
  };

  return (
    <div
      id="invoice-pdf-template"
      style={{
        position: "fixed",
        left: "-10000px",
        top: "0",

        width: "794px",
        height: "1123px",

        boxSizing:
          "border-box",

        padding:
          "18px 24px 10px 24px",

        background: "#fff",
        color: "#000",

        fontFamily:
          "Arial, Helvetica, sans-serif",

        fontSize: "16px",
        lineHeight: "1.15",

        overflow: "hidden",
      }}
    >
      {/* ======================================================
          TITLE
      ====================================================== */}

      <div
        style={{
          textAlign:
            "center",

          fontSize:
            "18px",

          fontWeight:
            "bold",

          height: "20px",

          lineHeight:
            "20px",
        }}
      >
        {getInvoiceTitle(
          invoice.invoiceType
        )}
      </div>

      {/* ======================================================
          MAIN TABLE
      ====================================================== */}

      <table
        style={{
          width: "100%",
          borderCollapse:
            "collapse",
          tableLayout:
            "fixed",
          border:
            "1px solid #000",
        }}
      >
        <tbody>
          {/* ==================================================
              COMPANY + INVOICE META
          ================================================== */}

          <tr>
            {/* =================================================
                LEFT COMPANY / BUYER
            ================================================= */}

            <td
              style={{
                width: "51%",
                height: "270px",
                border:
                  "1px solid #000",
                padding:
                  "5px 7px",
                verticalAlign:
                  "top",
                fontSize:
                  "11px",
                lineHeight:
                  "14px",
                boxSizing:
                  "border-box",
              }}
            >
              {/* COMPANY */}

              <div
                style={{
                  fontSize:
                    "16px",
                  fontWeight:
                    "bold",
                  lineHeight:
                    "17px",
                }}
              >
                {invoice
                  ?.pdfCompanyInfo
                  ?.name
                  ? `${invoice.pdfCompanyInfo.name} (${getFinancialYear()})`
                  : ""}
              </div>

              {/* ADDRESS */}

              {(
                invoice
                  ?.pdfCompanyInfo
                  ?.addressLines ||
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
                    style={{
                      lineHeight:
                        "14px",
                    }}
                  >
                    {
                      line
                    }
                  </div>
                )
              )}

              {/* GSTIN */}

              <div
                style={{
                  display:
                    "flex",
                  lineHeight:
                    "14px",
                }}
              >
                <span
                  style={{
                    width:
                      "75px",
                    flexShrink:
                      0,
                    fontWeight:
                      "bold",
                  }}
                >
                  GSTIN/UIN
                </span>

                <span
                  style={{
                    width:
                      "10px",
                    flexShrink:
                      0,
                  }}
                >
                  :
                </span>

                <span>
                  {invoice
                    ?.pdfCompanyInfo
                    ?.gstin ||
                    "N/A"}
                </span>
              </div>

              {/* STATE */}

              <div
                style={{
                  display:
                    "flex",
                  lineHeight:
                    "14px",
                }}
              >
                <span
                  style={{
                    width:
                      "75px",
                    flexShrink:
                      0,
                  }}
                >
                  State
                </span>

                <span
                  style={{
                    width:
                      "10px",
                    flexShrink:
                      0,
                  }}
                >
                  :
                </span>

                <span>
                  {invoice
                    ?.pdfCompanyInfo
                    ?.stateName ||
                    ""}

                  {invoice
                    ?.pdfCompanyInfo
                    ?.stateCode
                    ? `, Code : ${invoice.pdfCompanyInfo.stateCode}`
                    : ""}
                </span>
              </div>

              {/* CONTACT */}

              <div
                style={{
                  display:
                    "flex",
                  lineHeight:
                    "14px",
                }}
              >
                <span
                  style={{
                    width:
                      "75px",
                    flexShrink:
                      0,
                  }}
                >
                  Contact
                </span>

                <span
                  style={{
                    width:
                      "10px",
                    flexShrink:
                      0,
                  }}
                >
                  :
                </span>

                <span>
                  {invoice
                    ?.pdfCompanyInfo
                    ?.contact ||
                    ""}
                </span>
              </div>

              {/* EMAIL */}

              <div
                style={{
                  display:
                    "flex",
                  lineHeight:
                    "14px",
                }}
              >
                <span
                  style={{
                    width:
                      "75px",
                    flexShrink:
                      0,
                  }}
                >
                  E-Mail
                </span>

                <span
                  style={{
                    width:
                      "10px",
                    flexShrink:
                      0,
                  }}
                >
                  :
                </span>

                <span
                  style={{
                    wordBreak:
                      "break-word",
                  }}
                >
                  {invoice
                    ?.pdfCompanyInfo
                    ?.email ||
                    ""}
                </span>
              </div>

              {/* =================================================
                  BUYER
              ================================================= */}

              <div
                style={{
                  borderTop:
                    "1px solid #000",

                  marginTop:
                    "6px",

                  marginLeft:
                    "-7px",

                  marginRight:
                    "-7px",

                  padding:
                    "5px 7px",

                  lineHeight:
                    "14px",

                  boxSizing:
                    "border-box",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "10px",
                    lineHeight:
                      "12px",
                  }}
                >
                  Buyer (Bill to)
                </div>

                <div
                  style={{
                    fontSize:
                      "13px",
                    fontWeight:
                      "bold",
                    lineHeight:
                      "15px",
                  }}
                >
                  {invoice.partyName ||
                    "-"}
                </div>

                {resolvePartyAddress(
                  invoice
                ) && (
                  <div
                    style={{
                      maxWidth:
                        "90%",
                      lineHeight:
                        "14px",
                    }}
                  >
                    {resolvePartyAddress(
                      invoice
                    )}
                  </div>
                )}

                {(invoice.partyGstin ||
                  invoice.party
                    ?.gstin ||
                  invoice.party
                    ?.gstNumber) && (
                  <div
                    style={{
                      display:
                        "flex",
                      lineHeight:
                        "14px",
                    }}
                  >
                    <span
                      style={{
                        width:
                          "75px",
                        flexShrink:
                          0,
                      }}
                    >
                      GSTIN/UIN
                    </span>

                    <span
                      style={{
                        width:
                          "10px",
                        flexShrink:
                          0,
                      }}
                    >
                      :
                    </span>

                    <span>
                      {invoice.partyGstin ||
                        invoice.party
                          ?.gstin ||
                        invoice.party
                          ?.gstNumber}
                    </span>
                  </div>
                )}

                {(invoice.partyState ||
                  invoice.party
                    ?.state) && (
                  <div
                    style={{
                      display:
                        "flex",
                      lineHeight:
                        "14px",
                    }}
                  >
                    <span
                      style={{
                        width:
                          "75px",
                        flexShrink:
                          0,
                      }}
                    >
                      State
                    </span>

                    <span
                      style={{
                        width:
                          "10px",
                        flexShrink:
                          0,
                      }}
                    >
                      :
                    </span>

                    <span>
                      {invoice.partyState ||
                        invoice.party
                          ?.state}

                      {(invoice.partyStateCode ||
                        invoice.party
                          ?.stateCode) &&
                        `, Code : ${
                          invoice.partyStateCode ||
                          invoice.party
                            ?.stateCode
                        }`}
                    </span>
                  </div>
                )}
              </div>
            </td>

            {/* =================================================
                RIGHT INVOICE META
            ================================================= */}

            <td
              style={{
                width: "49%",
                padding: 0,
                border:
                  "1px solid #000",
                verticalAlign:
                  "top",
              }}
            >
              <table
                style={{
                  width:
                    "100%",
                  height:
                    "270px",
                  borderCollapse:
                    "collapse",
                  tableLayout:
                    "fixed",
                }}
              >
                <tbody>
                  <tr
                    style={{
                      height:
                        "38px",
                    }}
                  >
                    <td
                      style={
                        pdfMetaCell
                      }
                    >
                      <div
                        style={
                          pdfMetaLabel
                        }
                      >
                        Invoice No.
                      </div>

                      <div
                        style={
                          pdfMetaValue
                        }
                      >
                        {invoice.invoiceNumber ||
                          "-"}
                      </div>
                    </td>

                    <td
                      style={
                        pdfMetaCell
                      }
                    >
                      <div
                        style={
                          pdfMetaLabel
                        }
                      >
                        Dated
                      </div>

                      <div
                        style={
                          pdfMetaValue
                        }
                      >
                        {invoice.invoiceDate ||
                          "-"}
                      </div>
                    </td>
                  </tr>

                  <tr
                    style={{
                      height:
                        "38px",
                    }}
                  >
                    <td
                      style={
                        pdfMetaCell
                      }
                    >
                      <div
                        style={
                          pdfMetaLabel
                        }
                      >
                        Delivery Note
                      </div>

                      <div
                        style={
                          pdfMetaValue
                        }
                      >
                        &nbsp;
                      </div>
                    </td>

                    <td
                      style={
                        pdfMetaCell
                      }
                    >
                      <div
                        style={
                          pdfMetaLabel
                        }
                      >
                        Mode/Terms of Payment
                      </div>

                      <div
                        style={
                          pdfMetaValue
                        }
                      >
                        {invoice.paymentMode ||
                          invoice.status ||
                          "-"}
                      </div>
                    </td>
                  </tr>

                  <tr
                    style={{
                      height:
                        "38px",
                    }}
                  >
                    <td
                      style={
                        pdfMetaCell
                      }
                    >
                      <div
                        style={
                          pdfMetaLabel
                        }
                      >
                        Reference No. &amp; Date.
                      </div>

                      <div
                        style={
                          pdfMetaValue
                        }
                      >
                        {invoice.invoiceNumber ||
                          "-"}

                        {invoice.invoiceDate
                          ? ` dt. ${invoice.invoiceDate}`
                          : ""}
                      </div>
                    </td>

                    <td
                      style={
                        pdfMetaCell
                      }
                    >
                      <div
                        style={
                          pdfMetaLabel
                        }
                      >
                        Other References
                      </div>

                      <div
                        style={
                          pdfMetaValue
                        }
                      >
                        &nbsp;
                      </div>
                    </td>
                  </tr>

                  <tr
                    style={{
                      height:
                        "38px",
                    }}
                  >
                    <td
                      style={
                        pdfMetaCell
                      }
                    >
                      <div
                        style={
                          pdfMetaLabel
                        }
                      >
                        Buyer's Order No.
                      </div>

                      <div
                        style={
                          pdfMetaValue
                        }
                      >
                        {invoice.buyersOrderNo ||
                          "\u00A0"}
                      </div>
                    </td>

                    <td
                      style={
                        pdfMetaCell
                      }
                    >
                      <div
                        style={
                          pdfMetaLabel
                        }
                      >
                        Dated
                      </div>

                      <div
                        style={
                          pdfMetaValue
                        }
                      >
                        {invoice.buyersOrderDate ||
                          "\u00A0"}
                      </div>
                    </td>
                  </tr>

                  <tr
                    style={{
                      height:
                        "38px",
                    }}
                  >
                    <td
                      style={
                        pdfMetaCell
                      }
                    >
                      <div
                        style={
                          pdfMetaLabel
                        }
                      >
                        Dispatch Doc No.
                      </div>

                      <div
                        style={
                          pdfMetaValue
                        }
                      >
                        {invoice.dispatchDocNo ||
                          "\u00A0"}
                      </div>
                    </td>

                    <td
                      style={
                        pdfMetaCell
                      }
                    >
                      <div
                        style={
                          pdfMetaLabel
                        }
                      >
                        Delivery Note Date
                      </div>

                      <div
                        style={
                          pdfMetaValue
                        }
                      >
                        {invoice.deliveryNoteDate ||
                          invoice.dueDate ||
                          "\u00A0"}
                      </div>
                    </td>
                  </tr>

                  <tr
                    style={{
                      height:
                        "38px",
                    }}
                  >
                    <td
                      style={
                        pdfMetaCell
                      }
                    >
                      <div
                        style={
                          pdfMetaLabel
                        }
                      >
                        Dispatched through
                      </div>

                      <div
                        style={
                          pdfMetaValue
                        }
                      >
                        {invoice.dispatchedThrough ||
                          "\u00A0"}
                      </div>
                    </td>

                    <td
                      style={
                        pdfMetaCell
                      }
                    >
                      <div
                        style={
                          pdfMetaLabel
                        }
                      >
                        Destination
                      </div>

                      <div
                        style={
                          pdfMetaValue
                        }
                      >
                        {invoice.destination ||
                          "\u00A0"}
                      </div>
                    </td>
                  </tr>

                  <tr
                    style={{
                      height:
                        "42px",
                    }}
                  >
                    <td
                      colSpan={2}
                      style={{
                        ...pdfMetaCell,
                        verticalAlign:
                          "top",
                      }}
                    >
                      <div
                        style={
                          pdfMetaLabel
                        }
                      >
                        Terms of Delivery
                      </div>

                      <div
                        style={
                          pdfMetaValue
                        }
                      >
                        {invoice.termsAndConditions ||
                          "\u00A0"}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* ==================================================
              ITEMS
          ================================================== */}

          <tr>
            <td
              colSpan={2}
              style={{
                padding: 0,
                border:
                  "1px solid #000",
              }}
            >
              <table
                style={{
                  width:
                    "100%",
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
                      width: "40%",
                    }}
                  />

                  <col
                    style={{
                      width: "11%",
                    }}
                  />

                  <col
                    style={{
                      width: "12%",
                    }}
                  />

                  <col
                    style={{
                      width: "10%",
                    }}
                  />

                  <col
                    style={{
                      width: "6%",
                    }}
                  />

                  <col
                    style={{
                      width: "16%",
                    }}
                  />
                </colgroup>

                <thead>
                  <tr
                    style={{
                      height:
                        "34px",
                    }}
                  >
                    <th
                      style={
                        pdfItemHeader
                      }
                    >
                      S
                      <br />
                      No.
                    </th>

                    <th
                      style={
                        pdfItemHeader
                      }
                    >
                      Description of Goods
                    </th>

                    <th
                      style={
                        pdfItemHeader
                      }
                    >
                      HSN/SAC
                    </th>

                    <th
                      style={
                        pdfItemHeader
                      }
                    >
                      Quantity
                    </th>

                    <th
                      style={
                        pdfItemHeader
                      }
                    >
                      Rate
                    </th>

                    <th
                      style={
                        pdfItemHeader
                      }
                    >
                      per
                    </th>

                    <th
                      style={
                        pdfItemHeader
                      }
                    >
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invoiceItems.map(
                    (
                      item,
                      index
                    ) => {
                      const quantity =
                        Number(
                          item.quantity
                        ) || 0;

                      const unitPrice =
                        Number(
                          item.unitPrice
                        ) || 0;

                      const discount =
                        Number(
                          item.discountAmount
                        ) || 0;

                      const grossAmount =
                        quantity *
                        unitPrice;

                      const taxableAmount =
                        Math.max(
                          grossAmount -
                            discount,
                          0
                        );

                      const breakdown =
                        getItemTaxBreakdown(
                          item,
                          taxMasters
                        );

                      const taxType = (
                        item.taxType ||
                        item
                          .taxMaster
                          ?.taxType ||
                        getTaxMaster(
                          item.taxMasterId,
                          taxMasters
                        )?.taxType ||
                        ""
                      ).toUpperCase();

                      const isIgst =
                        taxType ===
                        "IGST";

                      const hasDescriptionLine =
                        Boolean(
                          item.description
                        );

                      const hasDiscountLine =
                        discount >
                        0;

                      return (
                        <React.Fragment
                          key={
                            item.id ||
                            index
                          }
                        >
                          <tr>
                            {/* SL NO */}

                            <td
                              style={{
                                ...pdfItemCell,
                                verticalAlign:
                                  "top",
                              }}
                            >
                              {index +
                                1}
                            </td>

                            {/* DESCRIPTION */}

                            <td
                              style={{
                                ...pdfItemCell,
                                textAlign:
                                  "left",
                                paddingLeft:
                                  "6px",
                                verticalAlign:
                                  "top",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight:
                                    "bold",
                                  fontSize:
                                    "10px",
                                }}
                              >
                                {item.productName ||
                                  item.itemName ||
                                  item.product
                                    ?.productName ||
                                  "-"}
                              </div>

                              {hasDescriptionLine && (
                                <div
                                  style={{
                                    fontSize:
                                      "9px",
                                    marginTop:
                                      "2px",
                                  }}
                                >
                                  {
                                    item.description
                                  }
                                </div>
                              )}

                              {hasDiscountLine && (
                                <div
                                  style={{
                                    fontSize:
                                      "9px",
                                    marginTop:
                                      "2px",
                                  }}
                                >
                                  Discount:
                                  ₹
                                  {discount.toFixed(
                                    2
                                  )}
                                </div>
                              )}

                              {!isIgst &&
                                breakdown.cgstAmount >
                                  0 && (
                                  <div
                                    style={{
                                      fontSize:
                                        "10px",
                                      fontStyle:
                                        "italic",
                                      fontWeight:
                                        "bold",
                                      textAlign:
                                        "right",
                                      marginTop:
                                        "6px",
                                    }}
                                  >
                                    {invoice.invoiceType ===
                                    "PURCHASE"
                                      ? "CGST Input"
                                      : "CGST Output"}
                                  </div>
                                )}

                              {!isIgst &&
                                breakdown.sgstAmount >
                                  0 && (
                                  <div
                                    style={{
                                      fontSize:
                                        "10px",
                                      fontStyle:
                                        "italic",
                                      fontWeight:
                                        "bold",
                                      textAlign:
                                        "right",
                                      marginTop:
                                        "2px",
                                    }}
                                  >
                                    {invoice.invoiceType ===
                                    "PURCHASE"
                                      ? "SGST Input"
                                      : "SGST Output"}
                                  </div>
                                )}

                              {isIgst &&
                                breakdown.igstAmount >
                                  0 && (
                                  <div
                                    style={{
                                      fontSize:
                                        "10px",
                                      fontStyle:
                                        "italic",
                                      fontWeight:
                                        "bold",
                                      textAlign:
                                        "right",
                                      marginTop:
                                        "6px",
                                    }}
                                  >
                                    {invoice.invoiceType ===
                                    "PURCHASE"
                                      ? "IGST Input"
                                      : "IGST Output"}
                                  </div>
                                )}
                            </td>

                            {/* HSN */}

                            <td
                              style={{
                                ...pdfItemCell,
                                verticalAlign:
                                  "top",
                              }}
                            >
                              {item.hsnCode ||
                                item.product
                                  ?.hsnCode ||
                                "-"}
                            </td>

                            {/* QUANTITY */}

                            <td
                              style={{
                                ...pdfItemCell,
                                verticalAlign:
                                  "top",
                              }}
                            >
                              <strong>
                                {quantity}{" "}
                                {item.unitName ||
                                  "PCS"}
                              </strong>
                            </td>

                            {/* RATE */}

                            <td
                              style={{
                                ...pdfItemCell,
                                verticalAlign:
                                  "top",
                              }}
                            >
                              {unitPrice.toFixed(
                                2
                              )}
                            </td>

                            {/* PER */}

                            <td
                              style={{
                                ...pdfItemCell,
                                verticalAlign:
                                  "top",
                              }}
                            >
                              {item.unitName ||
                                "PCS"}
                            </td>

                            {/* AMOUNT */}

                            <td
                              style={{
                                ...pdfItemCell,
                                textAlign:
                                  "right",
                                paddingRight:
                                  "6px",
                                verticalAlign:
                                  "top",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight:
                                    "bold",
                                }}
                              >
                                {taxableAmount.toFixed(
                                  2
                                )}
                              </div>

                              {hasDescriptionLine && (
                                <div
                                  style={{
                                    fontSize:
                                      "9px",
                                    marginTop:
                                      "2px",
                                    visibility:
                                      "hidden",
                                  }}
                                >
                                  &nbsp;
                                </div>
                              )}

                              {hasDiscountLine && (
                                <div
                                  style={{
                                    fontSize:
                                      "9px",
                                    marginTop:
                                      "2px",
                                    visibility:
                                      "hidden",
                                  }}
                                >
                                  &nbsp;
                                </div>
                              )}

                              {!isIgst &&
                                breakdown.cgstAmount >
                                  0 && (
                                  <div
                                    style={{
                                      fontWeight:
                                        "bold",
                                      marginTop:
                                        "6px",
                                    }}
                                  >
                                    {breakdown.cgstAmount.toFixed(
                                      2
                                    )}
                                  </div>
                                )}

                              {!isIgst &&
                                breakdown.sgstAmount >
                                  0 && (
                                  <div
                                    style={{
                                      fontWeight:
                                        "bold",
                                      marginTop:
                                        "2px",
                                    }}
                                  >
                                    {breakdown.sgstAmount.toFixed(
                                      2
                                    )}
                                  </div>
                                )}

                              {isIgst &&
                                breakdown.igstAmount >
                                  0 && (
                                  <div
                                    style={{
                                      fontWeight:
                                        "bold",
                                      marginTop:
                                        "6px",
                                    }}
                                  >
                                    {breakdown.igstAmount.toFixed(
                                      2
                                    )}
                                  </div>
                                )}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    }
                  )}

                  {/* ==================================================
                      SHIPPING
                  ================================================== */}

                  {Number(
                    invoice.shippingAmount
                  ) > 0 && (
                    <tr>
                      <td
                        style={
                          pdfItemCell
                        }
                      />

                      <td
                        style={{
                          ...pdfItemCell,
                          textAlign:
                            "right",
                          paddingRight:
                            "6px",
                          fontStyle:
                            "italic",
                        }}
                      >
                        Add: Shipping /
                        Freight Charges
                      </td>

                      <td
                        style={
                          pdfItemCell
                        }
                      />

                      <td
                        style={
                          pdfItemCell
                        }
                      />

                      <td
                        style={
                          pdfItemCell
                        }
                      />

                      <td
                        style={
                          pdfItemCell
                        }
                      />

                      <td
                        style={{
                          ...pdfItemCell,
                          textAlign:
                            "right",
                          paddingRight:
                            "6px",
                          fontWeight:
                            "bold",
                        }}
                      >
                        {Number(
                          invoice.shippingAmount
                        ).toFixed(
                          2
                        )}
                      </td>
                    </tr>
                  )}

                  {/* ==================================================
                      EMPTY SPACE
                  ================================================== */}

                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        height:
                          "360px",
                        border:
                          "1px solid #000",
                        verticalAlign:
                          "top",
                      }}
                    >
                      &nbsp;
                    </td>
                  </tr>

                  {/* ==================================================
                      TOTAL
                  ================================================== */}

                  <tr
                    style={{
                      height:
                        "28px",
                    }}
                  >
                    <td
                      colSpan={3}
                      style={{
                        ...pdfItemCell,
                        textAlign:
                          "right",
                        fontWeight:
                          "bold",
                        verticalAlign:
                          "middle",
                      }}
                    >
                      Total
                    </td>

                    <td
                      style={{
                        ...pdfItemCell,
                        fontWeight:
                          "bold",
                        textAlign:
                          "center",
                        verticalAlign:
                          "middle",
                      }}
                    >
                      {
                        totalQuantity
                      }{" "}
                      {invoiceItems?.[0]
                        ?.unitName ||
                        "PCS"}
                    </td>

                    <td
                      style={
                        pdfItemCell
                      }
                    />

                    <td
                      style={
                        pdfItemCell
                      }
                    />

                    <td
                      style={{
                        ...pdfItemCell,
                        textAlign:
                          "right",
                        fontWeight:
                          "bold",
                        verticalAlign:
                          "middle",
                        paddingRight:
                          "6px",
                      }}
                    >
                      ₹{" "}
                      {Number(
                        invoice.grandTotal ||
                          0
                      ).toFixed(
                        2
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* ======================================================
              AMOUNT IN WORDS
          ====================================================== */}

          <tr>
            <td
              colSpan={2}
              style={{
                border:
                  "1px solid #000",
                padding: "5px",
                height: "48px",
                verticalAlign:
                  "top",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  fontSize:
                    "9px",
                }}
              >
                <span>
                  Amount Chargeable
                  (in words)
                </span>

                <em>
                  E. &amp; O.E
                </em>
              </div>

              <div
                style={{
                  fontWeight:
                    "bold",
                  fontSize:
                    "10px",
                  marginTop:
                    "3px",
                  maxWidth:
                    "80%",
                }}
              >
                {amountInWords(
                  invoice.grandTotal
                )}
              </div>
            </td>
          </tr>

          {/* ======================================================
              DECLARATION + BANK
          ====================================================== */}

          <tr>
            {/* =================================================
                DECLARATION
            ================================================= */}

            <td
              style={{
                width: "51%",
                height:
                  "105px",
                border:
                  "1px solid #000",
                padding: "5px",
                verticalAlign:
                  "top",
              }}
            >
              <div
                style={{
                  textDecoration:
                    "underline",
                  fontSize:
                    "10px",
                  marginBottom:
                    "5px",
                }}
              >
                Declaration
              </div>

              <div
                style={{
                  fontSize:
                    "9px",
                  lineHeight:
                    "1.2",
                }}
              >
                We declare that this
                invoice shows the
                actual price of the
                goods described and
                that all particulars
                are true and correct.
              </div>

              {invoice.notes && (
                <div
                  style={{
                    marginTop:
                      "8px",
                    fontSize:
                      "9px",
                  }}
                >
                  <strong>
                    Notes:
                  </strong>{" "}
                  {
                    invoice.notes
                  }
                </div>
              )}
            </td>

            {/* =================================================
                BANK
            ================================================= */}

            <td
              style={{
                width: "49%",
                height:
                  "105px",
                border:
                  "1px solid #000",
                padding:
                  "5px 7px",
                verticalAlign:
                  "top",
                position:
                  "relative",
                boxSizing:
                  "border-box",
              }}
            >
              <div
                style={{
                  fontWeight:
                    "bold",
                  marginBottom:
                    "6px",
                  fontSize:
                    "10px",
                  lineHeight:
                    "12px",
                }}
              >
                Company's Bank
                Details
              </div>

              {/* BANK NAME */}

              <div
                style={
                  bankRowStyle
                }
              >
                <span
                  style={
                    bankLabelStyle
                  }
                >
                  Bank Name
                </span>

                <span
                  style={
                    bankColonStyle
                  }
                >
                  :
                </span>

                <span
                  style={
                    bankValueStyle
                  }
                >
                  {
                    invoice
                      ?.pdfCompanyInfo
                      ?.bank
                      ?.bankName
                  }
                </span>
              </div>

              {/* ACCOUNT HOLDER */}

              <div
                style={
                  bankRowStyle
                }
              >
                <span
                  style={
                    bankLabelStyle
                  }
                >
                  A/c Holder Name.
                </span>

                <span
                  style={
                    bankColonStyle
                  }
                >
                  :
                </span>

                <span
                  style={
                    bankValueStyle
                  }
                >
                  {
                    invoice
                      ?.pdfCompanyInfo
                      ?.bank
                      ?.accountHolder
                  }
                </span>
              </div>

              {/* ACCOUNT NUMBER */}

              <div
                style={
                  bankRowStyle
                }
              >
                <span
                  style={
                    bankLabelStyle
                  }
                >
                  A/c No.
                </span>

                <span
                  style={
                    bankColonStyle
                  }
                >
                  :
                </span>

                <span
                  style={
                    bankValueStyle
                  }
                >
                  {
                    invoice
                      ?.pdfCompanyInfo
                      ?.bank
                      ?.accountNumber
                  }
                </span>
              </div>

              {/* BRANCH */}

              <div
                style={
                  bankRowStyle
                }
              >
                <span
                  style={
                    bankLabelStyle
                  }
                >
                  Branch name:
                </span>

                <span
                  style={
                    bankColonStyle
                  }
                >
                  :
                </span>

                <span
                  style={
                    bankValueStyle
                  }
                >
                  {
                    invoice
                      ?.pdfCompanyInfo
                      ?.bank
                      ?.branchName
                  }
                </span>
              </div>

              {/* IFSC */}

              <div
                style={
                  bankRowStyle
                }
              >
                <span
                  style={
                    bankLabelStyle
                  }
                >
                  IFSC Code:
                </span>

                <span
                  style={
                    bankColonStyle
                  }
                >
                  :
                </span>

                <span
                  style={
                    bankValueStyle
                  }
                >
                  {
                    invoice
                      ?.pdfCompanyInfo
                      ?.bank
                      ?.ifscNumber
                  }
                </span>
              </div>

              {/* COMPANY */}

              <div
                style={{
                  position:
                    "absolute",
                  right: "7px",
                  bottom:
                    "20px",
                  fontWeight:
                    "bold",
                  fontSize:
                    "9px",
                  textAlign:
                    "right",
                  whiteSpace:
                    "nowrap",
                }}
              >
                for{" "}
                {invoice
                  ?.pdfCompanyInfo
                  ?.name ||
                  ""}
              </div>

              {/* SIGNATORY */}

              <div
                style={{
                  position:
                    "absolute",
                  right: "7px",
                  bottom:
                    "6px",
                  fontSize:
                    "9px",
                  textAlign:
                    "right",
                  whiteSpace:
                    "nowrap",
                }}
              >
                Authorised Signatory
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div
        style={{
          textAlign:
            "center",
          fontSize:
            "9px",
          marginTop:
            "5px",
        }}
      >
        This is a Computer
        Generated Invoice
      </div>
    </div>
  );
};

/*
 * ============================================================
 * PDF STYLES
 * ============================================================
 */

const pdfMetaCell = {
  border:
    "1px solid #000",

  padding:
    "3px 5px",

  verticalAlign:
    "top",

  fontSize:
    "13px",

  lineHeight:
    "1.1",
};

const pdfMetaLabel = {
  fontSize:
    "12px",

  fontWeight:
    "normal",

  lineHeight:
    "1.05",
};

const pdfMetaValue = {
  fontSize:
    "12px",

  fontWeight:
    "bold",

  marginTop:
    "2px",

  lineHeight:
    "1.1",
};

const pdfItemHeader = {
  border:
    "1px solid #000",

  padding:
    "4px 3px",

  background:
    "#fff",

  color:
    "#000",

  fontWeight:
    "bold",

  fontSize:
    "13px",

  textAlign:
    "center",

  verticalAlign:
    "middle",

  lineHeight:
    "1.05",
};

const pdfItemCell = {
  border:
    "1px solid #000",

  padding:
    "3px 3px",

  fontSize:
    "12px",

  color:
    "#000",

  textAlign:
    "center",

  verticalAlign:
    "top",

  lineHeight:
    "1.1",
};

const bankRowStyle = {
  display:
    "flex",

  fontSize:
    "9px",

  lineHeight:
    "14px",
};

const bankLabelStyle = {
  width:
    "95px",

  flexShrink:
    0,
};

const bankColonStyle = {
  width:
    "10px",

  flexShrink:
    0,
};

const bankValueStyle = {
  fontWeight:
    "bold",
};

export default InvoicePdfTemplate;