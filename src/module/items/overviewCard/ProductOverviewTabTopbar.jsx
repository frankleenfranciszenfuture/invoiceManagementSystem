import React from "react";

import {
    FolderClock,
    Paperclip,
    SquarePenIcon,
    SquareX,
    X,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { setExsistingProduct } from "../slices/productSlice";

import { openModal } from "../../ui/uiSlice";

export default function ProductOverviewTabTopbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // =========================================================
    // PRODUCT STATE
    // =========================================================

    const product = useSelector(
        (state) => state.product?.product
    );

    const exsistingProduct = useSelector(
        (state) => state.product?.exsistingProduct
    );

    // API-fetched product is the main source.
    // Existing product is used as fallback.
    const currentProduct =
        product || exsistingProduct;

    // =========================================================
    // LOADING
    // =========================================================

    if (!currentProduct) {
        return (
            <div className="flex items-center justify-between border border-gray-100 bg-white px-5 py-5">
                <h1 className="text-2xl font-medium text-gray-400">
                    Loading...
                </h1>
            </div>
        );
    }

    // =========================================================
    // EDIT PRODUCT
    // =========================================================

    const handleEdit = () => {
        if (!currentProduct) {
            return;
        }

        // Keep product available in Redux
        dispatch(
            setExsistingProduct(currentProduct)
        );

        // Open edit modal with the complete product
        dispatch(
            openModal({
                type: "editProduct",
                data: {
                    ...currentProduct,
                },
            })
        );
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="flex items-center justify-between border border-gray-100 bg-white px-5 py-5">

            {/* =================================================
                LEFT - PRODUCT NAME
            ================================================= */}

            <div className="flex cursor-pointer items-center gap-1">
                <div>
                    <h1 className="text-4xl font-medium leading-none text-gray-900"
                        onClick={() => navigate("/items")}>
                        {currentProduct.productName ||
                            "Product"}
                    </h1>
                </div>
            </div>

            {/* =================================================
                RIGHT - ACTION BUTTONS
            ================================================= */}

            <div className="flex items-center gap-2">

                {/* =================================================
                    EDIT
                ================================================= */}

                <div className="flex cursor-pointer overflow-hidden rounded-sm border border-blue-600 bg-[#088178] shadow-sm">
                    <button
                        type="button"
                        onClick={handleEdit}
                        className="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-400"
                    >
                        <SquarePenIcon size={16} />

                        <span>
                            Edit
                        </span>
                    </button>
                </div>



                {/* =================================================
                    CLOSE
                ================================================= */}

                <div className="flex cursor-pointer overflow-hidden rounded-sm border border-blue-600 bg-[#088178] shadow-sm">
                    <button
                        type="button"
                        className="flex items-center px-2.5 py-1 text-xs font-medium text-white hover:bg-[#FED7D9]"

                        onClick={() => (navigate("/items"))}>
                        <X size={16} />
                        <span>
                            Close
                        </span>
                    </button>
                </div>

            </div>
        </div>
    );
}