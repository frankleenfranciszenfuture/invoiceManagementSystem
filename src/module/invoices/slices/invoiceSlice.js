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

  bankAccountId: "",
  bankName: "",
  branchName: "",
  ifsc: "",
  swiftCode: "",

  emailSignatureId: "",
  signatureName: "",

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

  // Selected invoice template
  invoiceTemplate: "InvoiceTemplate1",
  selectedTemplateInvoiceId: null,

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

  createdCategorySelection: null,
  createdSubCategorySelection: null,
  createdTaxMasterSelection: null,
  createdSizeSelection: null,

  // Full invoice returned by fetchInvoiceById
  previewInvoice: null,
  previewInvoiceId: null,
  previewLoading: false,
  previewError: null,
  previewRequestId: null,

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

  invoiceTemplate: "InvoiceTemplate1",
  selectedTemplateInvoiceId: null,

  reducers: {
    /* =====================================================
       SET EXISTING INVOICE
    ===================================================== */

    setExistingInvoice: (state, action) => {
      const newInvoice = action.payload;

      const newId = newInvoice?.id ?? newInvoice?.invoiceId;
      const currentId =
        state.exsistingInvoice?.id ?? state.exsistingInvoice?.invoiceId;

      state.exsistingInvoice = newInvoice;

      // Clear old details only when selecting another invoice.
      if (String(newId) !== String(currentId)) {
        state.previewInvoice = null;
        state.previewInvoiceId = null;
        state.previewLoading = false;
        state.previewError = null;
        state.previewRequestId = null;
      }
    },

    /* =====================================================
   SET INVOICE FOR EDIT
===================================================== */

    setInvoiceForEdit: (state, action) => {
      const existingInvoice = action.payload;

      if (!existingInvoice) return;

      state.invoice = {
        ...emptyInvoice,
        ...existingInvoice,

        // Preserve existing invoice items.
        invoiceItems: Array.isArray(existingInvoice.invoiceItems)
          ? existingInvoice.invoiceItems.map((item) => ({
              ...item,
            }))
          : [],

        // Preserve invoice dates and values.
        invoiceDate: existingInvoice.invoiceDate || getTodayDate(),

        dueDate: existingInvoice.dueDate || "",

        invoiceStatus:
          existingInvoice.invoiceStatus || existingInvoice.status || "DRAFT",
      };

      state.exsistingInvoice = existingInvoice;

      state.isDirty = false;
      state.error = null;
      state.success = false;
      state.message = "";
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
      const { templateId, invoiceId } = action.payload;

      if (!templateId) return;

      state.invoiceTemplate = templateId;
      state.selectedTemplateInvoiceId = invoiceId ?? null;

      // Update complete preview invoice
      if (
        state.previewInvoice &&
        String(state.previewInvoice.id ?? state.previewInvoice.invoiceId) ===
          String(invoiceId)
      ) {
        state.previewInvoice.invoiceTemplate = templateId;
      }

      // Update existing invoice
      if (
        state.exsistingInvoice &&
        String(
          state.exsistingInvoice.id ?? state.exsistingInvoice.invoiceId,
        ) === String(invoiceId)
      ) {
        state.exsistingInvoice.invoiceTemplate = templateId;
      }

      // Update invoice listing
      const invoiceIndex = state.invoices.findIndex(
        (item) => String(item.id ?? item.invoiceId) === String(invoiceId),
      );

      if (invoiceIndex !== -1) {
        state.invoices[invoiceIndex].invoiceTemplate = templateId;
      }
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

    setCreatedCategorySelection: (state, action) => {
      state.createdCategorySelection = action.payload;
    },

    clearCreatedCategorySelection: (state) => {
      state.createdCategorySelection = null;
    },

    setCreatedSubCategorySelection: (state, action) => {
      state.createdSubCategorySelection = action.payload;
    },

    clearCreatedSubCategorySelection: (state) => {
      state.createdSubCategorySelection = null;
    },

    setCreatedTaxMasterSelection: (state, action) => {
      state.createdTaxMasterSelection = action.payload;
    },

    clearCreatedTaxMasterSelection: (state) => {
      state.createdTaxMasterSelection = null;
    },

    setCreatedSizeSelection: (state, action) => {
      state.createdSizeSelection = action.payload;
    },

    clearCreatedSizeSelection: (state) => {
      state.createdSizeSelection = null;
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
        state.previewLoading = true;
        state.previewError = null;
        state.previewRequestId = action.meta.requestId;
      })

      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        if (state.previewRequestId !== action.meta.requestId) return;

        const response = action.payload?.data ?? action.payload;

        state.previewInvoice = response;
        state.previewInvoiceId = response?.id ?? response?.invoiceId ?? null;

        state.exsistingInvoice = response;

        state.previewLoading = false;
        state.previewError = null;
        state.previewRequestId = null;
      })

      .addCase(fetchInvoiceById.rejected, (state, action) => {
        if (state.previewRequestId !== action.meta.requestId) return;

        state.previewLoading = false;
        state.previewError =
          action.payload?.message ??
          action.payload ??
          action.error?.message ??
          "Failed to load invoice details.";

        state.previewRequestId = null;
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
  setInvoiceForEdit,
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

  setCreatedCategorySelection,
  clearCreatedCategorySelection,
  setCreatedSubCategorySelection,
  clearCreatedSubCategorySelection,
  setCreatedTaxMasterSelection,
  clearCreatedTaxMasterSelection,
  setCreatedSizeSelection,
  clearCreatedSizeSelection,
} = invoiceSlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default invoiceSlice.reducer;
