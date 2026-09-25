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
    setSubCategoryStatus,
    setSelectedSubCategoryView,
} from "../../../slices/subCategoryViewSlice";

import { openModal } from "../../../../ui/uiSlice";

export default function NavbarSubCategory() {

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
    // SUB CATEGORY VIEW STATE
    // ============================================================

    const selectedSubCategoryView = useSelector(
        (state) =>
            state.subCategoryView?.selectedSubCategoryView
    );

    const views = useSelector(
        (state) =>
            state.subCategoryView?.views ?? []
    );

    const subCategoryStatus = useSelector(
        (state) =>
            state.subCategoryView?.subCategoryStatus
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
    // OPEN SUB CATEGORY CREATE MODAL
    // ============================================================

    const handleNewSubCategory = () => {

        setMoreOpen(false);

        dispatch(
            openModal({
                type: "addSubCategory",
            })
        );
    };

    // ============================================================
    // STATUS VIEW CHANGE
    // ============================================================

    const handleViewChange = (view) => {

        dispatch(
            setSelectedSubCategoryView(
                view.label
            )
        );

        dispatch(
            setSubCategoryStatus(
                view.value
            )
        );

        navigate(
            `/sub-categories?subCategoryStatus=${view.value}`
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
                LEFT - SUB CATEGORY STATUS FILTER
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
                        bg-blue-600
                        px-3
                        py-2
                        cursor-pointer
                    "
                >

                    <h2
                        className="
                            font-semibold
                            text-gray-100
                        "
                    >
                        {selectedSubCategoryView ||
                            "All Sub Categories"}
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
                    STATUS DROPDOWN
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
                                            ${subCategoryStatus ===
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
                    NEW SUB CATEGORY
                ================================================== */}

                <div
                    className="
                        flex
                        overflow-hidden
                        rounded-md
                        border
                        border-blue-600
                        shadow-sm
                    "
                >

                    <button
                        type="button"
                        onClick={
                            handleNewSubCategory
                        }
                        className="
                            flex
                            items-center
                            gap-1
                            bg-blue-600
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-blue-700
                        "
                    >

                        <Plus size={14} />

                        New Sub Category

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


                    {/* =================================================
                        MORE DROPDOWN
                    ================================================== */}

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

                            {/* =========================================
                                SUB CATEGORY
                            ========================================== */}

                            <button
                                type="button"
                                onClick={
                                    handleNewSubCategory
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
                                Sub Category
                            </button>


                            {/* =========================================
                                ADD SUB CATEGORY
                            ========================================== */}

                            <button
                                type="button"
                                onClick={() => {

                                    setMoreOpen(
                                        false
                                    );

                                    // Add Sub Category action

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
                                Add Sub Category
                            </button>


                            {/* =========================================
                                SUB CATEGORY SETTINGS
                            ========================================== */}

                            <button
                                type="button"
                                onClick={() => {

                                    setMoreOpen(
                                        false
                                    );

                                    // Sub Category Settings action

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
                                Sub Category Settings
                            </button>


                            {/* =========================================
                                DIVIDER
                            ========================================== */}

                            <div
                                className="
                                    border-t
                                    border-gray-100
                                "
                            />


                            {/* =========================================
                                OTHER SETTINGS
                            ========================================== */}

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