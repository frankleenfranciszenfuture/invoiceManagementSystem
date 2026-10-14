import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/**
 * Fetch all sizes
 */
export const fetchAllSalesPersons = createAsyncThunk(
  "salesPerson/fetchAllSalesPersons",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/salesPersons");

      console.log("Sales Persons:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch size by ID
 */
export const fetchSalesPersonById = createAsyncThunk(
  "salesPerson/fetchSalesPerson",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/salesPersons/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Create size
 */
export const createSalesPerson = createAsyncThunk(
  "salesPerson/createSalesPerson",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/salesPersons", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update sales person
 */
export const updateSalesPerson = createAsyncThunk(
  "salesPerson/updateSalesPerson",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/salesPersons/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Delete sales person
 */
export const deleteSalesPerson = createAsyncThunk(
  "salesPerson/deleteSalesPerson",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/salesPersons/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
