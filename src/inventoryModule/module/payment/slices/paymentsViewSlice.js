import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedPaymentsView: "All Payments",

  paymentsStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Payments",
      value: "ALL",
    },
    {
      label: "Completed Payments",
      value: "COMPLETED",
    },
    {
      label: "Pending Payments",
      value: "PENDING",
    },
    {
      label: "Failed Payments",
      value: "FAILED",
    },
    {
      label: "Reversed Payments",
      value: "REVERSED",
    },
  ],
};

const paymentsViewSlice = createSlice({
  name: "paymentsView",

  initialState,

  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
    },

    setSelectedPaymentsView(state, action) {
      state.selectedPaymentsView = action.payload;
    },

    setPaymentsStatus(state, action) {
      state.paymentsStatus = action.payload;
    },

    resetPaymentsView(state) {
      state.selectedPaymentsView = "All Payments";
      state.paymentsStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedPaymentsView,
  setPaymentsStatus,
  resetPaymentsView,
} = paymentsViewSlice.actions;

export default paymentsViewSlice.reducer;
