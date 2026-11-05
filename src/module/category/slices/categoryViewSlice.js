import { createSlice } from "@reduxjs/toolkit";

/* =========================================================
   CONSTANTS
========================================================= */

const VALID_STATUSES = ["ALL", "ACTIVE", "INACTIVE", "DRAFT"];

const DEFAULT_VIEWS = [
  {
    label: "All Categories",
    value: "ALL",
  },
  {
    label: "Active Categories",
    value: "ACTIVE",
  },
  {
    label: "Inactive Categories",
    value: "INACTIVE",
  },
  {
    label: "Draft Categories",
    value: "DRAFT",
  },
];

/* =========================================================
   HELPERS
========================================================= */

const normalizeStatus = (value) => {
  const status = String(value ?? "ALL")
    .trim()
    .toUpperCase();

  return VALID_STATUSES.includes(status) ? status : "ALL";
};

const getViewLabel = (status) => {
  return (
    DEFAULT_VIEWS.find((view) => view.value === status)?.label ||
    "All Categories"
  );
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  selectedCategoryView: "All Categories",

  status: "ALL",

  search: "",

  views: DEFAULT_VIEWS,
};

/* =========================================================
   SLICE
========================================================= */

const categoryViewSlice = createSlice({
  name: "categoryView",

  initialState,

  reducers: {
    /* =================================================
           SEARCH
        ================================================= */

    setSearch(state, action) {
      state.search = action.payload ?? "";
    },

    /* =================================================
           SELECTED VIEW
        ================================================= */

    setSelectedCategoryView(state, action) {
      const status = normalizeStatus(action.payload);

      state.status = status;
      state.selectedCategoryView = getViewLabel(status);
    },

    /* =================================================
           CATEGORY STATUS
        ================================================= */

    setCategoryStatus(state, action) {
      const status = normalizeStatus(action.payload);

      state.status = status;
      state.selectedCategoryView = getViewLabel(status);
    },

    /* =================================================
           RESET VIEW
        ================================================= */

    resetCategoryView(state) {
      state.selectedCategoryView = "All Categories";
      state.status = "ALL";
      state.search = "";
    },
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  setSearch,
  setSelectedCategoryView,
  setCategoryStatus,
  resetCategoryView,
} = categoryViewSlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default categoryViewSlice.reducer;
