import { configureStore } from "@reduxjs/toolkit";
// login
import authReducer from "../module/auth/slice/authSlice";

import uiReducer from "../module/ui/uiSlice";
import customerReducer from "../module/customer/slices/customerSlices";
import customerViewReducer from "../module/customer/slices/customerViewSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,

    // UI
    ui: uiReducer,
    customers: customerReducer,
    customerView: customerViewReducer,
  },
});

export default store;
