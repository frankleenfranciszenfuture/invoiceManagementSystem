import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../api/api";

/* =========================================================
   FETCH ALL CASH ACCOUNTS
========================================================= */

export const fetchAllCashAccounts = createAsyncThunk(
  "cashAccount/fetchAllCashAccounts",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/cash-accounts", {
        params: {
          page: filters.page ?? 0,
          size: filters.size ?? 10,
          sort: filters.sort ?? "createdAt,desc",
          search: filters.search || undefined,
          status: filters.status || undefined,
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch cash accounts",
      );
    }
  },
);

/* =========================================================
   FETCH CASH ACCOUNT BY ID
========================================================= */

export const fetchCashAccountById = createAsyncThunk(
  "cashAccount/fetchCashAccountById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/cash-accounts/${id}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch cash account",
      );
    }
  },
);

/* =========================================================
   CREATE CASH ACCOUNT
========================================================= */

export const createCashAccount = createAsyncThunk(
  "cashAccount/createCashAccount",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/cash-accounts", data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create cash account",
      );
    }
  },
);

/* =========================================================
   UPDATE CASH ACCOUNT
========================================================= */

export const updateCashAccount = createAsyncThunk(
  "cashAccount/updateCashAccount",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cash-accounts/${id}`, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update cash account",
      );
    }
  },
);

/* =========================================================
   DELETE CASH ACCOUNT
========================================================= */

export const deleteCashAccount = createAsyncThunk(
  "cashAccount/deleteCashAccount",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cash-accounts/${id}`);

      return {
        id,
        ...response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to deactivate cash account",
      );
    }
  },
);
