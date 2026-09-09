import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronDown, MoreHorizontal, Plus } from "lucide-react";

import { setCurrentPage } from "../slices/customerSlices";
import { setSelectedView, setStatus } from "../slices/customerViewSlice";

export default function CustomerOverViewSiderTopbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const {
        selectedView = "All Customer",
        views = [],
    } = useSelector((state) => state.customerView ?? {});

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleViewChange = (view) => {
        dispatch(setCurrentPage(0));
        dispatch(setSelectedView(view.label));
        dispatch(setStatus(view.value));

        navigate(`/customers/view/customers?status=${view.value}`);

        setDropdownOpen(false);
    };

    return (
        <div className="flex items-center justify-between px-2 py-3 bg-white border-b border-gray-200">

            {/* Left - Customer View Dropdown */}
            <div ref={dropdownRef} className="relative">

                <div
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1 cursor-pointer select-none rounded-md bg-blue-500 px-3 py-1.5 hover:bg-blue-400"
                >
                    <h2 className="text-sm font-medium text-white">
                        {selectedView}
                    </h2>

                    <ChevronDown
                        size={13}
                        className={`text-white transition-transform ${dropdownOpen ? "rotate-180" : ""
                            }`}
                    />
                </div>

                {/* Dropdown */}
                {dropdownOpen && (
                    <div className="absolute left-0 top-9 w-60 rounded-md border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
                        <div className="max-h-72 overflow-y-auto">
                            {views.map((view) => (
                                <button
                                    key={view.value}
                                    type="button"
                                    onClick={() => handleViewChange(view)}
                                    className="w-full px-4 py-2.5 border-b border-gray-100 text-left text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors"
                                >
                                    {view.label}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                navigate("/customers/new");
                                setDropdownOpen(false);
                            }}
                            className="w-full border-t border-gray-200 px-4 py-2.5 text-left text-sm font-medium text-blue-600 hover:bg-gray-50"
                        >
                            + New View
                        </button>
                    </div>
                )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">

                {/* New Button Group */}
                <div className="flex overflow-hidden rounded-md border-blue-500 shadow-sm">

                    {/* New Button */}
                    <button
                        type="button"
                        onClick={() => navigate("/customers/new")}
                        className="flex items-center gap-1 rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-400"
                    >
                        <Plus size={13} />
                        New
                    </button>

                    {/* <button
                        type="button"
                        className="border-l border-blue-500 bg-blue-600 px-2 text-white hover:bg-blue-700"
                    >
                        <ChevronDown size={12} />
                    </button> */}

                </div>

                {/* More */}
                {/* <button
                    type="button"
                    className="rounded-md border border-gray-300 p-1 hover:bg-gray-50"
                >
                    <MoreHorizontal size={14} />
                </button> */}

            </div>
        </div>
    );
}