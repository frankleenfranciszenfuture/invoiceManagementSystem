import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllTaxMasters,
  fetchTaxMasterById,
  createTaxMaster,
  updateTaxMaster,
  deleteTaxMaster,
  reactivateTaxMaster,
  fetchTaxMastersByStatus,
} from "../thunks/taxMasterThunks";

/* =========================================================
   EMPTY TAX MASTER FORM
   ========================================================= */

const emptyTaxMaster = {
  taxName: "",
  taxType: "",
  taxRate: "",
  cgstRate: "",
  sgstRate: "",
  igstRate: "",
  description: "",
  status: "",
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  taxMasters: [],

  // Keep form initialized instead of null
  taxMaster: { ...emptyTaxMaster },

  exsistingTaxMaster: null,

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

const taxMasterSlice = createSlice({
  name: "taxMaster",

  initialState,

  reducers: {
    /* =====================================================
       SET EXISTING TAX MASTER
       ===================================================== */

    setExsistingTaxMaster: (state, action) => {
      state.exsistingTaxMaster = action.payload;
    },

    /* =====================================================
       CLEAR TAX MASTER STATE
       ===================================================== */

    clearTaxMasterState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";
    },

    /* =====================================================
       CLEAR SELECTED TAX MASTER
       ===================================================== */

    clearSelectedTaxMaster: (state) => {
      state.taxMaster = { ...emptyTaxMaster };
    },

    /* =====================================================
       RESET TAX MASTER FORM
       ===================================================== */

    resetTaxMasterForm: (state) => {
      state.taxMaster = { ...emptyTaxMaster };
    },

    /* =====================================================
       SET TAX MASTER FORM FIELD
       ===================================================== */

    setTaxMasterField: (state, action) => {
      const { field, value } = action.payload;

      state.taxMaster = {
        ...(state.taxMaster || emptyTaxMaster),
        [field]: value,
      };
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL TAX MASTERS
       ===================================================== */

    builder

      .addCase(fetchAllTaxMasters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllTaxMasters.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        state.taxMasters = response?.data?.content || [];

        state.pagination = {
          pageNumber: response?.data?.pageNumber ?? 0,
          pageSize: response?.data?.pageSize ?? 20,
          totalElements: response?.data?.totalElements ?? 0,
          totalPages: response?.data?.totalPages ?? 0,
          last: response?.data?.last ?? true,
        };
      })

      .addCase(fetchAllTaxMasters.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch tax masters.";
      });

    /* =====================================================
       FETCH TAX MASTER BY ID
       ===================================================== */

    builder

      .addCase(fetchTaxMasterById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchTaxMasterById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.taxMaster = action.payload?.data ||
          action.payload || { ...emptyTaxMaster };
      })

      .addCase(fetchTaxMasterById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch tax master.";
      });

    /* =====================================================
       CREATE TAX MASTER
       ===================================================== */

    builder

      .addCase(createTaxMaster.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createTaxMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Tax master created successfully.";

        const newTaxMaster = action.payload?.data;

        if (newTaxMaster) {
          state.taxMasters.push(newTaxMaster);
        }
      })

      .addCase(createTaxMaster.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while creating tax master.";
      });

    /* =====================================================
       UPDATE TAX MASTER
       ===================================================== */

    builder

      .addCase(updateTaxMaster.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateTaxMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Tax master updated successfully.";

        const updatedTaxMaster = action.payload?.data;

        if (updatedTaxMaster) {
          const index = state.taxMasters.findIndex(
            (item) => item.id === updatedTaxMaster.id,
          );

          if (index !== -1) {
            state.taxMasters[index] = updatedTaxMaster;
          }

          state.taxMaster = updatedTaxMaster;
        }
      })

      .addCase(updateTaxMaster.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating tax master.";
      });

    /* =====================================================
       DELETE TAX MASTER
       ===================================================== */

    builder

      .addCase(deleteTaxMaster.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteTaxMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Tax master deleted successfully.";

        const deletedId = action.payload?.data?.id || action.payload?.id;

        if (deletedId) {
          state.taxMasters = state.taxMasters.filter(
            (item) => item.id !== deletedId,
          );
        }
      })

      .addCase(deleteTaxMaster.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while deleting tax master.";
      });

    /* =====================================================
       REACTIVATE TAX MASTER
       ===================================================== */

    builder

      .addCase(reactivateTaxMaster.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(reactivateTaxMaster.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Tax master reactivated successfully.";

        const reactivatedTaxMaster = action.payload?.data;

        if (reactivatedTaxMaster) {
          const index = state.taxMasters.findIndex(
            (item) => item.id === reactivatedTaxMaster.id,
          );

          if (index !== -1) {
            state.taxMasters[index] = reactivatedTaxMaster;
          } else {
            state.taxMasters.push(reactivatedTaxMaster);
          }

          state.taxMaster = reactivatedTaxMaster;
        }
      })

      .addCase(reactivateTaxMaster.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload ||
          "Something went wrong while reactivating tax master.";
      });

    /* =====================================================
       FETCH TAX MASTERS BY STATUS
       ===================================================== */

    builder

      .addCase(fetchTaxMastersByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchTaxMastersByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        state.taxMasters = response?.data?.content || [];

        state.pagination = {
          pageNumber: response?.data?.pageNumber ?? 0,
          pageSize: response?.data?.pageSize ?? 20,
          totalElements: response?.data?.totalElements ?? 0,
          totalPages: response?.data?.totalPages ?? 0,
          last: response?.data?.last ?? true,
        };
      })

      .addCase(fetchTaxMastersByStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Failed to fetch tax masters by status.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setExsistingTaxMaster,
  clearTaxMasterState,
  clearSelectedTaxMaster,
  resetTaxMasterForm,
  setTaxMasterField,
} = taxMasterSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default taxMasterSlice.reducer;
