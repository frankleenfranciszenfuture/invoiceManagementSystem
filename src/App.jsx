import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { checkAuthentication } from "./module/auth/thunks/authThunks";

import LoginPage from "./module/auth/page/LoginPage";
import ProtectedRoute from "./roots/ProtectedRoute";

import AppLayout from "./common/layout/AppLayout";

// =====================================================
// CUSTOMER
// =====================================================

import CustomerDashboard from "./module/customer/pages/CustomerDashboard";
import CustomerTable from "./module/customer/pages/CustomerTable";
import CreateCustomer from "./module/customer/pages/CreateCustomer";
import EditCustomer from "./module/customer/pages/EditCustomer";


// =====================================================
// PRODUCTS / ITEMS
// =====================================================

import ProductDashboard from "./module/items/pages/productDashboard";
import ProductTable from "./module/items/pages/ProductTable";
import ProductOverViewDashboard from "./module/items/overviewCard/ProductOverViewDashboard";
import ProductCreate from "./module/items/pages/ProductCreate";
import ProductCreateSimple from "./module/items/pages/ProductCreateSimple";

// =====================================================
// TAX MASTER
// =====================================================

import TaxMasterDashboard from "./module/taxMaster/pages/TaxMasterDashboard";

// =====================================================
// SIZE / UNIT / CATEGORY
// =====================================================

import SizesDashboard from "./module/sizes/pages/SizesDashboard";
import UnitDashboard from "./module/units/pages/UnitDashboard";
import SubCategoryDashboard from "./module/subCategory/pages/SubCategoryDashboard";
import CategoryDashboard from "./module/category/pages/CategoryDashboard";

// =====================================================
// INVOICE
// =====================================================

import InvoiceCreate from "./module/invoices/pages/InvoiceCreate";
import InvoiceDashboard from "./module/invoices/pages/InvoiceDashboard";

import ServiceInvoice from "./module/invoices/pages/ServiceInvoice";
// =====================================================
// ROLE
// =====================================================

import RoleDashboard from "./module/role/pages/RoleDashboard";
import RoleOverViewCardDashboard from "./module/role/overViewCard/roleOverViewCardDashboard";

// =====================================================
// USER
// =====================================================

import UserDashboard from "./module/users/pages/UserDashboard";
import UserOverViewCardDashboard from "./module/users/overviewCard/UserOverViewCardDashboard";

// =====================================================
// BANK ACCOUNT
// =====================================================

import BankAccountDashboard from "./module/bankAccount/pages/BankAccountDashboard";

// =====================================================
// COMPANY
// =====================================================

import CompanyDashboard from "./module/company/pages/CompanyDashboard";

// =====================================================
// MENU PERMISSION
// =====================================================

import MenuPermissions from "./module/menuPermission/pages/MenuPermission";

// =====================================================
// GLOBAL TOAST
// =====================================================

import GlobalModalToast from "./common/toast/GlobalModalToast";
import CompanyCreateSimple from "./module/company/pages/CompanyCreateSimple";
import BankAccountCreateSimple from "./module/bankAccount/pages/BankAccountCreateSimple";
import SettingsDashboard from "./common/bars/Nav/data/settings/SettingsDashboard";
import CompanyProfileOverview from "./module/company/pages/CompanyProfileOverview";
import UserProfileOverview from "./module/users/pages/UserProfileOverview";
import CustomerProfileOverview from "./module/customer/pages/Customerprofileoverview";
import RoleProfileOverview from "./module/role/pages/RoleProfileOverview";
import BankAccountProfileOverview from "./module/bankAccount/pages/BankAccountProfileOverview";
import SalesPersonCreateSimple from "./module/salesPerson/pages/SalesPersonCreateSimple";

import SalesPersonDashboard from "./module/salesPerson/pages/SalesPersonDashboard";
import CurrencyDashboard from "./module/currency/pages/CurrencyDashboard";
import CurrencyCreateSimple from "./module/currency/pages/CurrencyCreateSimple";
import SaleInvoice from "./module/invoices/pages/SaleInvoice";
import InvoiceOverViewPreviewDashboard from "./module/invoices/overview/pages/InvoiceOverViewPreviewDashboard";
import EmailSignatureCreateSimple from "./module/emailSignature/pages/EmailSignatureCreateSimple";
import EmailSignatureDashboard from "./module/emailSignature/pages/EmailSignatureDashboard";

