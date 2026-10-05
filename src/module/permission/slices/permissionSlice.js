import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllModules,
  fetchAllActions,
  fetchAllModuleActions,
  fetchRolePermissions,
  fetchUserPermissions,
} from "../thunks/permissionThunks";

/* =========================================================
   RESPONSE HELPERS
   ========================================================= */

/**
 * Safely extracts an array from different API response shapes.
 *
 * Supported:
 *
 * 1. [...]
 *
 * 2. {
 *      data: [...]
 *    }
 *
 * 3. {
 *      data: {
 *          content: [...]
 *      }
 *    }
 *
 * 4. {
 *      content: [...]
 *    }
 */
const extractList = (response) => {
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

/**
 * Safely extracts API message.
 */
const extractMessage = (response) => {
  return response?.message || response?.data?.message || "";
};

/* =========================================================
   EMPTY PERMISSION
   ========================================================= */

const emptyPermission = {
  id: null,

  moduleId: null,
  moduleName: "",

  actionId: null,
  actionName: "",

  status: "ACTIVE",
  active: true,
};

/* =========================================================
   EMPTY MY PERMISSIONS
   ========================================================= */

const emptyMyPermissions = {
  role: "",
  permissions: [],
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  /* =======================================================
     MASTER DATA
     ======================================================= */

  modules: [],

  actions: [],

  moduleActions: [],

  /* =======================================================
     ROLE PERMISSIONS
     ======================================================= */

  rolePermissions: [],

  selectedRolePermissions: [],

  selectedRoleId: null,

  /* =======================================================
     USER PERMISSIONS
     ======================================================= */

  userPermissions: [],

  selectedUserPermissions: [],

  selectedUserId: null,

  /* =======================================================
     CURRENT USER PERMISSIONS
     ======================================================= */

  myPermissions: {
    ...emptyMyPermissions,
  },

  /* =======================================================
     CURRENT USER PERMISSION MAP
     ======================================================= */

  permissionMap: {},

  /* =======================================================
     SINGLE PERMISSION FORM
     ======================================================= */

  permission: {
    ...emptyPermission,
  },

  existingPermission: null,

  selectedModule: null,

  /* =======================================================
     LOADING
     ======================================================= */

  loading: false,

  modulesLoading: false,

  actionsLoading: false,

  moduleActionsLoading: false,

  rolePermissionsLoading: false,

  userPermissionsLoading: false,

  myPermissionsLoading: false,

  /* =======================================================
     COMMON
     ======================================================= */

  success: false,

  error: null,

  message: "",
};

/* =========================================================
   SLICE
   ========================================================= */

const permissionSlice = createSlice({
  name: "permission",

  initialState,

  reducers: {
    /* =====================================================
       SET EXISTING PERMISSION
    ===================================================== */

    setExistingPermission: (state, action) => {
      state.existingPermission = action.payload;
    },

    /* =====================================================
       SET SELECTED MODULE
    ===================================================== */

    setSelectedModule: (state, action) => {
      state.selectedModule = action.payload;
    },

    /* =====================================================
       SET SELECTED ROLE
    ===================================================== */

    setSelectedRoleId: (state, action) => {
      state.selectedRoleId = action.payload;
    },

    /* =====================================================
       SET SELECTED USER
    ===================================================== */

    setSelectedUserId: (state, action) => {
      state.selectedUserId = action.payload;
    },

    /* =====================================================
       SET PERMISSION
    ===================================================== */

    setPermission: (state, action) => {
      state.permission = action.payload;
    },

    /* =====================================================
       SET PERMISSION FIELD
    ===================================================== */

    setPermissionField: (state, action) => {
      const { field, value } = action.payload;

      state.permission = {
        ...(state.permission || emptyPermission),
        [field]: value,
      };
    },

    /* =====================================================
       SET PERMISSION MAP
    ===================================================== */

    setPermissionMap: (state, action) => {
      state.permissionMap = action.payload || {};
    },

    /* =====================================================
       SET ROLE PERMISSIONS
    ===================================================== */

    setSelectedRolePermissions: (state, action) => {
      state.selectedRolePermissions = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    /* =====================================================
       SET USER PERMISSIONS
    ===================================================== */

    setSelectedUserPermissions: (state, action) => {
      state.selectedUserPermissions = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    /* =====================================================
       CLEAR SELECTED PERMISSION
    ===================================================== */

    clearSelectedPermission: (state) => {
      state.permission = {
        ...emptyPermission,
      };

      state.existingPermission = null;

      state.selectedModule = null;
    },

    /* =====================================================
       CLEAR ROLE PERMISSIONS
    ===================================================== */

    clearRolePermissions: (state) => {
      state.rolePermissions = [];

      state.selectedRolePermissions = [];

      state.selectedRoleId = null;
    },

    /* =====================================================
       CLEAR USER PERMISSIONS
    ===================================================== */

    clearUserPermissions: (state) => {
      state.userPermissions = [];

      state.selectedUserPermissions = [];

      state.selectedUserId = null;
    },

    /* =====================================================
       CLEAR MY PERMISSIONS
    ===================================================== */

    clearMyPermissions: (state) => {
      state.myPermissions = {
        ...emptyMyPermissions,
      };

      state.permissionMap = {};
    },

    /* =====================================================
       RESET PERMISSION FORM
    ===================================================== */

    resetPermissionForm: (state) => {
      state.permission = {
        ...emptyPermission,
      };

      state.existingPermission = null;

      state.selectedModule = null;
    },

    /* =====================================================
       CLEAR PERMISSION ERROR
    ===================================================== */

    clearPermissionError: (state) => {
      state.error = null;
    },

    /* =====================================================
       CLEAR PERMISSION MESSAGE
    ===================================================== */

    clearPermissionMessage: (state) => {
      state.message = "";
    },

    /* =====================================================
       CLEAR COMPLETE PERMISSION STATE
    ===================================================== */

    clearPermissionState: (state) => {
      /* ===================================================
         MASTER
      =================================================== */

      state.modules = [];

      state.actions = [];

      state.moduleActions = [];

      /* ===================================================
         ROLE
      =================================================== */

      state.rolePermissions = [];

      state.selectedRolePermissions = [];

      state.selectedRoleId = null;

      /* ===================================================
         USER
      =================================================== */

      state.userPermissions = [];

      state.selectedUserPermissions = [];

      state.selectedUserId = null;

      /* ===================================================
         MY PERMISSIONS
      =================================================== */

      state.myPermissions = {
        ...emptyMyPermissions,
      };

      state.permissionMap = {};

      /* ===================================================
         SINGLE PERMISSION
      =================================================== */

      state.permission = {
        ...emptyPermission,
      };

      state.existingPermission = null;

      state.selectedModule = null;

      /* ===================================================
         LOADING
      =================================================== */

      state.loading = false;

      state.modulesLoading = false;

      state.actionsLoading = false;

      state.moduleActionsLoading = false;

      state.rolePermissionsLoading = false;

      state.userPermissionsLoading = false;

      state.myPermissionsLoading = false;

      /* ===================================================
         COMMON
      =================================================== */

      state.success = false;

      state.error = null;

      state.message = "";
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL MODULES
    ===================================================== */

    builder

      .addCase(fetchAllModules.pending, (state) => {
        state.modulesLoading = true;

        state.error = null;

        state.success = false;

        state.message = "";
      })

      .addCase(fetchAllModules.fulfilled, (state, action) => {
        state.modulesLoading = false;

        state.loading = false;

        state.success = true;

        state.error = null;

        const response = action.payload;

        state.modules = extractList(response);

        state.message = extractMessage(response);

        console.log("Permission Slice - Modules:", state.modules);
      })

      .addCase(fetchAllModules.rejected, (state, action) => {
        state.modulesLoading = false;

        state.loading = false;

        state.success = false;

        state.modules = [];

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch permission modules.";

        state.message = "";
      });

    /* =====================================================
       FETCH ALL ACTIONS
    ===================================================== */

    builder

      .addCase(fetchAllActions.pending, (state) => {
        state.actionsLoading = true;

        state.error = null;

        state.success = false;

        state.message = "";
      })

      .addCase(fetchAllActions.fulfilled, (state, action) => {
        state.actionsLoading = false;

        state.loading = false;

        state.success = true;

        state.error = null;

        const response = action.payload;

        state.actions = extractList(response);

        state.message = extractMessage(response);

        console.log("Permission Slice - Actions:", state.actions);
      })

      .addCase(fetchAllActions.rejected, (state, action) => {
        state.actionsLoading = false;

        state.loading = false;

        state.success = false;

        state.actions = [];

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch permission actions.";

        state.message = "";
      });

    /* =====================================================
       FETCH ALL MODULE ACTIONS

       IMPORTANT:
       Used by RolePermissionCreate
       AND UserPermissionCreate.
    ===================================================== */

    builder

      .addCase(fetchAllModuleActions.pending, (state) => {
        state.moduleActionsLoading = true;

        state.error = null;

        state.success = false;

        state.message = "";
      })

      .addCase(fetchAllModuleActions.fulfilled, (state, action) => {
        state.moduleActionsLoading = false;

        state.loading = false;

        state.success = true;

        state.error = null;

        const response = action.payload;

        state.moduleActions = extractList(response);

        state.message = extractMessage(response);

        console.log("==========================================");

        console.log("Permission Slice - Module Actions Response:", response);

        console.log("Permission Slice - Module Actions:", state.moduleActions);

        console.log(
          "Permission Slice - Module Actions Count:",
          state.moduleActions.length,
        );

        console.log("==========================================");
      })

      .addCase(fetchAllModuleActions.rejected, (state, action) => {
        state.moduleActionsLoading = false;

        state.loading = false;

        state.success = false;

        state.moduleActions = [];

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch module actions.";

        state.message = "";

        console.error("Permission Slice - Module Actions Error:", state.error);
      });

    /* =====================================================
       FETCH ROLE PERMISSIONS
    ===================================================== */

    builder

      .addCase(fetchRolePermissions.pending, (state) => {
        state.rolePermissionsLoading = true;

        state.error = null;

        state.success = false;

        state.message = "";
      })

      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.rolePermissionsLoading = false;

        state.loading = false;

        state.success = true;

        state.error = null;

        const response = action.payload;

        state.rolePermissions = extractList(response);

        state.selectedRolePermissions = [...state.rolePermissions];

        state.message = extractMessage(response);

        console.log(
          "Permission Slice - Role Permissions:",
          state.rolePermissions,
        );
      })

      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.rolePermissionsLoading = false;

        state.loading = false;

        state.success = false;

        state.rolePermissions = [];

        state.selectedRolePermissions = [];

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch role permissions.";

        state.message = "";
      });

    /* =====================================================
       FETCH USER PERMISSIONS

       Direct user permissions only.

       Role permissions are NOT merged here.
    ===================================================== */

    builder

      .addCase(fetchUserPermissions.pending, (state) => {
        state.userPermissionsLoading = true;

        state.error = null;

        state.success = false;

        state.message = "";
      })

      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.userPermissionsLoading = false;

        state.loading = false;

        state.success = true;

        state.error = null;

        const response = action.payload;

        state.userPermissions = extractList(response);

        state.selectedUserPermissions = [...state.userPermissions];

        state.message = extractMessage(response);

        console.log(
          "Permission Slice - User Permissions:",
          state.userPermissions,
        );

        console.log(
          "Permission Slice - User Permissions Count:",
          state.userPermissions.length,
        );
      })

      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.userPermissionsLoading = false;

        state.loading = false;

        state.success = false;

        state.userPermissions = [];

        state.selectedUserPermissions = [];

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch user permissions.";

        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setExistingPermission,

  setSelectedModule,

  setSelectedRoleId,

  setSelectedUserId,

  setPermission,

  setPermissionField,

  setPermissionMap,

  setSelectedRolePermissions,

  setSelectedUserPermissions,

  clearSelectedPermission,

  clearPermissionState,

  resetPermissionForm,

  clearRolePermissions,

  clearUserPermissions,

  clearMyPermissions,

  clearPermissionError,

  clearPermissionMessage,
} = permissionSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default permissionSlice.reducer;
