
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchAllSalesOrders,
    deleteSalesOrder,
    confirmSalesOrder,
    dispatchSalesOrder,
    convertSaleOrderToInvoice,
} from "../thunks/salesOrderThunks";

import {
    setExsistingSaleOrder,
} from "../slices/salesOrderSlice";

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
    FileText,
} from "lucide-react";

import toast from "react-hot-toast";
import Pagination from "../../../../common/pagination/table/Pagination";
import ToolTipText from "../../../../common/toolTip/ToolTipText";

export default function SaleOrderTable({ salesOrders = [],
    appliedFilters = {},
    selectedStatus = "ALL", }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    // Supports either reducer key: saleOrder or salesOrder.
    const salesOrderState = useSelector(
        (state) => state.saleOrder || state.salesOrder || {}
    );

    const {
        loading = false,
        error = null,
    } = salesOrderState;

    // Pagination is nested inside your salesOrderSlice.
    const pagination = salesOrderState.pagination || {};

    const pageNumber = pagination.pageNumber ?? 0;
    const pageSize = pagination.pageSize ?? 10;
    const totalPages = pagination.totalPages ?? 0;
    const totalElements = pagination.totalElements ?? 0;

    const currentSalesOrders = Array.isArray(salesOrders)
        ? salesOrders
        : [];

    const [convertingOrderId, setConvertingOrderId] = React.useState(null);
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
       SALES ORDER PERMISSIONS
    ===================================================== */

    const canViewSalesOrder = hasPermission(
        "Sales Orders",
        "VIEW"
    );

    const canEditSalesOrder = hasPermission(
        "Sales Orders",
        "EDIT"
    );

    const canDeleteSalesOrder = hasPermission(
        "Sales Orders",
        "DELETE"
    );

    /* =====================================================
       ORDER STATUS
    ===================================================== */

    // Your API response uses "status".
    // salesOrderStatus is supported as a fallback.
    const getOrderStatus = (order) => {
        return String(
            order?.status ||
            order?.salesOrderStatus ||
            ""
        )
            .trim()
            .toUpperCase();
    };

    const statusColor = {
        DRAFT: "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-blue-100 text-blue-700",
        DISPATCHED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    };

    /* =====================================================
   GENERATED INVOICE CHECK
===================================================== */

    const hasGeneratedInvoice = (order) => {
        return Boolean(
            order?.invoiceId ||
            order?.invoiceGenerated ||
            order?.invoice?.id ||
            order?.convertedToInvoice
        );
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
       PARTY NAME
    ===================================================== */

    const getPartyName = (order) => {
        if (order?.partyType === "CUSTOMER") {
            const customer = order?.customer;

            return (
                customer?.companyName ||
                customer?.displayName ||
                [
                    customer?.firstName,
                    customer?.lastName,
                ]
                    .filter(Boolean)
                    .join(" ") ||
                order?.customerName ||
                "—"
            );
        }

        const party = order?.party;

        return (
            party?.companyName ||
            party?.displayName ||
            party?.partyName ||
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
       FETCH SALES ORDERS
    ===================================================== */

    const refreshSalesOrders = (page = pageNumber, size = pageSize) => {
        dispatch(
            fetchAllSalesOrders({
                ...appliedFilters,
                page: Number(page) || 0,
                size: Number(size) || 10,
                salesOrderStatus:
                    selectedStatus === "ALL"
                        ? undefined
                        : selectedStatus,
            })
        );
    };

    /* =====================================================
       DELETE SALES ORDER
    ===================================================== */

    const handleDelete = async (order) => {
        if (!canDeleteSalesOrder) {
            toast.error(
                "You do not have permission to delete sales orders."
            );
            return;
        }

        if (getOrderStatus(order) !== "DRAFT") {
            toast.error(
                "Only draft sales orders can be deleted."
            );
            return;
        }

        if (!order?.id) {
            toast.error("Sales order ID is missing.");
            return;
        }

        const confirmed = window.confirm(
            `Delete sales order ${order?.orderNo || ""}?`
        );

        if (!confirmed) return;

        try {
            await dispatch(
                deleteSalesOrder(order.id)
            ).unwrap();

            toast.success("Sales order deleted successfully");

            refreshSalesOrders(pageNumber, pageSize);
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete sales order"
            );
        }
    };

    /* =====================================================
   CONVERT SALES ORDER TO INVOICE
===================================================== */

    const handleConvertToInvoice = async (order) => {
        if (!canEditSalesOrder) {
            toast.error(
                "You do not have permission to convert sales orders."
            );
            return;
        }

        if (!order?.id) {
            toast.error("Sales order ID is missing.");
            return;
        }

        const status = getOrderStatus(order);

        if (!["CONFIRMED", "DISPATCHED"].includes(status)) {
            toast.error(
                "Only confirmed or dispatched sales orders can be converted."
            );
            return;
        }

        if (hasGeneratedInvoice(order)) {
            toast.error("Invoice has already been generated for this sales order.");
            return;
        }

        if (convertingOrderId !== null) {
            return;
        }

        const confirmed = window.confirm(
            `Convert sales order ${order?.orderNo || ""} into an invoice?`
        );

        if (!confirmed) return;

        try {
            setConvertingOrderId(order.id);

            const invoice = await dispatch(
                convertSaleOrderToInvoice(order.id)
            ).unwrap();

            if (!invoice?.id) {
                throw new Error(
                    "Invoice was generated, but its ID was not returned."
                );
            }

            toast.success(
                "Sales order converted into invoice successfully."
            );

            refreshSalesOrders(pageNumber, pageSize);

            navigate(`/invoices/view/${invoice.id}`);

        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to convert sales order into invoice."
            );
        } finally {
            setConvertingOrderId(null);
        }
    };

    /* =====================================================
       VIEW SALES ORDER
    ===================================================== */

    const handleView = (order) => {
        if (!canViewSalesOrder) {
            toast.error(
                "You do not have permission to view sales orders."
            );
            return;
        }

        if (!order?.id) {
            toast.error("Sales order ID is missing.");
            return;
        }

        dispatch(setExsistingSaleOrder(order));

        navigate(`/inventory/salesOrder/view/${order.id}`);
    };

    /* =====================================================
       EDIT SALES ORDER
    ===================================================== */

    const handleEdit = (order) => {
        if (!canEditSalesOrder) {
            toast.error(
                "You do not have permission to edit sales orders."
            );
            return;
        }

        if (getOrderStatus(order) !== "DRAFT") {
            toast.error(
                "Only draft sales orders can be edited."
            );
            return;
        }

        if (!order?.id) {
            toast.error("Sales order ID is missing.");
            return;
        }

        dispatch(setExsistingSaleOrder(order));

        navigate(`/inventory/saleOrder/edit/${order.id}`);
    };

    const handleConfirmSalesOrder = async (order) => {
        try {
            await dispatch(confirmSalesOrder(order.id)).unwrap();

            toast.success("Sales order confirmed successfully");

            // Refresh the current purchase order list
            dispatch(fetchAllSalesOrders({
                page: pagination?.page ?? 0,
                size: pagination?.size ?? 10,
            }));
        } catch (error) {
            toast.error(
                error?.message || "Failed to confirm sales order"
            );
        }
    };


    const handleDispatchSalesOrder = async (order) => {
        try {
            await dispatch(dispatchSalesOrder(order.id)).unwrap();

            toast.success("Sales order dispatched successfully");

            // Refresh the current purchase order list
            dispatch(fetchAllSalesOrders({
                page: pagination?.page ?? 0,
                size: pagination?.size ?? 10,
            }));
        } catch (error) {
            toast.error(
                error?.message || "Failed to confirm sales order"
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
                    Loading sales orders...
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
                        : error?.message || "Failed to load sales orders"}
                </p>

                <button
                    type="button"
                    onClick={() => refreshSalesOrders()}
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

    if (!currentSalesOrders.length) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                <p className="text-gray-500">
                    No sales orders found.
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
                            "Customer / Party",
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
                    {currentSalesOrders.map((order, index) => {
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
                                                title={getPartyName(order)}
                                            >
                                                {getPartyName(order)}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {order?.partyType || "—"}
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
                                    <div className="relative flex items-center justify-end gap-2">

                                        {/* CONFIRM */}
                                        {canEditSalesOrder && isDraft && (
                                            <button
                                                type="button"
                                                onClick={() => handleConfirmSalesOrder(order)}

                                                className="
                                                    group relative
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
                                                <ToolTipText text="Confirm Sales Order" position="bottom" />
                                            </button>
                                        )}


                                        {/* CONVERT TO INVOICE */}

                                        {canEditSalesOrder && (() => {
                                            const canConvert = ["CONFIRMED", "DISPATCHED"].includes(status);
                                            const alreadyConverted = hasGeneratedInvoice(order);
                                            const isConverting = convertingOrderId === order.id;

                                            const disabled =
                                                !canConvert ||
                                                alreadyConverted ||
                                                isConverting ||
                                                convertingOrderId !== null;

                                            return (
                                                <button
                                                    type="button"
                                                    onClick={() => handleConvertToInvoice(order)}
                                                    disabled={disabled}
                                                    className={`
                group relative
                flex h-8 w-8
                items-center justify-center
                rounded-lg
                transition
                ${alreadyConverted
                                                            ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                                            : canConvert
                                                                ? "bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700"
                                                                : "cursor-not-allowed bg-gray-100 text-gray-300"
                                                        }
                disabled:opacity-70
            `}
                                                >
                                                    {isConverting ? (
                                                        <span className="
                    h-4 w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-purple-300
                    border-t-purple-700
                " />
                                                    ) : (
                                                        <FileText size={16} />
                                                    )}

                                                    <ToolTipText
                                                        text={
                                                            alreadyConverted
                                                                ? "Invoice Already Generated"
                                                                : !canConvert
                                                                    ? "Conversion unavailable for this status"
                                                                    : isConverting
                                                                        ? "Converting..."
                                                                        : "Convert to Invoice"
                                                        }
                                                        position="bottom"
                                                    />
                                                </button>
                                            );
                                        })()}
                                        {/* CONFIRM */}
                                        {status === "CONFIRMED" && (
                                            <button
                                                type="button"
                                                onClick={() => handleDispatchSalesOrder(order)}

                                                className="
                                                    group relative
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
                                                <ToolTipText text="Dispatch Sales Order" position="bottom" />
                                            </button>
                                        )}


                                        {/* VIEW */}

                                        {canViewSalesOrder && (
                                            <button
                                                type="button"
                                                onClick={() => handleView(order)}
                                                className="
                                                    group
                                                    relative
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
                                                <ToolTipText text="view" position="bottom" />
                                            </button>
                                        )}



                                        {/* EDIT */}

                                        {canEditSalesOrder && isDraft && (
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(order)}

                                                className="
                                                group
                                                relative
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
                                                <ToolTipText text="Edit" position="bottom" />
                                            </button>
                                        )}

                                        {/* DELETE */}

                                        {canDeleteSalesOrder && isDraft && (
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(order)}

                                                className="
                                                 group
                                                relative
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
                                                <ToolTipText text="Delete" position="bottom" />
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
                label="salesOrders"
                onPageChange={(nextPage) => {
                    refreshSalesOrders(nextPage, pageSize);
                }}
                onPageSizeChange={(nextSize) => {
                    refreshSalesOrders(0, nextSize);
                }}
            />
        </div>
    );
}
