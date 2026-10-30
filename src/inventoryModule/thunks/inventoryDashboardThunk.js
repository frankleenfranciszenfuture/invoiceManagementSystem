import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// ============================================
// FETCH INVENTORY DASHBOARD
// ============================================

export const fetchInventoryDashboard = createAsyncThunk(
  "inventoryDashboard/fetchInventoryDashboard",

  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/inventory/dashboard", {
        params: {
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,

          warehouseId: filters.warehouseId || undefined,
          productId: filters.productId || undefined,
          unitId: filters.unitId || undefined,
          sizeId: filters.sizeId || undefined,

          movementType: filters.movementType || undefined,
          referenceType: filters.referenceType || undefined,

          page: filters.page ?? 0,
          size: filters.size ?? 10,

          sortBy: filters.sortBy || "transactionDate",
          sortDirection: filters.sortDirection || "DESC",
        },
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch inventory dashboard",
      );
    }
  },
);
