import { Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { closeModal } from "../../../ui/uiSlice";
import { setInvoiceTemplate } from "../../slices/invoiceSlice";

import invoiceTemplates from "../template/templateRegistry";

export default function ChangeTemplateModal() {
    const dispatch = useDispatch();

    /*
     * ============================================================
     * CURRENT SELECTED TEMPLATE
     * ============================================================
     */

    const currentTemplate = useSelector(
        (state) => state.invoice?.invoiceTemplate
    );

    /*
     * ============================================================
     * PREVIEW INVOICE
     * ============================================================
     */

    const previewInvoice = useSelector(
        (state) =>
            state.invoice?.existingInvoice ||
            state.invoice?.invoice ||
            state.invoice?.selectedInvoice ||
            null
    );

    /*
     * ============================================================
     * SELECT TEMPLATE
     * ============================================================
     */

    const handleSelect = (id) => {
        dispatch(setInvoiceTemplate(id));
    };

    /*
     * ============================================================
     * CLOSE
     * ============================================================
     */

    const handleClose = () => {
        dispatch(closeModal());
    };

    return (
        <div className="flex max-h-[90vh] flex-col">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="border-b px-5 py-4">

                <h2 className="text-lg font-semibold text-gray-800">
                    Choose Invoice Template
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Select the invoice template you want to use.
                </p>

            </div>

            {/* ==================================================
                TEMPLATE GRID
            ================================================== */}

            <div className="min-h-0 flex-1 overflow-y-auto">

                <div className="grid grid-cols-2 gap-6 p-6">

                    {invoiceTemplates.map((template) => {

                        const isActive =
                            currentTemplate === template.id;

                        const TemplateComponent =
                            template.component;

                        return (
                            <div
                                key={template.id}
                                className={`
                                    group
                                    relative
                                    cursor-pointer
                                    overflow-hidden
                                    rounded-lg
                                    border-2
                                    bg-white
                                    transition-all
                                    duration-200

                                    ${isActive
                                        ? "border-blue-500 shadow-lg shadow-blue-100"
                                        : "border-gray-200 hover:border-blue-400 hover:shadow-lg"
                                    }
                                `}
                                onClick={() =>
                                    handleSelect(template.id)
                                }
                            >

                                {/* ==========================================
                                    SELECTED BADGE
                                ========================================== */}

                                {isActive && (
                                    <div
                                        className="
                                            absolute
                                            right-3
                                            top-3
                                            z-20
                                            flex
                                            items-center
                                            gap-1
                                            rounded-full
                                            bg-blue-500
                                            px-2
                                            py-1
                                            text-xs
                                            font-semibold
                                            text-white
                                            shadow
                                        "
                                    >
                                        <Check size={12} />

                                        Selected
                                    </div>
                                )}

                                {/* ==========================================
                                    HOVER OVERLAY
                                ========================================== */}

                                <div
                                    className="
                                        absolute
                                        inset-0
                                        z-10
                                        flex
                                        items-center
                                        justify-center
                                        bg-black/0
                                        opacity-0
                                        transition-all
                                        duration-200
                                        group-hover:bg-black/20
                                        group-hover:opacity-100
                                    "
                                >

                                    <button
                                        type="button"
                                        className="
                                            rounded-lg
                                            bg-blue-500
                                            px-5
                                            py-2
                                            text-sm
                                            font-semibold
                                            text-white
                                            shadow-lg
                                            transition
                                            hover:bg-blue-600
                                            active:scale-95
                                        "
                                        onClick={(event) => {
                                            event.stopPropagation();

                                            handleSelect(
                                                template.id
                                            );
                                        }}
                                    >
                                        {isActive
                                            ? "✓ Already Selected"
                                            : "Choose Template"}
                                    </button>

                                </div>

                                {/* ==========================================
                                    TEMPLATE PREVIEW
                                ========================================== */}

                                <div
                                    className="
                                        h-[420px]
                                        overflow-hidden
                                        bg-gray-100
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            justify-center
                                            pt-4
                                        "
                                    >

                                        <div
                                            style={{
                                                transform:
                                                    "scale(0.45)",

                                                transformOrigin:
                                                    "top center",

                                                width:
                                                    "794px",

                                                height:
                                                    "1123px",

                                                pointerEvents:
                                                    "none",
                                            }}
                                        >

                                            <TemplateComponent
                                                invoice={
                                                    previewInvoice
                                                }
                                                preview={true}
                                            />

                                        </div>

                                    </div>

                                </div>

                                {/* ==========================================
                                    TEMPLATE TITLE
                                ========================================== */}

                                <div
                                    className={`
                                        border-t
                                        p-4
                                        text-center
                                        font-medium

                                        ${isActive
                                            ? "bg-blue-50 text-blue-600"
                                            : "text-gray-700"
                                        }
                                    `}
                                >
                                    {template.title}
                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="flex justify-end border-t p-4">

                <button
                    type="button"
                    onClick={handleClose}
                    className="
                        rounded-md
                        bg-blue-500
                        px-8
                        py-2
                        text-sm
                        font-semibold
                        text-white
                        hover:bg-blue-600
                    "
                >
                    Confirm
                </button>

            </div>

        </div>
    );
}