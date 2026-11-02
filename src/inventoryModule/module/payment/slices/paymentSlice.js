import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllPayments,
  fetchPaymentById,
  createPayment,
  fetchPaymentsBySource,
  reversePayment,
} from "../thunks/paymentThunks";

/* =========================================================
   EMPTY PAYMENT
========================================================= */

export const emptyPayment = {
  id: null,

  // Payment details
  paymentNumber: "",
  paymentType: "SALES",
  paymentDirection: "RECEIVED",

  // Source document
  sourceId: null,
  sourceNumber: "",

  // Payment date
  paymentDate: "",

  // Amount details
  paymentAmount: 0,
  baseAmount: 0,
  exchangeRate: 1,

  // Currency
  currencyId: null,
  currencyCode: "",
  currencyName: "",

  // Payment method
  paymentMethod: "BANK_TRANSFER",

  // Bank account
  bankAccountId: null,
  bankAccountName: "",

  // Cash account
  cashAccountId: null,
  cashAccountName: "",

  // Customer
  customerId: null,
  customerName: "",

  // Party / Supplier
  partyId: null,
  partyName: "",

  // Additional details
  referenceNumber: "",
  notes: "",

  // Status
  paymentStatus: "COMPLETED",

  // Reversal details
  reversalReason: "",

  // Audit
  audit: {
    createdAt: null,
    updatedAt: null,
    createdBy: null,
    updatedBy: null,
    active: true,
  },

  active: true,
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  payments: [],
  payment: { ...emptyPayment },

  sourcePayments: [],

  loading: false,
  actionLoading: false,
  error: null,
  success: false,

  pagination: {
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },
};

/* =========================================================
   SLICE
========================================================= */

const paymentSlice = createSlice({
  name: "payment",
  initialState,

  reducers: {
    // Set existing payment
    setExistingPayment: (state, action) => {
      state.payment = {
        ...emptyPayment,
        ...action.payload,
        audit: {
          ...emptyPayment.audit,
          ...(action.payload?.audit ?? {}),
        },
      };
    },

    // Update payment form field
    updatePaymentField: (state, action) => {
      const { field, value } = action.payload;
      state.payment[field] = value;
    },

    // Reset payment form
    resetPaymentForm: (state) => {
      state.payment = { ...emptyPayment };
    },

    // Clear selected payment
    clearSelectedPayment: (state) => {
      state.payment = { ...emptyPayment };
    },

    // Clear payment error
    clearPaymentError: (state) => {
      state.error = null;
    },

    // Clear payment success
    clearPaymentSuccess: (state) => {
      state.success = false;
    },

    // Reset complete payment state
    resetPaymentState: () => ({
      ...initialState,
      payment: { ...emptyPayment },
      payments: [],
      sourcePayments: [],
      pagination: { ...initialState.pagination },
    }),
  },

  extraReducers: (builder) => {
    // =========================================
    // FETCH ALL PAYMENTS
    // =========================================

    builder
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.loading = false;

        const response = action.payload?.data ?? {};

        const paymentList = Array.isArray(response)
          ? response
          : Array.isArray(response.content)
            ? response.content
            : [];

        state.payments = paymentList;

        state.pagination = {
          pageNumber: response.pageNumber ?? 0,
          pageSize: response.pageSize ?? 10,
          totalElements: response.totalElements ?? paymentList.length,
          totalPages: response.totalPages ?? 1,
          last: response.last ?? true,
        };

        state.error = null;
      })

      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // FETCH PAYMENT BY ID
    // =========================================

    builder
      .addCase(fetchPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const fetchedPayment = action.payload?.data ?? {};

        state.payment = {
          ...emptyPayment,
          ...fetchedPayment,
          audit: {
            ...emptyPayment.audit,
            ...(fetchedPayment.audit ?? {}),
          },
        };

        state.error = null;
      })

      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // CREATE PAYMENT
    // =========================================

    builder
      .addCase(createPayment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createPayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;

        const createdPayment = action.payload?.data ?? null;

        if (createdPayment?.id) {
          state.payments.unshift(createdPayment);
          state.pagination.totalElements += 1;
        }

        state.payment = { ...emptyPayment };
        state.error = null;
      })

      .addCase(createPayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // FETCH PAYMENTS BY SOURCE
    // =========================================

    builder
      .addCase(fetchPaymentsBySource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPaymentsBySource.fulfilled, (state, action) => {
        state.loading = false;

        const response = action.payload?.data ?? [];

        state.sourcePayments = Array.isArray(response)
          ? response
          : Array.isArray(response.content)
            ? response.content
            : [];

        state.error = null;
      })

      .addCase(fetchPaymentsBySource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // REVERSE PAYMENT
    // =========================================

    builder
      .addCase(reversePayment.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(reversePayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;

        const reversedPayment = action.payload?.data ?? null;

        if (reversedPayment?.id) {
          state.payments = state.payments.map((item) =>
            item.id === reversedPayment.id ? reversedPayment : item,
          );

          state.sourcePayments = state.sourcePayments.map((item) =>
            item.id === reversedPayment.id ? reversedPayment : item,
          );

          if (state.payment.id === reversedPayment.id) {
            state.payment = {
              ...emptyPayment,
              ...reversedPayment,
              audit: {
                ...emptyPayment.audit,
                ...(reversedPayment.audit ?? {}),
              },
            };
          }
        }

        state.error = null;
      })

      .addCase(reversePayment.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? action.error.message;
      });
  },
});

/* =========================================================
   EXPORT ACTIONS
========================================================= */

export const {
  setExistingPayment,
  updatePaymentField,
  resetPaymentForm,
  clearSelectedPayment,
  clearPaymentError,
  clearPaymentSuccess,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;
