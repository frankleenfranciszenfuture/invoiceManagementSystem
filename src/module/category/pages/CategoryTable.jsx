import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchAllCategories,
    deleteCategory,
} from "../thunks/categoryThunks";

import {
    setExsistingCategory,
} from "../slices/categorySlice";

import { openModal } from "../../ui/uiSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    List,
    Eye
} from "lucide-react";

import toast from "react-hot-toast";
import Pagination from "../../../common/pagination/table/Pagination";

export default function CategoryTable({
    categories = [],
}) {

    const dispatch = useDispatch();
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
        (state) => state.category || {}
    );

    const {
        pageNumber,
        pageSize,
        totalPages,
        totalElements,
    } = pagination || {};

    const currentCategories =
        categories || [];

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    /* =====================================================
       PERMISSION STATE
    ===================================================== */

    const permissions = useSelector(
        (state) =>
            state.menuPermission?.userPermissions || []
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
       
       Supports both:
       
       FLAT:
       {
           moduleName: "Categories",
           actionName: "EDIT",
           allowed: true
       }

       GROUPED:
       {
           moduleName: "Categories",
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
           SUPER ADMIN / ADMIN
        ================================================= */

        if (hasFullAccess) {
            return true;
        }

        /* =================================================
           INVALID PERMISSION STATE
        ================================================= */

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

        /* =================================================
           SEARCH PERMISSIONS
        ================================================= */

        return permissions.some(
            (permission) => {

                /* =========================================
                   MODULE
                ========================================= */

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
                   PERMISSION STATUS
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
                   GROUPED ACTIONS
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
                   FLAT ACTION
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
       CATEGORY PERMISSIONS
    ===================================================== */

    const canEditCategory =
        hasPermission(
            "Categories",
            "EDIT"
        );

    const canDeleteCategory =
        hasPermission(
            "Categories",
            "DELETE"
        );

    /* =====================================================
       DELETE CATEGORY
    ===================================================== */

    const handleDelete = async (id) => {

        /* =================================================
           PERMISSION SAFETY CHECK
        ================================================= */

        if (!canDeleteCategory) {

            toast.error(
                "You do not have permission to delete categories."
            );

            return;
        }

        /* =================================================
           CONFIRMATION
        ================================================= */

        if (
            !window.confirm(
                "Delete this category?"
            )
        ) {
            return;
        }

        try {

            await dispatch(
                deleteCategory(id)
            ).unwrap();

            toast.success(
                "Category deleted successfully"
            );

            /*
             * Refresh category list after successful delete.
             */
            dispatch(
                fetchAllCategories()
            );

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete category"
            );
        }
    };

    /* =====================================================
       VIEW CATEGORY
    ===================================================== */

    const handleView = (category) => {

        try {

            dispatch(
                setExsistingCategory(
                    category
                )
            );

            /*
             * Navigation can be added later.
             *
             * navigate(
             *     `/categories/view/${category.id}`
             * );
             */

        } catch (error) {

            toast.error(
                "Failed to open category"
            );
        }
    };

    /* =====================================================
       EDIT CATEGORY
    ===================================================== */

    const handleEdit = (category) => {

        /* =================================================
           PERMISSION SAFETY CHECK
        ================================================= */

        if (!canEditCategory) {

            toast.error(
                "You do not have permission to edit categories."
            );

            return;
        }

        try {

            dispatch(
                openModal({
                    type: "editCategory",
                    data: category,
                })
            );

        } catch (error) {

            toast.error(
                "Failed to open category"
            );
        }
    };

    /* =====================================================
       CATEGORY INITIALS
    ===================================================== */

    const initials = (name) =>
        name
            ?.split(" ")
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "CA";

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
       CATEGORY NAME COLOR
    ===================================================== */

    const getCategoryNameColor = (name) => {

        if (!name) {
            return "bg-gray-100 text-gray-700";
        }

        const hasNumber =
            /\d/.test(name);

        if (hasNumber) {
            return "bg-blue-100 text-blue-700";
        }

        return "bg-purple-100 text-purple-700";
    };

    /* =====================================================
       CATEGORY CODE COLOR
    ===================================================== */

    const getCategoryCodeColor = (
        categoryCode
    ) => {

        if (!categoryCode) {
            return "bg-gray-100 text-gray-700";
        }

        const value =
            categoryCode
                .trim()
                .toUpperCase();

        const lastPart =
            value
                .split("-")
                .pop();

        /* Last part contains only numbers */
        if (/^\d+$/.test(lastPart)) {
            return "bg-gray-100 text-orange-400";
        }

        /* Last part contains only letters */
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
                    Loading categories...
                </p>

            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentCategories.length) {

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

                <List
                    className="
                        mx-auto
                        mb-3
                        h-10
                        w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No categories found.
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
                                "CategoryName",
                                "CategoryCode",
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

                        {[...currentCategories]
                            .sort(
                                (a, b) =>
                                    (a.id || 0) -
                                    (b.id || 0)
                            )
                            .map(
                                (
                                    category,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            category.id ||
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
                                            CATEGORY NAME
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
                                                        category.categoryName
                                                    )}
                                                    `}
                                                >

                                                    {
                                                        initials(
                                                            category.categoryName
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
                                                            category.categoryName ||
                                                            ""
                                                        }
                                                    >
                                                        {
                                                            category.categoryName ||
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
                                                            category.id
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* =================================
                                            CATEGORY CODE
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
                                                    max-w-full
                                                    px-2.5
                                                    py-1
                                                    rounded-md
                                                    text-xs
                                                    font-medium
                                                    truncate
                                                    ${getCategoryCodeColor(
                                                    category.categoryCode
                                                )}
                                                `}
                                                title={
                                                    category.categoryCode ||
                                                    ""
                                                }
                                            >
                                                {
                                                    category.categoryCode ||
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
                                                className="
                                                    truncate
                                                    text-gray-700
                                                "
                                                title={
                                                    category.description ||
                                                    ""
                                                }
                                            >
                                                {
                                                    category.description ||
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
                                                    category.status
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                                `}
                                            >
                                                {
                                                    category.status ||
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
                                                        dispatch(setExsistingCategory(category));
                                                        navigate(`/categories/view/${category.id}`);
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

                                                        dispatch(setExsistingCategory(category));
                                                        dispatch(
                                                            openModal({
                                                                type: "editCategory",
                                                                data: category,
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
                                                        handleDelete(category.id);
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
                    label="categories"
                    onPageChange={(nextPage) => {
                        dispatch(
                            fetchAllCategories({
                                page: nextPage,
                                size: Number(pageSize) || 10,
                            })
                        );
                    }}
                    onPageSizeChange={(nextSize) => {
                        dispatch(
                            fetchAllCategories({
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