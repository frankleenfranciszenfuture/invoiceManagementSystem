import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedWarehousesView: "All Warehouses",

  warehousesStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Warehouses",
      value: "ALL",
    },
    {
      label: "Active Warehouses",
      value: "ACTIVE",
    },
    {
      label: "Inactive Warehouses",
      value: "INACTIVE",
    },
  ],
};

const warehousesViewSlice = createSlice({
  name: "warehousesView",

  initialState,

  reducers: {
    /* =====================================================
           SEARCH
        ===================================================== */

    setSearch(state, action) {
      state.search = action.payload;
    },

    /* =====================================================
           SELECTED VIEW
        ===================================================== */

    setSelectedWarehousesView(state, action) {
      state.selectedWarehousesView = action.payload;
    },

    /* =====================================================
           BANK ACCOUNT STATUS
        ===================================================== */

    setWarehousesStatus(state, action) {
      state.warehousesStatus = action.payload;
    },

    /* =====================================================
           RESET VIEW
        ===================================================== */

    resetWarehousesView(state) {
      state.selectedWarehousesView = "All Warehouses";

      state.warehousesStatus = "ALL";

      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedWarehousesView,
  setWarehousesStatus,
  resetWarehousesView,
} = warehousesViewSlice.actions;

export default warehousesViewSlice.reducer;
