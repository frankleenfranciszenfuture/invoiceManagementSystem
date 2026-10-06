import { createAsyncThunk } from "@reduxjs/toolkit";

import api from "../../../api/api";

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

/**
 * Extract a useful error message from the backend/API response.
 */
const getErrorMessage = (error, fallbackMessage = "Something went wrong.") => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.details ||
    error?.message ||
    fallbackMessage
  );
};

/**
 * Validate a positive numeric ID.
 */
const isValidId = (value) => {
  return (
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value)) &&
    Number(value) > 0
  );
};

/*
 * =========================================================
 * CREATE USER PERMISSION
 *
 * POST /user-permissions
 *
 * Payload:
 * {
 *   userId,
 *   moduleId,
 *   actionId,
 *   allowed
 * }
 *
 * IMPORTANT:
 * - Creates DIRECT user permission.
 * - Role permissions are NOT considered here.
 * - Unique combination:
 *
 *     userId + moduleId + actionId
 *
 * - If an inactive permission already exists, backend may
 *   reactivate/reuse it.
 * =========================================================
 */

export const createUserPermission = createAsyncThunk(
  "userPermission/createUserPermission",

  async (payload, { rejectWithValue }) => {
    try {
      /*
       * -----------------------------------------------------
       * VALIDATE PAYLOAD
       * -----------------------------------------------------
       */

      if (!payload) {
        return rejectWithValue("User permission data is required.");
      }

      if (!isValidId(payload.userId)) {
        return rejectWithValue("User ID is required.");
      }

      if (!isValidId(payload.moduleId)) {
        return rejectWithValue("Module ID is required.");
      }

      if (!isValidId(payload.actionId)) {
        return rejectWithValue("Action ID is required.");
      }

      if (payload.allowed === null || payload.allowed === undefined) {
        return rejectWithValue("Allowed value is required.");
      }

      /*
       * -----------------------------------------------------
       * BUILD REQUEST
       * -----------------------------------------------------
       */

      const request = {
        userId: Number(payload.userId),
        moduleId: Number(payload.moduleId),
        actionId: Number(payload.actionId),
        allowed: Boolean(payload.allowed),
      };

      console.log("========== CREATE USER PERMISSION ==========");

      console.log("CREATE USER PERMISSION REQUEST:", request);

      /*
       * -----------------------------------------------------
       * API REQUEST
       * -----------------------------------------------------
       */

      const res = await api.post("/user-permissions", request);

      console.log("CREATE USER PERMISSION RESPONSE:", res.data);

      return res.data;
    } catch (error) {
      console.error("Create user permission error:", error);

      return rejectWithValue(
        getErrorMessage(error, "Failed to create user permission."),
      );
    }
  },
);

/*
 * =========================================================
 * FETCH ALL USER PERMISSIONS
 *
 * GET /user-permissions
 *
 * Returns DIRECT user permissions.
 * =========================================================
 */

export const fetchAllUserPermissions = createAsyncThunk(
  "userPermission/fetchAllUserPermissions",

  async (_, { rejectWithValue }) => {
    try {
      console.log("========== FETCH ALL USER PERMISSIONS ==========");

      const res = await api.get("/user-permissions");

      console.log("ALL USER PERMISSIONS RESPONSE:", res.data);

      return res.data;
    } catch (error) {
      console.error("Fetch all user permissions error:", error);

      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch user permissions."),
      );
    }
  },
);

/*
 * =========================================================
 * FETCH USER PERMISSION BY ID
 *
 * GET /user-permissions/{id}
 * =========================================================
 */

export const fetchUserPermissionById = createAsyncThunk(
  "userPermission/fetchUserPermissionById",

  async (id, { rejectWithValue }) => {
    try {
      /*
       * -----------------------------------------------------
       * VALIDATE ID
       * -----------------------------------------------------
       */

      if (!isValidId(id)) {
        return rejectWithValue("User permission ID is required.");
      }

      const permissionId = Number(id);

      console.log("========== FETCH USER PERMISSION BY ID ==========");

      console.log("Permission ID:", permissionId);

      /*
       * -----------------------------------------------------
       * API REQUEST
       * -----------------------------------------------------
       */

      const res = await api.get(`/user-permissions/${permissionId}`);

      console.log("USER PERMISSION BY ID RESPONSE:", res.data);

      return res.data;
    } catch (error) {
      console.error("Fetch user permission by id error:", error);

      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch user permission."),
      );
    }
  },
);

/*
 * =========================================================
 * FETCH USER PERMISSIONS BY USER ID
 *
 * GET /user-permissions/user/{userId}
 *
 * IMPORTANT:
 *
 * This endpoint returns ONLY DIRECT USER PERMISSIONS.
 *
 * It does NOT merge:
 * - Role permissions
 * - Effective permissions
 * - Inherited permissions
 *
 * Example:
 *
 * User 5:
 *
 * [
 *   {
 *     userId: 5,
 *     moduleId: 2,
 *     actionId: 1,
 *     allowed: true
 *   }
 * ]
 *
 * =========================================================
 */

export const fetchUserPermissionsByUserId = createAsyncThunk(
  "userPermission/fetchUserPermissionsByUserId",

  async (userId, { rejectWithValue }) => {
    try {
      const id = Number(userId);

      if (!Number.isInteger(id) || id <= 0) {
        return rejectWithValue("Valid user ID is required.");
      }

      console.log("Fetching permissions for user:", id);

      const response = await api.get(`/user-permissions/user/${id}`);

      console.log("User permissions API response:", response.data);

      return response.data;
    } catch (error) {
      console.error("fetchUserPermissionsByUserId error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch user permissions.",
      );
    }
  },
);

