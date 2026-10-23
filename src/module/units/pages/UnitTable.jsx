import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchAllUnits,
    deleteUnit,
} from "../thunks/unitThunks";

import { setExsistingUnit } from "../../units/slices/unitSlice";
import { openModal } from "../../ui/uiSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    Scale,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";
import Pagination from "../../../common/pagination/table/Pagination";

export default function UnitTable({
    units = [],
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);


    /* =====================================================
       PERMISSION STATE
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
            state.menuPermission?.userPermissionsLoading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoaded === true
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
        isSuperAdmin || isAdmin;

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = (
        moduleName,
        actionName
    ) => {

        // SUPER_ADMIN / ADMIN
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

                // Ignore inactive permission
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
                   GROUPED PERMISSION FORMAT
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
                   FLAT PERMISSION FORMAT
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
       UNIT PERMISSIONS
    ===================================================== */

    const canEditUnit =
        hasPermission(
            "Units",
            "EDIT"
        );

    const canDeleteUnit =
        hasPermission(
            "Units",
            "DELETE"
        );

    const canPerformAction =
        canEditUnit ||
        canDeleteUnit;

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
        pagination,
    } = useSelector(
        (state) => state.unit || {}
    );

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination || {};

    const currentUnits =
        units || [];

    /* =====================================================
       DELETE UNIT
    ===================================================== */

    const handleDelete = async (id) => {

        // =================================================
        // PERMISSION LOADING
        // =================================================

        if (
            !hasFullAccess &&
            !permissionsLoaded
        ) {
            toast.error(
                "Permissions are still loading. Please try again."
            );
            return;
        }

        // =================================================
        // DELETE PERMISSION
        // =================================================

        if (!canDeleteUnit) {
            toast.error(
                "You do not have permission to delete units."
            );
            return;
        }

        if (
            !window.confirm(
                "Delete this unit?"
            )
        ) {
            return;
        }

        try {

            await dispatch(
                deleteUnit(id)
            ).unwrap();

            toast.success(
                "Unit deleted successfully"
            );

            dispatch(
                fetchAllUnits()
            );

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete unit"
            );
        }
    };

    /* =====================================================
       EDIT UNIT
    ===================================================== */

    const handleEdit = (unit) => {

        // =================================================
        // PERMISSION LOADING
        // =================================================

        if (
            !hasFullAccess &&
            !permissionsLoaded
        ) {
            toast.error(
                "Permissions are still loading. Please try again."
            );
            return;
        }

        // =================================================
        // EDIT PERMISSION
        // =================================================

        if (!canEditUnit) {
            toast.error(
                "You do not have permission to edit units."
            );
            return;
        }

        try {

            dispatch(
                openModal({
                    type: "editUnit",
                    data: unit,
                })
            );

        } catch (error) {

            toast.error(
                "Failed to open unit"
            );
        }
    };

    /* =====================================================
       UNIT INITIALS
    ===================================================== */

    const initials = (unitName = "") =>
        unitName
            .split(" ")
            .filter(Boolean)
            .map(
                (word) => word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "UN";

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
       SHORT NAME COLORS
    ===================================================== */

    const getShortNameColor = (
        unitShortName
    ) => {

        if (!unitShortName) {
            return "bg-gray-100 text-gray-700";
        }

        const value =
            unitShortName
                .trim()
                .toUpperCase();

        if (/\d/.test(value)) {
            return "bg-blue-100 text-blue-700";
        }

        return "bg-purple-100 text-purple-700";
    };

    /* =====================================================
       UNIT CODE COLORS
    ===================================================== */

    const getUniCode = (
        unitCode
    ) => {

        if (!unitCode) {
            return "bg-gray-100 text-gray-700";
        }

        const value =
            unitCode
                .trim()
                .toUpperCase();

        // Get the last part after "-"
        const lastPart =
            value
                .split("-")
                .pop();

        // Last part is only numbers
        if (/^\d+$/.test(lastPart)) {
            return "bg-gray-100 text-orange-400";
        }

        // Last part contains letters
        if (/^[A-Z]+$/.test(lastPart)) {
            return "bg-gray-100 text-pink-400";
        }

        return "bg-gray-100 text-gray-700";
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
       PERMISSION LOADING
    ===================================================== */

    if (
        !hasFullAccess &&
        (permissionLoading ||
            !permissionsLoaded)
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
                <p className="text-sm text-gray-500">
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
                <p className="text-gray-500">
                    Loading units...
                </p>
            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentUnits.length) {
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
                <Scale
                    className="
                        mx-auto
                        mb-3
                        h-10
                        w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No units found.
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
                    <thead className="bg-[#FAF9F7]/20 border-b border-gray-300">
                        <tr>

                            {[
                                "UnitName",
                                "UnitShortName",
                                "UnitCode",
                                "Description",
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

                        {[...currentUnits]
                            .sort(
                                (a, b) =>
                                    (a.id || 0) -
                                    (b.id || 0)
                            )
                            .map(
                                (
                                    unit,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            unit.id ||
                                            index
                                        }
                                        className="
                                            border-b
                                            border-gray-100
                                            hover:bg-gray-50
                                            text-sm
                                            cursor-pointer
                                            transition-colors
                                        "
                                    >

                                        {/* =================================
                                            UNIT NAME
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

                                                {/* AVATAR */}

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
                                                        unit.unitName
                                                    )}
                                                    `}
                                                >
                                                    {initials(
                                                        unit.unitName
                                                    )}
                                                </div>

                                                {/* NAME */}

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
                                                            unit.unitName ||
                                                            ""
                                                        }
                                                    >
                                                        {unit.unitName ||
                                                            "—"}
                                                    </p>

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-gray-500
                                                        "
                                                    >
                                                        ID: #{unit.id}
                                                    </p>
                                                </div>

                                            </div>
                                        </td>

                                        {/* =================================
                                            UNIT SHORT NAME
                                        ================================= */}

                                        <td
                                            className="
                                                px-2
                                                py-3
                                                overflow-hidden
                                            "
                                        >
                                            <p
                                                className={`
                                                    truncate
                                                    inline-block
                                                    max-w-full
                                                    px-2
                                                    py-1
                                                    rounded-md
                                                    text-xs
                                                    font-medium
                                                    ${getShortNameColor(
                                                    unit.unitShortName
                                                )}
                                                `}
                                                title={
                                                    unit.unitShortName ||
                                                    ""
                                                }
                                            >
                                                {unit.unitShortName ||
                                                    "—"}
                                            </p>
                                        </td>

                                        {/* =================================
                                            UNIT CODE
                                        ================================= */}

                                        <td
                                            className="
                                                px-2
                                                py-3
                                                overflow-hidden
                                            "
                                        >
                                            <p
                                                className={`
                                                    truncate
                                                    inline-block
                                                    max-w-full
                                                    px-2
                                                    py-1
                                                    rounded-md
                                                    text-xs
                                                    font-medium
                                                    ${getUniCode(
                                                    unit.unitCode
                                                )}
                                                `}
                                                title={
                                                    unit.unitCode ||
                                                    ""
                                                }
                                            >
                                                {unit.unitCode ||
                                                    "—"}
                                            </p>
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
                                                "
                                                title={
                                                    unit.description ||
                                                    ""
                                                }
                                            >
                                                {unit.description ||
                                                    "—"}
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
                                                    unit.status
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                                `}
                                            >
                                                {unit.status ||
                                                    "—"}
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
                                                        dispatch(setExsistingUnit(unit));
                                                        navigate(`/units/view/${unit.id}`);
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

                                                        dispatch(setExsistingUnit(unit));
                                                        dispatch(
                                                            openModal({
                                                                type: "editUnit",
                                                                data: unit,
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
                                                        handleDelete(product.id);
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
                    label="products"
                    onPageChange={(nextPage) => {
                        dispatch(
                            fetchAllUnits({
                                page: nextPage,
                                size: Number(pageSize) || 10,
                            })
                        );
                    }}
                    onPageSizeChange={(nextSize) => {
                        dispatch(
                            fetchAllUnits({
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