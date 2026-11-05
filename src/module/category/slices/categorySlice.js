import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reactivateCategory,
  fetchCategoriesByStatus,
} from "../thunks/categoryThunks";

/* =========================================================
   EMPTY CATEGORY FORM
========================================================= */

const emptyCategory = {
  id: null,
  categoryCode: "",
  categoryName: "",
  description: "",
  status: "ACTIVE",
  displayOrder: 1,
};

/* =========================================================
   EMPTY PAGINATION
========================================================= */

const emptyPagination = {
  pageNumber: 0,
  pageSize: 20,
  totalElements: 0,
  totalPages: 0,
  last: true,
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  categories: [],

  category: {
    ...emptyCategory,
  },

  exsistingCategory: null,
  createdCategorySelection: null,

  pagination: {
    ...emptyPagination,
  },

  loading: false,
  success: false,
  error: null,
  message: "",

  selectedCategoryView: null,
  categoryStatus: "ACTIVE",
};

/* =========================================================
   HELPERS
========================================================= */

const getErrorStatus = (action) => {
  return (
    action.payload?.status ||
    action.payload?.response?.status ||
    action.error?.status
  );
};

const setEmptyCategoryResults = (state) => {
  state.categories = [];

  state.pagination = {
    ...emptyPagination,
  };
};

const setCategoryPage = (state, data) => {
  if (data && Array.isArray(data.content)) {
    state.categories = data.content;

    state.pagination = {
      pageNumber: data.pageNumber ?? 0,
      pageSize: data.pageSize ?? 20,
      totalElements: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
      last: data.last ?? true,
    };

    return;
  }

  if (Array.isArray(data)) {
    state.categories = data;

    state.pagination = {
      pageNumber: 0,
      pageSize: data.length || 20,
      totalElements: data.length,
      totalPages: data.length > 0 ? 1 : 0,
      last: true,
    };

    return;
  }

  setEmptyCategoryResults(state);
};

/* =========================================================
   SLICE
========================================================= */

