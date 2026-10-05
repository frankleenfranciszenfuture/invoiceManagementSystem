import { createSlice } from "@reduxjs/toolkit";

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  /* =======================================================
     SELECTED USER PERMISSION VIEW
  ======================================================= */

  selectedUserPermissionView: "All Permissions",

  /* =======================================================
     SEARCH
  ======================================================= */

  search: "",

  /* =======================================================
     SELECTED USER
  ======================================================= */

  selectedUserId: null,

  selectedUserName: "",

  /* =======================================================
     SELECTED ROLE
     Optional but useful for displaying user's role.
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

const userPermissionViewSlice = createSlice({
  name: "userPermissionView",

  initialState,

  reducers: {
    /* =====================================================
       SET SEARCH
    ===================================================== */

    setSearch(state, action) {
      state.search = action.payload;
    },

    /* =====================================================
       SET SELECTED USER PERMISSION VIEW
    ===================================================== */

    setSelectedUserPermissionView(state, action) {
      state.selectedUserPermissionView = action.payload;
    },

    /* =====================================================
       SET SELECTED USER
    ===================================================== */

    setSelectedUser(state, action) {
      const user = action.payload;

      if (user && typeof user === "object") {
        state.selectedUserId = user.id ?? user.userId ?? null;

        state.selectedUserName = user.userName ?? user.username ?? "";

        state.selectedRoleId = user.roleId ?? null;

        state.selectedRoleName = user.roleName ?? "";
      } else {
        state.selectedUserId = user ?? null;

        state.selectedUserName = "";

        state.selectedRoleId = null;

        state.selectedRoleName = "";
      }
    },

    /* =====================================================
       SET SELECTED USER ID
    ===================================================== */

    setSelectedUserId(state, action) {
      state.selectedUserId =
        action.payload !== null && action.payload !== undefined
          ? Number(action.payload)
          : null;
    },

    /* =====================================================
       SET SELECTED USER NAME
    ===================================================== */

    setSelectedUserName(state, action) {
      state.selectedUserName = action.payload || "";
    },

    /* =====================================================
       SET SELECTED ROLE
    ===================================================== */

    setSelectedRole(state, action) {
      const role = action.payload;

      if (role && typeof role === "object") {
        state.selectedRoleId = role.id ?? role.roleId ?? null;

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
       RESET USER PERMISSION VIEW
    ===================================================== */

    resetUserPermissionView(state) {
      state.selectedUserPermissionView = "All Permissions";

      state.search = "";

      state.selectedUserId = null;

      state.selectedUserName = "";

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

  setSelectedUserPermissionView,

  setSelectedUser,

  setSelectedUserId,

  setSelectedUserName,

  setSelectedRole,

  setSelectedRoleId,

  setSelectedRoleName,

  resetUserPermissionView,
} = userPermissionViewSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default userPermissionViewSlice.reducer;