import PartyDashboard from "./module/parties/pages/PartyDashboard";
import PartyCreateSimple from "./module/parties/pages/PartyCreateSimple";

import ClearanceCreateSimple from "./module/clearnaceOutStandingParties/pages/ClearanceCreateSimple";
import ClearanceDashboard from "./module/clearnaceOutStandingParties/pages/ClearanceDashboard";
import UnitProfileView from "./module/units/pages/UnitProfileView";
import SizeProfileView from "./module/sizes/pages/SizeProfileView";

import CustomerCreateModal from "./module/customer/pages/CustomerCreateModal";
import CurrencyModel from "./module/currency/pages/CurrencyModel";
import InventoryDashbaord from "./inventoryModule/inventory/pages/InventoryDashbaord";
import InventoryOpeningStock from "./inventoryModule/module/openingStock/pages/InventoryOpeningStock";
import WarehouseDashboard from "./inventoryModule/module/warehouse/pages/WarehouseDashboard";
import WarehouseCreate from "./inventoryModule/module/warehouse/pages/WarehouseCreate";
import InventoryStockAdjustment from "./inventoryModule/module/openingStock/pages/InventoryStockAdjustment";
import SalesOrderCreate from "./inventoryModule/module/saleOrder/pages/SalesOrderCreate";
import SaleOrderDashboard from "./inventoryModule/module/saleOrder/pages/SaleOrderDashboard";
import SaleOrderTable from "./inventoryModule/module/saleOrder/pages/SaleOrderTable";

import PurchaseOrderCreate from "./inventoryModule/module/purchaseOrder/pages/PurchaseOrderCreate";
import PurchaseOrderDashboard from "./inventoryModule/module/purchaseOrder/pages/PurchaseOrderDashboard";
import PurchaseOrderViewDetails from "./inventoryModule/module/purchaseOrder/pages/PurchaseOrderViewDetails";
import SaleOrderViewDetails from "./inventoryModule/module/saleOrder/pages/SaleOrderViewDetails";
import WarehouseViewDetails from "./inventoryModule/module/warehouse/pages/WarehouseViewDetails";
import ExpenseCreate from "./inventoryModule/module/expenses/pages/ExpenseCreate";
import ExpenseDashboard from "./inventoryModule/module/expenses/pages/ExpenseDashboard";
import ExpenseViewDetails from "./inventoryModule/module/expenses/pages/ExpenseViewDetails";
import ExpenseCategoryViewDetails from "./inventoryModule/module/expenses/pages/ExpenseCategoryViewDetails";
import PaymentDashboard from "./inventoryModule/module/payment/pages/PaymentDashboard";

