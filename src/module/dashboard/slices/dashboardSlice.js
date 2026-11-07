import { createSlice } from "@reduxjs/toolkit";
import { fetchDashboardOverview } from "../thunks/dashboardThunks";

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  dashboard: null,

  loading: false,
  error: null,

  // Selected dashboard period
  period: "LAST_30_DAYS",

  // Custom date range
  fromDate: "",
  toDate: "",

  // Last successful fetch
  lastFetchedAt: null,
};

// ============================================
// DASHBOARD SLICE
// ============================================

const dashboardSlice = createSlice({
  name: "dashboard",

  initialState,

  reducers: {
    // ========================================
    // SET DASHBOARD PERIOD
    // ========================================

    setDashboardPeriod: (state, action) => {
      state.period = action.payload;
      state.error = null;

      if (action.payload !== "CUSTOM") {
        state.fromDate = "";
        state.toDate = "";
      }
    },

    // ========================================
    // SET CUSTOM DATE RANGE
    // ========================================

    setDashboardDateRange: (state, action) => {
      state.period = "CUSTOM";

      state.fromDate = action.payload.fromDate || "";
      state.toDate = action.payload.toDate || "";

      state.error = null;
    },

    // ========================================
    // CLEAR DASHBOARD ERROR
    // ========================================

    clearDashboardError: (state) => {
      state.error = null;
    },

    // ========================================
    // RESET DASHBOARD
    // ========================================

    resetDashboard: () => initialState,
  },

  // ============================================
  // ASYNC THUNK HANDLERS
  // ============================================

  extraReducers: (builder) => {
    builder

      // ====================================
      // FETCH PENDING
      // ====================================

      .addCase(fetchDashboardOverview.pending, (state, action) => {
        state.loading = true;
        state.error = null;

        const filters = action.meta.arg || {};

        if (filters.period) {
          state.period = filters.period;
        }

        if (filters.period === "CUSTOM") {
          state.fromDate = filters.fromDate || "";
          state.toDate = filters.toDate || "";
        }
      })

      // ====================================
      // FETCH SUCCESS
      // ====================================

      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
        state.error = null;

        // Synchronize period with backend response
        state.period = action.payload?.period || state.period;

        // Store backend generated timestamp
        state.lastFetchedAt = action.payload?.generatedAt || null;
      })

      // ====================================
      // FETCH FAILED
      // ====================================

      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch dashboard overview";
      });
  },
});

// ============================================
// EXPORT ACTIONS
// ============================================

export const {
  setDashboardPeriod,
  setDashboardDateRange,
  clearDashboardError,
  resetDashboard,
} = dashboardSlice.actions;

// ============================================
// EXPORT SELECTORS
// ============================================

export const selectDashboard = (state) => state.dashboard.dashboard;

export const selectDashboardLoading = (state) => state.dashboard.loading;

export const selectDashboardError = (state) => state.dashboard.error;

export const selectDashboardPeriod = (state) => state.dashboard.period;

export const selectDashboardDateRange = (state) => ({
  fromDate: state.dashboard.fromDate,
  toDate: state.dashboard.toDate,
});

// ============================================
// EXPORT REDUCER
// ============================================

export default dashboardSlice.reducer;
