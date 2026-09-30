import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/**
 * Fetch all bank accounts
 */
export const fetchAllBankAccounts = createAsyncThunk(
  "bankAccount/fetchBankAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/bank-accounts");

      console.log("Bank Accounts:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch bank account by ID
 */
export const fetchBankAccountById = createAsyncThunk(
  "bankAccount/fetchBankAccount",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/bank-accounts/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Create bank account
 */
export const createBankAccount = createAsyncThunk(
  "bankAccount/createBankAccount",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/bank-accounts", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update bank account
 */
export const updateBankAccount = createAsyncThunk(
  "bankAccount/updateBankAccount",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/bank-accounts/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Delete bank account
 */
export const deleteBankAccount = createAsyncThunk(
  "bankAccount/deleteBankAccount",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/bank-accounts/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Reactivate bank account
 */
export const reactivateBankAccount = createAsyncThunk(
  "bankAccount/reactivateBankAccount",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/bank-accounts/${id}/reactivate`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch bank accounts by status
 */
export const fetchBankAccountsByStatus = createAsyncThunk(
  "bankAccount/fetchByStatus",

  async (status, { rejectWithValue }) => {
    try {
      const res = await api.get(`/bank-accounts/status/${status}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
