import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/**
 * Fetch all roles
 */
export const fetchAllRoles = createAsyncThunk(
  "role/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/roles/get-all");

      console.log("Roles:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch role by ID
 */
export const fetchRoleById = createAsyncThunk(
  "role/fetchRole",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/roles/getById/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Create role
 */
export const createRole = createAsyncThunk(
  "role/createRole",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/roles/create", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update role
 */
export const updateRole = createAsyncThunk(
  "role/updateRole",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/roles/update/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Delete role
 */
export const deleteRole = createAsyncThunk(
  "role/deleteRole",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/roles/delete/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update role status
 */
export const updateRoleStatus = createAsyncThunk(
  "role/updateRoleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/roles/status/${id}`, {
        status,
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
