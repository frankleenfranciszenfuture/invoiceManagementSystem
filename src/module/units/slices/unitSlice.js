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

const initialState = {
  units: [],
  unit: null,
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

const unitSlice = createSlice({
  name: "unit",

  initialState,

  reducers: {
    // =========================================================
    // SET EXISTING UNIT
    // =========================================================

    setExsistingUnit: (state, action) => {
      state.exsistingUnit = action.payload;
    },

    // =========================================================
    // CLEAR UNIT STATE
    // =========================================================

    clearUnitState: (state) => {
      state.units = [];
      state.unit = null;
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

    // =========================================================
    // CLEAR SELECTED UNIT
    // =========================================================

    clearSelectedUnit: (state) => {
      state.unit = null;
      state.exsistingUnit = null;
    },
  },

  extraReducers: (builder) => {
    // =========================================================
    // FETCH ALL UNITS
    // =========================================================

    builder
      .addCase(fetchAllUnits.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(fetchAllUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const data = action.payload?.data;

        state.units = Array.isArray(data?.content) ? data.content : [];

        state.pagination = {
          pageNumber: data?.pageNumber ?? 0,
          pageSize: data?.pageSize ?? 20,
          totalElements: data?.totalElements ?? 0,
          totalPages: data?.totalPages ?? 0,
          last: data?.last ?? true,
        };

        state.message = action.payload?.message || "";
      })

      .addCase(fetchAllUnits.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch units";
        state.message = "";
      });

    // =========================================================
    // FETCH UNIT BY ID
    // =========================================================

    builder
      .addCase(fetchUnitById.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(fetchUnitById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.unit = action.payload?.data || null;

        state.message = action.payload?.message || "";
      })

      .addCase(fetchUnitById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch unit";
        state.message = "";
      });

    // =========================================================
    // CREATE UNIT
    // =========================================================

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

        const createdUnit = action.payload?.data;

        if (createdUnit) {
          state.unit = createdUnit;
          state.exsistingUnit = createdUnit;

          state.units.push(createdUnit);

          state.pagination.totalElements += 1;
        }

        state.message = action.payload?.message || "Unit created successfully.";
      })

      .addCase(createUnit.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to create unit";
        state.message = "";
      });

    // =========================================================
    // UPDATE UNIT
    // =========================================================

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

        state.message = action.payload?.message || "Unit updated successfully.";
      })

      .addCase(updateUnit.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to update unit";
        state.message = "";
      });

    // =========================================================
    // DELETE UNIT
    // =========================================================

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

        const deletedId = action.meta.arg;

        state.units = state.units.filter((item) => item.id !== deletedId);

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        if (state.unit?.id === deletedId) {
          state.unit = null;
        }

        if (state.exsistingUnit?.id === deletedId) {
          state.exsistingUnit = null;
        }

        state.message = action.payload?.message || "Unit deleted successfully.";
      })

      .addCase(deleteUnit.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to delete unit";
        state.message = "";
      });

    // =========================================================
    // REACTIVATE UNIT
    // =========================================================

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

        state.message =
          action.payload?.message || "Unit reactivated successfully.";
      })

      .addCase(reactivateUnit.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to reactivate unit";
        state.message = "";
      });

    // =========================================================
    // FETCH UNITS BY STATUS
    // =========================================================

    builder
      .addCase(fetchUnitsByStatus.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(fetchUnitsByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const data = action.payload?.data;

        if (Array.isArray(data?.content)) {
          state.units = data.content;

          state.pagination = {
            pageNumber: data?.pageNumber ?? 0,
            pageSize: data?.pageSize ?? 20,
            totalElements: data?.totalElements ?? 0,
            totalPages: data?.totalPages ?? 0,
            last: data?.last ?? true,
          };
        } else if (Array.isArray(data)) {
          state.units = data;

          state.pagination = {
            ...state.pagination,
            totalElements: data.length,
            totalPages: data.length > 0 ? 1 : 0,
            last: true,
          };
        } else {
          state.units = [];
        }

        state.message = action.payload?.message || "";
      })

      .addCase(fetchUnitsByStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch units by status";
        state.message = "";
      });
  },
});

export const { setExsistingUnit, clearUnitState, clearSelectedUnit } =
  unitSlice.actions;

export default unitSlice.reducer;
