import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllBankAccounts,
  fetchBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  reactivateBankAccount,
  fetchBankAccountsByStatus,
} from "../thunks/bankAccountThunks";

/* =========================================================
   EMPTY BANK ACCOUNT FORM
========================================================= */

const emptyBankAccount = {
  id: null,

  accountType: "",
  accountName: "",
  accountCode: "",
  currency: "INR",

  accountNumber: "",
  bankName: "",
  ifsc: "",

  userIds: [],

  description: "",

  primaryAccount: false,

  status: "ACTIVE",

  active: true,
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  bankAccounts: [],

  // Pagination
  pageNumber: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,
  last: true,

  // Form
  bankAccount: {
    ...emptyBankAccount,
  },

  exsistingBankAccount: null,

  loading: false,

  success: false,

  error: null,

  message: "",

  selectedBankAccountView: null,

  bankAccountStatus: "ACTIVE",
};

/* =========================================================
   SLICE
========================================================= */

const bankAccountSlice = createSlice({
  name: "bankAccount",

  initialState,

  reducers: {
    /* =====================================================
           SET EXISTING BANK ACCOUNT
        ===================================================== */

    setExsistingBankAccount: (state, action) => {
      state.exsistingBankAccount = action.payload;
    },

    /* =====================================================
           CLEAR BANK ACCOUNT STATE
        ===================================================== */

    clearBankAccountState: (state) => {
      state.bankAccounts = [];

      state.pageNumber = 0;
      state.pageSize = 10;
      state.totalElements = 0;
      state.totalPages = 0;
      state.last = true;

      state.bankAccount = {
        ...emptyBankAccount,
      };

      state.exsistingBankAccount = null;

      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";

      state.selectedBankAccountView = null;

      state.bankAccountStatus = "ACTIVE";
    },

    /* =====================================================
           CLEAR SELECTED BANK ACCOUNT
        ===================================================== */

    clearSelectedBankAccount: (state) => {
      state.bankAccount = {
        ...emptyBankAccount,
      };

      state.exsistingBankAccount = null;
    },

    /* =====================================================
           RESET BANK ACCOUNT FORM
        ===================================================== */

    resetBankAccountForm: (state) => {
      state.bankAccount = {
        ...emptyBankAccount,
      };

      state.exsistingBankAccount = null;
    },

    /* =====================================================
           SET BANK ACCOUNT FORM FIELD
        ===================================================== */

    setBankAccountField: (state, action) => {
      const { field, value } = action.payload;

      state.bankAccount = {
        ...(state.bankAccount || emptyBankAccount),

        [field]: value,
      };
    },

    /* =====================================================
           SET SELECTED BANK ACCOUNT VIEW
        ===================================================== */

    setSelectedBankAccountView: (state, action) => {
      state.selectedBankAccountView = action.payload;
    },

    /* =====================================================
           SET BANK ACCOUNT STATUS
        ===================================================== */

    setBankAccountStatus: (state, action) => {
      state.bankAccountStatus = action.payload;
    },
  },

  /* =======================================================
       EXTRA REDUCERS
    ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
           FETCH ALL BANK ACCOUNTS
        ===================================================== */

    builder

      .addCase(fetchAllBankAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchAllBankAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        const data = response?.data;

        /*
         * BANK ACCOUNT API RETURNS:
         *
         * {
         *   success: true,
         *   message: "...",
         *   data: {
         *      content: [],
         *      pageNumber: 0,
         *      pageSize: 10,
         *      totalElements: 2,
         *      totalPages: 1,
         *      last: true
         *   }
         * }
         */

        if (data && Array.isArray(data.content)) {
          state.bankAccounts = data.content;

          state.pageNumber = data.pageNumber ?? 0;

          state.pageSize = data.pageSize ?? 10;

          state.totalElements = data.totalElements ?? 0;

          state.totalPages = data.totalPages ?? 0;

          state.last = data.last ?? true;
        } else {
          state.bankAccounts = [];

          state.pageNumber = 0;
          state.pageSize = 10;
          state.totalElements = 0;
          state.totalPages = 0;
          state.last = true;
        }

        state.message = response?.message || "";
      })

      .addCase(fetchAllBankAccounts.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch bank accounts.";

        state.message = "";
      });

    /* =====================================================
           FETCH BANK ACCOUNT BY ID
        ===================================================== */

    builder

      .addCase(fetchBankAccountById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchBankAccountById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.bankAccount = action.payload?.data ||
          action.payload || {
            ...emptyBankAccount,
          };

        state.exsistingBankAccount = state.bankAccount;

        state.message = action.payload?.message || "";
      })

      .addCase(fetchBankAccountById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch bank account.";

        state.message = "";
      });

    /* =====================================================
           CREATE BANK ACCOUNT
        ===================================================== */

    builder

      .addCase(createBankAccount.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Bank account created successfully.";

        const newBankAccount = action.payload?.data;

        if (newBankAccount) {
          state.bankAccount = newBankAccount;

          state.exsistingBankAccount = newBankAccount;

          /*
           * Add newly created bank account
           * to existing list
           */

          const exists = state.bankAccounts.some(
            (item) => item.id === newBankAccount.id,
          );

          if (!exists) {
            state.bankAccounts.push(newBankAccount);

            state.totalElements += 1;
          }
        }
      })

      .addCase(createBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while creating bank account.";

        state.message = "";
      });

    /* =====================================================
           UPDATE BANK ACCOUNT
        ===================================================== */

    builder

      .addCase(updateBankAccount.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Bank account updated successfully.";

        const updatedBankAccount = action.payload?.data;

        if (updatedBankAccount) {
          state.bankAccount = updatedBankAccount;

          state.exsistingBankAccount = updatedBankAccount;

          const index = state.bankAccounts.findIndex(
            (item) => item.id === updatedBankAccount.id,
          );

          if (index !== -1) {
            state.bankAccounts[index] = updatedBankAccount;
          }
        }
      })

      .addCase(updateBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating bank account.";

        state.message = "";
      });

    /* =====================================================
           DELETE BANK ACCOUNT
        ===================================================== */

    builder

      .addCase(deleteBankAccount.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Bank account deleted successfully.";

        /*
         * Thunk receives ID directly
         */

        const deletedId = action.meta.arg;

        state.bankAccounts = state.bankAccounts.filter(
          (item) => item.id !== deletedId,
        );

        state.totalElements = Math.max(0, state.totalElements - 1);

        if (state.bankAccount?.id === deletedId) {
          state.bankAccount = {
            ...emptyBankAccount,
          };
        }

        if (state.exsistingBankAccount?.id === deletedId) {
          state.exsistingBankAccount = null;
        }
      })

      .addCase(deleteBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while deleting bank account.";

        state.message = "";
      });

    /* =====================================================
           REACTIVATE BANK ACCOUNT
        ===================================================== */

    builder

      .addCase(reactivateBankAccount.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(reactivateBankAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Bank account reactivated successfully.";

        const id = action.meta.arg;

        const index = state.bankAccounts.findIndex((item) => item.id === id);

        if (index !== -1) {
          state.bankAccounts[index].status = "ACTIVE";

          state.bankAccounts[index].active = true;
        }

        if (state.bankAccount?.id === id) {
          state.bankAccount.status = "ACTIVE";

          state.bankAccount.active = true;
        }

        if (state.exsistingBankAccount?.id === id) {
          state.exsistingBankAccount.status = "ACTIVE";

          state.exsistingBankAccount.active = true;
        }

        state.bankAccountStatus = "ACTIVE";
      })

      .addCase(reactivateBankAccount.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload ||
          "Something went wrong while reactivating bank account.";

        state.message = "";
      });

    /* =====================================================
           FETCH BANK ACCOUNTS BY STATUS
        ===================================================== */

    builder

      .addCase(fetchBankAccountsByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchBankAccountsByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        const data = response?.data;

        /*
         * Same paginated response:
         *
         * data.content
         */

        if (data && Array.isArray(data.content)) {
          state.bankAccounts = data.content;

          state.pageNumber = data.pageNumber ?? 0;

          state.pageSize = data.pageSize ?? 10;

          state.totalElements = data.totalElements ?? 0;

          state.totalPages = data.totalPages ?? 0;

          state.last = data.last ?? true;
        } else {
          state.bankAccounts = [];
        }

        state.bankAccountStatus = action.meta.arg;

        state.message = response?.message || "";
      })

      .addCase(fetchBankAccountsByStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Failed to fetch bank accounts by status.";

        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  setExsistingBankAccount,

  clearBankAccountState,

  clearSelectedBankAccount,

  resetBankAccountForm,

  setBankAccountField,

  setSelectedBankAccountView,

  setBankAccountStatus,
} = bankAccountSlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default bankAccountSlice.reducer;
