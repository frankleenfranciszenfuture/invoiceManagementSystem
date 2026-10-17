import { createSlice } from "@reduxjs/toolkit";

import {
  fetchInvoices,
  fetchInvoiceById,
  createInvoice,
  editInvoice,
  removeInvoice,
  fetchGeneratedInvoiceNumber,
} from "../thunks/invoiceThunks";

/* =========================================================
   EMPTY INVOICE ITEM
========================================================= */

const emptyInvoiceItem = {
  productId: "",
  description: "",
  unitId: "",
  sizeId: "",
  quantity: 1,

  // Price in the selected invoice currency
  unitPrice: 0,

  // Original price in the base currency (INR)
  baseUnitPrice: 0,

  discountAmount: 0,
  taxMasterId: "",
};

const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =========================================================
   EMPTY INVOICE FORM
========================================================= */

const emptyInvoice = {
  invoiceNumber: "",
  invoiceType: "",

  customerId: "",
  customerName: "",

  salesPersonId: "",
  salesPersonName: "",

  currencyId: "",
  currencyName: "",
  exchangeRate: "",

  invoiceDate: getTodayDate(),
  dueDate: "",

  subtotal: 0,
  discountAmount: 0,
  taxAmount: 0,
  shippingAmount: 0,
  grandTotal: 0,

  invoiceStatus: "DRAFT",

  notes: "",
  termsAndConditions: "",

  invoiceItems: [],

  editingField: null,
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  /*
   * Invoice listing
   */
  invoices: [],

  /*
   * Invoice create/edit form
   */
  invoice: {
    ...emptyInvoice,
    invoiceItems: [],
  },

  selectedInvoice: structuredClone(emptyInvoice),
  /*
   * Invoice Number Settings
   */
  invoiceNumberSettings: {
    mode: "AUTO",
    prefix: "INV-2026-",
    nextNumber: "0000",
    restartFiscalYear: false,
  },

  invoiceDate: getTodayDate(),

  /*
   * Existing invoice
   */
  exsistingInvoice: null,

  // Full invoice returned by fetchInvoiceById
  previewInvoice: null,
  previewInvoiceId: null,
  previewLoading: false,
  previewError: null,

  // Activity
  activities: [],
  recentActivities: [],
  /*
   * Pagination
   */
  pagination: {
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },

  isDirty: false,

  /*
   * Request state
   */
  loading: false,
  success: false,
  error: null,
  message: "",
};

/* =========================================================
   HELPER
========================================================= */

