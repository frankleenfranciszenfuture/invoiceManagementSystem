import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedSalesPersonView: "All Sales Persons",

  salesPersonStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Sales Persons",
      value: "ALL",
    },
    {
      label: "Active Sales Persons",
      value: "ACTIVE",
    },
    {
      label: "Inactive Sales Persons",
      value: "INACTIVE",
    },
    {
      label: "Draft Sales Persons",
      value: "DRAFT",
    },
  ],
};

const salesPersonViewSlice = createSlice({
  name: "salesPersonView",

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

    setSelectedSalesPersonView(state, action) {
      state.selectedSalesPersonView = action.payload;
    },

    /* =====================================================
       SALES PERSON STATUS
    ===================================================== */

    setSalesPersonStatus(state, action) {
      state.salesPersonStatus = action.payload;
    },

    /* =====================================================
       RESET VIEW
    ===================================================== */

    resetSalesPersonView(state) {
      state.selectedSalesPersonView = "All Sales Persons";
      state.salesPersonStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedSalesPersonView,
  setSalesPersonStatus,
  resetSalesPersonView,
} = salesPersonViewSlice.actions;

export default salesPersonViewSlice.reducer;