/*
 * =========================================================
 * UPDATE USER PERMISSION
 *
 * PUT /user-permissions/{id}
 *
 * Payload:
 * {
 *   allowed: true
 * }
 *
 * IMPORTANT:
 *
 * Only `allowed` should be sent.
 *
 * DO NOT send:
 * - userId
 * - roleId
 * - moduleId
 * - actionId
 *
 * Backend:
 *
 * UserPermissionUpdateRequest
 *     -> allowed only
 *
 * =========================================================
 */

export const updateUserPermission = createAsyncThunk(
  "userPermission/updateUserPermission",

  async ({ id, data }, { rejectWithValue }) => {
    try {
      /*
       * -----------------------------------------------------
       * VALIDATE ID
       * -----------------------------------------------------
       */

      if (!isValidId(id)) {
        return rejectWithValue("User permission ID is required.");
      }

      /*
       * -----------------------------------------------------
       * VALIDATE DATA
       * -----------------------------------------------------
       */

      if (!data) {
        return rejectWithValue("Update data is required.");
      }

      if (data.allowed === null || data.allowed === undefined) {
        return rejectWithValue("Allowed value is required.");
      }

      const permissionId = Number(id);

      /*
       * -----------------------------------------------------
       * BUILD UPDATE REQUEST
       * -----------------------------------------------------
       */

      const request = {
        allowed: Boolean(data.allowed),
      };

      console.log("========== UPDATE USER PERMISSION ==========");

      console.log("Permission ID:", permissionId);

      console.log("UPDATE USER PERMISSION REQUEST:", request);

      /*
       * -----------------------------------------------------
       * API REQUEST
       * -----------------------------------------------------
       */

      const res = await api.put(`/user-permissions/${permissionId}`, request);

      console.log("UPDATE USER PERMISSION RESPONSE:", res.data);

      return res.data;
    } catch (error) {
      console.error("Update user permission error:", error);

      return rejectWithValue(
        getErrorMessage(error, "Failed to update user permission."),
      );
    }
  },
);

/*
 * =========================================================
 * DELETE USER PERMISSION
 *
 * DELETE /user-permissions/{id}
 *
 * Backend performs SOFT DELETE.
 *
 * The record remains in database but becomes:
 *
 * active  = false
 * status  = INACTIVE
 *
 * This allows the backend CREATE operation to reuse/
 * reactivate the same permission later.
 * =========================================================
 */

export const deleteUserPermission = createAsyncThunk(
  "userPermission/deleteUserPermission",

  async (id, { rejectWithValue }) => {
    try {
      /*
       * -----------------------------------------------------
       * VALIDATE ID
       * -----------------------------------------------------
       */

      if (!isValidId(id)) {
        return rejectWithValue("User permission ID is required.");
      }

      const permissionId = Number(id);

      console.log("========== DELETE USER PERMISSION ==========");

      console.log("Permission ID:", permissionId);

      /*
       * -----------------------------------------------------
       * API REQUEST
       * -----------------------------------------------------
       */

      const res = await api.delete(`/user-permissions/${permissionId}`);

      console.log("DELETE USER PERMISSION RESPONSE:", res.data);

      /*
       * -----------------------------------------------------
       * RETURN NORMALIZED DELETE RESULT
       * -----------------------------------------------------
       */

      return {
        id: permissionId,
        ...res.data,
      };
    } catch (error) {
      console.error("Delete user permission error:", error);

      return rejectWithValue(
        getErrorMessage(error, "Failed to delete user permission."),
      );
    }
  },
);

/*
 * =========================================================
 * FETCH CURRENT LOGGED-IN USER PERMISSIONS
 *
 * GET /user-permissions/user/{userId}
 *
 * IMPORTANT:
 *
 * This uses the same backend endpoint as
 * fetchUserPermissionsByUserId.
 *
 * The difference is only Redux state handling:
 *
 * - fetchUserPermissionsByUserId
 *      -> User Permission Matrix
 *      -> selected/editing user
 *
 * - fetchCurrentUserPermissions
 *      -> Sidebar
 *      -> currently logged-in user
 *
 * Keeping them separate prevents the Permission Matrix
 * from accidentally changing Sidebar permissions.
 * =========================================================
 */

export const fetchCurrentUserPermissions = createAsyncThunk(
  "userPermission/fetchCurrentUserPermissions",

  async (userId, { rejectWithValue }) => {
    try {
      const id = Number(userId);

      /*
       * -----------------------------------------------------
       * VALIDATE USER ID
       * -----------------------------------------------------
       */

      if (!Number.isInteger(id) || id <= 0) {
        return rejectWithValue("Valid user ID is required.");
      }

      console.log("========== FETCH CURRENT USER PERMISSIONS ==========");

      console.log("Current logged-in user ID:", id);

      /*
       * -----------------------------------------------------
       * API REQUEST
       * -----------------------------------------------------
       */

      const response = await api.get(`/user-permissions/user/${id}`);

      console.log("CURRENT USER PERMISSIONS API RESPONSE:", response.data);

      /*
       * -----------------------------------------------------
       * RETURN USER ID + DATA
       *
       * The Redux slice needs the user ID so it can track
       * which logged-in user's permissions are currently
       * loaded.
       * -----------------------------------------------------
       */

      return {
        userId: id,
        data: response.data,
      };
    } catch (error) {
      console.error("fetchCurrentUserPermissions error:", error);

      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch current user permissions."),
      );
    }
  },
);
