
import React, { useEffect, useMemo } from "react";

import { useSelector, useDispatch } from "react-redux";

import {
    Plus,
    Download,
    ShoppingCart,
} from "lucide-react";

import toast from "react-hot-toast";

import SaleOrderTable from "../pages/SaleOrderTable";
import NavbarSaleOrder from "../components/nav/NavbarSaleOrder";

import {
    setSalesOrderStatus,
    setSelectedSalesOrderView,
} from "../slices/saleOrderViewSlice";

import { clearSalesOrderError } from "../slices/salesOrderSlice";

import { openModal } from "../../../../module/ui/uiSlice";

import {
    getUserPermission,
} from "../../../../module/menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton from "../../../../common/loader/InvoiceSkeleton";
import SalesOrderOverview from "./SalesOrderOverview";


export default function SaleOrderDashboard() {
    const dispatch = useDispatch();

    // ============================================================
    // AUTH STATE
    // ============================================================

    const user = useSelector((state) => state.auth?.user);

    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) => state.auth?.authChecking === true
    );

    // ============================================================
    // PERMISSION STATE
    // ============================================================

    const permissions = useSelector((state) =>
        Array.isArray(state.menuPermission?.userPermissions)
            ? state.menuPermission.userPermissions
            : []
    );

    const permissionLoading = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoaded === true
    );

    // ============================================================
    // NORMALIZE HELPERS
    // ============================================================

    const normalizeModule = (value) =>
        String(value ?? "").trim().toLowerCase();

    const normalizeAction = (value) =>
        String(value ?? "").trim().toUpperCase();

    // ============================================================
    // ROLE
    // ============================================================

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole = normalizeAction(roleName);

    const isSuperAdmin = normalizedRole === "SUPER_ADMIN";
    const isAdmin = normalizedRole === "ADMIN";

    const hasFullAccess = isSuperAdmin || isAdmin;

    // ============================================================
    // HAS PERMISSION
    // ============================================================

    const hasPermission = (moduleName, actionName) => {
        if (hasFullAccess) {
            return true;
        }

        const requestedModule = normalizeModule(moduleName);
        const requestedAction = normalizeAction(actionName);

        return permissions.some((permission) => {
            const permissionModule = normalizeModule(
                permission?.moduleName ||
                permission?.module?.moduleName ||
                permission?.module?.name ||
                ""
            );

            if (permissionModule !== requestedModule) {
                return false;
            }

            if (
                permission?.active === false ||
                normalizeAction(permission?.status) === "INACTIVE"
            ) {
                return false;
            }

            if (Array.isArray(permission?.actions)) {
                return permission.actions.some((action) => {
                    if (typeof action === "string") {
                        return normalizeAction(action) === requestedAction;
                    }

                    const permissionAction = normalizeAction(
                        action?.actionName ||
                        action?.action?.actionName ||
                        action?.action?.name ||
                        action?.name ||
                        ""
                    );

                    const allowed =
                        action?.allowed === true ||
                        action?.allowed === "true";

                    if (
                        action?.active === false ||
                        normalizeAction(action?.status) === "INACTIVE"
                    ) {
                        return false;
                    }

                    return (
                        permissionAction === requestedAction &&
                        allowed
                    );
                });
            }

            const permissionAction = normalizeAction(
                permission?.actionName ||
                permission?.action?.actionName ||
                permission?.action?.name ||
                ""
            );

            const allowed =
                permission?.allowed === true ||
                permission?.allowed === "true";

            return (
                permissionAction === requestedAction &&
                allowed
            );
        });
    };

    // ============================================================
    // SALES ORDER PERMISSIONS
    // ============================================================

    const canViewSalesOrder = hasPermission("Sales Orders", "VIEW");
    const canCreateSalesOrder = hasPermission("Sales Orders", "CREATE");

    // ============================================================
    // SALES ORDER REDUX STATE
    // Supports either state.saleOrder or state.salesOrder.
    // ============================================================

    const salesOrders = useSelector(
        (state) => state.salesOrder?.salesOrders || []
    );

    const loading = useSelector(
        (state) => state.salesOrder?.loading || false
    );

    const error = useSelector(
        (state) => state.salesOrder?.error || null
    );


    // ============================================================
    // SALES ORDER FILTER STATE
    // ============================================================

    const salesOrderStatus = useSelector(
        (state) => state.saleOrderView?.salesOrderStatus || "ALL"
    );

    // ============================================================
    // LOAD USER PERMISSIONS
    // ============================================================

    useEffect(() => {
        if (authChecking || !isAuthenticated || hasFullAccess) {
            return;
        }

        if (permissionsLoaded || permissionLoading) {
            return;
        }

        dispatch(getUserPermission());
    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);



    // ============================================================
    // URL STATUS → REDUX
    // ============================================================

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlStatus = params.get("salesOrderStatus");

        if (!urlStatus) {
            return;
        }

        const normalizedStatus = urlStatus.trim().toUpperCase();

        const statusLabels = {
            ALL: "All Sales Orders",
            DRAFT: "Draft Sales Orders",
            CONFIRMED: "Confirmed Sales Orders",
            DISPATCHED: "Dispatched Sales Orders",
            CANCELLED: "Cancelled Sales Orders",
        };

        if (!statusLabels[normalizedStatus]) {
            return;
        }

        dispatch(setSalesOrderStatus(normalizedStatus));
        dispatch(
            setSelectedSalesOrderView(statusLabels[normalizedStatus])
        );
    }, [dispatch]);

    // ============================================================
    // CLEAR ERROR
    // ============================================================

    useEffect(() => {
        if (!error) {
            return;
        }

        const timer = setTimeout(() => {
            dispatch(clearSalesOrderError());
        }, 3000);

        return () => clearTimeout(timer);
    }, [error, dispatch]);

    // ============================================================
    // FILTER SALES ORDERS
    // API RESPONSE USES "status", SO SUPPORT BOTH FIELD NAMES.
    // ============================================================

    const filteredSalesOrders = useMemo(() => {
        const selectedStatus = String(salesOrderStatus || "ALL")
            .trim()
            .toUpperCase();

        if (selectedStatus === "ALL") {
            return salesOrders;
        }

        return salesOrders.filter((order) => {
            const orderStatus = String(
                order?.status || order?.salesOrderStatus || ""
            )
                .trim()
                .toUpperCase();

            return orderStatus === selectedStatus;
        });
    }, [salesOrders, salesOrderStatus]);

    // ============================================================
    // CREATE SALES ORDER
    // ============================================================

    const handleCreateSalesOrder = () => {
        if (!isAuthenticated) {
            return;
        }

        if (
            !hasFullAccess &&
            (permissionLoading || !permissionsLoaded)
        ) {
            return;
        }

        if (!canCreateSalesOrder) {
            toast.error(
                "You do not have permission to create sales orders."
            );
            return;
        }

        dispatch(openModal({ type: "addSaleOrder" }));
    };

    // ============================================================
    // AUTH CHECKING
    // ============================================================

    if (authChecking) {
        return <InvoiceSkeleton />;
    }

    if (!isAuthenticated) {
        return null;
    }

    // ============================================================
    // PERMISSION LOADING
    // ============================================================

    if (
        !hasFullAccess &&
        (permissionLoading || !permissionsLoaded)
    ) {
        return <InvoiceSkeleton />;
    }

    // ============================================================
    // VIEW PERMISSION DENIED
    // ============================================================

    if (!canViewSalesOrder) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 font-sans">
                <div className="px-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-semibold text-red-500">
                        !
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                        You do not have permission to view sales orders.
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // INITIAL SALES ORDER LOADING
    // ============================================================

    if (loading && salesOrders.length === 0) {
        return <InvoiceSkeleton />;
    }

    // ============================================================
    // PAGE
    // ============================================================

    {/* PAGE */ }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-[13px]">
            <div className="min-h-0 flex-1 overflow-y-auto bg-white">
                <div className="w-full max-w-30xl px-2 py-5">

                    <NavbarSaleOrder />

                    {/* SALES ORDER OVERVIEW */}
                    <SalesOrderOverview
                        canViewSalesOrder={canViewSalesOrder}
                        isAuthenticated={isAuthenticated}
                        authChecking={authChecking}
                    />

                    {error && (
                        <div className="mx-2 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {typeof error === "string"
                                ? error
                                : error?.message || "Unable to load sales orders."}
                        </div>
                    )}

                    {/* EXISTING TABLE / EMPTY STATE */}
                    <div className="mt-2">
                        {filteredSalesOrders.length > 0 ? (
                            <SaleOrderTable
                                salesOrders={filteredSalesOrders}
                            />
                        ) : (
                            // Keep your existing empty state here
                            <div>
                                {/* Your existing empty state JSX */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}