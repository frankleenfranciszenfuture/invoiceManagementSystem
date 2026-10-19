import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedEmailSignatureView: "All EmailSignatures",

  emailSignatureStatus: "ALL",

  search: "",

  views: [
    {
      label: "All EmailSignatures",
      value: "ALL",
    },
    {
      label: "Active EmailSignatures",
      value: "ACTIVE",
    },
    {
      label: "Inactive EmailSignatures",
      value: "INACTIVE",
    },
    {
      label: "Draft EmailSignatures",
      value: "DRAFT",
    },
  ],
};

const emailSignatureViewSlice = createSlice({
  name: "emailSignatureView",

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

    setSelectedEmailSignatureView(state, action) {
      state.selectedEmailSignatureView = action.payload;
    },

    /* =====================================================
       CURRENCY STATUS
    ===================================================== */

    setEmailSignatureStatus(state, action) {
      state.emailSignatureStatus = action.payload;
    },

    /* =====================================================
       RESET VIEW
    ===================================================== */

    resetEmailSignatureView(state) {
      state.selectedEmailSignatureView = "All EmailSignatures";
      state.emailSignatureStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedEmailSignatureView,
  setEmailSignatureStatus,
  resetEmailSignatureView,
} = emailSignatureViewSlice.actions;

export default emailSignatureViewSlice.reducer;
