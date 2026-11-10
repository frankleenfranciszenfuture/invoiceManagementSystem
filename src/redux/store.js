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
import sizeViewReducer from "../module/sizes/slices/sizeViewSlice";

// Tax Master
import taxMasterReducer from "../module/taxMaster/slices/taxMasterSlice";
import taxMasterViewRedcer from "../module/taxMaster/slices/taxMasterViewSlice";
//unit
import unitReducer from "../module/units/slices/unitSlice";

//product
import productReducer from "../module/items/slices/productSlice";
import productViewReducer from "../module/items/slices/productViewSlice";
import subCategoryReducer from "../module/subCategory/slices/subCategorySlice";
import subCategoryViewReducer from "../module/subCategory/slices/subCategoryViewSlice";
import categoryReducer from "../module/category/slices/categorySlice";

import invoiceReducer from "../module/invoices/slices/invoiceSlice";
import invoiceViewReducer from "../module/invoices/slices/invoiceViewSlice";
import invoiceApprovalReducer from "../module/approval/invoiceApproval/slices/invoiceApprovalSlice";

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

import inventoryDashboardReducer from "../inventoryModule/slices/inventoryDashboardSlice";
import inventoryReducer from "../inventoryModule/slices/inventorySlice";

import warehouseReducer from "../inventoryModule/module/warehouse/slices/warehouseSlice";
import warehousesViewReducer from "../inventoryModule/module/warehouse/slices/warehouseViewSlice";

import salesOrderReducer from "../inventoryModule/module/saleOrder/slices/salesOrderSlice";
import saleOrderViewReducer from "../inventoryModule/module/saleOrder/slices/saleOrderViewSlice";

import purchaseOrderReducer from "../inventoryModule/module/purchaseOrder/slices/purchaseOrderSlice";
import purchaseOrderViewReducer from "../inventoryModule/module/purchaseOrder/slices/purchaseOrderViewSlice";

import expenseReducer from "../inventoryModule/module/expenses/slices/expenseSlice";
import expensesViewReducer from "../inventoryModule/module/expenses/slices/expensesViewSlice";
import expenseCategoryReducer from "../inventoryModule/module/expenses/slices/expenseCategorySlice";
import expenseCategoryViewReducer from "../inventoryModule/module/expenses/slices/expenseCategoryViewSlice";

import paymentReducer from "../inventoryModule/module/payment/slices/paymentSlice";
import paymentsViewReducer from "../inventoryModule/module/payment/slices/paymentsViewSlice";

//cashAccount
import cashAccountReducer from "../inventoryModule/module/cashAccount/slices/cashAccountSlice";
import cashAccountsViewReducer from "../inventoryModule/module/cashAccount/slices/cashAccountsViewSlice";

import paginationReducer from "../common/pagination/slices/paginationSlice";

import reportReducer from "../common/reports/slices/reportSlice";

import dashboardReducer from "../module/dashboard/slices/dashboardSlice";
import menuPermissionReducer from "../module/menuPermission/slices/menuPermissionSlice";

//auditLogs
import auditLogReducer from "../module/audit/slices/auditLogSlice";

export const store = configureStore({
  reducer: {
    // Auth
    auth: authReducer,

    // UI
    ui: uiReducer,

    // Customer
    customer: customerReducer,
    customerView: customerViewReducer,

    // Size
    size: sizeReducer,
    sizeView: sizeViewReducer,

    // Tax Master
    taxMaster: taxMasterReducer,
    taxMasterView: taxMasterViewRedcer,

    //unit

    unit: unitReducer,

    //subCategory

    subCategory: subCategoryReducer,
    subCategoryView: subCategoryViewReducer,

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
    invoiceApproval: invoiceApprovalReducer,

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

    // inventoryDashboard
    inventoryDashboard: inventoryDashboardReducer,
    inventory: inventoryReducer,

    //warehouse
    warehouse: warehouseReducer,
    warehousesView: warehousesViewReducer,

    //saleOrder
    salesOrder: salesOrderReducer,
    saleOrderView: saleOrderViewReducer,

    //expenses
    expense: expenseReducer,
    expensesView: expensesViewReducer,

    //expensesCategroy
    expenseCategory: expenseCategoryReducer,
    expenseCategoryView: expenseCategoryViewReducer,

    //purchaseOrder
    purchaseOrder: purchaseOrderReducer,
    purchaseOrderView: purchaseOrderViewReducer,

    //payments
    payment: paymentReducer,
    paymentsView: paymentsViewReducer,

    //cashAccount
    cashAccount: cashAccountReducer,
    cashAccountsView: cashAccountsViewReducer,

    //pagniation
    pagination: paginationReducer,

    //reports

    reports: reportReducer,

    //dashboard

    dashboard: dashboardReducer,

    //menuPermission

    menuPermission: menuPermissionReducer,

    //auditLogs
    auditLogs: auditLogReducer,
  },
});

export default store;
