import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllParties,
  fetchPartyById,
  createParty,
  updateParty,
  deleteParty,
} from "../thunks/partyThunks";

/* =========================================================
   EMPTY PARTY ADDRESS
========================================================= */

const emptyAddress = {
  id: null,
  addressType: "BILLING",
  addressLine1: "",
  addressLine2: "",
  city: "",
  district: "",
  state: "",
  country: "India",
  postalCode: "",
  defaultAddress: true,
};

/* =========================================================
   EMPTY PARTY BANK ACCOUNT
========================================================= */

const emptyBankAccount = {
  id: null,
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  branchName: "",
  accountType: "CURRENT",
  remarks: "",
  primaryAccount: true,
  status: "ACTIVE",
};

/* =========================================================
   EMPTY PARTY FORM
========================================================= */

const emptyParty = {
  id: null,
  partyCode: "",
  partyType: "SUPPLIER",
  companyName: "",
  contactPerson: "",
  email: "",
  mobile: "",
  alternateMobile: "",
  gstNumber: "",
  panNumber: "",
  website: "",
  creditLimit: 0,
  outstandingCredit: 0,
  availableCredit: 0,
  paymentTerms: "30 Days",
  status: "ACTIVE",
  addresses: [{ ...emptyAddress }],
  bankAccounts: [{ ...emptyBankAccount }],
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState = {
  parties: [],

  // Current form
  party: { ...emptyParty },

  // Existing/selected party
  existingParty: null,

  // Selected party for detail view
  selectedPartyView: null,

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
   RESPONSE HELPERS
========================================================= */

const getPartyData = (payload) => {
  return payload?.data ?? payload ?? null;
};

const getPartyId = (party) => {
  return party?.id != null ? String(party.id) : "";
};

/* =========================================================
   SLICE
========================================================= */

const partySlice = createSlice({
  name: "party",

  initialState,

  reducers: {
    /* =====================================================
       SET EXISTING PARTY
    ===================================================== */

    setExistingParty: (state, action) => {
      state.existingParty = action.payload;
    },

    /* =====================================================
       SET PARTY FORM
    ===================================================== */

    setParty: (state, action) => {
      state.party = {
        ...emptyParty,
        ...action.payload,

        addresses:
          action.payload?.addresses?.length > 0
            ? action.payload.addresses.map((address) => ({
                ...emptyAddress,
                ...address,
              }))
            : [{ ...emptyAddress }],

        bankAccounts:
          action.payload?.bankAccounts?.length > 0
            ? action.payload.bankAccounts.map((account) => ({
                ...emptyBankAccount,
                ...account,
              }))
            : [{ ...emptyBankAccount }],
      };
    },

    /* =====================================================
       SET PARTY FIELD
    ===================================================== */

    setPartyField: (state, action) => {
      const { field, value } = action.payload;

      state.party = {
        ...state.party,
        [field]: value,
      };
    },

    /* =====================================================
       UPDATE ADDRESS FIELD
    ===================================================== */

    setPartyAddressField: (state, action) => {
      const { index, field, value } = action.payload;

      if (!state.party.addresses[index]) return;

      if (field === "defaultAddress" && value === true) {
        state.party.addresses = state.party.addresses.map((address, i) => ({
          ...address,
          defaultAddress: i === index,
        }));

        return;
      }

      state.party.addresses[index][field] = value;
    },

    /* =====================================================
       ADD ADDRESS
    ===================================================== */

    addPartyAddress: (state) => {
      state.party.addresses.push({
        ...emptyAddress,
        defaultAddress: state.party.addresses.length === 0,
      });
    },

    /* =====================================================
       REMOVE ADDRESS
    ===================================================== */

    removePartyAddress: (state, action) => {
      const index = action.payload;

      if (state.party.addresses.length <= 1) return;

      const removedDefault = state.party.addresses[index]?.defaultAddress;

      state.party.addresses.splice(index, 1);

      if (removedDefault && state.party.addresses.length > 0) {
        state.party.addresses[0].defaultAddress = true;
      }
    },

    /* =====================================================
       UPDATE BANK ACCOUNT FIELD
    ===================================================== */

    setPartyBankAccountField: (state, action) => {
      const { index, field, value } = action.payload;

      if (!state.party.bankAccounts[index]) return;

      if (field === "primaryAccount" && value === true) {
        state.party.bankAccounts = state.party.bankAccounts.map(
          (account, i) => ({
            ...account,
            primaryAccount: i === index,
          }),
        );

        return;
      }

      state.party.bankAccounts[index][field] = value;
    },

    /* =====================================================
       ADD BANK ACCOUNT
    ===================================================== */

    addPartyBankAccount: (state) => {
      state.party.bankAccounts.push({
        ...emptyBankAccount,
        primaryAccount: state.party.bankAccounts.length === 0,
      });
    },

    /* =====================================================
       REMOVE BANK ACCOUNT
    ===================================================== */

    removePartyBankAccount: (state, action) => {
      const index = action.payload;

      if (state.party.bankAccounts.length <= 1) return;

      const removedPrimary = state.party.bankAccounts[index]?.primaryAccount;

      state.party.bankAccounts.splice(index, 1);

      if (removedPrimary && state.party.bankAccounts.length > 0) {
        state.party.bankAccounts[0].primaryAccount = true;
      }
    },

    /* =====================================================
       SELECT PARTY VIEW
    ===================================================== */

    setSelectedPartyView: (state, action) => {
      state.selectedPartyView = action.payload;
    },

    /* =====================================================
       CLEAR ERROR
    ===================================================== */

    clearError: (state) => {
      state.error = null;
    },

    /* =====================================================
       RESET PARTY FORM
    ===================================================== */

    resetPartyForm: (state) => {
      state.party = {
        ...emptyParty,
        addresses: [{ ...emptyAddress }],
        bankAccounts: [{ ...emptyBankAccount }],
      };

      state.existingParty = null;
    },

    /* =====================================================
       CLEAR SELECTED PARTY
    ===================================================== */

    clearSelectedParty: (state) => {
      state.party = {
        ...emptyParty,
        addresses: [{ ...emptyAddress }],
        bankAccounts: [{ ...emptyBankAccount }],
      };

      state.existingParty = null;
      state.selectedPartyView = null;
    },

    /* =====================================================
       CLEAR ENTIRE PARTY STATE
    ===================================================== */

    clearPartyState: () => ({
      ...initialState,
      party: {
        ...emptyParty,
        addresses: [{ ...emptyAddress }],
        bankAccounts: [{ ...emptyBankAccount }],
      },
    }),
  },

  /* =======================================================
     EXTRA REDUCERS
  ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL PARTIES
    ===================================================== */

    builder
      .addCase(fetchAllParties.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchAllParties.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;
        const data = response?.data;

        if (Array.isArray(data?.content)) {
          state.parties = data.content;

          state.pagination = {
            pageNumber: data.pageNumber ?? 0,
            pageSize: data.pageSize ?? 20,
            totalElements: data.totalElements ?? 0,
            totalPages: data.totalPages ?? 0,
            last: data.last ?? true,
          };
        } else if (Array.isArray(data)) {
          state.parties = data;

          state.pagination = {
            pageNumber: 0,
            pageSize: data.length || 20,
            totalElements: data.length,
            totalPages: data.length > 0 ? 1 : 0,
            last: true,
          };
        } else {
          state.parties = [];

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

      .addCase(fetchAllParties.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch parties.";
        state.message = "";
      });

    /* =====================================================
       FETCH PARTY BY ID
    ===================================================== */

    builder
      .addCase(fetchPartyById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchPartyById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const party = getPartyData(action.payload);

        if (party && typeof party === "object") {
          state.party = {
            ...emptyParty,
            ...party,

            addresses:
              party.addresses?.length > 0
                ? party.addresses.map((address) => ({
                    ...emptyAddress,
                    ...address,
                  }))
                : [{ ...emptyAddress }],

            bankAccounts:
              party.bankAccounts?.length > 0
                ? party.bankAccounts.map((account) => ({
                    ...emptyBankAccount,
                    ...account,
                  }))
                : [{ ...emptyBankAccount }],
          };

          state.existingParty = party;
        }

        state.message = action.payload?.message || "";
      })

      .addCase(fetchPartyById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch party.";
        state.message = "";
      });

    /* =====================================================
       CREATE PARTY
    ===================================================== */

    builder
      .addCase(createParty.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createParty.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;
        const newParty = getPartyData(response);

        state.message = response?.message || "Party created successfully.";

        if (newParty && typeof newParty === "object" && newParty.id != null) {
          state.party = {
            ...emptyParty,
            ...newParty,
          };

          state.existingParty = newParty;

          const alreadyExists = state.parties.some(
            (item) => getPartyId(item) === getPartyId(newParty),
          );

          if (!alreadyExists) {
            state.parties.unshift(newParty);
            state.pagination.totalElements += 1;
          }
        }
      })

      .addCase(createParty.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to create party.";
        state.message = "";
      });

    /* =====================================================
       UPDATE PARTY
    ===================================================== */

    builder
      .addCase(updateParty.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(updateParty.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;
        const updatedParty = getPartyData(response);

        state.message = response?.message || "Party updated successfully.";

        if (
          updatedParty &&
          typeof updatedParty === "object" &&
          updatedParty.id != null
        ) {
          state.party = {
            ...emptyParty,
            ...updatedParty,
          };

          state.existingParty = updatedParty;

          const index = state.parties.findIndex(
            (item) => getPartyId(item) === getPartyId(updatedParty),
          );

          if (index !== -1) {
            state.parties[index] = updatedParty;
          }
        }
      })

      .addCase(updateParty.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to update party.";
        state.message = "";
      });

    /* =====================================================
       DELETE PARTY
    ===================================================== */

    builder
      .addCase(deleteParty.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteParty.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        state.message =
          action.payload?.message || "Party deleted successfully.";

        // Assumes deleteParty receives the party ID directly.
        const deletedId = action.meta.arg;

        state.parties = state.parties.filter(
          (item) => getPartyId(item) !== String(deletedId),
        );

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        if (getPartyId(state.party) === String(deletedId)) {
          state.party = {
            ...emptyParty,
            addresses: [{ ...emptyAddress }],
            bankAccounts: [{ ...emptyBankAccount }],
          };
        }

        if (getPartyId(state.existingParty) === String(deletedId)) {
          state.existingParty = null;
        }

        if (getPartyId(state.selectedPartyView) === String(deletedId)) {
          state.selectedPartyView = null;
        }
      })

      .addCase(deleteParty.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Failed to delete party.";
        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  setExistingParty,
  setParty,
  setPartyField,
  setPartyAddressField,
  addPartyAddress,
  removePartyAddress,
  setPartyBankAccountField,
  addPartyBankAccount,
  removePartyBankAccount,
  setSelectedPartyView,
  clearError,
  resetPartyForm,
  clearSelectedParty,
  clearPartyState,
} = partySlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default partySlice.reducer;
