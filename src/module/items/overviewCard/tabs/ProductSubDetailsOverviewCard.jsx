import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
    ChevronDown,
    Package,
    Settings,
} from "lucide-react";

export default function ProductSubDetailsOverviewCard() {

    const product = useSelector(
        (state) => state.product?.product
    );

    const [showBasicDetails, setShowBasicDetails] = useState(false);
    const [showStockDetails, setShowStockDetails] = useState(false);
    const [showProductDetails, setShowProductDetails] = useState(false);

    const [image, setImage] = useState(null);

    useEffect(() => {
        if (product?.image) {
            setImage(product.image);
        } else {
            setImage(null);
        }
    }, [product]);

    if (!product) {
        return (
            <div className="w-full rounded-md border border-gray-200 bg-white p-5">
                <p className="text-sm text-gray-500">
                    Loading product...
                </p>
            </div>
        );
    }

    const formatAmount = (amount) => {
        if (
            amount === null ||
            amount === undefined ||
            amount === ""
        ) {
            return "₹0.00";
        }

        return `₹${Number(amount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const statusColor = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
        DRAFT: "bg-yellow-100 text-yellow-700",
    };

    const status = product.status?.toUpperCase() || "DRAFT";

    return (
        <div className="w-full rounded-md border border-gray-100 bg-white shadow-sm">

            {/* =====================================================
                PRODUCT HEADER
            ===================================================== */}

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">

                <h2 className="text-base font-medium text-gray-800 underline decoration-dotted decoration-gray-300 underline-offset-4">
                    Product Overview
                </h2>

                <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    <Package
                        className="h-4 w-4 rounded-full bg-blue-600 p-0.5 text-white"
                    />
                    New
                </button>

            </div>

            {/* =====================================================
                PRODUCT BASIC INFO
            ===================================================== */}

            <div className="flex items-center gap-3 px-5 pb-4 pt-5">

                {/* Product Image */}

                <div className="flex shrink-0 justify-left">

                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500">

                        {image ? (
                            <img
                                src={image}
                                alt={product.productName || "Product"}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <Package
                                className="h-7 w-7 text-white"
                            />
                        )}

                    </div>

                </div>

                {/* Product Info */}

                <div className="min-w-0 flex-1">

                    <p className="truncate text-xl text-gray-900">
                        {product.productName || "-"}
                    </p>

                    <p className="text-sm text-gray-500">
                        {product.brand || "No brand"}
                    </p>

                    <p className="text-sm text-gray-500">
                        HSN: {product.hsnCode || "-"}
                    </p>

                </div>

                {/* Settings */}

                <button
                    type="button"
                    className="mb-6 mr-1 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    <Settings
                        className="h-5 w-5 cursor-pointer rounded-lg bg-blue-600 p-0.5 text-white"
                    />
                </button>

            </div>

            {/* =====================================================
                STATUS
            ===================================================== */}

            <div className="border-b border-gray-200 px-5 pb-4">

                <span
                    className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${statusColor[status] ||
                        "bg-gray-100 text-gray-700"
                        }`}
                >
                    {product.status || "DRAFT"}
                </span>

            </div>

            {/* =====================================================
                DETAILS
            ===================================================== */}

            <div className="rounded-xl border border-gray-100 bg-white">

                {/* =================================================
                    BASIC DETAILS
                ================================================= */}

                <div className="mb-2 flex items-center justify-left border border-gray-50 px-5">

                    <button
                        type="button"
                        onClick={() =>
                            setShowBasicDetails(!showBasicDetails)
                        }
                        className="flex w-full cursor-pointer items-center justify-left gap-1 border-b border-gray-200 py-2 text-sm font-semibold uppercase text-gray-600 hover:text-gray-700"
                    >
                        Basic Details

                        <ChevronDown
                            size={14}
                            className={`transition-transform ${showBasicDetails
                                ? "rotate-180"
                                : ""
                                }`}
                        />
                    </button>

                </div>

                {!showBasicDetails && (
                    <div className="space-y-1 border-b border-gray-200 px-5 py-3 text-sm text-gray-600">

                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">

                            <div className="space-y-4">

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Product Name
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {product.productName || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Brand
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {product.brand || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        HSN Code
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {product.hsnCode || "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Selling Price
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {formatAmount(
                                            product.sellingPrice
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Purchasing Price
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {formatAmount(
                                            product.purchasingPrice
                                        )}
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>
                )}

                {/* =================================================
                    STOCK DETAILS
                ================================================= */}

                <div className="mb-2 flex items-center justify-left border border-gray-50 px-5">

                    <button
                        type="button"
                        onClick={() =>
                            setShowStockDetails(!showStockDetails)
                        }
                        className="flex w-full cursor-pointer items-center justify-left gap-1 border-b border-gray-200 py-2 text-sm font-semibold uppercase text-gray-600 hover:text-gray-700"
                    >
                        Stock Details

                        <ChevronDown
                            size={14}
                            className={`transition-transform ${showStockDetails
                                ? "rotate-180"
                                : ""
                                }`}
                        />
                    </button>

                </div>

                {!showStockDetails && (
                    <div className="space-y-1 border-b border-gray-200 px-5 py-3 text-sm text-gray-600">

                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">

                            <div className="space-y-4">

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Minimum Stock
                                    </span>

                                    <span className="text-gray-600">
                                        {product.minimumStock ?? "-"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Maximum Stock
                                    </span>

                                    <span className="text-gray-600">
                                        {product.maximumStock ?? "-"}
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>
                )}

                {/* =================================================
                    PRODUCT DETAILS
                ================================================= */}

                <div className="mb-2 flex items-center justify-left border border-gray-50 px-5">

                    <button
                        type="button"
                        onClick={() =>
                            setShowProductDetails(
                                !showProductDetails
                            )
                        }
                        className="flex w-full cursor-pointer items-center justify-left gap-1 border-b border-gray-200 py-2 text-sm font-semibold uppercase text-gray-600 hover:text-gray-700"
                    >
                        Product Details

                        <ChevronDown
                            size={14}
                            className={`transition-transform ${showProductDetails
                                ? "rotate-180"
                                : ""
                                }`}
                        />
                    </button>

                </div>

                {!showProductDetails && (
                    <div className="space-y-1 border-b border-gray-200 px-5 py-3 text-sm text-gray-600">

                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">

                            <div className="space-y-4">

                                {/* Tax */}

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Tax
                                    </span>

                                    <span className="text-gray-600">
                                        {product.taxId || "-"}
                                    </span>
                                </div>

                                {/* Sizes */}

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Sizes
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {Array.isArray(product.sizes) &&
                                            product.sizes.length > 0
                                            ? product.sizes
                                                .map(
                                                    (size) =>
                                                        size.name ||
                                                        size.sizeName ||
                                                        size.id
                                                )
                                                .join(", ")
                                            : "-"}
                                    </span>
                                </div>

                                {/* Units */}

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Units
                                    </span>

                                    <span className="text-right text-gray-600">
                                        {Array.isArray(product.units) &&
                                            product.units.length > 0
                                            ? product.units
                                                .map(
                                                    (unit) =>
                                                        unit.name ||
                                                        unit.unitName ||
                                                        unit.id
                                                )
                                                .join(", ")
                                            : "-"}
                                    </span>
                                </div>

                                {/* Status */}

                                <div className="flex justify-between gap-4">
                                    <span className="font-medium text-gray-700">
                                        Status
                                    </span>

                                    <span
                                        className={`rounded-md px-2 py-1 text-xs font-medium ${statusColor[status] ||
                                            "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {product.status || "-"}
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}