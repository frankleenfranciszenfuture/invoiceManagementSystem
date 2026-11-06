import api from "../api";

const REPORT_URL = "/reports";

const reportApi = {
  // GET /reports/modules
  getModules: async () => {
    const response = await api.get(`${REPORT_URL}/modules`);
    return response.data;
  },

  // GET /reports/catalog/{module}
  getCatalog: async (module) => {
    const response = await api.get(`${REPORT_URL}/catalog/${module}`);
    return response.data;
  },

  // POST /reports/{module}/preview
  preview: async (request) => {
    const module = String(request.module).toLowerCase();

    const response = await api.post(`${REPORT_URL}/${module}/preview`, request);

    return response.data;
  },

  // POST /reports/export/pdf
  exportPdf: async (request) => {
    const response = await api.post(`${REPORT_URL}/export/pdf`, request, {
      responseType: "blob",
    });

    return response.data;
  },

  // POST /reports/export/excel
  exportExcel: async (request) => {
    const response = await api.post(`${REPORT_URL}/export/excel`, request, {
      responseType: "blob",
    });

    return response.data;
  },

  // POST /reports/export/csv
  exportCsv: async (request) => {
    const response = await api.post(`${REPORT_URL}/export/csv`, request, {
      responseType: "blob",
    });

    return response.data;
  },

  // POST /reports/export/print
  exportPrint: async (request) => {
    const response = await api.post(`${REPORT_URL}/export/print`, request, {
      responseType: "text",
    });

    return response.data;
  },
};

export default reportApi;
