import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedPartyView: "All Parties",
  partyStatus: "ALL",
  search: "",

  views: [
    {
      label: "All Parties",
      value: "ALL",
    },
    {
      label: "Active Parties",
      value: "ACTIVE",
    },
    {
      label: "Inactive Parties",
      value: "INACTIVE",
    },
    {
      label: "Draft Parties",
      value: "DRAFT",
    },
  ],
};

const partyViewSlice = createSlice({
  name: "partyView",
  initialState,

  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
    },

    setSelectedPartyView(state, action) {
      state.selectedPartyView = action.payload;
    },

    setPartyStatus(state, action) {
      state.partyStatus = action.payload;
    },

    resetPartyView(state) {
      state.selectedPartyView = "All Parties";
      state.partyStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedPartyView,
  setPartyStatus,
  resetPartyView,
} = partyViewSlice.actions;

export default partyViewSlice.reducer;
