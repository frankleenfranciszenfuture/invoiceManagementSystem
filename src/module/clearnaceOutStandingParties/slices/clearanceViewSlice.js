import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedPartyView: "All Clearances",
  clearanceStatus: "ALL",
  search: "",

  views: [
    {
      label: "All Clearances",
      value: "ALL",
    },
    {
      label: "Active Clearances",
      value: "ACTIVE",
    },
    {
      label: "Inactive Clearances",
      value: "INACTIVE",
    },
    {
      label: "Draft Clearances",
      value: "DRAFT",
    },
  ],
};

const clearanceViewSlice = createSlice({
  name: "clearanceView",
  initialState,

  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
    },

    setSelectedClearanceView(state, action) {
      state.selectedPartyView = action.payload;
    },

    setClearanceStatus(state, action) {
      state.clearanceStatus = action.payload;
    },

    resetClearanceView(state) {
      state.selectedPartyView = "All Clearances";
      state.clearanceStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedClearanceView,
  setClearanceStatus,
  resetClearanceView,
} = clearanceViewSlice.actions;

export default clearanceViewSlice.reducer;
