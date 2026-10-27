
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    fetchAllTaxMasters,
    deleteTaxMaster,
} from "../thunks/taxMasterThunks";

import {
    setExsistingTaxMaster,
} from "../slices/taxMasterSlice"

import { openModal } from "../../ui/uiSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    Receipt,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";
import Pagination from "../../../common/pagination/table/Pagination";

export default function TaxMasterTable({
    taxMasters = [],
}) {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
        pagination,
    } = useSelector(
        (state) => state.taxMaster || {}
    );

    const {
        pageNumber,
        pageSize,
        totalPages,
        totalElements,
    } = pagination || {};

    const currentTaxMasters =
        taxMasters || [];

    /* =====================================================
       AUTH
    ===================================================== */

    const user = useSelector(
        (state) =>
            state.auth?.user
    );

    /* =====================================================
       USER PERMISSIONS
    ===================================================== */

    const permissions = useSelector(
        (state) =>
            Array.isArray(
                state.menuPermission?.userPermissions
            )
                ? state.menuPermission.userPermissions
                : []
    );

    const permissionLoading = useSelector(
        (state) =>
            state.menuPermission
                ?.userPermissionsLoading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission
                ?.userPermissionsLoaded === true
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

    const normalizedRole =
        String(roleName)
            .trim()
            .toUpperCase();

    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";

    const isAdmin =
        normalizedRole === "ADMIN";

    const hasFullAccess =
        isSuperAdmin ||
        isAdmin;

    /* =====================================================
       PERMISSION CHECKER

       Supports:

       FLAT

       {
           moduleName: "TaxMasters",
           actionName: "EDIT",
           allowed: true
       }

       GROUPED

       {
           moduleName: "TaxMasters",
           actions: [
               {
                   actionName: "EDIT",
                   allowed: true
               }
           ]
       }
    ===================================================== */

    const hasPermission = (
        moduleName,
        actionName
    ) => {

        /* =================================================
           ADMIN / SUPER_ADMIN
        ================================================= */

        if (hasFullAccess) {
            return true;
        }

        if (!Array.isArray(permissions)) {
            return false;
        }

        const requestedModule =
            String(moduleName)
                .trim()
                .toLowerCase();

        const requestedAction =
            String(actionName)
                .trim()
                .toUpperCase();

        return permissions.some(
            (permission) => {

                const permissionModule =
                    String(
                        permission?.moduleName ||
                        permission?.module?.moduleName ||
                        permission?.module?.name ||
                        ""
                    )
                        .trim()
                        .toLowerCase();

                if (
                    permissionModule !==
                    requestedModule
                ) {
                    return false;
                }

                /* =========================================
                   IGNORE INACTIVE PERMISSION
                ========================================= */

                if (
                    permission?.active === false
                ) {
                    return false;
                }

                if (
                    String(
                        permission?.status || ""
                    )
                        .trim()
                        .toUpperCase() ===
                    "INACTIVE"
                ) {
                    return false;
                }

                /* =========================================
                   GROUPED PERMISSION
                ========================================= */

                if (
                    Array.isArray(
                        permission?.actions
                    )
                ) {

                    return permission.actions.some(
                        (action) => {

                            const permissionAction =
                                String(
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
                                permissionAction ===
                                requestedAction &&
                                allowed
                            );
                        }
                    );
                }

                /* =========================================
                   FLAT PERMISSION
                ========================================= */

                const permissionAction =
                    String(
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
                    permissionAction ===
                    requestedAction &&
                    allowed
                );
            }
        );
    };

    /* =====================================================
       TAX MASTER PERMISSIONS
    ===================================================== */

    const canEditTaxMaster =
        hasPermission(
            "TaxMasters",
            "EDIT"
        );

    const canDeleteTaxMaster =
        hasPermission(
            "TaxMasters",
            "DELETE"
        );

    /* =====================================================
       ANY ACTION AVAILABLE
    ===================================================== */

    const canPerformAction =
        canEditTaxMaster ||
        canDeleteTaxMaster;

    /* =====================================================
       DELETE TAX MASTER
    ===================================================== */

    const handleDelete = async (
        id
    ) => {

        /* =================================================
           PERMISSION CHECK
        ================================================= */

        if (
            !hasFullAccess &&
            !permissionsLoaded
        ) {

            toast.error(
                "Permissions are still loading. Please try again."
            );

            return;
        }

        if (
            !canDeleteTaxMaster
        ) {

            toast.error(
                "You do not have permission to delete tax masters."
            );

            return;
        }

        /* =================================================
           CONFIRM
        ================================================= */

        if (
            !window.confirm(
                "Delete this tax master?"
            )
        ) {
            return;
        }

        try {

            await dispatch(
                deleteTaxMaster(id)
            ).unwrap();

            toast.success(
                "Tax master deleted successfully"
            );

            dispatch(
                fetchAllTaxMasters()
            );

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete tax master"
            );
        }
    };

    /* =====================================================
       VIEW TAX MASTER
    ===================================================== */

    const handleView = (
        taxMaster
    ) => {

        try {

            dispatch(
                setExsistingTaxMaster(
                    taxMaster
                )
            );

            navigate(
                `/tax-masters/view/${taxMaster.id}`
            );

        } catch (error) {

            toast.error(
                "Failed to open tax master"
            );
        }
    };

    /* =====================================================
       EDIT TAX MASTER
    ===================================================== */

    const handleEdit = (
        taxMaster
    ) => {

        /* =================================================
           PERMISSION CHECK
        ================================================= */

        if (
            !hasFullAccess &&
            !permissionsLoaded
        ) {

            toast.error(
                "Permissions are still loading. Please try again."
            );

            return;
        }

        if (
            !canEditTaxMaster
        ) {

            toast.error(
                "You do not have permission to edit tax masters."
            );

            return;
        }

        try {

            dispatch(
                openModal({
                    type: "editTaxMaster",
                    data: taxMaster,
                })
            );

        } catch (error) {

            toast.error(
                "Failed to open tax master"
            );
        }
    };

    /* =====================================================
       TAX MASTER INITIALS
    ===================================================== */

    const initials = (
        taxName
    ) =>
        taxName
            ?.split(" ")
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() ||
        "TX";

    /* =====================================================
       STATUS COLORS
    ===================================================== */

    const statusColor = {

        ACTIVE:
            "bg-green-100 text-green-700",

        INACTIVE:
            "bg-gray-100 text-gray-700",

        DRAFT:
            "bg-yellow-100 text-yellow-700",

    };

    /* =====================================================
       TAX TYPE COLORS
    ===================================================== */

    const taxTypeColor = {

        CGST_SGST:
            "bg-blue-100 text-blue-700",

        IGST:
            "bg-purple-100 text-purple-700",

    };

    /* =====================================================
       AVATAR COLORS
    ===================================================== */

    const avatarColors = [

        "bg-pink-500 text-white",
        "bg-green-500 text-white",
        "bg-blue-500 text-white",
        "bg-purple-500 text-white",
        "bg-orange-500 text-white",
        "bg-cyan-500 text-white",
        "bg-indigo-500 text-white",

    ];

    const getAvatarColor = (
        name = ""
    ) => {

        const index =
            name
                .split("")
                .reduce(
                    (
                        acc,
                        char
                    ) =>
                        acc +
                        char.charCodeAt(0),
                    0
                ) %
            avatarColors.length;

        return avatarColors[index];
    };

    /* =====================================================
       FORMAT RATE
    ===================================================== */

    const formatRate = (
        value
    ) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "0.00";
        }

        return Number(value)
            .toFixed(2);
    };

    /* =====================================================
       PERMISSION LOADING
    ===================================================== */

    if (
        !hasFullAccess &&
        (
            permissionLoading ||
            !permissionsLoaded
        )
    ) {

        return (

            <div
                className="
                flex
                items-center
                justify-center
                py-10
                "
            >

                <p
                    className="
                    text-sm
                    text-gray-500
                    "
                >
                    Loading permissions...
                </p>

            </div>
        );
    }

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div
                className="
                flex
                items-center
                justify-center
                py-10
                "
            >

                <p
                    className="
                    text-gray-500
                    "
                >
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
                bg-white
                rounded-xl
                border
                border-red-200
                p-8
                text-center
                "
            >

                <p
                    className="
                    text-red-500
                    "
                >
                    {error}
                </p>

            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (
        !currentTaxMasters.length
    ) {

        return (

            <div
                className="
                bg-white
                rounded-2xl
                border
                border-gray-200
                p-8
                text-center
                "
            >

                <Receipt
                    className="
                    mx-auto
                    mb-3
                    h-10
                    w-10
                    text-gray-300
                    "
                />

                <p
                    className="
                    text-gray-500
                    "
                >
                    No tax masters found.
                </p>

            </div>
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    return (

        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto overflow-y-visible">
            <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full">
                    <thead className="bg-[#FEFEFD]/20 border-b border-gray-300">
                        <tr>

                            {[
                                "Tax Name",
                                "Tax Type",
                                "Tax Rate",
                                "CgstRate",
                                "sgstRate",
                                "igstRate",
                                "description",
                                "Status",
                                "Actions",
                            ].map((header) => (

                                <th
                                    key={header}
                                    className={`
                                    px-4
                                    py-3
                                    font-medium
                                    text-md
                                    text-gray-400
                                    uppercase
                                    ${header === "Actions"
                                            ? "text-center"
                                            : "text-left"
                                        }
                                `}
                                >
                                    {header}
                                </th>

                            ))}

                        </tr>

                    </thead>



                    {/* =================================================
                        TABLE BODY
                    ================================================= */}

                    <tbody>

                        {[...currentTaxMasters]
                            .sort(
                                (a, b) =>
                                    a.id - b.id
                            )
                            .map(
                                (
                                    taxMaster,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            taxMaster.id ||
                                            index
                                        }
                                        className="
                                        border-b
                                        border-gray-100
                                        hover:bg-gray-50
                                        text-xs
                                        cursor-pointer
                                        transition-colors
                                        "
                                    >

                                        {/* =================================
                                            TAX NAME
                                        ================================= */}

                                        <td
                                            className="
                                            px-2
                                            py-3
                                            overflow-hidden
                                            "
                                        >

                                            <div
                                                className="
                                                flex
                                                items-center
                                                gap-2
                                                min-w-0
                                                "
                                            >

                                                <div
                                                    className={`
                                                    w-9
                                                    h-9
                                                    min-w-[36px]
                                                    rounded-full
                                                    flex
                                                    items-center
                                                    justify-center
                                                    text-sm
                                                    font-bold
                                                    ${getAvatarColor(
                                                        taxMaster.taxName
                                                    )}
                                                    `}
                                                >
                                                    {
                                                        initials(
                                                            taxMaster.taxName
                                                        )
                                                    }
                                                </div>

                                                <div
                                                    className="
                                                    min-w-0
                                                    "
                                                >

                                                    <p
                                                        className="
                                                        font-medium
                                                        text-gray-800
                                                        truncate
                                                        "
                                                        title={
                                                            taxMaster.taxName ||
                                                            ""
                                                        }
                                                    >
                                                        {
                                                            taxMaster.taxName ||
                                                            "—"
                                                        }
                                                    </p>

                                                    <p
                                                        className="
                                                        text-xs
                                                        text-gray-500
                                                        "
                                                    >
                                                        ID: #
                                                        {
                                                            taxMaster.id
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* =================================
                                            TAX TYPE
                                        ================================= */}

                                        <td
                                            className="
                                            px-2
                                            py-3
                                            overflow-hidden
                                            "
                                        >

                                            <span
                                                className={`
                                                inline-block
                                                max-w-full
                                                px-2
                                                py-1
                                                rounded-full
                                                text-xs
                                                font-medium
                                                truncate
                                                ${taxTypeColor[
                                                    taxMaster.taxType
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                                `}
                                                title={
                                                    taxMaster.taxType ||
                                                    ""
                                                }
                                            >
                                                {
                                                    taxMaster.taxType ||
                                                    "—"
                                                }
                                            </span>

                                        </td>

                                        {/* =================================
                                            TAX RATE
                                        ================================= */}

                                        <td
                                            className="
                                            px-2
                                            py-3
                                            font-medium
                                            whitespace-nowrap
                                            "
                                        >
                                            {formatRate(
                                                taxMaster.taxRate
                                            )}
                                            %
                                        </td>

                                        {/* =================================
                                            CGST
                                        ================================= */}

                                        <td
                                            className="
                                            px-2
                                            py-3
                                            whitespace-nowrap
                                            "
                                        >
                                            {formatRate(
                                                taxMaster.cgstRate
                                            )}
                                            %
                                        </td>

                                        {/* =================================
                                            SGST
                                        ================================= */}

                                        <td
                                            className="
                                            px-2
                                            py-3
                                            whitespace-nowrap
                                            "
                                        >
                                            {formatRate(
                                                taxMaster.sgstRate
                                            )}
                                            %
                                        </td>

                                        {/* =================================
                                            IGST
                                        ================================= */}

                                        <td
                                            className="
                                            px-2
                                            py-3
                                            whitespace-nowrap
                                            "
                                        >
                                            {formatRate(
                                                taxMaster.igstRate
                                            )}
                                            %
                                        </td>

                                        {/* =================================
                                            DESCRIPTION
                                        ================================= */}

                                        <td
                                            className="
                                            px-2
                                            py-3
                                            overflow-hidden
                                            "
                                        >

                                            <p
                                                className="
                                                truncate
                                                text-gray-600
                                                "
                                                title={
                                                    taxMaster.description ||
                                                    ""
                                                }
                                            >
                                                {
                                                    taxMaster.description ||
                                                    "—"
                                                }
                                            </p>

                                        </td>

                                        {/* =================================
                                            STATUS
                                        ================================= */}

                                        <td
                                            className="
                                            px-2
                                            py-3
                                            overflow-hidden
                                            "
                                        >

                                            <span
                                                className={`
                                                inline-block
                                                px-2
                                                py-1
                                                rounded-full
                                                text-xs
                                                font-medium
                                                ${statusColor[
                                                    taxMaster.status
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                                `}
                                            >
                                                {
                                                    taxMaster.status ||
                                                    "—"
                                                }
                                            </span>

                                        </td>

                                        {/* =================================
                                            ACTIONS
                                        ================================= */}


                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">

                                                {/* View */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowView(true);
                                                        dispatch(setExsistingTaxMaster(taxMaster));
                                                        navigate(`/settings/taxes/view/${taxMaster.id}`);
                                                    }}
                                                    title="View"
                                                    className="
                                                flex h-8 w-8 items-center justify-center
                                                rounded-lg
                                                bg-blue-50
                                                text-blue-600
                                                transition
                                                hover:bg-blue-100
                                                hover:text-blue-700
                                            "
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        dispatch(setExsistingTaxMaster(taxMaster));
                                                        dispatch(
                                                            openModal({
                                                                type: "editTaxMaster",
                                                                data: taxMaster,
                                                            })
                                                        );
                                                    }}
                                                    title="Edit"
                                                    className="
                                                        flex h-8 w-8 items-center justify-center
                                                        rounded-lg
                                                        bg-amber-50
                                                        text-amber-600
                                                        transition
                                                        hover:bg-amber-100
                                                        hover:text-amber-700
                                                            "
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        // Your delete confirmation logic
                                                        handleDelete(taxMaster.id);
                                                    }}
                                                    title="Delete"
                                                    className="
                                                    flex h-8 w-8 items-center justify-center
                                                    rounded-lg
                                                    bg-red-50
                                                    text-red-600
                                                    transition
                                                    hover:bg-red-100
                                                    hover:text-red-700
                                                "
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>

                                )
                            )}

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
                    label="taxes"
                    onPageChange={(nextPage) => {
                        dispatch(
                            fetchAllTaxMasters({
                                page: nextPage,
                                size: Number(pageSize) || 10,
                            })
                        );
                    }}
                    onPageSizeChange={(nextSize) => {
                        dispatch(
                            fetchAllTaxMasters({
                                page: 0,
                                size: nextSize,
                            })
                        );
                    }}
                />


            </div>

        </div >
    );
}
