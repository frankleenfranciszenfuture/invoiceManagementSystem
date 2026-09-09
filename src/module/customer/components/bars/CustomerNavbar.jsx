import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Plus, Bell, Edit } from "lucide-react";
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


export default function CustomerNavbar({ title }) {


    const dispatch = useDispatch();
    const navigate = useNavigate();


    const [dropdownOpen, setDropdownOpen] = useState(false);

    const sidebarOpen = useSelector((s) => s.ui.sidebarOpen);

    const user = useSelector((state) => state.auth.user);

    const dropdownOpenRef = useRef(null);

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
        <div className="h-[52px] border border-gray-100 rounded-md flex items-center justify-between bg-white px-2 py-1">

            {/* Left - View Dropdown */}
            <div ref={dropdownOpenRef} className="relative">
                <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 cursor-pointer"
                >
                    <span className="text-sm font-semibold text-white">
                        {selectedView}
                    </span>

                    <ChevronDown
                        size={14}
                        className={`text-white transition-transform ${dropdownOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-72 rounded-md border border-gray-200 bg-white shadow-lg z-50">

                        {/* Views */}
                        <div className="max-h-72 overflow-y-auto">
                            {filteredViews.map((view) => (
                                <button
                                    key={view.value}
                                    type="button"
                                    onClick={() => {
                                        dispatch(setCurrentPage(0));
                                        dispatch(setSelectedView(view.label));
                                        dispatch(setStatus(view.value));

                                        navigate(`/customers?status=${view.value}`);
                                        setDropdownOpen(false);
                                    }}
                                    className="w-full px-5 py-3 border-b border-gray-100 text-left text-sm hover:bg-blue-500 hover:text-white"
                                >
                                    {view.label}
                                </button>
                            ))}
                        </div>

                        {/* New View */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate("/customers/new");
                                setDropdownOpen(false);
                            }}
                            className="w-full border-t border-gray-200 px-4 py-3 text-left text-sm font-medium text-blue-600 hover:bg-gray-50"
                        >
                            + New View
                        </button>
                    </div>
                )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">

                {/* New Button */}
                <div className="flex overflow-hidden rounded-md border border-blue-600">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate("/customers/new");
                        }}
                        className="flex items-center gap-1 bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
                    >
                        <Plus size={14} />
                        New Customer
                    </button>
                    {/* 
                    <button
                        type="button"
                        className="border-l border-blue-500 bg-blue-600 px-2 text-white hover:bg-blue-700"
                    >
                        <ChevronDown size={14} />
                    </button> */}
                </div>

                {/* More */}
                {/* <button
                    type="button"
                    className="rounded-md border border-gray-300 p-1.5 text-gray-700 hover:bg-gray-50"
                >
                    <MoreHorizontal size={15} />
                </button> */}

            </div>
        </div>
    );
}