import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllClearance,
  fetchClearanceById,
  fetchClearancePartyById,
  createClearance,
  updateClearance,
  deleteClearance,
} from "../thunks/clearanceThunks";

/* =========================================================
   EMPTY PARTY FORM
========================================================= */

const emptyClearance = {
  id: null,
  partyId: "",
  clearanceAmount: 0,
  paymentMethod: "",
  paymentReferenceNumber: "",
  clearanceDate: "",
  remarks: "",
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  clearances: [],

  // Current form
  clearance: { ...emptyClearance },

  // Existing/selected party
  existingClearance: null,

  // Selected party for detail view
  selectedClearanceView: null,

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
   RESPONSE HELPERS
========================================================= */

const getClearanceData = (payload) => {
  return payload?.data ?? payload ?? null;
};

const getClearanceId = (clearance) => {
  return clearance?.id != null ? String(clearance.id) : "";
};

/* =========================================================
   SLICE
========================================================= */

const clearanceSlice = createSlice({
  name: "clearance",

  initialState,

  reducers: {
    /* =====================================================
       SET EXISTING CLEARANCE
    ===================================================== */

    setExistingClearance: (state, action) => {
      state.existingClearance = action.payload;
    },

    /* =====================================================
       SET PARTY FORM
    ===================================================== */

    setClearance: (state, action) => {
      state.clearance = {
        ...emptyClearance,
        ...action.payload,
      };
    },

    /* =====================================================
       SET CLEARANCE FIELD
    ===================================================== */

    setClearanceField: (state, action) => {
      const { field, value } = action.payload;

      state.clearance = {
        ...state.clearance,
        [field]: value,
      };
    },

    /* =====================================================
       SELECT CLEARANCE VIEW
    ===================================================== */

    setSelectedClearanceView: (state, action) => {
      state.selectedClearanceView = action.payload;
    },

    /* =====================================================
       CLEAR ERROR
    ===================================================== */

    clearError: (state) => {
      state.error = null;
    },

    /* =====================================================
       RESET CLEARANCE FORM
    ===================================================== */

    resetClearanceForm: (state) => {
      state.clearance = {
        ...emptyClearance,
      };

      state.existingClearance = null;
    },

    /* =====================================================
       CLEAR SELECTED PARTY
    ===================================================== */

    clearSelectedClearance: (state) => {
      state.clearance = {
        ...emptyClearance,
      };

      state.existingClearance = null;
      state.selectedClearanceView = null;
    },

    /* =====================================================
       CLEAR ENTIRE CLEARANCE STATE
    ===================================================== */

    clearClearanceState: () => ({
      ...initialState,
      clearance: {
        ...emptyClearance,
      },
    }),
  },

  /* =======================================================
     EXTRA REDUCERS
  ======================================================= */

  extraReducers: (builder) => {
    builder
      // Fetch all clearances
      .addCase(fetchAllClearance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllClearance.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const response = action.payload;
        const data = response?.data ?? response;

        if (Array.isArray(data)) {
          state.clearances = data;
        } else if (Array.isArray(data?.content)) {
          state.clearances = data.content;
        } else if (Array.isArray(data?.clearances)) {
          state.clearances = data.clearances;
        } else if (Array.isArray(data?.data)) {
          state.clearances = data.data;
        } else {
          state.clearances = [];
          console.error("Unexpected clearance response:", response);
        }

        state.message = response?.message || "";
      })
      .addCase(fetchAllClearance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch a clearance by its ID
      .addCase(fetchClearanceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClearanceById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const response = action.payload;
        state.existingClearance = response?.data ?? response;
      })
      .addCase(fetchClearanceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch clearances by party ID
      .addCase(fetchClearancePartyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClearancePartyById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const response = action.payload;
        const data = response?.data ?? response;

        state.clearances = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.clearances)
              ? data.clearances
              : data
                ? [data]
                : [];
      })
      .addCase(fetchClearancePartyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });

    /* =====================================================
       CREATE CLEARANCE
    ===================================================== */

    builder
      .addCase(createClearance.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createClearance.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;
        const newClearance = getClearanceData(response);

        state.message = response?.message || "Clearance created successfully.";

        if (
          newClearance &&
          typeof newClearance === "object" &&
          newClearance.id != null
        ) {
          state.clearance = {
            ...emptyClearance,
            ...newClearance,
          };

          state.existingClearance = newClearance;

          const alreadyExists = state.clearances.some(
            (item) => getClearanceId(item) === getClearanceId(newClearance),
          );

          if (!alreadyExists) {
            state.clearances.unshift(newClearance);
            state.pagination.totalElements += 1;
          }
        }
      })

      .addCase(createClearance.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to create clearance.";
        state.message = "";
      });

    /* =====================================================
       UPDATE CLEARANCE
    ===================================================== */

    builder
      .addCase(updateClearance.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateClearance.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;
        const updatedClearance = getClearanceData(response);

        state.message = response?.message || "Clearance updated successfully.";

        if (
          updateClearance &&
          typeof updateClearance === "object" &&
          updateClearance.id != null
        ) {
          state.clearance = {
            ...emptyClearance,
            ...updateClearance,
          };

          state.existingClearance = updateClearance;

          const index = state.clearances.findIndex(
            (item) => getClearanceId(item) === getClearanceId(updateClearance),
          );

          if (index !== -1) {
            state.clearances[index] = updateClearance;
          }
        }
      })

      .addCase(updateClearance.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to update clearance.";
        state.message = "";
      });

    /* =====================================================
       DELETE CLEARANCE
    ===================================================== */

    builder
      .addCase(deleteClearance.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteClearance.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Clearance deleted successfully.";

        // Assumes deleteClearance receives the clearance ID directly.
        const deletedId = action.meta.arg;

        state.clearances = state.clearances.filter(
          (item) => getClearanceId(item) !== String(deletedId),
        );

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        if (getClearanceId(state.clearance) === String(deletedId)) {
          state.clearance = {
            ...emptyClearance,
          };
        }

        if (getClearanceId(state.existingClearance) === String(deletedId)) {
          state.existingClearance = null;
        }

        if (getClearanceId(state.selectedClearanceView) === String(deletedId)) {
          state.selectedClearanceView = null;
        }
      })

      .addCase(deleteClearance.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to delete clearance.";
        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  setExistingClearance,
  setClearance,
  setClearanceField,
  setSelectedClearanceView,
  clearError,
  resetClearanceForm,
  clearSelectedClearance,
  clearClearanceState,
} = clearanceSlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default clearanceSlice.reducer;
