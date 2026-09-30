import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedBankAccountView: "All Bank Accounts",

  bankAccountStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Bank Accounts",
      value: "ALL",
    },
    {
      label: "Active Bank Accounts",
      value: "ACTIVE",
    },
    {
      label: "Inactive Bank Accounts",
      value: "INACTIVE",
    },
    {
      label: "Primary Bank Accounts",
      value: "PRIMARY",
    },
  ],
};

const bankAccountViewSlice = createSlice({
  name: "bankAccountView",

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

    setSelectedBankAccountView(state, action) {
      state.selectedBankAccountView = action.payload;
    },

    /* =====================================================
           BANK ACCOUNT STATUS
        ===================================================== */

    setBankAccountStatus(state, action) {
      state.bankAccountStatus = action.payload;
    },

    /* =====================================================
           RESET VIEW
        ===================================================== */

    resetBankAccountView(state) {
      state.selectedBankAccountView = "All Bank Accounts";

      state.bankAccountStatus = "ALL";

      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedBankAccountView,
  setBankAccountStatus,
  resetBankAccountView,
} = bankAccountViewSlice.actions;

export default bankAccountViewSlice.reducer;
