import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedSalesOrderView: "All Sales Orders",

  salesOrderStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Sales Orders",
      value: "ALL",
    },
    {
      label: "Draft Sales Orders",
      value: "DRAFT",
    },
    {
      label: "Confirmed Sales Orders",
      value: "CONFIRMED",
    },
    {
      label: "Dispatched Sales Orders",
      value: "DISPATCHED",
    },
    {
      label: "Cancelled Sales Orders",
      value: "CANCELLED",
    },
  ],
};

const salesOrderViewSlice = createSlice({
  name: "salesOrderView",

  initialState,

  reducers: {
    // =====================================================
    // SEARCH
    // =====================================================

    setSearch(state, action) {
      state.search = action.payload;
    },

    // =====================================================
    // SELECTED VIEW
    // =====================================================

    setSelectedSalesOrderView(state, action) {
      state.selectedSalesOrderView = action.payload;
    },

    // =====================================================
    // SALES ORDER STATUS
    // =====================================================

    setSalesOrderStatus(state, action) {
      state.salesOrderStatus = action.payload;
    },

    // =====================================================
    // RESET VIEW
    // =====================================================

    resetSalesOrderView(state) {
      state.selectedSalesOrderView = "All Sales Orders";
      state.salesOrderStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedSalesOrderView,
  setSalesOrderStatus,
  resetSalesOrderView,
} = salesOrderViewSlice.actions;

export default salesOrderViewSlice.reducer;
