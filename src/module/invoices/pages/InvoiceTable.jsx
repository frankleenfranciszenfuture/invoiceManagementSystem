
import React, {
    useCallback,
    useMemo,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    useNavigate,
} from "react-router-dom";

import {
    Eye,
    FileText,
    UserRound,
    CalendarDays,
    Edit,
    Trash2,
    Receipt,
    CheckCircle2,
    Send,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchInvoices,
    fetchInvoiceById,
    removeInvoice,
} from "../thunks/invoiceThunks";

import {
    setExistingInvoice,
    setInvoiceForEdit,
} from "../slices/invoiceSlice";

import { submitInvoiceForApproval } from "../../../module/approval/invoiceApproval/thunks/invoiceApprovalThunks"

import Pagination from "../../../common/pagination/table/Pagination";
import ToolTipText from "../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

const INVOICE_STATUS_COLORS = {
    DRAFT: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-blue-100 text-blue-700",
    SENT: "bg-purple-100 text-purple-700",
    PAID: "bg-green-100 text-green-700",
    PARTIAL: "bg-orange-100 text-orange-700",
    OVERDUE: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-700",
};

const INVOICE_TYPE_COLORS = {
    PRODUCT_INVOICE: "bg-blue-100 text-blue-700",
    SERVICE_INVOICE: "bg-purple-100 text-purple-700",
    SALE_INVOICE: "bg-green-100 text-green-700",
};

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatAmount = (amount, currencyCode = "INR") => {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return "—";
    }

    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currencyCode || "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${currencyCode || "INR"} ${value.toFixed(2)}`;
    }
};

