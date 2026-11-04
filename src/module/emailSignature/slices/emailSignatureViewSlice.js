import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedEmailSignatureView: "All Email Signatures",
  emailSignatureStatus: "ALL",
  search: "",

  views: [
    {
      label: "All Email Signatures",
      value: "ALL",
    },
    {
      label: "Active Email Signatures",
      value: "ACTIVE",
    },
    {
      label: "Inactive Email Signatures",
      value: "INACTIVE",
    },
  ],
};

const emailSignatureViewSlice = createSlice({
  name: "emailSignatureView",
  initialState,

  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },

    setSelectedEmailSignatureView: (state, action) => {
      state.selectedEmailSignatureView = action.payload;
    },

    setEmailSignatureStatus: (state, action) => {
      state.emailSignatureStatus = action.payload;
    },

    resetEmailSignatureView: () => initialState,
  },
});

export const {
  setSearch,
  setSelectedEmailSignatureView,
  setEmailSignatureStatus,
  resetEmailSignatureView,
} = emailSignatureViewSlice.actions;

export default emailSignatureViewSlice.reducer;
