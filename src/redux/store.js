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
import userReducer from "../module/users/slices/userSlice";
import userViewReducer from "../module/users/slices/userViewSlice";
import bankAccountReducer from "../module/bankAccount/slices/bankAccountSlice";
import bankAccountViewReducer from "../module/bankAccount/slices/bankAccountViewSlice";
import companyReducer from "../module/company/slices/companySlice";
import companyViewReducer from "../module/company/slices/companyViewSlice";

import menuPermissionReducer from "../module/menuPermission/slices/menuPermissionSlice";

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

    //role

    role: roleReducer,
    roleView: roleViewReducer,

    //user

    user: userReducer,
    userView: userViewReducer,

    //invoice

    invoice: invoiceReducer,
    invoiceView: invoiceViewReducer,

    //bankAccount

    bankAccount: bankAccountReducer,
    bankAccountView: bankAccountViewReducer,

    //company

    company: companyReducer,
    companyView: companyViewReducer,

    //menuPermission

    menuPermission: menuPermissionReducer,
  },
});

export default store;
