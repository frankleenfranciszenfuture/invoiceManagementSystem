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
    ChevronDown,
    Settings,
} from "lucide-react";

import { openModal } from "../../../ui/uiSlice";

import invoiceTemplates from "../template/templateRegistry";

export default function InvoicePreviewCard() {
    const dispatch = useDispatch();

    const [customizeOpen, setCustomizeOpen] =
        useState(false);

    const customizeRef = useRef(null);

    const previewRef = useRef(null);
    const [previewScale, setPreviewScale] = useState(1);
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
     * CLOSE DROPDOWN
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


    useEffect(() => {
        const updatePreviewScale = () => {
            if (!previewRef.current) return;

            const availableWidth =
                previewRef.current.clientWidth - 32;

            const invoiceWidth = 750;

            const scale =
                availableWidth < invoiceWidth
                    ? availableWidth / invoiceWidth
                    : 1;

            setPreviewScale(scale);
        };

        updatePreviewScale();

        window.addEventListener(
            "resize",
            updatePreviewScale
        );

        return () => {
            window.removeEventListener(
                "resize",
                updatePreviewScale
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

        console.log("Edit Template");
    };

    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (!invoice) {
        return (
            <div className="w-full rounded-md border border-gray-200 bg-white p-5">
                <p className="text-sm text-gray-500">
                    Loading invoice...
                </p>
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
            <div className="w-full rounded-md border border-gray-200 bg-white p-5">
                <p className="text-sm text-red-500">
                    Template not found
                </p>
            </div>
        );
    }

    /*
     * ============================================================
     * STATUS
     * ============================================================
     */

    const status =
        invoice.status?.toUpperCase() ||
        "DRAFT";

    const statusColor =
        status === "DRAFT"
            ? "bg-amber-500"
            : status === "CANCELLED"
                ? "bg-red-500"
                : status === "PAID"
                    ? "bg-emerald-500"
                    : status === "SENT"
                        ? "bg-blue-500"
                        : status === "OVERDUE"
                            ? "bg-orange-500"
                            : "bg-slate-500";

    return (
        <div
            className="
                group
                w-full
                rounded-md
                border
                border-gray-100
                bg-white
                shadow-sm
            "
        >

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-gray-100
                    px-5
                    py-3.5
                "
            >

                <h2
                    className="
                        text-2xl
                        font-bold
                        text-gray-800
                        underline
                        decoration-dotted
                        decoration-gray-300
                        underline-offset-4
                    "
                >
                    Invoice Preview
                </h2>

                {/* =================================================
                    CUSTOMIZE
                ================================================= */}

                <div
                    ref={customizeRef}
                    className="relative"
                >

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
                            gap-1.5
                            rounded-md
                            px-2.5
                            py-1.5
                            text-sm
                            font-medium
                            text-blue-600
                            opacity-0
                            transition-all
                            duration-200
                            group-hover:opacity-100
                            hover:bg-blue-50
                            hover:text-blue-700
                        "
                    >
                        <Settings
                            className="h-4 w-4"
                        />

                        Customize

                        <ChevronDown
                            className={`
                                h-3.5
                                w-3.5
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
                                w-[310px]
                                overflow-hidden
                                rounded-lg
                                border
                                border-gray-200
                                bg-white
                                shadow-xl
                            "
                        >

                            <div
                                className="
                                    px-4
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-gray-500
                                "
                            >
                                Invoice Template
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleChangeTemplate
                                }
                                className="
                                    mx-2
                                    flex
                                    w-[calc(100%-16px)]
                                    rounded-md
                                    bg-blue-500
                                    px-3
                                    py-2
                                    text-left
                                    text-sm
                                    font-medium
                                    text-white
                                    hover:bg-blue-600
                                "
                            >
                                Change Template
                            </button>

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
                                    rounded-md
                                    px-3
                                    py-2
                                    text-left
                                    text-sm
                                    font-medium
                                    text-gray-700
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
                STATUS
            ===================================================== */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-gray-100
                    px-5
                    py-3
                "
            >

                <span
                    className={`
                        inline-flex
                        rounded-md
                        px-2.5
                        py-1
                        text-md
                        font-medium
                        text-white
                        ${statusColor}
                    `}
                >
                    {status}
                </span>

                <span className="text-xl text-gray-900 font-bold">
                    {invoice.invoiceNumber ||
                        `INV-${invoice.id}`}
                </span>

            </div>

            {/* =====================================================
                PREVIEW AREA
            ===================================================== */}


            <div
                ref={previewRef}
                className="
        w-full
        overflow-hidden
        bg-gray-50
        px-2
        py-5
    "
            >
                <div
                    className="
            flex
            w-full
            justify-center
        "
                >
                    <div
                        style={{
                            width: `${950 * previewScale}px`,
                            minHeight: `${1000 * previewScale}px`,
                        }}
                    >
                        <div
                            style={{
                                width: "950px",
                                transform: `scale(${previewScale})`,
                                transformOrigin: "top left",
                            }}
                        >
                            <div
                                className="
                        overflow-hidden
                        rounded-md
                        border
                        border-gray-200
                        bg-white
                        shadow-sm
                    "
                            >
                                <Template
                                    invoice={invoice}
                                    preview={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}