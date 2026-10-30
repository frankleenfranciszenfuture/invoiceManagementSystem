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

import Dashboard from "./module/dashboard/Dashboard";
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
import SalesPersonOverView from "./module/salesPerson/pages/SalesPersonOverView";
import CurrencyDashboard from "./module/currency/pages/CurrencyDashboard";
import CurrencyCreateSimple from "./module/currency/pages/CurrencyCreateSimple";
import SaleInvoice from "./module/invoices/pages/SaleInvoice";
import InvoiceOverViewDashboard1 from "./module/invoices/overview/pages/InvoiceOverViewDashboard1";
import InvoiceprofileOverview from "./module/invoices/overview/pages/InvoiceprofileOverview";
import InvoicePreviewCard from "./module/invoices/overview/pages/InvoicePreviewCard";
import InvoiceOverViewPreviewDashboard from "./module/invoices/overview/pages/InvoiceOverViewPreviewDashboard";
import EmailSignatureCreateSimple from "./module/emailSignature/pages/EmailSignatureCreateSimple";
import EmailSignatureDashboard from "./module/emailSignature/pages/EmailSignatureDashboard";
import EmailSignatureTable from "./module/emailSignature/pages/EmailSignatureTable";
import PartyDashboard from "./module/parties/pages/PartyDashboard";
import PartyCreateSimple from "./module/parties/pages/PartyCreateSimple";
import PartyProfileView from "./module/parties/pages/PartyProfileView";
import ClearanceCreateSimple from "./module/clearnaceOutStandingParties/pages/ClearanceCreateSimple";
import ClearanceDashboard from "./module/clearnaceOutStandingParties/pages/ClearanceDashboard";
import UnitProfileView from "./module/units/pages/UnitProfileView";
import SizeProfileView from "./module/sizes/pages/SizeProfileView";
import CategoryProfileView from "./module/category/pages/CategoryProfileView";
import CustomerCreateModal from "./module/customer/pages/CustomerCreateModal";
import CurrencyModel from "./module/currency/pages/CurrencyModel";
import InventoryDashbaord from "./inventoryModule/inventory/pages/InventoryDashbaord";
import InventoryOpeningStock from "./inventoryModule/module/openingStock/pages/InventoryOpeningStock";
import WarehouseDashboard from "./inventoryModule/module/warehouse/pages/WarehouseDashboard";
import WarehouseCreate from "./inventoryModule/module/warehouse/pages/WarehouseCreate";
import InventoryStockAdjustment from "./inventoryModule/module/openingStock/pages/InventoryStockAdjustment";
import SalesOrderCreate from "./inventoryModule/module/saleOrder/pages/SalesOrderCreate";




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
          path="/customers"
          element={<CustomerDashboard />}
        />

        <Route
          path="/customers/table"
          element={<CustomerTable />}
        />

        <Route
          path="/customers/model"
          element={<CustomerCreateModal />}
        />

        <Route
          path="/customers/new"
          element={<CreateCustomer />}
        />

        <Route
          path="/customers/edit/:id"
          element={<CreateCustomer />}
        />

        <Route
          path="/customers/view/:id"
          // element={<CustomerOverViewDashboard />}
          element={<CustomerProfileOverview />}
        />


        {/* =================================================
                    PRODUCTS / ITEMS
            ================================================= */}

        <Route
          path="/items"
          element={<ProductDashboard />}
        />

        <Route
          path="/settings/items"
          element={<ProductDashboard />}
        />

        <Route
          path="/items/new"
          element={<ProductCreate />}
        />

        <Route
          path="/items/editSimple/:id"
          element={<ProductCreateSimple />}
        />

        <Route
          path="/items/newSimple"
          element={<ProductCreateSimple />}
        />

        <Route
          path="/settings/items/newSimple"
          element={<ProductCreateSimple />}
        />

        <Route
          path="/items/table"
          element={<ProductTable />}
        />

        <Route
          path="/items/view/:id"
          element={<ProductOverViewDashboard />}
        />


        {/* =================================================
                    TAX MASTER
            ================================================= */}

        <Route
          path="/settings/taxes"
          element={<TaxMasterDashboard />}
        />


        {/* =================================================
                    SIZES
            ================================================= */}

        <Route
          path="/settings/sizes"
          element={<SizesDashboard />}
        />

        <Route
          path="/settings/sizes/view/:id"
          element={<SizeProfileView />}
        />


        {/* =================================================
                    UNITS
            ================================================= */}

        <Route
          path="/settings/units"
          element={<UnitDashboard />}
        />

        <Route
          path="/settings/units/view/:id"
          element={<UnitProfileView />}
        />

        {/* =================================================
                    SUB CATEGORY
            ================================================= */}

        <Route
          path="/settings/subCategoires"
          element={<SubCategoryDashboard />}
        />


        {/* =================================================
                    CATEGORY
            ================================================= */}

        <Route
          path="/settings/categories"
          element={<CategoryDashboard />}
        />

        <Route
          path="/categories/view/:id"
          element={<CategoryProfileView />}
        />
        {/* =================================================
                    ROLE
            ================================================= */}

        <Route
          path="/settings/roles"
          element={<RoleDashboard />}
        />

        <Route
          path="/roles/view/:id"
          element={<RoleProfileOverview />}
        />


        {/* =================================================
                    USER
            ================================================= */}

        <Route
          path="/settings/users"
          element={<UserDashboard />}
        />

        <Route
          path="/users/view/:id"
          element={<UserProfileOverview />}
        />


        {/* =================================================
                    BANK ACCOUNT
            ================================================= */}

        <Route
          path="/settings/bankAccount"
          element={<BankAccountDashboard />}
        />

        <Route
          path="/settings/bankAccount/newSimple"
          element={<BankAccountCreateSimple />}
        />

        <Route
          path="/settings/bankAccount/editSimple/:id"
          element={<BankAccountCreateSimple />}
        />

        <Route
          path="/settings/bankAccount/view/:id"
          element={<BankAccountProfileOverview />}
        />


        {/* =================================================
                    COMPANY
            ================================================= */}

        <Route
          path="/settings/companies"
          element={<CompanyDashboard />}
        />

        <Route
          path="/settings/companies/view/:id"
          element={<CompanyProfileOverview />}
        />

        <Route
          path="/settings/companies/view/"
          element={<CompanyProfileOverview />}
        />

        <Route
          path="/settings/companies/newSimple"
          element={<CompanyCreateSimple />}

        />


        <Route
          path="/settings/companies/editSimple/:id"
          element={<CompanyCreateSimple />}
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
          element={<ServiceInvoice />}
        />

        <Route
          path="/invoices/sale/new"
          element={<SaleInvoice />}
        />

        <Route
          path="/invoices/product/edit/:id"
          element={<InvoiceCreate />}
        />

        <Route
          path="/invoices/service/edit/:id"
          element={<ServiceInvoice />}
        />

        <Route
          path="/invoices/sale/edit/:id"
          element={<SaleInvoice />}
        />

        <Route
          path="/invoices"
          element={<InvoiceDashboard />}
        />

        {/* <Route
          path="/invoices/view/:id"
          element={<InvoiceOverViewDashboard />}
        /> */}

        {/* <Route
          path="/invoices/view/:id"
          element={<InvoiceprofileOverview />}
        /> */}

        <Route
          path="/invoices/view/:id"
          element={<InvoiceOverViewDashboard1 />}
        />

        <Route
          path="/invoices/preview/:id"
          element={<InvoiceOverViewPreviewDashboard />}
        />

        {/* =================================================
                  EmailSignature
            ================================================= */}

        <Route
          path="/settings/emailSignatures"
          element={<EmailSignatureDashboard />}
        />

        <Route
          path="/settings/emailSignatures/newSimple"
          element={<EmailSignatureCreateSimple />}
        />
        <Route
          path="/settings/emailSignatures/edit/:id"
          element={<EmailSignatureCreateSimple />}
        />

        <Route
          path="/settings/emailSignatures/table"
          element={<EmailSignatureTable />}
        />


        {/* =================================================
                    SALES PERSON
            ================================================= */}

        <Route
          path="/salesPersons"
          element={<SalesPersonDashboard />}
        />

        <Route
          path="/salesPersons/newSimple"
          element={<SalesPersonCreateSimple />}
        />
        <Route
          path="/salesPersons/edit/:id"
          element={<SalesPersonCreateSimple />}
        />

        <Route
          path="/salesPersons/view/:id"
          element={<SalesPersonOverView />}
        />


        {/* =================================================
                   CURRENCY
            ================================================= */}

        <Route
          path="/settings/currencies"
          element={<CurrencyDashboard />}
        />

        <Route
          path="/settings/currencies/newSimple"
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
        // element={<CurrencyOverView />}
        />


        {/* =================================================
                    PARTY
            ================================================= */}

        <Route
          path="/parties"
          element={<PartyDashboard />}
        />

        <Route
          path="/parties/view/:id"
          element={<PartyProfileView />}
        />

        <Route
          path="/parties/newSimple"
          element={<PartyCreateSimple />}

        />


        <Route
          path="/parties/editSimple/:id"
          element={<PartyCreateSimple />}
        />


        {/* =================================================
                    CLEARANCE
            ================================================= */}


        <Route
          path="/clearances"
          element={<ClearanceDashboard />}

        />

        <Route
          path="/clearances/newSimple"
          element={<ClearanceCreateSimple />}

        />

        <Route
          path="/clearances/editSimple/:id"
          element={<ClearanceCreateSimple />}
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

        {/* =================================================
                    inventory
            ================================================= */}

        <Route
          path="/inventory"
          element={<InventoryDashbaord />}
        />

        <Route
          path="/inventory/openStock"
          element={<InventoryOpeningStock />}
        />


        <Route
          path="/inventory/adjustmentStock"
          element={<InventoryStockAdjustment />}
        />


        <Route
          path="/inventory/warehouses"
          element={<WarehouseDashboard />}
        />

        <Route
          path="/inventory/warehouses/newSimple"
          element={<WarehouseCreate />}
        />

        <Route
          path="/inventory/warehouses/edit/:id"
          element={<WarehouseCreate />}
        />

        {/* SaleOrder */}

        <Route
          path="/inventory/saleOrder/create"
          element={<SalesOrderCreate />}
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