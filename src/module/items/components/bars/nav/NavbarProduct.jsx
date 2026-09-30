import React, {
    useState,
    useEffect,
    useRef,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    Plus,
    ChevronDown,
    MoreHorizontal,
} from "lucide-react";

import {
    setProductStatus,
    setSelectedProductView,
} from "../../../slices/productViewSlice";

import { openModal } from "../../../../ui/uiSlice";

// ============================================================
// STABLE EMPTY ARRAY
// ============================================================

const EMPTY_VIEWS = [];

export default function NavbarProduct() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [moreOpen, setMoreOpen] =
        useState(false);

    const [dropdownOpen, setDropdownOpen] =
        useState(false);

    const moreDropdownRef =
        useRef(null);

    const dropdownOpenRef =
        useRef(null);

    // ============================================================
    // PRODUCT VIEW STATE
    // ============================================================

    const selectedProductView = useSelector(
        (state) =>
            state.productView?.selectedProductView
    );

    const views = useSelector(
        (state) =>
            state.productView?.views ?? EMPTY_VIEWS
    );

    const productStatus = useSelector(
        (state) =>
            state.productView?.productStatus
    );

    // ============================================================
    // CLICK OUTSIDE
    // ============================================================

    useEffect(() => {

        const handleClickOutside = (e) => {

            if (
                dropdownOpenRef.current &&
                !dropdownOpenRef.current.contains(
                    e.target
                )
            ) {
                setDropdownOpen(false);
            }

            if (
                moreDropdownRef.current &&
                !moreDropdownRef.current.contains(
                    e.target
                )
            ) {
                setMoreOpen(false);
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

    // ============================================================
    // OPEN PRODUCT CREATE MODAL
    // ============================================================

    const handleNewProduct = () => {

        setMoreOpen(false);

        dispatch(
            openModal({
                type: "addProduct",
                data: null,
            })
        );
    };

    // ============================================================
    // STATUS VIEW CHANGE
    // ============================================================

    const handleViewChange = (view) => {

        dispatch(
            setSelectedProductView(
                view.label
            )
        );

        dispatch(
            setProductStatus(
                view.value
            )
        );

        navigate(
            `/items?productStatus=${view.value}`
        );

        setDropdownOpen(false);
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div
            className="
                h-[60px]
                border
                border-gray-100
                rounded-md
                flex
                items-center
                justify-between
                bg-white
                px-2
                py-2
            "
        >

            {/* =====================================================
                LEFT - PRODUCT STATUS FILTER
            ====================================================== */}

            <div
                ref={dropdownOpenRef}
                className="relative"
            >

                <button
                    type="button"
                    onClick={() =>
                        setDropdownOpen(
                            (prev) => !prev
                        )
                    }
                    className="
                        flex
                        items-center
                        gap-1
                        rounded-md
                        bg-blue-500
                        px-3
                        py-2
                        cursor-pointer
                        hover:bg-blue-600
                    "
                >

                    <h2
                        className="
                            font-semibold
                            text-gray-100
                        "
                    >
                        {selectedProductView ||
                            "All Products"}
                    </h2>

                    <ChevronDown
                        size={14}
                        className={`
                            text-gray-100
                            transition
                            ${dropdownOpen
                                ? "rotate-180"
                                : ""
                            }
                        `}
                    />

                </button>

                {/* =================================================
                    PRODUCT STATUS DROPDOWN
                ================================================== */}

                {dropdownOpen && (

                    <div
                        className="
                            absolute
                            left-0
                            mt-2
                            w-72
                            rounded-md
                            border
                            border-gray-200
                            bg-white
                            shadow-lg
                            z-50
                        "
                    >

                        <div
                            className="
                                max-h-72
                                overflow-y-auto
                            "
                        >

                            {views.map(
                                (view) => (

                                    <button
                                        type="button"
                                        key={
                                            view.value
                                        }
                                        onClick={() =>
                                            handleViewChange(
                                                view
                                            )
                                        }
                                        className={`
                                            w-full
                                            px-5
                                            py-4
                                            border-b
                                            border-gray-50
                                            rounded-lg
                                            text-left
                                            hover:bg-blue-500
                                            hover:text-white
                                            ${productStatus ===
                                                view.value
                                                ? "bg-blue-50 text-blue-600"
                                                : ""
                                            }
                                        `}
                                    >

                                        {view.label}

                                    </button>

                                )
                            )}

                        </div>

                        {/* =================================================
                            NEW VIEW
                        ================================================== */}

                        <button
                            type="button"
                            className="
                                w-full
                                border-t
                                border-gray-200
                                px-4
                                py-3
                                text-left
                                text-blue-600
                                hover:bg-gray-50
                            "
                            onClick={() => {
                                setDropdownOpen(
                                    false
                                );
                            }}
                        >
                            + New View
                        </button>

                    </div>

                )}

            </div>


            {/* =====================================================
                RIGHT
            ====================================================== */}

            <div
                className="
                    flex
                    items-center
                    gap-2
                "
            >

                {/* =================================================
                    NEW PRODUCT
                ================================================== */}

                <div
                    className="
                        flex
                        overflow-hidden
                        rounded-md
                        border-blue-100
                        shadow-sm
                    "
                >

                    <button
                        type="button"
                        onClick={
                            handleNewProduct
                        }
                        className="
                            flex
                            items-center
                            gap-1
                            bg-blue-500
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-blue-600
                        "
                    >

                        <Plus size={14} />

                        New Product

                    </button>

                </div>


                {/* =================================================
                    MORE
                ================================================== */}

                <div
                    ref={moreDropdownRef}
                    className="relative"
                >

                    <button
                        type="button"
                        onClick={() =>
                            setMoreOpen(
                                (prev) => !prev
                            )
                        }
                        className="
                            rounded-md
                            border
                            border-gray-300
                            p-2
                            hover:bg-gray-50
                        "
                        title="More"
                    >

                        <MoreHorizontal
                            size={18}
                        />

                    </button>

                    {moreOpen && (

                        <div
                            className="
                                absolute
                                right-0
                                mt-2
                                w-52
                                rounded-md
                                border
                                border-gray-200
                                bg-white
                                shadow-lg
                                z-50
                                overflow-hidden
                            "
                        >

                            {/* PRODUCT */}

                            <button
                                type="button"
                                onClick={
                                    handleNewProduct
                                }
                                className="
                                    w-full
                                    px-4
                                    py-3
                                    text-left
                                    text-sm
                                    text-gray-700
                                    hover:bg-blue-50
                                    hover:text-blue-600
                                "
                            >
                                Product
                            </button>


                            {/* ADD PRODUCT */}

                            <button
                                type="button"
                                onClick={() => {

                                    setMoreOpen(
                                        false
                                    );

                                    dispatch(
                                        openModal({
                                            type: "addProduct",
                                            data: null,
                                        })
                                    );

                                }}
                                className="
                                    w-full
                                    px-4
                                    py-3
                                    text-left
                                    text-sm
                                    text-gray-700
                                    hover:bg-blue-50
                                    hover:text-blue-600
                                "
                            >
                                Add Product
                            </button>


                            {/* PRODUCT SETTINGS */}

                            <button
                                type="button"
                                onClick={() => {

                                    setMoreOpen(
                                        false
                                    );

                                    // Product Settings action

                                }}
                                className="
                                    w-full
                                    px-4
                                    py-3
                                    text-left
                                    text-sm
                                    text-gray-700
                                    hover:bg-blue-50
                                    hover:text-blue-600
                                "
                            >
                                Product Settings
                            </button>


                            {/* DIVIDER */}

                            <div
                                className="
                                    border-t
                                    border-gray-100
                                "
                            />


                            {/* OTHER SETTINGS */}

                            <button
                                type="button"
                                onClick={() => {

                                    setMoreOpen(
                                        false
                                    );

                                    // Other Settings action

                                }}
                                className="
                                    w-full
                                    px-4
                                    py-3
                                    text-left
                                    text-sm
                                    text-gray-700
                                    hover:bg-gray-50
                                "
                            >
                                Other Settings
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}