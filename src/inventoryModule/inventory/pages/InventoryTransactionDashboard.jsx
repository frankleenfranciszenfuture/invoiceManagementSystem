
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
    ArrowLeftRight,
    ArrowDownToLine,
    ArrowUpFromLine,
    History,
} from "lucide-react";

import InventoryTransactionTable from "../pages/InventoryTransactionTable";

import {
    clearInventoryErrors,
} from "../../slices/inventorySlice";

import {
    fetchAllInventoryTransactions,
} from "../../thunks/inventoryThunk";

import {
    getUserPermission,
} from "../../../module/menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

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

export default function InventoryTransactionDashboard() {
    const dispatch = useDispatch();

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
       TRANSACTION PERMISSIONS
    ===================================================== */

    const canViewTransaction = hasPermission(
        "Inventory Transactions",
        "VIEW"
    );

    /* =====================================================
       TRANSACTION STATE
    ===================================================== */

    const transactionsFromRedux = useSelector(
        (state) => state.inventory?.transactions
    );

    const transactions = Array.isArray(transactionsFromRedux)
        ? transactionsFromRedux
        : EMPTY_ARRAY;

    const transactionLoading = useSelector(
        (state) => state.inventory?.transactionLoading === true
    );

    const transactionError = useSelector(
        (state) => state.inventory?.transactionError
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

    /* =====================================================
       FETCH TRANSACTIONS
    ===================================================== */

    useEffect(() => {
        if (
            !isAuthenticated ||
            authChecking ||
            (!hasFullAccess && (!permissionsLoaded || permissionLoading)) ||
            !canViewTransaction
        ) {
            return;
        }

        dispatch(
            fetchAllInventoryTransactions({
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
        canViewTransaction,
        dispatch,
    ]);

    /* =====================================================
       TRANSACTION OVERVIEW
    ===================================================== */

    const transactionOverview = useMemo(() => {
        const totalIn = transactions.reduce(
            (total, transaction) =>
                total + Number(transaction?.quantityIn || 0),
            0
        );

        const totalOut = transactions.reduce(
            (total, transaction) =>
                total + Number(transaction?.quantityOut || 0),
            0
        );

        const movementTypes = new Set(
            transactions
                .map((transaction) => transaction?.movementType)
                .filter(Boolean)
        );

        return {
            totalRecords: transactions.length,
            totalIn,
            totalOut,
            movementTypes: movementTypes.size,
        };
    }, [transactions]);

    /* =====================================================
       CLEAR ERROR
    ===================================================== */

    useEffect(() => {
        if (!transactionError) {
            return;
        }

        const timer = setTimeout(() => {
            dispatch(clearInventoryErrors());
        }, 3000);

        return () => clearTimeout(timer);

    }, [transactionError, dispatch]);

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

    if (!canViewTransaction) {
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
                        You do not have permission to view inventory transactions.
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
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800">
                                Inventory Transactions
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Track stock movements and inventory history.
                            </p>
                        </div>
                    </div>

                    {/* TRANSACTION OVERVIEW */}

                    <div className="
                        mb-5 grid grid-cols-1 gap-3
                        sm:grid-cols-2 xl:grid-cols-4
                    ">
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Records on this page
                                </p>

                                <History className="text-blue-500" size={20} />
                            </div>

                            <p className="mt-3 text-2xl font-semibold text-gray-800">
                                {transactionOverview.totalRecords}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Quantity In
                                </p>

                                <ArrowDownToLine className="text-green-500" size={20} />
                            </div>

                            <p className="mt-3 text-2xl font-semibold text-gray-800">
                                {transactionOverview.totalIn.toLocaleString("en-IN", {
                                    maximumFractionDigits: 4,
                                })}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Quantity Out
                                </p>

                                <ArrowUpFromLine className="text-orange-500" size={20} />
                            </div>

                            <p className="mt-3 text-2xl font-semibold text-gray-800">
                                {transactionOverview.totalOut.toLocaleString("en-IN", {
                                    maximumFractionDigits: 4,
                                })}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Movement Types
                                </p>

                                <ArrowLeftRight className="text-purple-500" size={20} />
                            </div>

                            <p className="mt-3 text-2xl font-semibold text-gray-800">
                                {transactionOverview.movementTypes}
                            </p>
                        </div>
                    </div>

                    {/* ERROR */}

                    {transactionError && (
                        <div className="
                            mx-2 mt-4 rounded-md
                            border border-red-200
                            bg-red-50 px-4 py-3
                            text-sm text-red-600
                        ">
                            {transactionError}
                        </div>
                    )}

                    {/* TRANSACTION TABLE */}

                    {transactionLoading && transactions.length === 0 ? (
                        <div className="
                            flex min-h-[250px]
                            items-center justify-center
                        ">
                            <p className="text-sm text-gray-500">
                                Loading inventory transactions...
                            </p>
                        </div>
                    ) : transactions.length > 0 ? (
                        <InventoryTransactionTable
                            transactions={transactions}
                        />
                    ) : (
                        <div className="
                            flex min-h-[400px] flex-col
                            items-center justify-center gap-3 px-4
                        ">
                            <div className="
                                flex h-24 w-24 items-center
                                justify-center rounded-full bg-gray-100
                            ">
                                <ArrowLeftRight
                                    size={42}
                                    strokeWidth={1.7}
                                    className="text-gray-400"
                                />
                            </div>

                            <p className="text-center text-base font-medium text-gray-800">
                                No inventory transactions available
                            </p>

                            <p className="max-w-sm text-center text-sm text-gray-500">
                                Opening stock, stock adjustments, and other
                                inventory movements will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
