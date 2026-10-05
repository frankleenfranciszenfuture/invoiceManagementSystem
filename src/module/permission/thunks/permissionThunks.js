import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/* =========================================================
   FETCH ALL MODULES
   ========================================================= */

export const fetchAllModules = createAsyncThunk(
  "permission/fetchAllModules",

  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/permissions/modules");

      console.log("Modules:", res.data);

      return res.data;
    } catch (error) {
      console.error("Fetch modules error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch modules.",
      );
    }
  },
);

/* =========================================================
   FETCH ALL ACTIONS
   ========================================================= */

export const fetchAllActions = createAsyncThunk(
  "permission/fetchAllActions",

  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/permissions/actions");

      console.log("Actions:", res.data);

      return res.data;
    } catch (error) {
      console.error("Fetch actions error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch actions.",
      );
    }
  },
);

/* =========================================================
   FETCH ALL MODULE ACTIONS
   ========================================================= */

export const fetchAllModuleActions = createAsyncThunk(
  "permission/fetchAllModuleActions",

  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/permissions/module-actions");

      console.log("Module Actions:", res.data);

      return res.data;
    } catch (error) {
      console.error("Fetch module actions error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch module actions.",
      );
    }
  },
);

/* =========================================================
   FETCH CURRENT USER PERMISSIONS
   ========================================================= */

export const fetchMyPermissions = createAsyncThunk(
  "permission/fetchMyPermissions",

  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/permissions/me");

      console.log("My Permissions:", res.data);

      return res.data;
    } catch (error) {
      console.error("Fetch my permissions error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch permissions.",
      );
    }
  },
);

/* =========================================================
   FETCH ROLE PERMISSIONS
   ========================================================= */

export const fetchRolePermissions = createAsyncThunk(
  "permission/fetchRolePermissions",

  async (roleId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/permissions/roles/${roleId}`);

      console.log("Role Permissions:", res.data);

      return res.data;
    } catch (error) {
      console.error("Fetch role permissions error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch role permissions.",
      );
    }
  },
);

/* =========================================================
   FETCH USER PERMISSIONS
   ========================================================= */

export const fetchUserPermissions = createAsyncThunk(
  "permission/fetchUserPermissions",

  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/permissions/users/${userId}`);

      console.log("User Permissions:", res.data);

      return res.data;
    } catch (error) {
      console.error("Fetch user permissions error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch user permissions.",
      );
    }
  },
);
