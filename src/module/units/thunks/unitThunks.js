import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

// =========================================================
// FETCH ALL UNITS
// =========================================================

export const fetchAllUnits = createAsyncThunk(
  "unit/fetchUnits",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/units");

      console.log("Units:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
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
      return rejectWithValue(error?.response?.data?.message || error.message);
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
      return rejectWithValue(error?.response?.data?.message || error.message);
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
      return rejectWithValue(error?.response?.data?.message || error.message);
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
      return rejectWithValue(error?.response?.data?.message || error.message);
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
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

// =========================================================
// FETCH UNITS BY STATUS
// =========================================================

export const fetchUnitsByStatus = createAsyncThunk(
  "unit/fetchByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const res = await api.get(`/units/status/${status}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
