import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/**
 * Fetch all currencies
 */
export const fetchAllCurrencies = createAsyncThunk(
  "currency/fetchAllCurrencies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/currencies");

      console.log("Currencies:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Fetch currency by ID
 */
export const fetchCurrencyById = createAsyncThunk(
  "currency/fetchCurrency",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/currencies/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Create currency
 */
export const createCurrency = createAsyncThunk(
  "currency/createCurrency",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/currencies", data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Update currency
 */
export const updateCurrency = createAsyncThunk(
  "currency/updateCurrency",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/currencies/${id}`, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

/**
 * Delete currency
 */
export const deleteCurrency = createAsyncThunk(
  "currency/deleteCurrency",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/currencies/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message);
    }
  },
);

export const fetchExchangeRate = createAsyncThunk(
  "currency/fetchExchangeRate",
  async ({ fromCurrencyId, toCurrencyId }, { rejectWithValue }) => {
    try {
      const res = await api.get("/exchange-rates/lookup", {
        params: {
          fromCurrencyId,
          toCurrencyId,
        },
      });

      const result = res.data?.data;

      if (!res.data?.success || result?.rate == null) {
        return rejectWithValue(
          res.data?.message || "Exchange rate was not found",
        );
      }

      const rate = Number(result.rate);

      if (!Number.isFinite(rate) || rate <= 0) {
        return rejectWithValue("Invalid exchange rate received");
      }

      return result;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error.message ||
          "Unable to fetch exchange rate",
      );
    }
  },
);
