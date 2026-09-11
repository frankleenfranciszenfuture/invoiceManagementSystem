import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllSizes,
  fetchSizeById,
  createSize,
  updateSize,
  deleteSize,
  reactivateSize,
  fetchSizesByStatus,
} from "../thunks/sizeThunks";

/* =========================================================
   EMPTY SIZE FORM
   ========================================================= */

const emptySize = {
  id: null,
  sizeName: "",
  sizeShortName: "",
  description: "",
  status: "ACTIVE",
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  sizes: [],

  // Keep form initialized instead of null
  size: { ...emptySize },

  exsistingSize: null,

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

const sizeSlice = createSlice({
  name: "size",

  initialState,

  reducers: {
    /* =====================================================
       SET EXISTING SIZE
       ===================================================== */

    setExsistingSize: (state, action) => {
      state.exsistingSize = action.payload;
    },

    /* =====================================================
       CLEAR SIZE STATE
       ===================================================== */

    clearSizeState: (state) => {
      state.sizes = [];

      state.size = {
        ...emptySize,
      };

      state.exsistingSize = null;

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
       CLEAR SELECTED SIZE
       ===================================================== */

    clearSelectedSize: (state) => {
      state.size = {
        ...emptySize,
      };

      state.exsistingSize = null;
    },

    /* =====================================================
       RESET SIZE FORM
       ===================================================== */

    resetSizeForm: (state) => {
      state.size = {
        ...emptySize,
      };

      state.exsistingSize = null;
    },

    /* =====================================================
       SET SIZE FORM FIELD
       ===================================================== */

    setSizeField: (state, action) => {
      const { field, value } = action.payload;

      state.size = {
        ...(state.size || emptySize),
        [field]: value,
      };
    },

    setSelectedSizeView(state, action) {
      state.selectedSizeView = action.payload;
    },

    setSizeStatus(state, action) {
      state.setSizeStatus = action.payload;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
  ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL SIZES
       ===================================================== */

    builder

      .addCase(fetchAllSizes.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchAllSizes.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        const data = response?.data;

        state.sizes = data?.content || [];

        state.pagination = {
          pageNumber: data?.pageNumber ?? 0,

          pageSize: data?.pageSize ?? 20,

          totalElements: data?.totalElements ?? 0,

          totalPages: data?.totalPages ?? 0,

          last: data?.last ?? true,
        };

        state.message = response?.message || "";
      })

      .addCase(fetchAllSizes.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch sizes.";

        state.message = "";
      });

    /* =====================================================
       FETCH SIZE BY ID
       ===================================================== */

    builder

      .addCase(fetchSizeById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchSizeById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.size = action.payload?.data ||
          action.payload || {
            ...emptySize,
          };

        state.message = action.payload?.message || "";
      })

      .addCase(fetchSizeById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch size.";

        state.message = "";
      });

    /* =====================================================
       CREATE SIZE
       ===================================================== */

    builder

      .addCase(createSize.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createSize.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message = action.payload?.message || "Size created successfully.";

        const newSize = action.payload?.data;

        if (newSize) {
          state.size = newSize;

          state.exsistingSize = newSize;

          state.sizes.push(newSize);

          state.pagination.totalElements += 1;
        }
      })

      .addCase(createSize.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while creating size.";

        state.message = "";
      });

    /* =====================================================
       UPDATE SIZE
       ===================================================== */

    builder

      .addCase(updateSize.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateSize.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message = action.payload?.message || "Size updated successfully.";

        const updatedSize = action.payload?.data;

        if (updatedSize) {
          state.size = updatedSize;

          state.exsistingSize = updatedSize;

          const index = state.sizes.findIndex(
            (item) => item.id === updatedSize.id,
          );

          if (index !== -1) {
            state.sizes[index] = updatedSize;
          }
        }
      })

      .addCase(updateSize.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating size.";

        state.message = "";
      });

    /* =====================================================
       DELETE SIZE
       ===================================================== */

    builder

      .addCase(deleteSize.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteSize.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message = action.payload?.message || "Size deleted successfully.";

        /*
         * Your thunk receives the ID directly,
         * so action.meta.arg is the safest ID.
         */

        const deletedId = action.meta.arg;

        state.sizes = state.sizes.filter((item) => item.id !== deletedId);

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        if (state.size?.id === deletedId) {
          state.size = {
            ...emptySize,
          };
        }

        if (state.exsistingSize?.id === deletedId) {
          state.exsistingSize = null;
        }
      })

      .addCase(deleteSize.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while deleting size.";

        state.message = "";
      });

    /* =====================================================
       REACTIVATE SIZE
       ===================================================== */

    builder

      .addCase(reactivateSize.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(reactivateSize.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Size reactivated successfully.";

        const reactivatedSize = action.payload?.data;

        if (reactivatedSize) {
          state.size = reactivatedSize;

          state.exsistingSize = reactivatedSize;

          const index = state.sizes.findIndex(
            (item) => item.id === reactivatedSize.id,
          );

          if (index !== -1) {
            state.sizes[index] = reactivatedSize;
          } else {
            state.sizes.push(reactivatedSize);

            state.pagination.totalElements += 1;
          }
        }
      })

      .addCase(reactivateSize.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while reactivating size.";

        state.message = "";
      });

    /* =====================================================
       FETCH SIZES BY STATUS
       ===================================================== */

    builder

      .addCase(fetchSizesByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchSizesByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        const data = response?.data;

        /*
         * PAGINATED RESPONSE
         */

        if (data && Array.isArray(data.content)) {
          state.sizes = data.content;

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
          state.sizes = data;

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
          state.sizes = [];

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

      .addCase(fetchSizesByStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch sizes by status.";

        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setExsistingSize,
  clearSizeState,
  clearSelectedSize,
  resetSizeForm,
  setSizeField,
  setSelectedSizeView,
  setSizeStatus,
} = sizeSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default sizeSlice.reducer;
