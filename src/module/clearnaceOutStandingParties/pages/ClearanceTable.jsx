
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    fetchAllClearance,
    deleteClearance,
} from "../thunks/clearanceThunks";

import {
    setExistingClearance,
} from "../slices/clearanceSlice";

import { openModal } from "../../ui/uiSlice";

import {
    Edit,
    Trash2,
    Building2,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";
import Pagination from "../../../common/pagination/table/Pagination";

export default function ClearanceTable({ clearances: suppliedClearances = [] }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        clearances: reduxClearances = [],
        loading = false,
        error = null,
        pagination = {},
    } = useSelector((state) => state.clearance || {});

    const {
        pageNumber,
        pageSize,
        totalPages,
        totalElements,
    } = pagination || {};


    // Use the filtered rows supplied by the dashboard.
    const currentClearances = Array.isArray(suppliedClearances)
        ? suppliedClearances
        : Array.isArray(reduxClearances)
            ? reduxClearances
            : [];

    // ============================================================
    // DELETE CLEARANCE
    // ============================================================

    const handleDelete = async (id) => {
        if (id == null || id === "") {
            toast.error("Clearance ID is missing");
            return;
        }

        if (!window.confirm("Delete this clearance?")) {
            return;
        }

        try {
            await dispatch(deleteClearance(id)).unwrap();

            toast.success("Clearance deleted successfully");

            await dispatch(fetchAllClearance()).unwrap();
        } catch (err) {
            toast.error(
                typeof err === "string"
                    ? err
                    : err?.message ||
                    "Failed to delete clearance"
            );
        }
    };

    // ============================================================
    // VIEW CLEARANCE
    // ============================================================

    const handleView = (clearance) => {
        if (clearance?.id == null) {
            toast.error("Clearance ID is missing");
            return;
        }

        dispatch(setExistingClearance(clearance));
        navigate(`/clearances/view/${clearance.id}`);
    };

    // ============================================================
    // EDIT CLEARANCE
    // ============================================================

    const handleEdit = (clearance) => {
        if (clearance?.id == null) {
            toast.error("Clearance ID is missing");
            return;
        }

        dispatch(
            openModal({
                type: "editClearance",
                data: clearance,
            })
        );
    };

    // ============================================================
    // HELPERS
    // ============================================================

    const initials = (name = "") =>
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "PT";

    const statusColor = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-gray-100 text-gray-700",
        DRAFT: "bg-yellow-100 text-yellow-700",
    };

    const avatarColors = [
        "bg-pink-500 text-white",
        "bg-green-500 text-white",
        "bg-blue-500 text-white",
        "bg-purple-500 text-white",
        "bg-orange-500 text-white",
        "bg-cyan-500 text-white",
        "bg-indigo-500 text-white",
    ];

    const getAvatarColor = (name = "") => {
        const index = [...String(name)].reduce(
            (total, char) => total + char.charCodeAt(0),
            0
        ) % avatarColors.length;

        return avatarColors[index];
    };

    const formatAmount = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        const number = Number(value);

        return Number.isFinite(number)
            ? number.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
            : String(value);
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading && currentClearances.length === 0) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-gray-500">
                    Loading clearances...
                </p>
            </div>
        );
    }

    // ============================================================
    // ERROR
    // ============================================================

    if (error && currentClearances.length === 0) {
        return (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
                <p className="text-red-500">
                    {typeof error === "string"
                        ? error
                        : error?.message ||
                        "Failed to load clearances."}
                </p>

                <button
                    type="button"
                    onClick={() => dispatch(fetchAllClearance())}
                    className="mt-4 rounded-lg bg-[#0F4659] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F4659]/90"
                >
                    Retry
                </button>
            </div>
        );
    }

    // ============================================================
    // EMPTY STATE
    // ============================================================

    if (currentClearances.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                <p className="text-gray-500">
                    No clearances found.
                </p>
            </div>
        );
    }

    const headers = [
        "Party Name",
        "Party Code",
        "Clearance No",
        "Credit Limit",
        "Clearance Amount",
        "Remaining Outstanding Credit",
        "Available Credit After Clearance",
        "Payment Method",
        "Clearance Date",
        "Status",
        "Actions",
    ];

    // ============================================================
    // TABLE
    // ============================================================

    return (
        <div className="overflow-x-auto overflow-y-visible rounded-xl border border-gray-200 bg-white">
            <div className="w-full overflow-visible">
                <table className="w-full min-w-[1500px] table-fixed border-collapse">
                    <thead className="border-b border-gray-300 bg-[#F3F4F6]">
                        <tr>
                            {headers.map((header) => (
                                <th
                                    key={header}
                                    className={`px-4 py-3 text-left text-sm font-medium uppercase text-[#0F4659]/90 ${header === "Actions"
                                        ? "text-right"
                                        : ""
                                        }`}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {[...currentClearances]
                            .sort(
                                (a, b) =>
                                    Number(a.id || 0) -
                                    Number(b.id || 0)
                            )
                            .map((clearance, index) => {
                                const status = String(
                                    clearance?.status || ""
                                ).toUpperCase();

                                return (
                                    <tr
                                        key={clearance.id ?? index}
                                        onClick={() =>
                                            handleView(clearance)
                                        }
                                        className="cursor-pointer border-b border-gray-100 text-sm transition-colors hover:bg-gray-50"
                                    >
                                        {/* Party Name */}
                                        <td className="overflow-hidden px-3 py-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <div
                                                    className={`flex h-9 w-9 min-w-[36px] items-center justify-center rounded-full text-sm font-bold ${getAvatarColor(
                                                        clearance.partyName || ""
                                                    )}`}
                                                >
                                                    {initials(
                                                        clearance.partyName
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p
                                                        className="truncate font-medium text-gray-800"
                                                        title={
                                                            clearance.partyName || ""
                                                        }
                                                    >
                                                        {clearance.partyName || "—"}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        ID: #
                                                        {clearance.id ?? "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Party Code */}
                                        <td className="overflow-hidden px-3 py-3">
                                            <p
                                                className="truncate text-gray-700"
                                                title={clearance.partyCode || ""}
                                            >
                                                {clearance.partyCode || "—"}
                                            </p>
                                        </td>

                                        {/* Clearance No */}
                                        <td className="overflow-hidden px-3 py-3">
                                            <p
                                                className="truncate text-gray-700"
                                                title={clearance.clearanceNo || ""}
                                            >
                                                {clearance.clearanceNo || "—"}
                                            </p>
                                        </td>

                                        {/* Credit Limit */}
                                        <td className="overflow-hidden px-3 py-3">
                                            {formatAmount(
                                                clearance.creditLimit
                                            )}
                                        </td>

                                        {/* Clearance Amount */}
                                        <td className="overflow-hidden px-3 py-3">
                                            {formatAmount(
                                                clearance.clearanceAmount
                                            )}
                                        </td>

                                        {/* Remaining Outstanding Credit */}
                                        <td className="overflow-hidden px-3 py-3">
                                            {formatAmount(
                                                clearance.remainingOutstandingCredit
                                            )}
                                        </td>

                                        {/* Available Credit After Clearance */}
                                        <td className="overflow-hidden px-3 py-3">
                                            {formatAmount(
                                                clearance.availableCreditAfterClearance
                                            )}
                                        </td>

                                        {/* Payment Method */}
                                        <td className="overflow-hidden px-3 py-3">
                                            <p
                                                className="truncate text-gray-700"
                                                title={
                                                    clearance.paymentMethod || ""
                                                }
                                            >
                                                {clearance.paymentMethod || "—"}
                                            </p>
                                        </td>

                                        {/* Clearance Date */}
                                        <td className="overflow-hidden px-3 py-3">
                                            <p className="truncate text-gray-700">
                                                {clearance.clearanceDate
                                                    ? String(
                                                        clearance.clearanceDate
                                                    ).slice(0, 10)
                                                    : "—"}
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="overflow-hidden px-3 py-3">
                                            <span
                                                className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusColor[status] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {clearance.status || "—"}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleView(clearance);
                                                    }}
                                                    title="View"
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100 hover:text-blue-700"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleEdit(clearance);
                                                    }}
                                                    title="Edit"
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition hover:bg-amber-100 hover:text-amber-700"
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleDelete(clearance.id);
                                                    }}
                                                    title="Delete"
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>

                {/* Pagination summary */}
                <Pagination
                    page={Number(pageNumber) || 0}
                    size={Number(pageSize) || 10}
                    totalElements={Number(totalElements) || 0}
                    totalPages={Number(totalPages) || 0}
                    loading={loading}
                    label="clearances"
                    onPageChange={(nextPage) => {
                        dispatch(
                            fetchAllClearance({
                                page: nextPage,
                                size: Number(pageSize) || 10,
                            })
                        );
                    }}
                    onPageSizeChange={(nextSize) => {
                        dispatch(
                            fetchAllClearance({
                                page: 0,
                                size: nextSize,
                            })
                        );
                    }}
                />
            </div>
        </div>
    );
}
