import { createSlice } from "@reduxjs/toolkit";

/* =========================================================
   CONSTANTS
========================================================= */

const STATUS_LABELS = {
  ALL: "All Tax Masters",
  ACTIVE: "Active Tax Masters",
  INACTIVE: "Inactive Tax Masters",
  DRAFT: "Draft Tax Masters",
};

const VALID_STATUSES = Object.keys(STATUS_LABELS);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  selectedTaxMasterView: "All Tax Masters",

  taxMasterStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Tax Masters",
      value: "ALL",
    },
    {
      label: "Active Tax Masters",
      value: "ACTIVE",
    },
    {
      label: "Inactive Tax Masters",
      value: "INACTIVE",
    },
    {
      label: "Draft Tax Masters",
      value: "DRAFT",
    },
  ],
};

/* =========================================================
   SLICE
========================================================= */

const taxMasterViewSlice = createSlice({
  name: "taxMasterView",

  initialState,

  reducers: {
    /* =================================================
           SEARCH
        ================================================= */

    setSearch(state, action) {
      state.search = String(action.payload ?? "");
    },

    /* =================================================
           SELECTED VIEW
        ================================================= */

    setSelectedTaxMasterView(state, action) {
      const selectedView = action.payload;

      const matchingView = Object.values(STATUS_LABELS).includes(selectedView);

      if (matchingView) {
        state.selectedTaxMasterView = selectedView;
      }
    },

    /* =================================================
           TAX MASTER STATUS
        ================================================= */

    setTaxMasterStatus(state, action) {
      const status = String(action.payload ?? "")
        .trim()
        .toUpperCase();

      const normalizedStatus = VALID_STATUSES.includes(status) ? status : "ALL";

      state.taxMasterStatus = normalizedStatus;

      state.selectedTaxMasterView = STATUS_LABELS[normalizedStatus];
    },

    /* =================================================
           RESET VIEW
        ================================================= */

    resetTaxMasterView(state) {
      state.selectedTaxMasterView = STATUS_LABELS.ALL;

      state.taxMasterStatus = "ALL";

      state.search = "";
    },
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  setSearch,
  setSelectedTaxMasterView,
  setTaxMasterStatus,
  resetTaxMasterView,
} = taxMasterViewSlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default taxMasterViewSlice.reducer;
