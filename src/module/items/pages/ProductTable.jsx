
import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    Eye,
    Package,
    Tag,
    CalendarDays,
    Edit,
    Trash2,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchAllProducts,
    deleteProduct,
} from "../thunks/productThunks";

import {
    setExsistingProduct,
} from "../slices/productSlice";

import Pagination from "../../../common/pagination/table/Pagination";
import ToolTipText from "../../../common/toolTip/ToolTipText";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

const STATUS_COLORS = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-red-100 text-red-700",
    DRAFT: "bg-gray-100 text-gray-700",
};

/* =========================================================
   HELPERS
========================================================= */

const formatAmount = (amount) => {
    return Number(amount ?? 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
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

/* =========================================================
   COMPONENT
========================================================= */

export default function ProductTable({
    products,
    fetchParams = {},
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        products: reduxProducts = EMPTY_ARRAY,
        loading = false,
        actionLoading = false,
        error = null,
        pagination = {},
    } = useSelector((state) => state.product || {});

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

    const currentProducts = Array.isArray(products)
        ? products
        : reduxProducts;

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

                        if (action?.active === false) return false;

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

    const canViewProduct = hasPermission("Products", "VIEW");
    const canEditProduct = hasPermission("Products", "EDIT");
    const canDeleteProduct = hasPermission("Products", "DELETE");

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

    const refreshProducts = useCallback(
        (page = pageNumber, size = pageSize) => {
            dispatch(
                fetchAllProducts(
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
       VIEW PRODUCT
    ===================================================== */

    const handleView = (product) => {
        if (!canViewProduct) {
            toast.error(
                "You do not have permission to view products."
            );
            return;
        }

        dispatch(setExsistingProduct(product));

        navigate(`/invoice/items/view/${product.id}`);
    };

    /* =====================================================
       EDIT PRODUCT
    ===================================================== */

    const handleEdit = (product) => {
        if (!canEditProduct) {
            toast.error(
                "You do not have permission to edit products."
            );
            return;
        }

        dispatch(setExsistingProduct(product));

        navigate(`/invoice/items/edit/${product.id}`);
    };

    /* =====================================================
       DELETE PRODUCT
    ===================================================== */

    const handleDelete = async (product) => {
        if (!canDeleteProduct) {
            toast.error(
                "You do not have permission to delete products."
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.productName}"?`
        );

        if (!confirmed) return;

        try {
            await dispatch(
                deleteProduct(product.id)
            ).unwrap();

            toast.success("Product deleted successfully.");

            refreshProducts();
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : "Failed to delete product."
            );
        }
    };

    /* =====================================================
       SORTING
    ===================================================== */

    const sortedProducts = useMemo(
        () => [...currentProducts],
        [currentProducts]
    );

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentProducts.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-sm text-gray-500">
                    Loading products...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentProducts.length) {
        return (
            <div className="
                rounded-xl border border-red-200
                bg-white p-8 text-center
            ">
                <p className="text-sm text-red-500">
                    {typeof error === "string"
                        ? error
                        : "Failed to fetch products"}
                </p>

                <button
                    type="button"
                    onClick={() => refreshProducts()}
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

    if (!currentProducts.length) {
        return (
            <div className="
                rounded-2xl border border-gray-200
                bg-white p-8 text-center
            ">
                <Package className="
                    mx-auto mb-3 h-10 w-10 text-gray-300
                " />

                <p className="text-sm text-gray-500">
                    No products found.
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
                            "Product",
                            "Category",
                            "Subcategory",
                            "HSN Code",
                            "Selling Price",
                            "Purchase Price",
                            "Stock",
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
                    {sortedProducts.map((product) => {
                        const status = String(
                            product.status || ""
                        ).toUpperCase();

                        return (
                            <tr
                                key={product.id}
                                className="
                                    border-b border-gray-100
                                    text-xs transition-colors
                                    hover:bg-gray-50
                                "
                            >

                                {/* PRODUCT */}

                                <td className="px-3 py-3">
                                    <div className="
                                        flex min-w-0 items-center gap-2
                                    ">
                                        <div className="
                                            flex h-9 w-9 min-w-[36px]
                                            items-center justify-center
                                            rounded-lg bg-blue-50
                                            text-blue-600
                                        ">
                                            <Package size={17} />
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className="
                                                    truncate font-medium
                                                    text-gray-800
                                                "
                                                title={product.productName || ""}
                                            >
                                                {product.productName || "—"}
                                            </p>

                                            <p className="
                                                mt-0.5 text-xs text-gray-500
                                            ">
                                                {product.brand || "No brand"}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* CATEGORY */}

                                <td className="px-3 py-3">
                                    <p className="whitespace-nowrap text-gray-700">
                                        {product.category?.categoryName ||
                                            product.categoryName ||
                                            "—"}
                                    </p>
                                </td>

                                {/* SUBCATEGORY */}

                                <td className="px-3 py-3">
                                    <p className="whitespace-nowrap text-gray-700">
                                        {product.subCategory?.subCategoryName ||
                                            product.subCategoryName ||
                                            "—"}
                                    </p>
                                </td>

                                {/* HSN CODE */}

                                <td className="px-3 py-3">
                                    <span className="whitespace-nowrap text-gray-600">
                                        {product.hsnCode || "—"}
                                    </span>
                                </td>

                                {/* SELLING PRICE */}

                                <td className="px-3 py-3">
                                    <p className="
                                        whitespace-nowrap font-semibold
                                        text-gray-800
                                    ">
                                        ₹ {formatAmount(product.sellingPrice)}
                                    </p>
                                </td>

                                {/* PURCHASE PRICE */}

                                <td className="px-3 py-3">
                                    <p className="
                                        whitespace-nowrap text-gray-700
                                    ">
                                        ₹ {formatAmount(product.purchasingPrice)}
                                    </p>
                                </td>

                                {/* STOCK */}

                                <td className="px-3 py-3">
                                    <div className="whitespace-nowrap">
                                        <p className="font-medium text-gray-700">
                                            {product.currentStock ??
                                                product.stockQuantity ??
                                                0}
                                        </p>

                                        <p className="mt-0.5 text-xs text-gray-400">
                                            Min: {product.minimumStock ?? 0}
                                        </p>
                                    </div>
                                </td>

                                {/* STATUS */}

                                <td className="px-3 py-3">
                                    <span className={`
                                        inline-block whitespace-nowrap
                                        rounded-full px-2.5 py-1
                                        text-xs font-medium
                                        ${STATUS_COLORS[status] ||
                                        "bg-gray-100 text-gray-700"}
                                    `}>
                                        {product.status || "—"}
                                    </span>
                                </td>

                                {/* ACTIONS */}

                                <td className="px-4 py-3">
                                    <div className="
                                        relative flex items-center justify-end gap-2
                                    ">
                                        {canViewProduct && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleView(product)
                                                }
                                                title="View product"
                                                className="
                                                    group relative 
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-blue-50
                                                    text-blue-600 transition
                                                    hover:bg-blue-100
                                                "
                                            >
                                                <Eye size={16} />
                                                <ToolTipText text="View" position="bottom" />
                                            </button>
                                        )}

                                        {canEditProduct && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(product)
                                                }
                                                title="Edit product"
                                                className="
                                                    group relative flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-green-50
                                                    text-green-600 transition
                                                    hover:bg-green-100
                                                "
                                            >
                                                <Edit size={16} />
                                                <ToolTipText text="Edit" position="bottom" />
                                            </button>
                                        )}

                                        {canDeleteProduct && (
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() =>
                                                    handleDelete(product)
                                                }
                                                title="Delete product"
                                                className="
                                                    group relative flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-red-50
                                                    text-red-600 transition
                                                    hover:bg-red-100
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                "
                                            >
                                                <Trash2 size={16} />
                                                <ToolTipText text="View" position="bottom" />
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
                label="products"
                onPageChange={(nextPage) => {
                    refreshProducts(
                        nextPage,
                        Number(pageSize) || 20
                    );
                }}
                onPageSizeChange={(nextSize) => {
                    refreshProducts(0, nextSize);
                }}
            />
        </div>
    );
}
