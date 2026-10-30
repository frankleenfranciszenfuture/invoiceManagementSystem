import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../api/api";

/* -------------------------------------------------------------------------- */
/*                                  ERROR                                     */
/* -------------------------------------------------------------------------- */

const handleError = (error, fallbackMessage) => {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallbackMessage
  );
};

/* -------------------------------------------------------------------------- */
/*                              CREATE SALE ORDER                             */
/* -------------------------------------------------------------------------- */

export const createSalesOrder = createAsyncThunk(
  "salesOrder/createSalesOrder",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/sale-orders", data);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to create sales order"),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/*                           FETCH SALE ORDER BY ID                           */
/* -------------------------------------------------------------------------- */

export const fetchSalesOrderById = createAsyncThunk(
  "salesOrder/fetchSalesOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sale-orders/${id}`);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(handleError(error, "Failed to fetch sales order"));
    }
  },
);

/* -------------------------------------------------------------------------- */
/*                          FETCH ALL SALE ORDERS                             */
/* -------------------------------------------------------------------------- */

export const fetchAllSalesOrders = createAsyncThunk(
  "salesOrder/fetchAllSalesOrders",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/sale-orders", {
        params: {
          orderNo: filters.orderNo || undefined,

          partyType: filters.partyType || undefined,

          customerId: filters.customerId || undefined,

          partyId: filters.partyId || undefined,

          warehouseId: filters.warehouseId || undefined,

          salesOrderStatus: filters.salesOrderStatus || undefined,

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
        handleError(error, "Failed to fetch sales orders"),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/*                              UPDATE SALE ORDER                             */
/* -------------------------------------------------------------------------- */

export const updateSalesOrder = createAsyncThunk(
  "salesOrder/updateSalesOrder",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/sale-orders/${id}`, data);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to update sales order"),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/*                             DISPATCH SALE ORDER                            */
/* -------------------------------------------------------------------------- */

export const dispatchSalesOrder = createAsyncThunk(
  "salesOrder/dispatchSalesOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/sale-orders/${id}/dispatch`);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to dispatch sales order"),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/*                              CONFIRM SALE ORDER                            */
/* -------------------------------------------------------------------------- */

export const confirmSalesOrder = createAsyncThunk(
  "salesOrder/confirmSalesOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/sale-orders/${id}/confirm`);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to confirm sales order"),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/*                               CANCEL SALE ORDER                            */
/* -------------------------------------------------------------------------- */

export const cancelSalesOrder = createAsyncThunk(
  "salesOrder/cancelSalesOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/sale-orders/${id}/cancel`);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to cancel sales order"),
      );
    }
  },
);

/* -------------------------------------------------------------------------- */
/*                               DELETE SALE ORDER                            */
/* -------------------------------------------------------------------------- */

export const deleteSalesOrder = createAsyncThunk(
  "salesOrder/deleteSalesOrder",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/sale-orders/${id}`);

      return {
        id,
        response: response.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        handleError(error, "Failed to delete sales order"),
      );
    }
  },
);
