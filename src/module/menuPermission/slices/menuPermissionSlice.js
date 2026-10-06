import { createSlice } from "@reduxjs/toolkit";

import {
  getAllModuleActions,

  // Role permission
  createRolePermission,
  getRolePermission,
  updateRolePermission,

  // User permission
  createUserPermission,
  createUserBulkPermission,
  getUserPermission,
  getUserPermissionById,
  updateUserPermission,
  updateUserBulkPermission,
} from "../thunks/menuPermissionThunks";

/* =========================================================
   RESPONSE HELPER
========================================================= */

const extractPermissionData = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  return [];
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  /*
   * All available module + action combinations
   */
  moduleActions: [],

  /*
   * Permissions assigned to current/selected role
   */
  rolePermissions: [],

  /*
   * Effective permissions for currently
   * logged-in user
   */
  userPermissions: [],

  /*
   * Permissions for selected user
   */
  selectedUserPermissions: [],

  /*
   * General request state
   */
  loading: false,

  /*
   * Specifically tracks current user's
   * permission loading state
   */
  userPermissionsLoading: false,

  /*
   * IMPORTANT:
   *
   * false = permission request has not completed
   * true  = permission request completed
   *
   * This allows [] to mean "loaded but no permissions".
   */
  userPermissionsLoaded: false,

  error: null,

  success: null,
};

/* =========================================================
   SLICE
========================================================= */

