import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    Settings,
    ChevronDown,
} from "lucide-react";

import { openModal } from "../../../ui/uiSlice";

import invoiceTemplates from "../template/templateRegistry";

export default function InvoicePreviewTabView() {
    const dispatch = useDispatch();

    const [customizeOpen, setCustomizeOpen] =
        useState(false);

    const customizeRef = useRef(null);

    /*
     * ============================================================
     * INVOICE
     * ============================================================
     */

    const invoice = useSelector(
        (state) =>
            state.invoice?.existingInvoice ||
            state.invoice?.invoice ||
            state.invoice?.selectedInvoice ||
            null
    );

    /*
     * ============================================================
     * CURRENT TEMPLATE
     * ============================================================
     */

    const invoiceTemplate = useSelector(
        (state) =>
            invoice?.invoiceTemplate ||
            state.invoice?.invoiceTemplate ||
            "InvoiceTemplate1"
    );

    /*
     * ============================================================
     * FIND TEMPLATE
     * ============================================================
     */

    const Template = invoiceTemplates.find(
        (template) =>
            template.id === invoiceTemplate
    )?.component;

    /*
     * ============================================================
     * CLOSE CUSTOMIZE DROPDOWN
     * ============================================================
     */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                customizeRef.current &&
                !customizeRef.current.contains(
                    event.target
                )
            ) {
                setCustomizeOpen(false);
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

    /*
     * ============================================================
     * CHANGE TEMPLATE
     * ============================================================
     */

    const handleChangeTemplate = () => {
        setCustomizeOpen(false);

        dispatch(
            openModal({
                type: "changeTemplate",
            })
        );
    };

    /*
     * ============================================================
     * EDIT TEMPLATE
     * ============================================================
     */

    const handleEditTemplate = () => {
        setCustomizeOpen(false);

        // We will connect your Edit Template functionality here.
        console.log("Edit Template");
    };

    /*
     * ============================================================
     * INVOICE NOT FOUND
     * ============================================================
     */

    if (!invoice) {
        return (
            <div className="p-6 text-sm text-gray-500">
                Invoice not found
            </div>
        );
    }

    /*
     * ============================================================
     * TEMPLATE NOT FOUND
     * ============================================================
     */

    if (!Template) {
        return (
            <div className="p-6 text-sm text-red-500">
                Template not found
            </div>
        );
    }

    return (
        <div className="w-full overflow-auto bg-gray-100 py-6">

            {/* =====================================================
                TOP BAR
            ===================================================== */}

            <div
                className="
                    relative
                    mx-auto
                    flex
                    w-[952px]
                    items-start
                    justify-between
                    border-x
                    border-t
                    border-gray-200
                    bg-white
                "
            >

                {/* =================================================
                    DRAFT RIBBON
                ================================================= */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        left-[-1px]
                        top-[-1px]
                        z-20
                        h-[90px]
                        w-[115px]
                        overflow-hidden
                    "
                >
                    <div
                        className="
                            absolute
                            left-[-32px]
                            top-[18px]
                            flex
                            h-[28px]
                            w-[145px]
                            rotate-[-45deg]
                            items-center
                            justify-center
                            bg-slate-400
                            text-xs
                            font-semibold
                            text-white
                        "
                    >
                        Draft
                    </div>
                </div>

                {/* =================================================
                    CUSTOMIZE
                ================================================= */}

                <div
                    ref={customizeRef}
                    className="
                        relative
                        ml-auto
                    "
                >

                    {/* CUSTOMIZE BUTTON */}

                    <button
                        type="button"
                        onClick={() =>
                            setCustomizeOpen(
                                (previous) =>
                                    !previous
                            )
                        }
                        className="
                            flex
                            items-center
                            gap-1
                            rounded-bl-md
                            bg-emerald-500
                            px-3
                            py-2
                            text-sm
                            font-semibold
                            text-white
                            transition-colors
                            hover:bg-emerald-600
                        "
                    >
                        <Settings size={15} />

                        <span>
                            Customize
                        </span>

                        <ChevronDown
                            size={13}
                            className={`
                                transition-transform
                                duration-200
                                ${customizeOpen
                                    ? "rotate-180"
                                    : ""
                                }
                            `}
                        />
                    </button>

                    {/* =================================================
                        CUSTOMIZE MENU
                    ================================================= */}

                    {customizeOpen && (
                        <div
                            className="
                                absolute
                                right-0
                                top-full
                                z-[100]
                                mt-1
                                w-[210px]
                                overflow-hidden
                                rounded-lg
                                border
                                border-gray-200
                                bg-white
                                shadow-xl
                            "
                        >

                            {/* TITLE */}

                            <div
                                className="
                                    px-4
                                    py-3
                                    text-base
                                    font-semibold
                                    text-gray-500
                                "
                            >
                                Spreadsheet Template
                            </div>

                            {/* CHANGE TEMPLATE */}

                            <button
                                type="button"
                                onClick={
                                    handleChangeTemplate
                                }
                                className="
                                    mx-2
                                    flex
                                    w-[calc(100%-16px)]
                                    items-center
                                    rounded-md
                                    bg-blue-500
                                    px-3
                                    py-2
                                    text-left
                                    text-base
                                    font-medium
                                    text-white
                                    transition-colors
                                    hover:bg-blue-600
                                "
                            >
                                Change Template
                            </button>

                            {/* EDIT TEMPLATE */}

                            <button
                                type="button"
                                onClick={
                                    handleEditTemplate
                                }
                                className="
                                    mx-2
                                    mb-2
                                    flex
                                    w-[calc(100%-16px)]
                                    items-center
                                    rounded-md
                                    px-3
                                    py-2
                                    text-left
                                    text-base
                                    font-medium
                                    text-gray-700
                                    transition-colors
                                    hover:bg-gray-100
                                "
                            >
                                Edit Template
                            </button>

                        </div>
                    )}

                </div>
            </div>

            {/* =====================================================
                INVOICE TEMPLATE
            ===================================================== */}

            <div className="w-full overflow-auto">
                <Template
                    invoice={invoice}
                    preview={true}
                />
            </div>

        </div>
    );
}