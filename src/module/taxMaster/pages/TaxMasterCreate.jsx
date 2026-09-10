import React from "react";
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

    /* =====================================================
       ONLY SHOW WHEN TAX MASTER MODAL IS OPEN
    ===================================================== */

    if (
        modal.type !== "addTaxMaster" ||
        !modal.open
    ) {
        return null;
    }

    /* =====================================================
       FORM
    ===================================================== */

    const form = taxMaster || {
        taxName: "",
        taxType: "",
        taxRate: "",
        cgstRate: "",
        sgstRate: "",
        igstRate: "",
        description: "",
        status: "ACTIVE",
    };

    /* =====================================================
       CHANGE
    ===================================================== */

    const handleChange = (field, value) => {

        dispatch(
            setTaxMasterField({
                field,
                value,
            })
        );

    };

    /* =====================================================
       CLOSE
    ===================================================== */

    const handleClose = () => {

        dispatch(closeModal());

        dispatch(resetTaxMasterForm());

    };

    /* =====================================================
       SAVE
    ===================================================== */

    const handleSave = async (e) => {

        e.preventDefault();

        /* -------------------------
           VALIDATION
        ------------------------- */

        if (!form.taxName?.trim()) {

            toast.error("Tax name is required");

            return;
        }

        if (!form.taxType) {

            toast.error("Tax type is required");

            return;
        }

        if (
            form.taxRate === "" ||
            Number(form.taxRate) <= 0
        ) {

            toast.error("Tax rate is required");

            return;
        }

        /* -------------------------
           CGST / SGST VALIDATION
        ------------------------- */

        if (form.taxType === "CGST_SGST") {

            if (
                form.cgstRate === "" ||
                Number(form.cgstRate) <= 0
            ) {

                toast.error("CGST rate is required");

                return;
            }

            if (
                form.sgstRate === "" ||
                Number(form.sgstRate) <= 0
            ) {

                toast.error("SGST rate is required");

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

        /* -------------------------
           IGST VALIDATION
        ------------------------- */

        if (form.taxType === "IGST") {

            if (
                form.igstRate === "" ||
                Number(form.igstRate) <= 0
            ) {

                toast.error("IGST rate is required");

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

        /* -------------------------
           API
        ------------------------- */

        try {

            await dispatch(
                createTaxMaster({

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
                        form.description?.trim() || "",

                    status:
                        form.status || "ACTIVE",

                })
            ).unwrap();

            toast.success(
                "Tax master created successfully"
            );

            dispatch(closeModal());

            dispatch(resetTaxMasterForm());

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to create tax master"
            );

        }
    };

    return (
        <div
            className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-black/40
            "
            onMouseDown={(e) => {

                if (
                    e.target === e.currentTarget
                ) {
                    handleClose();
                }

            }}
        >

            {/* =================================================
                MODAL
            ================================================= */}

            <div
                className="
                    w-[850px]
                    max-w-[95vw]
                    bg-white
                    rounded-lg
                    shadow-2xl
                    overflow-hidden
                "
                onMouseDown={(e) =>
                    e.stopPropagation()
                }
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-gray-200
                        px-6
                        py-5
                    "
                >

                    <h2
                        className="
                            text-[24px]
                            font-semibold
                            text-gray-800
                        "
                    >
                        Add Tax Master
                    </h2>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            text-red-500
                            hover:text-red-600
                            transition
                        "
                    >
                        <X size={22} strokeWidth={1.8} />
                    </button>

                </div>

                {/* =================================================
                    FORM
                ================================================= */}

                <form onSubmit={handleSave}>

                    <div
                        className="
                            px-6
                            py-6
                        "
                    >

                        {/* =================================================
                            TAX NAME
                        ================================================= */}

                        <div
                            className="
                                grid
                                grid-cols-[170px_1fr]
                                gap-4
                                items-center
                                mb-5
                            "
                        >

                            <label
                                className="
                                    text-[15px]
                                    text-gray-700
                                "
                            >
                                Tax Name
                            </label>

                            <input
                                type="text"
                                placeholder="Tax Name"
                                value={
                                    form.taxName ?? ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "taxName",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    h-[42px]
                                    border
                                    border-gray-300
                                    rounded-md
                                    px-3
                                    text-[15px]
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                        {/* =================================================
                            TAX TYPE
                        ================================================= */}

                        <div
                            className="
                                grid
                                grid-cols-[170px_1fr]
                                gap-4
                                items-center
                                mb-5
                            "
                        >

                            <label
                                className="
                                    text-[15px]
                                    text-gray-700
                                "
                            >
                                Tax Type
                            </label>

                            <select
                                value={
                                    form.taxType ?? ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "taxType",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    h-[42px]
                                    border
                                    border-gray-300
                                    rounded-md
                                    px-3
                                    text-[15px]
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

                        {/* =================================================
                            TAX RATE
                        ================================================= */}

                        <div
                            className="
                                grid
                                grid-cols-[170px_1fr]
                                gap-4
                                items-center
                                mb-5
                            "
                        >

                            <label
                                className="
                                    text-[15px]
                                    text-gray-700
                                "
                            >
                                Tax Rate (%)
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Tax Rate"
                                value={
                                    form.taxRate ?? ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "taxRate",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    h-[42px]
                                    border
                                    border-gray-300
                                    rounded-md
                                    px-3
                                    text-[15px]
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                        {/* =================================================
                            CGST / SGST
                        ================================================= */}

                        {form.taxType === "CGST_SGST" && (
                            <>

                                <div
                                    className="
                                        grid
                                        grid-cols-[170px_1fr]
                                        gap-4
                                        items-center
                                        mb-5
                                    "
                                >

                                    <label
                                        className="
                                            text-[15px]
                                            text-gray-700
                                        "
                                    >
                                        CGST Rate (%)
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="CGST Rate"
                                        value={
                                            form.cgstRate ?? ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "cgstRate",
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            h-[42px]
                                            border
                                            border-gray-300
                                            rounded-md
                                            px-3
                                            text-[15px]
                                            outline-none
                                            focus:border-blue-500
                                            focus:ring-1
                                            focus:ring-blue-500
                                        "
                                    />

                                </div>

                                <div
                                    className="
                                        grid
                                        grid-cols-[170px_1fr]
                                        gap-4
                                        items-center
                                        mb-5
                                    "
                                >

                                    <label
                                        className="
                                            text-[15px]
                                            text-gray-700
                                        "
                                    >
                                        SGST Rate (%)
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="SGST Rate"
                                        value={
                                            form.sgstRate ?? ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "sgstRate",
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            h-[42px]
                                            border
                                            border-gray-300
                                            rounded-md
                                            px-3
                                            text-[15px]
                                            outline-none
                                            focus:border-blue-500
                                            focus:ring-1
                                            focus:ring-blue-500
                                        "
                                    />

                                </div>

                            </>
                        )}

                        {/* =================================================
                            IGST
                        ================================================= */}

                        {form.taxType === "IGST" && (

                            <div
                                className="
                                    grid
                                    grid-cols-[170px_1fr]
                                    gap-4
                                    items-center
                                    mb-5
                                "
                            >

                                <label
                                    className="
                                        text-[15px]
                                        text-gray-700
                                    "
                                >
                                    IGST Rate (%)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="IGST Rate"
                                    value={
                                        form.igstRate ?? ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "igstRate",
                                            e.target.value
                                        )
                                    }
                                    className="
                                        w-full
                                        h-[42px]
                                        border
                                        border-gray-300
                                        rounded-md
                                        px-3
                                        text-[15px]
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

                        <div
                            className="
                                grid
                                grid-cols-[170px_1fr]
                                gap-4
                                items-start
                                mb-5
                            "
                        >

                            <label
                                className="
                                    text-[15px]
                                    text-gray-700
                                    pt-2
                                "
                            >
                                Description
                            </label>

                            <textarea
                                rows={3}
                                placeholder="Description"
                                value={
                                    form.description ?? ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "description",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-md
                                    px-3
                                    py-2
                                    text-[15px]
                                    resize-none
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                        {/* =================================================
                            STATUS
                        ================================================= */}

                        <div
                            className="
                                grid
                                grid-cols-[170px_1fr]
                                gap-4
                                items-center
                            "
                        >

                            <label
                                className="
                                    text-[15px]
                                    text-gray-700
                                "
                            >
                                Status
                            </label>

                            <select
                                value={
                                    form.status || "ACTIVE"
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "status",
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    h-[42px]
                                    border
                                    border-gray-300
                                    rounded-md
                                    px-3
                                    text-[15px]
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
                            border-t
                            border-gray-200
                            px-6
                            py-4
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                px-6
                                py-2.5
                                rounded-md
                                text-[15px]
                                font-medium
                                transition
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >
                            {loading
                                ? "Saving..."
                                : "Save"}
                        </button>

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="
                                border
                                border-gray-300
                                bg-white
                                hover:bg-gray-50
                                text-gray-700
                                px-6
                                py-2.5
                                rounded-md
                                text-[15px]
                                font-medium
                                transition
                                disabled:opacity-50
                            "
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}