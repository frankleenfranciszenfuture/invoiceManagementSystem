import { configureStore } from "@reduxjs/toolkit";

// Auth
import authReducer from "../module/auth/slice/authSlice";

// UI
import uiReducer from "../module/ui/uiSlice";

// Customer
import customerReducer from "../module/customer/slices/customerSlices";
import customerViewReducer from "../module/customer/slices/customerViewSlice";

// Size
import sizeReducer from "../module/sizes/slices/sizeSlice";

// Tax Master
import taxMasterReducer from "../module/taxMaster/slices/taxMasterSlice";

//unit
import unitReducer from "../module/units/slices/unitSlice";

//product
import productReducer from "../module/items/slices/productSlice";
import productViewReducer from "../module/items/slices/productViewSlice";
import subCategoryReducer from "../module/subCategory/slices/subCategorySlice";
import categoryReducer from "../module/category/slices/categorySlice";
import invoiceReducer from "../module/invoices/slices/invoiceSlice";
import invoiceViewReducer from "../module/invoices/slices/invoiceViewSlice";
import roleReducer from "../module/role/slices/roleSlice";
import roleViewReducer from "../module/role/slices/roleViewSlice";

export const store = configureStore({
  reducer: {
    // Auth
    auth: authReducer,

    // UI
    ui: uiReducer,

    // Customer
    customers: customerReducer,
    customerView: customerViewReducer,

    // Size
    size: sizeReducer,

    // Tax Master
    taxMaster: taxMasterReducer,

    //unit

    unit: unitReducer,

    //subCategory

    subCategory: subCategoryReducer,

    //category

    category: categoryReducer,

    //product

    product: productReducer,
    productView: productViewReducer,

    //product

    role: roleReducer,
    roleView: roleViewReducer,

    //invoice

    invoice: invoiceReducer,
    invoiceView: invoiceViewReducer,
  },
});

export default store;