import PaymentViewDetails from "./inventoryModule/module/payment/pages/PaymentViewDetails";
import PaymentCreate from "./inventoryModule/module/payment/pages/PaymentCreate";
import CashAccountDashboard from "./inventoryModule/module/cashAccount/pages/CashAccountDashboard";
import CashAccountCreate from "./inventoryModule/module/cashAccount/pages/CashAccountCreate";
import CashAccountViewDetails from "./inventoryModule/module/cashAccount/pages/CashAccountViewDetails";
import BankAccountViewDetails from "./module/bankAccount/pages/BankAccountViewDetails";
import CompanyViewDetails from "./module/company/pages/CompanyViewDetails";
import CurrencyViewDetails from "./module/currency/pages/CurrencyViewDetails";
import EmailSignatureViewDetails from "./module/emailSignature/pages/EmailSignatureViewDetails";
import ProductCreateNew from "./module/items/pages/ProductCreateNew";
import PartyCreateNew from "./module/parties/pages/PartyCreateNew";
import PartyViewDetails from "./module/parties/pages/PartyViewDetails";
import SalesPersonCreateNew from "./module/salesPerson/pages/SalesPersonCreateNew";
import SalesPersonViewDetails from "./module/salesPerson/pages/SalesPersonViewDetails";
import InvoiceViewDetails from "./module/invoices/pages/InvoiceViewDetails";
import RoleViewDetails from "./module/role/pages/RoleViewDetails";
import RoleCreateSimple from "./module/role/pages/RoleCreateSimple";
import UserCreateSimple from "./module/users/pages/UserCreateSimple";
import UserViewDetails from "./module/users/pages/UserViewDetails";
import TaxCreateSimple from "./module/taxMaster/pages/TaxCreateSimple";
import TaxMasterViewDetails from "./module/taxMaster/pages/TaxMasterViewDetails";
import ProductViewDetails from "./module/items/pages/Productviewdetails";
import ClearanceViewDetails from "./module/clearnaceOutStandingParties/pages/ClearanceViewDetails";
import CustomerCreateNew from "./module/customer/pages/CustomerCreateNew";
import CustomerViewDetails from "./module/customer/pages/CustomerViewDetails";
import CategoryViewDetails from "./module/category/pages/CategoryViewDetails";
import CategoryCreateSimple from "./module/category/pages/CategoryCreateSimple";
import SubCategoryCreate from "./module/subCategory/pages/SubCategoryCreate";
import SubCategoryViewDetails from "./module/subCategory/pages/SubCategoryViewDetails";
import SizeCreate from "./module/sizes/pages/SizeCreate";
import SizeViewDetails from "./module/sizes/pages/SizeViewDetails";
import UnitViewDetails from "./module/units/pages/UnitViewDetails";
import UnitCreate from "./module/units/pages/UnitCreate";
import InvoicePreviewCard from "./module/invoices/overview/pages/InvoicePreviewCard";
import ReportDashboard from "./common/reports/pages/ReportDashboard";
import ReportViewer from "./common/reports/pages/ReportViewer";
import ReportCreate from "./common/reports/pages/ReportCreate";
import RegisterCreate from "./common/reports/pages/RegisterCreate";
import ReportRegisterPage from "./common/reports/pages/ReportRegisterPage";
import ReportSelectionPage from "./common/reports/pages/ReportSelectionPage";
import Dashboard from "./module/dashboard/pages/Dashboard";
import InvoiceApprovalDashboard from "./module/approval/invoiceApproval/pages/InvoiceApprovalDashboard";
import InvoiceApprovalView from "./module/approval/invoiceApproval/pages/InvoiceApprovalView";
import AuditLogDashboard from "./module/audit/pages/AuditLogDashboard";
import AuditLogDetails from "./module/audit/pages/AuditLogDetails";
import InventoryStockViewDetails from "./inventoryModule/inventory/pages/InventoryStockViewDetails";
import InventoryTransactionViewDetails from "./inventoryModule/inventory/pages/InventoryTransactionViewDetails";
import InventoryStockDashboard from "./inventoryModule/inventory/pages/InventoryStockDashboard";
import InventoryTransactionDashboard from "./inventoryModule/inventory/pages/InventoryTransactionDashboard";
import InventoryStockAdjustmentDashboard from "./inventoryModule/inventory/adjustmentStock/InventoryStockAdjustmentDashboard";
import InventoryStockAdjustmentViewDetails from "./inventoryModule/inventory/adjustmentStock/InventoryStockAdjustmentViewDetails";




// =====================================================
// APP CONTENT
// =====================================================

