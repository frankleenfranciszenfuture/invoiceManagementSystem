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

  paymentNumber: "",
  paymentType: "SALES",
  paymentDirection: "RECEIVED",

  sourceId: null,
  sourceNumber: "",

  paymentDate: "",

  paymentAmount: 0,
  baseAmount: 0,
  exchangeRate: 1,

  currencyId: null,
  currencyCode: "",
  currencyName: "",

  paymentMethod: "BANK_TRANSFER",

  bankAccountId: null,
  bankAccountName: "",

  cashAccountId: null,
  cashAccountName: "",

  customerId: null,
  customerName: "",

  partyId: null,
  partyName: "",

  referenceNumber: "",
  notes: "",

  paymentStatus: "COMPLETED",

  reversalReason: "",

  // Split payment response
  allocations: [],
  totalAllocatedAmount: 0,
  allocationCount: 0,

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

  // Latest create payment response
  createdPayment: null,

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
   HELPERS
========================================================= */

const normalizePayment = (payment) => ({
  ...emptyPayment,
  ...payment,
  audit: {
    ...emptyPayment.audit,
    ...(payment?.audit ?? {}),
  },
});

const getCreatedPayments = (response) => {
  if (!response) return [];

  // Split payment response
  if (Array.isArray(response.allocations) && response.allocations.length > 0) {
    return response.allocations;
  }

  // Normal payment response
  if (response.id) {
    return [response];
  }

  return [];
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
      state.payment = normalizePayment(action.payload);
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

    // Clear latest created payment response
    clearCreatedPayment: (state) => {
      state.createdPayment = null;
    },

    // Reset complete payment state
    resetPaymentState: () => ({
      ...initialState,
      payment: { ...emptyPayment },
      payments: [],
      sourcePayments: [],
      createdPayment: null,
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

        state.payment = normalizePayment(fetchedPayment);

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
        state.createdPayment = null;
      })

      .addCase(createPayment.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;

        const response = action.payload?.data ?? null;

        state.createdPayment = response;

        const createdPayments = getCreatedPayments(response);

        if (createdPayments.length > 0) {
          const normalizedPayments = createdPayments.map(normalizePayment);

          // Add individual payments, not the summary object.
          const existingIds = new Set(state.payments.map((item) => item.id));

          const newPayments = normalizedPayments.filter(
            (item) => !existingIds.has(item.id),
          );

          state.payments = [...newPayments, ...state.payments];

          state.pagination.totalElements += newPayments.length;

          // Update source payments with individual allocations.
          const existingSourceIds = new Set(
            state.sourcePayments.map((item) => item.id),
          );

          const newSourcePayments = normalizedPayments.filter(
            (item) => !existingSourceIds.has(item.id),
          );

          state.sourcePayments = [
            ...newSourcePayments,
            ...state.sourcePayments,
          ];
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
            item.id === reversedPayment.id
              ? normalizePayment(reversedPayment)
              : item,
          );

          state.sourcePayments = state.sourcePayments.map((item) =>
            item.id === reversedPayment.id
              ? normalizePayment(reversedPayment)
              : item,
          );

          if (state.payment.id === reversedPayment.id) {
            state.payment = normalizePayment(reversedPayment);
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
  clearCreatedPayment,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;
