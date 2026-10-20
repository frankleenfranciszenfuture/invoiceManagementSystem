import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/**
 * Fetch all sizes
 */
export const fetchAllParties = createAsyncThunk(
  "party/fecthParties",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/parties");

      console.log("Parties:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch party by ID
 */
export const fetchPartyById = createAsyncThunk(
  "party/fetchParty",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/parties/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Create party
 */
export const createParty = createAsyncThunk(
  "party/createParty",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/parties", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update size
 */
export const updateParty = createAsyncThunk(
  "party/updateParty",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/parties/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Delete size
 */
export const deleteParty = createAsyncThunk(
  "party/deleteParty",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/parties/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
