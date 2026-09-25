import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { closeModal } from "../../ui/uiSlice";

import {
    resetSizeForm,
    setSizeField,
} from "../slices/sizeSlice";

import {
    createSize,
    updateSize,
} from "../thunks/sizeThunks";

export default function SizeCreate() {

    const dispatch = useDispatch();

    const { modal } = useSelector(
        (state) => state.ui
    );

    const {
        size,
        loading,
    } = useSelector(
        (state) => state.size
    );

    // =========================================================
    // ADD / EDIT MODE
    // =========================================================

    const isEdit =
        modal.type === "editSize";

    const isOpen =
        modal.open &&
        (
            modal.type === "addSize" ||
            modal.type === "editSize"
        );

    // =========================================================
    // FORM
    // =========================================================

    const form = size || {
        id: null,
        sizeName: "",
        sizeShortName: "",
        description: "",
        status: "ACTIVE",
    };

    // =========================================================
    // CHANGE FIELD
    // =========================================================

    const handleChange = (field, value) => {

        dispatch(
            setSizeField({
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
            resetSizeForm()
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
            modal.type === "editSize" &&
            modal.data
        ) {

            const existingSize =
                modal.data;

            dispatch(
                setSizeField({
                    field: "id",
                    value:
                        existingSize.id ??
                        null,
                })
            );

            dispatch(
                setSizeField({
                    field: "sizeName",
                    value:
                        existingSize.sizeName ??
                        "",
                })
            );

            dispatch(
                setSizeField({
                    field: "sizeShortName",
                    value:
                        existingSize.sizeShortName ??
                        "",
                })
            );

            dispatch(
                setSizeField({
                    field: "description",
                    value:
                        existingSize.description ??
                        "",
                })
            );

            dispatch(
                setSizeField({
                    field: "status",
                    value:
                        existingSize.status ??
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
        // SIZE NAME
        // -----------------------------------------------------

        if (!form.sizeName?.trim()) {

            toast.error(
                "Size name is required"
            );

            return;
        }

        // -----------------------------------------------------
        // PAYLOAD
        // -----------------------------------------------------

        const payload = {

            sizeName:
                form.sizeName.trim(),

            sizeShortName:
                form.sizeShortName?.trim() ||
                "",

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

                const sizeId =
                    form.id ??
                    modal.data?.id;

                if (!sizeId) {

                    toast.error(
                        "Size ID is missing"
                    );

                    return;
                }

                await dispatch(
                    updateSize({
                        id: sizeId,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Size updated successfully"
                );

            }

            // =================================================
            // CREATE
            // =================================================

            else {

                await dispatch(
                    createSize(payload)
                ).unwrap();

                toast.success(
                    "Size created successfully"
                );

            }

            // =================================================
            // CLOSE + RESET
            // =================================================

            dispatch(
                closeModal()
            );

            dispatch(
                resetSizeForm()
            );

        } catch (error) {

            console.error(
                "Size save error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update size"
                            : "Failed to create size"
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
                            ? "Edit Size"
                            : "Add New Size"}
                    </h2>

                    <p
                        className="
                            text-sm
                            text-gray-100
                            mt-1
                        "
                    >
                        {isEdit
                            ? "Update size details"
                            : "Create a new size"}
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
                        SIZE NAME
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

                            Size Name

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
                                form.sizeName ??
                                ""
                            }
                            onChange={(e) =>
                                handleChange(
                                    "sizeName",
                                    e.target.value
                                )
                            }
                            placeholder="Enter size name"
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
                        SIZE SHORT NAME
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

                            Size Short Name

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
                                form.sizeShortName ??
                                ""
                            }
                            onChange={(e) =>
                                handleChange(
                                    "sizeShortName",
                                    e.target.value
                                )
                            }
                            placeholder="Enter size short name"
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