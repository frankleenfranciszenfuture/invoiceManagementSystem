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
    setSearch(state, action) {
      state.search = action.payload;
    },

    setSelectedWarehousesView(state, action) {
      state.selectedWarehousesView = action.payload;
    },

    setWarehousesStatus(state, action) {
      state.warehousesStatus = action.payload;
    },

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
