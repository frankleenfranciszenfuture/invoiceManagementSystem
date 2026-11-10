import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAuditLogs,
  fetchAuditLogById,
  fetchEntityAuditHistory,
} from "../thunks/auditLogThunks";

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState = {
  auditLogs: [],

  selectedAuditLog: null,

  entityAuditHistory: [],

  pagination: {
    pageNumber: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,
  },

  historyPagination: {
    pageNumber: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,
  },

  filters: {
    entityName: "",
    entityId: "",
    action: "",
    performedBy: "",
    performedByType: "",
    keyword: "",
    fromDate: "",
    toDate: "",
    sortBy: "createdAt",
    sortDirection: "DESC",
  },

  loading: false,
  detailsLoading: false,
  historyLoading: false,

  error: null,
  detailsError: null,
  historyError: null,
};

/* =====================================================
   RESPONSE HELPERS
===================================================== */

const getPageContent = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.content || payload?.data || payload?.items || [];
};

const getPagination = (payload, fallback = {}) => ({
  pageNumber: payload?.pageNumber ?? payload?.page ?? fallback.pageNumber ?? 0,

  pageSize: payload?.pageSize ?? payload?.size ?? fallback.pageSize ?? 10,

  totalPages: payload?.totalPages ?? 0,

  totalElements: payload?.totalElements ?? 0,
});

/* =====================================================
   SLICE
===================================================== */

const auditLogSlice = createSlice({
  name: "auditLogs",

  initialState,

  reducers: {
    /* =============================================
           SET FILTERS
        ============================================= */

    setAuditLogFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    /* =============================================
           RESET FILTERS
        ============================================= */

    resetAuditLogFilters: (state) => {
      state.filters = {
        ...initialState.filters,
      };

      state.pagination.pageNumber = 0;
    },

    /* =============================================
           SET PAGE
        ============================================= */

    setAuditLogPage: (state, action) => {
      state.pagination.pageNumber = action.payload;
    },

    /* =============================================
           SET PAGE SIZE
        ============================================= */

    setAuditLogPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.pageNumber = 0;
    },

    /* =============================================
           CLEAR SELECTED AUDIT LOG
        ============================================= */

    clearSelectedAuditLog: (state) => {
      state.selectedAuditLog = null;
      state.detailsError = null;
    },

    /* =============================================
           CLEAR ENTITY HISTORY
        ============================================= */

    clearEntityAuditHistory: (state) => {
      state.entityAuditHistory = [];

      state.historyPagination = {
        ...initialState.historyPagination,
      };

      state.historyError = null;
    },

    /* =============================================
           CLEAR AUDIT LOG ERROR
        ============================================= */

    clearAuditLogError: (state) => {
      state.error = null;
      state.detailsError = null;
      state.historyError = null;
    },

    /* =============================================
           RESET AUDIT LOG STATE
        ============================================= */

    resetAuditLogState: () => ({
      ...initialState,
      filters: { ...initialState.filters },
      pagination: { ...initialState.pagination },
      historyPagination: {
        ...initialState.historyPagination,
      },
    }),
  },

  extraReducers: (builder) => {
    /* =============================================
           FETCH ALL AUDIT LOGS
        ============================================= */

    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload;

        state.auditLogs = getPageContent(payload);

        state.pagination = getPagination(payload, state.pagination);
      })

      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch audit logs.";
      });

    /* =============================================
           FETCH AUDIT LOG BY ID
        ============================================= */

    builder
      .addCase(fetchAuditLogById.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
        state.selectedAuditLog = null;
      })

      .addCase(fetchAuditLogById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedAuditLog = action.payload;
      })

      .addCase(fetchAuditLogById.rejected, (state, action) => {
        state.detailsLoading = false;

        state.detailsError =
          action.payload ||
          action.error?.message ||
          "Failed to fetch audit log details.";
      });

    /* =============================================
           FETCH ENTITY AUDIT HISTORY
        ============================================= */

    builder
      .addCase(fetchEntityAuditHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })

      .addCase(fetchEntityAuditHistory.fulfilled, (state, action) => {
        state.historyLoading = false;

        const payload = action.payload;

        state.entityAuditHistory = getPageContent(payload);

        state.historyPagination = getPagination(
          payload,
          state.historyPagination,
        );
      })

      .addCase(fetchEntityAuditHistory.rejected, (state, action) => {
        state.historyLoading = false;

        state.historyError =
          action.payload ||
          action.error?.message ||
          "Failed to fetch entity audit history.";
      });
  },
});

/* =====================================================
   EXPORT ACTIONS
===================================================== */

export const {
  setAuditLogFilters,
  resetAuditLogFilters,
  setAuditLogPage,
  setAuditLogPageSize,
  clearSelectedAuditLog,
  clearEntityAuditHistory,
  clearAuditLogError,
  resetAuditLogState,
} = auditLogSlice.actions;

/* =====================================================
   EXPORT REDUCER
===================================================== */

export default auditLogSlice.reducer;
