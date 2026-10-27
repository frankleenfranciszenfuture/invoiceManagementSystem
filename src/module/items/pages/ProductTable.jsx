
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { openModal } from "../../ui/uiSlice";

import {
    fetchAllProducts,
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
import Pagination from "../../../common/pagination/table/Pagination";

export default function ProductTable({ products = [] }) {

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

    const handleView = (product) => {

        try {

            dispatch(
                setExsistingProduct(product)
            );

            navigate(`/items/view/${product.id}`);

        } catch (error) {

            toast.error("Failed to open product");
        }
    };

    /* =====================================================
       EDIT PRODUCT
    ===================================================== */

    const handleEdit = (product) => {

        console.log("EDIT PRODUCT:", product);

        try {

            dispatch(
                setExsistingProduct(product)
            );

            navigate(`/items/editSimple/${product.id}`);


        } catch (error) {

            console.error(
                "PRODUCT EDIT ERROR:",
                error
            );

            toast.error(
                error?.message ||
                "Failed to open product"
            );
        }
    };

    /* =====================================================
       PRODUCT INITIALS
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

        ACTIVE:
            "bg-green-100 text-green-700",

        INACTIVE:
            "bg-gray-100 text-gray-700",

        DRAFT:
            "bg-yellow-100 text-yellow-700",

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
                    (acc, char) =>
                        acc + char.charCodeAt(0),
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
            <div className="flex items-center justify-center py-10">

                <p className="text-gray-500">
                    Loading products...
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
                    <thead className="bg-[#FAF9F7]/20 border-b border-gray-300">
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

                        {[...currentProducts]
                            .sort(
                                (a, b) =>
                                    a.id - b.id
                            )
                            .map(
                                (
                                    product,
                                    index
                                ) => (

                                    <tr
                                        key={
                                            product.id ||
                                            index
                                        }
                                        onClick={() =>
                                            handleView(
                                                product
                                            )
                                        }
                                        className="
                                        border-b
                                        border-gray-100
                                        hover:bg-gray-50
                                        text-xs
                                        text-left
                                        cursor-pointer
                                        transition-colors
                                    "
                                    >

                                        {/* =================================
                                        PRODUCT
                                    ================================= */}

                                        <td className="px-2 py-3">

                                            <div className="flex items-center gap-3">

                                                <div
                                                    className={`
                                                    w-10
                                                    h-10
                                                    rounded-full
                                                    flex
                                                    items-center
                                                    justify-center
                                                    text-md
                                                    font-bold
                                                    ${getAvatarColor(
                                                        product.productName
                                                    )}
                                                `}
                                                >
                                                    {initials(
                                                        product.productName
                                                    )}
                                                </div>

                                                <div>

                                                    <p className="font-medium text-gray-800">
                                                        {product.productName ||
                                                            "—"}
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        ID: #
                                                        {product.id}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* =================================
                                        SKU
                                    ================================= */}

                                        <td className="px-4 py-3">
                                            {product.sku ||
                                                "—"}
                                        </td>

                                        {/* =================================
                                        CATEGORY
                                    ================================= */}

                                        <td className="px-4 py-3">
                                            {product.categoryName ||
                                                product.category
                                                    ?.categoryName ||
                                                "—"}
                                        </td>

                                        {/* =================================
                                        HSN
                                    ================================= */}

                                        <td className="px-4 py-3">
                                            {product.hsnCode ||
                                                "—"}
                                        </td>

                                        {/* =================================
                                        SELLING PRICE
                                    ================================= */}

                                        <td className="px-4 py-3">
                                            ₹{" "}
                                            {product.sellingPrice ??
                                                "0.00"}
                                        </td>

                                        {/* =================================
                                        PURCHASE PRICE
                                    ================================= */}

                                        <td className="px-4 py-3">
                                            ₹{" "}
                                            {product.purchasingPrice ??
                                                "0.00"}
                                        </td>

                                        {/* =================================
                                        TAX
                                    ================================= */}

                                        <td className="px-4 py-3">

                                            {product.taxName ? (

                                                <div>

                                                    <p className="text-gray-800">
                                                        {
                                                            product.taxName
                                                        }
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {
                                                            product.taxRate ??
                                                            0
                                                        }
                                                        %
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
                                                className={`
                                                px-2
                                                py-1
                                                rounded-full
                                                text-xs
                                                font-medium
                                                ${statusColor[
                                                    product.status
                                                    ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }
                                            `}
                                            >
                                                {product.status ||
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
                                                        dispatch(setExsistingProduct(product));
                                                        navigate(`/items/view/${product.id}`);
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
                                                        setShowEdit(true);
                                                        dispatch(setExsistingProduct(product));
                                                        navigate(`/items/editSimple/${product.id}`);
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
                            fetchAllProducts({
                                page: nextPage,
                                size: Number(pageSize) || 10,
                            })
                        );
                    }}
                    onPageSizeChange={(nextSize) => {
                        dispatch(
                            fetchAllProducts({
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
