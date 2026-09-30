import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedCompanyView: "All Companies",

  companyStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Companies",
      value: "ALL",
    },
    {
      label: "Active Companies",
      value: "ACTIVE",
    },
    {
      label: "Inactive Companies",
      value: "INACTIVE",
    },
    {
      label: "Draft Companies",
      value: "DRAFT",
    },
  ],
};

const companyViewSlice = createSlice({
  name: "companyView",

  initialState,

  reducers: {
    /* =====================================================
       SET SEARCH
    ===================================================== */

    setSearch(state, action) {
      state.search = action.payload;
    },

    /* =====================================================
       SET SELECTED COMPANY VIEW
    ===================================================== */

    setSelectedCompanyView(state, action) {
      state.selectedCompanyView = action.payload;
    },

    /* =====================================================
       SET COMPANY STATUS
    ===================================================== */

    setCompanyStatus(state, action) {
      state.companyStatus = action.payload;
    },

    /* =====================================================
       RESET COMPANY VIEW
    ===================================================== */

    resetCompanyView(state) {
      state.selectedCompanyView = "All Companies";

      state.companyStatus = "ALL";

      state.search = "";
    },
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setSearch,
  setSelectedCompanyView,
  setCompanyStatus,
  resetCompanyView,
} = companyViewSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default companyViewSlice.reducer;
