import { createAsyncThunk } from "@reduxjs/toolkit";
import reportApi from "../../../api/reports/reportApi";

/* =========================================================
   ERROR HANDLER
========================================================= */

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (data instanceof Blob) {
    return fallback;
  }

  return data?.message || data?.error || error?.message || fallback;
};

/* =========================================================
   FETCH REPORT MODULES
========================================================= */

export const fetchReportModules = createAsyncThunk(
  "reports/fetchModules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportApi.getModules();

      return response?.data ?? [];
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch report modules."),
      );
    }
  },
);

/* =========================================================
   FETCH REPORT CATALOG
========================================================= */

export const fetchReportCatalog = createAsyncThunk(
  "reports/fetchCatalog",
  async (module, { rejectWithValue }) => {
    try {
      const response = await reportApi.getCatalog(module);

      return response?.data ?? null;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch report catalog."),
      );
    }
  },
);

/* =========================================================
   PREVIEW REPORT
   POST /reports/preview
========================================================= */

/* =========================================================
   PREVIEW REPORT
   POST /reports/preview
========================================================= */

export const previewReport = createAsyncThunk(
  "reports/previewReport",
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await reportApi.preview(requestData);

      // ApiResponse: { success, message, data }
      // Also supports direct preview responses.
      return response?.data ?? response ?? null;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to generate report."),
      );
    }
  },
);
/* =========================================================
   EXPORT HELPER
========================================================= */

const exportReport = async (
  request,
  exportFunction,
  fallback,
  rejectWithValue,
) => {
  try {
    return await exportFunction(request);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, fallback));
  }
};

/* =========================================================
   PDF
========================================================= */

export const exportReportPdf = createAsyncThunk(
  "reports/exportPdf",
  async (request, { rejectWithValue }) =>
    exportReport(
      request,
      reportApi.exportPdf,
      "Failed to export PDF.",
      rejectWithValue,
    ),
);

/* =========================================================
   EXCEL
========================================================= */

export const exportReportExcel = createAsyncThunk(
  "reports/exportExcel",
  async (request, { rejectWithValue }) =>
    exportReport(
      request,
      reportApi.exportExcel,
      "Failed to export Excel.",
      rejectWithValue,
    ),
);

/* =========================================================
   CSV
========================================================= */

export const exportReportCsv = createAsyncThunk(
  "reports/exportCsv",
  async (request, { rejectWithValue }) =>
    exportReport(
      request,
      reportApi.exportCsv,
      "Failed to export CSV.",
      rejectWithValue,
    ),
);

/* =========================================================
   PRINT
========================================================= */

export const exportReportPrint = createAsyncThunk(
  "reports/exportPrint",
  async (request, { rejectWithValue }) =>
    exportReport(
      request,
      reportApi.exportPrint,
      "Failed to prepare printable report.",
      rejectWithValue,
    ),
);
