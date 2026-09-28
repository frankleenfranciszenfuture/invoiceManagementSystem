import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/* =========================================================
   GET ALL INVOICES / SEARCH / PAGINATION
========================================================= */

export const fetchInvoices = createAsyncThunk(
  "invoice/fetchInvoices",

  async (
    { id, page = 0, size = 20, searchParams = {} },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get("/invoices", {
        params: {
          branchId: id,
          page,
          size,
          ...searchParams,
        },
      });

      console.log("Invoices:", res.data);

      return res.data;
    } catch (error) {
      console.error("Fetch invoices error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch invoices.",
      );
    }
  },
);

/* =========================================================
   GET SINGLE INVOICE
========================================================= */

export const fetchInvoiceById = createAsyncThunk(
  "invoice/fetchInvoiceById",

  async ({ id, branchId }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/invoices/${id}`, {
        params: {
          branchId,
        },
      });

      return res.data.data;
    } catch (error) {
      console.error("Fetch invoice error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch invoice.",
      );
    }
  },
);

/* =========================================================
   GET SALE INVOICE
========================================================= */

export const fetchInvoiceBySaleId = createAsyncThunk(
  "invoice/fetchInvoiceBySaleId",

  async ({ saleId, branchId }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/invoices/sale/${saleId}`, {
        params: {
          branchId,
        },
      });

      return res.data.data;
    } catch (error) {
      console.error("Fetch sale invoice error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch sale invoice.",
      );
    }
  },
);

/* =========================================================
   GET PURCHASE INVOICE
========================================================= */

export const fetchInvoiceByPurchaseId = createAsyncThunk(
  "invoice/fetchInvoiceByPurchaseId",

  async ({ purchaseId, branchId }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/invoices/purchase/${purchaseId}`, {
        params: {
          branchId,
        },
      });

      return res.data.data;
    } catch (error) {
      console.error("Fetch purchase invoice error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch purchase invoice.",
      );
    }
  },
);

/* =========================================================
   GET STOCK TRANSFER INVOICE
========================================================= */

export const fetchInvoiceByStockTransferId = createAsyncThunk(
  "invoice/fetchInvoiceByStockTransferId",

  async ({ stockTransferId, branchId }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/invoices/stock-transfer/${stockTransferId}`, {
        params: {
          branchId,
        },
      });

      return res.data.data;
    } catch (error) {
      console.error("Fetch stock transfer invoice error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch stock transfer invoice.",
      );
    }
  },
);

/* =========================================================
   CREATE INVOICE
========================================================= */

export const createInvoice = createAsyncThunk(
  "invoice/createInvoice",

  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.post("/invoices", data, {
        params: {
          branchId: id,
        },
      });

      return res.data.data;
    } catch (error) {
      console.error("Create invoice error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create invoice.",
      );
    }
  },
);

/* =========================================================
   UPDATE INVOICE
========================================================= */

export const editInvoice = createAsyncThunk(
  "invoice/editInvoice",

  async ({ id, branchId, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/invoices/${id}`, data, {
        params: {
          branchId,
        },
      });

      return res.data.data;
    } catch (error) {
      console.error("Update invoice error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update invoice.",
      );
    }
  },
);

/* =========================================================
   CANCEL INVOICE
========================================================= */

export const cancelInvoice = createAsyncThunk(
  "invoice/cancelInvoice",

  async ({ id, branchId }, { rejectWithValue }) => {
    try {
      const res = await api.put(
        `/invoices/${id}/cancel`,
        {},
        {
          params: {
            branchId,
          },
        },
      );

      return res.data.data;
    } catch (error) {
      console.error("Cancel invoice error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to cancel invoice.",
      );
    }
  },
);

/* =========================================================
   DELETE INVOICE
========================================================= */

export const removeInvoice = createAsyncThunk(
  "invoice/removeInvoice",

  async ({ id, branchId }, { rejectWithValue }) => {
    try {
      await api.delete(`/invoices/${id}`, {
        params: {
          branchId,
        },
      });

      return id;
    } catch (error) {
      console.error("Delete invoice error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete invoice.",
      );
    }
  },
);
