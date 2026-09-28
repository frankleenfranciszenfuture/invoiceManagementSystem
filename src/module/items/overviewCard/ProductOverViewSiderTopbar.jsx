import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    ChevronDown,
    Plus,
} from "lucide-react";

import {
    setSelectedProductView,
    setProductStatus,
} from "../slices/productViewSlice";

export default function ProductOverViewSiderTopbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [dropdownOpen, setDropdownOpen] =
        useState(false);

    const dropdownRef = useRef(null);

    /* =========================================================
       PRODUCT VIEW STATE
       ========================================================= */

    const selectedProductView = useSelector(
        (state) =>
            state.productView?.selectedProductView ??
            "All Products"
    );

    const views = useSelector(
        (state) =>
            state.productView?.views ?? []
    );

    /* =========================================================
       CLOSE DROPDOWN WHEN CLICKING OUTSIDE
       ========================================================= */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target
                )
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /* =========================================================
       CHANGE PRODUCT VIEW
       ========================================================= */

    const handleViewChange = (view) => {
        if (!view) {
            return;
        }

        dispatch(
            setSelectedProductView(view.label)
        );

        dispatch(
            setProductStatus(view.value)
        );

        setDropdownOpen(false);
    };

    /* =========================================================
       CREATE NEW PRODUCT
       ========================================================= */

    const handleNewProduct = () => {
        setDropdownOpen(false);

        navigate("/products/new");
    };

    /* =========================================================
       RENDER
       ========================================================= */

    return (
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-2 py-3">

            {/* =====================================================
                LEFT - PRODUCT VIEW DROPDOWN
            ===================================================== */}

            <div
                ref={dropdownRef}
                className="relative"
            >
                <button
                    type="button"
                    onClick={() =>
                        setDropdownOpen(
                            (previous) =>
                                !previous
                        )
                    }
                    className="flex cursor-pointer select-none items-center gap-1 rounded-md bg-blue-500 px-3 py-1.5 hover:bg-blue-400"
                >
                    <h2 className="text-sm font-medium text-white">
                        {selectedProductView}
                    </h2>

                    <ChevronDown
                        size={13}
                        className={`text-white transition-transform ${dropdownOpen
                            ? "rotate-180"
                            : ""
                            }`}
                    />
                </button>

                {/* =================================================
                    DROPDOWN
                ================================================= */}

                {dropdownOpen && (
                    <div className="absolute left-0 top-9 z-50 w-60 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">

                        <div className="max-h-72 overflow-y-auto">

                            {views.map((view) => (
                                <button
                                    key={view.value}
                                    type="button"
                                    onClick={() =>
                                        handleViewChange(
                                            view
                                        )
                                    }
                                    className={`w-full border-b border-gray-100 px-4 py-2.5 text-left text-sm transition-colors ${selectedProductView ===
                                        view.label
                                        ? "bg-blue-500 text-white"
                                        : "text-gray-700 hover:bg-blue-500 hover:text-white"
                                        }`}
                                >
                                    {view.label}
                                </button>
                            ))}

                        </div>

                        {/* =================================================
                            NEW PRODUCT
                        ================================================= */}

                        <button
                            type="button"
                            onClick={handleNewProduct}
                            className="w-full border-t border-gray-200 px-4 py-2.5 text-left text-sm font-medium text-blue-600 hover:bg-gray-50"
                        >
                            + New Product
                        </button>

                    </div>
                )}
            </div>

            {/* =====================================================
                RIGHT - NEW BUTTON
            ===================================================== */}

            <div className="flex items-center gap-2">

                <button
                    type="button"
                    onClick={handleNewProduct}
                    className="flex items-center gap-1 rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-400"
                >
                    <Plus size={13} />
                    New
                </button>

            </div>

        </div>
    );
}