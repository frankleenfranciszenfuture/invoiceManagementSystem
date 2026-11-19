import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

export const fetchDashboardOverview = createAsyncThunk(
  "dashboard/fetchDashboardOverview",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/dashboard", {
        params: {
          period: filters.period || "LAST_30_DAYS",
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
        },
      });

      // Support both:
      // { data: { kpis: ... } }
      // { kpis: ... }
      const result = response.data?.data ?? response.data;

      if (!result || !result.kpis) {
        return rejectWithValue(
          "Dashboard API returned an unexpected response structure.",
        );
      }

      return result;
    } catch (error) {
      console.error("Dashboard API Error:", {
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
        url: error.config?.url,
        params: error.config?.params,
      });

      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to load dashboard",
      );
    }
  },
);
