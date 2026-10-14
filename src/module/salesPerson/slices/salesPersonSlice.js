import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllSalesPersons,
  fetchSalesPersonById,
  createSalesPerson,
  updateSalesPerson,
  deleteSalesPerson,
} from "../thunks/salesPersonThunks";

/* =========================================================
   EMPTY SALESPERSON FORM
   ========================================================= */

const emptySalesPerson = {
  id: null,
  salesPersonCode: "",
  salesPersonType: "",
  salesPersonName: "",
  email: "",
  mobile: "",
  status: "ACTIVE",
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  salesPersons: [],

  // Keep form initialized instead of null
  salesPerson: {
    ...emptySalesPerson,
  },

  existingSalesPerson: null,

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

  selectedSalesPersonView: null,

  salesPersonStatus: "ACTIVE",
};

/* =========================================================
   SLICE
   ========================================================= */

const salesPersonSlice = createSlice({
  name: "salesPerson",

  initialState,

  reducers: {
    /* =====================================================
       SET EXISTING SALESPERSON
       ===================================================== */

    setExistingSalesPerson: (state, action) => {
      state.existingSalesPerson = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    /* =====================================================
       CLEAR SALESPERSON STATE
       ===================================================== */

    clearSalesPersonState: (state) => {
      state.salesPersons = [];

      state.salesPerson = {
        ...emptySalesPerson,
      };

      state.existingSalesPerson = null;

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

      state.selectedSalesPersonView = null;
      state.salesPersonStatus = "ACTIVE";
    },

    /* =====================================================
       CLEAR SELECTED SALESPERSON
       ===================================================== */

    clearSelectedSalesPerson: (state) => {
      state.salesPerson = {
        ...emptySalesPerson,
      };

      state.existingSalesPerson = null;
    },

    /* =====================================================
       RESET SALESPERSON FORM
       ===================================================== */

    resetSalesPersonForm: (state) => {
      state.salesPerson = {
        ...emptySalesPerson,
      };

      state.existingSalesPerson = null;
    },

    /* =====================================================
       SET SALESPERSON FORM FIELD
       ===================================================== */

    setSalesPersonField: (state, action) => {
      const { field, value } = action.payload;

      state.salesPerson = {
        ...(state.salesPerson || emptySalesPerson),
        [field]: value,
      };
    },

    /* =====================================================
       SET SELECTED SALESPERSON VIEW
       ===================================================== */

    setSelectedSalesPersonView: (state, action) => {
      state.selectedSalesPersonView = action.payload;
    },

    /* =====================================================
       SET SALESPERSON STATUS
       ===================================================== */

    setSalesPersonStatus: (state, action) => {
      state.salesPersonStatus = action.payload;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL SALESPERSONS
       ===================================================== */

    builder

      .addCase(fetchAllSalesPersons.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchAllSalesPersons.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;
        const data = response?.data;

        state.salesPersons = Array.isArray(data?.content) ? data.content : [];

        state.pagination = {
          pageNumber: data?.pageNumber ?? 0,
          pageSize: data?.pageSize ?? 20,
          totalElements: data?.totalElements ?? 0,
          totalPages: data?.totalPages ?? 0,
          last: data?.last ?? true,
        };

        state.message = response?.message || "";
      })

      .addCase(fetchAllSalesPersons.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch salespersons.";

        state.message = "";
      });

    /* =====================================================
       FETCH SALESPERSON BY ID
       ===================================================== */

    builder

      .addCase(fetchSalesPersonById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchSalesPersonById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.salesPerson = action.payload?.data ||
          action.payload || {
            ...emptySalesPerson,
          };

        state.message = action.payload?.message || "";
      })

      .addCase(fetchSalesPersonById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error = action.payload || "Failed to fetch salesperson.";

        state.message = "";
      });

    /* =====================================================
       CREATE SALESPERSON
       ===================================================== */

    builder

      .addCase(createSalesPerson.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createSalesPerson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Salesperson created successfully.";

        const newSalesPerson = action.payload?.data;

        if (newSalesPerson) {
          state.salesPerson = newSalesPerson;

          state.existingSalesPerson = newSalesPerson;

          state.salesPersons.push(newSalesPerson);

          state.pagination.totalElements += 1;
        }
      })

      .addCase(createSalesPerson.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while creating salesperson.";

        state.message = "";
      });

    /* =====================================================
       UPDATE SALESPERSON
       ===================================================== */

    builder

      .addCase(updateSalesPerson.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateSalesPerson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Salesperson updated successfully.";

        const updatedSalesPerson = action.payload?.data;

        if (updatedSalesPerson) {
          state.salesPerson = updatedSalesPerson;

          state.existingSalesPerson = updatedSalesPerson;

          const index = state.salesPersons.findIndex(
            (item) => item.id === updatedSalesPerson.id,
          );

          if (index !== -1) {
            state.salesPersons[index] = updatedSalesPerson;
          }
        }
      })

      .addCase(updateSalesPerson.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while updating salesperson.";

        state.message = "";
      });

    /* =====================================================
       DELETE SALESPERSON
       ===================================================== */

    builder

      .addCase(deleteSalesPerson.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteSalesPerson.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Salesperson deleted successfully.";

        /*
         * Thunk receives ID directly.
         * action.meta.arg contains deleted ID.
         */

        const deletedId = action.meta.arg;

        state.salesPersons = state.salesPersons.filter(
          (item) => item.id !== deletedId,
        );

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        if (state.salesPerson?.id === deletedId) {
          state.salesPerson = {
            ...emptySalesPerson,
          };
        }

        if (state.existingSalesPerson?.id === deletedId) {
          state.existingSalesPerson = null;
        }
      })

      .addCase(deleteSalesPerson.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        state.error =
          action.payload || "Something went wrong while deleting salesperson.";

        state.message = "";
      });

    // /* =====================================================
    //    REACTIVATE SALESPERSON
    //    ===================================================== */

    // builder

    //   .addCase(reactivateSalesPerson.pending, (state) => {
    //     state.loading = true;
    //     state.success = false;
    //     state.error = null;
    //   })

    //   .addCase(reactivateSalesPerson.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.success = true;
    //     state.error = null;

    //     state.message =
    //       action.payload?.message || "Salesperson reactivated successfully.";

    //     const reactivatedSalesPerson = action.payload?.data;

    //     if (reactivatedSalesPerson) {
    //       state.category = reactivatedCategory;

    //       state.existingSalesPerson = reactivatedCategory;

    //       const index = state.salesPersons.findIndex(
    //         (item) => item.id === reactivatedSalesPerson.id,
    //       );

    //       if (index !== -1) {
    //         state.salesPersons[index] = reactivatedSalesPerson;
    //       } else {
    //         state.salesPersons.push(reactivatedSalesPerson);

    //         state.pagination.totalElements += 1;
    //       }
    //     }
    //   })

    //   .addCase(reactivateSalesPerson.rejected, (state, action) => {
    //     state.loading = false;
    //     state.success = false;

    //     state.error =
    //       action.payload || "Something went wrong while reactivating salesperson.";

    //     state.message = "";
    //   });

    // /* =====================================================
    //    FETCH SALESPERSONS BY STATUS
    //    ===================================================== */

    // builder

    //   .addCase(fetchSalesPersonsByStatus.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //     state.success = false;
    //   })

    //   .addCase(fetchSalesPersonsByStatus.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.success = true;
    //     state.error = null;

    //     const response = action.payload;
    //     const data = response?.data;

    //     /*
    //      * PAGINATED RESPONSE
    //      */

    //     if (data && Array.isArray(data.content)) {
    //       state.salesPersons = data.content;

    //       state.pagination = {
    //         pageNumber: data?.pageNumber ?? 0,
    //         pageSize: data?.pageSize ?? 20,
    //         totalElements: data?.totalElements ?? 0,
    //         totalPages: data?.totalPages ?? 0,
    //         last: data?.last ?? true,
    //       };
    //     } else if (Array.isArray(data)) {
    //       /*
    //        * DIRECT ARRAY RESPONSE
    //        */

    //       state.salesPersons = data;

    //       state.pagination = {
    //         pageNumber: 0,
    //         pageSize: data.length || 20,
    //         totalElements: data.length,
    //         totalPages: data.length > 0 ? 1 : 0,
    //         last: true,
    //       };
    //     } else {
    //       /*
    //        * EMPTY / UNKNOWN RESPONSE
    //        */

    //       state.salesPersons = [];

    //       state.pagination = {
    //         pageNumber: 0,
    //         pageSize: 20,
    //         totalElements: 0,
    //         totalPages: 0,
    //         last: true,
    //       };
    //     }

    //     state.message = response?.message || "";
    //   })

    //   .addCase(fetchSalesPersonsByStatus.rejected, (state, action) => {
    //     state.loading = false;
    //     state.success = false;

    //     state.error = action.payload || "Failed to fetch salespersons by status.";

    //     state.message = "";
    //   });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setExistingSalesPerson,
  clearError,
  clearSalesPersonState,
  clearSelectedSalesPerson,
  resetSalesPersonForm,
  setSalesPersonField,
  setSelectedSalesPersonView,
  setSalesPersonStatus,
} = salesPersonSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default salesPersonSlice.reducer;
