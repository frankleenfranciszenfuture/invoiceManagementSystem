import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedCategoryView: "All Categories",

  categoryStatus: "ALL",

  search: "",

  views: [
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
  ],
};

const categoryViewSlice = createSlice({
  name: "categoryView",

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

    setSelectedCategoryView(state, action) {
      state.selectedCategoryView = action.payload;
    },

    /* =====================================================
       CATEGORY STATUS
    ===================================================== */

    setCategoryStatus(state, action) {
      state.categoryStatus = action.payload;
    },

    /* =====================================================
       RESET VIEW
    ===================================================== */

    resetCategoryView(state) {
      state.selectedCategoryView = "All Categories";
      state.categoryStatus = "ALL";
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
