import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/**
 * Fetch all sizes with pagination and status filtering
 *
 * Supported params:
 * {
 *   status: "ACTIVE" | "INACTIVE",
 *   page: 0,
 *   size: 20
 * }
 */
export const fetchAllSizes = createAsyncThunk(
  "size/fetchSizes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = { ...params };

      if (!queryParams.status || queryParams.status === "ALL") {
        delete queryParams.status;
      }

      const res = await api.get("/sizes", {
        params: queryParams,
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch sizes",
      );
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
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch size",
      );
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
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to create size",
      );
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
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to update size",
      );
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
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to delete size",
      );
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
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to reactivate size",
      );
    }
  },
);

/**
 * Fetch sizes by status
 *
 * Uses the same backend query parameter:
 * GET /sizes?status=ACTIVE
 */
export const fetchSizesByStatus = createAsyncThunk(
  "size/fetchByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const params = {};

      if (status && status !== "ALL") {
        params.status = status;
      }

      const res = await api.get("/sizes", {
        params,
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch sizes by status",
      );
    }
  },
);
