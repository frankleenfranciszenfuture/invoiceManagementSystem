import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/* =========================================================
   CREATE ROLE PERMISSION
   ========================================================= */

export const createRolePermission = createAsyncThunk(
  "rolePermission/createRolePermission",

  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/role-permissions", payload);

      console.log("CREATE ROLE PERMISSION:", res.data);

      return res.data;
    } catch (error) {
      console.error("Create role permission error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create role permission.",
      );
    }
  },
);

/* =========================================================
   FETCH ALL ROLE PERMISSIONS
   ========================================================= */

export const fetchAllRolePermissions = createAsyncThunk(
  "rolePermission/fetchAllRolePermissions",

  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/role-permissions");

      console.log("ALL ROLE PERMISSIONS:", res.data);

      return res.data;
    } catch (error) {
      console.error("Fetch all role permissions error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch role permissions.",
      );
    }
  },
);

/* =========================================================
   FETCH ROLE PERMISSION BY ID
   ========================================================= */

export const fetchRolePermissionById = createAsyncThunk(
  "rolePermission/fetchRolePermissionById",

  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Role permission ID is required.");
      }

      const res = await api.get(`/role-permissions/${id}`);

      console.log("ROLE PERMISSION BY ID:", res.data);

      return res.data;
    } catch (error) {
      console.error("Fetch role permission by id error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch role permission.",
      );
    }
  },
);

/* =========================================================
   FETCH ROLE PERMISSIONS BY ROLE ID
   ========================================================= */

export const fetchRolePermissionsByRoleId = createAsyncThunk(
  "rolePermission/fetchRolePermissionsByRoleId",

  async (roleId, { rejectWithValue }) => {
    try {
      if (!roleId) {
        return rejectWithValue("Role ID is required.");
      }

      const res = await api.get(`/role-permissions/role/${roleId}`);

      console.log("ROLE PERMISSIONS:", res.data);

      return res.data;
    } catch (error) {
      console.error("Fetch role permissions by role error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch role permissions.",
      );
    }
  },
);

/* =========================================================
   UPDATE ROLE PERMISSION
   ========================================================= */

export const updateRolePermission = createAsyncThunk(
  "rolePermission/updateRolePermission",

  async ({ id, data }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Role permission ID is required.");
      }

      const res = await api.put(`/role-permissions/${id}`, data);

      console.log("UPDATE ROLE PERMISSION:", res.data);

      return res.data;
    } catch (error) {
      console.error("Update role permission error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update role permission.",
      );
    }
  },
);

/* =========================================================
   DELETE ROLE PERMISSION
   ========================================================= */

export const deleteRolePermission = createAsyncThunk(
  "rolePermission/deleteRolePermission",

  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Role permission ID is required.");
      }

      const res = await api.delete(`/role-permissions/${id}`);

      console.log("DELETE ROLE PERMISSION:", res.data);

      return {
        id,
        ...res.data,
      };
    } catch (error) {
      console.error("Delete role permission error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete role permission.",
      );
    }
  },
);
