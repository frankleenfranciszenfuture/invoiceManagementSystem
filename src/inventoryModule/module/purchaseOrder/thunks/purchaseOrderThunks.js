import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../api/api";

/* ============================================================
   ERROR HANDLER
============================================================ */

const handleError = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
};

/* ============================================================
   RESPONSE HANDLER
============================================================ */

const getResponseData = (response) => {
  return response?.data?.data ?? response?.data ?? null;
};

/* ============================================================
   CREATE PURCHASE ORDER
============================================================ */

export const createPurchaseOrder = createAsyncThunk(
  "purchaseOrder/createPurchaseOrder",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/purchase-orders", data);

      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to create purchase order"),
      );
    }
  },
);

/* ============================================================
   FETCH PURCHASE ORDER BY ID
============================================================ */

export const fetchPurchaseOrderById = createAsyncThunk(
  "purchaseOrder/fetchPurchaseOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/purchase-orders/${id}`);

      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch purchase order"),
      );
    }
  },
);

/* ============================================================
   FETCH ALL PURCHASE ORDERS
============================================================ */

export const fetchAllPurchaseOrders = createAsyncThunk(
  "purchaseOrder/fetchAllPurchaseOrders",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = {
        page: filters.page ?? 0,
        size: filters.size ?? 10,
        sort: filters.sort || undefined,
      };

      const requestData = {
        search: filters.search || undefined,
        orderNo: filters.orderNo || undefined,
        partyId: filters.partyId || undefined,
        warehouseId: filters.warehouseId || undefined,
        currencyId: filters.currencyId || undefined,
        status:
          filters.status === "ALL" ? undefined : filters.status || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      };

      const response = await api.post("/purchase-orders/search", requestData, {
        params,
      });

      const result = getResponseData(response);

      if (Array.isArray(result?.content)) {
        return result;
      }

      if (Array.isArray(result)) {
        return {
          content: result,
          pageNumber: 0,
          pageSize: result.length,
          totalElements: result.length,
          totalPages: 1,
          last: true,
        };
      }

      throw new Error("Invalid purchase order response from server");
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch purchase orders"),
      );
    }
  },
);

/* ============================================================
   UPDATE PURCHASE ORDER
============================================================ */

export const updatePurchaseOrder = createAsyncThunk(
  "purchaseOrder/updatePurchaseOrder",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/purchase-orders/${id}`, data);

      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to update purchase order"),
      );
    }
  },
);

/* ============================================================
   CONFIRM PURCHASE ORDER
============================================================ */

export const confirmPurchaseOrder = createAsyncThunk(
  "purchaseOrder/confirmPurchaseOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/purchase-orders/${id}/confirm`);

      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to confirm purchase order"),
      );
    }
  },
);

/* ============================================================
   CANCEL PURCHASE ORDER
============================================================ */

export const cancelPurchaseOrder = createAsyncThunk(
  "purchaseOrder/cancelPurchaseOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/purchase-orders/${id}/cancel`);

      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to cancel purchase order"),
      );
    }
  },
);

/* ============================================================
   DELETE PURCHASE ORDER
============================================================ */

export const deletePurchaseOrder = createAsyncThunk(
  "purchaseOrder/deletePurchaseOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/purchase-orders/${id}`);

      return {
        id,
        response: getResponseData(response),
      };
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to delete purchase order"),
      );
    }
  },
);

/* ============================================================
   CREATE GOODS RECEIPT
============================================================ */

export const createPurchaseOrderGoodsReceipt = createAsyncThunk(
  "purchaseOrder/createPurchaseOrderGoodsReceipt",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/purchase-orders/goods-receipts", data);

      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to create goods receipt"),
      );
    }
  },
);

/* ============================================================
   FETCH GOODS RECEIPT BY ID
============================================================ */

export const fetchPurchaseOrderGoodsReceiptById = createAsyncThunk(
  "purchaseOrder/fetchPurchaseOrderGoodsReceiptById",
  async (receiptId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/purchase-orders/goods-receipts/${receiptId}`,
      );

      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch goods receipt"),
      );
    }
  },
);

/* ============================================================
   FETCH GOODS RECEIPTS BY PURCHASE ORDER ID
============================================================ */

export const fetchPurchaseOrderGoodsReceipts = createAsyncThunk(
  "purchaseOrder/fetchPurchaseOrderGoodsReceipts",
  async (purchaseOrderId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/purchase-orders/${purchaseOrderId}/goods-receipts`,
      );

      const result = getResponseData(response);

      return Array.isArray(result) ? result : [];
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch goods receipts"),
      );
    }
  },
);