const MenuPermissionSlice = createSlice({
  name: "menuPermission",

  initialState,

  reducers: {
    /* =====================================================
           CLEAR ERROR
        ===================================================== */

    clearMenuPermissionError: (state) => {
      state.error = null;
    },

    /* =====================================================
           CLEAR SUCCESS
        ===================================================== */

    clearMenuPermissionSuccess: (state) => {
      state.success = null;
    },

    /* =====================================================
           CLEAR ALL PERMISSIONS
        ===================================================== */

    clearMenuPermissions: (state) => {
      state.moduleActions = [];

      state.rolePermissions = [];

      state.userPermissions = [];

      state.selectedUserPermissions = [];

      state.loading = false;

      state.userPermissionsLoading = false;

      state.userPermissionsLoaded = false;

      state.error = null;

      state.success = null;
    },

    /* =====================================================
           CLEAR ROLE PERMISSIONS
        ===================================================== */

    clearRolePermissions: (state) => {
      state.rolePermissions = [];
    },

    /* =====================================================
           CLEAR SELECTED USER PERMISSIONS
        ===================================================== */

    clearSelectedUserPermissions: (state) => {
      state.selectedUserPermissions = [];
    },

    /* =====================================================
           RESET CURRENT USER PERMISSION STATE
        ===================================================== */

    resetUserPermissionState: (state) => {
      state.userPermissions = [];

      state.userPermissionsLoading = false;

      state.userPermissionsLoaded = false;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===================================================
               GET ALL MODULE ACTIONS
            =================================================== */

      .addCase(getAllModuleActions.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(getAllModuleActions.fulfilled, (state, action) => {
        state.loading = false;

        state.moduleActions = extractPermissionData(action.payload);

        state.error = null;
      })

      .addCase(getAllModuleActions.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      })

      /* ===================================================
               CREATE ROLE PERMISSION
            =================================================== */

      .addCase(createRolePermission.pending, (state) => {
        state.loading = true;

        state.error = null;

        state.success = null;
      })

      .addCase(createRolePermission.fulfilled, (state, action) => {
        state.loading = false;

        state.success = action.payload?.message || true;

        state.error = null;
      })

      .addCase(createRolePermission.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      })

      /* ===================================================
               GET ROLE PERMISSION
            =================================================== */

      .addCase(getRolePermission.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(getRolePermission.fulfilled, (state, action) => {
        state.loading = false;

        state.rolePermissions = extractPermissionData(action.payload);

        state.error = null;
      })

      .addCase(getRolePermission.rejected, (state, action) => {
        state.loading = false;

        state.rolePermissions = [];

        state.error = action.payload;
      })

      /* ===================================================
               UPDATE ROLE PERMISSION
            =================================================== */

      .addCase(updateRolePermission.pending, (state) => {
        state.loading = true;

        state.error = null;

        state.success = null;
      })

      .addCase(updateRolePermission.fulfilled, (state, action) => {
        state.loading = false;

        state.success = action.payload?.message || true;

        state.error = null;
      })

      .addCase(updateRolePermission.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      })

      /* ===================================================
               CREATE USER PERMISSION
            =================================================== */

      .addCase(createUserPermission.pending, (state) => {
        state.loading = true;

        state.error = null;

        state.success = null;
      })

      .addCase(createUserPermission.fulfilled, (state, action) => {
        state.loading = false;

        state.success = action.payload?.message || true;

        state.error = null;
      })

      .addCase(createUserPermission.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      })

      /* ===================================================
               CREATE BULK USER PERMISSION
            =================================================== */

      .addCase(createUserBulkPermission.pending, (state) => {
        state.loading = true;

        state.error = null;

        state.success = null;
      })

      .addCase(createUserBulkPermission.fulfilled, (state, action) => {
        state.loading = false;

        state.success = action.payload?.message || true;

        state.error = null;
      })

      .addCase(createUserBulkPermission.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      })

      /* ===================================================
               GET CURRENT USER PERMISSION
            =================================================== */

      .addCase(getUserPermission.pending, (state) => {
        state.userPermissionsLoading = true;

        state.userPermissionsLoaded = false;

        state.error = null;
      })

      .addCase(getUserPermission.fulfilled, (state, action) => {
        state.userPermissionsLoading = false;

        state.userPermissionsLoaded = true;

        state.userPermissions = extractPermissionData(action.payload);

        state.error = null;
      })

      .addCase(getUserPermission.rejected, (state, action) => {
        state.userPermissionsLoading = false;

        /*
         * IMPORTANT:
         *
         * Request completed even when
         * backend returned an error.
         */
        state.userPermissionsLoaded = true;

        state.userPermissions = [];

        state.error = action.payload;
      })

      /* ===================================================
               GET USER PERMISSION BY ID
            =================================================== */

      .addCase(getUserPermissionById.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(getUserPermissionById.fulfilled, (state, action) => {
        state.loading = false;

        state.selectedUserPermissions = extractPermissionData(action.payload);

        state.error = null;
      })

      .addCase(getUserPermissionById.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      })

      /* ===================================================
               UPDATE USER PERMISSION
            =================================================== */

      .addCase(updateUserPermission.pending, (state) => {
        state.loading = true;

        state.error = null;

        state.success = null;
      })

      .addCase(updateUserPermission.fulfilled, (state, action) => {
        state.loading = false;

        state.success = action.payload?.message || true;

        state.error = null;
      })

      .addCase(updateUserPermission.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      })

      /* ===================================================
               UPDATE BULK USER PERMISSION
            =================================================== */

      .addCase(updateUserBulkPermission.pending, (state) => {
        state.loading = true;

        state.error = null;

        state.success = null;
      })

      .addCase(updateUserBulkPermission.fulfilled, (state, action) => {
        state.loading = false;

        state.success = action.payload?.message || true;

        state.error = null;
      })

      .addCase(updateUserBulkPermission.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearMenuPermissionError,
  clearMenuPermissionSuccess,
  clearMenuPermissions,
  clearRolePermissions,
  clearSelectedUserPermissions,
  resetUserPermissionState,
} = MenuPermissionSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectModuleActions = (state) =>
  state.menuPermission.moduleActions;

export const selectRolePermissions = (state) =>
  state.menuPermission.rolePermissions;

export const selectUserPermissions = (state) =>
  state.menuPermission.userPermissions;

export const selectSelectedUserPermissions = (state) =>
  state.menuPermission.selectedUserPermissions;

export const selectMenuPermissionLoading = (state) =>
  state.menuPermission.loading;

export const selectUserPermissionsLoading = (state) =>
  state.menuPermission.userPermissionsLoading;

export const selectUserPermissionsLoaded = (state) =>
  state.menuPermission.userPermissionsLoaded;

export const selectMenuPermissionError = (state) => state.menuPermission.error;

export const selectMenuPermissionSuccess = (state) =>
  state.menuPermission.success;

/* =========================================================
   REDUCER
========================================================= */

export default MenuPermissionSlice.reducer;
