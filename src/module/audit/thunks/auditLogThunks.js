
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/* =====================================================
   ERROR HANDLER
===================================================== */

const getErrorMessage = (error, fallback) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    );
};

/* =====================================================
   FETCH ALL AUDIT LOGS
   GET /audit-logs
===================================================== */

export const fetchAuditLogs = createAsyncThunk(
    "auditLogs/fetchAuditLogs",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get("/audit-logs", {
                params: {
                    entityName: params.entityName || undefined,
                    entityId: params.entityId || undefined,
                    action: params.action || undefined,
                    performedBy: params.performedBy || undefined,
                    performedByType: params.performedByType || undefined,
                    keyword: params.keyword?.trim() || undefined,
                    fromDate: params.fromDate || undefined,
                    toDate: params.toDate || undefined,
                    page: params.page ?? 0,
                    size: params.size ?? 10,
                    sortBy: params.sortBy || "createdAt",
                    sortDirection: params.sortDirection || "DESC",
                },
            });

            return response?.data?.data ?? response?.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(
                    error,
                    "Failed to fetch audit logs."
                )
            );
        }
    }
);

/* =====================================================
   FETCH AUDIT LOG BY ID
   GET /audit-logs/{id}
===================================================== */

export const fetchAuditLogById = createAsyncThunk(
    "auditLogs/fetchAuditLogById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(
                `/audit-logs/${id}`
            );

            return response?.data?.data ?? response?.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(
                    error,
                    "Failed to fetch audit log details."
                )
            );
        }
    }
);

/* =====================================================
   FETCH ENTITY AUDIT HISTORY
   GET /audit-logs/entity/{entityName}/{entityId}
===================================================== */

export const fetchEntityAuditHistory = createAsyncThunk(
    "auditLogs/fetchEntityAuditHistory",
    async (
        {
            entityName,
            entityId,
            page = 0,
            size = 10,
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.get(
                `/audit-logs/entity/${encodeURIComponent(entityName)}/${encodeURIComponent(entityId)}`,
                {
                    params: {
                        page,
                        size,
                    },
                }
            );

            return response?.data?.data ?? response?.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(
                    error,
                    "Failed to fetch entity audit history."
                )
            );
        }
    }
);
