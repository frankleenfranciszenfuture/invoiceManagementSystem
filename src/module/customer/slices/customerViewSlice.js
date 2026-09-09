import { createSlice } from "@reduxjs/toolkit";

const views = [
  "All Customers",
  "Active Customers",
  "CRM Customers",
  "Duplicate Customers",
  "Inactive Customers",
  "Customer Portal Enabled",
  "Customer Portal Disabled",
  "Overdue Customers",
  "Unpaid Customers",
];

const initialState = {
  selectedView: "All Customers",
  status: "ALL",
  search: "",
  views: [
    { label: "All Customers", value: "ALL" },
    { label: "Active Customers", value: "ACTIVE" },
    { label: "Inactive Customers", value: "INACTIVE" },
    { label: "Draft", value: "DRAFT" },
    { label: "Overdue", value: "OVERDUE" },
    { label: "Unpaid", value: "UNPAID" },
  ],
};

const customerViewSlice = createSlice({
  name: "customerView",
  initialState,
  reducers: {
    setOpenCustomer(state, action) {
      state.openCustomer = action.payload;
    },
    setSearch(state, action) {
      state.search = action.payload;
    },
    setSelectedView(state, action) {
      state.selectedView = action.payload;
    },

    setStatus: (state, action) => {
      state.status = action.payload;
    },
  },
});

export const { setSelectedView, setSearch, setStatus } =
  customerViewSlice.actions;
export default customerViewSlice.reducer;
