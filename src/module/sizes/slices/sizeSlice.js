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

const initialState = {
  sizes: [],
  size: null,
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

const sizeSlice = createSlice({
  name: "size",

  initialState,

  reducers: {
    setExsistingSize: (state, action) => {
      state.exsistingSize = action.payload;
    },

    clearSizeState: (state) => {
      state.sizes = [];
      state.size = null;
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

    clearSelectedSize: (state) => {
      state.size = null;
      state.exsistingSize = null;
    },
  },

  extraReducers: (builder) => {
    // =========================================================
    // FETCH ALL SIZES
    // =========================================================

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

        const data = action.payload?.data;

        state.sizes = data?.content || [];

        state.pagination = {
          pageNumber: data?.pageNumber ?? 0,
          pageSize: data?.pageSize ?? 20,
          totalElements: data?.totalElements ?? 0,
          totalPages: data?.totalPages ?? 0,
          last: data?.last ?? true,
        };

        state.message = action.payload?.message || "";
      })

      .addCase(fetchAllSizes.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch sizes";
        state.message = "";
      });

    // =========================================================
    // FETCH SIZE BY ID
    // =========================================================

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

        state.size = action.payload?.data || null;
        state.message = action.payload?.message || "";
      })

      .addCase(fetchSizeById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch size";
        state.message = "";
      });

    // =========================================================
    // CREATE SIZE
    // =========================================================

    builder
      .addCase(createSize.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createSize.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const createdSize = action.payload?.data;

        if (createdSize) {
          state.size = createdSize;
          state.exsistingSize = createdSize;

          state.sizes.push(createdSize);

          state.pagination.totalElements += 1;
        }

        state.message = action.payload?.message || "Size created successfully.";
      })

      .addCase(createSize.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to create size";
        state.message = "";
      });

    // =========================================================
    // UPDATE SIZE
    // =========================================================

    builder
      .addCase(updateSize.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(updateSize.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

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

        state.message = action.payload?.message || "Size updated successfully.";
      })

      .addCase(updateSize.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to update size";
        state.message = "";
      });

    // =========================================================
    // DELETE SIZE
    // =========================================================

    builder
      .addCase(deleteSize.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(deleteSize.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const deletedId = action.meta.arg;

        state.sizes = state.sizes.filter((item) => item.id !== deletedId);

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        if (state.size?.id === deletedId) {
          state.size = null;
        }

        if (state.exsistingSize?.id === deletedId) {
          state.exsistingSize = null;
        }

        state.message = action.payload?.message || "Size deleted successfully.";
      })

      .addCase(deleteSize.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to delete size";
        state.message = "";
      });

    // =========================================================
    // REACTIVATE SIZE
    // =========================================================

    builder
      .addCase(reactivateSize.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(reactivateSize.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

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

        state.message =
          action.payload?.message || "Size reactivated successfully.";
      })

      .addCase(reactivateSize.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to reactivate size";
        state.message = "";
      });

    // =========================================================
    // FETCH SIZES BY STATUS
    // =========================================================

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

        const data = action.payload?.data;

        // Supports paginated response
        if (data?.content) {
          state.sizes = data.content;

          state.pagination = {
            pageNumber: data?.pageNumber ?? 0,
            pageSize: data?.pageSize ?? 20,
            totalElements: data?.totalElements ?? 0,
            totalPages: data?.totalPages ?? 0,
            last: data?.last ?? true,
          };
        } else {
          // Supports direct array response
          state.sizes = Array.isArray(data) ? data : [];
        }

        state.message = action.payload?.message || "";
      })

      .addCase(fetchSizesByStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch sizes by status";
        state.message = "";
      });
  },
});

export const { setExsistingSize, clearSizeState, clearSelectedSize } =
  sizeSlice.actions;

export default sizeSlice.reducer;
