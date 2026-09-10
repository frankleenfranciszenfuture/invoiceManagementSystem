import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
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

export default function NavbarProduct() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [moreOpen, setMoreOpen] = useState(false);
    const moreDropdownRef = useRef(null);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownOpenRef = useRef(null);

    const {
        selectedProductView,
        views = [],
        productStatus,
    } = useSelector((state) => state.productView);

    useEffect(() => {

        const handleClickOutside = (e) => {

            if (
                dropdownOpenRef.current &&
                !dropdownOpenRef.current.contains(e.target)
            ) {
                setDropdownOpen(false);
            }

            if (
                moreDropdownRef.current &&
                !moreDropdownRef.current.contains(e.target)
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

    /* =====================================================
       OPEN TAX MASTER
    ===================================================== */

    const handleTaxMaster = () => {

        setMoreOpen(false);

        dispatch(
            openModal({
                type: "addTaxMaster",
            })
        );
    };

    return (
        <div className="h-[60px] border border-gray-100 rounded-md flex items-center justify-between bg-white px-2 py-2">

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
                        setDropdownOpen(!dropdownOpen)
                    }
                    className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-2 cursor-pointer"
                >

                    <h2 className="font-semibold">
                        {selectedProductView}
                    </h2>

                    <ChevronDown
                        size={14}
                        className={`transition ${dropdownOpen
                            ? "rotate-180"
                            : ""
                            }`}
                    />

                </button>

                {dropdownOpen && (

                    <div className="absolute left-0 mt-2 w-72 rounded-md border border-gray-200 bg-white shadow-lg z-50">

                        <div className="max-h-72 overflow-y-auto">

                            {views.map((view) => (

                                <button
                                    type="button"
                                    key={view.value}
                                    onClick={() => {

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
                                    }}
                                    className={`w-full px-5 py-4 border-b border-gray-50 rounded-lg text-left hover:bg-blue-500 hover:text-white ${productStatus === view.value
                                        ? "bg-blue-50 text-blue-600"
                                        : ""
                                        }`}
                                >
                                    {view.label}
                                </button>

                            ))}

                        </div>

                        <button
                            type="button"
                            className="w-full border-t border-gray-200 px-4 py-3 text-left text-blue-600 hover:bg-gray-50"
                            onClick={() => {
                                setDropdownOpen(false);
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

            <div className="flex items-center gap-2">

                {/* New Product */}

                <div className="flex overflow-hidden rounded-md border border-blue-600 shadow-sm">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/items/new")
                        }
                        className="flex items-center gap-1 bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >

                        <Plus size={12} />

                        New

                    </button>

                    <button
                        type="button"
                        className="border-l border-blue-500 bg-blue-600 px-2 text-white hover:bg-blue-700"
                        onClick={() =>
                            setDropdownOpen(false)
                        }
                    >

                        <ChevronDown size={12} />

                    </button>

                </div>

                {/* =================================================
                    MORE - TAX MASTER
                ================================================= */}

                <div
                    ref={moreDropdownRef}
                    className="relative"
                >

                    <button
                        type="button"
                        onClick={() => setMoreOpen((prev) => !prev)}
                        className="rounded-md border border-gray-300 p-1 hover:bg-gray-50"
                        title="More"
                    >

                        <MoreHorizontal size={14} />

                    </button>


                    {/* =====================================================
        MORE DROPDOWN
    ====================================================== */}

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

                            {/* Tax Master */}

                            <button
                                type="button"
                                onClick={handleTaxMaster}
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
                                Tax Master
                            </button>


                            {/* Add Tax */}

                            <button
                                type="button"
                                onClick={() => {
                                    setMoreOpen(false);
                                    // your Add Tax action
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
                                Add Tax
                            </button>


                            {/* Tax Settings */}

                            <button
                                type="button"
                                onClick={() => {
                                    setMoreOpen(false);
                                    // your Tax Settings action
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
                                Tax Settings
                            </button>


                            {/* Divider */}

                            <div className="border-t border-gray-100" />


                            {/* Other Settings */}

                            <button
                                type="button"
                                onClick={() => {
                                    setMoreOpen(false);
                                    // your other settings action
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