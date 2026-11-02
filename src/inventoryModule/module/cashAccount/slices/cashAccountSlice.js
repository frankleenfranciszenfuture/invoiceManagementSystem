import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllCashAccounts,
  fetchCashAccountById,
  createCashAccount,
  updateCashAccount,
  deleteCashAccount,
} from "../thunks/cashAccountThunks";

/* =========================================================
   EMPTY CASH ACCOUNT
========================================================= */

export const emptyCashAccount = {
  id: null,

  // Account details
  accountName: "",
  accountCode: "",

  // Currency
  currency: "INR",

  // Balance details
  openingBalance: 0,
  currentBalance: 0,

  // Additional details
  description: "",

  // Status
  status: "ACTIVE",

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
  cashAccounts: [],
  cashAccount: { ...emptyCashAccount },

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

const cashAccountSlice = createSlice({
  name: "cashAccount",
  initialState,

  reducers: {
    // Set existing cash account
    setExistingCashAccount: (state, action) => {
      state.cashAccount = {
        ...emptyCashAccount,
        ...action.payload,
        audit: {
          ...emptyCashAccount.audit,
          ...(action.payload?.audit ?? {}),
        },
      };
    },

    // Update cash account form field
    updateCashAccountField: (state, action) => {
      const { field, value } = action.payload;
      state.cashAccount[field] = value;
    },

    // Reset cash account form
    resetCashAccountForm: (state) => {
      state.cashAccount = { ...emptyCashAccount };
    },

    // Clear selected cash account
    clearSelectedCashAccount: (state) => {
      state.cashAccount = { ...emptyCashAccount };
    },

    // Clear cash account error
    clearCashAccountError: (state) => {
      state.error = null;
    },

    // Clear cash account success
    clearCashAccountSuccess: (state) => {
      state.success = false;
    },

    // Reset complete cash account state
    resetCashAccountState: () => ({
      ...initialState,
      cashAccount: { ...emptyCashAccount },
      cashAccounts: [],
      pagination: { ...initialState.pagination },
    }),
  },

  extraReducers: (builder) => {
    // =========================================
    // FETCH ALL CASH ACCOUNTS
    // =========================================

    builder
      .addCase(fetchAllCashAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllCashAccounts.fulfilled, (state, action) => {
        state.loading = false;

        const response = action.payload?.data ?? {};

        const cashAccountList = Array.isArray(response)
          ? response
          : Array.isArray(response.content)
            ? response.content
            : [];

        state.cashAccounts = cashAccountList;

        state.pagination = {
          pageNumber: response.pageNumber ?? 0,
          pageSize: response.pageSize ?? 10,
          totalElements: response.totalElements ?? cashAccountList.length,
          totalPages: response.totalPages ?? 1,
          last: response.last ?? true,
        };

        state.error = null;
      })

      .addCase(fetchAllCashAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // FETCH CASH ACCOUNT BY ID
    // =========================================

    builder
      .addCase(fetchCashAccountById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchCashAccountById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const fetchedCashAccount = action.payload?.data ?? {};

        state.cashAccount = {
          ...emptyCashAccount,
          ...fetchedCashAccount,
          audit: {
            ...emptyCashAccount.audit,
            ...(fetchedCashAccount.audit ?? {}),
          },
        };

        state.error = null;
      })

      .addCase(fetchCashAccountById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // CREATE CASH ACCOUNT
    // =========================================

    builder
      .addCase(createCashAccount.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createCashAccount.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;

        const createdCashAccount = action.payload?.data ?? null;

        if (createdCashAccount?.id) {
          state.cashAccounts.unshift(createdCashAccount);
          state.pagination.totalElements += 1;
        }

        state.cashAccount = { ...emptyCashAccount };
        state.error = null;
      })

      .addCase(createCashAccount.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // UPDATE CASH ACCOUNT
    // =========================================

    builder
      .addCase(updateCashAccount.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateCashAccount.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;

        const updatedCashAccount = action.payload?.data ?? null;

        if (updatedCashAccount?.id) {
          state.cashAccounts = state.cashAccounts.map((item) =>
            item.id === updatedCashAccount.id ? updatedCashAccount : item,
          );

          if (state.cashAccount.id === updatedCashAccount.id) {
            state.cashAccount = {
              ...emptyCashAccount,
              ...updatedCashAccount,
              audit: {
                ...emptyCashAccount.audit,
                ...(updatedCashAccount.audit ?? {}),
              },
            };
          }
        }

        state.error = null;
      })

      .addCase(updateCashAccount.rejected, (state, action) => {
        state.actionLoading = false;
        state.success = false;
        state.error = action.payload ?? action.error.message;
      });

    // =========================================
    // DELETE CASH ACCOUNT
    // =========================================

    builder
      .addCase(deleteCashAccount.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(deleteCashAccount.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;

        const deletedId = action.payload?.id;

        if (deletedId) {
          state.cashAccounts = state.cashAccounts.filter(
            (item) => item.id !== deletedId,
          );
        }

        if (state.cashAccount.id === deletedId) {
          state.cashAccount = { ...emptyCashAccount };
        }

        state.error = null;
      })

      .addCase(deleteCashAccount.rejected, (state, action) => {
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
  setExistingCashAccount,
  updateCashAccountField,
  resetCashAccountForm,
  clearSelectedCashAccount,
  clearCashAccountError,
  clearCashAccountSuccess,
  resetCashAccountState,
} = cashAccountSlice.actions;

export default cashAccountSlice.reducer;