const extractData = (payload) => {
  /*
   * Supports:
   *
   * {
   *   success: true,
   *   data: {...}
   * }
   *
   * and
   *
   * {
   *   data: {...}
   * }
   *
   * and already-unwrapped data.
   */

  return payload?.data ?? payload;
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

      state.previewInvoice = null;
      state.previewInvoiceId = null;
      state.previewLoading = false;
      state.previewError = null;
    },
    /* =====================================================
       CLEAR INVOICE REQUEST STATE
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
      state.invoice = {
        ...emptyInvoice,
        invoiceItems: [],
      };
    },

    /* =====================================================
   SET INVOICE NUMBER SETTING
===================================================== */

    setInvoiceNumberSetting: (state, action) => {
      const { field, value } = action.payload;

      state.invoiceNumberSettings[field] = value;
    },

    /* =====================================================
   SET ALL INVOICE NUMBER SETTINGS
===================================================== */

    setInvoiceNumberSettings: (state, action) => {
      state.invoiceNumberSettings = {
        ...state.invoiceNumberSettings,
        ...(action.payload || {}),
      };
    },

    /* =====================================================
   RESET INVOICE NUMBER SETTINGS
===================================================== */

    resetInvoiceNumberSettings: (state) => {
      state.invoiceNumberSettings = {
        mode: "AUTO",
        prefix: "INV-",
        nextNumber: "000007",
        restartFiscalYear: false,
      };
    },

    /* =====================================================
       RESET INVOICE FORM
    ===================================================== */

    resetInvoiceForm: (state) => {
      state.invoice = {
        ...emptyInvoice,
        invoiceItems: [],
        invoiceDate: getTodayDate(),
      };

      state.exsistingInvoice = null;
      state.error = null;
      state.success = false;
      state.message = "";
    },

    /* =====================================================
       SET INVOICE FORM FIELD
    ===================================================== */

    setInvoiceField: (state, action) => {
      const { field, value } = action.payload;

      if (!state.invoice) {
        state.invoice = {
          ...emptyInvoice,
          invoiceItems: [],
        };
      }

      state.invoice[field] = value;
    },

    updateSelectedInvoiceField: (state, action) => {
      const { field, value } = action.payload;

      if (state.selectedInvoice) {
        state.selectedInvoice[field] = value;
      }
    },

    setEditingField: (state, action) => {
      state.editingField = action.payload;
    },

    /* =====================================================
       SET ALL INVOICE ITEMS
    ===================================================== */

    setInvoiceItems: (state, action) => {
      state.invoice.invoiceItems = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    /* =====================================================
       SET INVOICE ITEM FIELD
    ===================================================== */

    setInvoiceItemField: (state, action) => {
      const { index, field, value } = action.payload;

      if (!Array.isArray(state.invoice.invoiceItems)) {
        state.invoice.invoiceItems = [];
      }

      if (index < 0 || index >= state.invoice.invoiceItems.length) {
        return;
      }

      state.invoice.invoiceItems[index][field] = value;
    },

    setInvoiceDirty: (state, action) => {
      state.isDirty = action.payload;
    },

    /* =====================================================
       ADD INVOICE ITEM
    ===================================================== */

    addInvoiceItem: (state, action) => {
      if (!Array.isArray(state.invoice.invoiceItems)) {
        state.invoice.invoiceItems = [];
      }

      state.invoice.invoiceItems.push(
        action.payload || {
          ...emptyInvoiceItem,
        },
      );
    },

    /* =====================================================
       REMOVE INVOICE ITEM
    ===================================================== */

    removeInvoiceItem: (state, action) => {
      const index = action.payload;

      if (!Array.isArray(state.invoice.invoiceItems)) {
        return;
      }

      if (index < 0 || index >= state.invoice.invoiceItems.length) {
        return;
      }

      state.invoice.invoiceItems.splice(index, 1);
    },

    setInvoiceTemplate: (state, action) => {
      console.log("Reducer called:", action.payload);

      state.invoiceTemplate = action.payload;
    },

    addRecentActivity: (state, action) => {
      console.log("addRecentActivity reducer", action.payload);

      state.recentActivities.unshift({
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...action.payload,
      });
    },

    clearActivities: (state) => {
      state.recentActivities = [];
    },

    setRecentActivities: (state, action) => {
      state.recentActivities = action.payload;
    },

    setActivities: (state, action) => {
      state.activities = action.payload;
    },

    addActivity: (state, action) => {
      state.activities.unshift(action.payload);
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
        state.success = false;
        state.error = null;
      })

      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        /*
         * Supports both:
         *
         * response.data.content
         *
         * and
         *
         * response.content
         */

        const data = response?.data ?? response ?? {};

        state.invoices = Array.isArray(data?.content) ? data.content : [];

        state.pagination = {
          pageNumber: data?.pageNumber ?? 0,
          pageSize: data?.pageSize ?? 20,
          totalElements: data?.totalElements ?? 0,
          totalPages: data?.totalPages ?? 0,
          last: data?.last ?? true,
        };

        state.message = response?.message || "";
      })

      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch invoices.";
      });

    /* =====================================================
   FETCH INVOICE BY ID
===================================================== */

    builder
      .addCase(fetchInvoiceById.pending, (state, action) => {
        const requestedId = action.meta.arg;
        const selectedId =
          state.exsistingInvoice?.id ?? state.exsistingInvoice?.invoiceId;

        // Ignore a request if a different invoice is currently selected.
        if (selectedId != null && String(selectedId) !== String(requestedId)) {
          return;
        }

        state.previewLoading = true;
        state.previewError = null;

        // Keep the shared loading state for existing components.
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        const requestedId = action.meta.arg;

        const selectedId =
          state.exsistingInvoice?.id ?? state.exsistingInvoice?.invoiceId;

        // Prevent a late response from replacing the newly selected invoice.
        if (selectedId != null && String(selectedId) !== String(requestedId)) {
          return;
        }

        const invoice = extractData(action.payload);

        // Validate that the API returned an invoice object.
        if (!invoice || typeof invoice !== "object") {
          state.previewInvoice = null;
          state.previewInvoiceId = null;
          state.previewLoading = false;
          state.previewError = "Invoice details were not found.";
          state.loading = false;
          return;
        }

        const loadedId = invoice.id ?? invoice.invoiceId;

        // Do not display a response for a different invoice.
        if (loadedId != null && String(loadedId) !== String(requestedId)) {
          state.previewLoading = false;
          state.previewError =
            "The returned invoice does not match the selection.";
          state.loading = false;
          return;
        }

        // Store the complete API response for the preview template.
        state.previewInvoice = invoice;
        state.previewInvoiceId = loadedId ?? requestedId;

        // Keep existing components compatible.
        state.invoice = invoice;
        state.exsistingInvoice = invoice;

        state.previewLoading = false;
        state.previewError = null;
        state.loading = false;
        state.error = null;
        state.success = true;
      })

      .addCase(fetchInvoiceById.rejected, (state, action) => {
        const requestedId = action.meta.arg;

        const selectedId =
          state.exsistingInvoice?.id ?? state.exsistingInvoice?.invoiceId;

        // Ignore errors belonging to an invoice that is no longer selected.
        if (selectedId != null && String(selectedId) !== String(requestedId)) {
          return;
        }

        state.previewLoading = false;
        state.previewError =
          action.payload ||
          action.error?.message ||
          "Failed to fetch invoice details.";

        state.loading = false;
        state.success = false;
        state.error = state.previewError;

        state.previewInvoice = null;
        state.previewInvoiceId = null;
      });

    /* =====================================================
   GENERATE INVOICE NUMBER
===================================================== */

    builder

      .addCase(fetchGeneratedInvoiceNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchGeneratedInvoiceNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const response = action.payload;

        const generatedInvoice = response?.data ?? response ?? {};

        state.invoice.invoiceNumber = generatedInvoice?.invoiceNumber || "";

        state.message = "Invoice number generated successfully.";
      })

      .addCase(fetchGeneratedInvoiceNumber.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to generate invoice number.";
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

        const response = action.payload;

        state.message = response?.message || "Invoice created successfully.";

        const newInvoice = extractData(response);

        /*
         * Add created invoice to listing.
         */
        if (newInvoice) {
          state.invoices.unshift(newInvoice);

          /*
           * Keep created invoice selected.
           */
          state.invoice = newInvoice;

          state.exsistingInvoice = newInvoice;
        }
      })

      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload ||
          action.error?.message ||
          "Something went wrong while creating invoice.";
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

        const response = action.payload;

        state.message = response?.message || "Invoice updated successfully.";

        const updatedInvoice = extractData(response);

        if (updatedInvoice) {
          const index = state.invoices.findIndex(
            (item) => item.id === updatedInvoice.id,
          );

          if (index !== -1) {
            state.invoices[index] = updatedInvoice;
          } else {
            state.invoices.unshift(updatedInvoice);
          }

          state.invoice = updatedInvoice;
          state.exsistingInvoice = updatedInvoice;
        }
      })

      .addCase(editInvoice.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload ||
          action.error?.message ||
          "Something went wrong while updating invoice.";
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

        const response = action.payload;

        state.message = response?.message || "Invoice deleted successfully.";

        /*
         * Supports:
         *
         * response.data.id
         * response.id
         */
        const deletedId = response?.data?.id || response?.id;

        if (deletedId) {
          state.invoices = state.invoices.filter(
            (item) => item.id !== deletedId,
          );
        }

        /*
         * Clear selected invoice.
         */
        if (state.invoice?.id === deletedId) {
          state.invoice = {
            ...emptyInvoice,
            invoiceItems: [],
          };

          state.exsistingInvoice = null;
        }
      })

      .addCase(removeInvoice.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload ||
          action.error?.message ||
          "Something went wrong while deleting invoice.";
      });
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

  setEditingField,
  updateSelectedInvoiceField,
  setInvoiceNumberSetting,
  setInvoiceNumberSettings,
  resetInvoiceNumberSettings,
  setInvoiceTemplate,

  setActivities,
  addActivity,

  addRecentActivity,
  setRecentActivities,
  clearActivities,
} = invoiceSlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default invoiceSlice.reducer;
