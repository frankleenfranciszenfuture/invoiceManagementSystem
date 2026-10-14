import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedCurrencyView: "All Currencies",

  currencyStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Currencies",
      value: "ALL",
    },
    {
      label: "Active Currencies",
      value: "ACTIVE",
    },
    {
      label: "Inactive Currencies",
      value: "INACTIVE",
    },
    {
      label: "Draft Currencies",
      value: "DRAFT",
    },
  ],
};

const currencyViewSlice = createSlice({
  name: "currencyView",

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

    setSelectedCurrencyView(state, action) {
      state.selectedCurrencyView = action.payload;
    },

    /* =====================================================
       CURRENCY STATUS
    ===================================================== */

    setCurrencyStatus(state, action) {
      state.currencyStatus = action.payload;
    },

    /* =====================================================
       RESET VIEW
    ===================================================== */

    resetCurrencyView(state) {
      state.selectedCurrencyView = "All Currencies";
      state.currencyStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedCurrencyView,
  setCurrencyStatus,
  resetCurrencyView,
} = currencyViewSlice.actions;

export default currencyViewSlice.reducer;
