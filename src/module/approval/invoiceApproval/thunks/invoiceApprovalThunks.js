import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../api/api";

// =========================================================
// SUBMIT INVOICE FOR APPROVAL
// POST /invoice-approvals/{invoiceId}/send
// =========================================================

export const submitInvoiceForApproval = createAsyncThunk(
  "invoiceApproval/submitInvoiceForApproval",
  async ({ invoiceId, data } = {}, { rejectWithValue }) => {
    try {
      if (!invoiceId) {
        return rejectWithValue("Invoice ID is required.");
      }

      const url = `/invoice-approvals/${invoiceId}/send`;

      const response = data ? await api.post(url, data) : await api.post(url);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to submit invoice for approval.",
      );
    }
  },
);

// =========================================================
// GET PENDING APPROVALS
// GET /invoice-approvals/pending
// =========================================================

export const fetchPendingInvoiceApprovals = createAsyncThunk(
  "invoiceApproval/fetchPendingInvoiceApprovals",
  async ({ page = 0, size = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/invoice-approvals/pending", {
        params: { page, size },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch pending invoice approvals.",
      );
    }
  },
);

// =========================================================
// GET APPROVAL BY ID
// GET /invoice-approvals/{id}
// =========================================================

export const fetchInvoiceApprovalById = createAsyncThunk(
  "invoiceApproval/fetchInvoiceApprovalById",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Approval ID is required.");
      }

      const response = await api.get(`/invoice-approvals/${id}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch invoice approval details.",
      );
    }
  },
);

// =========================================================
// APPROVE INVOICE
// PATCH /invoice-approvals/{id}/approve
// =========================================================

export const approveInvoiceApproval = createAsyncThunk(
  "invoiceApproval/approveInvoiceApproval",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Approval ID is required.");
      }

      const response = await api.patch(
        `/invoice-approvals/${id}/approve`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to approve invoice.",
      );
    }
  },
);

// =========================================================
// REJECT INVOICE
// PATCH /invoice-approvals/{id}/reject
// =========================================================

export const rejectInvoiceApproval = createAsyncThunk(
  "invoiceApproval/rejectInvoiceApproval",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Approval ID is required.");
      }

      const response = await api.patch(`/invoice-approvals/${id}/reject`, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reject invoice.",
      );
    }
  },
);

// =========================================================
// CANCEL APPROVAL REQUEST
// PATCH /invoice-approvals/{id}/cancel
// =========================================================

export const cancelInvoiceApproval = createAsyncThunk(
  "invoiceApproval/cancelInvoiceApproval",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Approval ID is required.");
      }

      const response = await api.patch(`/invoice-approvals/${id}/cancel`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to cancel invoice approval request.",
      );
    }
  },
);

// =========================================================
// GET INVOICE APPROVAL HISTORY
// GET /invoice-approvals/invoice/{invoiceId}
// =========================================================

export const fetchInvoiceApprovalHistory = createAsyncThunk(
  "invoiceApproval/fetchInvoiceApprovalHistory",
  async (invoiceId, { rejectWithValue }) => {
    try {
      if (!invoiceId) {
        return rejectWithValue("Invoice ID is required.");
      }

      const response = await api.get(`/invoice-approvals/invoice/${invoiceId}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch invoice approval history.",
      );
    }
  },
);
