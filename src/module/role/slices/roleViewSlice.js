import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedRoleView: "All Roles",

  roleStatus: "ALL",

  search: "",

  views: [
    {
      label: "All Roles",
      value: "ALL",
    },
    {
      label: "Active Roles",
      value: "ACTIVE",
    },
    {
      label: "Inactive Roles",
      value: "INACTIVE",
    },
    {
      label: "Draft Roles",
      value: "DRAFT",
    },
  ],
};

const roleViewSlice = createSlice({
  name: "roleView",

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

    setSelectedRoleView(state, action) {
      state.selectedRoleView = action.payload;
    },

    /* =====================================================
       ROLE STATUS
    ===================================================== */

    setRoleStatus(state, action) {
      state.roleStatus = action.payload;
    },

    /* =====================================================
       RESET VIEW
    ===================================================== */

    resetRoleView(state) {
      state.selectedRoleView = "All Roles";
      state.roleStatus = "ALL";
      state.search = "";
    },
  },
});

export const { setSearch, setSelectedRoleView, setRoleStatus, resetRoleView } =
  roleViewSlice.actions;

export default roleViewSlice.reducer;
