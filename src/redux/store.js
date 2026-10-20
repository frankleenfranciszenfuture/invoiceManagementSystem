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

import emailSignatureReducer from "../module/emailSignature/slices/emailSignatureSlice";
import emailSignatureViewReducer from "../module/emailSignature/slices/emailSignatureViewSlice";

import roleReducer from "../module/role/slices/roleSlice";
import roleViewReducer from "../module/role/slices/roleViewSlice";
import userReducer from "../module/users/slices/userSlice";
import userViewReducer from "../module/users/slices/userViewSlice";

import salesPersonReducer from "../module/salesPerson/slices/salesPersonSlice";
import salesPersonViewReducer from "../module/salesPerson/slices/salesPersonViewSlice";

import bankAccountReducer from "../module/bankAccount/slices/bankAccountSlice";
import bankAccountViewReducer from "../module/bankAccount/slices/bankAccountViewSlice";
import companyReducer from "../module/company/slices/companySlice";
import companyViewReducer from "../module/company/slices/companyViewSlice";

import currencyReducer from "../module/currency/slices/currencySlice";
import currencyViewReducer from "../module/currency/slices/currencyViewSlice";

import partyReducer from "../module/parties/slices/partySlice";
import partyViewReducer from "../module/parties/slices/partyViewSlice";

import clearanceReducer from "../module/clearnaceOutStandingParties/slices/clearanceSlice";
import clearanceViewReducer from "../module/clearnaceOutStandingParties/slices/clearanceViewSlice";

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

    //role

    salesPerson: salesPersonReducer,
    salesPersonView: salesPersonViewReducer,

    //invoice

    invoice: invoiceReducer,
    invoiceView: invoiceViewReducer,

    //emailSignature
    emailSignatures: emailSignatureReducer,
    emailSignatureView: emailSignatureViewReducer,
    //bankAccount

    bankAccount: bankAccountReducer,
    bankAccountView: bankAccountViewReducer,

    //company

    company: companyReducer,
    companyView: companyViewReducer,

    //company

    currency: currencyReducer,
    currencyView: currencyViewReducer,

    //party

    party: partyReducer,
    partyView: partyViewReducer,

    //clearance
    clearance: clearanceReducer,
    clearanceView: clearanceViewReducer,

    //menuPermission

    menuPermission: menuPermissionReducer,
  },
});

export default store;
