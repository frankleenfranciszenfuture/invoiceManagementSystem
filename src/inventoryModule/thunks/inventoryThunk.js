import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

// =====================================================
// COMMON ERROR HANDLER
// =====================================================

const handleError = (error, fallbackMessage) => {
  return error.response?.data?.message || error.message || fallbackMessage;
};

// =====================================================
// CREATE OPENING STOCK
// POST /inventory/opening-stock
// =====================================================

export const createOpeningStock = createAsyncThunk(
  "inventory/createOpeningStock",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/inventory/opening-stock", data);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to create opening stock"),
      );
    }
  },
);

// =====================================================
// STOCK ADJUSTMENT
// POST /inventory/adjustments
// =====================================================

export const adjustStock = createAsyncThunk(
  "inventory/adjustStock",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/inventory/adjustments", data);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Failed to adjust stock"));
    }
  },
);

// =====================================================
// GET STOCK BY ID
// GET /inventory/stocks/{stockId}
// =====================================================

export const fetchStockById = createAsyncThunk(
  "inventory/fetchStockById",
  async (stockId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/inventory/stocks/${stockId}`);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch stock details"),
      );
    }
  },
);

// =====================================================
// GET ALL STOCKS WITH FILTERS
// GET /inventory/stocks
// =====================================================

export const fetchAllStocks = createAsyncThunk(
  "inventory/fetchAllStocks",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/inventory/stocks", {
        params: {
          productId: filters.productId || undefined,
          warehouseId: filters.warehouseId || undefined,
          unitId: filters.unitId || undefined,
          sizeId: filters.sizeId || undefined,
          availableOnly: filters.availableOnly ?? undefined,

          page: filters.page ?? 0,
          size: filters.size ?? 10,
          sort: filters.sort || undefined,
        },
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch inventory stocks"),
      );
    }
  },
);

// =====================================================
// GET STOCK BY PRODUCT
// GET /inventory/stocks/product/{productId}
// =====================================================

export const fetchStockByProduct = createAsyncThunk(
  "inventory/fetchStockByProduct",
  async ({ productId, ...pagination }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/inventory/stocks/product/${productId}`, {
        params: {
          page: pagination.page ?? 0,
          size: pagination.size ?? 10,
          sort: pagination.sort || undefined,
        },
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch product stock"),
      );
    }
  },
);

// =====================================================
// GET STOCK BY WAREHOUSE
// GET /inventory/stocks/warehouse/{warehouseId}
// =====================================================

export const fetchStockByWarehouse = createAsyncThunk(
  "inventory/fetchStockByWarehouse",
  async ({ warehouseId, ...pagination }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/inventory/stocks/warehouse/${warehouseId}`,
        {
          params: {
            page: pagination.page ?? 0,
            size: pagination.size ?? 10,
            sort: pagination.sort || undefined,
          },
        },
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch warehouse stock"),
      );
    }
  },
);

// =====================================================
// GET LOW STOCK
// GET /inventory/stocks/low-stock
// =====================================================

export const fetchLowStock = createAsyncThunk(
  "inventory/fetchLowStock",
  async ({ minimumQuantity, ...pagination }, { rejectWithValue }) => {
    try {
      const response = await api.get("/inventory/stocks/low-stock", {
        params: {
          minimumQuantity,
          page: pagination.page ?? 0,
          size: pagination.size ?? 10,
          sort: pagination.sort || undefined,
        },
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch low stock records"),
      );
    }
  },
);

// =====================================================
// GET ALL INVENTORY TRANSACTIONS WITH FILTERS
// GET /inventory/transactions
// =====================================================

export const fetchAllInventoryTransactions = createAsyncThunk(
  "inventory/fetchAllInventoryTransactions",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/inventory/transactions", {
        params: {
          productId: filters.productId || undefined,
          warehouseId: filters.warehouseId || undefined,
          unitId: filters.unitId || undefined,
          sizeId: filters.sizeId || undefined,

          movementType: filters.movementType || undefined,

          referenceType: filters.referenceType || undefined,

          referenceId: filters.referenceId || undefined,

          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,

          page: filters.page ?? 0,
          size: filters.size ?? 10,
          sort: filters.sort || undefined,
        },
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch inventory transactions"),
      );
    }
  },
);

// =====================================================
// GET TRANSACTION BY ID
// GET /inventory/transactions/{transactionId}
// =====================================================

export const fetchInventoryTransactionById = createAsyncThunk(
  "inventory/fetchInventoryTransactionById",
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/inventory/transactions/${transactionId}`,
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch transaction details"),
      );
    }
  },
);

// =====================================================
// GET TRANSACTIONS BY PRODUCT
// GET /inventory/transactions/product/{productId}
// =====================================================

export const fetchTransactionsByProduct = createAsyncThunk(
  "inventory/fetchTransactionsByProduct",
  async ({ productId, ...pagination }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/inventory/transactions/product/${productId}`,
        {
          params: {
            page: pagination.page ?? 0,
            size: pagination.size ?? 10,
            sort: pagination.sort || undefined,
          },
        },
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch product transactions"),
      );
    }
  },
);

// =====================================================
// GET TRANSACTIONS BY WAREHOUSE
// GET /inventory/transactions/warehouse/{warehouseId}
// =====================================================

export const fetchTransactionsByWarehouse = createAsyncThunk(
  "inventory/fetchTransactionsByWarehouse",
  async ({ warehouseId, ...pagination }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/inventory/transactions/warehouse/${warehouseId}`,
        {
          params: {
            page: pagination.page ?? 0,
            size: pagination.size ?? 10,
            sort: pagination.sort || undefined,
          },
        },
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch warehouse transactions"),
      );
    }
  },
);

// =====================================================
// INVENTORY DASHBOARD
// GET /inventory/dashboard
// =====================================================

export const fetchInventoryDashboard = createAsyncThunk(
  "inventory/fetchInventoryDashboard",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/inventory/dashboard", {
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
        handleError(error, "Failed to fetch inventory dashboard"),
      );
    }
  },
);
