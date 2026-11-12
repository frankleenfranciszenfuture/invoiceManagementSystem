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
        getErrorMessage(error, "Failed to fetch audit logs."),
      );
    }
  },
);

/* =====================================================
   FETCH AUDIT LOG BY ID
   GET /audit-logs/{id}
===================================================== */

export const fetchAuditLogById = createAsyncThunk(
  "auditLogs/fetchAuditLogById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/audit-logs/${id}`);

      return response?.data?.data ?? response?.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch audit log details."),
      );
    }
  },
);

/* =====================================================
   FETCH ENTITY AUDIT HISTORY
   GET /audit-logs/entity/{entityName}/{entityId}
===================================================== */

export const fetchEntityAuditHistory = createAsyncThunk(
  "auditLogs/fetchEntityAuditHistory",
  async (
    { entityName, entityId, page = 0, size = 10 },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get(
        `/audit-logs/entity/${encodeURIComponent(entityName)}/${encodeURIComponent(entityId)}`,
        {
          params: {
            page,
            size,
          },
        },
      );

      return response?.data?.data ?? response?.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch entity audit history."),
      );
    }
  },
);

/* =====================================================
   EXPORT AUDIT LOGS
   GET /audit-logs/export/{pdf|excel|csv}

   Exports ALL records matching the applied filters.
   ===================================================== */

const normalizeExportDate = (value, isEndDate = false) => {
  if (!value) return undefined;

  // The backend expects LocalDateTime, not a date-only value.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return isEndDate ? `${value}T23:59:59` : `${value}T00:00:00`;
  }

  return value;
};

const getExportErrorMessage = async (error) => {
  const responseData = error?.response?.data;

  if (responseData instanceof Blob) {
    try {
      const text = await responseData.text();
      const parsed = JSON.parse(text);

      return parsed?.message || parsed?.error || "Failed to export audit logs.";
    } catch {
      return "Failed to export audit logs.";
    }
  }

  return getErrorMessage(error, "Failed to export audit logs.");
};

export const exportAuditLogs = createAsyncThunk(
  "auditLogs/exportAuditLogs",
  async ({ format, filters = {} }, { rejectWithValue }) => {
    try {
      const normalizedFormat = format?.toLowerCase();

      const supportedFormats = ["pdf", "excel", "csv"];

      if (!supportedFormats.includes(normalizedFormat)) {
        return rejectWithValue("Unsupported export format.");
      }

      const params = {
        entityName:
          filters.entityName && filters.entityName !== "ALL"
            ? filters.entityName
            : undefined,

        entityId: filters.entityId || undefined,
        action: filters.action || undefined,
        performedBy: filters.performedBy || undefined,
        performedByType: filters.performedByType || undefined,
        keyword: filters.keyword?.trim() || undefined,

        fromDate: normalizeExportDate(filters.fromDate),
        toDate: normalizeExportDate(filters.toDate, true),

        sortBy: filters.sortBy || "createdAt",
        sortDirection: filters.sortDirection || "DESC",
      };

      const response = await api.get(`/audit-logs/export/${normalizedFormat}`, {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: response.headers?.["content-type"] || "application/octet-stream",
      });

      // Prefer the filename supplied by the backend.
      const disposition = response.headers?.["content-disposition"] || "";

      const filenameMatch = disposition.match(
        /filename\*?=(?:UTF-8''|")?([^";]+)/i,
      );

      const extension =
        normalizedFormat === "excel" ? "xlsx" : normalizedFormat;

      const filename = filenameMatch?.[1]
        ? decodeURIComponent(filenameMatch[1].replace(/"$/, ""))
        : `AUDIT_${params.entityName || "ALL"}_${new Date()
            .toISOString()
            .slice(0, 10)}.${extension}`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);

      return {
        format: normalizedFormat,
        filename,
      };
    } catch (error) {
      return rejectWithValue(await getExportErrorMessage(error));
    }
  },
);
