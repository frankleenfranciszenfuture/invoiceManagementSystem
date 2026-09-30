import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllCompanies,
  fetchCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  reactivateCompany,
  fetchCompaniesByStatus,
} from "../thunks/companyThunks";

/* =========================================================
   EMPTY COMPANY FORM
   ========================================================= */

const emptyCompany = {
  id: null,

  companyName: "",

  displayName: "",

  legalName: "",

  companyCode: "",

  gstNumber: "",

  panNumber: "",

  tanNumber: "",

  email: "",

  phone: "",

  alternatePhone: "",

  website: "",

  addressLine1: "",

  addressLine2: "",

  city: "",

  state: "",

  country: "",

  pincode: "",

  invoicePrefix: "",

  invoiceStartNumber: "",

  currency: "INR",

  financialYearStart: "",

  status: "ACTIVE",

  image: null,
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  companies: [],

  company: {
    ...emptyCompany,
  },

  exsistingCompany: null,

  pagination: {
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },

  loading: false,

  success: false,

  error: null,

  message: "",
};

/* =========================================================
   SLICE
   ========================================================= */

const companySlice = createSlice({
  name: "company",

  initialState,

  reducers: {
    /* =====================================================
       SET EXISTING COMPANY
    ===================================================== */

    setExsistingCompany: (state, action) => {
      state.exsistingCompany = action.payload;
    },

    /* =====================================================
       CLEAR COMPANY STATE
    ===================================================== */

    clearCompanyState: (state) => {
      state.companies = [];

      state.company = {
        ...emptyCompany,
      };

      state.exsistingCompany = null;

      state.pagination = {
        pageNumber: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };

      state.loading = false;

      state.success = false;

      state.error = null;

      state.message = "";
    },

    /* =====================================================
       CLEAR SELECTED COMPANY
    ===================================================== */

    clearSelectedCompany: (state) => {
      state.company = {
        ...emptyCompany,
      };

      state.exsistingCompany = null;
    },

    /* =====================================================
       RESET COMPANY FORM
    ===================================================== */

    resetCompanyForm: (state) => {
      state.company = {
        ...emptyCompany,
      };

      state.exsistingCompany = null;
    },

    /* =====================================================
       SET COMPANY FIELD
    ===================================================== */

    setCompanyField: (state, action) => {
      const { field, value } = action.payload;

      state.company = {
        ...(state.company || emptyCompany),
        [field]: value,
      };
    },
  },

  /* =======================================================
     EXTRA REDUCERS
  ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL COMPANIES
    ===================================================== */

    builder

      .addCase(fetchAllCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })

      .addCase(fetchAllCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        const data = response?.data;

        state.companies = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
            ? data
            : [];

        state.pagination = {
          pageNumber: data?.pageNumber ?? 0,

          pageSize: data?.pageSize ?? 20,

          totalElements: data?.totalElements ?? state.companies.length,

          totalPages: data?.totalPages ?? (state.companies.length > 0 ? 1 : 0),

          last: data?.last ?? true,
        };

        state.message = response?.message || "";
      })

      .addCase(fetchAllCompanies.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch companies.";

        state.message = "";
      });

    /* =====================================================
       FETCH COMPANY BY ID
    ===================================================== */

    builder

      .addCase(fetchCompanyById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })

      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const company = action.payload?.data || action.payload;

        state.company = company || {
          ...emptyCompany,
        };

        state.message = action.payload?.message || "";
      })

      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch company.";

        state.message = "";
      });

    /* =====================================================
       CREATE COMPANY
    ===================================================== */

    builder

      .addCase(createCompany.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Company created successfully.";

        const newCompany = action.payload?.data;

        if (newCompany) {
          state.company = newCompany;

          state.exsistingCompany = newCompany;

          state.companies.push(newCompany);

          state.pagination.totalElements += 1;
        }
      })

      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while creating company.";

        state.message = "";
      });

    /* =====================================================
       UPDATE COMPANY
    ===================================================== */

    builder

      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(updateCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Company updated successfully.";

        const updatedCompany = action.payload?.data;

        if (updatedCompany) {
          state.company = updatedCompany;

          state.exsistingCompany = updatedCompany;

          const index = state.companies.findIndex(
            (item) => item.id === updatedCompany.id,
          );

          if (index !== -1) {
            state.companies[index] = updatedCompany;
          }
        }
      })

      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating company.";

        state.message = "";
      });

    /* =====================================================
       DELETE COMPANY
    ===================================================== */

    builder

      .addCase(deleteCompany.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Company deleted successfully.";

        const deletedId = action.meta.arg;

        state.companies = state.companies.filter(
          (item) => item.id !== deletedId,
        );

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        if (state.company?.id === deletedId) {
          state.company = {
            ...emptyCompany,
          };
        }

        if (state.exsistingCompany?.id === deletedId) {
          state.exsistingCompany = null;
        }
      })

      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while deleting company.";

        state.message = "";
      });

    /* =====================================================
       REACTIVATE COMPANY
    ===================================================== */

    builder

      .addCase(reactivateCompany.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(reactivateCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Company reactivated successfully.";

        const reactivatedCompany = action.payload?.data;

        if (reactivatedCompany) {
          state.company = reactivatedCompany;

          state.exsistingCompany = reactivatedCompany;

          const index = state.companies.findIndex(
            (item) => item.id === reactivatedCompany.id,
          );

          if (index !== -1) {
            state.companies[index] = reactivatedCompany;
          } else {
            state.companies.push(reactivatedCompany);

            state.pagination.totalElements += 1;
          }
        }
      })

      .addCase(reactivateCompany.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while reactivating company.";

        state.message = "";
      });

    /* =====================================================
       FETCH COMPANIES BY STATUS
    ===================================================== */

    builder

      .addCase(fetchCompaniesByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = "";
      })

      .addCase(fetchCompaniesByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;

        const data = response?.data;

        if (data && Array.isArray(data.content)) {
          state.companies = data.content;

          state.pagination = {
            pageNumber: data.pageNumber ?? 0,

            pageSize: data.pageSize ?? 20,

            totalElements: data.totalElements ?? 0,

            totalPages: data.totalPages ?? 0,

            last: data.last ?? true,
          };
        } else if (Array.isArray(data)) {
          state.companies = data;

          state.pagination = {
            pageNumber: 0,

            pageSize: data.length || 20,

            totalElements: data.length,

            totalPages: data.length > 0 ? 1 : 0,

            last: true,
          };
        } else {
          state.companies = [];

          state.pagination = {
            pageNumber: 0,

            pageSize: 20,

            totalElements: 0,

            totalPages: 0,

            last: true,
          };
        }

        state.message = response?.message || "";
      })

      .addCase(fetchCompaniesByStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch companies by status.";

        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setExsistingCompany,

  clearCompanyState,

  clearSelectedCompany,

  resetCompanyForm,

  setCompanyField,
} = companySlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default companySlice.reducer;
