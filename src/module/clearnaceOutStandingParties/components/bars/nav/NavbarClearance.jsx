
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
    Home,
} from "lucide-react";

import {
    setClearanceStatus,
    setSelectedClearanceView,
} from "../../../slices/clearanceViewSlice";

import { openModal } from "../../../../ui/uiSlice";
import { setExistingClearance } from "../../../slices/clearanceSlice";

export default function NavbarClearance() {

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
    // ROLE VIEW STATE
    // ============================================================

    const selectedClearanceView = useSelector(
        (state) =>
            state.clearanceView?.selectedClearanceView
    );

    const views = useSelector(
        (state) =>
            state.clearanceView?.views ?? []
    );

    const clearanceStatus = useSelector(
        (state) =>
            state.clearanceView?.clearanceStatus
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
    // OPEN ROLE CREATE MODAL
    // ============================================================

    const handleNewClearance = () => {

        setMoreOpen(false);
        dispatch(setExistingClearance(null));
        dispatch(
            openModal({
                type: "addClearance",
            })
        );
    };

    // ============================================================
    // STATUS VIEW CHANGE
    // ============================================================

    const handleViewChange = (view) => {

        dispatch(
            setSelectedClearanceView(
                view.label
            )
        );

        dispatch(
            setClearanceStatus(
                view.value
            )
        );

        navigate(
            `/clearances?status=${view.value}`
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
    LEFT - HOME + ALL PARTIES  + PARTY STATUS FILTER
====================================================== */}

            <div className="flex items-center gap-2">

                {/* HOME + ALL PARTY */}
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
                border-gray-200
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

                {/* EXISTING PARTY STATUS FILTER */}
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
                            {selectedClearanceView || "All Clearances"}
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
                    text-gray-500
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
                        text-[#408DFB]
                        bg-[#408DFB]/20
                        hover:text-white
                        hover:bg-[#408DFB]/80
                        rounded-md
                    "
                                onClick={() => {
                                    setDropdownOpen(false);

                                    dispatch(
                                        openModal({
                                            type: "addClearances",
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
                        // onClick={
                        //     handleNewBankAccount
                        // }

                        onClick={() => navigate("/clearances/newSimple")}
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
                            border-gray-300
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
