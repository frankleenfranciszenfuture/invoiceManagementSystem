import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedCashAccountsView: "All Cash Accounts",

  cashAccountsStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Cash Accounts",
      value: "ALL",
    },
    {
      label: "Active Cash Accounts",
      value: "ACTIVE",
    },
    {
      label: "Inactive Cash Accounts",
      value: "INACTIVE",
    },
  ],
};

const cashAccountsViewSlice = createSlice({
  name: "cashAccountsView",

  initialState,

  reducers: {
    setCashAccountsSearch(state, action) {
      state.search = action.payload;
    },

    setSelectedCashAccountsView(state, action) {
      state.selectedCashAccountsView = action.payload;
    },

    setCashAccountsStatus(state, action) {
      state.cashAccountsStatus = action.payload;
    },

    resetCashAccountsView(state) {
      state.selectedCashAccountsView = "All Cash Accounts";
      state.cashAccountsStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setCashAccountsSearch,
  setSelectedCashAccountsView,
  setCashAccountsStatus,
  resetCashAccountsView,
} = cashAccountsViewSlice.actions;

export default cashAccountsViewSlice.reducer;
