import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedSizeView: "All Sizes",

  sizeStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Sizes",
      value: "ALL",
    },
    {
      label: "Active Sizes",
      value: "ACTIVE",
    },
    {
      label: "Inactive Sizes",
      value: "INACTIVE",
    },
    {
      label: "Draft Sizes",
      value: "DRAFT",
    },
  ],
};

const sizeViewSlice = createSlice({
  name: "sizeView",

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

    setSelectedSizeView(state, action) {
      state.selectedSizeView = action.payload;
    },

    /* =====================================================
       SIZE STATUS
    ===================================================== */

    setSizeStatus(state, action) {
      state.sizeStatus = action.payload;
    },

    /* =====================================================
       RESET VIEW
    ===================================================== */

    resetSizeView(state) {
      state.selectedSizeView = "All Sizes";
      state.sizeStatus = "ALL";
      state.search = "";
    },
  },
});

export const { setSearch, setSelectedSizeView, setSizeStatus, resetSizeView } =
  sizeViewSlice.actions;

export default sizeViewSlice.reducer;
