import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    fetchAllProducts,
    fetchProductById,
    deleteProduct,
} from "../thunks/productThunks";

import {
    setExsistingProduct,
} from "../slices/productSlice";

import {
    ChevronDown,
    Edit,
    Trash2,
    Package,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";

export default function ProductTable({ products = [] }) {



    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
       ===================================================== */

    const {
        loading,
        error,
        pagination,
    } = useSelector((state) => state.product);

    const {
        pageNumber,
        pageSize,
        totalPages,
        totalElements,
    } = pagination || {};

    const currentProducts = products || [];

    /* =====================================================
       DELETE PRODUCT
       ===================================================== */

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this product?")) {
            return;
        }

        try {
            await dispatch(deleteProduct(id)).unwrap();

            toast.success("Product deleted successfully");

            /*
             * Reload list after delete.
             * This keeps pagination/list in sync with backend.
             */
            dispatch(fetchAllProducts());

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message || "Failed to delete product"
            );
        }
    };

    /* =====================================================
       VIEW PRODUCT
       ===================================================== */

    const handleView = async (product) => {

        try {

            /*
             * Store selected product immediately
             */
            dispatch(setExsistingProduct(product));

            /*
             * Navigate to view page
             */
            navigate(`/items/view/${product.id}`);

        } catch (error) {

            toast.error("Failed to open product");
        }
    };

    /* =====================================================
       EDIT PRODUCT
       ===================================================== */

    const handleEdit = async (product) => {

        try {

            dispatch(setExsistingProduct(product));

            navigate(`/products/edit/${product.id}`);

        } catch (error) {

            toast.error("Failed to open product");
        }
    };

    /* =====================================================
       AVATAR / PRODUCT INITIALS
       ===================================================== */

    const initials = (productName) =>
        productName
            ?.split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "PR";

    /* =====================================================
       STATUS COLORS
       ===================================================== */

    const statusColor = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-gray-100 text-gray-700",
        DRAFT: "bg-yellow-100 text-yellow-700",
    };

    /* =====================================================
       PRODUCT AVATAR COLORS
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

    const getAvatarColor = (name = "") => {

        const index =
            name
                .split("")
                .reduce(
                    (acc, char) => acc + char.charCodeAt(0),
                    0
                ) % avatarColors.length;

        return avatarColors[index];
    };

    /* =====================================================
       LOADING
       ===================================================== */

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-gray-500">
                    Loading products...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
       ===================================================== */

    if (error) {
        return (
            <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
                <p className="text-red-500">
                    {error}
                </p>
            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
       ===================================================== */

    if (!currentProducts.length) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">

                <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                <p className="text-gray-500">
                    No products found.
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

                    {/* =================================================
                        TABLE HEADER
                    ================================================= */}

                    <thead className="bg-gray-100 border-b border-gray-300">

                        <tr>

                            {[
                                "Product",
                                "SKU",
                                "Category",
                                "HSN",
                                "Selling Price",
                                "Purchase Price",
                                "Tax",
                                "Status",
                                "Actions",
                            ].map((header) => (

                                <th
                                    key={header}
                                    className={`px-4 py-3 font-medium text-sm text-gray-600 uppercase ${header === "Actions"
                                        ? "text-right"
                                        : "text-left"
                                        }`}
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

                        {[...currentProducts]
                            .sort((a, b) => a.id - b.id)
                            .map((product, index) => (

                                <tr
                                    key={product.id || index}
                                    onClick={() =>
                                        handleView(product)
                                    }
                                    className="border-b border-gray-100 hover:bg-gray-50 text-md cursor-pointer transition-colors"
                                >

                                    {/* =================================
                                        PRODUCT
                                    ================================= */}

                                    <td className="px-2 py-3">

                                        <div className="flex items-center gap-3">

                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-md font-bold ${getAvatarColor(
                                                    product.productName
                                                )}`}
                                            >
                                                {initials(
                                                    product.productName
                                                )}
                                            </div>

                                            <div>

                                                <p className="font-medium text-gray-800">
                                                    {product.productName || "—"}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    ID: #{product.id}
                                                </p>

                                            </div>

                                        </div>

                                    </td>

                                    {/* =================================
                                        SKU
                                    ================================= */}

                                    <td className="px-4 py-3">
                                        {product.sku || "—"}
                                    </td>

                                    {/* =================================
                                        CATEGORY
                                    ================================= */}

                                    <td className="px-4 py-3">
                                        {product.categoryName ||
                                            product.category?.categoryName ||
                                            "—"}
                                    </td>

                                    {/* =================================
                                        HSN
                                    ================================= */}

                                    <td className="px-4 py-3">
                                        {product.hsnCode || "—"}
                                    </td>

                                    {/* =================================
                                        SELLING PRICE
                                    ================================= */}

                                    <td className="px-4 py-3">
                                        ₹{" "}
                                        {product.sellingPrice ?? "0.00"}
                                    </td>

                                    {/* =================================
                                        PURCHASE PRICE
                                    ================================= */}

                                    <td className="px-4 py-3">
                                        ₹{" "}
                                        {product.purchasingPrice ?? "0.00"}
                                    </td>

                                    {/* =================================
                                        TAX
                                    ================================= */}

                                    <td className="px-4 py-3">

                                        {product.taxName ? (
                                            <div>

                                                <p className="text-gray-800">
                                                    {product.taxName}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {product.taxRate ?? 0}%
                                                </p>

                                            </div>
                                        ) : (
                                            "—"
                                        )}

                                    </td>

                                    {/* =================================
                                        STATUS
                                    ================================= */}

                                    <td className="px-5 py-3 font-semibold">

                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[
                                                product.status
                                            ] ||
                                                "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {product.status || "—"}
                                        </span>

                                    </td>

                                    {/* =================================
                                        ACTIONS
                                    ================================= */}

                                    <td
                                        className="relative overflow-visible px-4 py-3"
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                    >

                                        <div className="flex justify-end">

                                            <div className="relative group inline-block">

                                                <button
                                                    type="button"
                                                    className="p-1 rounded-full bg-blue-500 text-white"
                                                >
                                                    <ChevronDown size={16} />
                                                </button>

                                                {/* =========================
                                                    ACTION MENU
                                                ========================= */}

                                                <div
                                                    className="
                                                        absolute
                                                        right-0
                                                        top-full
                                                        mt-1
                                                        z-[9999]
                                                        opacity-0
                                                        invisible
                                                        group-hover:opacity-100
                                                        group-hover:visible
                                                        transition-all
                                                    "
                                                >

                                                    <div className="w-36 rounded-md bg-blue-500 shadow-lg">

                                                        {/* View */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleView(product)
                                                            }
                                                            className="flex w-full items-center gap-2 px-4 py-2 text-white hover:bg-blue-600 rounded-md"
                                                        >
                                                            <Eye size={16} />
                                                            View
                                                        </button>

                                                        {/* Edit */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(product)
                                                            }
                                                            className="flex w-full items-center gap-2 px-4 py-2 text-white hover:bg-blue-600 rounded-md"
                                                        >
                                                            <Edit size={16} />
                                                            Edit
                                                        </button>

                                                        {/* Delete */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    product.id
                                                                )
                                                            }
                                                            className="flex w-full items-center gap-2 px-4 py-2 text-white hover:bg-red-600 rounded-md"
                                                        >
                                                            <Trash2 size={16} />
                                                            Delete
                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                    </tbody>

                </table>

                {/* =====================================================
                    PAGINATION
                ===================================================== */}

                <div className="p-5 border-t border-gray-100 flex items-center justify-between">

                    <p className="text-sm text-gray-500">
                        Showing{" "}
                        {currentProducts.length}{" "}
                        of{" "}
                        {totalElements || 0}{" "}
                        products
                    </p>

                    <div className="flex items-center gap-3">

                        {/* Previous */}

                        <button
                            type="button"
                            disabled={
                                Number(pageNumber) <= 0
                            }
                            onClick={() => {
                                // Add server-side page support here
                            }}
                            className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            Previous
                        </button>

                        {/* Current Page */}

                        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-medium">
                            {(Number(pageNumber) || 0) + 1}
                        </span>

                        {/* Next */}

                        <button
                            type="button"
                            disabled={
                                (Number(pageNumber) || 0) >=
                                (Number(totalPages) || 1) - 1
                            }
                            onClick={() => {
                                // Add server-side page support here
                            }}
                            className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                            Next
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}
