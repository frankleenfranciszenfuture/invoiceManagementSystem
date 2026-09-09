import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loadCustomers,
  addCustomer,
  getCustomerById,
  saveCustomerAddress,
  saveCustomer,
  editCustomer,
  removeCustomer,
} from "../thunks/customerThunks";

// ============================
// Initial State
// ============================

const emptyAddress = {
  attention: "",
  country: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  phoneCode: "+91",
  phone: "",
  fax: "",
};

const emptyContactPerson = {
  salutation: "",
  firstName: "",
  lastName: "",
  email: "",
  workPhone: "",
  mobile: "",
  skype: "",
  designation: "",
  department: "",
  portalAccess: false,
  profileImage: null,
};

const emptyCustomer = {
  customerType: "Business",
  salutation: "",
  firstName: "",
  lastName: "",
  companyName: "",
  displayName: "",
  currency: "",
  email: "",
  workPhoneCode: "+91",
  workPhone: "",
  mobileCode: "+91",
  mobile: "",
  customerLanguage: "",
  pan: "",
  paymentTerms: "Due on Receipt",
  enablePortal: false,
  websiteUrl: "",
  department: "",
  designation: "",
  twitter: "",
  skype: "",
  facebook: "",

  billingAddress: { ...emptyAddress },
  shippingAddress: { ...emptyAddress },

  contactPersons: [],
  status: "",
};

const initialState = {
  // Create Form
  customerForm: structuredClone(emptyCustomer),

  contactForm: structuredClone(emptyContactPerson),

  selectedCustomer: structuredClone(emptyCustomer),

  // Edit/View

  // UI

  activeTab: "OtherDetails",
  editingField: null,
  errors: {},

  // Table
  customers: [],
  page: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,

  searchQuery: "",
  sortBy: "displayName",
  direction: "asc",
  status: "ALL",

  // Dropdowns
  customerTypes: ["Business", "Individual"],
  customerTypeSearch: "",
  openCustomerType: false,

  customerLanguageSearch: "",
  openCustomerLanguage: false,

  paymentTermsSearch: "",
  openPaymentTerms: false,

  // Totals
  totalYouPay: 0,
  totalYouCollect: 0,

  // Activity
  activities: [],
  recentActivities: [],

  hasCustomers: false,

  isDirty: false,

  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: "customers",
  initialState,
  // initialState: { list: [], loading: false, error: null },
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
    },

    setField: (state, action) => {
      const { field, value } = action.payload;
      state.customerForm[field] = value;
      state.isDirty = true;
    },

    resetDirty(state) {
      state.isDirty = false;
    },

    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },

    setAddressField: (state, action) => {
      const { addressType, field, value } = action.payload;

      if (!state.customerForm[addressType]) {
        state.customerForm[addressType] = { ...emptyAddress };
      }

      state.customerForm[addressType][field] = value;

      state.isDirty = true;
    },

    setSelectedCustomerAddressField(state, action) {
      const { addressType, field, value } = action.payload;

      if (!state.selectedCustomer) return;

      if (!state.selectedCustomer[addressType]) {
        state.selectedCustomer[addressType] = {};
      }

      state.selectedCustomer[addressType][field] = value;

      state.isDirty = true;
    },

    copySelectedBillingToShipping(state) {
      if (!state.selectedCustomer?.billingAddress) return;

      const { id, ...billing } = state.selectedCustomer.billingAddress;

      state.selectedCustomer.shippingAddress = {
        ...billing,
      };

      state.isDirty = true;
    },

    copyBillingToShipping(state) {
      const { id, ...billing } = state.customerForm.billingAddress || {};

      state.customerForm.shippingAddress = {
        ...billing,
      };

      state.isDirty = true;
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },

    setEditingField: (state, action) => {
      state.editingField = action.payload;
    },

    saveCustomerType: (state) => {
      state.customer.customerType = state.editCustomerType;
      state.isEditingCustomerType = false;
    },

    cancelCustomerType: (state) => {
      state.editCustomerType = state.customer.customerType;
      state.isEditingCustomerType = false;
    },

    clearFieldError: (state, action) => {
      delete state.errors[action.payload];
    },

    setErrors: (state, action) => {
      state.errors = action.payload;
    },

    toggleEnablePortal: (state) => {
      state.enablePortal = !state.enablePortal;
    },

    setCurrentPage: (state, action) => {
      state.page = action.payload;
    },

    setCurrency: (state, action) => {
      state.customerForm.currency = action.payload;
    },

    setCustomerLanguageSearch: (state, action) => {
      state.customerLanguageSearch = action.payload;
    },

    setOpenCustomerLanguage: (state, action) => {
      state.openCustomerLanguage = action.payload;
    },

    // customerTypeSeacrh
    setCustomerTypeSearch: (state, action) => {
      state.customerTypeSearch = action.payload;
    },

    setOpenCustomerType: (state, action) => {
      state.openCustomerType = action.payload;
    },

    updateCustomerField: (state, action) => {
      const { field, value } = action.payload;
      state.customerForm[field] = value;
      state.isDirty = true;
    },

    updateSelectedCustomerField: (state, action) => {
      const { field, value } = action.payload;

      if (state.selectedCustomer) {
        state.selectedCustomer[field] = value;
      }

      state.isDirty = true;
    },

    setContactField: (state, action) => {
      const { field, value } = action.payload;
      state.contactForm[field] = value;
    },

    removeCustomerLocal: (state, action) => {
      state.customers = state.customers.filter(
        (customer) => customer.id !== action.payload,
      );
    },

    clearSelectedCustomer(state) {
      state.selectedCustomer = null;
    },

    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;

      state.customerForm = {
        ...action.payload,
        billingAddress: {
          ...emptyAddress,
          ...action.payload.billingAddress,
        },
        shippingAddress: {
          ...emptyAddress,
          ...action.payload.shippingAddress,
        },
      };
    },

    resetForm: () => ({
      ...initialState,
    }),

    resetContactForm: (state) => {
      state.contactForm = { ...emptyContactPerson };
    },

    resetCustomerForm(state) {
      state.customerForm = structuredClone(emptyCustomer);
      state.errors = {};
      state.activeTab = "Other Details";
      state.isDirty = false;
    },

    resetSelectedCustomer(state) {
      state.customerForm = structuredClone(emptyCustomer);
      state.errors = {};
      state.isDirty = false;
    },

    addContactPerson: (state) => {
      state.contactPersons.push({
        id: Date.now(),
        ...state.contactForm,
      });

      state.contactForm = { ...emptyContactPerson };
    },

    addRecentActivity: (state, action) => {
      console.log("addRecentActivity reducer", action.payload);

      state.recentActivities.unshift({
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...action.payload,
      });
    },

    clearActivities: (state) => {
      state.recentActivities = [];
    },

    setRecentActivities: (state, action) => {
      state.recentActivities = action.payload;
    },

    setActivities: (state, action) => {
      state.activities = action.payload;
    },

    addActivity: (state, action) => {
      state.activities.unshift(action.payload);
    },

    setPaymentTermsSearch: (state, action) => {
      state.paymentTermsSearch = action.payload;
    },

    setOpenPaymentTerms: (state, action) => {
      state.openPaymentTerms = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(loadCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loadCustomers.fulfilled, (state, action) => {
        console.log("Redux Customer Payload:", action.payload);

        state.loading = false;
        state.error = null;

        const data = action.payload;

        state.customers = data?.content || [];

        state.page = data?.pageNumber ?? 0;
        state.pageSize = data?.pageSize ?? 10;
        state.totalElements = data?.totalElements ?? 0;
        state.totalPages = data?.totalPages ?? 0;
      })

      .addCase(loadCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load customers";
      })

      // getCustomerById
      .addCase(getCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload; // now payload IS the customer directly
      })

      .addCase(getCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addCustomer.fulfilled, (state, action) => {
        state.customers.unshift(action.payload);
        state.selectedCustomer = action.payload;
      })

      .addCase(saveCustomer.fulfilled, (state, action) => {
        const customer = action.payload;

        const index = state.customers.findIndex((c) => c.id === customer.id);

        if (index !== -1) {
          state.customers[index] = customer;
        } else {
          state.customers.unshift(customer);
        }
      })

      .addCase(editCustomer.fulfilled, (state, action) => {
        const customer = action.payload;

        // Update selected customer
        state.selectedCustomer = customer;

        // Update customer in list
        const index = state.customers.findIndex((c) => c.id === customer.id);

        if (index !== -1) {
          state.customers[index] = customer;
        }
      })

      .addCase(removeCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(
          (c) => c.id === action.payload.id,
        );

        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      });
  },
});

