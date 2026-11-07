
import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    Eye,
    Users,
    CalendarDays,
    Wallet,
    Mail,
    Phone,
    Edit,
    Trash2,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchAllParties,
    deleteParty,
} from "../thunks/partyThunks";

import {
    setExistingParty,
} from "../slices/partySlice";

import Pagination from "../../../common/pagination/table/Pagination";
import ToolTipText from "../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

const AVATAR_COLORS = [
    "bg-pink-500 text-white",
    "bg-green-500 text-white",
    "bg-blue-500 text-white",
    "bg-purple-500 text-white",
    "bg-orange-500 text-white",
    "bg-cyan-500 text-white",
    "bg-indigo-500 text-white",
];

const PARTY_STATUS_COLORS = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-700",
};

const PARTY_TYPE_COLORS = {
    CUSTOMER: "bg-blue-100 text-blue-700",
    SUPPLIER: "bg-purple-100 text-purple-700",
    BOTH: "bg-indigo-100 text-indigo-700",
};

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (value = "") => {
    return (
        String(value)
            .split(/[\s-]+/)
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "PT"
    );
};

const getAvatarColor = (value = "") => {
    const index = String(value)
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        % AVATAR_COLORS.length;

    return AVATAR_COLORS[index];
};

const formatAmount = (amount, currencyCode = "INR") => {
    const value = Number(amount ?? 0);

    return `${currencyCode ? `${currencyCode} ` : ""}${value.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
};

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getPrimaryAddress = (party) => {
    const addresses = Array.isArray(party?.addresses)
        ? party.addresses
        : [];

    return (
        addresses.find((address) => address?.primaryAddress) ||
        addresses[0] ||
        {}
    );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function PartyTable({
    parties,
    fetchParams = {},
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        parties: reduxParties = EMPTY_ARRAY,
        loading = false,
        actionLoading = false,
        error = null,
        pagination = {},
    } = useSelector((state) => state.party || {});

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

    const currentParties = Array.isArray(parties)
        ? parties
        : reduxParties;

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

                        return (
                            permissionAction === requestedAction &&
                            allowed
                        );
                    });
                }

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
        [hasFullAccess, permissions]
    );

    const canViewParty = hasPermission("Parties", "VIEW");
    const canEditParty = hasPermission("Parties", "EDIT");
    const canDeleteParty = hasPermission("Parties", "DELETE");

    /* =====================================================
       FETCH PARAMS
    ===================================================== */

    const getFetchParams = useCallback(
        (page, size) => ({
            ...fetchParams,
            page,
            size,
        }),
        [fetchParams]
    );

    const refreshParties = useCallback(
        (page = pageNumber, size = pageSize) => {
            dispatch(
                fetchAllParties(
                    getFetchParams(page, size)
                )
            );
        },
        [
            dispatch,
            getFetchParams,
            pageNumber,
            pageSize,
        ]
    );

    /* =====================================================
       VIEW PARTY
    ===================================================== */

    const handleView = (party) => {
        if (!canViewParty) {
            toast.error(
                "You do not have permission to view Parties."
            );
            return;
        }

        dispatch(setExistingParty(party));

        navigate(`/inventory/parties/view/${party.id}`);
    };

    /* =====================================================
       EDIT PARTY
    ===================================================== */

    const handleEdit = (party) => {
        if (!canEditParty) {
            toast.error(
                "You do not have permission to edit Parties."
            );
            return;
        }

        dispatch(setExistingParty(party));

        navigate(`/inventory/parties/edit/${party.id}`);
    };

    /* =====================================================
       DELETE PARTY
    ===================================================== */

    const handleDelete = async (party) => {
        if (!canDeleteParty) {
            toast.error(
                "You do not have permission to delete Parties."
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${party.partyName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await dispatch(
                deleteParty(party.id)
            ).unwrap();

            toast.success("Party deleted successfully.");

            refreshParties();
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : "Failed to delete party."
            );
        }
    };

    /* =====================================================
       SORTING
    ===================================================== */

    const sortedParties = useMemo(
        () => [...currentParties],
        [currentParties]
    );

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentParties.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-sm text-gray-500">
                    Loading parties...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentParties.length) {
        return (
            <div className="
                rounded-xl border border-red-200
                bg-white p-8 text-center
            ">
                <p className="text-sm text-red-500">
                    {typeof error === "string"
                        ? error
                        : "Failed to fetch parties"}
                </p>

                <button
                    type="button"
                    onClick={() => refreshParties()}
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

    if (!currentParties.length) {
        return (
            <div className="
                rounded-2xl border border-gray-200
                bg-white p-8 text-center
            ">
                <Users className="
                    mx-auto mb-3 h-10 w-10 text-gray-300
                " />

                <p className="text-sm text-gray-500">
                    No parties found.
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
                            "Party",
                            "Type",
                            "Contact",
                            "Credit Limit",
                            "Outstanding Credit",
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
                    {sortedParties.map((party) => {
                        const partyStatus = String(
                            party.status || ""
                        ).toUpperCase();

                        const partyType = String(
                            party.partyType || ""
                        ).toUpperCase();

                        const address = getPrimaryAddress(party);

                        const contactName =
                            party.contactPerson ||
                            party.partyName ||
                            "—";

                        const location = [
                            address.city,
                            address.state,
                        ]
                            .filter(Boolean)
                            .join(", ");

                        const currencyCode =
                            party.currencyCode || "INR";

                        return (
                            <tr
                                key={party.id}
                                className="
                                    border-b border-gray-100
                                    text-xs transition-colors
                                    hover:bg-gray-50
                                "
                            >

                                {/* PARTY */}

                                <td className="px-3 py-3">
                                    <div className="
                                        flex min-w-0 items-center gap-2
                                    ">
                                        <div
                                            className={`
                                                flex h-9 w-9 min-w-[36px]
                                                items-center justify-center
                                                rounded-full text-sm font-bold
                                                ${getAvatarColor(
                                                party.partyName
                                            )}
                                            `}
                                        >
                                            {getInitials(party.partyName)}
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className="
                                                    truncate font-medium
                                                    text-gray-800
                                                "
                                                title={party.partyName || ""}
                                            >
                                                {party.partyName || "—"}
                                            </p>

                                            <p className="
                                                mt-0.5 text-xs text-gray-500
                                            ">
                                                {party.partyCode || `ID: ${party.id}`}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* PARTY TYPE */}

                                <td className="px-3 py-3">
                                    <span
                                        className={`
                                            inline-block whitespace-nowrap
                                            rounded-full px-2.5 py-1
                                            text-xs font-medium
                                            ${PARTY_TYPE_COLORS[partyType] ||
                                            "bg-gray-100 text-gray-700"}
                                        `}
                                    >
                                        {party.partyType || "—"}
                                    </span>
                                </td>

                                {/* CONTACT */}

                                <td className="px-3 py-3">
                                    <div className="min-w-0 space-y-1">

                                        <p className="
                                            max-w-[180px] truncate
                                            font-medium text-gray-700
                                        ">
                                            {contactName}
                                        </p>

                                        {party.email && (
                                            <p className="
                                                flex max-w-[180px]
                                                items-center gap-1
                                                truncate text-xs text-gray-400
                                            ">
                                                <Mail
                                                    size={12}
                                                    className="shrink-0"
                                                />
                                                <span className="truncate">
                                                    {party.email}
                                                </span>
                                            </p>
                                        )}

                                        {party.phone && (
                                            <p className="
                                                flex items-center gap-1
                                                whitespace-nowrap
                                                text-xs text-gray-400
                                            ">
                                                <Phone size={12} />
                                                {party.phone}
                                            </p>
                                        )}

                                        {location && (
                                            <p className="
                                                max-w-[180px] truncate
                                                text-xs text-gray-400
                                            ">
                                                {location}
                                            </p>
                                        )}

                                    </div>
                                </td>

                                {/* CREDIT LIMIT */}

                                <td className="px-3 py-3">
                                    <div className="
                                        flex items-center gap-2
                                        whitespace-nowrap
                                    ">
                                        <Wallet
                                            size={14}
                                            className="text-gray-400"
                                        />

                                        <span className="
                                            font-medium text-gray-700
                                        ">
                                            {formatAmount(
                                                party.creditLimit,
                                                currencyCode
                                            )}
                                        </span>
                                    </div>
                                </td>

                                {/* OUTSTANDING CREDIT */}

                                <td className="px-3 py-3">
                                    <p className={`
                                        whitespace-nowrap font-semibold
                                        ${Number(party.outstandingCredit || 0) > 0
                                            ? "text-orange-600"
                                            : "text-gray-700"
                                        }
                                    `}>
                                        {formatAmount(
                                            party.outstandingCredit,
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
                                            ${PARTY_STATUS_COLORS[partyStatus] ||
                                            "bg-gray-100 text-gray-700"}
                                        `}
                                    >
                                        {party.status || "—"}
                                    </span>
                                </td>

                                {/* ACTIONS */}

                                <td className="px-4 py-3">
                                    <div className="
                                        relative flex items-center justify-end gap-2
                                    ">

                                        {canViewParty && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleView(party)
                                                }

                                                className="
                                                    group relative
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-blue-50
                                                    text-blue-600 transition
                                                    hover:bg-blue-100
                                                    hover:text-blue-700
                                                "
                                            >
                                                <Eye size={16} />
                                                <ToolTipText text="View" position="bottom" />
                                            </button>
                                        )}

                                        {canEditParty && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(party)
                                                }
                                                title="Edit"
                                                className="
                                                    group relative flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-green-50
                                                    text-green-600 transition
                                                    hover:bg-green-100
                                                    hover:text-green-700
                                                "
                                            >
                                                <Edit size={16} />
                                                <ToolTipText text="Edit" position="bottom" />
                                            </button>
                                        )}

                                        {canDeleteParty && (
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() =>
                                                    handleDelete(party)
                                                }
                                                title="Delete"
                                                className="
                                                    group relative 
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-red-50
                                                    text-red-600 transition
                                                    hover:bg-red-100
                                                    hover:text-red-700
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
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

            {/* PAGINATION */}

            <Pagination
                page={Number(pageNumber) || 0}
                size={Number(pageSize) || 20}
                totalElements={Number(totalElements) || 0}
                totalPages={Number(totalPages) || 0}
                loading={loading}
                label="parties"
                onPageChange={(nextPage) => {
                    refreshParties(
                        nextPage,
                        Number(pageSize) || 20
                    );
                }}
                onPageSizeChange={(nextSize) => {
                    refreshParties(0, nextSize);
                }}
            />
        </div>
    );
}
