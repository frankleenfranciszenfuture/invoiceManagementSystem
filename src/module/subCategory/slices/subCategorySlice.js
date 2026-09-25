import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllSubCategories,
  fetchSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  reactivateSubCategory,
  fetchSubCategoriesByStatus,
} from "../thunks/subCategoryThunks";

/* =========================================================
   EMPTY SUB CATEGORY FORM
   ========================================================= */

const emptySubCategory = {
  id: null,
  subCategoryCode: "",
  name: "",
  description: "",
  categoryId: null,
  categoryCode: "",
  categoryName: "",
  status: "ACTIVE",
  displayOrder: 1,
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  subCategories: [],

  // Keep form initialized instead of null
  subCategory: {
    ...emptySubCategory,
  },

  exsistingSubCategory: null,

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

const subCategorySlice = createSlice({
  name: "subCategory",

  initialState,

  reducers: {
    /* =====================================================
       SET EXISTING SUB CATEGORY
       ===================================================== */

    setExsistingSubCategory: (state, action) => {
      state.exsistingSubCategory = action.payload;
    },

    /* =====================================================
       CLEAR SUB CATEGORY STATE
       ===================================================== */

    clearSubCategoryState: (state) => {
      state.subCategories = [];

      state.subCategory = {
        ...emptySubCategory,
      };

      state.exsistingSubCategory = null;

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
    },

    /* =====================================================
       CLEAR SELECTED SUB CATEGORY
       ===================================================== */

    clearSelectedSubCategory: (state) => {
      state.subCategory = {
        ...emptySubCategory,
      };

      state.exsistingSubCategory = null;
    },

    /* =====================================================
       RESET SUB CATEGORY FORM
       ===================================================== */

    resetSubCategoryForm: (state) => {
      state.subCategory = {
        ...emptySubCategory,
      };

      state.exsistingSubCategory = null;
    },

    /* =====================================================
       SET SUB CATEGORY FORM FIELD
       ===================================================== */

    setSubCategoryField: (state, action) => {
      const { field, value } = action.payload;

      state.subCategory = {
        ...(state.subCategory || emptySubCategory),
        [field]: value,
      };
    },

    /* =====================================================
       SET SELECTED SUB CATEGORY VIEW
       ===================================================== */

    setSelectedSubCategoryView: (state, action) => {
      state.selectedSubCategoryView = action.payload;
    },

    /* =====================================================
       SET SUB CATEGORY STATUS
       ===================================================== */

    setSubCategoryStatus: (state, action) => {
      state.setSubCategoryStatus = action.payload;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL SUB CATEGORIES
       ===================================================== */

    builder

      .addCase(fetchAllSubCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchAllSubCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        const data = response?.data;

        state.subCategories = data?.content || [];

        state.pagination = {
          pageNumber: data?.pageNumber ?? 0,

          pageSize: data?.pageSize ?? 20,

          totalElements: data?.totalElements ?? 0,

          totalPages: data?.totalPages ?? 0,

          last: data?.last ?? true,
        };

        state.message = response?.message || "";
      })

      .addCase(fetchAllSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch sub categories.";

        state.message = "";
      });

    /* =====================================================
       FETCH SUB CATEGORY BY ID
       ===================================================== */

    builder

      .addCase(fetchSubCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchSubCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.subCategory = action.payload?.data ||
          action.payload || {
            ...emptySubCategory,
          };

        state.message = action.payload?.message || "";
      })

      .addCase(fetchSubCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch sub category.";

        state.message = "";
      });

    /* =====================================================
       CREATE SUB CATEGORY
       ===================================================== */

    builder

      .addCase(createSubCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Sub category created successfully.";

        const newSubCategory = action.payload?.data;

        if (newSubCategory) {
          state.subCategory = newSubCategory;

          state.exsistingSubCategory = newSubCategory;

          state.subCategories.push(newSubCategory);

          state.pagination.totalElements += 1;
        }
      })

      .addCase(createSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while creating sub category.";

        state.message = "";
      });

    /* =====================================================
       UPDATE SUB CATEGORY
       ===================================================== */

    builder

      .addCase(updateSubCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Sub category updated successfully.";

        const updatedSubCategory = action.payload?.data;

        if (updatedSubCategory) {
          state.subCategory = updatedSubCategory;

          state.exsistingSubCategory = updatedSubCategory;

          const index = state.subCategories.findIndex(
            (item) => item.id === updatedSubCategory.id,
          );

          if (index !== -1) {
            state.subCategories[index] = updatedSubCategory;
          }
        }
      })

      .addCase(updateSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating sub category.";

        state.message = "";
      });

    /* =====================================================
       DELETE SUB CATEGORY
       ===================================================== */

    builder

      .addCase(deleteSubCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Sub category deleted successfully.";

        /*
         * Thunk receives ID directly.
         * action.meta.arg contains the deleted ID.
         */

        const deletedId = action.meta.arg;

        state.subCategories = state.subCategories.filter(
          (item) => item.id !== deletedId,
        );

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        if (state.subCategory?.id === deletedId) {
          state.subCategory = {
            ...emptySubCategory,
          };
        }

        if (state.exsistingSubCategory?.id === deletedId) {
          state.exsistingSubCategory = null;
        }
      })

      .addCase(deleteSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while deleting sub category.";

        state.message = "";
      });

    /* =====================================================
       REACTIVATE SUB CATEGORY
       ===================================================== */

    builder

      .addCase(reactivateSubCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(reactivateSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Sub category reactivated successfully.";

        const reactivatedSubCategory = action.payload?.data;

        if (reactivatedSubCategory) {
          state.subCategory = reactivatedSubCategory;

          state.exsistingSubCategory = reactivatedSubCategory;

          const index = state.subCategories.findIndex(
            (item) => item.id === reactivatedSubCategory.id,
          );

          if (index !== -1) {
            state.subCategories[index] = reactivatedSubCategory;
          } else {
            state.subCategories.push(reactivatedSubCategory);

            state.pagination.totalElements += 1;
          }
        }
      })

      .addCase(reactivateSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload ||
          "Something went wrong while reactivating sub category.";

        state.message = "";
      });

    /* =====================================================
       FETCH SUB CATEGORIES BY STATUS
       ===================================================== */

    builder

      .addCase(fetchSubCategoriesByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchSubCategoriesByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        const data = response?.data;

        /*
         * PAGINATED RESPONSE
         */

        if (data && Array.isArray(data.content)) {
          state.subCategories = data.content;

          state.pagination = {
            pageNumber: data?.pageNumber ?? 0,

            pageSize: data?.pageSize ?? 20,

            totalElements: data?.totalElements ?? 0,

            totalPages: data?.totalPages ?? 0,

            last: data?.last ?? true,
          };
        } else if (Array.isArray(data)) {
          /*
           * DIRECT ARRAY RESPONSE
           */
          state.subCategories = data;

          state.pagination = {
            pageNumber: 0,

            pageSize: data.length || 20,

            totalElements: data.length,

            totalPages: data.length > 0 ? 1 : 0,

            last: true,
          };
        } else {
          /*
           * EMPTY / UNKNOWN RESPONSE
           */
          state.subCategories = [];

          state.pagination = {
            pageNumber: 0,

            pageSize: 20,

            totalElements: 0,

            totalPages: 0,

            last: true,
          };
        }

        state.message = response?.message || "";
      })

      .addCase(fetchSubCategoriesByStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Failed to fetch sub categories by status.";

        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setExsistingSubCategory,
  clearSubCategoryState,
  clearSelectedSubCategory,
  resetSubCategoryForm,
  setSubCategoryField,
  setSelectedSubCategoryView,
  setSubCategoryStatus,
} = subCategorySlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default subCategorySlice.reducer;