const formatLabel = (value) => {
    if (!value) return "—";

    return String(value)
        .toLowerCase()
        .split("_")
        .map((word) =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
};

/* =========================================================
   COMPONENT
========================================================= */

export default function InvoiceTable({
    invoices,
    fetchParams = {},
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        invoices: reduxInvoices = EMPTY_ARRAY,
        loading = false,
        error = null,
        pagination = {},
    } = useSelector(
        (state) => state.invoice || {}
    );

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

    const currentInvoices = Array.isArray(invoices)
        ? invoices
        : reduxInvoices;

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    const permissions = useSelector(
        (state) =>
            state.menuPermission?.userPermissions || EMPTY_ARRAY
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

    const hasFullAccess =
        normalizedRole === "SUPER_ADMIN" ||
        normalizedRole === "ADMIN";

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = useCallback(
        (moduleName, actionName) => {
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
                    String(permission?.status || "").toUpperCase() ===
                    "INACTIVE"
                ) {
                    return false;
                }

                /* ACTION ARRAY */

                if (Array.isArray(permission?.actions)) {
                    return permission.actions.some((action) => {
                        if (typeof action === "string") {
                            return (
                                action.trim().toUpperCase() ===
                                requestedAction
                            );
                        }

                        const permissionAction = String(
                            action?.actionName ||
                            action?.action?.actionName ||
                            action?.action?.name ||
                            action?.name ||
                            ""
                        )
                            .trim()
                            .toUpperCase();

                        const allowed =
                            action?.allowed === true ||
                            action?.allowed === "true";

                        if (action?.active === false) {
                            return false;
                        }

                        if (
                            String(action?.status || "").toUpperCase() ===
                            "INACTIVE"
                        ) {
                            return false;
                        }

                        return (
                            permissionAction === requestedAction &&
                            allowed
                        );
                    });
                }

                /* DIRECT / FLAT ACTION */

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
        },
        [
            hasFullAccess,
            permissions,
        ]
    );

    /* =====================================================
       INVOICE PERMISSIONS
    ===================================================== */

    const canViewInvoice = hasPermission(
        "Invoices",
        "VIEW"
    );

    const canEditInvoice = hasPermission(
        "Invoices",
        "EDIT"
    );

    const canDeleteInvoice = hasPermission(
        "Invoices",
        "DELETE"
    );

    const canApproveInvoice = hasPermission(
        "Invoices",
        "APPROVE"
    );

    /* =====================================================
       FETCH PARAMS
    ===================================================== */

    const getFetchParams = useCallback(
        (page, size) => ({
            page,
            size,
            searchParams: fetchParams?.searchParams || {},
        }),
        [fetchParams]
    );

    const refreshInvoices = useCallback(
        (page = pageNumber, size = pageSize) => {
            const params = getFetchParams(page, size);
            dispatch(fetchInvoices(params));
        },
        [dispatch, getFetchParams, pageNumber, pageSize]
    );

    /* =====================================================
       VIEW INVOICE
    ===================================================== */

    const handleView = async (invoice) => {
        const invoiceId = invoice?.id ?? invoice?.invoiceId;

        if (!invoiceId) {
            toast.error("Invoice ID not found.");
            return;
        }

        try {
            const response = await dispatch(
                fetchInvoiceById(invoiceId)
            ).unwrap();

            const detailedInvoice = response?.data ?? response;

            if (!detailedInvoice) {
                toast.error("Invoice details not found.");
                return;
            }

            dispatch(setExistingInvoice(detailedInvoice));

            navigate(`/invoices/view/${invoiceId}`);
        } catch (error) {
            toast.error(
                error?.message ||
                (typeof error === "string" ? error : "Failed to load invoice details.")
            );
        }
    };

    /* =====================================================
       EDIT INVOICE
    ===================================================== */

    // const handleEdit = (invoice) => {
    //     if (!canEditInvoice) {
    //         toast.error(
    //             "You do not have permission to edit invoices."
    //         );
    //         return;
    //     }

    //     if (
    //         String(invoice?.invoiceStatus || "").toUpperCase() ===
    //         "CANCELLED"
    //     ) {
    //         toast.error(
    //             "Cancelled invoices cannot be edited."
    //         );
    //         return;
    //     }

    //     dispatch(setExistingInvoice(invoice));

    //     navigate(`/invoices/edit/${invoice.id}`);
    // };

    /* =========================================================
   EDIT INVOICE
========================================================= */

    const handleEdit = async (invoice) => {
        if (!canEditInvoice) {
            toast.error("You do not have permission to edit invoices.");
            return;
        }

        const invoiceId = invoice?.id ?? invoice?.invoiceId;

        if (!invoiceId) {
            toast.error("Invoice ID not found.");
            return;
        }

        const invoiceStatus = String(
            invoice?.invoiceStatus || invoice?.status || "DRAFT"
        ).trim().toUpperCase();

        if (invoiceStatus !== "DRAFT") {
            toast.error("Only draft invoices can be edited.");
            return;
        }

        try {
            // Fetch complete invoice details instead of using
            // potentially incomplete table-row data.
            const response = await dispatch(
                fetchInvoiceById(invoiceId)
            ).unwrap();

            const detailedInvoice = response?.data ?? response;

            if (!detailedInvoice) {
                toast.error("Invoice details not found.");
                return;
            }

            const invoiceType = String(
                detailedInvoice.invoiceType || invoice.invoiceType || ""
            ).trim().toUpperCase();

            const editRoutes = {
                PRODUCT_INVOICE: `/invoices/product/edit/${invoiceId}`,
                SERVICE_INVOICE: `/invoices/service/edit/${invoiceId}`,
                SALE_INVOICE: `/invoices/sale/edit/${invoiceId}`,
                PURCHASE_INVOICE: `/invoices/purchase/edit/${invoiceId}`,
                TAX_INVOICE: `/invoices/tax/edit/${invoiceId}`,
            };

            const editPath = editRoutes[invoiceType];

            if (!editPath) {
                toast.error(`Unsupported invoice type: ${invoiceType || "Unknown"}`);
                return;
            }

            // Populate the actual invoice form state.
            dispatch(setInvoiceForEdit(detailedInvoice));

            navigate(editPath, {
                state: {
                    invoiceId,
                    invoiceType,
                    isEdit: true,
                },
            });

        } catch (error) {
            toast.error(
                error?.message ||
                (typeof error === "string"
                    ? error
                    : "Failed to load invoice for editing.")
            );
        }
    };

    // =========================================================
    // SEND INVOICE FOR APPROVAL
    // =========================================================

    const handleSendForApproval = async (invoice) => {
        if (!canEditInvoice) {
            toast.error(
                "You do not have permission to submit invoices for approval."
            );
            return;
        }

        const invoiceId = invoice?.id ?? invoice?.invoiceId;

        if (!invoiceId) {
            toast.error("Invoice ID not found.");
            return;
        }

        const invoiceStatus = String(
            invoice?.invoiceStatus || invoice?.status || ""
        )
            .trim()
            .toUpperCase();

        if (invoiceStatus !== "DRAFT") {
            toast.error("Only draft invoices can be submitted for approval.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to submit invoice ${invoice.invoiceNumber || invoiceId
            } for approval?`
        );

        if (!confirmed) return;

        try {
            await dispatch(
                submitInvoiceForApproval({
                    invoiceId,
                    data: {
                        comment: "Invoice ready for approval.",
                    },
                })
            ).unwrap();

            toast.success("Invoice submitted for approval successfully.");

            refreshInvoices();
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to submit invoice for approval."
            );
        }
    };

    /* =====================================================
       DELETE INVOICE
    ===================================================== */

    const handleDelete = async (invoice) => {
        if (!canDeleteInvoice) {
            toast.error(
                "You do not have permission to delete invoices."
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete invoice ${invoice.invoiceNumber}?`
        );

        if (!confirmed) return;

        try {
            await dispatch(
                removeInvoice(invoice.id)
            ).unwrap();

            toast.success(
                "Invoice deleted successfully."
            );

            refreshInvoices();
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete invoice."
            );
        }
    };

    /* =====================================================
       SORTING
    ===================================================== */

    const sortedInvoices = useMemo(
        () => [...currentInvoices],
        [currentInvoices]
    );

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentInvoices.length) {
        return (
            <div className="
                flex items-center justify-center py-10
            ">
                <p className="text-sm text-gray-500">
                    Loading invoices...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentInvoices.length) {
        return (
            <div className="
                rounded-xl border border-red-200
                bg-white p-8 text-center
            ">
                <p className="text-sm text-red-500">
                    {typeof error === "string"
                        ? error
                        : "Failed to fetch invoices"}
                </p>

                <button
                    type="button"
                    onClick={() => refreshInvoices()}
                    className="
                        mt-3 rounded-lg bg-blue-600
                        px-4 py-2 text-sm text-white
                        transition hover:bg-blue-700
                    "
                >
                    Retry
                </button>
            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentInvoices.length) {
        return (
            <div className="
                rounded-2xl border border-gray-200
                bg-white p-8 text-center
            ">
                <FileText className="
                    mx-auto mb-3 h-10 w-10 text-gray-300
                " />

                <p className="text-sm text-gray-500">
                    No invoices found.
                </p>
            </div>
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    return (
        <div className="
            overflow-x-auto overflow-y-visible
            rounded-xl border border-gray-200 bg-white
        ">
            <table className="w-full">

                {/* TABLE HEADER */}

                <thead className="
                    border-b border-gray-300
                    bg-[#FAF9F7]/20
                ">
                    <tr>
                        {[
                            "Invoice",
                            "Customer",
                            "Invoice Date",
                            "Due Date",
                            "Amount",
                            "Status",
                            "Actions",
                        ].map((header) => (
                            <th
                                key={header}
                                className={`
                                    whitespace-nowrap px-5 py-3
                                    text-left text-xs font-medium
                                    uppercase text-gray-400
                                    ${header === "Actions"
                                        ? "text-right"
                                        : ""
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
                    {sortedInvoices.map((invoice) => {
                        const invoiceStatus = String(
                            invoice.invoiceStatus || invoice.status || "DRAFT"
                        ).trim().toUpperCase();

                        const invoiceType = String(
                            invoice.invoiceType || ""
                        ).toUpperCase();

                        const currencyCode =
                            invoice.currencyCode ||
                            invoice.currency?.currencyCode ||
                            "INR";

                        return (
                            <tr
                                key={invoice.id}
                                className="
                                    border-b border-gray-100
                                    text-xs transition-colors
                                    hover:bg-gray-50
                                "
                            >
                                {/* INVOICE */}

                                <td className="px-3 py-3">
                                    <div className="
                                        flex min-w-0 items-center gap-2
                                    ">
                                        <div className="
                                            flex h-9 w-9 min-w-[36px]
                                            items-center justify-center
                                            rounded-full bg-blue-50
                                            text-blue-600
                                        ">
                                            <Receipt
                                                size={18}
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className="
                                                    truncate font-medium
                                                    text-gray-800
                                                "
                                                title={invoice.invoiceNumber || ""}
                                            >
                                                {invoice.invoiceNumber || "—"}
                                            </p>

                                            <span
                                                className={`
                                                    mt-0.5 inline-block
                                                    whitespace-nowrap
                                                    rounded-full px-2 py-0.5
                                                    text-[10px] font-medium
                                                    ${INVOICE_TYPE_COLORS[invoiceType] ||
                                                    "bg-gray-100 text-gray-600"
                                                    }
                                                `}
                                            >
                                                {formatLabel(invoice.invoiceType)}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                {/* CUSTOMER */}

                                <td className="px-3 py-3">
                                    <div className="
                                        flex min-w-0 items-center gap-2
                                    ">
                                        <UserRound
                                            size={15}
                                            className="shrink-0 text-gray-400"
                                        />

                                        <div className="min-w-0">
                                            <p className="
                                                max-w-[180px] truncate
                                                font-medium text-gray-700
                                            ">
                                                {invoice.customerName ||
                                                    invoice.customer?.companyName ||
                                                    invoice.customer?.customerName ||
                                                    "—"}
                                            </p>

                                            {invoice.customer?.email && (
                                                <p className="
                                                    max-w-[180px] truncate
                                                    text-xs text-gray-400
                                                ">
                                                    {invoice.customer.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* INVOICE DATE */}

                                <td className="px-3 py-3">
                                    <div className="
                                        flex items-center gap-1.5
                                        whitespace-nowrap text-gray-600
                                    ">
                                        <CalendarDays
                                            size={13}
                                            className="text-gray-400"
                                        />

                                        {formatDate(invoice.invoiceDate)}
                                    </div>
                                </td>

                                {/* DUE DATE */}

                                <td className="px-3 py-3">
                                    <span className="
                                        whitespace-nowrap text-gray-600
                                    ">
                                        {formatDate(invoice.dueDate)}
                                    </span>
                                </td>

                                {/* AMOUNT */}

                                <td className="px-3 py-3">
                                    <p className="
                                        whitespace-nowrap font-semibold
                                        text-gray-800
                                    ">
                                        {formatAmount(
                                            invoice.grandTotal,
                                            currencyCode
                                        )}
                                    </p>
                                </td>

                                {/* STATUS */}

                                <td className="px-3 py-3">
                                    <span
                                        className={`
                                            inline-block whitespace-nowrap
                                            rounded-full px-2.5 py-1
                                            text-xs font-medium
                                            ${INVOICE_STATUS_COLORS[invoiceStatus] ||
                                            "bg-gray-100 text-gray-700"
                                            }
                                        `}
                                    >
                                        {formatLabel(invoiceStatus)}
                                    </span>
                                </td>

                                {/* ACTIONS */}

                                <td className="px-4 py-3">
                                    <div className="
                                        relative flex items-center justify-end gap-2
                                    ">



                                        {/* SEND FOR APPROVAL */}

                                        {canEditInvoice && invoiceStatus === "DRAFT" && (
                                            <button
                                                type="button"
                                                onClick={() => handleSendForApproval(invoice)}
                                                title="Send for Approval"
                                                className="
            group relative flex h-8 w-8
            items-center justify-center
            rounded-lg bg-blue-50
            text-blue-600 transition
            hover:bg-blue-100
        "
                                            >
                                                <Send size={16} />

                                                <ToolTipText
                                                    text="Send for Approval"
                                                    position="bottom"
                                                />
                                            </button>
                                        )}

                                        {/* VIEW */}

                                        {canViewInvoice && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleView(invoice)
                                                }
                                                title="View"
                                                className="
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-blue-50
                                                    text-blue-600 transition
                                                    hover:bg-blue-100
                                                    hover:text-blue-700
                                                "
                                            >
                                                <Eye size={16} />
                                            </button>
                                        )}

                                        {/* EDIT */}

                                        {canEditInvoice && (
                                            <button
                                                type="button"
                                                disabled={
                                                    invoiceStatus === "CANCELLED"
                                                }
                                                onClick={() =>
                                                    handleEdit(invoice)
                                                }
                                                title="Edit"
                                                className="
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-green-50
                                                    text-green-600 transition
                                                    hover:bg-green-100
                                                    hover:text-green-700
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-40
                                                "
                                            >
                                                <Edit size={16} />
                                            </button>
                                        )}

                                        {/* DELETE */}

                                        {canDeleteInvoice && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(invoice)
                                                }
                                                title="Delete"
                                                className="
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-red-50
                                                    text-red-600 transition
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

            {/* PAGINATION */}

            <Pagination
                page={Number(pageNumber) || 0}
                size={Number(pageSize) || 20}
                totalElements={Number(totalElements) || 0}
                totalPages={Number(totalPages) || 0}
                loading={loading}
                label="invoices"
                onPageChange={(nextPage) => {
                    refreshInvoices(
                        nextPage,
                        Number(pageSize) || 20
                    );
                }}
                onPageSizeChange={(nextSize) => {
                    refreshInvoices(0, nextSize);
                }}
            />
        </div>
    );
}



