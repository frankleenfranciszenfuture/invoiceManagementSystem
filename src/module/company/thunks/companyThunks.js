import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

/* =========================================================
   FETCH ALL COMPANIES
   ========================================================= */

export const fetchAllCompanies = createAsyncThunk(
  "company/fetchCompanies",

  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/companies");

      console.log("Companies:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch companies.",
      );
    }
  },
);

/* =========================================================
   FETCH COMPANY BY ID
   ========================================================= */

export const fetchCompanyById = createAsyncThunk(
  "company/fetchCompany",

  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/companies/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch company.",
      );
    }
  },
);

/* =========================================================
   BUILD COMPANY FORM DATA
========================================================= */

const buildCompanyFormData = (data) => {
  const formData = new FormData();

  /* =======================================================
     COMPANY JSON
  ======================================================= */

  const company = {
    companyName: data.companyName?.trim() || "",

    displayName: data.displayName?.trim() || "",

    legalName: data.legalName?.trim() || "",

    companyCode: data.companyCode?.trim() || "",

    gstNumber: data.gstNumber?.trim() || "",

    panNumber: data.panNumber?.trim() || "",

    tanNumber: data.tanNumber?.trim() || "",

    email: data.email?.trim() || "",

    phone: data.phone?.trim() || "",

    alternatePhone: data.alternatePhone?.trim() || "",

    website: data.website?.trim() || "",

    addressLine1: data.addressLine1?.trim() || "",

    addressLine2: data.addressLine2?.trim() || "",

    city: data.city?.trim() || "",

    state: data.state?.trim() || "",

    country: data.country?.trim() || "",

    pincode: data.pincode?.trim() || "",

    invoicePrefix: data.invoicePrefix?.trim() || "",

    invoiceStartNumber:
      data.invoiceStartNumber !== undefined &&
      data.invoiceStartNumber !== null &&
      data.invoiceStartNumber !== ""
        ? Number(data.invoiceStartNumber)
        : null,

    currency: data.currency?.trim() || "INR",

    financialYearStart: data.financialYearStart || null,

    status: data.status || "ACTIVE",
  };

  /* =======================================================
     APPEND COMPANY JSON
     Backend @RequestPart name = "data"
  ======================================================= */

  formData.append(
    "data",
    new Blob([JSON.stringify(company)], {
      type: "application/json",
    }),
  );

  /* =======================================================
     LOGO
  ======================================================= */

  if (data.logo instanceof File) {
    formData.append("logo", data.logo);
  }

  /* =======================================================
     SIGNATURE
  ======================================================= */

  if (data.signature instanceof File) {
    formData.append("signature", data.signature);
  }

  return formData;
};

/* =========================================================
   CREATE COMPANY
   ========================================================= */

export const createCompany = createAsyncThunk(
  "company/createCompany",

  async (data, { rejectWithValue }) => {
    try {
      const formData = buildCompanyFormData(data);

      /* =====================================================
         DEBUG
         ===================================================== */

      console.log("CREATE COMPANY:");

      for (const [key, value] of formData.entries()) {
        if (key === "data" && value instanceof Blob) {
          const json = await value.text();

          console.log("company JSON:", JSON.parse(json));
        } else {
          console.log(key, value);
        }
      }

      /* =====================================================
         API
         ===================================================== */

      const res = await api.post("/companies", formData);

      return res.data;
    } catch (error) {
      console.error("Create company error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create company.",
      );
    }
  },
);

/* =========================================================
   UPDATE COMPANY
   ========================================================= */

export const updateCompany = createAsyncThunk(
  "company/updateCompany",

  async ({ id, data }, { rejectWithValue }) => {
    try {
      const formData = buildCompanyFormData(data);

      /* =====================================================
         DEBUG
         ===================================================== */

      console.log("UPDATE COMPANY:");

      for (const [key, value] of formData.entries()) {
        if (key === "data" && value instanceof Blob) {
          const json = await value.text();

          console.log("company JSON:", JSON.parse(json));
        } else {
          console.log(key, value);
        }
      }

      /* =====================================================
         API
         ===================================================== */

      const res = await api.put(`/companies/${id}`, formData);

      return res.data;
    } catch (error) {
      console.error("Update company error:", error);

      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update company.",
      );
    }
  },
);

/* =========================================================
   DELETE COMPANY
   ========================================================= */

export const deleteCompany = createAsyncThunk(
  "company/deleteCompany",

  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/companies/${id}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete company.",
      );
    }
  },
);

/* =========================================================
   FETCH COMPANIES BY STATUS
   ========================================================= */

export const fetchCompaniesByStatus = createAsyncThunk(
  "company/fetchCompaniesByStatus",

  async (status, { rejectWithValue }) => {
    try {
      const res = await api.get(`/companies/status/${status}`);

      console.log("Companies by status:", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch companies by status.",
      );
    }
  },
);

/* =========================================================
   REACTIVATE COMPANY
   ========================================================= */

export const reactivateCompany = createAsyncThunk(
  "company/reactivateCompany",

  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/companies/${id}/reactivate`);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reactivate company.",
      );
    }
  },
);
