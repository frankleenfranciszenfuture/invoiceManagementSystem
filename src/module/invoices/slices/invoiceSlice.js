import { createSlice } from "@reduxjs/toolkit";

import {
  fetchInvoices,
  fetchInvoiceById,
  createInvoice,
  editInvoice,
  removeInvoice,
} from "../thunks/invoiceThunks";

/* =========================================================
   EMPTY INVOICE FORM
   ========================================================= */

const emptyInvoice = {
  invoiceNumber: "",
  invoiceType: "",
  customerId: "",
  customerName: "",
  invoiceDate: "",
  dueDate: "",

  subtotal: "",
  discountAmount: "",
  taxAmount: "",
  shippingAmount: "",
  grandTotal: "",

  status: "",

  notes: "",
  termsAndConditions: "",

  invoiceItems: [],
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  invoices: [],

  // Keep form initialized instead of null
  invoice: { ...emptyInvoice },

  exsistingInvoice: null,

  pagination: {
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },

  loading: false,

  success: false,

  error: null,

  message: "",
};

/* =========================================================
   SLICE
   ========================================================= */

const invoiceSlice = createSlice({
  name: "invoice",

  initialState,

  reducers: {
    /* =====================================================
     SET EXISTING INVOICE
  ===================================================== */

    setExistingInvoice: (state, action) => {
      state.exsistingInvoice = action.payload;
    },

    /* =====================================================
     CLEAR INVOICE STATE
  ===================================================== */

    clearInvoiceState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";
    },

    /* =====================================================
     CLEAR SELECTED INVOICE
  ===================================================== */

    clearSelectedInvoice: (state) => {
      state.invoice = { ...emptyInvoice };
    },

    /* =====================================================
     RESET INVOICE FORM
  ===================================================== */

    resetInvoiceForm: (state) => {
      state.invoice = {
        ...emptyInvoice,
        invoiceItems: [],
      };
    },

    /* =====================================================
     SET INVOICE FORM FIELD
  ===================================================== */

    setInvoiceField: (state, action) => {
      const { field, value } = action.payload;

      state.invoice = {
        ...(state.invoice || emptyInvoice),
        [field]: value,
      };
    },

    /* =====================================================
     SET ALL INVOICE ITEMS
  ===================================================== */

    setInvoiceItems: (state, action) => {
      state.invoice.invoiceItems = action.payload || [];
    },

    /* =====================================================
     SET INVOICE ITEM FIELD
  ===================================================== */

    setInvoiceItemField: (state, action) => {
      const { index, field, value } = action.payload;

      if (!state.invoice.invoiceItems) {
        state.invoice.invoiceItems = [];
      }

      if (index < 0 || index >= state.invoice.invoiceItems.length) {
        return;
      }

      state.invoice.invoiceItems[index][field] = value;
    },

    /* =====================================================
     ADD INVOICE ITEM
  ===================================================== */

    addInvoiceItem: (state, action) => {
      if (!state.invoice.invoiceItems) {
        state.invoice.invoiceItems = [];
      }

      state.invoice.invoiceItems.push(action.payload);
    },

    /* =====================================================
     REMOVE INVOICE ITEM
  ===================================================== */

    removeInvoiceItem: (state, action) => {
      const index = action.payload;

      if (!state.invoice.invoiceItems) {
        return;
      }

      if (index < 0 || index >= state.invoice.invoiceItems.length) {
        return;
      }

      state.invoice.invoiceItems.splice(index, 1);
    },
  },

  /* =======================================================
     EXTRA REDUCERS
  ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL INVOICES
    ===================================================== */

    builder

      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        state.invoices = response?.data?.content || [];

        state.pagination = {
          pageNumber: response?.data?.pageNumber ?? 0,
          pageSize: response?.data?.pageSize ?? 20,
          totalElements: response?.data?.totalElements ?? 0,
          totalPages: response?.data?.totalPages ?? 0,
          last: response?.data?.last ?? true,
        };
      })

      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch invoices.";
      });

    /* =====================================================
       FETCH INVOICE BY ID
    ===================================================== */

    builder

      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.invoice = action.payload?.data ||
          action.payload || { ...emptyInvoice };
      })

      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch invoice.";
      });

    /* =====================================================
       CREATE INVOICE
    ===================================================== */

    builder

      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Invoice created successfully.";

        const newInvoice = action.payload?.data;

        if (newInvoice) {
          state.invoices.push(newInvoice);

          // Keep newly created invoice selected
          state.invoice = newInvoice;
        }
      })

      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while creating invoice.";
      });

    /* =====================================================
       UPDATE INVOICE
    ===================================================== */

    builder

      .addCase(editInvoice.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(editInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Invoice updated successfully.";

        const updatedInvoice = action.payload?.data;

        if (updatedInvoice) {
          const index = state.invoices.findIndex(
            (item) => item.id === updatedInvoice.id,
          );

          if (index !== -1) {
            state.invoices[index] = updatedInvoice;
          }

          state.invoice = updatedInvoice;
        }
      })

      .addCase(editInvoice.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating invoice.";
      });

    /* =====================================================
       DELETE INVOICE
    ===================================================== */

    builder

      .addCase(removeInvoice.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(removeInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Invoice deleted successfully.";

        const deletedId = action.payload?.data?.id || action.payload?.id;

        if (deletedId) {
          state.invoices = state.invoices.filter(
            (item) => item.id !== deletedId,
          );
        }

        // Clear selected invoice if the deleted invoice
        // is currently selected
        if (state.invoice?.id === deletedId) {
          state.invoice = { ...emptyInvoice };
        }
      })

      .addCase(removeInvoice.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while deleting invoice.";
      });

    /* =====================================================
       REACTIVATE INVOICE
    ===================================================== */

    // builder

    //   .addCase(reactivateInvoice.pending, (state) => {
    //     state.loading = true;
    //     state.success = false;
    //     state.error = null;
    //   })

    //   .addCase(reactivateInvoice.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.success = true;
    //     state.error = null;

    //     state.message =
    //       action.payload?.message || "Invoice reactivated successfully.";

    //     const reactivatedInvoice = action.payload?.data;

    //     if (reactivatedInvoice) {
    //       const index = state.invoices.findIndex(
    //         (item) => item.id === reactivatedInvoice.id,
    //       );

    //       if (index !== -1) {
    //         state.invoices[index] = reactivatedInvoice;
    //       } else {
    //         state.invoices.push(reactivatedInvoice);
    //       }

    //       state.invoice = reactivatedInvoice;
    //     }
    //   })

    //   .addCase(reactivateInvoice.rejected, (state, action) => {
    //     state.loading = false;
    //     state.success = false;

    //     state.error =
    //       action.payload || "Something went wrong while reactivating invoice.";
    //   });

    /* =====================================================
       FETCH INVOICES BY STATUS
    ===================================================== */

    // builder

    //   .addCase(fetchInvoicesByStatus.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })

    //   .addCase(fetchInvoicesByStatus.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.success = true;
    //     state.error = null;

    //     const response = action.payload;

    //     state.invoices = response?.data?.content || [];

    //     state.pagination = {
    //       pageNumber: response?.data?.pageNumber ?? 0,
    //       pageSize: response?.data?.pageSize ?? 20,
    //       totalElements: response?.data?.totalElements ?? 0,
    //       totalPages: response?.data?.totalPages ?? 0,
    //       last: response?.data?.last ?? true,
    //     };
    //   })

    //   .addCase(fetchInvoicesByStatus.rejected, (state, action) => {
    //     state.loading = false;
    //     state.success = false;

    //     state.error = action.payload || "Failed to fetch invoices by status.";
    //   });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  setExistingInvoice,
  clearInvoiceState,
  clearSelectedInvoice,
  resetInvoiceForm,
  setInvoiceField,
  setInvoiceItems,
  setInvoiceItemField,
  addInvoiceItem,
  removeInvoiceItem,
} = invoiceSlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default invoiceSlice.reducer;
