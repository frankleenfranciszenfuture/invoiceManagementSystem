import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedSubCategoryView: "All Sub Categories",

  subCategoryStatus: "ALL",

  search: "",

  views: [
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
  ],
};

const subCategoryViewSlice = createSlice({
  name: "subCategoryView",

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

    setSelectedSubCategoryView(state, action) {
      state.selectedSubCategoryView = action.payload;
    },

    /* =====================================================
       SUB CATEGORY STATUS
    ===================================================== */

    setSubCategoryStatus(state, action) {
      state.subCategoryStatus = action.payload;
    },

    /* =====================================================
       RESET VIEW
    ===================================================== */

    resetSubCategoryView(state) {
      state.selectedSubCategoryView = "All Sub Categories";
      state.subCategoryStatus = "ALL";
      state.search = "";
    },
  },
});

export const {
  setSearch,
  setSelectedSubCategoryView,
  setSubCategoryStatus,
  resetSubCategoryView,
} = subCategoryViewSlice.actions;

export default subCategoryViewSlice.reducer;