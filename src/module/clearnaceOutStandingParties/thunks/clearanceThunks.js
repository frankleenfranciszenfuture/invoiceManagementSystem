import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/**
 * Fetch all clearance
 */

export const fetchAllClearance = createAsyncThunk(
  "clearance/fetchAllClearance",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/credit-clearance");
      console.log("Credit Clearance:", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch party by ID
 */
export const fetchClearanceById = createAsyncThunk(
  "clearance/fetchClearanceById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/credit-clearance/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

export const fetchClearancePartyById = createAsyncThunk(
  "clearance/fetchClearancePartyById",
  async (partyId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/credit-clearance/party/${partyId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
/**
 * Create clearance
 */
export const createClearance = createAsyncThunk(
  "clearance/createClearance",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/credit-clearance", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update clearance
 */
export const updateClearance = createAsyncThunk(
  "clearance/updateClearance",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/credit-clearance/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Delete size
 */
export const deleteClearance = createAsyncThunk(
  "clearance/deleteClearance",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/credit-clearance/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
