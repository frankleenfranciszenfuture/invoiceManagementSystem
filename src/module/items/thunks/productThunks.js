import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/* =========================================================
   FETCH ALL PRODUCTS
   ========================================================= */

export const fetchAllProducts = createAsyncThunk(
  "product/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/products");

      console.log("Products:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/* =========================================================
   FETCH PRODUCT BY ID
   ========================================================= */

export const fetchProductById = createAsyncThunk(
  "product/fetchProduct",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/products/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/* =========================================================
   CREATE PRODUCT
   ========================================================= */

export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/products", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/* =========================================================
   UPDATE PRODUCT
   ========================================================= */

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/products/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/* =========================================================
   DELETE PRODUCT
   ========================================================= */

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/products/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
