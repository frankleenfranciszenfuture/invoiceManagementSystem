import { createSlice } from "@reduxjs/toolkit";

import {
  createUserPermission,
  fetchAllUserPermissions,
  fetchUserPermissionById,
  fetchUserPermissionsByUserId,
  updateUserPermission,
  deleteUserPermission,
} from "../thunks/userPermissionThunks";

/*
 * ============================================================
 * EMPTY USER PERMISSION
 * ============================================================
 */

const emptyUserPermission = {
  id: null,

  userId: null,
  userName: "",

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
 * HELPERS
 * ============================================================
 */

const getUserId = (permission) =>
  permission?.userId ?? permission?.user?.id ?? null;

const getUserName = (permission) =>
  permission?.userName ??
  permission?.user?.userName ??
  permission?.user?.username ??
  permission?.user?.name ??
  "";

const getRoleId = (permission) =>
  permission?.roleId ?? permission?.role?.id ?? null;

const getRoleName = (permission) =>
  permission?.roleName ??
  permission?.role?.roleName ??
  permission?.role?.name ??
  "";

const getModuleId = (permission) =>
  permission?.moduleId ?? permission?.module?.id ?? null;

const getModuleName = (permission) =>
  permission?.moduleName ??
  permission?.module?.moduleName ??
  permission?.module?.name ??
  "";

const getActionId = (permission) =>
  permission?.actionId ?? permission?.action?.id ?? null;

const getActionName = (permission) =>
  permission?.actionName ??
  permission?.action?.actionName ??
  permission?.action?.name ??
  "";

/*
 * ============================================================
 * NORMALIZE PERMISSION
 * ============================================================
 */

const normalizePermission = (permission) => {
  if (!permission) {
    return null;
  }

  return {
    ...permission,

    id: permission?.id ?? null,

    userId: getUserId(permission),
    userName: getUserName(permission),

    roleId: getRoleId(permission),
    roleName: getRoleName(permission),

    moduleId: getModuleId(permission),
    moduleName: getModuleName(permission),

    actionId: getActionId(permission),
    actionName: getActionName(permission),

    allowed: permission?.allowed === true,

    status: permission?.status ?? "ACTIVE",

    active: permission?.active !== false,
  };
};

/*
 * ============================================================
 * NORMALIZE PERMISSION LIST
 * ============================================================
 */

const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) {
    return [];
  }

  return permissions.map(normalizePermission).filter(Boolean);
};

/*
 * ============================================================
 * EXTRACT LIST
 * ============================================================
 */

const extractPermissionList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.content)) {
    return response.data.content;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  return [];
};

/*
 * ============================================================
 * EXTRACT SINGLE PERMISSION
 * ============================================================
 */

const extractPermission = (response) => {
  if (!response) {
    return null;
  }

  if (response?.data && !Array.isArray(response.data)) {
    return response.data;
  }

  return response;
};

/*
 * ============================================================
 * BUILD PERMISSION MATRIX
 *
 * DIRECT USER PERMISSIONS ONLY
 * ============================================================
 */

const buildPermissionMatrix = (permissions = []) => {
  const matrix = {};

  if (!Array.isArray(permissions)) {
    return matrix;
  }

  permissions.forEach((permission) => {
    const moduleId = getModuleId(permission);

    const actionId = getActionId(permission);

    if (moduleId == null || actionId == null) {
      return;
    }

    const key = `${moduleId}-${actionId}`;

    matrix[key] =
      permission?.active !== false &&
      permission?.status !== "INACTIVE" &&
      permission?.allowed === true;
  });

  return matrix;
};

/*
 * ============================================================
 * BUILD MY PERMISSIONS
 * ============================================================
 */

