import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getImageUrl } from "../../../../api/utils/imageUtils";

import {
    ChevronDown,
    Package,
} from "lucide-react";

export default function ProductPayDueOverviewCard() {
    const [showImageDetails, setShowImageDetails] =
        useState(false);

    /* =========================================================
       PRODUCT
    ========================================================= */

    const product = useSelector(
        (state) => state.product?.product
    );

    const exsistingProduct = useSelector(
        (state) => state.product?.exsistingProduct
    );

    const currentProduct =
        product || exsistingProduct;

    /* =========================================================
       IMAGE URL
    ========================================================= */

    // const getProductImageUrl = (imageUrl) => {
    //     if (!imageUrl) {
    //         return "";
    //     }

    //     if (
    //         imageUrl.startsWith("http://") ||
    //         imageUrl.startsWith("https://")
    //     ) {
    //         return imageUrl.replace(
    //             "http://localhost:8080",
    //             "http://localhost:8081"
    //         );
    //     }

    //     return `http://localhost:8081/api/v1.0/uploads/products/${imageUrl}`;
    // };


    const imageUrl = getImageUrl(
        currentProduct?.imageUrl
    );

    /* =========================================================
       PRODUCT INITIALS
    ========================================================= */

    const initials = (productName) =>
        productName
            ?.split(" ")
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "PR";

    /* =========================================================
       PRODUCT AVATAR COLORS
    ========================================================= */

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
                ) % avatarColors.length;

        return avatarColors[index];
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="w-full rounded-md border border-gray-100 bg-white">

            {/* =================================================
                IMAGE DETAILS
            ================================================= */}

            <div className="mb-2 flex items-center justify-left border border-gray-50 px-5">

                <button
                    type="button"
                    onClick={() =>
                        setShowImageDetails(
                            (prev) => !prev
                        )
                    }
                    className="
                        flex
                        w-full
                        cursor-pointer
                        items-center
                        justify-left
                        gap-1
                        border-b
                        border-gray-200
                        py-2
                        text-sm
                        font-semibold
                        uppercase
                        text-gray-600
                        hover:text-gray-700
                    "
                >
                    Product Image

                    <ChevronDown
                        size={14}
                        className={`
                            transition-transform
                            ${showImageDetails
                                ? "rotate-180"
                                : ""
                            }
                        `}
                    />
                </button>

            </div>

            {/* =================================================
                IMAGE CONTENT
            ================================================= */}

            {!showImageDetails && (
                <div
                    className="
                        space-y-1
                        border-b
                        border-gray-200
                        px-5
                        py-3
                        text-sm
                        text-gray-600
                    "
                >

                    <div
                        className="
                            rounded-lg
                            border
                            border-gray-200
                            bg-gray-50
                            px-3
                            py-3
                        "
                    >

                        <div className="flex items-center justify-center">

                            {imageUrl ? (

                                <div
                                    className="
                                        h-48
                                        w-48
                                        overflow-hidden
                                        rounded-lg
                                        border
                                        border-gray-200
                                        bg-gray-100
                                    "
                                >
                                    <img
                                        src={imageUrl}
                                        alt={
                                            currentProduct?.productName ||
                                            "Product"
                                        }
                                        className="
                                            h-full
                                            w-full
                                            object-cover
                                        "
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                </div>

                            ) : (

                                <div
                                    className={`
                                        flex
                                        h-48
                                        w-48
                                        items-center
                                        justify-center
                                        rounded-lg
                                        text-4xl
                                        font-bold
                                        ${getAvatarColor(
                                        currentProduct?.productName
                                    )}
                                    `}
                                >
                                    {currentProduct?.productName ? (
                                        initials(
                                            currentProduct.productName
                                        )
                                    ) : (
                                        <Package
                                            className="
                                                h-12
                                                w-12
                                                text-white
                                            "
                                        />
                                    )}
                                </div>

                            )}

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}