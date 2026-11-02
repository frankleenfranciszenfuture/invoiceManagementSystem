import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../api/api";

/**
 * Fetch all payments with filters and pagination
 */
export const fetchAllPayments = createAsyncThunk(
  "payment/fetchAllPayments",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/payments", {
        params: filters,
      });

      console.log("Payment API Response:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch payment by ID
 */
export const fetchPaymentById = createAsyncThunk(
  "payment/fetchPaymentById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/payments/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Create payment
 */
export const createPayment = createAsyncThunk(
  "payment/createPayment",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/payments", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch payments by source document
 * Pass: { paymentType, sourceId }
 */
export const fetchPaymentsBySource = createAsyncThunk(
  "payment/fetchPaymentsBySource",
  async ({ paymentType, sourceId }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/payments/source/${paymentType}/${sourceId}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Reverse payment
 * Pass: { id, reversalReason }
 */
export const reversePayment = createAsyncThunk(
  "payment/reversePayment",
  async ({ id, reversalReason }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/payments/${id}/reverse`, { reversalReason });

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);