const buildMyPermissions = (permissions = []) => {
  const grouped = {};

  if (!Array.isArray(permissions)) {
    return [];
  }

  permissions.forEach((permission) => {
    const moduleId = getModuleId(permission);

    const moduleName = getModuleName(permission);

    const actionName = getActionName(permission);

    if (moduleId == null || !moduleName || !actionName) {
      return;
    }

    if (
      permission?.active === false ||
      permission?.status === "INACTIVE" ||
      permission?.allowed !== true
    ) {
      return;
    }

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
 * INITIAL STATE
 * ============================================================
 */

const initialState = {
  /*
   * All direct user permissions currently loaded.
   */
  userPermissions: [],

  /*
   * Direct allowed permissions.
   */
  myPermissions: [],

  /*
   * Form/detail object.
   */
  userPermission: {
    ...emptyUserPermission,
  },

  /*
   * Existing permission compatibility property.
   */
  exsistingUserPermission: null,

  /*
   * Selected user.
   *
   * These values MUST NOT be derived from
   * userPermissions[0].
   */
  selectedUserId: null,
  selectedUserName: "",

  selectedRoleId: null,
  selectedRoleName: "",

  /*
   * Direct permission matrix.
   */
  permissionMatrix: {},

  /*
   * General loading.
   */
  loading: false,

  /*
   * Loading permissions for a particular user.
   */
  userPermissionsLoading: false,

  /*
   * IMPORTANT:
   *
   * Tells the UI which user's permissions
   * are currently loaded.
   *
   * This solves the zero-permission problem.
   */
  permissionsLoadedForUserId: null,

  success: false,

  error: null,

  message: "",
};

/*
 * ============================================================
 * SLICE
 * ============================================================
 */

const userPermissionSlice = createSlice({
  name: "userPermission",

  initialState,

  reducers: {
    /*
     * --------------------------------------------------------
     * RESET FORM
     * --------------------------------------------------------
     */

    resetUserPermissionForm: (state) => {
      state.userPermission = {
        ...emptyUserPermission,
      };

      state.exsistingUserPermission = null;

      state.error = null;
      state.message = "";
      state.success = false;
    },

    /*
     * --------------------------------------------------------
     * SET SELECTED USER
     * --------------------------------------------------------
     */

    setSelectedUser: (state, action) => {
      const payload = action.payload || {};

      state.selectedUserId = payload?.userId ?? null;

      state.selectedUserName = payload?.userName || "";

      state.selectedRoleId = payload?.roleId ?? null;

      state.selectedRoleName = payload?.roleName || "";
    },

    /*
     * --------------------------------------------------------
     * CLEAR SELECTED USER
     * --------------------------------------------------------
     */

    clearSelectedUser: (state) => {
      state.selectedUserId = null;
      state.selectedUserName = "";

      state.selectedRoleId = null;
      state.selectedRoleName = "";

      state.userPermissions = [];

      state.permissionMatrix = {};

      state.myPermissions = [];

      state.permissionsLoadedForUserId = null;
    },

    /*
     * --------------------------------------------------------
     * CLEAR ERROR
     * --------------------------------------------------------
     */

    clearUserPermissionError: (state) => {
      state.error = null;
    },

    /*
     * --------------------------------------------------------
     * CLEAR MESSAGE
     * --------------------------------------------------------
     */

    clearUserPermissionMessage: (state) => {
      state.message = "";
    },

    /*
     * --------------------------------------------------------
     * RESET USER PERMISSIONS
     * --------------------------------------------------------
     */

    resetUserPermissions: (state) => {
      state.userPermissions = [];

      state.permissionMatrix = {};

      state.myPermissions = [];

      state.userPermission = {
        ...emptyUserPermission,
      };

      state.exsistingUserPermission = null;

      state.permissionsLoadedForUserId = null;

      state.success = false;
      state.error = null;
      state.message = "";
    },
  },

  /*
   * ==========================================================
   * EXTRA REDUCERS
   * ==========================================================
   */

  extraReducers: (builder) => {
    // ========================================================
    // CREATE
    // ========================================================

    builder

      .addCase(createUserPermission.pending, (state) => {
        state.loading = true;

        state.success = false;

        state.error = null;

        state.message = "";
      })

      .addCase(createUserPermission.fulfilled, (state, action) => {
        state.loading = false;

        state.success = true;

        state.error = null;

        const response = action.payload;

        const createdPermission = normalizePermission(
          extractPermission(response),
        );

        if (createdPermission) {
          state.userPermission = createdPermission;

          /*
           * Replace existing ID if available.
           *
           * Otherwise push.
           */
          const existingIndex = state.userPermissions.findIndex(
            (permission) =>
              Number(getUserId(permission)) ===
                Number(createdPermission.userId) &&
              Number(getModuleId(permission)) ===
                Number(createdPermission.moduleId) &&
              Number(getActionId(permission)) ===
                Number(createdPermission.actionId),
          );

          if (existingIndex === -1) {
            state.userPermissions.push(createdPermission);
          } else {
            state.userPermissions[existingIndex] = createdPermission;
          }

          state.permissionMatrix = buildPermissionMatrix(state.userPermissions);

          state.myPermissions = buildMyPermissions(state.userPermissions);
        }

        state.message =
          response?.message || "User permission created successfully.";
      })

      .addCase(createUserPermission.rejected, (state, action) => {
        state.loading = false;

        state.success = false;

        state.error = action.payload || "Failed to create user permission.";

        state.message = "";
      });

    // ========================================================
    // FETCH ALL
    // ========================================================

    builder

      .addCase(fetchAllUserPermissions.pending, (state) => {
        state.loading = true;

        state.success = false;

        state.error = null;

        state.message = "";
      })

      .addCase(fetchAllUserPermissions.fulfilled, (state, action) => {
        state.loading = false;

        state.success = true;

        state.error = null;

        const response = action.payload;

        const permissions = normalizePermissions(
          extractPermissionList(response),
        );

        state.userPermissions = permissions;

        state.permissionMatrix = buildPermissionMatrix(permissions);

        state.myPermissions = buildMyPermissions(permissions);

        /*
         * This is ALL users, so we cannot mark
         * a particular selected user as loaded.
         */
        state.permissionsLoadedForUserId = null;

        state.message =
          response?.message || "User permissions fetched successfully.";
      })

      .addCase(fetchAllUserPermissions.rejected, (state, action) => {
        state.loading = false;

        state.success = false;

        state.userPermissions = [];

        state.permissionMatrix = {};

        state.myPermissions = [];

        state.permissionsLoadedForUserId = null;

        state.error = action.payload || "Failed to fetch user permissions.";

        state.message = "";
      });

    // ========================================================
    // FETCH BY ID
    // ========================================================

    builder

      .addCase(fetchUserPermissionById.pending, (state) => {
        state.loading = true;

        state.success = false;

        state.error = null;

        state.message = "";
      })

      .addCase(fetchUserPermissionById.fulfilled, (state, action) => {
        state.loading = false;

        state.success = true;

        state.error = null;

        const response = action.payload;

        const permission = normalizePermission(extractPermission(response));

        state.userPermission = permission || {
          ...emptyUserPermission,
        };

        state.exsistingUserPermission = permission || null;

        state.message =
          response?.message || "User permission fetched successfully.";
      })

      .addCase(fetchUserPermissionById.rejected, (state, action) => {
        state.loading = false;

        state.success = false;

        state.error = action.payload || "Failed to fetch user permission.";

        state.message = "";
      });

    // ========================================================
    // FETCH BY USER
    // ========================================================

    // ========================================================
    // FETCH BY USER
    // ========================================================

    builder

      .addCase(fetchUserPermissionsByUserId.pending, (state) => {
        state.loading = false;

        state.userPermissionsLoading = true;

        state.success = false;

        state.error = null;

        state.message = "";

        /*
         * IMPORTANT:
         *
         * Clear the previous user's permissions
         * immediately.
         */
        state.userPermissions = [];

        state.permissionMatrix = {};

        state.myPermissions = [];

        /*
         * The new user's permissions are not loaded yet.
         */
        state.permissionsLoadedForUserId = null;
      })

      .addCase(fetchUserPermissionsByUserId.fulfilled, (state, action) => {
        state.loading = false;

        state.userPermissionsLoading = false;

        state.success = true;

        state.error = null;

        const response = action.payload;

        const permissions = normalizePermissions(
          extractPermissionList(response),
        );

        /*
         * Store direct user permissions.
         */
        state.userPermissions = permissions;

        /*
         * Rebuild direct permission matrix.
         */
        state.permissionMatrix = buildPermissionMatrix(permissions);

        /*
         * Rebuild direct allowed permissions.
         */
        state.myPermissions = buildMyPermissions(permissions);

        /*
         * IMPORTANT
         *
         * Support both:
         *
         * fetchUserPermissionsByUserId(5)
         *
         * and:
         *
         * fetchUserPermissionsByUserId({
         *     userId: 5
         * })
         */
        const requestedUserId = action.meta?.arg?.userId ?? action.meta?.arg;

        const numericUserId = Number(requestedUserId);

        state.permissionsLoadedForUserId =
          Number.isInteger(numericUserId) && numericUserId > 0
            ? numericUserId
            : null;

        console.log("FETCH USER PERMISSIONS SUCCESS", {
          requestedUserId,
          loadedUserId: state.permissionsLoadedForUserId,
          permissions,
          response,
        });

        state.message =
          response?.message || "User permissions fetched successfully.";
      })

      .addCase(fetchUserPermissionsByUserId.rejected, (state, action) => {
        state.loading = false;

        state.userPermissionsLoading = false;

        state.success = false;

        state.userPermissions = [];

        state.permissionMatrix = {};

        state.myPermissions = [];

        state.permissionsLoadedForUserId = null;

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch user permissions.";

        state.message = "";

        console.error("FETCH USER PERMISSIONS FAILED:", {
          payload: action.payload,
          error: action.error,
          arg: action.meta?.arg,
        });
      });

    // ========================================================
    // UPDATE
    // ========================================================

    builder

      .addCase(updateUserPermission.pending, (state) => {
        state.loading = true;

        state.success = false;

        state.error = null;

        state.message = "";
      })

      .addCase(updateUserPermission.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        const updatedPermission = normalizePermission(
          extractPermission(response),
        );

        if (updatedPermission) {
          const index = state.userPermissions.findIndex(
            (permission) =>
              Number(permission?.id) === Number(updatedPermission?.id),
          );

          if (index !== -1) {
            state.userPermissions[index] = {
              ...state.userPermissions[index],
              ...updatedPermission,

              /*
               * Preserve relationship fields if
               * backend update response doesn't return them.
               */
              userId:
                updatedPermission.userId ?? state.userPermissions[index].userId,

              userName:
                updatedPermission.userName ||
                state.userPermissions[index].userName,

              roleId:
                updatedPermission.roleId ?? state.userPermissions[index].roleId,

              roleName:
                updatedPermission.roleName ||
                state.userPermissions[index].roleName,

              moduleId:
                updatedPermission.moduleId ??
                state.userPermissions[index].moduleId,

              moduleName:
                updatedPermission.moduleName ||
                state.userPermissions[index].moduleName,

              actionId:
                updatedPermission.actionId ??
                state.userPermissions[index].actionId,

              actionName:
                updatedPermission.actionName ||
                state.userPermissions[index].actionName,
            };
          } else {
            state.userPermissions.push(updatedPermission);
          }

          state.permissionMatrix = buildPermissionMatrix(state.userPermissions);

          state.myPermissions = buildMyPermissions(state.userPermissions);

          state.userPermission = updatedPermission;
        }

        state.message =
          response?.message || "User permission updated successfully.";
      })

      .addCase(updateUserPermission.rejected, (state, action) => {
        state.loading = false;

        state.success = false;

        state.error = action.payload || "Failed to update user permission.";

        state.message = "";
      });

    // ========================================================
    // DELETE
    // ========================================================

    builder

      .addCase(deleteUserPermission.pending, (state) => {
        state.loading = true;

        state.success = false;

        state.error = null;

        state.message = "";
      })

      .addCase(deleteUserPermission.fulfilled, (state, action) => {
        state.loading = false;

        state.success = true;

        state.error = null;

        const deletedId = action.meta?.arg;

        state.userPermissions = state.userPermissions.filter(
          (permission) => Number(permission?.id) !== Number(deletedId),
        );

        state.permissionMatrix = buildPermissionMatrix(state.userPermissions);

        state.myPermissions = buildMyPermissions(state.userPermissions);

        state.message =
          action.payload?.message || "User permission deleted successfully.";
      })

      .addCase(deleteUserPermission.rejected, (state, action) => {
        state.loading = false;

        state.success = false;

        state.error = action.payload || "Failed to delete user permission.";

        state.message = "";
      });
  },
});

/*
 * ============================================================
 * EXPORT ACTIONS
 * ============================================================
 */

export const {
  resetUserPermissionForm,
  setSelectedUser,
  clearSelectedUser,
  clearUserPermissionError,
  clearUserPermissionMessage,
  resetUserPermissions,
} = userPermissionSlice.actions;

/*
 * ============================================================
 * EXPORT REDUCER
 * ============================================================
 */

export default userPermissionSlice.reducer;
