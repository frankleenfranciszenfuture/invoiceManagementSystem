import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../api/api";

/* =========================================================
   FETCH ALL EXPENSE CATEGORIES
========================================================= */

export const fetchAllExpenseCategories = createAsyncThunk(
  "expenseCategory/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/expense-categories", {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 10,
          search: params.search || undefined,
          expenseType: params.expenseType || undefined,
          status: params.status || undefined,
          sort: params.sort || "createdAt,desc",
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch expense categories",
      );
    }
  },
);

/* =========================================================
   FETCH EXPENSE CATEGORY BY ID
========================================================= */

export const fetchExpenseCategoryById = createAsyncThunk(
  "expenseCategory/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/expense-categories/${id}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch expense category",
      );
    }
  },
);

/* =========================================================
   CREATE EXPENSE CATEGORY
========================================================= */

export const createExpenseCategory = createAsyncThunk(
  "expenseCategory/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/expense-categories", data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create expense category",
      );
    }
  },
);

/* =========================================================
   UPDATE EXPENSE CATEGORY
========================================================= */

export const updateExpenseCategory = createAsyncThunk(
  "expenseCategory/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/expense-categories/${id}`, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update expense category",
      );
    }
  },
);

/* =========================================================
   DELETE EXPENSE CATEGORY
========================================================= */

export const deleteExpenseCategory = createAsyncThunk(
  "expenseCategory/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/expense-categories/${id}`);

      return {
        id,
        ...response.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete expense category",
      );
    }
  },
);
