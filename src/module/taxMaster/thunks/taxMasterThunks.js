import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/* =========================================================
   FETCH ALL TAX MASTERS
   ========================================================= */

export const fetchAllTaxMasters = createAsyncThunk(
  "taxMaster/fetchTaxMasters",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/tax-masters");

      console.log("Tax Masters:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/* =========================================================
   FETCH TAX MASTER BY ID
   ========================================================= */

export const fetchTaxMasterById = createAsyncThunk(
  "taxMaster/fetchTaxMaster",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/tax-masters/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/* =========================================================
   CREATE TAX MASTER
   ========================================================= */

export const createTaxMaster = createAsyncThunk(
  "taxMaster/createTaxMaster",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/tax-masters", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/* =========================================================
   UPDATE TAX MASTER
   ========================================================= */

export const updateTaxMaster = createAsyncThunk(
  "taxMaster/updateTaxMaster",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/tax-masters/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/* =========================================================
   DELETE TAX MASTER
   ========================================================= */

export const deleteTaxMaster = createAsyncThunk(
  "taxMaster/deleteTaxMaster",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/tax-masters/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/* =========================================================
   REACTIVATE TAX MASTER
   ========================================================= */

export const reactivateTaxMaster = createAsyncThunk(
  "taxMaster/reactivateTaxMaster",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/tax-masters/${id}/reactivate`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/* =========================================================
   FETCH TAX MASTERS BY STATUS
   ========================================================= */

export const fetchTaxMastersByStatus = createAsyncThunk(
  "taxMaster/fetchByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const res = await api.get(`/tax-masters/status/${status}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