const categorySlice = createSlice({
  name: "category",

  initialState,

  reducers: {
    /* =================================================
           SET EXISTING CATEGORY
        ================================================= */

    setExsistingCategory: (state, action) => {
      state.exsistingCategory = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    /* =================================================
           CLEAR CATEGORY STATE
        ================================================= */

    clearCategoryState: (state) => {
      state.categories = [];

      state.category = {
        ...emptyCategory,
      };

      state.exsistingCategory = null;

      state.pagination = {
        ...emptyPagination,
      };

      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";

      state.selectedCategoryView = null;
      state.categoryStatus = "ACTIVE";
    },

    setCreatedCategorySelection: (state, action) => {
      state.createdCategorySelection = action.payload;
    },

    clearCreatedCategorySelection: (state) => {
      state.createdCategorySelection = null;
    },

    /* =================================================
           CLEAR SELECTED CATEGORY
        ================================================= */

    clearSelectedCategory: (state) => {
      state.category = {
        ...emptyCategory,
      };

      state.exsistingCategory = null;
    },

    /* =================================================
           RESET CATEGORY FORM
        ================================================= */

    resetCategoryForm: (state) => {
      state.category = {
        ...emptyCategory,
      };

      state.exsistingCategory = null;
    },

    /* =================================================
           SET CATEGORY FORM FIELD
        ================================================= */

    setCategoryField: (state, action) => {
      const { field, value } = action.payload;

      state.category = {
        ...(state.category || emptyCategory),
        [field]: value,
      };
    },

    /* =================================================
           SET SELECTED CATEGORY VIEW
        ================================================= */

    setSelectedCategoryView: (state, action) => {
      state.selectedCategoryView = action.payload;
    },

    /* =================================================
           SET CATEGORY STATUS
        ================================================= */

    setCategoryStatus: (state, action) => {
      state.categoryStatus = action.payload;
    },
  },

  /* =====================================================
       EXTRA REDUCERS
    ===================================================== */

  extraReducers: (builder) => {
    /* =================================================
           FETCH ALL CATEGORIES
        ================================================= */

    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;

        // Remove records belonging to the previous status.
        setEmptyCategoryResults(state);
      })

      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;
        const data = response?.data;

        setCategoryPage(state, data);

        state.message = response?.message || "";
      })

      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        if (getErrorStatus(action) === 404) {
          setEmptyCategoryResults(state);
          state.error = null;
          state.message = "";
          return;
        }

        setEmptyCategoryResults(state);

        state.error =
          action.payload?.message ||
          action.payload ||
          action.error?.message ||
          "Failed to fetch categories.";

        state.message = "";
      });

    /* =================================================
           FETCH CATEGORY BY ID
        ================================================= */

    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.category = action.payload?.data ||
          action.payload || {
            ...emptyCategory,
          };

        state.message = action.payload?.message || "";
      })

      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload?.message ||
          action.payload ||
          "Failed to fetch category.";

        state.message = "";
      });

    /* =================================================
           CREATE CATEGORY
        ================================================= */

    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Category created successfully.";

        const newCategory = action.payload?.data;

        if (newCategory) {
          state.category = newCategory;
          state.exsistingCategory = newCategory;

          state.categories.push(newCategory);

          state.pagination.totalElements += 1;
        }
      })

      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload?.message ||
          action.payload ||
          "Something went wrong while creating category.";

        state.message = "";
      });

    /* =================================================
           UPDATE CATEGORY
        ================================================= */

    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Category updated successfully.";

        const updatedCategory = action.payload?.data;

        if (updatedCategory) {
          state.category = updatedCategory;
          state.exsistingCategory = updatedCategory;

          const index = state.categories.findIndex(
            (item) => item.id === updatedCategory.id,
          );

          if (index !== -1) {
            state.categories[index] = updatedCategory;
          }
        }
      })

      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload?.message ||
          action.payload ||
          "Something went wrong while updating category.";

        state.message = "";
      });

    /* =================================================
           DELETE CATEGORY
        ================================================= */

    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Category deleted successfully.";

        const deletedId = action.meta.arg;

        state.categories = state.categories.filter(
          (item) => item.id !== deletedId,
        );

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        if (state.category?.id === deletedId) {
          state.category = {
            ...emptyCategory,
          };
        }

        if (state.exsistingCategory?.id === deletedId) {
          state.exsistingCategory = null;
        }
      })

      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload?.message ||
          action.payload ||
          "Something went wrong while deleting category.";

        state.message = "";
      });

    /* =================================================
           REACTIVATE CATEGORY
        ================================================= */

    builder
      .addCase(reactivateCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(reactivateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Category reactivated successfully.";

        const reactivatedCategory = action.payload?.data;

        if (reactivatedCategory) {
          state.category = reactivatedCategory;
          state.exsistingCategory = reactivatedCategory;

          const index = state.categories.findIndex(
            (item) => item.id === reactivatedCategory.id,
          );

          if (index !== -1) {
            state.categories[index] = reactivatedCategory;
          } else {
            state.categories.push(reactivatedCategory);

            state.pagination.totalElements += 1;
          }
        }
      })

      .addCase(reactivateCategory.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload?.message ||
          action.payload ||
          "Something went wrong while reactivating category.";

        state.message = "";
      });

    /* =================================================
           FETCH CATEGORIES BY STATUS
        ================================================= */

    builder
      .addCase(fetchCategoriesByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;

        setEmptyCategoryResults(state);
      })

      .addCase(fetchCategoriesByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;
        const data = response?.data;

        setCategoryPage(state, data);

        state.message = response?.message || "";
      })

      .addCase(fetchCategoriesByStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        if (getErrorStatus(action) === 404) {
          setEmptyCategoryResults(state);
          state.error = null;
          state.message = "";
          return;
        }

        setEmptyCategoryResults(state);

        state.error =
          action.payload?.message ||
          action.payload ||
          action.error?.message ||
          "Failed to fetch categories by status.";

        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  setExsistingCategory,
  clearError,
  clearCategoryState,
  clearSelectedCategory,
  resetCategoryForm,
  setCategoryField,
  setSelectedCategoryView,
  setCategoryStatus,
  setCreatedCategorySelection,
  clearCreatedCategorySelection,
} = categorySlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default categorySlice.reducer;
