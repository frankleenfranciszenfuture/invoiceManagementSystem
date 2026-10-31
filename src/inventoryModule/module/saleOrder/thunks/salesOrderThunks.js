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
   CREATE SALES ORDER
============================================================ */

export const createSalesOrder = createAsyncThunk(
  "salesOrder/createSalesOrder",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/sale-orders", data);
      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to create sales order"),
      );
    }
  },
);

/* ============================================================
   FETCH SALES ORDER BY ID
============================================================ */

export const fetchSalesOrderById = createAsyncThunk(
  "salesOrder/fetchSalesOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sale-orders/${id}`);
      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(handleError(error, "Failed to fetch sales order"));
    }
  },
);

/* ============================================================
   FETCH ALL SALES ORDERS
============================================================ */

export const fetchAllSalesOrders = createAsyncThunk(
  "salesOrder/fetchAllSalesOrders",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = {
        orderNo: filters.orderNo || undefined,
        partyType: filters.partyType || undefined,
        customerId: filters.customerId || undefined,
        partyId: filters.partyId || undefined,
        warehouseId: filters.warehouseId || undefined,
        salesOrderStatus:
          filters.salesOrderStatus === "ALL"
            ? undefined
            : filters.salesOrderStatus || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        page: filters.page ?? 0,
        size: filters.size ?? 10,
        sort: filters.sort || undefined,
      };

      const response = await api.get("/sale-orders", {
        params,
      });

      // Your API response: response.data.data
      const result = response.data?.data;

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

      throw new Error("Invalid sales order response from server");
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to fetch sales orders"),
      );
    }
  },
);

/* ============================================================
   UPDATE SALES ORDER
============================================================ */

export const updateSalesOrder = createAsyncThunk(
  "salesOrder/updateSalesOrder",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/sale-orders/${id}`, data);
      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to update sales order"),
      );
    }
  },
);

/* ============================================================
   DISPATCH SALES ORDER
============================================================ */

export const dispatchSalesOrder = createAsyncThunk(
  "salesOrder/dispatchSalesOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/sale-orders/${id}/dispatch`);
      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to dispatch sales order"),
      );
    }
  },
);

/* ============================================================
   CONFIRM SALES ORDER
============================================================ */

export const confirmSalesOrder = createAsyncThunk(
  "salesOrder/confirmSalesOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/sale-orders/${id}/confirm`);
      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to confirm sales order"),
      );
    }
  },
);

/* ============================================================
   CANCEL SALES ORDER
============================================================ */

export const cancelSalesOrder = createAsyncThunk(
  "salesOrder/cancelSalesOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/sale-orders/${id}/cancel`);
      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to cancel sales order"),
      );
    }
  },
);

/* ============================================================
   DELETE SALES ORDER
============================================================ */

export const deleteSalesOrder = createAsyncThunk(
  "salesOrder/deleteSalesOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/sale-orders/${id}`);

      return {
        id,
        response: getResponseData(response),
      };
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to delete sales order"),
      );
    }
  },
);
