import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    ChevronDown,
    Plus,
} from "lucide-react";

import {
    setSelectedInvoiceView,
    setInvoiceStatus,
} from "../slices/invoiceViewSlice";

import {
    setExistingInvoice
}
    from "../slices/invoiceSlice"

import { openModal } from "../../../module/ui/uiSlice";

export default function InvoiceOverViewSiderTopbar() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [dropdownOpen, setDropdownOpen] =
        useState(false);

    const dropdownRef = useRef(null);

    /* =========================================================
       INVOICE VIEW STATE
    ========================================================= */

    const selectedInvoiceView = useSelector(
        (state) =>
            state.invoiceView?.selectedInvoiceView ??
            "All Invoices"
    );

    const views = useSelector(
        (state) =>
            state.invoiceView?.views ?? []
    );

    /* =========================================================
       CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    ========================================================= */

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target
                )
            ) {
                setDropdownOpen(false);
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

    /* =========================================================
       CHANGE INVOICE VIEW
    ========================================================= */

    const handleViewChange = (view) => {

        if (!view) {
            return;
        }

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

        setDropdownOpen(false);
    };

    /* =========================================================
       CREATE NEW INVOICE
    ========================================================= */

    const handleNewInvoice = () => {
        setDropdownOpen(false);

        dispatch(setExistingInvoice(null));

        navigate(
            `/invoices/new`
        );
    };

    const handleEdit = (invoice) => {
        try {
            dispatch(
                openModal({
                    type: "editInvoice",
                    data: invoice,
                })
            );
        } catch (error) {
            toast.error("Failed to open invoice");
        }
    };
    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-2 py-3">

            {/* =====================================================
                LEFT - INVOICE VIEW DROPDOWN
            ===================================================== */}

            <div
                ref={dropdownRef}
                className="relative"
            >

                <button
                    type="button"
                    onClick={() =>
                        setDropdownOpen(
                            (previous) =>
                                !previous
                        )
                    }
                    className="flex cursor-pointer select-none items-center gap-1 rounded-md bg-blue-500 px-3 py-1.5 hover:bg-blue-400"
                >

                    <h2 className="text-sm font-medium text-white">
                        {selectedInvoiceView}
                    </h2>

                    <ChevronDown
                        size={13}
                        className={`text-white transition-transform ${dropdownOpen
                            ? "rotate-180"
                            : ""
                            }`}
                    />

                </button>

                {/* =================================================
                    DROPDOWN
                ================================================= */}

                {dropdownOpen && (

                    <div className="absolute left-0 top-9 z-50 w-60 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">

                        <div className="max-h-72 overflow-y-auto">

                            {views.map((view) => (

                                <button
                                    key={view.value}
                                    type="button"
                                    onClick={() =>
                                        handleViewChange(
                                            view
                                        )
                                    }
                                    className={`w-full border-b border-gray-100 px-2 py-2.5 text-left text-sm transition-colors ${selectedInvoiceView ===
                                        view.label
                                        ? "bg-blue-500 text-white"
                                        : "text-gray-700 hover:bg-blue-500 hover:text-white"
                                        }`}
                                >
                                    {view.label}
                                </button>

                            ))}

                        </div>

                        {/* =================================================
                            NEW INVOICE
                        ================================================= */}

                        <button
                            type="button"
                            onClick={handleNewInvoice}
                            className="w-full border-t border-gray-200 px-4 py-2.5 text-left text-sm font-medium text-blue-600 hover:bg-gray-50"
                        >
                            + New Invoice
                        </button>

                    </div>

                )}

            </div>

            {/* =====================================================
                RIGHT - NEW BUTTON
            ===================================================== */}

            <div className="flex items-center gap-2">

                <button
                    type="button"
                    onClick={handleNewInvoice}
                    className="flex items-center gap-1 rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-400"
                >

                    <Plus size={13} />

                    New

                </button>

            </div>

        </div>
    );
}