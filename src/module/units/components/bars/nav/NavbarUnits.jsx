
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
    Home,
    Settings,
} from "lucide-react";

import {
    setUnitStatus,
    setSelectedUnitView,
} from "../../../slices/unitViewSlice";

import { openModal } from "../../../../ui/uiSlice";

export default function NavbarUnit() {

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
    // UNIT VIEW STATE
    // ============================================================

    const selectedUnitView = useSelector(
        (state) =>
            state.unitView?.selectedUnitView
    );

    const views = useSelector(
        (state) =>
            state.unitView?.views ?? []
    );

    const unitStatus = useSelector(
        (state) =>
            state.unitView?.unitStatus
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
    // OPEN UNIT CREATE MODAL
    // ============================================================

    const handleNewUnit = () => {

        setMoreOpen(false);

        dispatch(
            openModal({
                type: "addUnit",
            })
        );
    };

    // ============================================================
    // STATUS VIEW CHANGE
    // ============================================================

    const handleViewChange = (view) => {

        dispatch(
            setSelectedUnitView(
                view.label
            )
        );

        dispatch(
            setUnitStatus(
                view.value
            )
        );

        navigate(
            `/units?unitStatus=${view.value}`
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
    LEFT - HOME + ALL PRODUCTS + ROLE STATUS FILTER
====================================================== */}

            <div className="flex items-center gap-2">

                {/* HOME + ALL PRODUCTS */}
                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="
                flex
                items-center
                justify-center
                rounded-md
                border
                border-blue-200
                bg-[white]
                p-2
                text-[#408DFB]
                hover:bg-[#408DFB]/20
                transition
            "
                        title="Home"
                    >
                        <Home size={18} />
                    </button>



                </div>

                {/* EXISTING ROLE STATUS FILTER */}
                <div
                    ref={dropdownOpenRef}
                    className="relative"
                >

                    <button
                        type="button"
                        onClick={() =>
                            setDropdownOpen((prev) => !prev)
                        }
                        className="
                flex
                items-center
                gap-1
                rounded-md
                bg-[#408DFB]
                px-3
                py-2
                cursor-pointer
                hover:bg-[#408DFB]/90
            "
                    >
                        <h2 className="font-semibold text-gray-100">
                            {selectedUnitView || "All Units"}
                        </h2>

                        <ChevronDown
                            size={14}
                            className={`
                    text-gray-100
                    transition
                    ${dropdownOpen ? "rotate-180" : ""}
                `}
                        />
                    </button>

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
                            <div className="max-h-72 overflow-y-auto">
                                {views.map((view) => (
                                    <button
                                        type="button"
                                        key={view.value}
                                        onClick={() => handleViewChange(view)}
                                        className="
                                w-full
                                px-5
                                py-4
                                border-b
                                border-gray-50
                                text-left
                                text-sm
                                text-gray-500
                                hover:bg-[#408DFB]/90
                                hover:text-white
                                rounded-md
                            "
                                    >
                                        {view.label}
                                    </button>
                                ))}
                            </div>

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
                        bg-[#408DFB]/20
                        hover:text-white
                        hover:bg-[#408DFB]/80
                        rounded-md
                    "
                                onClick={() => {
                                    setDropdownOpen(false);

                                    dispatch(
                                        openModal({
                                            type: "addUnit",
                                        })
                                    );
                                }}
                            >
                                + New View
                            </button>
                        </div>
                    )}
                </div>

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
                    NEW ROLE
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
                            handleNewUnit
                        }
                        className="
                            flex
                            items-center
                            gap-1
                            bg-[#408DFB]
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-[#408DFB]/90
                        "
                    >

                        <Plus size={14} />



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
                            border-blue-300
                            p-2
                            text-[#408DFB]
                            hover:bg-gray-50
                        "
                        title="More"
                    >

                        <Settings
                            size={18}
                        />

                    </button>



                </div>

            </div>

        </div>
    );
}