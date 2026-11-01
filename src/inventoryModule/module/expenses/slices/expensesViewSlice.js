import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedExpensesView: "All Expenses",

  expensesStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Expenses",
      value: "ALL",
    },
    {
      label: "Active Expenses",
      value: "ACTIVE",
    },
    {
      label: "Inactive Expenses",
      value: "INACTIVE",
    },
  ],
};

const expensesViewSlice = createSlice({
  name: "expensesView",

  initialState,

  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
    },

    setSelectedExpensesView(state, action) {
      state.selectedExpensesView = action.payload;
    },

    setExpensesStatus(state, action) {
      state.expensesStatus = action.payload;
    },

    resetExpensesView(state) {
      state.selectedExpensesView = "All Expenses";
      state.expensesStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedExpensesView,
  setExpensesStatus,
  resetExpensesView,
} = expensesViewSlice.actions;

export default expensesViewSlice.reducer;
