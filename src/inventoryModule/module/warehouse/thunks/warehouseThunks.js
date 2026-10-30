import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../api/api";

/**
 * Fetch all bank accounts
 */
export const fetchAllWarehouse = createAsyncThunk(
  "warehouse/fetchWarehouse",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/warehouses");

      console.log("Warehouse:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch warehouse by ID
 */
export const fetchWarehouseById = createAsyncThunk(
  "warehouse/fetchWarehouseById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/warehouses/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Create bank account
 */
export const createWarehouse = createAsyncThunk(
  "warehouse/createWarehouse",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/warehouses", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update warehouse
 */
export const updateWarehouse = createAsyncThunk(
  "warehouse/updateWarehouse",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/warehouses/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Delete warehouse
 */
export const deleteWarehouse = createAsyncThunk(
  "warehouse/deleteWarehouse",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/warehouses/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
