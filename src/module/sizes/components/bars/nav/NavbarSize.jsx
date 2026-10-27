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
    setSizeStatus,
    setSelectedSizeView,
} from "../../../slices/sizeViewSlice";

import { openModal } from "../../../../ui/uiSlice";
import Tooltip from "../../../../../common/toolTip/Tooltip";

export default function NavbarSize() {

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
    // SIZE VIEW STATE
    // ============================================================

    const selectedSizeView = useSelector(
        (state) =>
            state.sizeView?.selectedSizeView
    );

    const views = useSelector(
        (state) =>
            state.sizeView?.views ?? []
    );

    const sizeStatus = useSelector(
        (state) =>
            state.sizeView?.sizeStatus
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
    // OPEN SIZE CREATE MODAL
    // ============================================================

    const handleNewSize = () => {

        setMoreOpen(false);

        dispatch(
            openModal({
                type: "addSize",
            })
        );
    };

    // ============================================================
    // STATUS VIEW CHANGE
    // ============================================================

    const handleViewChange = (view) => {

        dispatch(
            setSelectedSizeView(
                view.label
            )
        );

        dispatch(
            setSizeStatus(
                view.value
            )
        );

        navigate(
            `/ sizes ? sizeStatus = ${view.value} `
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
                <div className="relative flex items-center gap-2">

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="
                        group
                        relative
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
                        aria-label="Home"
                    >
                        <Home size={18} />
                        <Tooltip text="Home" position="top" />
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
                            {selectedSizeView || "All Sizes"}
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
                                            type: "addSize",
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


                {/* NEW CATEGORY */}
                <div className="relative flex rounded-md border border-blue-100 shadow-sm">
                    <button
                        type="button"
                        onClick={handleNewSize}
                        className="
                                  group
                                  relative
                                  flex
                                  items-center
                                  gap-1
                                  rounded-md
                                  bg-[#408DFB]
                                  px-3
                                  py-2
                                  text-sm
                                  font-medium
                                  text-white
                                  transition-colors
                                  hover:bg-[#408DFB]/90
                              "
                        aria-label="New Size"
                    >
                        <Plus size={14} />
                        <Tooltip text="New Size" position="top" />
                    </button>
                </div>



                {/* =================================================
                                          MORE
                                      ================================================== */}

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => navigate("/settings")}
                        className="
                                  group
                                  relative
                                  rounded-md
                                  border
                                  border-gray-300
                                  p-2
                                  text-[#408DFB]
                                  hover:bg-gray-50
                              "
                        aria-label="Settings"
                    >
                        <Settings size={18} />
                        <Tooltip text="Settings" position="top" />
                    </button>
                </div>
            </div>

        </div >
    );
}