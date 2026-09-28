import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { setExsistingProduct } from "../slices/productSlice";

export default function ProductOverViewSiderDetails() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    /* =========================================================
       PRODUCT STATE
       ========================================================= */

    const products = useSelector(
        (state) => state.product?.products ?? []
    );

    const exsistingProduct = useSelector(
        (state) => state.product?.exsistingProduct
    );

    /* =========================================================
       PRODUCT VIEW STATE
       ========================================================= */

    const productStatus = useSelector(
        (state) => state.productView?.productStatus ?? "ALL"
    );

    /* =========================================================
       STATUS COLORS
       ========================================================= */

    const statusColor = {
        DRAFT: "bg-yellow-100 text-yellow-700",
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
        CANCELLED: "bg-red-100 text-red-700",
        APPROVED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
    };

    /* =========================================================
       FILTER PRODUCTS
       ========================================================= */

    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) {
            return [];
        }

        const status =
            productStatus?.toUpperCase() || "ALL";

        if (status === "ALL") {
            return products;
        }

        return products.filter(
            (product) =>
                product.status?.toUpperCase() === status
        );
    }, [products, productStatus]);

    /* =========================================================
       SORT PRODUCTS
       ========================================================= */

    const sortedProducts = useMemo(() => {
        return [...filteredProducts].sort(
            (a, b) => Number(a.id) - Number(b.id)
        );
    }, [filteredProducts]);

    /* =========================================================
       SELECT PRODUCT
       ========================================================= */

    const handleProductClick = (product) => {
        if (!product?.id) {
            return;
        }

        dispatch(
            setExsistingProduct(product)
        );

        navigate(
            `/items/view/${product.id}`
        );
    };

    /* =========================================================
       STATUS LABEL
       ========================================================= */

    const getStatusLabel = (status) => {
        return status || "DRAFT";
    };

    /* =========================================================
       RENDER
       ========================================================= */

    return (
        <div className="w-full border-b border-gray-200 bg-white">

            {sortedProducts.length > 0 ? (
                <div className="w-full">

                    {sortedProducts.map((product) => {

                        const isSelected =
                            String(id) ===
                            String(product.id) ||
                            String(
                                exsistingProduct?.id
                            ) ===
                            String(product.id);

                        const normalizedStatus =
                            product.status?.toUpperCase();

                        return (
                            <div
                                key={product.id}
                                onClick={() =>
                                    handleProductClick(
                                        product
                                    )
                                }
                                className={`w-full cursor-pointer border-b border-gray-100 px-4 py-4 transition-all ${isSelected
                                    ? "border-l-4 border-l-blue-600 bg-blue-50"
                                    : "hover:bg-gray-50"
                                    }`}
                            >

                                {/* =================================================
                                    PRODUCT ROW
                                ================================================= */}

                                <div className="flex items-start justify-between">

                                    {/* =================================================
                                        LEFT SIDE
                                    ================================================= */}

                                    <div className="flex gap-3">

                                        {/* Checkbox */}

                                        <input
                                            type="checkbox"
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                            className="mt-1"
                                        />

                                        {/* Product Information */}

                                        <div className="min-w-0">

                                            <h3 className="font-semibold text-gray-800">
                                                {product.productName ||
                                                    "Unnamed Product"}
                                            </h3>

                                            <p className="text-sm text-gray-500">
                                                #{product.id}
                                            </p>

                                            {product.sku && (
                                                <p className="mt-1 text-xs text-gray-400">
                                                    SKU:{" "}
                                                    {product.sku}
                                                </p>
                                            )}

                                            {/* Status */}

                                            <span
                                                className={`mt-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColor[
                                                    normalizedStatus
                                                ] ||
                                                    "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {getStatusLabel(
                                                    product.status
                                                )}
                                            </span>

                                        </div>
                                    </div>

                                    {/* =================================================
                                        RIGHT SIDE - PRICE
                                    ================================================= */}

                                    <div className="ml-3 shrink-0 text-right">

                                        <p className="font-semibold text-gray-800">
                                            ₹
                                            {Number(
                                                product.sellingPrice || 0
                                            ).toFixed(2)}
                                        </p>

                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (

                /* =====================================================
                   EMPTY STATE
                   ===================================================== */

                <div className="flex min-h-[200px] items-center justify-center text-gray-500">
                    No products found.
                </div>
            )}

        </div>
    );
}