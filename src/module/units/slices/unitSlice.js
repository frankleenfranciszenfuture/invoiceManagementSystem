import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllUnits,
  fetchUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  reactivateUnit,
  fetchUnitsByStatus,
} from "../thunks/unitThunks";

/* =========================================================
   EMPTY UNIT FORM
   ========================================================= */

const emptyUnit = {
  id: null,
  unitName: "",
  unitShortName: "",
  unitCode: "",
  description: "",
  status: "ACTIVE",
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  units: [],

  // Keep form initialized instead of null
  unit: { ...emptyUnit },

  exsistingUnit: null,

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

const unitSlice = createSlice({
  name: "unit",

  initialState,

  reducers: {
    /* =====================================================
       SET EXISTING UNIT
       ===================================================== */

    setExsistingUnit: (state, action) => {
      state.exsistingUnit = action.payload;
    },

    /* =====================================================
       CLEAR UNIT STATE
       ===================================================== */

    clearUnitState: (state) => {
      state.units = [];

      state.unit = {
        ...emptyUnit,
      };

      state.exsistingUnit = null;

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
       CLEAR SELECTED UNIT
       ===================================================== */

    clearSelectedUnit: (state) => {
      state.unit = {
        ...emptyUnit,
      };

      state.exsistingUnit = null;
    },

    /* =====================================================
       RESET UNIT FORM
       ===================================================== */

    resetUnitForm: (state) => {
      state.unit = {
        ...emptyUnit,
      };

      state.exsistingUnit = null;
    },

    /* =====================================================
       SET UNIT FORM FIELD
       ===================================================== */

    setUnitField: (state, action) => {
      const { field, value } = action.payload;

      state.unit = {
        ...(state.unit || emptyUnit),
        [field]: value,
      };
    },
  },

  /* =======================================================
     EXTRA REDUCERS
  ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL UNITS
       ===================================================== */

    builder

      .addCase(fetchAllUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })

      .addCase(fetchAllUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;
        const data = response?.data;

        state.units = Array.isArray(data?.content) ? data.content : [];

        state.pagination = {
          pageNumber: data?.pageNumber ?? 0,

          pageSize: data?.pageSize ?? 20,

          totalElements: data?.totalElements ?? 0,

          totalPages: data?.totalPages ?? 0,

          last: data?.last ?? true,
        };

        state.message = response?.message || "";
      })

      .addCase(fetchAllUnits.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch units.";

        state.message = "";
      });

    /* =====================================================
       FETCH UNIT BY ID
       ===================================================== */

    builder

      .addCase(fetchUnitById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })

      .addCase(fetchUnitById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.unit = action.payload?.data ||
          action.payload || {
            ...emptyUnit,
          };

        state.message = action.payload?.message || "";
      })

      .addCase(fetchUnitById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch unit.";

        state.message = "";
      });

    /* =====================================================
       CREATE UNIT
       ===================================================== */

    builder

      .addCase(createUnit.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message = action.payload?.message || "Unit created successfully.";

        const newUnit = action.payload?.data;

        if (newUnit) {
          state.unit = newUnit;

          state.exsistingUnit = newUnit;

          state.units.push(newUnit);

          state.pagination.totalElements += 1;
        }
      })

      .addCase(createUnit.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while creating unit.";

        state.message = "";
      });

    /* =====================================================
       UPDATE UNIT
       ===================================================== */

    builder

      .addCase(updateUnit.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(updateUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message = action.payload?.message || "Unit updated successfully.";

        const updatedUnit = action.payload?.data;

        if (updatedUnit) {
          state.unit = updatedUnit;

          state.exsistingUnit = updatedUnit;

          const index = state.units.findIndex(
            (item) => item.id === updatedUnit.id,
          );

          if (index !== -1) {
            state.units[index] = updatedUnit;
          }
        }
      })

      .addCase(updateUnit.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating unit.";

        state.message = "";
      });

    /* =====================================================
       DELETE UNIT
       ===================================================== */

    builder

      .addCase(deleteUnit.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(deleteUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message = action.payload?.message || "Unit deleted successfully.";

        /*
         * deleteUnit receives ID directly,
         * therefore action.meta.arg is the ID.
         */

        const deletedId = action.meta.arg;

        state.units = state.units.filter((item) => item.id !== deletedId);

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        if (state.unit?.id === deletedId) {
          state.unit = {
            ...emptyUnit,
          };
        }

        if (state.exsistingUnit?.id === deletedId) {
          state.exsistingUnit = null;
        }
      })

      .addCase(deleteUnit.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while deleting unit.";

        state.message = "";
      });

    /* =====================================================
       REACTIVATE UNIT
       ===================================================== */

    builder

      .addCase(reactivateUnit.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(reactivateUnit.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Unit reactivated successfully.";

        const reactivatedUnit = action.payload?.data;

        if (reactivatedUnit) {
          state.unit = reactivatedUnit;

          state.exsistingUnit = reactivatedUnit;

          const index = state.units.findIndex(
            (item) => item.id === reactivatedUnit.id,
          );

          if (index !== -1) {
            state.units[index] = reactivatedUnit;
          } else {
            state.units.push(reactivatedUnit);

            state.pagination.totalElements += 1;
          }
        }
      })

      .addCase(reactivateUnit.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while reactivating unit.";

        state.message = "";
      });

    /* =====================================================
       FETCH UNITS BY STATUS
       ===================================================== */

    builder

      .addCase(fetchUnitsByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })

      .addCase(fetchUnitsByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;
        const data = response?.data;

        /*
         * PAGINATED RESPONSE
         */

        if (data && Array.isArray(data.content)) {
          state.units = data.content;

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
          state.units = data;

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
          state.units = [];

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

      .addCase(fetchUnitsByStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch units by status.";

        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setExsistingUnit,
  clearUnitState,
  clearSelectedUnit,
  resetUnitForm,
  setUnitField,
} = unitSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default unitSlice.reducer;
