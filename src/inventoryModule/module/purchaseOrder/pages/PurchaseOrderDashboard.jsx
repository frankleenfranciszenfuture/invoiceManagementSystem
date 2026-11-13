import React, { useEffect, useMemo } from "react";

import { useSelector, useDispatch } from "react-redux";

import {
    Plus,
    Download,
    ShoppingCart,
} from "lucide-react";

import toast from "react-hot-toast";

import PurchaseOrderTable from "../pages/PurchaseOrderTable";
import NavbarPurchaseOrder from "../components/nav/NavbarPurchaseOrder";

import {
    setPurchaseOrderStatus,
    setSelectedPurchaseOrderView,
} from "../slices/purchaseOrderViewSlice";

import { clearPurchaseOrderErrors } from "../slices/purchaseOrderSlice";

import { openModal } from "../../../../module/ui/uiSlice";

import {
    getUserPermission,
} from "../../../../module/menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton from "../../../../common/loader/InvoiceSkeleton";
import PurchaseOrderOverview from "./PurchaseOrderOverview";
import { useNavigate } from "react-router-dom";


export default function PurchaseOrderDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
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

    const pagination = useSelector(
        (state) => state.purchaseOrder?.pagination || {}
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
    // PURCHASE ORDER PERMISSIONS
    // ============================================================

    const canViewPurchaseOrder = hasPermission("Purchase Orders", "VIEW");
    const canCreatePurchaseOrder = hasPermission("Purchase Orders", "CREATE");

    // ============================================================
    // PURCHASE ORDER REDUX STATE
    // ============================================================

    const purchaseOrders = useSelector(
        (state) => state.purchaseOrder?.purchaseOrders || []
    );

    const loading = useSelector(
        (state) => state.purchaseOrder?.loading || false
    );

    const error = useSelector(
        (state) => state.purchaseOrder?.error || null
    );

    // ============================================================
    // PURCHASE ORDER FILTER STATE
    // ============================================================

    const purchaseOrderStatus = useSelector(
        (state) => state.purchaseOrderView?.purchaseOrderStatus || "ALL"
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
        const urlStatus = params.get("purchaseOrderStatus");

        if (!urlStatus) {
            return;
        }

        const normalizedStatus = urlStatus.trim().toUpperCase();

        const statusLabels = {
            ALL: "All Purchase Orders",
            DRAFT: "Draft Purchase Orders",
            CONFIRMED: "Confirmed Purchase Orders",
            PARTIALLY_RECEIVED: "Partially Received Purchase Orders",
            RECEIVED: "Received Purchase Orders",
            CANCELLED: "Cancelled Purchase Orders",
        };

        if (!statusLabels[normalizedStatus]) {
            return;
        }

        dispatch(setPurchaseOrderStatus(normalizedStatus));
        dispatch(
            setSelectedPurchaseOrderView(statusLabels[normalizedStatus])
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
            dispatch(clearPurchaseOrderErrors());
        }, 3000);

        return () => clearTimeout(timer);
    }, [error, dispatch]);

    // ============================================================
    // FILTER PURCHASE ORDERS
    // API RESPONSE USES "status", SO SUPPORT BOTH FIELD NAMES.
    // ============================================================

    const filteredPurchaseOrders = useMemo(() => {
        const selectedStatus = String(purchaseOrderStatus || "ALL")
            .trim()
            .toUpperCase();

        if (selectedStatus === "ALL") {
            return purchaseOrders;
        }

        return purchaseOrders.filter((order) => {
            const orderStatus = String(
                order?.status || order?.purchaseOrderStatus || ""
            )
                .trim()
                .toUpperCase();

            return orderStatus === selectedStatus;
        });
    }, [purchaseOrders, purchaseOrderStatus]);

    // ============================================================
    // CREATE PURCHASE ORDER
    // ============================================================

    const handleCreatePurchaseOrder = () => {
        if (!isAuthenticated) {
            return;
        }

        if (
            !hasFullAccess &&
            (permissionLoading || !permissionsLoaded)
        ) {
            return;
        }

        if (!canCreatePurchaseOrder) {
            toast.error(
                "You do not have permission to create purchase orders."
            );
            return;
        }

        // dispatch(openModal({ type: "addPurchaseOrder" }));
        navigate("/inventory/purchaseOrder/create");
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

    if (!canViewPurchaseOrder) {
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
                        You do not have permission to view purchase orders.
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // INITIAL PURCHASE ORDER LOADING
    // ============================================================

    if (loading && purchaseOrders.length === 0) {
        return <InvoiceSkeleton />;
    }

    // ============================================================
    // PAGE
    // ============================================================

    // return (
    //     <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-[13px]">
    //         <div className="min-h-0 flex-1 overflow-y-auto bg-white">
    //             <div className="w-full max-w-30xl px-2 py-5">

    //                 <NavbarPurchaseOrder />

    //                 {/* PURCHASE ORDER OVERVIEW */}
    //                 <PurchaseOrderOverview
    //                     canViewPurchaseOrder={canViewPurchaseOrder}
    //                     isAuthenticated={isAuthenticated}
    //                     authChecking={authChecking}
    //                 />

    //                 {error && (
    //                     <div className="mx-2 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
    //                         {typeof error === "string"
    //                             ? error
    //                             : error?.message || "Unable to load purchase orders."}
    //                     </div>
    //                 )}

    //                 {/* EXISTING TABLE / EMPTY STATE */}
    //                 <div className="mt-2">
    //                     {filteredPurchaseOrders.length > 0 ? (
    //                         <PurchaseOrderTable
    //                             purchaseOrders={filteredPurchaseOrders}
    //                         />
    //                     ) : (
    //                         // Keep your existing empty state here
    //                         <div>
    //                             {/* Your existing empty state JSX */}
    //                         </div>
    //                     )}
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // );


    // VIEW PERMISSION DENIED
    if (!canViewPurchaseOrder) {
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
        ) : purchaseOrders.length > 0 ? (
            <PurchaseOrderTable
                purchaseOrders={purchaseOrders}
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
                    No Purchase Orders Found
                </h3>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                    No purchase orders are available for the selected filters.
                </p>

                {canCreatePurchaseOrder && (
                    <button
                        type="button"
                        onClick={handleCreatePurchaseOrder}
                        className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        Create Purchase Order
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

                    <NavbarPurchaseOrder />

                    <PurchaseOrderOverview
                        purchaseOrders={purchaseOrders}
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
                        {purchaseOrders.length > 0 ? (
                            <PurchaseOrderTable
                                purchaseOrders={purchaseOrders}
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
                                    No Purchase Orders Found
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-gray-500">
                                    No purchase orders are available for the
                                    selected filters.
                                </p>

                                {canCreatePurchaseOrder && (
                                    <button
                                        type="button"
                                        onClick={handleCreatePurchaseOrder}
                                        className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                    >
                                        <Plus size={16} />
                                        Create Purchase Order
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
