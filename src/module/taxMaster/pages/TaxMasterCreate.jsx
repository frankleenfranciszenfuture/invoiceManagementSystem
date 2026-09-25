import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { closeModal } from "../../ui/uiSlice";

import {
    resetTaxMasterForm,
    setTaxMasterField,
} from "../slices/taxMasterSlice";

import {
    createTaxMaster,
    updateTaxMaster,
} from "../thunks/taxMasterThunks";

export default function TaxMasterCreate() {

    const dispatch = useDispatch();

    const { modal } = useSelector(
        (state) => state.ui
    );

    const {
        taxMaster,
        loading,
    } = useSelector(
        (state) => state.taxMaster
    );

    // =========================================================
    // ADD / EDIT MODE
    // =========================================================

    const isEdit =
        modal.type === "editTaxMaster";

    const isOpen =
        modal.open &&
        (
            modal.type === "addTaxMaster" ||
            modal.type === "editTaxMaster"
        );

    // =========================================================
    // FORM
    // =========================================================

    const form = taxMaster || {
        id: null,
        taxName: "",
        taxType: "",
        taxRate: "",
        cgstRate: "",
        sgstRate: "",
        igstRate: "",
        description: "",
        status: "ACTIVE",
    };

    // =========================================================
    // CHANGE FIELD
    // =========================================================

    const handleChange = (field, value) => {

        dispatch(
            setTaxMasterField({
                field,
                value,
            })
        );

    };

    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const handleClose = () => {

        dispatch(closeModal());

        dispatch(
            resetTaxMasterForm()
        );

    };

    // =========================================================
    // ESCAPE KEY
    // =========================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const handleEscape = (event) => {

            if (event.key === "Escape") {
                handleClose();
            }

        };

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, [isOpen]);

    // =========================================================
    // LOAD EXISTING DATA FOR EDIT
    // =========================================================

    useEffect(() => {

        if (
            modal.open &&
            modal.type === "editTaxMaster" &&
            modal.data
        ) {

            const tax =
                modal.data;

            dispatch(
                setTaxMasterField({
                    field: "id",
                    value:
                        tax.id ??
                        null,
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "taxName",
                    value:
                        tax.taxName ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "taxType",
                    value:
                        tax.taxType ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "taxRate",
                    value:
                        tax.taxRate ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "cgstRate",
                    value:
                        tax.cgstRate ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "sgstRate",
                    value:
                        tax.sgstRate ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "igstRate",
                    value:
                        tax.igstRate ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "description",
                    value:
                        tax.description ??
                        "",
                })
            );

            dispatch(
                setTaxMasterField({
                    field: "status",
                    value:
                        tax.status ??
                        "ACTIVE",
                })
            );

        }

    }, [
        modal.open,
        modal.type,
        modal.data,
        dispatch,
    ]);

    // =========================================================
    // SAVE
    // CREATE / UPDATE
    // =========================================================

    const handleSave = async (e) => {

        e.preventDefault();

        // -----------------------------------------------------
        // TAX NAME
        // -----------------------------------------------------

        if (!form.taxName?.trim()) {

            toast.error(
                "Tax name is required"
            );

            return;
        }

        // -----------------------------------------------------
        // TAX TYPE
        // -----------------------------------------------------

        if (!form.taxType) {

            toast.error(
                "Tax type is required"
            );

            return;
        }

        // -----------------------------------------------------
        // TAX RATE
        // -----------------------------------------------------

        if (
            form.taxRate === "" ||
            Number(form.taxRate) <= 0
        ) {

            toast.error(
                "Tax rate is required"
            );

            return;
        }

        // -----------------------------------------------------
        // CGST + SGST
        // -----------------------------------------------------

        if (
            form.taxType === "CGST_SGST"
        ) {

            if (
                form.cgstRate === "" ||
                Number(form.cgstRate) <= 0
            ) {

                toast.error(
                    "CGST rate is required"
                );

                return;
            }

            if (
                form.sgstRate === "" ||
                Number(form.sgstRate) <= 0
            ) {

                toast.error(
                    "SGST rate is required"
                );

                return;
            }

            const combinedRate =
                Number(form.cgstRate || 0) +
                Number(form.sgstRate || 0);

            if (
                combinedRate !==
                Number(form.taxRate)
            ) {

                toast.error(
                    "CGST + SGST rate must equal Tax Rate"
                );

                return;
            }

        }

        // -----------------------------------------------------
        // IGST
        // -----------------------------------------------------

        if (
            form.taxType === "IGST"
        ) {

            if (
                form.igstRate === "" ||
                Number(form.igstRate) <= 0
            ) {

                toast.error(
                    "IGST rate is required"
                );

                return;
            }

            if (
                Number(form.igstRate) !==
                Number(form.taxRate)
            ) {

                toast.error(
                    "IGST rate must equal Tax Rate"
                );

                return;
            }

        }

        // -----------------------------------------------------
        // PAYLOAD
        // -----------------------------------------------------

        const payload = {

            taxName:
                form.taxName.trim(),

            taxType:
                form.taxType,

            taxRate:
                Number(form.taxRate),

            cgstRate:
                form.taxType === "CGST_SGST"
                    ? Number(form.cgstRate || 0)
                    : 0,

            sgstRate:
                form.taxType === "CGST_SGST"
                    ? Number(form.sgstRate || 0)
                    : 0,

            igstRate:
                form.taxType === "IGST"
                    ? Number(form.igstRate || 0)
                    : 0,

            description:
                form.description?.trim() ||
                "",

            status:
                form.status ||
                "ACTIVE",
        };

        try {

            // =================================================
            // EDIT
            // =================================================

            if (isEdit) {

                const taxId =
                    form.id ??
                    modal.data?.id;

                if (!taxId) {

                    toast.error(
                        "Tax master ID is missing"
                    );

                    return;
                }

                await dispatch(
                    updateTaxMaster({
                        id: taxId,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Tax master updated successfully"
                );

            }

            // =================================================
            // CREATE
            // =================================================

            else {

                await dispatch(
                    createTaxMaster(payload)
                ).unwrap();

                toast.success(
                    "Tax master created successfully"
                );

            }

            // =================================================
            // CLOSE + RESET
            // =================================================

            dispatch(
                closeModal()
            );

            dispatch(
                resetTaxMasterForm()
            );

        } catch (error) {

            console.error(
                "Tax master save error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update tax master"
                            : "Failed to create tax master"
                    )
            );

        }

    };

    // =========================================================
    // DO NOT RENDER
    // =========================================================

    if (!isOpen) {
        return null;
    }

    // =========================================================
    // UI
    // =========================================================

    return (

        <div
            className="
                w-[950px]
                h-[650px]
                max-w-[65vw]
                bg-white
                rounded-lg
                shadow-2xl
                overflow-hidden
                flex
                flex-col
            "
        >

            {/* =================================================
                HEADER
            ================================================= */}

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
                    bg-blue-700
                "
            >

                <div>

                    <h2
                        className="
                            text-[24px]
                            font-semibold
                            text-gray-100
                        "
                    >
                        {isEdit
                            ? "Edit Tax"
                            : "Add New Tax"}
                    </h2>

                    <p
                        className="
                            text-sm
                            text-gray-100
                            mt-1
                        "
                    >
                        {isEdit
                            ? "Update tax master details"
                            : "Create a new tax master"}
                    </p>

                </div>

                {/* CLOSE */}

                {/* <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="
                        w-9
                        h-9
                        flex
                        items-center
                        justify-center
                        rounded-md
                        text-gray-100
                        hover:bg-red-600
                        hover:text-gray-100
                        transition
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                    "
                >

                    <X size={30} />

                </button> */}

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
                onSubmit={handleSave}
                className="
                    flex
                    flex-col
                    flex-1
                    min-h-0
                "
            >

                {/* =================================================
                    SCROLL BODY
                ================================================= */}

                <div
                    className="
                        flex-1
                        min-h-0
                        overflow-y-auto
                        px-6
                        py-6
                    "
                >

                    {/* =================================================
                        TAX NAME
                    ================================================= */}

                    <div className="mb-5">

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                mb-2
                            "
                        >

                            Tax Name

                            <span
                                className="
                                    text-red-500
                                    ml-1
                                "
                            >
                                *
                            </span>

                        </label>

                        <input
                            type="text"
                            value={
                                form.taxName ??
                                ""
                            }
                            onChange={(e) =>
                                handleChange(
                                    "taxName",
                                    e.target.value
                                )
                            }
                            placeholder="Enter tax name"
                            className="
                                w-full
                                h-11
                                px-3
                                border
                                border-gray-300
                                rounded-md
                                text-sm
                                outline-none
                                focus:border-blue-500
                                focus:ring-1
                                focus:ring-blue-500
                            "
                        />

                    </div>

                    {/* =================================================
                        TAX TYPE + TAX RATE
                    ================================================= */}

                    <div
                        className="
                            grid
                            grid-cols-2
                            gap-5
                            mb-5
                        "
                    >

                        {/* TAX TYPE */}

                        <div>

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >

                                Tax Type

                                <span
                                    className="
                                        text-red-500
                                        ml-1
                                    "
                                >
                                    *
                                </span>

                            </label>

                            <select
                                value={
                                    form.taxType ??
                                    ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "taxType",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    h-11
                                    px-3
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    bg-white
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
                            >

                                <option value="">
                                    Select Tax Type
                                </option>

                                <option value="CGST_SGST">
                                    CGST + SGST
                                </option>

                                <option value="IGST">
                                    IGST
                                </option>

                            </select>

                        </div>

                        {/* TAX RATE */}

                        <div>

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >

                                Tax Rate (%)

                                <span
                                    className="
                                        text-red-500
                                        ml-1
                                    "
                                >
                                    *
                                </span>

                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    form.taxRate ??
                                    ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "taxRate",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter tax rate"
                                className="
                                    w-full
                                    h-11
                                    px-3
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                    </div>

                    {/* =================================================
                        CGST + SGST
                    ================================================= */}

                    {form.taxType === "CGST_SGST" && (

                        <div
                            className="
                                grid
                                grid-cols-2
                                gap-5
                                mb-5
                            "
                        >

                            {/* CGST */}

                            <div>

                                <label
                                    className="
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                        mb-2
                                    "
                                >

                                    CGST Rate (%)

                                    <span
                                        className="
                                            text-red-500
                                            ml-1
                                        "
                                    >
                                        *
                                    </span>

                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        form.cgstRate ??
                                        ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "cgstRate",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter CGST rate"
                                    className="
                                        w-full
                                        h-11
                                        px-3
                                        border
                                        border-gray-300
                                        rounded-md
                                        text-sm
                                        outline-none
                                        focus:border-blue-500
                                        focus:ring-1
                                        focus:ring-blue-500
                                    "
                                />

                            </div>

                            {/* SGST */}

                            <div>

                                <label
                                    className="
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                        mb-2
                                    "
                                >

                                    SGST Rate (%)

                                    <span
                                        className="
                                            text-red-500
                                            ml-1
                                        "
                                    >
                                        *
                                    </span>

                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        form.sgstRate ??
                                        ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "sgstRate",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter SGST rate"
                                    className="
                                        w-full
                                        h-11
                                        px-3
                                        border
                                        border-gray-300
                                        rounded-md
                                        text-sm
                                        outline-none
                                        focus:border-blue-500
                                        focus:ring-1
                                        focus:ring-blue-500
                                    "
                                />

                            </div>

                        </div>

                    )}

                    {/* =================================================
                        IGST
                    ================================================= */}

                    {form.taxType === "IGST" && (

                        <div className="mb-5">

                            <label
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    mb-2
                                "
                            >

                                IGST Rate (%)

                                <span
                                    className="
                                        text-red-500
                                        ml-1
                                    "
                                >
                                    *
                                </span>

                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    form.igstRate ??
                                    ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "igstRate",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter IGST rate"
                                className="
                                    w-full
                                    h-11
                                    px-3
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                    )}

                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <div className="mb-5">

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                mb-2
                            "
                        >
                            Description
                        </label>

                        <textarea
                            rows={4}
                            value={
                                form.description ??
                                ""
                            }
                            onChange={(e) =>
                                handleChange(
                                    "description",
                                    e.target.value
                                )
                            }
                            placeholder="Enter description"
                            className="
                                w-full
                                px-3
                                py-3
                                border
                                border-gray-300
                                rounded-md
                                text-sm
                                outline-none
                                resize-none
                                focus:border-blue-500
                                focus:ring-1
                                focus:ring-blue-500
                            "
                        />

                    </div>

                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <div className="mb-2">

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-gray-700
                                mb-2
                            "
                        >
                            Status
                        </label>

                        <select
                            value={
                                form.status ??
                                "ACTIVE"
                            }
                            onChange={(e) =>
                                handleChange(
                                    "status",
                                    e.target.value
                                )
                            }
                            className="
                                w-full
                                h-11
                                px-3
                                border
                                border-gray-300
                                rounded-md
                                text-sm
                                bg-white
                                outline-none
                                focus:border-blue-500
                                focus:ring-1
                                focus:ring-blue-500
                            "
                        >

                            <option value="ACTIVE">
                                ACTIVE
                            </option>

                            <option value="INACTIVE">
                                INACTIVE
                            </option>

                            <option value="DRAFT">
                                DRAFT
                            </option>

                        </select>

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

                    {/* CANCEL */}

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="
                            h-10
                            px-5
                            rounded-md
                            border
                            border-gray-300
                            text-sm
                            font-medium
                            text-gray-700
                            bg-white
                            hover:bg-gray-50
                            transition
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "
                    >
                        Cancel
                    </button>

                    {/* SAVE / UPDATE */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            h-10
                            px-6
                            rounded-md
                            bg-blue-600
                            text-white
                            text-sm
                            font-medium
                            hover:bg-blue-700
                            transition
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "
                    >

                        {loading
                            ? (
                                isEdit
                                    ? "Updating..."
                                    : "Saving..."
                            )
                            : (
                                isEdit
                                    ? "Update"
                                    : "Save"
                            )}

                    </button>

                </div>

            </form>

        </div>
    );
}