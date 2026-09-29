import React, {
    useEffect,
    useState,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { X } from "lucide-react";

import { closeModal } from "../../ui/uiSlice";

import {
    setInvoiceNumberSetting,
    setInvoiceField,
} from "../slices/invoiceSlice";


export default function InvoiceNumberSetting() {

    const dispatch = useDispatch();

    const savedSettings = useSelector(
        (state) =>
            state.invoice?.invoiceNumberSettings || {}
    );

    const currentInvoiceNumber = useSelector(
        (state) =>
            state.invoice?.invoice?.invoiceNumber || ""
    );


    /* =========================================================
       LOCAL FORM
    ========================================================= */

    const [form, setForm] = useState({
        mode: "AUTO",
        manualInvoiceNumber: "",
        prefix: "INV-",
        nextNumber: "000001",
        restartFiscalYear: false,
    });


    /* =========================================================
       LOAD SETTINGS
    ========================================================= */

    useEffect(() => {

        const savedMode =
            String(
                savedSettings?.mode || "AUTO"
            ).toUpperCase();

        setForm({
            mode:
                savedMode === "MANUAL"
                    ? "MANUAL"
                    : "AUTO",

            manualInvoiceNumber:
                currentInvoiceNumber || "",

            prefix:
                savedSettings?.prefix ||
                "INV-",

            nextNumber:
                savedSettings?.nextNumber ||
                "000001",

            restartFiscalYear:
                savedSettings?.restartFiscalYear ??
                false,
        });

    }, [
        savedSettings,
        currentInvoiceNumber,
    ]);


    /* =========================================================
       CHANGE FIELD
    ========================================================= */

    const handleChange = (
        field,
        value
    ) => {

        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

    };


    /* =========================================================
       CLOSE
    ========================================================= */

    const handleClose = () => {
        dispatch(closeModal());
    };


    /* =========================================================
       SAVE
    ========================================================= */

    const handleSave = (event) => {

        event.preventDefault();

        const mode =
            form.mode === "MANUAL"
                ? "MANUAL"
                : "AUTO";

        const prefix =
            form.prefix?.trim() || "INV-";

        const nextNumber =
            String(
                form.nextNumber || "000001"
            ).replace(/\D/g, "") || "1";


        /* -------------------------------------------------------
           MANUAL VALIDATION
        ------------------------------------------------------- */

        if (mode === "MANUAL") {

            const manualInvoiceNumber =
                form.manualInvoiceNumber?.trim();

            if (!manualInvoiceNumber) {

                alert(
                    "Please enter invoice number"
                );

                return;
            }

        }


        /* -------------------------------------------------------
           SAVE SETTINGS TO REDUX
        ------------------------------------------------------- */

        dispatch(
            setInvoiceNumberSetting({
                field: "mode",
                value: mode,
            })
        );

        dispatch(
            setInvoiceNumberSetting({
                field: "prefix",
                value: prefix,
            })
        );

        dispatch(
            setInvoiceNumberSetting({
                field: "nextNumber",
                value: nextNumber,
            })
        );

        dispatch(
            setInvoiceNumberSetting({
                field: "restartFiscalYear",
                value:
                    form.restartFiscalYear ??
                    false,
            })
        );


        /* -------------------------------------------------------
           AUTO MODE
        ------------------------------------------------------- */

        if (mode === "AUTO") {

            const generatedInvoiceNumber =
                `${prefix}${String(
                    nextNumber
                ).padStart(6, "0")}`;

            console.log(
                "AUTO MODE - GENERATED INVOICE NUMBER:",
                generatedInvoiceNumber
            );

            dispatch(
                setInvoiceField({
                    field: "invoiceNumber",
                    value:
                        generatedInvoiceNumber,
                })
            );
        }


        /* -------------------------------------------------------
           MANUAL MODE
        ------------------------------------------------------- */

        if (mode === "MANUAL") {

            const manualInvoiceNumber =
                form.manualInvoiceNumber.trim();

            console.log(
                "MANUAL MODE - INVOICE NUMBER:",
                manualInvoiceNumber
            );

            dispatch(
                setInvoiceField({
                    field: "invoiceNumber",
                    value:
                        manualInvoiceNumber,
                })
            );
        }


        /* -------------------------------------------------------
           CLOSE
        ------------------------------------------------------- */

        dispatch(closeModal());

    };


    /* =========================================================
       DERIVED MODE
    ========================================================= */

    const isAuto =
        form.mode === "AUTO";

    const isManual =
        form.mode === "MANUAL";


    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div
            className="
                w-full
                h-full
                bg-white
                overflow-hidden
                flex
                flex-col
            "
        >

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                className="
                    shrink-0
                    flex
                    items-center
                    justify-between
                    px-6
                    py-4
                    border-b
                    border-gray-200
                    bg-white
                "
            >

                <div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Invoice Number Settings
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                        Configure how invoice numbers are generated.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={handleClose}
                    className="
                        text-gray-400
                        hover:text-gray-600
                        transition
                    "
                >
                    <X size={20} />
                </button>

            </div>


            {/* =====================================================
                FORM
            ===================================================== */}

            <form
                onSubmit={handleSave}
                className="
                    flex
                    flex-col
                    flex-1
                    min-h-0
                    overflow-hidden
                "
            >

                {/* =================================================
                    BODY
                ================================================= */}

                <div
                    className="
                        flex-1
                        min-h-0
                        overflow-y-scroll
                        overflow-x-hidden
                        px-6
                        py-6
                    "
                >

                    {/* =================================================
                        CURRENT NUMBER
                    ================================================= */}

                    <div className="mb-6">

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Invoice Number
                        </label>

                        <input
                            value={
                                currentInvoiceNumber
                            }
                            readOnly
                            className="
                                w-full
                                border
                                border-gray-300
                                rounded
                                px-3
                                py-2
                                bg-gray-50
                                text-gray-600
                                focus:outline-none
                            "
                        />

                    </div>


                    {/* =================================================
                        MODE
                    ================================================= */}

                    <div className="mb-6">

                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Invoice Number Mode
                        </label>


                        <div className="flex gap-6">

                            {/* AUTO */}

                            <label
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    cursor-pointer
                                "
                            >

                                <input
                                    type="radio"
                                    name="invoiceNumberMode"
                                    value="AUTO"
                                    checked={isAuto}
                                    onChange={() =>
                                        handleChange(
                                            "mode",
                                            "AUTO"
                                        )
                                    }
                                />

                                <span className="text-sm text-gray-700">
                                    Automatic
                                </span>

                            </label>


                            {/* MANUAL */}

                            <label
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    cursor-pointer
                                "
                            >

                                <input
                                    type="radio"
                                    name="invoiceNumberMode"
                                    value="MANUAL"
                                    checked={isManual}
                                    onChange={() =>
                                        handleChange(
                                            "mode",
                                            "MANUAL"
                                        )
                                    }
                                />

                                <span className="text-sm text-gray-700">
                                    Manual
                                </span>

                            </label>

                        </div>

                    </div>


                    {/* =================================================
                        MANUAL INVOICE NUMBER
                    ================================================= */}

                    {isManual && (

                        <div className="mb-6">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Invoice Number
                            </label>

                            <input
                                type="text"
                                value={
                                    form.manualInvoiceNumber
                                }
                                onChange={(event) =>
                                    handleChange(
                                        "manualInvoiceNumber",
                                        event.target.value
                                    )
                                }
                                placeholder="Enter invoice number"
                                autoFocus
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded
                                    px-3
                                    py-2
                                    focus:outline-none
                                    focus:border-blue-400
                                "
                            />

                            <p className="text-xs text-gray-500 mt-1">
                                Enter the invoice number manually.
                            </p>

                        </div>

                    )}


                    {/* =================================================
                        PREFIX
                    ================================================= */}

                    <div className="mb-6">

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prefix
                        </label>

                        <input
                            type="text"
                            value={
                                form.prefix
                            }
                            onChange={(event) =>
                                handleChange(
                                    "prefix",
                                    event.target.value
                                )
                            }
                            disabled={!isAuto}
                            placeholder="INV-"
                            className="
                                w-full
                                border
                                border-gray-300
                                rounded
                                px-3
                                py-2
                                focus:outline-none
                                focus:border-blue-400
                                disabled:bg-gray-100
                                disabled:text-gray-400
                                disabled:cursor-not-allowed
                            "
                        />

                    </div>


                    {/* =================================================
                        NEXT NUMBER
                    ================================================= */}

                    <div className="mb-6">

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Next Number
                        </label>

                        <input
                            type="text"
                            inputMode="numeric"
                            value={
                                form.nextNumber
                            }
                            onChange={(event) =>
                                handleChange(
                                    "nextNumber",
                                    event.target.value.replace(
                                        /\D/g,
                                        ""
                                    )
                                )
                            }
                            disabled={!isAuto}
                            placeholder="000001"
                            className="
                                w-full
                                border
                                border-gray-300
                                rounded
                                px-3
                                py-2
                                focus:outline-none
                                focus:border-blue-400
                                disabled:bg-gray-100
                                disabled:text-gray-400
                                disabled:cursor-not-allowed
                            "
                        />

                    </div>


                    {/* =================================================
                        PREVIEW
                    ================================================= */}

                    {isAuto && (

                        <div className="mb-6">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preview
                            </label>

                            <div
                                className="
                                    border
                                    border-blue-200
                                    bg-blue-50
                                    rounded
                                    px-4
                                    py-3
                                    text-blue-700
                                    font-semibold
                                "
                            >
                                {form.prefix || "INV-"}

                                {String(
                                    form.nextNumber ||
                                    "000001"
                                ).padStart(
                                    6,
                                    "0"
                                )}
                            </div>

                        </div>

                    )}


                    {/* =================================================
                        RESTART
                    ================================================= */}

                    <div className="mb-6">

                        <label className="flex items-center gap-3 cursor-pointer">

                            <input
                                type="checkbox"
                                checked={
                                    form.restartFiscalYear
                                }
                                onChange={(event) =>
                                    handleChange(
                                        "restartFiscalYear",
                                        event.target.checked
                                    )
                                }
                            />

                            <span className="text-sm text-gray-700">
                                Restart numbering every financial year
                            </span>

                        </label>

                    </div>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    className="
                        shrink-0
                        flex
                        items-center
                        justify-end
                        gap-3
                        px-6
                        py-4
                        border-t
                        border-gray-200
                        bg-white
                    "
                >

                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            border
                            border-gray-300
                            text-gray-700
                            px-5
                            py-2
                            rounded
                            text-sm
                            font-medium
                            hover:bg-gray-100
                        "
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="
                            bg-blue-500
                            hover:bg-blue-600
                            text-white
                            px-5
                            py-2
                            rounded
                            text-sm
                            font-medium
                        "
                    >
                        Save
                    </button>

                </div>

            </form>

        </div>
    );
}