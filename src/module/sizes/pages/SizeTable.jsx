import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    fetchAllSizes,
    deleteSize,
} from "../thunks/sizeThunks";

import {
    setExsistingSize,
} from "../slices/sizeSlice";

import { openModal } from "../../ui/uiSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    Ruler,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";
import Pagination from "../../../common/pagination/table/Pagination";

export default function SizeTable({
    sizes = [],
}) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showEdit, setShowEdit] = useState(false);
    const [showView, setShowView] = useState(false);
    /* =====================================================
       AUTH USER
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    /* =====================================================
       MENU PERMISSIONS
    ===================================================== */

    const permissions = useSelector(
        (state) =>
            Array.isArray(state.menuPermission?.userPermissions)
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
       PERMISSION HELPER
    ===================================================== */

    const hasPermission = (
        moduleName,
        actionName
    ) => {

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

        return permissions.some((permission) => {

            const permissionModule =
                String(
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

            /* =============================================
               IGNORE INACTIVE PERMISSION
            ============================================= */

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

            /* =============================================
               GROUPED ACTIONS
            ============================================= */

            if (Array.isArray(permission?.actions)) {

                return permission.actions.some((action) => {

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
                        permissionAction === requestedAction &&
                        allowed
                    );
                });
            }

            /* =============================================
               FLAT PERMISSION
            ============================================= */

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
                permissionAction === requestedAction &&
                allowed
            );
        });
    };

    /* =====================================================
       SIZE PERMISSIONS
    ===================================================== */

    const canEditSize =
        hasPermission("Sizes", "EDIT");

    const canDeleteSize =
        hasPermission("Sizes", "DELETE");

    const canPerformAction =
        canEditSize || canDeleteSize;

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
        pagination,
    } = useSelector(
        (state) => state.size || {}
    );

    const {
        pageNumber,
        pageSize,
        totalPages,
        totalElements,
    } = pagination || {};

    const currentSizes =
        sizes || [];

    /* =====================================================
       DELETE SIZE
    ===================================================== */

    const handleDelete = async (id) => {

        /* =============================================
           PERMISSION LOADING
        ============================================= */

        if (
            !hasFullAccess &&
            !permissionsLoaded
        ) {
            toast.error(
                "Permissions are still loading. Please try again."
            );

            return;
        }

        /* =============================================
           DELETE PERMISSION
        ============================================= */

        if (!canDeleteSize) {

            toast.error(
                "You do not have permission to delete sizes."
            );

            return;
        }

        if (!window.confirm("Delete this size?")) {
            return;
        }

        try {

            await dispatch(
                deleteSize(id)
            ).unwrap();

            toast.success(
                "Size deleted successfully"
            );

            dispatch(
                fetchAllSizes()
            );

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete size"
            );
        }
    };

    /* =====================================================
       VIEW SIZE
    ===================================================== */

    const handleView = (size) => {

        try {

            dispatch(
                setExsistingSize(
                    size
                )
            );

            navigate(
                `/sizes/view/${size.id}`
            );

        } catch (error) {

            toast.error(
                "Failed to open size"
            );
        }
    };

    /* =====================================================
       EDIT SIZE
    ===================================================== */

    const handleEdit = (size) => {

        /* =============================================
           PERMISSION LOADING
        ============================================= */

        if (
            !hasFullAccess &&
            !permissionsLoaded
        ) {
            toast.error(
                "Permissions are still loading. Please try again."
            );

            return;
        }

        /* =============================================
           EDIT PERMISSION
        ============================================= */

        if (!canEditSize) {

            toast.error(
                "You do not have permission to edit sizes."
            );

            return;
        }

        try {

            dispatch(
                openModal({
                    type: "editSize",
                    data: size,
                })
            );

        } catch (error) {

            toast.error(
                "Failed to open size"
            );
        }
    };

    /* =====================================================
       SIZE INITIALS
    ===================================================== */

    const initials = (sizeName) =>
        sizeName
            ?.split(" ")
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "SZ";

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
       SHORT NAME COLOR
    ===================================================== */

    const getShortNameColor = (sizeName) => {

        if (!sizeName) {
            return "bg-gray-100 text-gray-700";
        }

        const hasNumber =
            /\d/.test(sizeName);

        if (hasNumber) {
            return "bg-blue-100 text-blue-700";
        }

        return "bg-purple-100 text-purple-700";
    };

    /* =====================================================
       SIZE CODE COLOR
    ===================================================== */

    const getSizeCode = (sizeCode) => {

        if (!sizeCode) {
            return "bg-gray-100 text-gray-700";
        }

        const value =
            sizeCode
                .trim()
                .toUpperCase();

        const lastPart =
            value
                .split("-")
                .pop();

        if (/^\d+$/.test(lastPart)) {
            return "bg-gray-100 text-orange-400";
        }

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
        (permissionLoading || !permissionsLoaded)
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
                    Loading sizes...
                </p>

            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentSizes.length) {

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

                <Ruler
                    className="
                        mx-auto
                        mb-3
                        h-10
                        w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No sizes found.
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
                                "SizeName",
                                "SizeShortName",
                                "SizeCode",
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

                        {[...currentSizes]
                            .sort(
                                (a, b) =>
                                    (a.id || 0) -
                                    (b.id || 0)
                            )
                            .map(
                                (
                                    size,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            size.id ||
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
                                            SIZE NAME
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
                                                        size.sizeName
                                                    )}
                                                    `}
                                                >

                                                    {
                                                        initials(
                                                            size.sizeName
                                                        )
                                                    }

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
                                                            size.sizeName ||
                                                            ""
                                                        }
                                                    >
                                                        {
                                                            size.sizeName ||
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
                                                            size.id
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* =================================
                                            SIZE SHORT NAME
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
                                                    px-2
                                                    py-1
                                                    rounded-md
                                                    text-xs
                                                    font-medium
                                                    ${getShortNameColor(
                                                    size.sizeShortName
                                                )}
                                                `}
                                                title={
                                                    size.sizeShortName ||
                                                    ""
                                                }
                                            >
                                                {
                                                    size.sizeShortName ||
                                                    "—"
                                                }
                                            </p>

                                        </td>

                                        {/* =================================
                                            SIZE CODE
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
                                                    inline-flex
                                                    items-center
                                                    w-fit
                                                    px-2.5
                                                    py-1
                                                    rounded-md
                                                    text-xs
                                                    font-medium
                                                    ${getSizeCode(
                                                    size.sizeCode
                                                )}
                                                `}
                                                title={
                                                    size.sizeCode ||
                                                    ""
                                                }
                                            >
                                                {
                                                    size.sizeCode ||
                                                    "—"
                                                }
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
                                                title={
                                                    size.description ||
                                                    ""
                                                }
                                            >
                                                {
                                                    size.description ||
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
                                                    size.status
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                                `}
                                            >
                                                {
                                                    size.status ||
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
                                                        dispatch(setExsistingSize(size));
                                                        navigate(`/sizes/view/${size.id}`);
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

                                                        dispatch(setExsistingSize(size));
                                                        dispatch(
                                                            openModal({
                                                                type: "editSize",
                                                                data: size,
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
                                                        handleDelete(size.id);
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
                            fetchAllSizes({
                                page: nextPage,
                                size: Number(pageSize) || 10,
                            })
                        );
                    }}
                    onPageSizeChange={(nextSize) => {
                        dispatch(
                            fetchAllSizes({
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