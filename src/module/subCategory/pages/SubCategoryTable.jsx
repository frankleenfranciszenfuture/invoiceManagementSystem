
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
    FolderTree,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchAllSubCategories,
    deleteSubCategory,
} from "../thunks/subCategoryThunks";

import {
    setExsistingSubCategory,
} from "../slices/subCategorySlice";

import Pagination from "../../../common/pagination/table/Pagination";
import ToolTipText from "../.././../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

/* =========================================================
   COMPONENT
========================================================= */

export default function SubCategoryTable({
    fetchParams = {},
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        subCategories: reduxSubCategories = EMPTY_ARRAY,
        loading,
        error,
        pagination = {},
    } = useSelector(
        (state) => state.subCategory || {}
    );

    const currentSubCategories = Array.isArray(reduxSubCategories)
        ? reduxSubCategories
        : EMPTY_ARRAY;

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

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

    const canViewSubCategory = hasPermission(
        "Sub Categories",
        "VIEW"
    );

    const canEditSubCategory = hasPermission(
        "Sub Categories",
        "EDIT"
    );

    const canDeleteSubCategory = hasPermission(
        "Sub Categories",
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

    /* =====================================================
       REFRESH SUBCATEGORIES
    ===================================================== */

    const refreshSubCategories = useCallback(
        (page = pageNumber, size = pageSize) => {
            dispatch(
                fetchAllSubCategories(
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
       DELETE SUBCATEGORY
    ===================================================== */

    const handleDelete = async (id) => {
        if (!canDeleteSubCategory) {
            toast.error(
                "You do not have permission to delete Subcategory."
            );
            return;
        }

        if (!window.confirm("Delete this Subcategory?")) {
            return;
        }

        try {
            await dispatch(
                deleteSubCategory(id)
            ).unwrap();

            toast.success(
                "Subcategory deleted successfully"
            );

            const nextPage =
                currentSubCategories.length === 1 && pageNumber > 0
                    ? pageNumber - 1
                    : pageNumber;

            refreshSubCategories(
                nextPage,
                pageSize
            );

        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete Subcategory"
            );
        }
    };

    /* =====================================================
       VIEW SUBCATEGORY
    ===================================================== */

    const handleView = (subCategory) => {
        if (!canViewSubCategory) {
            toast.error(
                "You do not have permission to view Subcategories."
            );
            return;
        }

        dispatch(
            setExsistingSubCategory(subCategory)
        );

        navigate(
            `/settings/subCategoires/view/${subCategory.id}`
        );
    };

    /* =====================================================
       EDIT SUBCATEGORY
    ===================================================== */

    const handleEdit = (subCategory) => {
        if (!canEditSubCategory) {
            toast.error(
                "You do not have permission to edit Subcategory."
            );
            return;
        }

        dispatch(
            setExsistingSubCategory(subCategory)
        );

        navigate(
            `/settings/subCategoires/edit/${subCategory.id}`
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
                .toUpperCase() || "SC"
        );
    };

    /* =====================================================
       AVATAR COLORS
    ===================================================== */

    const AVATAR_COLORS = [
        "bg-pink-500 text-white",
        "bg-green-500 text-white",
        "bg-blue-500 text-white",
        "bg-purple-500 text-white",
        "bg-orange-500 text-white",
        "bg-cyan-500 text-white",
        "bg-indigo-500 text-white",
    ];

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

    const sortedSubCategories = useMemo(
        () => [...currentSubCategories],
        [currentSubCategories]
    );

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentSubCategories.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-gray-500">
                    Loading subcategories...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentSubCategories.length) {
        return (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
                <p className="text-red-500">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() => refreshSubCategories()}
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

    if (!currentSubCategories.length) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <Tags className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                <p className="text-gray-500">
                    No subcategories found.
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
                            "Subcategory",
                            "Category",
                            "Description",
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
                    {sortedSubCategories.map((subCategory) => {

                        const categoryName =
                            subCategory.category?.categoryName ||
                            subCategory.categoryName ||
                            "—";

                        const categoryCode =
                            subCategory.category?.categoryCode ||
                            subCategory.categoryCode ||
                            "";

                        return (
                            <tr
                                key={subCategory.id}
                                className="
                                    cursor-pointer border-b border-gray-100
                                    text-xs transition-colors hover:bg-gray-50
                                "
                            >

                                {/* SUBCATEGORY */}

                                <td className="overflow-hidden px-3 py-3">
                                    <div className="flex min-w-0 items-center gap-2">

                                        <div
                                            className={`
                                                flex h-9 w-9 min-w-[36px]
                                                items-center justify-center
                                                rounded-full text-sm font-bold
                                                ${getAvatarColor(subCategory.subCategoryName)}
                                            `}
                                        >
                                            {initials(subCategory.subCategoryName)}
                                        </div>

                                        <div className="min-w-0">

                                            <p
                                                className="truncate font-medium text-gray-800"
                                                title={subCategory.subCategoryName || ""}
                                            >
                                                {subCategory.subCategoryName || "—"}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {subCategory.subCategoryCode || "—"}
                                            </p>

                                        </div>
                                    </div>
                                </td>

                                {/* CATEGORY */}

                                <td className="px-3 py-3">
                                    <div className="flex items-center gap-2">

                                        <FolderTree
                                            size={15}
                                            className="text-gray-400"
                                        />

                                        <div className="min-w-0">

                                            <p
                                                className="truncate font-medium text-gray-700"
                                                title={categoryName}
                                            >
                                                {categoryName}
                                            </p>

                                            {categoryCode && (
                                                <p className="text-xs text-gray-500">
                                                    {categoryCode}
                                                </p>
                                            )}

                                        </div>
                                    </div>
                                </td>

                                {/* DESCRIPTION */}

                                <td className="max-w-[260px] px-3 py-3">
                                    <p
                                        className="truncate font-medium text-gray-700"
                                        title={subCategory.description || ""}
                                    >
                                        {subCategory.description || "—"}
                                    </p>
                                </td>

                                {/* ACTIONS */}

                                <td className="px-4 py-3">
                                    <div className="relative flex items-center justify-end gap-2">

                                        {/* VIEW */}

                                        {canViewSubCategory && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleView(subCategory);
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

                                        {canEditSubCategory && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(subCategory);
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

                                        {canDeleteSubCategory && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(subCategory.id);
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
                label="subcategories"
                onPageChange={(nextPage) => {
                    refreshSubCategories(
                        nextPage,
                        Number(pageSize) || 20
                    );
                }}
                onPageSizeChange={(nextSize) => {
                    refreshSubCategories(0, nextSize);
                }}
            />

        </div>
    );
}
