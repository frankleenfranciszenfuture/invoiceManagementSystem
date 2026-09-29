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

  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/invoices/${id}`);

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

  async (saleId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/invoices/sale/${saleId}`);

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

  async (purchaseId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/invoices/purchase/${purchaseId}`);

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

  async (stockTransferId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/invoices/stock-transfer/${stockTransferId}`);

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

  async (data, { rejectWithValue }) => {
    try {
      console.log(
        "CREATE INVOICE REQUEST BODY:",
        JSON.stringify(data, null, 2),
      );

      const res = await api.post("/invoices", data);

      console.log("CREATE INVOICE RESPONSE:", res.data);

      return res.data.data;
    } catch (error) {
      console.error("Create invoice error:", error);
      console.error("Response:", error?.response?.data);

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

  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/invoices/${id}`, data);

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

  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`/invoices/${id}/cancel`, {});

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

  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/invoices/${id}`);

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

/* =========================================================
   GENERATE INVOICE NUMBER
========================================================= */

export const fetchGeneratedInvoiceNumber = createAsyncThunk(
  "invoice/fetchGeneratedInvoiceNumber",

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/invoices/generate");

      return response.data.data;
    } catch (error) {
      console.error("Generate invoice number error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to generate invoice number.",
      );
    }
  },
);
