import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedUnitView: "All Units",

  unitStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Units",
      value: "ALL",
    },
    {
      label: "Active Units",
      value: "ACTIVE",
    },
    {
      label: "Inactive Units",
      value: "INACTIVE",
    },
    {
      label: "Draft Units",
      value: "DRAFT",
    },
  ],
};

const unitViewSlice = createSlice({
  name: "unitView",

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

    setSelectedUnitView(state, action) {
      state.selectedUnitView = action.payload;
    },

    /* =====================================================
       UNIT STATUS
    ===================================================== */

    setUnitStatus(state, action) {
      state.unitStatus = action.payload;
    },

    /* =====================================================
       RESET VIEW
    ===================================================== */

    resetUnitView(state) {
      state.selectedUnitView = "All Units";
      state.unitStatus = "ALL";
      state.search = "";
    },
  },
});

export const { setSearch, setSelectedUnitView, setUnitStatus, resetUnitView } =
  unitViewSlice.actions;

export default unitViewSlice.reducer;
