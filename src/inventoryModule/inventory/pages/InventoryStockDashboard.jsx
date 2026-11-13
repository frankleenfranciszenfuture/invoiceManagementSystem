
import React, {
    useEffect,
    useMemo,
    useCallback,
} from "react";

import {
    useSelector,
    useDispatch,
} from "react-redux";

import {
    Package,
    Boxes,
    AlertTriangle,
    Warehouse,
    RefreshCw,
    PackagePlus,
    Home,
} from "lucide-react";

import toast from "react-hot-toast";

import InventoryStockTable from "../pages/InventoryStockTable";

import {
    clearInventoryErrors,
} from "../../slices/inventorySlice";

import {
    fetchAllStocks,
} from "../../thunks/inventoryThunk";

import {
    getUserPermission,
} from "../../../module/menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";
import { useNavigate } from "react-router-dom";
import ToolTipText from "../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

/* =========================================================
   NORMALIZE HELPERS
========================================================= */

const normalizeModule = (value) =>
    String(value ?? "").trim().toLowerCase();

const normalizeAction = (value) =>
    String(value ?? "").trim().toUpperCase();

/* =========================================================
   COMPONENT
========================================================= */

export default function InventoryStockDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) => state.auth?.authChecking === true
    );



    /* =====================================================
       PERMISSION STATE
    ===================================================== */

    const permissions = useSelector((state) => {
        const value = state.menuPermission?.userPermissions;
        return Array.isArray(value) ? value : EMPTY_ARRAY;
    });

    const permissionLoading = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoaded === true
    );

    /* =====================================================
       ROLE
    ===================================================== */

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole = normalizeAction(roleName);

    const hasFullAccess =
        normalizedRole === "SUPER_ADMIN" ||
        normalizedRole === "ADMIN";

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = useCallback(
        (moduleName, actionName) => {
            if (hasFullAccess) {
                return true;
            }

            if (!Array.isArray(permissions)) {
                return false;
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

                if (permission?.active === false) {
                    return false;
                }

                if (
                    normalizeAction(permission?.status) === "INACTIVE"
                ) {
                    return false;
                }

                if (Array.isArray(permission?.actions)) {
                    return permission.actions.some((action) => {
                        if (typeof action === "string") {
                            return (
                                normalizeAction(action) === requestedAction
                            );
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

                        if (action?.active === false) {
                            return false;
                        }

                        if (
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
        },
        [hasFullAccess, permissions]
    );

    /* =====================================================
       INVENTORY STOCK PERMISSIONS
    ===================================================== */

    const canViewStock = hasPermission(
        "Inventory Stocks",
        "VIEW"
    );

    /* =====================================================
       STOCK STATE
    ===================================================== */

    const stocksFromRedux = useSelector(
        (state) => state.inventory?.stocks
    );

    const stocks = Array.isArray(stocksFromRedux)
        ? stocksFromRedux
        : EMPTY_ARRAY;

    const stockLoading = useSelector(
        (state) => state.inventory?.stockLoading === true
    );

    const stockError = useSelector(
        (state) => state.inventory?.stockError
    );

    const stockPagination = useSelector(
        (state) => state.inventory?.stockPagination
    );

    /* =====================================================
       LOAD USER PERMISSIONS
    ===================================================== */

    useEffect(() => {
        if (authChecking || !isAuthenticated) {
            return;
        }

        if (hasFullAccess) {
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

    const pageNumber = stockPagination.pageNumber ?? 0;
    const pageSize = stockPagination.pageSize ?? 10;
    /* =====================================================
       FETCH STOCKS
    ===================================================== */

    useEffect(() => {
        if (
            !isAuthenticated ||
            authChecking ||
            (!hasFullAccess && (!permissionsLoaded || permissionLoading)) ||
            !canViewStock
        ) {
            return;
        }

        dispatch(
            fetchAllStocks({
                page: 0,
                size: 10,
            })
        );

    }, [
        isAuthenticated,
        authChecking,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        canViewStock,
        dispatch,
    ]);

    /* =====================================================
       STOCK OVERVIEW
    ===================================================== */

    const stockOverview = useMemo(() => {
        const totalQuantity = stocks.reduce(
            (total, stock) =>
                total + Number(stock?.quantity || 0),
            0
        );

        const totalReserved = stocks.reduce(
            (total, stock) =>
                total + Number(stock?.reservedQuantity || 0),
            0
        );

        const totalAvailable = stocks.reduce(
            (total, stock) =>
                total + Number(stock?.availableQuantity || 0),
            0
        );

        const zeroAvailable = stocks.filter(
            (stock) =>
                Number(stock?.availableQuantity || 0) <= 0
        ).length;

        return {
            totalRecords: stocks.length,
            totalQuantity,
            totalReserved,
            totalAvailable,
            zeroAvailable,
        };
    }, [stocks]);

    /* =====================================================
       CLEAR ERROR
    ===================================================== */

    useEffect(() => {
        if (!stockError) {
            return;
        }

        const timer = setTimeout(() => {
            dispatch(clearInventoryErrors());
        }, 3000);

        return () => clearTimeout(timer);

    }, [stockError, dispatch]);

    const refresh = () => {
        dispatch(
            fetchAllStocks({
                page: pageNumber,
                size: pageSize,
            })
        );
    };

    /* =====================================================
       AUTH CHECKING
    ===================================================== */

    if (authChecking) {
        return <InvoiceSkeleton />;
    }

    /* =====================================================
       NOT AUTHENTICATED
    ===================================================== */

    if (!isAuthenticated) {
        return null;
    }

    /* =====================================================
       PERMISSION LOADING
    ===================================================== */

    if (
        !hasFullAccess &&
        (permissionLoading || !permissionsLoaded)
    ) {
        return <InvoiceSkeleton />;
    }

    /* =====================================================
       VIEW PERMISSION DENIED
    ===================================================== */

    if (!canViewStock) {
        return (
            <div className="
                flex h-screen items-center justify-center
                bg-gray-50 font-sans
            ">
                <div className="px-6 text-center">
                    <div className="
                        mx-auto mb-4 flex h-16 w-16
                        items-center justify-center
                        rounded-full bg-red-50
                        text-2xl font-semibold text-red-500
                    ">
                        !
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                        You do not have permission to view inventory stocks.
                    </p>
                </div>
            </div>
        );
    }

    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <div className="
            flex h-screen overflow-hidden
            bg-gray-50 font-sans text-[13px]
        ">
            <div className="
                min-h-0 flex-1 overflow-y-auto bg-white
            ">
                <div className="w-full max-w-30xl px-2 py-5">

                    {/* PAGE HEADER */}

                    <div className="
                        mb-5 flex flex-wrap items-center
                        justify-between gap-3 px-2
                    ">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                className="
                        group
                        relative
                            flex
                            items-center
                            justify-center
                            rounded-md
                            border
                            border-blue-300
                            bg-white
                            px-2
                            text-[#0095FD]
                            transition
                            hover:bg-[#0095FD]/20
                        "
                                title="Home"
                            >
                                <Home size={18} />
                                <ToolTipText text="Home" position="bottom" />

                            </button>

                            <div>
                                <h1 className="text-xl font-semibold text-gray-800">
                                    Inventory Stocks
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    View and monitor product stock across warehouses.
                                </p>
                            </div>
                        </div>


                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={refresh}
                                disabled={stockLoading}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={16}
                                    className={stockLoading ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/inventory/openStock/create")
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-[#408DFB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
                            >
                                <PackagePlus size={17} />
                                Create openingStock
                            </button>
                        </div>
                    </div>

                    {/* STOCK OVERVIEW */}

                    <div className="
                        mb-5 grid grid-cols-1 gap-3
                        sm:grid-cols-2 xl:grid-cols-4
                    ">
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Records on this page
                                </p>

                                <Package className="text-blue-500" size={20} />
                            </div>

                            <p className="mt-3 text-2xl font-semibold text-gray-800">
                                {stockOverview.totalRecords}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Total Quantity
                                </p>

                                <Boxes className="text-indigo-500" size={20} />
                            </div>

                            <p className="mt-3 text-2xl font-semibold text-gray-800">
                                {stockOverview.totalQuantity.toLocaleString("en-IN", {
                                    maximumFractionDigits: 4,
                                })}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Reserved Quantity
                                </p>

                                <Warehouse className="text-orange-500" size={20} />
                            </div>

                            <p className="mt-3 text-2xl font-semibold text-gray-800">
                                {stockOverview.totalReserved.toLocaleString("en-IN", {
                                    maximumFractionDigits: 4,
                                })}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Zero Available Records
                                </p>

                                <AlertTriangle className="text-red-500" size={20} />
                            </div>

                            <p className="mt-3 text-2xl font-semibold text-gray-800">
                                {stockOverview.zeroAvailable}
                            </p>
                        </div>
                    </div>

                    {/* ERROR */}

                    {stockError && (
                        <div className="
                            mx-2 mt-4 rounded-md
                            border border-red-200
                            bg-red-50 px-4 py-3
                            text-sm text-red-600
                        ">
                            {stockError}
                        </div>
                    )}

                    {/* STOCK TABLE */}

                    {stockLoading && stocks.length === 0 ? (
                        <div className="
                            flex min-h-[250px]
                            items-center justify-center
                        ">
                            <p className="text-sm text-gray-500">
                                Loading inventory stocks...
                            </p>
                        </div>
                    ) : stocks.length > 0 ? (
                        <InventoryStockTable stocks={stocks} />
                    ) : (
                        <div className="
                            flex min-h-[400px] flex-col
                            items-center justify-center gap-3 px-4
                        ">
                            <div className="
                                flex h-24 w-24 items-center
                                justify-center rounded-full bg-gray-100
                            ">
                                <Package
                                    size={42}
                                    strokeWidth={1.7}
                                    className="text-gray-400"
                                />
                            </div>

                            <p className="text-center text-base font-medium text-gray-800">
                                No inventory stock available
                            </p>

                            <p className="max-w-sm text-center text-sm text-gray-500">
                                Opening stock and inventory movements will
                                appear here once stock records are created.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
