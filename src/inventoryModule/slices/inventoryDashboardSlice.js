import { createSlice } from "@reduxjs/toolkit";
import { fetchInventoryDashboard } from "../thunks/inventoryDashboardThunk";

const initialState = {
  dashboard: null,

  loading: false,
  error: null,

  filters: {
    fromDate: "",
    toDate: "",
    warehouseId: "",
    productId: "",
    unitId: "",
    sizeId: "",
    movementType: "",
    referenceType: "",
    page: 0,
    size: 10,
    sortBy: "transactionDate",
    sortDirection: "DESC",
  },
};

const inventoryDashboardSlice = createSlice({
  name: "inventoryDashboard",
  initialState,

  reducers: {
    setDashboardFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
        page: 0,
      };
    },

    setDashboardPage: (state, action) => {
      state.filters.page = action.payload;
    },

    resetDashboardFilters: (state) => {
      state.filters = initialState.filters;
    },

    clearDashboardError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // FETCH PENDING
      .addCase(fetchInventoryDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // FETCH SUCCESS
      .addCase(fetchInventoryDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
        state.error = null;
      })

      // FETCH ERROR
      .addCase(fetchInventoryDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setDashboardFilters,
  setDashboardPage,
  resetDashboardFilters,
  clearDashboardError,
} = inventoryDashboardSlice.actions;

export default inventoryDashboardSlice.reducer;
