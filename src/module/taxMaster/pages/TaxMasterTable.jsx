
import React, {
    useCallback,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    deleteTaxMaster,
    fetchAllTaxMasters,
} from "../thunks/taxMasterThunks";

import {
    setExsistingTaxMaster,
} from "../slices/taxMasterSlice";

import {
    Edit,
    Trash2,
    Receipt,
    Eye,
    Percent,
    Layers,
} from "lucide-react";

import toast from "react-hot-toast";

import Pagination from "../../../common/pagination/table/Pagination";
import ToolTipText from "../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

const STATUS_COLORS = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-700",
    DRAFT: "bg-yellow-100 text-yellow-700",
};

const AVATAR_COLORS = [
    "bg-pink-500 text-white",
    "bg-green-500 text-white",
    "bg-blue-500 text-white",
    "bg-purple-500 text-white",
    "bg-orange-500 text-white",
    "bg-cyan-500 text-white",
    "bg-indigo-500 text-white",
];

/* =========================================================
   HELPERS
========================================================= */

const normalizeAction = (value) =>
    String(value ?? "").trim().toUpperCase();

const normalizeModule = (value) =>
    String(value ?? "").trim().toLowerCase();

const getInitials = (taxName) => {
    if (!taxName) {
        return "TX";
    }

    return (
        String(taxName)
            .split(" ")
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "TX"
    );
};

const getAvatarColor = (name = "") => {
    const index = String(name)
        .split("")
        .reduce(
            (acc, char) => acc + char.charCodeAt(0),
            0
        ) % AVATAR_COLORS.length;

    return AVATAR_COLORS[index];
};

const getTaxTypeLabel = (taxType) => {
    switch (String(taxType || "").toUpperCase()) {
        case "CGST_SGST":
            return "CGST + SGST";

        case "IGST":
            return "IGST";

        default:
            return taxType || "—";
    }
};

const formatRate = (rate) => {
    if (
        rate === null ||
        rate === undefined ||
        rate === ""
    ) {
        return "—";
    }

    return `${Number(rate).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}%`;
};

