import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/**
 * Fetch all sizes
 */
export const fetchAllSizes = createAsyncThunk(
  "size/fetchSizes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/sizes");

      console.log("Sizes:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch size by ID
 */
export const fetchSizeById = createAsyncThunk(
  "size/fetchSize",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/sizes/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Create size
 */
export const createSize = createAsyncThunk(
  "size/createSize",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/sizes", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update size
 */
export const updateSize = createAsyncThunk(
  "size/updateSize",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/sizes/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Delete size
 */
export const deleteSize = createAsyncThunk(
  "size/deleteSize",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/sizes/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Reactivate size
 */
export const reactivateSize = createAsyncThunk(
  "size/reactivateSize",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/sizes/${id}/reactivate`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch sizes by status
 */
export const fetchSizesByStatus = createAsyncThunk(
  "size/fetchByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const res = await api.get(`/sizes/status/${status}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
