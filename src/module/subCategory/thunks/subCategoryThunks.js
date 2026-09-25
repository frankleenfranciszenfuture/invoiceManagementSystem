import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/**
 * Fetch all sub categories
 */
export const fetchAllSubCategories = createAsyncThunk(
  "subCategory/fetchSubCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/sub-categories");

      console.log("Sub Categories:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch sub category by ID
 */
export const fetchSubCategoryById = createAsyncThunk(
  "subCategory/fetchSubCategory",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/sub-categories/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Create sub category
 */
export const createSubCategory = createAsyncThunk(
  "subCategory/createSubCategory",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/sub-categories", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update sub category
 */
export const updateSubCategory = createAsyncThunk(
  "subCategory/updateSubCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/sub-categories/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Delete sub category
 */
export const deleteSubCategory = createAsyncThunk(
  "subCategory/deleteSubCategory",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/sub-categories/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Reactivate sub category
 */
export const reactivateSubCategory = createAsyncThunk(
  "subCategory/reactivateSubCategory",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/sub-categories/${id}/reactivate`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch sub categories by status
 */
export const fetchSubCategoriesByStatus = createAsyncThunk(
  "subCategory/fetchByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const res = await api.get(`/sub-categories/status/${status}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
