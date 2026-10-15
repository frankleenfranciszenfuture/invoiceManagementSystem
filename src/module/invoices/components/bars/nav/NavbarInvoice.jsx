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
    setInvoiceStatus,
    setSelectedInvoiceView,
} from "../../../slices/invoiceViewSlice";

import { openModal } from "../../../../ui/uiSlice";
import { setExistingInvoice } from "../../../slices/invoiceSlice";

export default function NavbarInvoice() {

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
    // INVOICE VIEW STATE
    // ============================================================

    const selectedInvoiceView = useSelector(
        (state) =>
            state.invoiceView?.selectedInvoiceView
    );

    const views = useSelector(
        (state) =>
            state.invoiceView?.views ?? []
    );

    const invoiceStatus = useSelector(
        (state) =>
            state.invoiceView?.invoiceStatus
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
    // OPEN INVOICE CREATE MODAL
    // ============================================================

    // const handleNewInvoice = () => {

    //     setMoreOpen(false);

    //     dispatch(
    //         openModal({
    //             type: "addInvoice",
    //         })
    //     );
    // };

    // ============================================================
    // STATUS VIEW CHANGE
    // ============================================================

    const handleViewChange = (view) => {

        dispatch(
            setSelectedInvoiceView(
                view.label
            )
        );

        dispatch(
            setInvoiceStatus(
                view.value
            )
        );

        navigate(
            `/invoices?invoiceStatus=${view.value}`
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
                LEFT - INVOICE STATUS FILTER
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
                         bg-[#0096FF]
                       px-3
                        py-2
                        cursor-pointer
                        hover:bg-[#0096FF]/90
                    "
                >

                    <h2
                        className="
                            font-semibold
                           text-[#FCF7F8]
                        "
                    >
                        {selectedInvoiceView ||
                            "All Invoices"}
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
                                        key={view.value}
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
                                            hover:bg-[#0095FD]/90
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
                                    hover:bg-[#0095FD]/80
                                    rounded-lg
                                "
                            onClick={() => {
                                dispatch(setExistingInvoice(null));
                                navigate("/invoices/product/new")
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
                    NEW INVOICE
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
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate("/invoices/product/new");
                        }}
                        className="
                            flex
                            items-center
                            gap-1
                            bg-[#0095FD]
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-white
                            hover:bg-[#0095FD]/90
                        "
                    >

                        <Plus size={14} />

                        New Invoice

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

        </div >
    );
}