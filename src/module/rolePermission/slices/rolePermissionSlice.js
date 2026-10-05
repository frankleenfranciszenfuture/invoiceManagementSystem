import { createSlice } from "@reduxjs/toolkit";

import {
  createRolePermission,
  fetchAllRolePermissions,
  fetchRolePermissionById,
  fetchRolePermissionsByRoleId,
  updateRolePermission,
  deleteRolePermission,
} from "../thunks/rolePermissionThunks";

/*
 * ============================================================
 * EMPTY ROLE PERMISSION
 * ============================================================
 */

const emptyRolePermission = {
  id: null,

  roleId: null,
  roleName: "",

  moduleId: null,
  moduleName: "",

  actionId: null,
  actionName: "",

  allowed: false,

  status: "ACTIVE",
  active: true,
};

/*
 * ============================================================
 * BUILD PERMISSION MATRIX
 * ============================================================
 *
 * Example:
 *
 * {
 *   "1-1": true,
 *   "1-2": false,
 *   "2-1": true
 * }
 *
 * Key:
 *
 * moduleId-actionId
 * ============================================================
 */

const buildPermissionMatrix = (permissions = []) => {
  const matrix = {};

  if (!Array.isArray(permissions)) {
    return matrix;
  }

  permissions.forEach((permission) => {
    const moduleId = permission?.moduleId;

    const actionId = permission?.actionId;

    if (moduleId == null || actionId == null) {
      return;
    }

    matrix[`${moduleId}-${actionId}`] =
      permission?.active !== false && permission?.allowed === true;
  });

  return matrix;
};

/*
 * ============================================================
 * BUILD MY PERMISSIONS
 * ============================================================
 *
 * Converts:
 *
 * [
 *   {
 *     moduleId: 1,
 *     moduleName: "Dashboard",
 *     actionName: "VIEW",
 *     allowed: true
 *   }
 * ]
 *
 * Into:
 *
 * [
 *   {
 *     moduleId: 1,
 *     moduleName: "Dashboard",
 *     actions: ["VIEW"]
 *   }
 * ]
 *
 * ============================================================
 */

const buildMyPermissions = (permissions = []) => {
  const grouped = {};

  if (!Array.isArray(permissions)) {
    return [];
  }

  permissions.forEach((permission) => {
    if (
      permission?.moduleId == null ||
      !permission?.moduleName ||
      !permission?.actionName
    ) {
      return;
    }

    /*
     * Only ACTIVE + ALLOWED permissions
     * become effective permissions.
     */

    if (permission?.active === false || permission?.allowed !== true) {
      return;
    }

    const moduleId = permission.moduleId;

    const moduleName = permission.moduleName;

    const actionName = String(permission.actionName).trim().toUpperCase();

    if (!grouped[moduleId]) {
      grouped[moduleId] = {
        moduleId,

        moduleName,

        actions: [],
      };
    }

    if (!grouped[moduleId].actions.includes(actionName)) {
      grouped[moduleId].actions.push(actionName);
    }
  });

  return Object.values(grouped);
};

/*
 * ============================================================
 * EXTRACT RESPONSE DATA
 * ============================================================
 *
 * Supports:
 *
 * response.data = [...]
 *
 * OR
 *
 * response.data.content = [...]
 *
 * ============================================================
 */

const extractPermissionData = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  return [];
};

/*
 * ============================================================
 * SET ROLE PERMISSIONS
 * ============================================================
 *
 * Common helper used by multiple reducers.
 * ============================================================
 */

const applyRolePermissions = (state, permissions) => {
  const safePermissions = Array.isArray(permissions) ? permissions : [];

  state.rolePermissions = safePermissions;

  state.permissionMatrix = buildPermissionMatrix(safePermissions);

  state.myPermissions = buildMyPermissions(safePermissions);
};

/*
 * ============================================================
 * INITIAL STATE
 * ============================================================
 */

