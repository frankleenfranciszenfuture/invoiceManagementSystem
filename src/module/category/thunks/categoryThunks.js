import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/**
 * Fetch all categories
 */
/**
 * Fetch all categories with filters and pagination
 */
export const fetchAllCategories = createAsyncThunk(
  "category/fetchCategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { status, page = 0, size = 20 } = params || {};

      const config = {
        params: {
          page,
          size,
        },
      };

      let response;

      if (status && status !== "ALL") {
        response = await api.get(`/categories/status/${status}`, config);
      } else {
        response = await api.get("/categories", config);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch category by ID
 */
export const fetchCategoryById = createAsyncThunk(
  "category/fetchCategory",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/categories/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Create category
 */
export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/categories", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update category
 */
export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/categories/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Delete category
 */
export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/categories/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Reactivate category
 */
export const reactivateCategory = createAsyncThunk(
  "category/reactivateCategory",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/categories/${id}/reactivate`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch categories by status
 */
export const fetchCategoriesByStatus = createAsyncThunk(
  "category/fetchByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const res = await api.get(`/categories/status/${status}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
