import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllCurrencies,
  fetchCurrencyById,
  createCurrency,
  updateCurrency,
  deleteCurrency,
} from "../thunks/currencyThunks";

/* =========================================================
   EMPTY CURRENCY FORM
   ========================================================= */

const emptyCurrency = {
  id: null,
  code: "",
  name: "",
  symbol: "",
  decimalPlaces: "",
  status: "ACTIVE",
  active: true,
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  currencies: [],

  // Keep form initialized instead of null
  currency: {
    ...emptyCurrency,
  },

  existingCurrency: null,

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

  selectedCurrencyView: null,

  currencyStatus: "ACTIVE",
};

/* =========================================================
   SLICE
   ========================================================= */

const currencySlice = createSlice({
  name: "currency",

  initialState,

  reducers: {
    /* =====================================================
       SET EXISTING SALESPERSON
       ===================================================== */

    setExistingCurrency: (state, action) => {
      state.existingCurrency = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    /* =====================================================
       CLEAR CURRENCY STATE
       ===================================================== */

    clearCurrencyState: (state) => {
      state.currencies = [];

      state.currency = {
        ...emptyCurrency,
      };

      state.existingCurrency = null;

      state.pagination = {
        pageNumber: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };

      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";

      state.selectedCurrencyView = null;
      state.currencyStatus = "ACTIVE";
    },

    /* =====================================================
       CLEAR SELECTED CURRENCY
       ===================================================== */

    clearSelectedCurrency: (state) => {
      state.currency = {
        ...emptyCurrency,
      };

      state.existingCurrency = null;
    },

    /* =====================================================
       RESET CURRENCY FORM
       ===================================================== */

    resetCurrencyForm: (state) => {
      state.currency = {
        ...emptyCurrency,
      };

      state.existingCurrency = null;
    },

    /* =====================================================
       SET CURRENCY FORM FIELD
       ===================================================== */

    setCurrencyField: (state, action) => {
      const { field, value } = action.payload;

      state.currency = {
        ...(state.currency || emptyCurrency),
        [field]: value,
      };
    },

    /* =====================================================
       SET SELECTED CURRENCY VIEW
       ===================================================== */

    setSelectedCurrencyView: (state, action) => {
      state.selectedCurrencyView = action.payload;
    },

    /* =====================================================
       SET CURRENCY STATUS
       ===================================================== */

    setCurrencyStatus: (state, action) => {
      state.currencyStatus = action.payload;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL CURRENCIES
       ===================================================== */

    builder

      .addCase(fetchAllCurrencies.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchAllCurrencies.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;
        const data = response?.data;

        state.currencies = data?.content || [];

        state.pagination = {
          pageNumber: data?.pageNumber ?? 0,
          pageSize: data?.pageSize ?? 20,
          totalElements: data?.totalElements ?? 0,
          totalPages: data?.totalPages ?? 0,
          last: data?.last ?? true,
        };

        state.message = response?.message || "";
      })

      .addCase(fetchAllCurrencies.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch currencies.";

        state.message = "";
      });

    /* =====================================================
       FETCH CURRENCY BY ID
       ===================================================== */

    builder

      .addCase(fetchCurrencyById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchCurrencyById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.currency = action.payload?.data ||
          action.payload || {
            ...emptyCurrency,
          };

        state.message = action.payload?.message || "";
      })

      .addCase(fetchCurrencyById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch currency.";

        state.message = "";
      });

    /* =====================================================
       CREATE CURRENCY
       ===================================================== */

    builder

      .addCase(createCurrency.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Currency created successfully.";

        const newCurrency = action.payload?.data;

        if (newCurrency) {
          state.currency = newCurrency;

          state.existingCurrency = newCurrency;

          state.currencies.push(newCurrency);

          state.pagination.totalElements += 1;
        }
      })

      .addCase(createCurrency.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while creating currency.";

        state.message = "";
      });

    /* =====================================================
       UPDATE CURRENCY
       ===================================================== */

    builder

      .addCase(updateCurrency.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Currency updated successfully.";

        const updatedCurrency = action.payload?.data;

        if (updatedCurrency) {
          state.currency = updatedCurrency;

          state.existingCurrency = updatedCurrency;

          const index = state.currencies.findIndex(
            (item) => item.id === updatedCurrency.id,
          );

          if (index !== -1) {
            state.currencies[index] = updatedCurrency;
          }
        }
      })

      .addCase(updateCurrency.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating currency.";

        state.message = "";
      });

    /* =====================================================
       DELETE CURRENCY
       ===================================================== */

    builder

      .addCase(deleteCurrency.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Currency deleted successfully.";

        /*
         * Thunk receives ID directly.
         * action.meta.arg contains deleted ID.
         */

        const deletedId = action.meta.arg;

        state.currencies = state.currencies.filter(
          (item) => item.id !== deletedId,
        );

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        if (state.currency?.id === deletedId) {
          state.currency = {
            ...emptyCurrency,
          };
        }

        if (state.existingCurrency?.id === deletedId) {
          state.existingCurrency = null;
        }
      })

      .addCase(deleteCurrency.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while deleting currency.";

        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  selectedCurrencyView,
  setExistingCurrency,
  clearError,
  clearCurrencyState,
  clearSelectedCurrency,
  resetCurrencyForm,
  setCurrencyField,
  setSelectedCurrencyView,
  setCurrencyStatus,
} = currencySlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default currencySlice.reducer;
