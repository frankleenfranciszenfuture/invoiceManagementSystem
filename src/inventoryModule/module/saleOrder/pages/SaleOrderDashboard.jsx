
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Download, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

import SaleOrderTable from "../pages/SaleOrderTable";
import NavbarSaleOrder from "../components/nav/NavbarSaleOrder";

import { setSalesOrderStatus, setSelectedSalesOrderView } from "../slices/saleOrderViewSlice";
import { clearSalesOrderError } from "../slices/salesOrderSlice";

import { openModal } from "../../../../module/ui/uiSlice";
import { getUserPermission } from "../../../../module/menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton from "../../../../common/loader/InvoiceSkeleton";
import SalesOrderOverview from "./SalesOrderOverview";
import { useNavigate } from "react-router-dom";

export default function SaleOrderDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // AUTH STATE
    const user = useSelector((state) => state.auth?.user);

    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) => state.auth?.authChecking === true
    );

    // PERMISSION STATE
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

    // NORMALIZE HELPERS
    const normalizeModule = (value) =>
        String(value ?? "").trim().toLowerCase();

    const normalizeAction = (value) =>
        String(value ?? "").trim().toUpperCase();

    // ROLE
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

    // HAS PERMISSION
    const hasPermission = (moduleName, actionName) => {
        if (hasFullAccess) return true;

        const requestedModule = normalizeModule(moduleName);
        const requestedAction = normalizeAction(actionName);

        return permissions.some((permission) => {
            const permissionModule = normalizeModule(
                permission?.moduleName ||
                permission?.module?.moduleName ||
                permission?.module?.name ||
                ""
            );

            if (permissionModule !== requestedModule) return false;

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

    // SALES ORDER PERMISSIONS
    const canViewSalesOrder = hasPermission("Sales Orders", "VIEW");
    const canCreateSalesOrder = hasPermission("Sales Orders", "CREATE");

    // SALES ORDER REDUX STATE
    const salesOrders = useSelector(
        (state) => state.salesOrder?.salesOrders || []
    );

    const loading = useSelector(
        (state) => state.salesOrder?.loading || false
    );

    const error = useSelector(
        (state) => state.salesOrder?.error || null
    );

    const pagination = useSelector(
        (state) => state.salesOrder?.pagination || {}
    );

    // LOAD USER PERMISSIONS
    useEffect(() => {
        if (authChecking || !isAuthenticated || hasFullAccess) return;

        if (permissionsLoaded || permissionLoading) return;

        dispatch(getUserPermission());
    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    // CLEAR ERROR
    useEffect(() => {
        if (!error) return;

        const timer = setTimeout(() => {
            dispatch(clearSalesOrderError());
        }, 3000);

        return () => clearTimeout(timer);
    }, [error, dispatch]);

    // CREATE SALES ORDER
    const handleCreateSalesOrder = () => {
        if (!isAuthenticated) return;

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

        // dispatch(openModal({ type: "addSaleOrder" }));
        navigate("/inventory/salesOrder/create");
    };

    // AUTH CHECKING
    if (authChecking) {
        return <InvoiceSkeleton />;
    }

    if (!isAuthenticated) {
        return null;
    }

    // PERMISSION LOADING
    if (
        !hasFullAccess &&
        (permissionLoading || !permissionsLoaded)
    ) {
        return <InvoiceSkeleton />;
    }

    // VIEW PERMISSION DENIED
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

    // INITIAL SALES ORDER LOADING

    <div className="mt-2">
        {loading ? (
            <InvoiceSkeleton />
        ) : salesOrders.length > 0 ? (
            <SaleOrderTable
                salesOrders={salesOrders}
            />
        ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                    <ShoppingCart
                        size={28}
                        className="text-blue-500"
                    />
                </div>

                <h3 className="text-base font-semibold text-gray-800">
                    No Sales Orders Found
                </h3>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                    No sales orders are available for the selected filters.
                </p>

                {canCreateSalesOrder && (
                    <button
                        type="button"
                        onClick={handleCreateSalesOrder}
                        className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        Create Sales Order
                    </button>
                )}
            </div>
        )}
    </div>


    // PAGE
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-[13px]">
            <div className="min-h-0 flex-1 overflow-y-auto bg-white">
                <div className="w-full max-w-30xl px-2 py-5">

                    <NavbarSaleOrder />

                    <SalesOrderOverview
                        salesOrders={salesOrders}
                        pagination={pagination}
                        loading={loading}
                    />

                    {error && (
                        <div className="mx-2 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {typeof error === "string"
                                ? error
                                : error?.message ||
                                "Unable to load sales orders."}
                        </div>
                    )}

                    <div className="mt-2">
                        {salesOrders.length > 0 ? (
                            <SaleOrderTable
                                salesOrders={salesOrders}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                                    <ShoppingCart
                                        size={28}
                                        className="text-blue-500"
                                    />
                                </div>

                                <h3 className="text-base font-semibold text-gray-800">
                                    No Sales Orders Found
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-gray-500">
                                    No sales orders are available for the
                                    selected filters.
                                </p>

                                {canCreateSalesOrder && (
                                    <button
                                        type="button"
                                        onClick={handleCreateSalesOrder}
                                        className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                    >
                                        <Plus size={16} />
                                        Create Sales Order
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
