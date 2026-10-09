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
    Settings,
} from "lucide-react";

import {
    setExsistingProduct,
} from "../../../slices/productSlice";

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
        dispatch(setExsistingProduct(null));
        navigate("/items/newSimple");
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
                        bg-[#0F4659]
                        px-3
                        py-2
                        cursor-pointer
                        hover:bg-[#0F4659]/90
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
                           absolute left-0 mt-2 w-72 rounded-md border border-gray-200 bg-white shadow-lg z-50
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
                                            text-sm
                                            hover:bg-[#0F4659]/90
                                            hover:text-white
                                            rounded-md
                                           
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
                               text-[#0F4659] 
                               hover:text-white
                               hover:bg-[#0F4659]/80
                               rounded-lg
                            "
                            onClick={() => {
                                dispatch(setExsistingProduct(null));
                                navigate("/items/newSimple")
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
                        onClick={handleNewProduct}
                        className="
                            flex
                            items-center
                            gap-1
                            bg-[#0F4659]
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-[#0F4659]/90
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
                        // onClick={() =>
                        //     setMoreOpen(
                        //         (prev) => !prev
                        //     )
                        // }

                        onClick={() =>
                            navigate("/settings")
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

                        <Settings
                            size={18}
                        />

                    </button>

                    {moreOpen && (

                        <div
                            className="
                                absolute
                                right-0
                                mt-2
                                w-35
                                rounded-md
                                border
                                border-gray-200
                                bg-white
                                shadow-lg
                                z-50
                                overflow-hidden
                                
                            "
                        >

                            {/* Settings */}

                            <button
                                type="button"

                                className="
                                    w-full
                                    flex
                                    items-center justify-left gap-1.5
                                    px-3
                                    py-3
                                    text-left
                                    text-sm
                                    text-[#0F4659]
                                    hover:bg-[#0F4659]/90
                                    hover:text-white
                                "
                            >

                                <Plus size={13} />
                                Settings
                            </button>






                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}