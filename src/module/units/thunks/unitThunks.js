import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

// =========================================================
// FETCH ALL / SEARCH / FILTER / PAGINATION
// =========================================================

export const fetchAllUnits = createAsyncThunk(
  "unit/fetchUnits",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = { ...params };

      if (!queryParams.status || queryParams.status === "ALL") {
        delete queryParams.status;
      }

      const res = await api.get("/units", {
        params: queryParams,
      });

      console.log("Unit API params:", queryParams);
      console.log("Units:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch units",
      );
    }
  },
);

// =========================================================
// FETCH UNIT BY ID
// =========================================================

export const fetchUnitById = createAsyncThunk(
  "unit/fetchUnit",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/units/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch unit",
      );
    }
  },
);

// =========================================================
// CREATE UNIT
// =========================================================

export const createUnit = createAsyncThunk(
  "unit/createUnit",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/units", data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to create unit",
      );
    }
  },
);

// =========================================================
// UPDATE UNIT
// =========================================================

export const updateUnit = createAsyncThunk(
  "unit/updateUnit",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/units/${id}`, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to update unit",
      );
    }
  },
);

// =========================================================
// DELETE UNIT
// =========================================================

export const deleteUnit = createAsyncThunk(
  "unit/deleteUnit",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/units/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to delete unit",
      );
    }
  },
);

// =========================================================
// REACTIVATE UNIT
// =========================================================

export const reactivateUnit = createAsyncThunk(
  "unit/reactivateUnit",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/units/${id}/reactivate`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to reactivate unit",
      );
    }
  },
);

// =========================================================
// FETCH UNITS BY STATUS
// Uses the same GET /units?status=ACTIVE endpoint
// =========================================================

export const fetchUnitsByStatus = createAsyncThunk(
  "unit/fetchByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const params = {};

      if (status && status !== "ALL") {
        params.status = status;
      }

      const res = await api.get("/units", {
        params,
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Failed to fetch units by status",
      );
    }
  },
);
