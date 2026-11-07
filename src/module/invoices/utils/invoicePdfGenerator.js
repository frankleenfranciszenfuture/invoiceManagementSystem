let invoicePdfGenerator = null;

export const setInvoicePdfGenerator = (generator) => {
  invoicePdfGenerator = typeof generator === "function" ? generator : null;
};

export const getInvoicePdfGenerator = () => invoicePdfGenerator;

export const clearInvoicePdfGenerator = () => {
  invoicePdfGenerator = null;
};
