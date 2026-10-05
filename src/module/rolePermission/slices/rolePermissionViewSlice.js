import { createSlice } from "@reduxjs/toolkit";

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  /* =======================================================
     SELECTED ROLE PERMISSION VIEW
  ======================================================= */

  selectedRolePermissionView: "All Permissions",

  /* =======================================================
     SEARCH
  ======================================================= */

  search: "",

  /* =======================================================
     SELECTED ROLE
  ======================================================= */

  selectedRoleId: null,

  selectedRoleName: "",

  /* =======================================================
     PERMISSION VIEWS
  ======================================================= */

  views: [
    {
      label: "All Permissions",
      value: "ALL",
    },
    {
      label: "Allowed Permissions",
      value: "ALLOWED",
    },
    {
      label: "Denied Permissions",
      value: "DENIED",
    },
  ],
};

/* =========================================================
   SLICE
   ========================================================= */

const rolePermissionViewSlice = createSlice({
  name: "rolePermissionView",

  initialState,

  reducers: {
    /* =====================================================
       SET SEARCH
    ===================================================== */

    setSearch(state, action) {
      state.search = action.payload;
    },

    /* =====================================================
       SET SELECTED ROLE PERMISSION VIEW
    ===================================================== */

    setSelectedRolePermissionView(state, action) {
      state.selectedRolePermissionView = action.payload;
    },

    /* =====================================================
       SET SELECTED ROLE
    ===================================================== */

    setSelectedRole(state, action) {
      const role = action.payload;

      if (role && typeof role === "object") {
        state.selectedRoleId = role.id ?? null;

        state.selectedRoleName = role.roleName ?? "";
      } else {
        state.selectedRoleId = role ?? null;

        state.selectedRoleName = "";
      }
    },

    /* =====================================================
       SET SELECTED ROLE ID
    ===================================================== */

    setSelectedRoleId(state, action) {
      state.selectedRoleId =
        action.payload !== null && action.payload !== undefined
          ? Number(action.payload)
          : null;
    },

    /* =====================================================
       SET SELECTED ROLE NAME
    ===================================================== */

    setSelectedRoleName(state, action) {
      state.selectedRoleName = action.payload || "";
    },

    /* =====================================================
       RESET ROLE PERMISSION VIEW
    ===================================================== */

    resetRolePermissionView(state) {
      state.selectedRolePermissionView = "All Permissions";

      state.search = "";

      state.selectedRoleId = null;

      state.selectedRoleName = "";
    },
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setSearch,

  setSelectedRolePermissionView,

  setSelectedRole,

  setSelectedRoleId,

  setSelectedRoleName,

  resetRolePermissionView,
} = rolePermissionViewSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default rolePermissionViewSlice.reducer;