const getDisplayStatus = (taxMaster) => {
    if (taxMaster?.status) {
        return String(taxMaster.status).toUpperCase();
    }

    if (
        taxMaster?.active === true ||
        taxMaster?.audit?.active === true
    ) {
        return "ACTIVE";
    }

    if (
        taxMaster?.active === false ||
        taxMaster?.audit?.active === false
    ) {
        return "INACTIVE";
    }

    return "UNKNOWN";
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TaxMasterTable({
    taxMasters = [],
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const taxMasterState = useSelector(
        (state) => state.taxMaster
    );

    const loading = taxMasterState?.loading === true;
    const error = taxMasterState?.error;

    const pagination = taxMasterState?.pagination || {};

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

    /* =====================================================
       FILTERED DATA FROM DASHBOARD

       Dashboard owns search and status filtering.
       Do not select the complete taxMasters list again.
    ===================================================== */

    const currentTaxMasters = Array.isArray(taxMasters)
        ? taxMasters
        : EMPTY_ARRAY;

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    /* =====================================================
       PERMISSIONS
    ===================================================== */

    const permissionsFromRedux = useSelector(
        (state) => state.menuPermission?.userPermissions
    );

    const permissions = Array.isArray(permissionsFromRedux)
        ? permissionsFromRedux
        : EMPTY_ARRAY;

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

                /* GROUPED ACTIONS */

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

                /* FLAT ACTION */

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
       TAX MASTER PERMISSIONS
    ===================================================== */

    const canViewTaxMaster = hasPermission("Taxes", "VIEW");
    const canEditTaxMaster = hasPermission("Taxes", "EDIT");
    const canDeleteTaxMaster = hasPermission("Taxes", "DELETE");

    /* =====================================================
       DELETE TAX MASTER
    ===================================================== */

    const handleDelete = async (id) => {
        if (!canDeleteTaxMaster) {
            toast.error(
                "You do not have permission to delete tax masters."
            );
            return;
        }

        if (!window.confirm("Delete this tax master?")) {
            return;
        }

        try {
            await dispatch(deleteTaxMaster(id)).unwrap();

            toast.success(
                "Tax master deleted successfully."
            );

            await dispatch(fetchAllTaxMasters()).unwrap();

        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete tax master."
            );
        }
    };

    /* =====================================================
       VIEW TAX MASTER
    ===================================================== */

    const handleView = (taxMaster) => {
        if (!canViewTaxMaster) {
            toast.error(
                "You do not have permission to view tax masters."
            );
            return;
        }

        dispatch(setExsistingTaxMaster(taxMaster));

        navigate(`/settings/taxes/view/${taxMaster.id}`);
    };

    /* =====================================================
       EDIT TAX MASTER
    ===================================================== */

    const handleEdit = (taxMaster) => {
        if (!canEditTaxMaster) {
            toast.error(
                "You do not have permission to edit tax masters."
            );
            return;
        }

        dispatch(setExsistingTaxMaster(taxMaster));

        navigate(`/settings/taxes/edit/${taxMaster.id}`);
    };

    /* =====================================================
       PAGINATION HANDLERS

       NOTE:
       Current fetchAllTaxMasters thunk accepts no arguments.
       These callbacks refresh the current endpoint only.
       True server-side pagination requires updating the thunk
       and reducer to accept page and size parameters.
    ===================================================== */

    const handlePageChange = useCallback(() => {
        dispatch(fetchAllTaxMasters());
    }, [dispatch]);

    const handlePageSizeChange = useCallback(() => {
        dispatch(fetchAllTaxMasters());
    }, [dispatch]);

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-gray-500">
                    Loading tax masters...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {
        return (
            <div
                className="
                    rounded-xl border border-red-200
                    bg-white p-8 text-center
                "
            >
                <p className="text-red-500">
                    {error}
                </p>
            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentTaxMasters.length) {
        return (
            <div
                className="
                    rounded-2xl border border-gray-200
                    bg-white p-8 text-center
                "
            >
                <Receipt
                    className="
                        mx-auto mb-3 h-10 w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No tax masters found.
                </p>
            </div>
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    return (
        <div
            className="
                overflow-x-auto overflow-y-visible
                rounded-xl border border-gray-200 bg-white
            "
        >
            <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full">

                    {/* TABLE HEADER */}

                    <thead
                        className="
                            border-b border-gray-300
                            bg-[#FAF9F7]/20
                        "
                    >
                        <tr>
                            {[
                                "Tax Master",
                                "Tax Type",
                                "Tax Rate",
                                "CGST",
                                "SGST",
                                "IGST",
                                "Status",
                                "Actions",
                            ].map((header) => (
                                <th
                                    key={header}
                                    className={`
                                        px-5 py-3 text-md
                                        font-medium uppercase
                                        text-gray-400 whitespace-nowrap
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
                        {currentTaxMasters.map((taxMaster, index) => {
                            const status = getDisplayStatus(taxMaster);

                            return (
                                <tr
                                    key={taxMaster.id || index}
                                    className="
                                        cursor-pointer border-b
                                        border-gray-100 text-xs
                                        transition-colors hover:bg-gray-50
                                    "
                                >

                                    {/* TAX MASTER */}

                                    <td className="overflow-hidden px-2 py-3">
                                        <div
                                            className="
                                                flex min-w-0 items-center gap-2
                                            "
                                        >
                                            <div
                                                className={`
                                                    flex h-9 min-w-[36px]
                                                    w-9 items-center justify-center
                                                    rounded-full text-sm font-bold
                                                    ${getAvatarColor(
                                                    taxMaster.taxName
                                                )}
                                                `}
                                            >
                                                {getInitials(taxMaster.taxName)}
                                            </div>

                                            <div className="min-w-0">
                                                <p
                                                    className="
                                                        truncate font-medium
                                                        text-gray-800
                                                    "
                                                    title={taxMaster.taxName || ""}
                                                >
                                                    {taxMaster.taxName || "—"}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    ID: #{taxMaster.id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* TAX TYPE */}

                                    <td className="overflow-hidden px-2 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <Layers
                                                size={13}
                                                className="text-gray-400"
                                            />

                                            <p className="font-medium text-gray-700">
                                                {getTaxTypeLabel(taxMaster.taxType)}
                                            </p>
                                        </div>
                                    </td>

                                    {/* TAX RATE */}

                                    <td className="overflow-hidden px-2 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <Percent
                                                size={13}
                                                className="text-gray-400"
                                            />

                                            <p className="
                                                font-semibold text-gray-800
                                            ">
                                                {formatRate(taxMaster.taxRate)}
                                            </p>
                                        </div>
                                    </td>

                                    {/* CGST */}

                                    <td className="overflow-hidden px-2 py-3">
                                        <p className="font-medium text-gray-700">
                                            {formatRate(taxMaster.cgstRate)}
                                        </p>
                                    </td>

                                    {/* SGST */}

                                    <td className="overflow-hidden px-2 py-3">
                                        <p className="font-medium text-gray-700">
                                            {formatRate(taxMaster.sgstRate)}
                                        </p>
                                    </td>

                                    {/* IGST */}

                                    <td className="overflow-hidden px-2 py-3">
                                        <p className="font-medium text-gray-700">
                                            {formatRate(taxMaster.igstRate)}
                                        </p>
                                    </td>

                                    {/* STATUS */}

                                    <td className="overflow-hidden px-2 py-3">
                                        <span
                                            className={`
                                                inline-block rounded-full
                                                px-2 py-1 text-xs font-medium
                                                ${STATUS_COLORS[status] ||
                                                "bg-gray-100 text-gray-700"
                                                }
                                            `}
                                        >
                                            {status === "UNKNOWN" ? "—" : status}
                                        </span>
                                    </td>

                                    {/* ACTIONS */}

                                    <td className="px-4 py-3">
                                        <div
                                            className="
                                                flex items-center justify-end gap-2
                                            "
                                        >

                                            {/* VIEW */}

                                            {canViewTaxMaster && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleView(taxMaster);
                                                    }}
                                                    title="View"
                                                    className="
                                                        group relative flex h-8 w-8
                                                        items-center justify-center
                                                        rounded-lg bg-blue-50
                                                        text-blue-600 transition
                                                        hover:bg-blue-100
                                                        hover:text-blue-700
                                                    "
                                                >
                                                    <Eye size={16} />

                                                    <ToolTipText
                                                        text="View"
                                                        position="bottom"
                                                    />
                                                </button>
                                            )}

                                            {/* EDIT */}

                                            {canEditTaxMaster && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(taxMaster);
                                                    }}
                                                    title="Edit"
                                                    className="
                                                        group relative flex h-8 w-8
                                                        items-center justify-center
                                                        rounded-lg bg-amber-50
                                                        text-amber-600 transition
                                                        hover:bg-amber-100
                                                        hover:text-amber-700
                                                    "
                                                >
                                                    <Edit size={16} />

                                                    <ToolTipText
                                                        text="Edit"
                                                        position="bottom"
                                                    />
                                                </button>
                                            )}

                                            {/* DELETE */}

                                            {canDeleteTaxMaster && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(taxMaster.id);
                                                    }}
                                                    title="Delete"
                                                    className="
                                                        group relative flex h-8 w-8
                                                        items-center justify-center
                                                        rounded-lg bg-red-50
                                                        text-red-600 transition
                                                        hover:bg-red-100
                                                        hover:text-red-700
                                                    "
                                                >
                                                    <Trash2 size={16} />

                                                    <ToolTipText
                                                        text="Delete"
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
                    label="tax masters"
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>
        </div>
    );
}
