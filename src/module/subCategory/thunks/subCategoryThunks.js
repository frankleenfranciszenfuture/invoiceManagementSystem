import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/* =========================================================
   ERROR HELPER
========================================================= */

const getErrorPayload = (error) => ({
  status: error?.response?.status ?? null,
  message:
    error?.response?.data?.message || error?.message || "Something went wrong.",
});

/* =========================================================
   FETCH ALL / FILTERED SUB CATEGORIES
========================================================= */

export const fetchAllSubCategories = createAsyncThunk(
  "subCategory/fetchSubCategories",
  async ({ status = "ALL", page = 0, size = 20 } = {}, { rejectWithValue }) => {
    try {
      const params = {
        page,
        size,
      };

      const normalizedStatus = String(status || "ALL")
        .trim()
        .toUpperCase();

      const url =
        normalizedStatus === "ALL"
          ? "/sub-categories"
          : `/sub-categories/status/${normalizedStatus}`;

      const res = await api.get(url, { params });

      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  },
);

/* =========================================================
   FETCH SUB CATEGORY BY ID
========================================================= */

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

/* =========================================================
   CREATE SUB CATEGORY
========================================================= */

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

/* =========================================================
   UPDATE SUB CATEGORY
========================================================= */

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

/* =========================================================
   DELETE SUB CATEGORY
========================================================= */

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

/* =========================================================
   REACTIVATE SUB CATEGORY
========================================================= */

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

/* =========================================================
   FETCH SUB CATEGORIES BY STATUS
========================================================= */

export const fetchSubCategoriesByStatus = createAsyncThunk(
  "subCategory/fetchByStatus",
  async ({ status, page = 0, size = 20 }, { rejectWithValue }) => {
    try {
      const normalizedStatus = String(status || "ALL")
        .trim()
        .toUpperCase();

      if (normalizedStatus === "ALL") {
        const res = await api.get("/sub-categories", {
          params: { page, size },
        });

        return res.data;
      }

      const res = await api.get(`/sub-categories/status/${normalizedStatus}`, {
        params: { page, size },
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  },
);