function AppContent() {
  const dispatch = useDispatch();
  const location = useLocation();

  const authChecking = useSelector(
    (state) => state.auth?.authChecking
  );

  /*
   * ============================================================
   * AUTH INITIALIZATION
   * ============================================================
   *
   * IMPORTANT:
   *
   * checkAuthentication() must run only when the application
   * initially loads.
   *
   * We must NOT execute it again after:
   *
   * LoginPage
   *      ↓
   * loginUser()
   *      ↓
   * navigate("/dashboard")
   *
   * Otherwise authentication restoration can race with the
   * newly completed login and affect permission loading.
   *
   * useRef makes this initialization happen only once.
   */

  const authenticationInitialized = useRef(false);

  useEffect(() => {
    /*
     * Already initialized.
     */
    if (authenticationInitialized.current) {
      return;
    }

    /*
     * Mark initialization immediately.
     */
    authenticationInitialized.current = true;

    /*
     * If the application starts on login page,
     * do NOT call checkAuthentication().
     *
     * LoginPage will handle loginUser().
     */
    if (location.pathname === "/login") {
      return;
    }

    /*
     * Application was opened directly on a protected route.
     *
     * Example:
     *
     * /dashboard
     * /customers
     * /items
     *
     * Restore the existing authentication session.
     */
    dispatch(checkAuthentication());
  }, [dispatch, location.pathname]);


  /*
   * ============================================================
   * INITIAL AUTH CHECK LOADING
   * ============================================================
   *
   * Only show this when the application starts on a protected
   * route and authentication is being restored.
   *
   * Login page is never blocked by this.
   */

  if (
    authChecking &&
    location.pathname !== "/login"
  ) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div
            className="
              h-8
              w-8
              animate-spin
              rounded-full
              border-4
              border-slate-200
              border-t-blue-600
            "
          />

          <p className="text-sm text-slate-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }


  return (
    <Routes>

      {/* =====================================================
                  DEFAULT
          ===================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />


      {/* =====================================================
                  LOGIN
          ===================================================== */}

      <Route
        path="/login"
        element={<LoginPage />}
      />


      {/* =====================================================
                  PROTECTED APPLICATION ROUTES
          ===================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        {/* =================================================
                    DASHBOARD
            ================================================= */}

        <Route
          path="/home"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =================================================
                    CUSTOMERS
            ================================================= */}

        <Route
          path="/invoice/customers"
          element={<CustomerDashboard />}
        />

        <Route
          path="/invoice/customers/model"
          element={<CustomerCreateModal />}
        />

        <Route
          path="/invoice/customers/create"
          element={<CustomerCreateNew />}
        />

        <Route
          path="/invoice/customers/edit/:id"
          element={<CustomerCreateNew />}
        />

        <Route
          path="/invoice/customers/view/:id"
          element={<CustomerViewDetails />}
        />


        {/* =================================================
                    PRODUCTS / ITEMS
            ================================================= */}

        <Route
          path="/invoice/items"
          element={<ProductDashboard />}
        />

        <Route
          path="/invoice/settings/items"
          element={<ProductDashboard />}
        />



        <Route
          path="/invoice/items/new"
          element={<ProductCreate />}
        />

        <Route
          path="/invoice/items/create"
          element={<ProductCreateNew />}
        />

        <Route
          path="/invoice/items/edit/:id"
          element={<ProductCreateNew />}
        />

        <Route
          path="/invoice/items/newSimple"
          element={<ProductCreateSimple />}
        />

        <Route
          path="/invoice/settings/items/newSimple"
          element={<ProductCreateSimple />}
        />

        <Route
          path="/invoice/items/table"
          element={<ProductTable />}
        />

        {/* <Route
          path="/items/view/:id"
          element={<ProductOverViewDashboard />}
        /> */}

        <Route
          path="/invoice/items/view/:id"
          element={<ProductViewDetails />}
        />

        {/* =================================================
                    TAX MASTER
            ================================================= */}

        <Route
          path="/settings/taxes"
          element={<TaxMasterDashboard />}
        />

        <Route
          path="/settings/taxes/create"
          element={<TaxCreateSimple />}
        />

        <Route
          path="/settings/taxes/edit/:id"
          element={<TaxCreateSimple />}
        />

        <Route
          path="/settings/taxes/view/:id"
          element={<TaxMasterViewDetails />}
        />



        {/* =================================================
                    SIZES
            ================================================= */}

        <Route
          path="/settings/sizes"
          element={<SizesDashboard />}
        />

        <Route
          path="/settings/sizes/create"
          element={<SizeCreate />}
        />

        <Route
          path="/settings/sizes/edit/:id"
          element={<SizeCreate />}
        />

        <Route
          path="/settings/sizes/view/:id"
          element={<SizeViewDetails />}
        />




        {/* =================================================
                    UNITS
            ================================================= */}

        <Route
          path="/settings/units"
          element={<UnitDashboard />}
        />

        <Route
          path="/settings/units/create"
          element={<UnitCreate />}
        />

        <Route
          path="/settings/units/edit/:id"
          element={<UnitCreate />}
        />

        <Route
          path="/settings/units/view/:id"
          element={<UnitViewDetails />}
        />




        {/* =================================================
                    SUB CATEGORY
            ================================================= */}

        <Route
          path="/settings/subCategoires"
          element={<SubCategoryDashboard />}
        />


        <Route
          path="/settings/subCategoires/create"
          element={<SubCategoryCreate />}
        />

        <Route
          path="/settings/subCategoires/edit/:id"
          element={<SubCategoryCreate />}
        />

        <Route
          path="/settings/subCategoires/view/:id"
          element={<SubCategoryViewDetails />}
        />


        {/* =================================================
                    CATEGORY
            ================================================= */}

        <Route
          path="/settings/categories"
          element={<CategoryDashboard />}
        />

        <Route
          path="/settings/categories/create"
          element={<CategoryCreateSimple />}
        />

        <Route
          path="/settings/categories/edit/:id"
          element={<CategoryCreateSimple />}
        />


        <Route
          path="/settings/categories/view/:id"
          element={<CategoryViewDetails />}
        />

        {/* =================================================
                    BANK ACCOUNT
            ================================================= */}

        <Route
          path="/settings/bankAccount"
          element={<BankAccountDashboard />}
        />

        <Route
          path="/settings/bankAccount/create"
          element={<BankAccountCreateSimple />}
        />

        <Route
          path="/settings/bankAccount/edit/:id"
          element={<BankAccountCreateSimple />}
        />

        <Route
          path="/settings/bankAccount/view/:id"
          element={<BankAccountViewDetails />}
        />


        {/* =================================================
                    COMPANY
            ================================================= */}

        <Route
          path="/settings/companies"
          element={<CompanyDashboard />}
        />

        <Route
          path="/settings/companies/create"
          element={<CompanyCreateSimple />}

        />


        <Route
          path="/settings/companies/edit/:id"
          element={<CompanyCreateSimple />}
        />

        <Route
          path="/settings/companies/view/:id"
          element={<CompanyViewDetails />}
        />


        {/* =================================================
                   CURRENCY
            ================================================= */}

        <Route
          path="/settings/currencies"
          element={<CurrencyDashboard />}
        />

        <Route
          path="/settings/currencies/create"
          element={<CurrencyCreateSimple />}
        />


        <Route
          path="/currencies/model"
          element={<CurrencyModel />}
        />


        <Route
          path="/settings/currencies/edit/:id"
          element={<CurrencyCreateSimple />}
        />

        <Route
          path="/settings/currencies/view/:id"
          element={<CurrencyViewDetails />}
        />


        {/* =================================================
                    INVOICES
          ================================================= */}

        <Route
          path="/invoices/product/new"
          element={<InvoiceCreate />}
        />

        <Route
          path="/invoices/service/new"
          element={<InvoiceCreate />}
        />

        <Route
          path="/invoices/sale/new"
          element={<InvoiceCreate />}
        />

        <Route
          path="/invoices/product/edit/:id"
          element={<InvoiceCreate />}
        />

        <Route
          path="/invoices/service/edit/:id"
          element={<InvoiceCreate />}
        />

        <Route
          path="/invoices/sale/edit/:id"
          element={<InvoiceCreate />}
        />

        <Route
          path="/invoices"
          element={<InvoiceDashboard />}
        />

        {/* <Route
          path="/invoices/view/:id"
          element={<InvoiceOverViewDashboard1 />}
        /> */}

        <Route
          path="/invoices/preview/:id"
          element={<InvoicePreviewCard />}
        />

        <Route
          path="/invoices/view/:id"
          element={<InvoiceViewDetails />}
        />


        {/* =================================================
                  invoiceApproval
            ================================================= */}
        <Route
          path="/invoice-approvals"
          element={<InvoiceApprovalDashboard />}
        />


        <Route
          path="/invoice-approvals/view/:id"
          element={<InvoiceApprovalView />}
        />

        {/* =================================================
                  Expenses
            ================================================= */}

        <Route
          path="/invoice/expenses"
          element={<ExpenseDashboard />}
        />

        <Route
          path="/invoice/expenses/create"
          element={<ExpenseCreate />}
        />

        <Route
          path="/invoice/expenses/edit/:id"
          element={<ExpenseCreate />}
        />

        <Route
          path="/invoice/expenses/view/:id"
          element={<ExpenseViewDetails />}
        />

        <Route
          path="/invoice/expenses-categories/view/:id"
          element={<ExpenseCategoryViewDetails />}
        />


        {/* =================================================
                  EmailSignature
            ================================================= */}

        <Route
          path="/settings/emailSignatures"
          element={<EmailSignatureDashboard />}
        />

        <Route
          path="/settings/emailSignatures/create"
          element={<EmailSignatureCreateSimple />}
        />
        <Route
          path="/settings/emailSignatures/edit/:id"
          element={<EmailSignatureCreateSimple />}
        />

        <Route
          path="/settings/emailSignatures/view/:id"
          element={<EmailSignatureViewDetails />}
        />


        {/* =================================================
                    SALES PERSON
            ================================================= */}

        <Route
          path="/salesPersons"
          element={<SalesPersonDashboard />}
        />

        <Route
          path="/salesPersons/create"
          element={<SalesPersonCreateNew />}
        />

        <Route
          path="/salesPersons/edit/:id"
          element={<SalesPersonCreateNew />}
        />

        <Route
          path="/salesPersons/view/:id"
          element={<SalesPersonViewDetails />}
        />



        {/* =================================================
                    inventory
            ================================================= */}

        <Route
          path="/inventory"
          element={<InventoryDashbaord />}
        />

        {/* =================================================
                    OPENINGSTOCK
            ================================================= */}

        <Route
          path="/inventory/openStock"
          element={<InventoryStockDashboard />}
        />


        <Route
          path="/inventory/openStock/create"
          element={<InventoryOpeningStock />}
        />

        <Route
          path="/inventory/openStock/view/:id"
          element={<InventoryStockViewDetails />}
        />

        <Route
          path="/inventory/transactions"
          element={<InventoryTransactionDashboard />}
        />
        <Route
          path="/inventory/transactions/view/:id"
          element={<InventoryTransactionViewDetails />}
        />

        {/* =================================================
                    ADJUSTMENT STOCK
            ================================================= */}


        <Route
          path="/inventory/adjustmentStock/create"
          element={<InventoryStockAdjustment />}
        />
        <Route
          path="/inventory/adjustmentStock"
          element={<InventoryStockAdjustmentDashboard />}
        />

        <Route
          path="/inventory/adjustmentStock/view/:id"
          element={<InventoryStockAdjustmentViewDetails />}
        />

        {/* =================================================
                    WAREHOUSE
            ================================================= */}


        <Route
          path="/inventory/warehouses"
          element={<WarehouseDashboard />}
        />

        <Route
          path="/inventory/warehouses/create"
          element={<WarehouseCreate />}
        />

        <Route
          path="/inventory/warehouses/edit/:id"
          element={<WarehouseCreate />}
        />

        <Route
          path="/inventory/warehouses/view/:id"
          element={<WarehouseViewDetails />}
        />


        {/* =================================================
                    PARTY
            ================================================= */}

        <Route
          path="/inventory/parties"
          element={<PartyDashboard />}
        />

        <Route
          path="/inventory/parties/create"
          element={<PartyCreateNew />}

        />

        <Route
          path="/inventory/parties/edit/:id"
          element={<PartyCreateNew />}
        />

        <Route
          path="/inventory/parties/view/:id"
          element={<PartyViewDetails />}
        />

        {/* =================================================
                    CLEARANCE
            ================================================= */}


        <Route
          path="/inventory/parties/clearances"
          element={<ClearanceDashboard />}

        />

        <Route
          path="/inventory/parties/clearances/create"
          element={<ClearanceCreateSimple />}

        />

        <Route
          path="/inventory/parties/clearances/edit/:id"
          element={<ClearanceCreateSimple />}
        />

        <Route
          path="/inventory/parties/clearances/view/:id"
          element={<ClearanceViewDetails />}
        />




        {/* Warehouse */}

        <Route
          path="/inventory/warehouses/edit/:id"
          element={<WarehouseCreate />}
        />

        <Route
          path="/inventory/warehouses/view/:id"
          element={<WarehouseViewDetails />}
        />


        {/* SaleOrder */}

        <Route
          path="/inventory/salesOrders"
          element={<SaleOrderDashboard />}
        />

        <Route
          path="/inventory/salesOrders/tab"
          element={<SaleOrderTable />}
        />

        <Route
          path="/inventory/saleOrder/create"
          element={<SalesOrderCreate />}
        />

        <Route
          path="/inventory/saleOrder/view/:id"
          element={<SaleOrderViewDetails />}
        />

        <Route
          path="/inventory/saleOrder/edit/:id"
          element={<SalesOrderCreate />}
        />


        {/* PurchaseOrder */}

        <Route
          path="/inventory/purchaseOrder/create"
          element={<PurchaseOrderCreate />}
        />
        <Route
          path="/inventory/purchaseOrder"
          element={<PurchaseOrderDashboard />}
        />
        <Route
          path="/inventory/purchaseOrder/edit/:id"
          element={<PurchaseOrderCreate />}
        />

        <Route
          path="/inventory/purchaseOrder/edit1/:id"
          element={<PurchaseOrderCreate />}
        />

        <Route
          path="/inventory/purchaseOrder/view/:id"
          element={<PurchaseOrderViewDetails />}
        />

        {/* =================================================
                  INVOICE  PAYMENTS
            ================================================= */}

        <Route
          path="/invoice/payments"
          element={<PaymentDashboard />}
        />

        <Route
          path="/invoice/payments/create"
          element={<PaymentCreate />}
        />
        <Route
          path="/invoice/payments/edit/:id"
          element={<PaymentCreate />}
        />
        <Route
          path="/invoice/payments/view/:id"
          element={<PaymentViewDetails />}
        />

        {/* =================================================
                    INVENTORY RECORD PAYMENTS
            ================================================= */}

        <Route
          path="/inventory/payments"
          element={<PaymentDashboard />}
        />

        <Route
          path="/inventory/payments/create"
          element={<PaymentCreate />}
        />
        <Route
          path="/inventory/payments/edit/:id"
          element={<PaymentCreate />}
        />
        <Route
          path="/inventory/payments/view/:id"
          element={<PaymentViewDetails />}
        />

        {/* =================================================
                    CASH ACCOUNT
            ================================================= */}

        <Route
          path="/settings/cash-accounts"
          element={<CashAccountDashboard />}
        />

        <Route
          path="/settings/cash-accounts/create"
          element={<CashAccountCreate />}
        />

        <Route
          path="/settings/cash-accounts/edit/:id"
          element={<CashAccountCreate />}
        />
        <Route
          path="/settings/cash-accounts/view/:id"
          element={<CashAccountViewDetails />}
        />



        {/* =================================================
                    ROLE
            ================================================= */}

        <Route
          path="/settings/roles"
          element={<RoleDashboard />}
        />

        <Route
          path="/settings/roles/create"
          element={<RoleCreateSimple />}
        />

        <Route
          path="/settings/roles/edit/:id"
          element={<RoleCreateSimple />}
        />

        <Route
          path="/settings/roles/view/:id"
          element={<RoleViewDetails />}
        />


        {/* =================================================
                    USER
            ================================================= */}

        <Route
          path="/settings/users"
          element={<UserDashboard />}
        />

        <Route
          path="/settings/users/create"
          element={<UserCreateSimple />}
        />
        <Route
          path="/settings/users/view/:id"
          element={<UserViewDetails />}
        />

        <Route
          path="/settings/users/edit/:id"
          element={<UserCreateSimple />}
        />

        {/* =================================================
                    MENU PERMISSION
            ================================================= */}


        <Route
          path="/settings/menuPermission"
          element={<MenuPermissions />}
        />


        {/* =================================================
                    Settings
            ================================================= */}

        <Route
          path="/settings"
          element={<SettingsDashboard />}
        />

        <Route
          path="/inventory/settings"
          element={<SettingsDashboard />}
        />

        {/* =================================================
                    Reports
            ================================================= */}

        <Route
          path="/reports"
          element={<ReportDashboard />}
        />

        <Route
          path="/reports/create"
          element={<ReportSelectionPage />}
        />

        <Route
          path="/reports/register/:module/:reportCode"
          element={<ReportRegisterPage />}
        />

        <Route
          path="/reports/:module/:reportCode"
          element={<ReportCreate />}
        />

        <Route
          path="/reports/:module"
          element={<ReportViewer />}
        />


        {/* =================================================
                    Audit logs
            ================================================= */}
        <Route
          path="/audit-logs"
          element={<AuditLogDashboard />}
        />

        <Route
          path="/audit-logs/view/:id"
          element={<AuditLogDetails />}
        />
      </Route>

    </Routes>
  );
}


// =====================================================
// ROOT APP
// =====================================================

export default function App() {
  return (
    <BrowserRouter>

      <AppContent />

      {/* =====================================================
                  GLOBAL MODAL TOAST
          ===================================================== */}

      {/* 
      <GlobalModalToast />
      */}


      {/* =====================================================
                  TOAST
          ===================================================== */}

      <Toaster
        position="top-center"
        containerStyle={{
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 2000,

          success: {
            style: {
              background: "#dcfce7",
              color: "#15803d",
              border: "1px solid #bbf7d0",
            },
          },

          error: {
            style: {
              background: "#ffffff",
              color: "#d00505",
              border: "1px solid #fecaca",
            },
          },
        }}
      />

    </BrowserRouter>
  );
}