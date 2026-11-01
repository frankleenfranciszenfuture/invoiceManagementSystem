import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedExpenseCategoryView: "All Expense Categories",

  expenseCategoryStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Expense Categories",
      value: "ALL",
    },
    {
      label: "Active Expense Categories",
      value: "ACTIVE",
    },
    {
      label: "Inactive Expense Categories",
      value: "INACTIVE",
    },
  ],
};

const expenseCategoryViewSlice = createSlice({
  name: "expenseCategoryView",
  initialState,

  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },

    setSelectedExpenseCategoryView: (state, action) => {
      state.selectedExpenseCategoryView = action.payload.label;
      state.expenseCategoryStatus = action.payload.value;
    },

    setExpenseCategoryStatus: (state, action) => {
      state.expenseCategoryStatus = action.payload;
    },

    resetExpenseCategoryView: (state) => {
      state.selectedExpenseCategoryView = "All Expense Categories";
      state.expenseCategoryStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedExpenseCategoryView,
  setExpenseCategoryStatus,
  resetExpenseCategoryView,
} = expenseCategoryViewSlice.actions;

export default expenseCategoryViewSlice.reducer;
