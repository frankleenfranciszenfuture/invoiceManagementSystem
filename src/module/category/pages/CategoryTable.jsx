
import React, { useCallback, useMemo } from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    useNavigate,
} from "react-router-dom";

import {
    Edit,
    Trash2,
    Tags,
    Eye,
    Layers,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchAllCategories,
    deleteCategory,
} from "../thunks/categoryThunks";

import {
    setExsistingCategory,
} from "../slices/categorySlice";

import Pagination from "../../../common/pagination/table/Pagination";
import ToolTipText from "../.././../common/toolTip/ToolTipText";

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

const STATUS_COLORS = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-700",
    DRAFT: "bg-yellow-100 text-yellow-700",
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CategoryTable({
    fetchParams = {},
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        categories: reduxCategories = EMPTY_ARRAY,
        loading,
        error,
        pagination = {},
    } = useSelector(
        (state) => state.category || {}
    );

    const currentCategories = Array.isArray(reduxCategories)
        ? reduxCategories
        : EMPTY_ARRAY;

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

    /* =====================================================
       CATEGORY STATUS
    ===================================================== */

    const categoryStatus = useSelector(
        (state) => {
            const status = String(
                state.categoryView?.status || "ALL"
            )
                .trim()
                .toUpperCase();

            return [
                "ALL",
                "ACTIVE",
                "INACTIVE",
                "DRAFT",
            ].includes(status)
                ? status
                : "ALL";
        }
    );

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
                            action?.name ||
                            ""
                        )
                            .trim()
                            .toUpperCase();

                        const allowed =
                            action?.allowed === true ||
                            action?.allowed === "true";

                        if (action?.active === false) {
                            return false;
                        }

                        if (
                            String(action?.status || "").toUpperCase() ===
                            "INACTIVE"
                        ) {
                            return false;
                        }

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

    const canViewCategory = hasPermission(
        "Categories",
        "VIEW"
    );

    const canEditCategory = hasPermission(
        "Categories",
        "EDIT"
    );

    const canDeleteCategory = hasPermission(
        "Categories",
        "DELETE"
    );

    /* =====================================================
       FETCH PARAMS
    ===================================================== */

    const getFetchParams = useCallback(
        (page, size) => ({
            ...fetchParams,

            // Redux status always takes priority.
            status:
                categoryStatus === "ALL"
                    ? undefined
                    : categoryStatus,

            page,
            size,
        }),
        [
            fetchParams,
            categoryStatus,
        ]
    );

    /* =====================================================
       REFRESH CATEGORIES
    ===================================================== */

    const refreshCategories = useCallback(
        (page = pageNumber, size = pageSize) => {
            dispatch(
                fetchAllCategories(
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
       DELETE CATEGORY
    ===================================================== */

    const handleDelete = async (id) => {
        if (!canDeleteCategory) {
            toast.error(
                "You do not have permission to delete Category."
            );
            return;
        }

        if (!window.confirm("Delete this Category?")) {
            return;
        }

        try {
            await dispatch(
                deleteCategory(id)
            ).unwrap();

            toast.success(
                "Category deleted successfully"
            );

            const nextPage =
                currentCategories.length === 1 && pageNumber > 0
                    ? pageNumber - 1
                    : pageNumber;

            refreshCategories(
                nextPage,
                pageSize
            );

        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete Category"
            );
        }
    };

    /* =====================================================
       VIEW CATEGORY
    ===================================================== */

    const handleView = (category) => {
        if (!canViewCategory) {
            toast.error(
                "You do not have permission to view Categories."
            );
            return;
        }

        dispatch(
            setExsistingCategory(category)
        );

        navigate(
            `/settings/categories/view/${category.id}`
        );
    };

    /* =====================================================
       EDIT CATEGORY
    ===================================================== */

    const handleEdit = (category) => {
        if (!canEditCategory) {
            toast.error(
                "You do not have permission to edit Category."
            );
            return;
        }

        dispatch(
            setExsistingCategory(category)
        );

        navigate(
            `/settings/categories/edit/${category.id}`
        );
    };

    /* =====================================================
       INITIALS
    ===================================================== */

    const initials = (name = "") => {
        return (
            String(name)
                .split(" ")
                .filter(Boolean)
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "CA"
        );
    };

    /* =====================================================
       AVATAR COLORS
    ===================================================== */

    const getAvatarColor = (name = "") => {
        const index = String(name)
            .split("")
            .reduce(
                (acc, char) => acc + char.charCodeAt(0),
                0
            ) % AVATAR_COLORS.length;

        return AVATAR_COLORS[index];
    };

    /* =====================================================
       SORTING
    ===================================================== */

    const sortedCategories = useMemo(
        () => [...currentCategories],
        [currentCategories]
    );

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentCategories.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-gray-500">
                    Loading categories...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentCategories.length) {
        return (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
                <p className="text-red-500">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() => refreshCategories()}
                    className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentCategories.length) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <Tags className="mx-auto mb-3 h-10 w-10 text-gray-300" />

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
        <div className="overflow-x-auto overflow-y-visible rounded-xl border border-gray-200 bg-white">

            <table className="w-full">

                <thead className="border-b border-gray-300 bg-[#FAF9F7]/20">
                    <tr>
                        {[
                            "Category",
                            "Description",
                            "Subcategories",
                            "Status",
                            "Actions",
                        ].map((header) => (
                            <th
                                key={header}
                                className={`
                                    px-5 py-3 text-md font-medium
                                    uppercase text-gray-400
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

                <tbody>
                    {sortedCategories.map((category) => (

                        <tr
                            key={category.id}
                            className="
                                cursor-pointer border-b border-gray-100
                                text-xs transition-colors hover:bg-gray-50
                            "
                        >

                            {/* CATEGORY */}

                            <td className="overflow-hidden px-3 py-3">
                                <div className="flex min-w-0 items-center gap-2">

                                    <div
                                        className={`
                                            flex h-9 w-9 min-w-[36px]
                                            items-center justify-center
                                            rounded-full text-sm font-bold
                                            ${getAvatarColor(category.categoryName)}
                                        `}
                                    >
                                        {initials(category.categoryName)}
                                    </div>

                                    <div className="min-w-0">

                                        <p
                                            className="truncate font-medium text-gray-800"
                                            title={category.categoryName || ""}
                                        >
                                            {category.categoryName || "—"}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {category.categoryCode || "—"}
                                        </p>

                                    </div>
                                </div>
                            </td>

                            {/* DESCRIPTION */}

                            <td className="max-w-[260px] px-3 py-3">
                                <p
                                    className="truncate font-medium text-gray-700"
                                    title={category.description || ""}
                                >
                                    {category.description || "—"}
                                </p>
                            </td>

                            {/* SUBCATEGORIES */}

                            <td className="px-3 py-3">
                                <div className="flex items-center gap-2 text-gray-700">

                                    <Layers
                                        size={14}
                                        className="text-gray-400"
                                    />

                                    <span className="font-medium">
                                        {Array.isArray(category.subCategories)
                                            ? category.subCategories.length
                                            : 0
                                        }
                                    </span>

                                    <span className="text-gray-400">
                                        {category.subCategories?.length === 1
                                            ? "Subcategory"
                                            : "Subcategories"
                                        }
                                    </span>

                                </div>
                            </td>

                            {/* STATUS */}

                            <td className="px-3 py-3">
                                <span
                                    className={`
                                        inline-block rounded-full px-2 py-1
                                        text-xs font-medium
                                        ${STATUS_COLORS[
                                        String(category.status || "").toUpperCase()
                                        ] || "bg-gray-100 text-gray-700"
                                        }
                                    `}
                                >
                                    {category.status || "—"}
                                </span>
                            </td>

                            {/* ACTIONS */}

                            <td className="px-4 py-3">
                                <div className="relative flex items-center justify-end gap-2">

                                    {/* VIEW */}

                                    {canViewCategory && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleView(category);
                                            }}
                                            className="
                                                group relative flex h-8 w-8 items-center justify-center
                                                rounded-lg bg-blue-50 text-blue-600
                                                transition hover:bg-blue-100 hover:text-blue-700
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

                                    {canEditCategory && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(category);
                                            }}
                                            className="
                                                group relative flex h-8 w-8 items-center justify-center
                                                rounded-lg bg-amber-50 text-amber-600
                                                transition hover:bg-amber-100 hover:text-amber-700
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

                                    {canDeleteCategory && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(category.id);
                                            }}
                                            title="Delete"
                                            className="
                                                group relative flex h-8 w-8 items-center justify-center
                                                rounded-lg bg-red-50 text-red-600
                                                transition hover:bg-red-100 hover:text-red-700
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

                    ))}
                </tbody>

            </table>

            {/* PAGINATION */}

            <Pagination
                page={Number(pageNumber) || 0}
                size={Number(pageSize) || 20}
                totalElements={Number(totalElements) || 0}
                totalPages={Number(totalPages) || 0}
                loading={loading}
                label="categories"
                onPageChange={(nextPage) => {
                    refreshCategories(
                        nextPage,
                        Number(pageSize) || 20
                    );
                }}
                onPageSizeChange={(nextSize) => {
                    refreshCategories(0, nextSize);
                }}
            />

        </div>
    );
}
