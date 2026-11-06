import { createSlice } from "@reduxjs/toolkit";

import {
  fetchReportModules,
  fetchReportCatalog,
  previewReport,
  exportReportPdf,
  exportReportExcel,
  exportReportCsv,
  exportReportPrint,
} from "../thunks/reportThunks";

import {
  getReportFilterDefinitions,
  getReportDefaultSort,
} from "../config/reportModuleConfig";

/* =========================================================
   DEFAULT FILTERS
========================================================= */

const getDefaultFilters = (module, reportCode) => {
  const customFilters = {};

  const filterDefinitions = getReportFilterDefinitions(module, reportCode);

  filterDefinitions.forEach((filter) => {
    if (filter?.key) {
      customFilters[filter.key] = "";
    }
  });

  return {
    keyword: "",
    fromDate: null,
    toDate: null,
    status: "ALL",
    filters: customFilters,
  };
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  modules: [],

  selectedModule: null,

  catalog: null,

  selectedReportCode: null,

  preview: null,

  request: {
    module: null,
    reportCode: null,

    filters: getDefaultFilters(null, null),

    page: 0,
    size: 20,
    sortBy: "displayName",
    sortDirection: "ASC",
    columns: [],
  },

  // Loading states
  loading: false,
  modulesLoading: false,
  catalogLoading: false,
  previewLoading: false,

  // Export loading states
  exportLoading: {
    pdf: false,
    excel: false,
    csv: false,
    print: false,
  },

  // Print
  printHtml: null,

  // Error
  error: null,
};

/* =========================================================
   REPORT SLICE
========================================================= */

