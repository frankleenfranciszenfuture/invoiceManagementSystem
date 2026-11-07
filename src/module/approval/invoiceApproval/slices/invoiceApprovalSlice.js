import { createSlice } from "@reduxjs/toolkit";

import {
  submitInvoiceForApproval,
  fetchPendingInvoiceApprovals,
  fetchInvoiceApprovalById,
  approveInvoiceApproval,
  rejectInvoiceApproval,
  cancelInvoiceApproval,
  fetchInvoiceApprovalHistory,
} from "../thunks/invoiceApprovalThunks";

// =========================================================
// RESPONSE HELPER
// ApiResponse: { success, message, data }
// =========================================================

const getResponseData = (payload) => {
  return payload?.data ?? payload;
};

const initialState = {
  pendingApprovals: [],
  selectedApproval: null,
  approvalHistory: [],

  pagination: {
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },

  loading: false,
  actionLoading: false,
  error: null,
  message: "",
};

const invoiceApprovalSlice = createSlice({
  name: "invoiceApproval",
  initialState,

  reducers: {
    clearApprovalError: (state) => {
      state.error = null;
    },

    clearSelectedApproval: (state) => {
      state.selectedApproval = null;
    },

    clearApprovalHistory: (state) => {
      state.approvalHistory = [];
    },

    clearApprovalState: () => initialState,
  },

  extraReducers: (builder) => {
    // =====================================================
    // SUBMIT FOR APPROVAL
    // =====================================================

    builder
      .addCase(submitInvoiceForApproval.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.message = "";
      })
      .addCase(submitInvoiceForApproval.fulfilled, (state, action) => {
        state.actionLoading = false;

        const response = action.payload;
        const approval = getResponseData(response);

        state.message =
          response?.message || "Invoice submitted for approval successfully.";

        if (approval?.id) {
          state.selectedApproval = approval;
        }
      })
      .addCase(submitInvoiceForApproval.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to submit invoice for approval.";
      });

    // =====================================================
    // FETCH PENDING APPROVALS
    // =====================================================

    builder
      .addCase(fetchPendingInvoiceApprovals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingInvoiceApprovals.fulfilled, (state, action) => {
        state.loading = false;

        const pageData = getResponseData(action.payload) || {};

        state.pendingApprovals = Array.isArray(pageData.content)
          ? pageData.content
          : [];

        state.pagination = {
          pageNumber: pageData.pageNumber ?? 0,
          pageSize: pageData.pageSize ?? 20,
          totalElements: pageData.totalElements ?? 0,
          totalPages: pageData.totalPages ?? 0,
          last: pageData.last ?? true,
        };

        state.message = action.payload?.message || "";
      })
      .addCase(fetchPendingInvoiceApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch pending approvals.";
      });

    // =====================================================
    // FETCH APPROVAL DETAILS
    // =====================================================

    builder
      .addCase(fetchInvoiceApprovalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceApprovalById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedApproval = getResponseData(action.payload);
      })
      .addCase(fetchInvoiceApprovalById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch approval details.";
      });

    // =====================================================
    // APPROVE / REJECT / CANCEL
    // =====================================================

    const decisionThunks = [
      approveInvoiceApproval,
      rejectInvoiceApproval,
      cancelInvoiceApproval,
    ];

    decisionThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.actionLoading = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.actionLoading = false;

          const response = action.payload;
          const updatedApproval = getResponseData(response);

          state.message =
            response?.message || "Invoice approval updated successfully.";

          if (updatedApproval?.id) {
            state.selectedApproval = updatedApproval;

            state.pendingApprovals = state.pendingApprovals.filter(
              (item) => String(item.id) !== String(updatedApproval.id),
            );
          }
        })
        .addCase(thunk.rejected, (state, action) => {
          state.actionLoading = false;
          state.error =
            action.payload ||
            action.error?.message ||
            "Failed to update invoice approval.";
        });
    });

    // =====================================================
    // FETCH INVOICE APPROVAL HISTORY
    // =====================================================

    builder
      .addCase(fetchInvoiceApprovalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceApprovalHistory.fulfilled, (state, action) => {
        state.loading = false;

        const history = getResponseData(action.payload);

        state.approvalHistory = Array.isArray(history) ? history : [];
      })
      .addCase(fetchInvoiceApprovalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch invoice approval history.";
      });
  },
});

export const {
  clearApprovalError,
  clearSelectedApproval,
  clearApprovalHistory,
  clearApprovalState,
} = invoiceApprovalSlice.actions;

export default invoiceApprovalSlice.reducer;
