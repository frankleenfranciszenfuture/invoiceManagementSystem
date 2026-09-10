import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedTaxMasterView: "All Tax Masters",

  taxMasterStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Tax Masters",
      value: "ALL",
    },
    {
      label: "Active Tax Masters",
      value: "ACTIVE",
    },
    {
      label: "Inactive Tax Masters",
      value: "INACTIVE",
    },
    {
      label: "Draft Tax Masters",
      value: "DRAFT",
    },
  ],
};

const taxMasterViewSlice = createSlice({
  name: "taxMasterView",

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

    setSelectedTaxMasterView(state, action) {
      state.selectedTaxMasterView = action.payload;
    },

    /* =====================================================
       TAX MASTER STATUS
    ===================================================== */

    setTaxMasterStatus(state, action) {
      state.taxMasterStatus = action.payload;
    },

    /* =====================================================
       RESET VIEW
    ===================================================== */

    resetTaxMasterView(state) {
      state.selectedTaxMasterView = "All Tax Masters";
      state.taxMasterStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedTaxMasterView,
  setTaxMasterStatus,
  resetTaxMasterView,
} = taxMasterViewSlice.actions;

export default taxMasterViewSlice.reducer;
