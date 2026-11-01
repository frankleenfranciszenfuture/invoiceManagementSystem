import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllExpenseCategories,
  fetchExpenseCategoryById,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} from "../thunks/expenseCategoryThunks";

/* =========================================================
   EMPTY EXPENSE CATEGORY
========================================================= */

export const emptyExpenseCategory = {
  id: null,

  categoryName: "",
  expenseType: "INTERNAL",

  description: "",

  status: "ACTIVE",
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  expenseCategories: [],

  expenseCategory: null,

  existingExpenseCategory: emptyExpenseCategory,

  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },

  loading: false,

  actionLoading: false,

  error: null,

  success: false,
};

/* =========================================================
   RESPONSE HELPER
========================================================= */

const getResponseData = (response) => {
  return response?.data ?? response;
};

/* =========================================================
   SLICE
========================================================= */

const expenseCategorySlice = createSlice({
  name: "expenseCategory",

  initialState,

  reducers: {
    /* -----------------------------------------------
           SET EXISTING CATEGORY
        ----------------------------------------------- */

    setExistingExpenseCategory(state, action) {
      state.existingExpenseCategory = {
        ...emptyExpenseCategory,
        ...action.payload,
      };
    },

    /* -----------------------------------------------
           RESET CATEGORY FORM
        ----------------------------------------------- */

    resetExpenseCategoryForm(state) {
      state.existingExpenseCategory = {
        ...emptyExpenseCategory,
      };
    },

    /* -----------------------------------------------
           RESET CATEGORY STATE
        ----------------------------------------------- */

    resetExpenseCategoryState(state) {
      state.expenseCategories = [];
      state.expenseCategory = null;

      state.existingExpenseCategory = {
        ...emptyExpenseCategory,
      };

      state.pagination = {
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };

      state.loading = false;
      state.actionLoading = false;
      state.error = null;
      state.success = false;
    },

    /* -----------------------------------------------
           CLEAR ERROR
        ----------------------------------------------- */

    clearExpenseCategoryError(state) {
      state.error = null;
    },

    /* -----------------------------------------------
           CLEAR SUCCESS
        ----------------------------------------------- */

    clearExpenseCategorySuccess(state) {
      state.success = false;
    },
  },

  extraReducers: (builder) => {
    /* =================================================
           FETCH ALL EXPENSE CATEGORIES
        ================================================= */

    builder

      .addCase(fetchAllExpenseCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllExpenseCategories.fulfilled, (state, action) => {
        state.loading = false;

        const pageData = getResponseData(action.payload);

        state.expenseCategories = pageData?.content ?? [];

        state.pagination = {
          page: pageData?.number ?? 0,
          size: pageData?.size ?? 10,
          totalElements: pageData?.totalElements ?? 0,
          totalPages: pageData?.totalPages ?? 0,
          last: pageData?.last ?? true,
        };
      })

      .addCase(fetchAllExpenseCategories.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch expense categories";
      });

    /* =================================================
           FETCH EXPENSE CATEGORY BY ID
        ================================================= */

    builder

      .addCase(fetchExpenseCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchExpenseCategoryById.fulfilled, (state, action) => {
        state.loading = false;

        const category = getResponseData(action.payload);

        state.expenseCategory = category;

        state.existingExpenseCategory = {
          ...emptyExpenseCategory,
          ...category,
        };
      })

      .addCase(fetchExpenseCategoryById.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch expense category";
      });

    /* =================================================
           CREATE EXPENSE CATEGORY
        ================================================= */

    builder

      .addCase(createExpenseCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createExpenseCategory.fulfilled, (state) => {
        state.actionLoading = false;
        state.success = true;
      })

      .addCase(createExpenseCategory.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to create expense category";
      });

    /* =================================================
           UPDATE EXPENSE CATEGORY
        ================================================= */

    builder

      .addCase(updateExpenseCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateExpenseCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;

        const updatedCategory = getResponseData(action.payload);

        state.expenseCategory = updatedCategory;

        state.existingExpenseCategory = {
          ...emptyExpenseCategory,
          ...updatedCategory,
        };

        const index = state.expenseCategories.findIndex(
          (item) => item.id === updatedCategory?.id,
        );

        if (index !== -1) {
          state.expenseCategories[index] = updatedCategory;
        }
      })

      .addCase(updateExpenseCategory.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to update expense category";
      });

    /* =================================================
           DELETE EXPENSE CATEGORY
        ================================================= */

    builder

      .addCase(deleteExpenseCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(deleteExpenseCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;

        const deletedId = action.payload.id;

        state.expenseCategories = state.expenseCategories.filter(
          (item) => item.id !== deletedId,
        );

        if (state.expenseCategory?.id === deletedId) {
          state.expenseCategory = null;
        }
      })

      .addCase(deleteExpenseCategory.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to delete expense category";
      });
  },
});

/* =========================================================
   EXPORT ACTIONS
========================================================= */

export const {
  setExistingExpenseCategory,
  resetExpenseCategoryForm,
  resetExpenseCategoryState,
  clearExpenseCategoryError,
  clearExpenseCategorySuccess,
} = expenseCategorySlice.actions;

/* =========================================================
   EXPORT REDUCER
========================================================= */

export default expenseCategorySlice.reducer;
