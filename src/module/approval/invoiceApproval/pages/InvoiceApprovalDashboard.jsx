
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    CheckCircle2,
    XCircle,
    Eye,
    RefreshCw,
    Clock,
    FileText,
    User,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Loader2,
    X,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchPendingInvoiceApprovals,
    approveInvoiceApproval,
    rejectInvoiceApproval,
} from "../thunks/invoiceApprovalThunks";

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

const getErrorMessage = (error, fallback) => {
    if (typeof error === "string") return error;
    return error?.message || fallback;
};

// ======================================================
// COMPONENT
// ======================================================

const InvoiceApprovalDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        pendingApprovals = [],
        pagination = {},
        loading = false,
        actionLoading = false,
        error = null,
    } = useSelector((state) => state.invoiceApproval || {});

    const [page, setPage] = useState(0);
    const [size] = useState(20);

    const [decisionModal, setDecisionModal] = useState({
        open: false,
        type: null,
        approval: null,
    });

    const [comment, setComment] = useState("");

    const loadApprovals = useCallback(
        (requestedPage = page) => {
            dispatch(
                fetchPendingInvoiceApprovals({
                    page: requestedPage,
                    size,
                })
            );
        },
        [dispatch, page, size]
    );

    useEffect(() => {
        loadApprovals(0);
    }, []);

    // ==================================================
    // OPEN DECISION MODAL
    // ==================================================

    const openDecisionModal = (approval, type) => {
        setComment("");

        setDecisionModal({
            open: true,
            type,
            approval,
        });
    };

    const closeDecisionModal = () => {
        if (actionLoading) return;

        setDecisionModal({
            open: false,
            type: null,
            approval: null,
        });

        setComment("");
    };

    // ==================================================
    // APPROVE / REJECT
    // ==================================================

    const handleDecision = async (event) => {
        event.preventDefault();

        const approvalId = decisionModal.approval?.id;

        if (!approvalId) {
            toast.error("Approval ID not found.");
            return;
        }

        const trimmedComment = comment.trim();

        if (!trimmedComment) {
            toast.error("Please enter a decision comment.");
            return;
        }

        if (trimmedComment.length > 1000) {
            toast.error("Comment cannot exceed 1000 characters.");
            return;
        }

        const requestData = {
            comment: trimmedComment,
        };

        try {
            if (decisionModal.type === "APPROVE") {
                await dispatch(
                    approveInvoiceApproval({
                        id: approvalId,
                        data: requestData,
                    })
                ).unwrap();

                toast.success("Invoice approved successfully.");
            } else {
                await dispatch(
                    rejectInvoiceApproval({
                        id: approvalId,
                        data: requestData,
                    })
                ).unwrap();

                toast.success("Invoice rejected successfully.");
            }

            closeDecisionModal();

            loadApprovals(page);
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "Failed to update invoice approval."
                )
            );
        }
    };

    // ==================================================
    // PAGINATION
    // ==================================================

    const totalPages = pagination.totalPages ?? 0;
    const totalElements = pagination.totalElements ?? 0;

    const handlePrevious = () => {
        if (page <= 0 || loading) return;

        const nextPage = page - 1;

        setPage(nextPage);
        loadApprovals(nextPage);
    };

    const handleNext = () => {
        if (page + 1 >= totalPages || loading) return;

        const nextPage = page + 1;

        setPage(nextPage);
        loadApprovals(nextPage);
    };

    const handleRefresh = () => {
        loadApprovals(page);
    };

    // ==================================================
    // INVOICE PREVIEW
    // ==================================================

    const handleViewInvoice = (approval) => {
        if (!approval?.id) {
            toast.error("Approval ID not found.");
            return;
        }

        navigate(`/invoice-approvals/view/${approval.id}`);
    };



    // ==================================================
    // RENDER
    // ==================================================

    return (
        <div className="w-full space-y-6 mt-3">

            {/* HEADER */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={21} />
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold text-slate-800">
                                Invoice Approvals
                            </h1>

                            <p className="text-sm text-slate-500">
                                Review and manage pending invoice approvals.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>

            </div>

            {/* SUMMARY */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Pending Approvals
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-slate-800">
                                {totalElements}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <Clock size={22} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Current Page
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-slate-800">
                                {totalPages === 0 ? 0 : page + 1}
                                <span className="ml-1 text-base font-medium text-slate-400">
                                    / {totalPages}
                                </span>
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={22} />
                        </div>
                    </div>
                </div>

            </div>

            {/* ERROR */}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {typeof error === "string"
                        ? error
                        : "Unable to load invoice approvals."}
                </div>
            )}

            {/* TABLE */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-slate-800">
                            Pending Requests
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Invoices waiting for your decision
                        </p>
                    </div>

                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {totalElements} Pending
                    </span>
                </div>

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1050px] text-left">

                        <thead className="bg-slate-50">
                            <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-5 py-4">Invoice</th>
                                <th className="px-5 py-4">Type</th>
                                <th className="px-5 py-4">Grand Total</th>
                                <th className="px-5 py-4">Submitted By</th>
                                <th className="px-5 py-4">Submitted At</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">

                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-16 text-center"
                                    >
                                        <Loader2
                                            size={28}
                                            className="mx-auto animate-spin text-blue-600"
                                        />

                                        <p className="mt-3 text-sm text-slate-500">
                                            Loading pending approvals...
                                        </p>
                                    </td>
                                </tr>
                            ) : pendingApprovals.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-5 py-16 text-center"
                                    >
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                            <CheckCircle2 size={24} />
                                        </div>

                                        <p className="mt-3 font-medium text-slate-700">
                                            No pending approvals
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            All submitted invoices have been processed.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                pendingApprovals.map((approval) => (
                                    <tr
                                        key={approval.id}
                                        className="transition hover:bg-slate-50/70"
                                    >

                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-800">
                                                {approval.invoiceNumber || `Invoice #${approval.invoiceId}`}
                                            </div>

                                            <div className="mt-1 text-xs text-slate-400">
                                                Approval #{approval.id}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                {approval.invoiceType || "-"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="font-semibold tabular-nums text-slate-800">
                                                {formatAmount(approval.grandTotal)}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                <User
                                                    size={15}
                                                    className="text-slate-400"
                                                />

                                                {approval.submittedByName || "-"}
                                            </div>

                                            <div className="mt-1 text-xs text-slate-400">
                                                ID: {approval.submittedById ?? "-"}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {formatDate(approval.submittedAt)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                <Clock size={13} />
                                                {approval.status || "PENDING"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewInvoice(approval)
                                                    }
                                                    title="View Invoice"
                                                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDecisionModal(approval, "APPROVE")
                                                    }
                                                    disabled={actionLoading}
                                                    title="Approve"
                                                    className="rounded-lg border border-green-200 p-2 text-green-700 transition hover:bg-green-50 disabled:opacity-50"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDecisionModal(approval, "REJECT")
                                                    }
                                                    disabled={actionLoading}
                                                    title="Reject"
                                                    className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    <XCircle size={16} />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>

                {/* PAGINATION */}

                <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-slate-500">
                        Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
                        <span className="ml-2">
                            ({totalElements} total records)
                        </span>
                    </p>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={page <= 0 || loading}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={page + 1 >= totalPages || loading}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>

                    </div>

                </div>

            </div>

            {/* DECISION MODAL */}

            {decisionModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">

                            <div className="flex items-center gap-3">

                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${decisionModal.type === "APPROVE"
                                        ? "bg-green-50 text-green-600"
                                        : "bg-red-50 text-red-600"
                                        }`}
                                >
                                    {decisionModal.type === "APPROVE"
                                        ? <CheckCircle2 size={21} />
                                        : <XCircle size={21} />}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-800">
                                        {decisionModal.type === "APPROVE"
                                            ? "Approve Invoice"
                                            : "Reject Invoice"}
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        {decisionModal.approval?.invoiceNumber || "Invoice approval"}
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={closeDecisionModal}
                                disabled={actionLoading}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                            >
                                <X size={19} />
                            </button>

                        </div>

                        <form onSubmit={handleDecision}>

                            <div className="space-y-4 px-6 py-5">

                                <div className="rounded-lg bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500">
                                        Invoice Grand Total
                                    </p>

                                    <p className="mt-1 text-lg font-bold text-slate-800">
                                        {formatAmount(
                                            decisionModal.approval?.grandTotal
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <MessageSquare size={15} />
                                        Decision Comment
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <textarea
                                        value={comment}
                                        onChange={(event) =>
                                            setComment(event.target.value)
                                        }
                                        rows={4}
                                        maxLength={1000}
                                        required
                                        placeholder={
                                            decisionModal.type === "APPROVE"
                                                ? "Enter your approval comment..."
                                                : "Explain why this invoice is being rejected..."
                                        }
                                        disabled={actionLoading}
                                        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                                    />

                                    <div className="mt-1 text-right text-xs text-slate-400">
                                        {comment.length}/1000
                                    </div>
                                </div>

                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">

                                <button
                                    type="button"
                                    onClick={closeDecisionModal}
                                    disabled={actionLoading}
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={actionLoading || !comment.trim()}
                                    className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${decisionModal.type === "APPROVE"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                        }`}
                                >
                                    {actionLoading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : decisionModal.type === "APPROVE" ? (
                                        <CheckCircle2 size={16} />
                                    ) : (
                                        <XCircle size={16} />
                                    )}

                                    {actionLoading
                                        ? "Processing..."
                                        : decisionModal.type === "APPROVE"
                                            ? "Confirm Approval"
                                            : "Confirm Rejection"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default InvoiceApprovalDashboard;
