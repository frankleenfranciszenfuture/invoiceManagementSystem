
import React, { useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    fetchPendingInvoiceApprovals,
} from "../thunks/invoiceApprovalThunks";

import {
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    User,
} from "lucide-react";

import toast from "react-hot-toast";

import Pagination from "../../../../common/pagination/table/Pagination";
import ToolTipText from "../../../../common/toolTip/ToolTipText";

// ======================================================
// HELPERS
// ======================================================

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatAmount = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) return "-";

    return amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// ======================================================
// COMPONENT
// ======================================================

export default function InvoiceApprovalTable({
    pendingApprovals = [],
    onApprove,
    onReject,
    actionLoading = false,
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ==================================================
    // REDUX STATE
    // ==================================================

    const {
        loading = false,
        error = null,
        pagination = {},
    } = useSelector(
        (state) => state.invoiceApproval || {}
    );

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

    const currentApprovals = Array.isArray(pendingApprovals)
        ? pendingApprovals
        : [];

    // ==================================================
    // AUTH STATE
    // ==================================================

    const user = useSelector(
        (state) => state.auth?.user
    );

    // ==================================================
    // PERMISSIONS
    // ==================================================

    const permissions = useSelector(
        (state) =>
            state.menuPermission?.userPermissions || []
    );

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

    const hasFullAccess = [
        "SUPER_ADMIN",
        "ADMIN",
    ].includes(normalizedRole);

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
                    String(permission?.status || "")
                        .trim()
                        .toUpperCase() === "INACTIVE"
                ) {
                    return false;
                }

                if (Array.isArray(permission?.actions)) {
                    return permission.actions.some((action) => {
                        if (typeof action === "string") {
                            return (
                                action.trim().toUpperCase() ===
                                requestedAction
                            );
                        }

                        const actionName = String(
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

                        if (action?.active === false) return false;

                        if (
                            String(action?.status || "")
                                .trim()
                                .toUpperCase() === "INACTIVE"
                        ) {
                            return false;
                        }

                        return (
                            actionName === requestedAction &&
                            allowed
                        );
                    });
                }

                const actionName = String(
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
                    actionName === requestedAction &&
                    allowed
                );
            });
        },
        [permissions, hasFullAccess]
    );

    const canView = hasPermission(
        "Invoice Approvals",
        "VIEW"
    );

    const canApprove = hasPermission(
        "Invoice Approvals",
        "APPROVE"
    );

    const canReject = hasPermission(
        "Invoice Approvals",
        "REJECT"
    );

    // ==================================================
    // FETCH APPROVALS
    // ==================================================

    const reloadApprovals = useCallback(
        (page = pageNumber, size = pageSize) => {
            dispatch(
                fetchPendingInvoiceApprovals({
                    page,
                    size,
                })
            );
        },
        [dispatch, pageNumber, pageSize]
    );

    // ==================================================
    // PAGINATION
    // ==================================================

    const handlePageChange = (page) => {
        reloadApprovals(page, pageSize);
    };

    const handlePageSizeChange = (size) => {
        reloadApprovals(0, size);
    };

    // ==================================================
    // VIEW INVOICE
    // ==================================================

    const handleView = (approval) => {
        if (!canView) {
            toast.error(
                "You do not have permission to view invoice approvals."
            );
            return;
        }

        if (!approval?.id) {
            toast.error("Approval ID not found.");
            return;
        }

        navigate(
            `/invoice-approvals/view/${approval.id}`
        );
    };

    // ==================================================
    // APPROVE
    // ==================================================

    const handleApprove = (approval) => {
        if (!canApprove) {
            toast.error(
                "You do not have permission to approve invoices."
            );
            return;
        }

        onApprove?.(approval);
    };

    // ==================================================
    // REJECT
    // ==================================================

    const handleReject = (approval) => {
        if (!canReject) {
            toast.error(
                "You do not have permission to reject invoices."
            );
            return;
        }

        onReject?.(approval);
    };

    // ==================================================
    // LOADING
    // ==================================================

    if (loading && !currentApprovals.length) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-10">
                <p className="text-sm text-gray-500">
                    Loading invoice approvals...
                </p>
            </div>
        );
    }

    // ==================================================
    // ERROR
    // ==================================================

    if (error && !currentApprovals.length) {
        return (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
                <p className="text-sm text-red-500">
                    {typeof error === "string"
                        ? error
                        : "Unable to load invoice approvals."}
                </p>
            </div>
        );
    }

    // ==================================================
    // EMPTY STATE
    // ==================================================

    if (!currentApprovals.length) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                <p className="text-sm text-gray-500">
                    No pending invoice approvals found.
                </p>
            </div>
        );
    }

    // ==================================================
    // TABLE
    // ==================================================

    return (
        <div className="overflow-x-auto overflow-y-visible rounded-xl border border-gray-200 bg-white">

            <table className="w-full min-w-[950px]">

                {/* TABLE HEADER */}

                <thead className="border-b border-gray-300 bg-[#FAF9F7]/20">
                    <tr>
                        {[
                            "Invoice",
                            "Type",
                            "Total",
                            "Submitted",
                            "Status",
                            "Actions",
                        ].map((header) => (
                            <th
                                key={header}
                                className={`
                                    px-3 py-3 text-xs font-semibold
                                    uppercase tracking-wide text-gray-500
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
                    {[...currentApprovals].map((approval, index) => {

                        const status = String(
                            approval.status || "PENDING"
                        ).toUpperCase();

                        return (
                            <tr
                                key={approval.id || index}
                                className="
                                    border-b border-gray-100
                                    text-xs transition-colors
                                    hover:bg-gray-50
                                "
                            >

                                {/* INVOICE */}

                                <td className="px-3 py-3">
                                    <p className="font-medium text-gray-800">
                                        {approval.invoiceNumber ||
                                            `Invoice #${approval.invoiceId}`}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        Approval #{approval.id}
                                    </p>
                                </td>

                                {/* TYPE */}

                                <td className="px-3 py-3">
                                    <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                        {approval.invoiceType || "-"}
                                    </span>
                                </td>

                                {/* GRAND TOTAL */}

                                <td className="px-4 py-3">
                                    <p className="font-semibold tabular-nums text-gray-800">
                                        {formatAmount(approval.grandTotal)}
                                    </p>
                                </td>

                                {/* SUBMITTED BY */}

                                <td className="px-3 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <User
                                            size={13}
                                            className="text-gray-400"
                                        />

                                        <span className="font-medium text-gray-700">
                                            {approval.submittedByName || "-"}
                                        </span>

                                    </div>


                                    <p className="text-gray-600 whitespace-nowrap">
                                        {formatDate(approval.submittedAt)}
                                    </p>
                                </td>



                                {/* STATUS */}

                                <td className="px-3 py-3">
                                    <span className={`
                                        inline-flex items-center gap-1.5
                                        rounded-full px-2 py-1
                                        text-xs font-medium
                                        ${status === "PENDING"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : status === "APPROVED"
                                                ? "bg-green-100 text-green-700"
                                                : status === "REJECTED"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-gray-100 text-gray-700"
                                        }
                                    `}>
                                        <Clock size={12} />
                                        {status}
                                    </span>
                                </td>

                                {/* ACTIONS */}

                                <td className="px-3 py-3">
                                    <div className="flex items-center justify-end gap-2">

                                        {/* VIEW */}

                                        {canView && (
                                            <button
                                                type="button"
                                                onClick={() => handleView(approval)}

                                                className="
                                                    group relative flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-blue-50
                                                    text-blue-600 transition
                                                    hover:bg-blue-100
                                                "
                                            >
                                                <Eye size={16} />

                                                <ToolTipText
                                                    text="View"
                                                    position="bottom"
                                                />
                                            </button>
                                        )}

                                        {/* APPROVE */}

                                        {canApprove && (
                                            <button
                                                type="button"
                                                onClick={() => handleApprove(approval)}
                                                disabled={actionLoading}

                                                className="
                                                    group relative flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-green-50
                                                    text-green-600 transition
                                                    hover:bg-green-100
                                                    disabled:opacity-50
                                                "
                                            >
                                                <CheckCircle2 size={16} />

                                                <ToolTipText
                                                    text="Approve"
                                                    position="bottom"
                                                />
                                            </button>
                                        )}

                                        {/* REJECT */}

                                        {canReject && (
                                            <button
                                                type="button"
                                                onClick={() => handleReject(approval)}
                                                disabled={actionLoading}

                                                className="
                                                    group relative flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-red-50
                                                    text-red-600 transition
                                                    hover:bg-red-100
                                                    disabled:opacity-50
                                                "
                                            >
                                                <XCircle size={16} />

                                                <ToolTipText
                                                    text="Reject"
                                                    position="bottom"
                                                />
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
                label="invoice approvals"
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />

        </div>
    );
}