export const {
  loading,
  setField,
  validateCustomer,
  clearFieldError,

  setActiveTab,
  setErrors,
  setSearchQuery,
  toggleEnablePortal,
  setAddressField,
  copyBillingToShipping,
  copySelectedBillingToShipping,
  resetForm,
  setCurrency,

  updateSelectedCustomerField,
  setSelectedCustomerAddressField,

  setCustomerLanguage,
  setOpenCustomerLanguage,
  setCustomerLanguageSearch,

  setCurrentPage,
  removeCustomerLocal,

  clearSelectedCustomer,
  setSelectedCustomer,

  setCustomerTypeSearch,
  setOpenCustomerType,

  setIsEditingCustomerType,
  setEditCustomerType,
  saveCustomerType,
  cancelCustomerType,

  setEditingField,
  setContactField,
  resetContactForm,

  setActivities,
  addActivity,

  addRecentActivity,
  setRecentActivities,
  clearActivities,

  setOpenPaymentTerms,
  setPaymentTermsSearch,

  setStatus,

  resetCustomerForm,
  resetSelectedCustomer,

  resetDirty,
} = customerSlice.actions;

// Remove validateCustomer from the `reducers: {}` block entirely, then add:

export const validateCustomerForm = (customer) => {
  const errors = {};

  if (!customer.firstName?.trim()) errors.firstName = "Please enter first name";
  if (!customer.lastName?.trim()) errors.lastName = "Please enter last name";
  if (!customer.companyName?.trim())
    errors.companyName = "Please enter company name";
  if (!customer.displayName?.trim())
    errors.displayName = "Please enter display name";
  if (!customer.currency) errors.currency = "Please select currency";

  if (!customer.email?.trim()) {
    errors.email = "Please enter email";
  } else if (!/\S+@\S+\.\S+/.test(customer.email)) {
    errors.email = "Please enter a valid email";
  }

  // if (!customer.workPhone?.trim()) errors.workPhone = "Please enter work phone";
  if (!customer.mobile?.trim()) errors.mobile = "Please enter mobile number";
  // if (!customer.customerLanguage)
  //   errors.customerLanguage = "Please select language";

  return errors;
};

export default customerSlice.reducer;
