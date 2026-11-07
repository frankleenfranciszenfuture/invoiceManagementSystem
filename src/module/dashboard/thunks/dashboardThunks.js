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

      console.log("DASHBOARD API RESPONSE:", response.data);

      // Support both:
      // { data: { kpis: ... } }
      // { kpis: ... }
      const result = response.data?.data ?? response.data;

      if (!result || !result.kpis) {
        console.error("Invalid dashboard response:", result);

        return rejectWithValue(
          "Dashboard API returned an unexpected response structure.",
        );
      }

      console.log("DASHBOARD DATA:", result);

      return result;
    } catch (error) {
      console.error("DASHBOARD API ERROR:", error.response?.data || error);

      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to load dashboard",
      );
    }
  },
);
