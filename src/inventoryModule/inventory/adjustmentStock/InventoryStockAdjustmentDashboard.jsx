
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    ClipboardList,
    PackagePlus,
    RefreshCw,
    ShieldAlert,
} from "lucide-react";

import { fetchAllInventoryTransactions } from "../../thunks/inventoryThunk";
import InventoryStockAdjustmentTable from "../adjustmentStock/InventoryStockAdjustmentTable";

import { getUserPermission } from "../../../module/menuPermission/thunks/menuPermissionThunks";
import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

const ADJUSTMENT_TYPES = [
    "STOCK_ADJUSTMENT_IN",
    "STOCK_ADJUSTMENT_OUT",
];

const normalizeRole = (user) => {
    const role =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    return String(role).toUpperCase();
};

const hasPermission = (permissions, moduleName, actionName) => {
    if (!Array.isArray(permissions)) return false;

    const modulePermission = permissions.find((permission) => {
        const name =
            permission?.moduleName ||
            permission?.module?.moduleName ||
            permission?.name;

        return String(name || "").toLowerCase() === moduleName.toLowerCase();
    });

    if (!modulePermission) return false;

    const actions =
        modulePermission.actions ||
        modulePermission.permissions ||
        modulePermission.moduleActions ||
        [];

    return Array.isArray(actions) && actions.some((action) => {
        const name =
            typeof action === "string"
                ? action
                : action?.actionName ||
                action?.name ||
                action?.action?.actionName;

        const allowed =
            typeof action === "string" ||
            (
                action?.allowed !== false &&
                action?.active !== false &&
                String(action?.status || "ACTIVE").toUpperCase() !== "INACTIVE"
            );

        return (
            String(name || "").toUpperCase() === actionName.toUpperCase() &&
            allowed
        );
    });
};

const SummaryCard = ({ title, value, description, icon: Icon, iconClass }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-800">{value}</h3>
                <p className="mt-1 text-xs text-gray-400">{description}</p>
            </div>

            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                <Icon size={21} />
            </div>
        </div>
    </div>
);

const InventoryStockAdjustmentDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        transactions = [],
        transactionLoading = false,
        transactionError = null,
        transactionPagination = {},
    } = useSelector((state) => state.inventory || {});

    const authState = useSelector((state) => state.auth || {});
    const permissionState = useSelector((state) => state.menuPermission || {});

    const user = authState.user;
    const isAuthenticated = authState.isAuthenticated;
    const authChecking = authState.authChecking;

    const userPermissions = permissionState.userPermissions || [];
    const userPermissionsLoading =
        permissionState.userPermissionsLoading ?? false;
    const userPermissionsLoaded =
        permissionState.userPermissionsLoaded ?? false;

    const role = normalizeRole(user);
    const isFullAccess = role === "SUPER_ADMIN" || role === "ADMIN";

    const canView =
        isFullAccess ||
        hasPermission(userPermissions, "Inventory", "VIEW");

    const permissionLoading =
        !isFullAccess &&
        !userPermissionsLoaded &&
        userPermissionsLoading;

    const permissionResolved = isFullAccess || userPermissionsLoaded;

    const pageNumber = transactionPagination.pageNumber ?? 0;
    const pageSize = transactionPagination.pageSize ?? 10;

    useEffect(() => {
        if (
            isAuthenticated &&
            !isFullAccess &&
            !userPermissionsLoaded &&
            !userPermissionsLoading
        ) {
            dispatch(getUserPermission());
        }
    }, [
        dispatch,
        isAuthenticated,
        isFullAccess,
        userPermissionsLoaded,
        userPermissionsLoading,
    ]);

    useEffect(() => {
        if (isAuthenticated && permissionResolved && canView) {
            dispatch(
                fetchAllInventoryTransactions({
                    page: 0,
                    size: pageSize,
                })
            );
        }
    }, [dispatch, isAuthenticated, permissionResolved, canView, pageSize]);

    const adjustmentTransactions = useMemo(
        () =>
            transactions.filter((transaction) =>
                ADJUSTMENT_TYPES.includes(transaction.movementType)
            ),
        [transactions]
    );

    const summary = useMemo(() => {
        const increaseTransactions = adjustmentTransactions.filter(
            (transaction) =>
                transaction.movementType === "STOCK_ADJUSTMENT_IN"
        );

        const decreaseTransactions = adjustmentTransactions.filter(
            (transaction) =>
                transaction.movementType === "STOCK_ADJUSTMENT_OUT"
        );

        const totalIn = increaseTransactions.reduce(
            (total, transaction) =>
                total + Number(transaction.quantityIn || 0),
            0
        );

        const totalOut = decreaseTransactions.reduce(
            (total, transaction) =>
                total + Number(transaction.quantityOut || 0),
            0
        );

        return {
            total: adjustmentTransactions.length,
            increases: increaseTransactions.length,
            decreases: decreaseTransactions.length,
            netQuantity: totalIn - totalOut,
        };
    }, [adjustmentTransactions]);

    const refresh = () => {
        dispatch(
            fetchAllInventoryTransactions({
                page: pageNumber,
                size: pageSize,
            })
        );
    };

    if (authChecking || permissionLoading || !permissionResolved) {
        return <InvoiceSkeleton />;
    }

    if (!isAuthenticated || !canView) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-6">
                <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <ShieldAlert size={26} />
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        You do not have permission to view stock adjustments.
                        Please contact your administrator.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mt-5 rounded-lg bg-[#408DFB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-5">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">
                        Stock Adjustments
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Monitor stock increases and decreases across your inventory.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={refresh}
                        disabled={transactionLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={transactionLoading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/inventory/adjustmentStock/create")
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-[#408DFB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
                    >
                        <PackagePlus size={17} />
                        Create Adjustment
                    </button>
                </div>
            </div>

            {transactionError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {transactionError}
                </div>
            )}

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Adjustments on Page"
                    value={summary.total}
                    description="Increase and decrease entries"
                    icon={ClipboardList}
                    iconClass="bg-blue-50 text-blue-600"
                />

                <SummaryCard
                    title="Stock Increases"
                    value={summary.increases}
                    description="Adjustment-in transactions"
                    icon={ArrowDownToLine}
                    iconClass="bg-green-50 text-green-600"
                />

                <SummaryCard
                    title="Stock Decreases"
                    value={summary.decreases}
                    description="Adjustment-out transactions"
                    icon={ArrowUpFromLine}
                    iconClass="bg-orange-50 text-orange-600"
                />

                <SummaryCard
                    title="Net Quantity"
                    value={summary.netQuantity.toLocaleString("en-IN", {
                        maximumFractionDigits: 4,
                    })}
                    description="Quantity in minus quantity out"
                    icon={PackagePlus}
                    iconClass="bg-purple-50 text-purple-600"
                />
            </div>

            <InventoryStockAdjustmentTable />
        </div>
    );
};

export default InventoryStockAdjustmentDashboard;
