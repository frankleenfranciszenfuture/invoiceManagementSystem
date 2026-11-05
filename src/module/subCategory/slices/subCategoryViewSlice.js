import { createSlice } from "@reduxjs/toolkit";

/* =========================================================
   CONSTANTS
========================================================= */

const VALID_STATUSES = ["ALL", "ACTIVE", "INACTIVE", "DRAFT"];

const DEFAULT_VIEWS = [
  {
    label: "All Sub Categories",
    value: "ALL",
  },
  {
    label: "Active Sub Categories",
    value: "ACTIVE",
  },
  {
    label: "Inactive Sub Categories",
    value: "INACTIVE",
  },
  {
    label: "Draft Sub Categories",
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
    "All Sub Categories"
  );
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  selectedSubCategoryView: "All Sub Categories",

  subCategoryStatus: "ALL",

  search: "",

  views: DEFAULT_VIEWS,
};

/* =========================================================
   SLICE
========================================================= */

const subCategoryViewSlice = createSlice({
  name: "subCategoryView",

  initialState,

  reducers: {
    /* =============================================
           SEARCH
        ============================================= */

    setSearch(state, action) {
      state.search = action.payload ?? "";
    },

    /* =============================================
           SELECTED VIEW
        ============================================= */

    setSelectedSubCategoryView(state, action) {
      const status = normalizeStatus(action.payload);

      state.subCategoryStatus = status;
      state.selectedSubCategoryView = getViewLabel(status);
    },

    /* =============================================
           SUB CATEGORY STATUS
        ============================================= */

    setSubCategoryStatus(state, action) {
      const status = normalizeStatus(action.payload);

      state.subCategoryStatus = status;
      state.selectedSubCategoryView = getViewLabel(status);
    },

    /* =============================================
           RESET VIEW
        ============================================= */

    resetSubCategoryView(state) {
      state.selectedSubCategoryView = "All Sub Categories";
      state.subCategoryStatus = "ALL";
      state.search = "";
    },
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  setSearch,
  setSelectedSubCategoryView,
  setSubCategoryStatus,
  resetSubCategoryView,
} = subCategoryViewSlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default subCategoryViewSlice.reducer;
