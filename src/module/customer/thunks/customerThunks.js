import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  fetchCustomerById,
  deleteCustomer,
  updateCustomerAddress,
} from "../../../api/customer/CustomerApi";

export const loadCustomers = createAsyncThunk(
  "customer/loadCustomers",

  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCustomers({
        ...params,
        status: params.status || "ACTIVE",
      });

      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const addCustomer = createAsyncThunk(
  "customers/add",
  async (customer, { rejectWithValue }) => {
    try {
      const response = await createCustomer(customer);
      return response; // ✅ not response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getCustomerById = createAsyncThunk(
  "customers/getCustomerById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetchCustomerById(id);
      return response; // api.fetchCustomerById should already return response.data.data (the customer object)
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const saveCustomer = createAsyncThunk(
  "customer/saveCustomer",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { selectedCustomer } = getState().customer;
      const payload = {
        ...selectedCustomer,
        status: selectedCustomer.status ? selectedCustomer.status : null,
      };
      const response = await updateCustomer(payload.id, payload);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const saveCustomerAddress = createAsyncThunk(
  "customers/updateAddress",
  async ({ customerId, billingAddress }, { rejectWithValue }) => {
    try {
      const response = await updateCustomerAddress(customerId, billingAddress);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const editCustomer = createAsyncThunk(
  "customers/edit",
  async (customer, { rejectWithValue }) => {
    try {
      const response = await updateCustomer(customer.id, customer);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const removeCustomer = createAsyncThunk(
  "customers/remove",
  async (id, { rejectWithValue }) => {
    try {
      await deleteCustomer(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
