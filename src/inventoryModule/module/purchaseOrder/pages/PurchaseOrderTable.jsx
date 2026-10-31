
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchAllPurchaseOrders,
    fetchPurchaseOrderById,
    deletePurchaseOrder,
    confirmPurchaseOrder,
} from "../thunks/purchaseOrderThunks";

import {
    setPurchaseOrder,
} from "../slices/purchaseOrderSlice";

import {
    Eye,
    Edit,
    Trash2,
    ShoppingCart,
    CalendarDays,
    Warehouse,
    UserRound,
    CheckCircle,
    PackageCheck,
} from "lucide-react";

import toast from "react-hot-toast";
import Pagination from "../../../../common/pagination/table/Pagination";
import { openModal } from "../../../../module/ui/uiSlice";

export default function PurchaseOrderTable({ purchaseOrders = [] }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    // Supports either reducer key: saleOrder or purchaseOrder.
    const purchaseOrderState = useSelector(
        (state) => state.purchaseOrder || {}
    );

    const {
        loading = false,
        error = null,
    } = purchaseOrderState;

    // Pagination is nested inside your purchaseOrderSlice.
    const pagination = purchaseOrderState.pagination || {};

    const pageNumber = pagination.pageNumber ?? 0;
    const pageSize = pagination.pageSize ?? 10;
    const totalPages = pagination.totalPages ?? 0;
    const totalElements = pagination.totalElements ?? 0;

    const currentPurchaseOrders = Array.isArray(purchaseOrders)
        ? purchaseOrders
        : [];

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector((state) => state.auth?.user);

    /* =====================================================
       PERMISSION STATE
    ===================================================== */

    const permissions = useSelector(
        (state) => state.menuPermission?.userPermissions || []
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

    const normalizedRole = String(roleName)
        .trim()
        .toUpperCase();

    const isSuperAdmin = normalizedRole === "SUPER_ADMIN";
    const isAdmin = normalizedRole === "ADMIN";

    const hasFullAccess = isSuperAdmin || isAdmin;

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = (moduleName, actionName) => {
        if (hasFullAccess) return true;

        if (!Array.isArray(permissions)) return false;

        const requestedModule = String(moduleName)
            .trim()
            .toLowerCase();

        const requestedAction = String(actionName)
            .trim()
            .toUpperCase();

        return permissions.some((permission) => {
            const permissionModule = String(
                permission?.moduleName ||
                permission?.module?.moduleName ||
                permission?.module?.name ||
                ""
            )
                .trim()
                .toLowerCase();

            if (permissionModule !== requestedModule) {
                return false;
            }

            if (permission?.active === false) {
                return false;
            }

            if (
                String(permission?.status || "")
                    .trim()
                    .toUpperCase() === "INACTIVE"
            ) {
                return false;
            }

            /* GROUPED ACTIONS */

            if (Array.isArray(permission?.actions)) {
                return permission.actions.some((action) => {
                    const permissionAction = String(
                        action?.actionName ||
                        action?.action?.actionName ||
                        action?.action?.name ||
                        ""
                    )
                        .trim()
                        .toUpperCase();

                    const allowed =
                        action?.allowed === true ||
                        action?.allowed === "true";

                    const actionActive =
                        action?.active !== false &&
                        String(action?.status || "")
                            .trim()
                            .toUpperCase() !== "INACTIVE";

                    return (
                        permissionAction === requestedAction &&
                        allowed &&
                        actionActive
                    );
                });
            }

            /* FLAT ACTION */

            const permissionAction = String(
                permission?.actionName ||
                permission?.action?.actionName ||
                permission?.action?.name ||
                ""
            )
                .trim()
                .toUpperCase();

            const allowed =
                permission?.allowed === true ||
                permission?.allowed === "true";

            return (
                permissionAction === requestedAction &&
                allowed
            );
        });
    };

    /* =====================================================
       PURCHASE ORDER PERMISSIONS
    ===================================================== */

    const canViewPurchaseOrder = hasPermission(
        "Purchase Orders",
        "VIEW"
    );

    const canEditPurchaseOrder = hasPermission(
        "Purchase Orders",
        "EDIT"
    );

    const canDeletePurchaseOrder = hasPermission(
        "Purchase Orders",
        "DELETE"
    );

    /* =====================================================
       ORDER STATUS
    ===================================================== */

    // Your API response uses "status".
    // purchaseOrderStatus is supported as a fallback.
    const getOrderStatus = (order) => {
        return String(
            order?.status ||
            order?.purchaseOrderStatus ||
            ""
        )
            .trim()
            .toUpperCase();
    };

    const statusColor = {
        DRAFT: "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-blue-100 text-blue-700",
        PARTIALLY_RECEIVED: "bg-amber-100 text-amber-700",
        RECEIVED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    };

    /* =====================================================
       CURRENCY FORMAT
    ===================================================== */

    const formatAmount = (amount, order) => {
        const value = Number(amount || 0);

        const currencyCode =
            order?.currency?.currencyCode ||
            order?.currencyCode ||
            "INR";

        try {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value);
        } catch {
            return `${currencyCode} ${value.toFixed(2)}`;
        }
    };

    /* =====================================================
       SUPPLIER NAME
    ===================================================== */

    const getSupplierName = (order) => {
        const supplier = order?.supplier || order?.party;

        return (
            supplier?.companyName ||
            supplier?.displayName ||
            supplier?.partyName ||
            [
                supplier?.firstName,
                supplier?.lastName,
            ]
                .filter(Boolean)
                .join(" ") ||
            order?.supplierName ||
            order?.partyName ||
            "—"
        );
    };

    /* =====================================================
       WAREHOUSE NAME
    ===================================================== */

    const getWarehouseName = (order) => {
        return (
            order?.warehouseName ||
            order?.warehouse?.warehouseName ||
            order?.warehouse?.name ||
            "—"
        );
    };

    /* =====================================================
       FETCH PURCHASE ORDERS
    ===================================================== */

    const refreshPurchaseOrders = (page = pageNumber, size = pageSize) => {
        dispatch(
            fetchAllPurchaseOrders({
                page: Number(page) || 0,
                size: Number(size) || 10,
            })
        );
    };

    /* =====================================================
       DELETE PURCHASE ORDER
    ===================================================== */

    const handleDelete = async (order) => {
        if (!canDeletePurchaseOrder) {
            toast.error(
                "You do not have permission to delete purchase orders."
            );
            return;
        }

        if (getOrderStatus(order) !== "DRAFT") {
            toast.error(
                "Only draft purchase orders can be deleted."
            );
            return;
        }

        if (!order?.id) {
            toast.error("Purchase order ID is missing.");
            return;
        }

        const confirmed = window.confirm(
            `Delete purchase order ${order?.orderNo || ""}?`
        );

        if (!confirmed) return;

        try {
            await dispatch(
                deletePurchaseOrder(order.id)
            ).unwrap();

            toast.success("Purchase order deleted successfully");

            refreshPurchaseOrders(pageNumber, pageSize);
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete purchase order"
            );
        }
    };

    /* =====================================================
       VIEW PURCHASE ORDER
    ===================================================== */

    const handleView = (order) => {
        if (!canViewPurchaseOrder) {
            toast.error(
                "You do not have permission to view purchase orders."
            );
            return;
        }

        if (!order?.id) {
            toast.error("Purchase order ID is missing.");
            return;
        }

        dispatch(setPurchaseOrder(order));

        navigate(`/inventory/purchaseOrder/view/${order.id}`);
    };

    /* =====================================================
       EDIT PURCHASE ORDER
    ===================================================== */

    const handleEdit = (order) => {
        if (!canEditPurchaseOrder) {
            toast.error(
                "You do not have permission to edit purchase orders."
            );
            return;
        }

        if (getOrderStatus(order) !== "DRAFT") {
            toast.error(
                "Only draft purchase orders can be edited."
            );
            return;
        }

        if (!order?.id) {
            toast.error("Purchase order ID is missing.");
            return;
        }

        dispatch(setPurchaseOrder(order));

        navigate(`/inventory/purchaseOrder/edit/${order.id}`);
    };


    const handleConfirmPurchaseOrder = async (order) => {
        try {
            await dispatch(confirmPurchaseOrder(order.id)).unwrap();

            toast.success("Purchase order confirmed successfully");

            // Refresh the current purchase order list
            dispatch(fetchAllPurchaseOrders({
                page: pagination?.page ?? 0,
                size: pagination?.size ?? 10,
            }));
        } catch (error) {
            toast.error(
                error?.message || "Failed to confirm purchase order"
            );
        }
    };

    /* =====================================================
   CREATE GOODS RECEIPT
===================================================== */

    const handleCreateGoodsReceipt = async (order) => {
        if (!order?.id) {
            toast.error("Purchase order ID is missing.");
            return;
        }

        const status = getOrderStatus(order);

        if (!["CONFIRMED", "PARTIALLY_RECEIVED"].includes(status)) {
            toast.error(
                "Goods receipt can only be created for confirmed purchase orders."
            );
            return;
        }

        try {
            // Fetch complete and latest purchase order details
            const purchaseOrderDetails = await dispatch(
                fetchPurchaseOrderById(order.id)
            ).unwrap();

            if (!purchaseOrderDetails?.items?.length) {
                toast.error("No purchase order items found.");
                return;
            }

            // Check whether any item has pending quantity
            const hasPendingItems = purchaseOrderDetails.items.some((item) => {
                const pending =
                    item.pendingQuantity ??
                    (
                        Number(item.quantity || 0) -
                        Number(item.receivedQuantity || 0)
                    );

                return Number(pending) > 0;
            });

            if (!hasPendingItems) {
                toast.error("All items have already been received.");
                return;
            }

            dispatch(
                openModal({
                    type: "createGoodsReceipt",
                    data: purchaseOrderDetails,
                })
            );

        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message || "Failed to load purchase order details."
            );
        }
    };

    /* =====================================================
       DATE FORMAT
    ===================================================== */

    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleDateString("en-IN");
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-gray-500">
                    Loading purchase orders...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
                <p className="text-red-500">
                    {typeof error === "string"
                        ? error
                        : error?.message || "Failed to load purchase orders"}
                </p>

                <button
                    type="button"
                    onClick={() => refreshPurchaseOrders()}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentPurchaseOrders.length) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                <p className="text-gray-500">
                    No purchase orders found.
                </p>
            </div>
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    return (
        <div className="overflow-x-auto overflow-y-visible rounded-xl border border-gray-200 bg-white">
            <table className="w-full">
                {/* TABLE HEADER */}

                <thead className="border-b border-gray-300 bg-[#FAF9F7]/20">
                    <tr>
                        {[
                            "Order No",
                            "Supplier",
                            "Warehouse",
                            "Order Date",
                            "Grand Total",
                            "Status",
                            "Actions",
                        ].map((header) => (
                            <th
                                key={header}
                                className={`
                                    whitespace-nowrap
                                    px-5 py-3
                                    text-md font-medium
                                    uppercase text-gray-400
                                    ${header === "Actions"
                                        ? "text-right"
                                        : "text-left"
                                    }
                                `}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* TABLE BODY */}

                <tbody>
                    {currentPurchaseOrders.map((order, index) => {
                        const status = getOrderStatus(order);
                        const isDraft = status === "DRAFT";

                        return (
                            <tr
                                key={order.id || index}
                                className="
                                    border-b border-gray-100
                                    text-xs
                                    transition-colors
                                    hover:bg-gray-50
                                "
                            >
                                {/* ORDER NUMBER */}

                                <td className="px-2 py-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div className="
                                            flex h-9 w-9 shrink-0
                                            items-center justify-center
                                            rounded-full
                                            bg-blue-50 text-blue-600
                                        ">
                                            <ShoppingCart size={17} />
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className="truncate font-medium text-gray-800"
                                                title={order?.orderNo || ""}
                                            >
                                                {order?.orderNo || "—"}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                ID: #{order?.id ?? "—"}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* CUSTOMER / PARTY */}

                                <td className="px-2 py-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <UserRound
                                            size={15}
                                            className="shrink-0 text-gray-400"
                                        />

                                        <div className="min-w-0">
                                            <p
                                                className="truncate font-medium text-gray-700"
                                                title={getSupplierName(order)}
                                            >
                                                {getSupplierName(order)}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {order?.partyType || order?.supplier?.partyType || order?.party?.partyType || "SUPPLIER"}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* WAREHOUSE */}

                                <td className="px-2 py-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <Warehouse
                                            size={15}
                                            className="shrink-0 text-gray-400"
                                        />

                                        <p
                                            className="truncate font-medium text-gray-700"
                                            title={getWarehouseName(order)}
                                        >
                                            {getWarehouseName(order)}
                                        </p>
                                    </div>
                                </td>

                                {/* ORDER DATE */}

                                <td className="whitespace-nowrap px-2 py-3">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays
                                            size={14}
                                            className="text-gray-400"
                                        />

                                        <span className="text-gray-700">
                                            {formatDate(order?.orderDate)}
                                        </span>
                                    </div>
                                </td>

                                {/* GRAND TOTAL */}

                                <td className="whitespace-nowrap px-2 py-3">
                                    <p className="font-semibold text-gray-800">
                                        {formatAmount(
                                            order?.grandTotal,
                                            order
                                        )}
                                    </p>
                                </td>

                                {/* STATUS */}

                                <td className="px-2 py-3">
                                    <span
                                        className={`
                                            inline-block rounded-full
                                            px-2 py-1
                                            text-xs font-medium
                                            ${statusColor[status] ||
                                            "bg-gray-100 text-gray-700"
                                            }
                                        `}
                                    >
                                        {status || "—"}
                                    </span>
                                </td>

                                {/* ACTIONS */}

                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">

                                        {/* RECEIVE GOODS */}
                                        {["CONFIRMED", "PARTIALLY_RECEIVED"].includes(status) && (
                                            <button
                                                type="button"
                                                onClick={() => handleCreateGoodsReceipt(order)}
                                                title="Create Goods Receipt"
                                                className="
            flex h-8 w-8
            items-center justify-center
            rounded-lg
            bg-green-50 text-green-600
            transition
            hover:bg-green-100
            hover:text-green-700
        "
                                            >
                                                <PackageCheck size={16} />
                                            </button>
                                        )}

                                        {/* CONFIRM */}
                                        {canEditPurchaseOrder && isDraft && (
                                            <button
                                                type="button"
                                                onClick={() => handleConfirmPurchaseOrder(order)}
                                                title="Confirm Purchase Order"
                                                className="
                    flex h-8 w-8
                    items-center justify-center
                    rounded-lg
                    bg-green-50 text-green-600
                    transition
                    hover:bg-green-100
                    hover:text-green-700
                "
                                            >
                                                <CheckCircle size={16} />
                                            </button>
                                        )}

                                        {/* VIEW */}
                                        {canViewPurchaseOrder && (
                                            <button
                                                type="button"
                                                onClick={() => handleView(order)}
                                                title="View"
                                                className="
                    flex h-8 w-8
                    items-center justify-center
                    rounded-lg
                    bg-blue-50 text-blue-600
                    transition
                    hover:bg-blue-100
                    hover:text-blue-700
                "
                                            >
                                                <Eye size={16} />
                                            </button>
                                        )}

                                        {/* EDIT */}
                                        {canEditPurchaseOrder && isDraft && (
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(order)}
                                                title="Edit"
                                                className="
                    flex h-8 w-8
                    items-center justify-center
                    rounded-lg
                    bg-amber-50 text-amber-600
                    transition
                    hover:bg-amber-100
                    hover:text-amber-700
                "
                                            >
                                                <Edit size={16} />
                                            </button>
                                        )}

                                        {/* DELETE */}
                                        {canDeletePurchaseOrder && isDraft && (
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(order)}
                                                title="Delete"
                                                className="
                    flex h-8 w-8
                    items-center justify-center
                    rounded-lg
                    bg-red-50 text-red-600
                    transition
                    hover:bg-red-100
                    hover:text-red-700
                "
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* =====================================================
                PAGINATION
            ===================================================== */}

            <Pagination
                page={Number(pageNumber) || 0}
                size={Number(pageSize) || 10}
                totalElements={Number(totalElements) || 0}
                totalPages={Number(totalPages) || 0}
                loading={loading}
                label="purchaseOrders"
                onPageChange={(nextPage) => {
                    refreshPurchaseOrders(nextPage, pageSize);
                }}
                onPageSizeChange={(nextSize) => {
                    refreshPurchaseOrders(0, nextSize);
                }}
            />
        </div>
    );
}
