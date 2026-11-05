
import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    Eye,
    Users,
    Mail,
    Phone,
    Edit,
    Trash2,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchAllSalesPersons,
    deleteSalesPerson,
} from "../thunks/salesPersonThunks";

import {
    setExistingSalesPerson,
} from "../slices/salesPersonSlice";

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

const SALES_PERSON_STATUS_COLORS = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-700",
    DRAFT: "bg-yellow-100 text-yellow-700",
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
            .toUpperCase() || "SP"
    );
};

const getAvatarColor = (value = "") => {
    const index = String(value)
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        % AVATAR_COLORS.length;

    return AVATAR_COLORS[index];
};

/* =========================================================
   COMPONENT
========================================================= */

export default function SalesPersonTable({
    salesPersons,
    fetchParams = {},
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        salesPersons: reduxSalesPersons = EMPTY_ARRAY,
        loading = false,
        actionLoading = false,
        error = null,
        pagination = {},
    } = useSelector((state) => state.salesPerson || {});

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

    const currentSalesPersons = Array.isArray(salesPersons)
        ? salesPersons
        : reduxSalesPersons;

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

    const canViewSalesPerson = hasPermission(
        "Sales Persons",
        "VIEW"
    );

    const canEditSalesPerson = hasPermission(
        "Sales Persons",
        "EDIT"
    );

    const canDeleteSalesPerson = hasPermission(
        "Sales Persons",
        "DELETE"
    );

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

    const refreshSalesPersons = useCallback(
        (page = pageNumber, size = pageSize) => {
            dispatch(
                fetchAllSalesPersons(
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
       VIEW SALES PERSON
    ===================================================== */

    const handleView = (salesPerson) => {
        if (!canViewSalesPerson) {
            toast.error(
                "You do not have permission to view Sales Persons."
            );
            return;
        }

        dispatch(setExistingSalesPerson(salesPerson));

        navigate(`/salesPersons/view/${salesPerson.id}`);
    };

    /* =====================================================
       EDIT SALES PERSON
    ===================================================== */

    const handleEdit = (salesPerson) => {
        if (!canEditSalesPerson) {
            toast.error(
                "You do not have permission to edit Sales Persons."
            );
            return;
        }

        dispatch(setExistingSalesPerson(salesPerson));

        navigate(`/salesPersons/edit/${salesPerson.id}`);
    };

    /* =====================================================
       DELETE SALES PERSON
    ===================================================== */

    const handleDelete = async (salesPerson) => {
        if (!canDeleteSalesPerson) {
            toast.error(
                "You do not have permission to delete Sales Persons."
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${salesPerson.salesPersonName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await dispatch(
                deleteSalesPerson(salesPerson.id)
            ).unwrap();

            toast.success(
                "Sales Person deleted successfully."
            );

            refreshSalesPersons();
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : "Failed to delete Sales Person."
            );
        }
    };

    /* =====================================================
       SORTING
    ===================================================== */

    const sortedSalesPersons = useMemo(
        () => [...currentSalesPersons],
        [currentSalesPersons]
    );

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentSalesPersons.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-sm text-gray-500">
                    Loading sales persons...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentSalesPersons.length) {
        return (
            <div className="
                rounded-xl border border-red-200
                bg-white p-8 text-center
            ">
                <p className="text-sm text-red-500">
                    {typeof error === "string"
                        ? error
                        : "Failed to fetch sales persons"}
                </p>

                <button
                    type="button"
                    onClick={() => refreshSalesPersons()}
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

    if (!currentSalesPersons.length) {
        return (
            <div className="
                rounded-2xl border border-gray-200
                bg-white p-8 text-center
            ">
                <Users className="
                    mx-auto mb-3 h-10 w-10 text-gray-300
                " />

                <p className="text-sm text-gray-500">
                    No sales persons found.
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
                            "Sales Person",
                            "Type",
                            "Contact",
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
                    {sortedSalesPersons.map((salesPerson) => {
                        const salesPersonStatus = String(
                            salesPerson.status || ""
                        ).toUpperCase();

                        const salesPersonType = String(
                            salesPerson.salesPersonType || ""
                        ).toUpperCase();

                        return (
                            <tr
                                key={salesPerson.id}
                                className="
                                    border-b border-gray-100
                                    text-xs transition-colors
                                    hover:bg-gray-50
                                "
                            >

                                {/* SALES PERSON */}

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
                                                salesPerson.salesPersonName
                                            )}
                                            `}
                                        >
                                            {getInitials(
                                                salesPerson.salesPersonName
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className="
                                                    truncate font-medium
                                                    text-gray-800
                                                "
                                                title={
                                                    salesPerson.salesPersonName || ""
                                                }
                                            >
                                                {salesPerson.salesPersonName || "—"}
                                            </p>

                                            <p className="
                                                mt-0.5 text-xs text-gray-500
                                            ">
                                                {salesPerson.salesPersonCode ||
                                                    `ID: ${salesPerson.id}`}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* SALES PERSON TYPE */}

                                <td className="px-3 py-3">
                                    <span className="
                                        inline-block whitespace-nowrap
                                        rounded-full bg-blue-100
                                        px-2.5 py-1 text-xs
                                        font-medium text-blue-700
                                    ">
                                        {salesPerson.salesPersonType || "—"}
                                    </span>
                                </td>

                                {/* CONTACT */}

                                <td className="px-3 py-3">
                                    <div className="min-w-0 space-y-1">

                                        {salesPerson.email && (
                                            <p className="
                                                flex max-w-[200px]
                                                items-center gap-1
                                                truncate text-xs text-gray-500
                                            ">
                                                <Mail
                                                    size={12}
                                                    className="shrink-0"
                                                />

                                                <span className="truncate">
                                                    {salesPerson.email}
                                                </span>
                                            </p>
                                        )}

                                        {salesPerson.mobile && (
                                            <p className="
                                                flex items-center gap-1
                                                whitespace-nowrap
                                                text-xs text-gray-400
                                            ">
                                                <Phone size={12} />

                                                {salesPerson.mobile}
                                            </p>
                                        )}

                                        {!salesPerson.email &&
                                            !salesPerson.mobile && (
                                                <span className="text-gray-400">
                                                    —
                                                </span>
                                            )}

                                    </div>
                                </td>

                                {/* STATUS */}

                                <td className="px-3 py-3">
                                    <span
                                        className={`
                                            inline-block whitespace-nowrap
                                            rounded-full px-2.5 py-1
                                            text-xs font-medium
                                            ${SALES_PERSON_STATUS_COLORS[
                                            salesPersonStatus
                                            ] ||
                                            "bg-gray-100 text-gray-700"}
                                        `}
                                    >
                                        {salesPerson.status || "—"}
                                    </span>
                                </td>

                                {/* ACTIONS */}

                                <td className="px-4 py-3">
                                    <div className="
                                        relative flex items-center justify-end gap-2
                                    ">

                                        {canViewSalesPerson && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleView(salesPerson)
                                                }

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
                                                <ToolTipText text="View" position="bottom" />
                                            </button>
                                        )}

                                        {canEditSalesPerson && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(salesPerson)
                                                }

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

                                        {canDeleteSalesPerson && (
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() =>
                                                    handleDelete(salesPerson)
                                                }

                                                className="
                                                    group relative flex h-8 w-8
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
                label="sales persons"
                onPageChange={(nextPage) => {
                    refreshSalesPersons(
                        nextPage,
                        Number(pageSize) || 20
                    );
                }}
                onPageSizeChange={(nextSize) => {
                    refreshSalesPersons(0, nextSize);
                }}
            />
        </div>
    );
}