const reportSlice = createSlice({
  name: "reports",

  initialState,

  reducers: {
    /* =============================================
           SELECT MODULE
        ============================================= */

    setSelectedModule: (state, action) => {
      const module = action.payload;

      state.selectedModule = module;

      state.selectedReportCode = null;
      state.catalog = null;
      state.preview = null;

      state.request.module = module;
      state.request.reportCode = null;

      state.request.filters = getDefaultFilters(module, null);

      state.request.page = 0;
      state.request.size = 20;
      state.request.sortBy = "displayName";
      state.request.sortDirection = "ASC";
      state.request.columns = [];

      state.printHtml = null;
      state.error = null;
    },

    /* =============================================
           SELECT REPORT
        ============================================= */

    setSelectedReportCode: (state, action) => {
      const reportCode = action.payload;
      const module = state.selectedModule;

      state.selectedReportCode = reportCode;

      state.request.module = module;
      state.request.reportCode = reportCode;

      state.request.filters = getDefaultFilters(module, reportCode);

      state.request.page = 0;
      state.request.size = 20;

      state.request.sortBy = getReportDefaultSort(module, reportCode);

      state.request.sortDirection = "ASC";
      state.request.columns = [];

      state.preview = null;
      state.printHtml = null;
      state.error = null;
    },

    /* =============================================
           UPDATE SINGLE FILTER

           Common filters:
           keyword, fromDate, toDate, status

           Custom filters:
           request.filters.filters[key]
        ============================================= */

    setReportFilter: (state, action) => {
      const { name, value } = action.payload || {};

      if (!name) {
        return;
      }

      const commonFilters = ["keyword", "fromDate", "toDate", "status"];

      if (commonFilters.includes(name)) {
        state.request.filters[name] = value;
      } else {
        if (!state.request.filters.filters) {
          state.request.filters.filters = {};
        }

        state.request.filters.filters[name] = value;
      }

      state.request.page = 0;
    },

    /* =============================================
           UPDATE MULTIPLE FILTERS
        ============================================= */

    setReportFilters: (state, action) => {
      const payload = action.payload || {};

      state.request.filters = {
        ...state.request.filters,
        ...payload,

        filters: {
          ...(state.request.filters.filters || {}),
          ...(payload.filters || {}),
        },
      };

      state.request.page = 0;
    },

    /* =============================================
           RESET FILTERS
        ============================================= */

    resetReportFilters: (state) => {
      state.request.filters = getDefaultFilters(
        state.selectedModule,
        state.selectedReportCode,
      );

      state.request.page = 0;
    },

    /* =============================================
           PAGINATION
        ============================================= */

    setReportPage: (state, action) => {
      state.request.page = action.payload;
    },

    setReportPageSize: (state, action) => {
      state.request.size = action.payload;
      state.request.page = 0;
    },

    /* =============================================
           SORTING
        ============================================= */

    setReportSorting: (state, action) => {
      const { sortBy, sortDirection } = action.payload || {};

      if (!sortBy) {
        return;
      }

      state.request.sortBy = sortBy;
      state.request.sortDirection = sortDirection || "ASC";

      state.request.page = 0;
    },

    /* =============================================
           SELECT COLUMNS
        ============================================= */

    setReportColumns: (state, action) => {
      state.request.columns = action.payload || [];
    },

    /* =============================================
           CLEAR PREVIEW
        ============================================= */

    clearReportPreview: (state) => {
      state.preview = null;
    },

    /* =============================================
           CLEAR PRINT HTML
        ============================================= */

    clearReportPrint: (state) => {
      state.printHtml = null;
    },

    /* =============================================
           CLEAR ERROR
        ============================================= */

    clearReportError: (state) => {
      state.error = null;
    },

    /* =============================================
           RESET REPORT STATE
        ============================================= */

    resetReportState: () => initialState,
  },

  /* =====================================================
       EXTRA REDUCERS
    ===================================================== */

  extraReducers: (builder) => {
    builder

      /* =============================================
               FETCH MODULES
            ============================================= */

      .addCase(fetchReportModules.pending, (state) => {
        state.modulesLoading = true;
        state.error = null;
      })

      .addCase(fetchReportModules.fulfilled, (state, action) => {
        state.modulesLoading = false;
        state.modules = action.payload || [];
      })

      .addCase(fetchReportModules.rejected, (state, action) => {
        state.modulesLoading = false;

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch report modules.";
      })

      /* =============================================
               FETCH CATALOG
            ============================================= */

      .addCase(fetchReportCatalog.pending, (state) => {
        state.catalogLoading = true;
        state.error = null;
      })

      .addCase(fetchReportCatalog.fulfilled, (state, action) => {
        state.catalogLoading = false;
        state.catalog = action.payload;
      })

      .addCase(fetchReportCatalog.rejected, (state, action) => {
        state.catalogLoading = false;

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to fetch report catalog.";
      })

      /* =============================================
               PREVIEW REPORT
            ============================================= */

      .addCase(previewReport.pending, (state) => {
        state.previewLoading = true;
        state.error = null;
      })

      .addCase(previewReport.fulfilled, (state, action) => {
        state.previewLoading = false;
        state.preview = action.payload;
      })

      .addCase(previewReport.rejected, (state, action) => {
        state.previewLoading = false;

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to generate report preview.";
      })

      /* =============================================
               EXPORT PDF
            ============================================= */

      .addCase(exportReportPdf.pending, (state) => {
        state.exportLoading.pdf = true;
        state.error = null;
      })

      .addCase(exportReportPdf.fulfilled, (state) => {
        state.exportLoading.pdf = false;
      })

      .addCase(exportReportPdf.rejected, (state, action) => {
        state.exportLoading.pdf = false;

        state.error =
          action.payload || action.error?.message || "Failed to export PDF.";
      })

      /* =============================================
               EXPORT EXCEL
            ============================================= */

      .addCase(exportReportExcel.pending, (state) => {
        state.exportLoading.excel = true;
        state.error = null;
      })

      .addCase(exportReportExcel.fulfilled, (state) => {
        state.exportLoading.excel = false;
      })

      .addCase(exportReportExcel.rejected, (state, action) => {
        state.exportLoading.excel = false;

        state.error =
          action.payload || action.error?.message || "Failed to export Excel.";
      })

      /* =============================================
               EXPORT CSV
            ============================================= */

      .addCase(exportReportCsv.pending, (state) => {
        state.exportLoading.csv = true;
        state.error = null;
      })

      .addCase(exportReportCsv.fulfilled, (state) => {
        state.exportLoading.csv = false;
      })

      .addCase(exportReportCsv.rejected, (state, action) => {
        state.exportLoading.csv = false;

        state.error =
          action.payload || action.error?.message || "Failed to export CSV.";
      })

      /* =============================================
               PRINT REPORT
            ============================================= */

      .addCase(exportReportPrint.pending, (state) => {
        state.exportLoading.print = true;
        state.error = null;
      })

      .addCase(exportReportPrint.fulfilled, (state, action) => {
        state.exportLoading.print = false;
        state.printHtml = action.payload;
      })

      .addCase(exportReportPrint.rejected, (state, action) => {
        state.exportLoading.print = false;

        state.error =
          action.payload ||
          action.error?.message ||
          "Failed to prepare printable report.";
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  setSelectedModule,
  setSelectedReportCode,
  setReportFilter,
  setReportFilters,
  resetReportFilters,
  setReportPage,
  setReportPageSize,
  setReportSorting,
  setReportColumns,
  clearReportPreview,
  clearReportPrint,
  clearReportError,
  resetReportState,
} = reportSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectReportModules = (state) => state.reports?.modules ?? [];

export const selectSelectedReportModule = (state) =>
  state.reports?.selectedModule ?? null;

export const selectSelectedReportCode = (state) =>
  state.reports?.selectedReportCode ?? null;

export const selectReportCatalog = (state) => state.reports?.catalog ?? null;

export const selectReportPreview = (state) => state.reports?.preview ?? null;

export const selectReportRequest = (state) =>
  state.reports?.request ?? initialState.request;

export const selectReportLoading = (state) => state.reports?.loading ?? false;

export const selectReportModulesLoading = (state) =>
  state.reports?.modulesLoading ?? false;

export const selectReportCatalogLoading = (state) =>
  state.reports?.catalogLoading ?? false;

export const selectReportPreviewLoading = (state) =>
  state.reports?.previewLoading ?? false;

export const selectReportExportLoading = (state) =>
  state.reports?.exportLoading ?? initialState.exportLoading;

export const selectReportError = (state) => state.reports?.error ?? null;

/* =========================================================
   REDUCER
========================================================= */

export default reportSlice.reducer;