const initialState = {
  /*
   * All permissions for selected role.
   */

  rolePermissions: [],

  /*
   * Simplified permission structure.
   */

  myPermissions: [],

  /*
   * Current permission form.
   */

  rolePermission: {
    ...emptyRolePermission,
  },

  /*
   * Existing permission when editing.
   */

  exsistingRolePermission: null,

  /*
   * Selected role.
   */

  selectedRoleId: null,

  selectedRoleName: "",

  /*
   * Checkbox matrix.
   */

  permissionMatrix: {},

  /*
   * General CRUD loading.
   */

  loading: false,

  /*
   * Specifically tracks:
   *
   * GET /role-permissions/role/{roleId}
   */

  rolePermissionsLoading: false,

  /*
   * IMPORTANT:
   *
   * Tells the UI whether the initial role
   * permission request has completed.
   */

  rolePermissionsLoaded: false,

  /*
   * Request status.
   */

  success: false,

  /*
   * Error.
   */

  error: null,

  /*
   * Message.
   */

  message: "",
};

/*
 * ============================================================
 * SLICE
 * ============================================================
 */

const rolePermissionSlice = createSlice({
  name: "rolePermission",

  initialState,

  reducers: {
    /*
     * ========================================================
     * RESET FORM
     * ========================================================
     */

    resetRolePermissionForm: (state) => {
      state.rolePermission = {
        ...emptyRolePermission,
      };

      state.exsistingRolePermission = null;

      state.error = null;

      state.message = "";

      state.success = false;
    },

    /*
     * ========================================================
     * SET SELECTED ROLE
     * ========================================================
     */

    setSelectedRole: (state, action) => {
      state.selectedRoleId = action.payload?.roleId ?? null;

      state.selectedRoleName = action.payload?.roleName || "";
    },

    /*
     * ========================================================
     * CLEAR SELECTED ROLE
     * ========================================================
     */

    clearSelectedRole: (state) => {
      state.selectedRoleId = null;

      state.selectedRoleName = "";

      state.rolePermissions = [];

      state.permissionMatrix = {};

      state.myPermissions = [];

      state.rolePermissionsLoaded = false;
    },

    /*
     * ========================================================
     * CLEAR ERROR
     * ========================================================
     */

    clearRolePermissionError: (state) => {
      state.error = null;
    },

    /*
     * ========================================================
     * CLEAR MESSAGE
     * ========================================================
     */

    clearRolePermissionMessage: (state) => {
      state.message = "";
    },

    /*
     * ========================================================
     * RESET ROLE PERMISSIONS
     * ========================================================
     */

    resetRolePermissions: (state) => {
      state.rolePermissions = [];

      state.permissionMatrix = {};

      state.myPermissions = [];

      state.rolePermissionsLoaded = false;

      state.rolePermission = {
        ...emptyRolePermission,
      };

      state.exsistingRolePermission = null;
    },
  },

  /*
   * ==========================================================
   * EXTRA REDUCERS
   * ==========================================================
   */

  extraReducers: (builder) => {
    // ========================================================
    // CREATE ROLE PERMISSION
    // ========================================================

    builder

      .addCase(
        createRolePermission.pending,

        (state) => {
          state.loading = true;

          state.success = false;

          state.error = null;

          state.message = "";
        },
      )

      .addCase(
        createRolePermission.fulfilled,

        (state, action) => {
          state.loading = false;

          state.success = true;

          state.error = null;

          const response = action.payload;

          const createdPermission = response?.data;

          if (createdPermission) {
            /*
             * Update current form.
             */

            state.rolePermission = createdPermission;

            /*
             * Add/update list.
             */

            const existingIndex = state.rolePermissions.findIndex(
              (permission) => permission.id === createdPermission.id,
            );

            if (existingIndex === -1) {
              state.rolePermissions.push(createdPermission);
            } else {
              state.rolePermissions[existingIndex] = createdPermission;
            }

            /*
             * Rebuild permissions.
             */

            state.permissionMatrix = buildPermissionMatrix(
              state.rolePermissions,
            );

            state.myPermissions = buildMyPermissions(state.rolePermissions);

            state.rolePermissionsLoaded = true;
          }

          state.message =
            response?.message || "Role permission created successfully.";
        },
      )

      .addCase(
        createRolePermission.rejected,

        (state, action) => {
          state.loading = false;

          state.success = false;

          state.error = action.payload || "Failed to create role permission.";

          state.message = "";
        },
      );

    // ========================================================
    // FETCH ALL ROLE PERMISSIONS
    // ========================================================

    builder

      .addCase(
        fetchAllRolePermissions.pending,

        (state) => {
          state.loading = true;

          state.success = false;

          state.error = null;

          state.message = "";
        },
      )

      .addCase(
        fetchAllRolePermissions.fulfilled,

        (state, action) => {
          state.loading = false;

          state.success = true;

          state.error = null;

          const response = action.payload;

          const permissions = extractPermissionData(response);

          applyRolePermissions(state, permissions);

          state.rolePermissionsLoaded = true;

          state.message =
            response?.message || "Role permissions fetched successfully.";
        },
      )

      .addCase(
        fetchAllRolePermissions.rejected,

        (state, action) => {
          state.loading = false;

          state.success = false;

          /*
           * Mark the request as completed.
           *
           * The ADMIN sidebar does not depend on this,
           * so ADMIN can still render.
           */

          state.rolePermissionsLoaded = true;

          state.rolePermissions = [];

          state.permissionMatrix = {};

          state.myPermissions = [];

          state.error = action.payload || "Failed to fetch role permissions.";

          state.message = "";
        },
      );

    // ========================================================
    // FETCH ROLE PERMISSION BY ID
    // ========================================================

    builder

      .addCase(
        fetchRolePermissionById.pending,

        (state) => {
          state.loading = true;

          state.success = false;

          state.error = null;

          state.message = "";
        },
      )

      .addCase(
        fetchRolePermissionById.fulfilled,

        (state, action) => {
          state.loading = false;

          state.success = true;

          state.error = null;

          const response = action.payload;

          state.rolePermission = response?.data || {
            ...emptyRolePermission,
          };

          state.exsistingRolePermission = response?.data || null;

          state.message =
            response?.message || "Role permission fetched successfully.";
        },
      )

      .addCase(
        fetchRolePermissionById.rejected,

        (state, action) => {
          state.loading = false;

          state.success = false;

          state.error = action.payload || "Failed to fetch role permission.";

          state.message = "";
        },
      );

    // ========================================================
    // FETCH ROLE PERMISSIONS BY ROLE ID
    // ========================================================
    //
    // GET:
    //
    // /role-permissions/role/{roleId}
    //
    // ========================================================

    builder

      .addCase(
        fetchRolePermissionsByRoleId.pending,

        (state) => {
          /*
           * IMPORTANT:
           *
           * This is specifically permission loading.
           *
           * Do not make general loading true because
           * the sidebar should not look like the entire
           * application is loading.
           */

          state.loading = false;

          state.rolePermissionsLoading = true;

          state.rolePermissionsLoaded = false;

          state.success = false;

          state.error = null;

          state.message = "";

          /*
           * IMPORTANT:
           *
           * We intentionally DO NOT clear existing
           * rolePermissions here.
           *
           * Why?
           *
           * During:
           *
           * login
           * role switching
           * application initialization
           *
           * clearing the permissions immediately can
           * cause unnecessary sidebar flickering.
           *
           * ADMIN does not depend on these permissions
           * anyway.
           */
        },
      )

      .addCase(
        fetchRolePermissionsByRoleId.fulfilled,

        (state, action) => {
          state.loading = false;

          state.rolePermissionsLoading = false;

          state.rolePermissionsLoaded = true;

          state.success = true;

          state.error = null;

          const response = action.payload;

          const permissions = extractPermissionData(response);

          /*
           * Apply returned role permissions.
           */

          applyRolePermissions(state, permissions);

          state.message =
            response?.message || "Role permissions fetched successfully.";
        },
      )

      .addCase(
        fetchRolePermissionsByRoleId.rejected,

        (state, action) => {
          state.loading = false;

          state.rolePermissionsLoading = false;

          state.rolePermissionsLoaded = true;

          state.success = false;

          /*
           * Only clear permission data when the request
           * actually fails.
           */

          state.rolePermissions = [];

          state.permissionMatrix = {};

          state.myPermissions = [];

          state.error = action.payload || "Failed to fetch role permissions.";

          state.message = "";
        },
      );

    // ========================================================
    // UPDATE ROLE PERMISSION
    // ========================================================

    builder

      .addCase(
        updateRolePermission.pending,

        (state) => {
          state.loading = true;

          state.success = false;

          state.error = null;

          state.message = "";
        },
      )

      .addCase(
        updateRolePermission.fulfilled,

        (state, action) => {
          state.loading = false;

          state.success = true;

          state.error = null;

          const response = action.payload;

          const updatedPermission = response?.data;

          if (updatedPermission) {
            /*
             * Update form.
             */

            state.rolePermission = updatedPermission;

            /*
             * Update list.
             */

            const index = state.rolePermissions.findIndex(
              (permission) => permission.id === updatedPermission.id,
            );

            if (index !== -1) {
              state.rolePermissions[index] = updatedPermission;
            } else {
              /*
               * If it does not exist in the current
               * list, add it.
               */

              state.rolePermissions.push(updatedPermission);
            }

            /*
             * Rebuild permission matrix.
             */

            state.permissionMatrix = buildPermissionMatrix(
              state.rolePermissions,
            );

            /*
             * Rebuild application permissions.
             */

            state.myPermissions = buildMyPermissions(state.rolePermissions);
          }

          state.message =
            response?.message || "Role permission updated successfully.";
        },
      )

      .addCase(
        updateRolePermission.rejected,

        (state, action) => {
          state.loading = false;

          state.success = false;

          state.error = action.payload || "Failed to update role permission.";

          state.message = "";
        },
      );

    // ========================================================
    // DELETE ROLE PERMISSION
    // ========================================================

    builder

      .addCase(
        deleteRolePermission.pending,

        (state) => {
          state.loading = true;

          state.success = false;

          state.error = null;

          state.message = "";
        },
      )

      .addCase(
        deleteRolePermission.fulfilled,

        (state, action) => {
          state.loading = false;

          state.success = true;

          state.error = null;

          /*
           * Depending on your thunk, arg may be:
           *
           * deleteRolePermission(id)
           *
           * or
           *
           * deleteRolePermission({ id })
           */

          const deletedId =
            typeof action.meta?.arg === "object"
              ? action.meta?.arg?.id
              : action.meta?.arg;

          /*
           * Remove deleted permission.
           */

          state.rolePermissions = state.rolePermissions.filter(
            (permission) => permission.id !== deletedId,
          );

          /*
           * Rebuild matrix.
           */

          state.permissionMatrix = buildPermissionMatrix(state.rolePermissions);

          /*
           * Rebuild effective permissions.
           */

          state.myPermissions = buildMyPermissions(state.rolePermissions);

          state.message =
            action.payload?.message || "Role permission deleted successfully.";
        },
      )

      .addCase(
        deleteRolePermission.rejected,

        (state, action) => {
          state.loading = false;

          state.success = false;

          state.error = action.payload || "Failed to delete role permission.";

          state.message = "";
        },
      );
  },
});

/*
 * ============================================================
 * EXPORT ACTIONS
 * ============================================================
 */

export const {
  resetRolePermissionForm,
  setSelectedRole,
  clearSelectedRole,
  clearRolePermissionError,
  clearRolePermissionMessage,
  resetRolePermissions,
} = rolePermissionSlice.actions;

/*
 * ============================================================
 * EXPORT REDUCER
 * ============================================================
 */

export default rolePermissionSlice.reducer;
