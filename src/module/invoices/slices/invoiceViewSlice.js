import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedInvoiceView: "All Invoices",

  invoiceStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Invoices",
      value: "ALL",
    },
    {
      label: "Active Invoices",
      value: "ACTIVE",
    },
    {
      label: "Inactive Invoices",
      value: "INACTIVE",
    },
    {
      label: "Draft Invoices",
      value: "DRAFT",
    },
  ],
};

const invoiceViewSlice = createSlice({
  name: "invoiceView",

  initialState,

  reducers: {
    /* =====================================================
       SEARCH
    ===================================================== */

    setSearch(state, action) {
      state.search = action.payload;
    },

    /* =====================================================
       SELECTED VIEW
    ===================================================== */

    setSelectedInvoiceView(state, action) {
      state.selectedInvoiceView = action.payload;
    },

    /* =====================================================
       INVOICE STATUS
    ===================================================== */

    setInvoiceStatus(state, action) {
      state.invoiceStatus = action.payload;
    },

    /* =====================================================
       RESET VIEW
    ===================================================== */

    resetInvoiceView(state) {
      state.selectedInvoiceView = "All Invoices";
      state.invoiceStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedInvoiceView,
  setInvoiceStatus,
  resetInvoiceView,
} = invoiceViewSlice.actions;

export default invoiceViewSlice.reducer;
