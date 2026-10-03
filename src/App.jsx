
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { checkAuthentication } from "./module/auth/slice/authSlice";

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
import CustomerOverViewDashboard from "./module/customer/overviewCard/CustomerOverViewDashboard";

// =====================================================
// PRODUCTS / ITEMS
// =====================================================

import ProductDashboard from "./module/items/pages/productDashboard";
import ProductTable from "./module/items/pages/ProductTable";

// =====================================================
// TAX MASTER
// =====================================================

import TaxMasterDashboard from "./module/taxMaster/pages/TaxMasterDashboard";
import SizesDashboard from "./module/sizes/pages/SizesDashboard";
import UnitDashboard from "./module/units/pages/UnitDashboard";
import SubCategoryDashboard from "./module/subCategory/pages/SubCategoryDashboard";
import CategoryDashboard from "./module/category/pages/CategoryDashboard";
import ProductOverViewDashboard from "./module/items/overviewCard/ProductOverViewDashboard";
import InvoiceCreate from "./module/invoices/pages/InvoiceCreate";
import InvoiceDashboard from "./module/invoices/pages/InvoiceDashboard";
import InvoiceOverViewDashboard from "./module/invoices/overviewCard/InvoiceOverViewDashboard";
import RoleDashboard from "./module/role/pages/RoleDashboard";
import GlobalModalToast from "./common/toast/GlobalModalToast";
import BankAccountDashboard from "./module/bankAccount/pages/BankAccountDashboard";
import CompanyDashboard from "./module/company/pages/CompanyDashboard";
import ProductCreate from "./module/items/pages/ProductCreate";
import ProductCreateSimple from "./module/items/pages/ProductCreateSimple";
import CompanyOverViewDashboard from "./module/company/overviewCard/CompanyOverViewDashboard";
import UserDashboard from "./module/users/pages/UserDashboard";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthentication());
  }, [dispatch]);

  return (
    <BrowserRouter>

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
            path="/customers/new"
            element={<CreateCustomer />}
          />

          <Route
            path="/customers/edit/:id"
            element={<EditCustomer />}
          />

          <Route
            path="/customers/view/:id"
            element={<CustomerOverViewDashboard />}
          />

          {/* =================================================
                        PRODUCTS / ITEMS
                    ================================================= */}

          <Route
            path="/items"
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
            path="/taxes"
            element={<TaxMasterDashboard />}
          />


          {/* =================================================
                        Sizes
              ================================================= */}

          <Route
            path="/sizes"
            element={<SizesDashboard />}
          />


          {/* =================================================
                        Units
              ================================================= */}

          <Route
            path="/units"
            element={<UnitDashboard />}
          />


          {/* =================================================
                        SubCategory
              ================================================= */}

          <Route
            path="/subCategoires"
            element={<SubCategoryDashboard />}
          />


          {/* =================================================
                        Category
              ================================================= */}

          <Route
            path="/categories"
            element={<CategoryDashboard />}
          />


          {/* =================================================
                        Role
              ================================================= */}

          <Route
            path="/roles"
            element={<RoleDashboard />}
          />



          {/* =================================================
                        User
              ================================================= */}

          <Route
            path="/users"
            element={<UserDashboard />}
          />


          {/* =================================================
                        BankAccount
              ================================================= */}

          <Route
            path="/bankAccount"
            element={<BankAccountDashboard />}
          />


          {/* =================================================
                        Company
              ================================================= */}

          <Route
            path="/companies"
            element={<CompanyDashboard />}
          />

          <Route
            path="/companies/view/:id"
            element={<CompanyOverViewDashboard />}
          />

          {/* =================================================
                        Invoices
              ================================================= */}

          <Route
            path="/invoices/new"
            element={<InvoiceCreate />}
          />

          <Route
            path="/invoices/edit/:id"
            element={<InvoiceCreate />}
          />


          <Route
            path="/invoices"
            element={<InvoiceDashboard />}
          />

          <Route
            path="/invoices/view/:id"
            element={<InvoiceOverViewDashboard />}
          />

        </Route>

      </Routes>

      {/* =====================================================
                  GLOBAL MODAL TOAST
          ===================================================== */}

      {/* <GlobalModalToast /> */}

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
