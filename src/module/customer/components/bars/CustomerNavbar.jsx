import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Plus, Bell, Edit, Home } from "lucide-react";
import { toggleSidebar, openModal } from "../../../ui/uiSlice";
import {
    setCurrentPage
} from "../../slices/customerSlices"

import { setSearch, setSelectedView, setStatus } from "../../slices/customerViewSlice"

import { loadCustomers } from "../../thunks/customerThunks"

import {
    History,
    Search,
    ChevronDown,
    Settings,
    FileText,
    MoreHorizontal,
} from "lucide-react";
import Tooltip from "../../../../common/toolTip/Tooltip";


export default function CustomerNavbar({ title }) {


    const dispatch = useDispatch();
    const navigate = useNavigate();


    const [dropdownOpen, setDropdownOpen] = useState(false);

    const sidebarOpen = useSelector((s) => s.ui.sidebarOpen);

    const user = useSelector((state) => state.auth.user);

    const dropdownOpenRef = useRef(null);

    const moreDropdownRef =
        useRef(null);
    const initials = (name) =>
        name
            ?.split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "??";


    const {
        selectedView = "Active Customers",
        search = "",
        views = [],
    } = useSelector((state) => state.customerView ?? {});


    const { pageSize } = useSelector((state) => state.customers);

    const filteredViews = (views ?? []).filter((view) =>
        view.label.toLowerCase().includes((search ?? "").toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownOpenRef.current &&
                !dropdownOpenRef.current.contains(e.target)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return (
        <div
            className="
                h-[60px]
               border-t 
               border-lime-300
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
    LEFT - HOME + ALL CUSTOMERS + CUSTOMER STATUS FILTER
====================================================== */}

            <div className="flex items-center gap-2">

                {/* HOME + ALL CUSTOMERS */}
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
                text-[#0F4659]
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
                            {selectedView || "All Customers"}
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
                                hover:bg-[#0095FD]/90
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
                        text-gray-500
                        bg-[#0095FD]/20
                        hover:text-white
                        hover:bg-[#0095FD]/80
                        rounded-md
                    "
                                onClick={() => {
                                    setDropdownOpen(false);

                                    dispatch(
                                        openModal({
                                            type: "addCustomer",
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


            {/* Right */}
            <div className="flex items-center gap-2">

                {/* New Button */}
                <div className="relative flex rounded-md border border-blue-100 shadow-sm">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate("/customers/new")
                        }}
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
                        aria-label="New product"
                    >
                        <Plus size={14} />
                        <Tooltip text="New product" position="top" />
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