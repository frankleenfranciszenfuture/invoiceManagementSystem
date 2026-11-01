import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../api/api";

/**
 * Fetch all expenses with filters and pagination
 */
export const fetchAllExpenses = createAsyncThunk(
  "expense/fetchAllExpenses",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/expenses", {
        params: filters,
      });

      console.log("Expense API Response:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch expense by ID
 */
export const fetchExpenseById = createAsyncThunk(
  "expense/fetchExpenseById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/expenses/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Create expense
 */
export const createExpense = createAsyncThunk(
  "expense/createExpense",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/expenses", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update expense
 */
export const updateExpense = createAsyncThunk(
  "expense/updateExpense",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/expenses/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Approve expense
 */
export const approveExpense = createAsyncThunk(
  "expense/approveExpense",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/expenses/${id}/approve`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Reject expense
 * Pass: { id, reason }
 */
export const rejectExpense = createAsyncThunk(
  "expense/rejectExpense",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/expenses/${id}/reject`, null, {
        params: { reason },
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Cancel expense
 */
export const cancelExpense = createAsyncThunk(
  "expense/cancelExpense",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/expenses/${id}/cancel`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
