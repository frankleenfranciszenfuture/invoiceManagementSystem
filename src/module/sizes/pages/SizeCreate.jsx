import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserRoundArrowLeft, X } from "lucide-react";
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

    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState("size");

    const tabs = [
        {
            id: "size",
            label: "Size Information",
        },
        {
            id: "settings",
            label: "Settings",
        },
    ];

    const inputClass = `
    w-full
    h-11
    px-3
    border
    border-gray-300
    rounded-md
    text-sm
    text-gray-700
    bg-white
    outline-none
    transition
    focus:border-blue-500
    focus:ring-1
    focus:ring-blue-500
    disabled:bg-gray-100
    disabled:text-gray-500
    disabled:cursor-not-allowed
`;

    const labelClass = `
    block
    text-xs
    font-medium
    text-gray-600
    mb-1.5
`;
    // =========================================================
    // UI
    // =========================================================

    return (
        <div
            className="
            w-[950px]
            max-w-[95vw]
            h-[700px]
            max-h-[88vh]
            bg-white
            rounded-xl
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
                h-[68px]
                flex
                items-center
                justify-between
                px-6
                border-b
                border-gray-200
                bg-white
            "
            >

                <div className="flex items-center gap-3">

                    <div
                        className="
                        w-10
                        h-10
                        rounded-lg
                        bg-blue-50
                        text-blue-600
                        flex
                        items-center
                        justify-center
                    "
                    >
                        <UserRoundArrowLeft
                            size={22}
                            strokeWidth={2}
                        />
                    </div>

                    <div>

                        <h2
                            className="
                            text-lg
                            font-semibold
                            text-gray-800
                        "
                        >
                            {isEdit
                                ? "Edit Size"
                                : "Add New Size"}
                        </h2>

                        <p
                            className="
                            text-xs
                            text-gray-500
                            mt-0.5
                        "
                        >
                            {isEdit
                                ? "Update size details"
                                : "Create a new size"}
                        </p>

                    </div>

                </div>

            </div>

            {/* =================================================
            TABS
        ================================================= */}

            <div
                className="
                shrink-0
                h-[52px]
                flex
                items-center
                gap-8
                px-6
                border-b
                border-gray-200
                bg-white
            "
            >

                {[
                    {
                        id: "size",
                        label: "Size Information",
                    },
                    {
                        id: "settings",
                        label: "Settings",
                    },
                ].map((tab) => {

                    const hasError =
                        tab.id === "size" &&
                        (
                            errors?.sizeName ||
                            errors?.sizeShortName
                        );

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() =>
                                setActiveTab(tab.id)
                            }
                            className={`
                            relative
                            h-full
                            px-1
                            text-sm
                            font-medium
                            transition
                            ${activeTab === tab.id
                                    ? hasError
                                        ? "text-red-600"
                                        : "text-blue-600"
                                    : hasError
                                        ? "text-red-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }
                        `}
                        >

                            <span className="flex items-center gap-2">

                                {tab.label}

                                {hasError && (
                                    <span
                                        className="
                                        w-1.5
                                        h-1.5
                                        rounded-full
                                        bg-red-500
                                    "
                                    />
                                )}

                            </span>

                            {activeTab === tab.id && (
                                <span
                                    className={`
                                    absolute
                                    bottom-0
                                    left-0
                                    right-0
                                    h-0.5
                                    ${hasError
                                            ? "bg-red-500"
                                            : "bg-blue-500"
                                        }
                                `}
                                />
                            )}

                        </button>
                    );
                })}

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
                overflow-hidden
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
                    overflow-x-hidden
                    px-7
                    py-6
                    bg-gray-50/50
                "
                >

                    {/* =================================================
                    SIZE INFORMATION TAB
                ================================================= */}

                    {activeTab === "size" && (
                        <div className="space-y-6">

                            {/* SECTION HEADER */}

                            <div
                                className="
                                flex
                                items-center
                                justify-between
                                pb-3
                                border-b
                                border-gray-200
                            "
                            >

                                <div>

                                    <h3
                                        className="
                                        text-sm
                                        font-semibold
                                        text-gray-800
                                    "
                                    >
                                        Size Information
                                    </h3>

                                    <p
                                        className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                    >
                                        Enter the basic size details.
                                    </p>

                                </div>

                                {/* STATUS */}

                                <div
                                    className="
                                    flex
                                    items-center
                                    gap-3
                                    shrink-0
                                "
                                >

                                    <label
                                        className="
                                        text-md
                                        font-semibold
                                        text-gray-600
                                    "
                                    >
                                        Status :
                                    </label>

                                    <span
                                        className={`
                                        inline-flex
                                        items-center
                                        justify-center
                                        min-w-[85px]
                                        h-7
                                        px-3
                                        rounded-full
                                        text-sm
                                        font-bold
                                        ${form.status === "ACTIVE"
                                                ? "bg-green-50 text-green-700"
                                                : form.status === "INACTIVE"
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-yellow-50 text-yellow-700"
                                            }
                                    `}
                                    >
                                        {form.status || "ACTIVE"}
                                    </span>

                                </div>

                            </div>

                            {/* =================================================
                            SIZE NAME / SHORT NAME
                        ================================================= */}

                            <div
                                className="
                                grid
                                grid-cols-2
                                gap-5
                            "
                            >

                                {/* SIZE NAME */}

                                <div>

                                    <label
                                        className="
                                        block
                                        text-xs
                                        font-medium
                                        text-gray-600
                                        mb-1.5
                                    "
                                    >
                                        Size Name
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.sizeName ?? ""
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
                                        text-gray-700
                                        bg-white
                                        outline-none
                                        transition
                                        focus:border-blue-500
                                        focus:ring-1
                                        focus:ring-blue-500
                                    "
                                    />

                                    {errors?.sizeName && (
                                        <p
                                            className="
                                            mt-1
                                            text-xs
                                            text-red-500
                                        "
                                        >
                                            {errors.sizeName}
                                        </p>
                                    )}

                                </div>

                                {/* SIZE SHORT NAME */}

                                <div>

                                    <label
                                        className="
                                        block
                                        text-xs
                                        font-medium
                                        text-gray-600
                                        mb-1.5
                                    "
                                    >
                                        Size Short Name
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.sizeShortName ?? ""
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
                                        text-gray-700
                                        bg-white
                                        outline-none
                                        transition
                                        focus:border-blue-500
                                        focus:ring-1
                                        focus:ring-blue-500
                                    "
                                    />

                                    {errors?.sizeShortName && (
                                        <p
                                            className="
                                            mt-1
                                            text-xs
                                            text-red-500
                                        "
                                        >
                                            {errors.sizeShortName}
                                        </p>
                                    )}

                                </div>

                                {/* DESCRIPTION */}

                                <div className="col-span-2">

                                    <label
                                        className="
                                        block
                                        text-xs
                                        font-medium
                                        text-gray-600
                                        mb-1.5
                                    "
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        rows={5}
                                        value={
                                            form.description ?? ""
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
                                        text-gray-700
                                        bg-white
                                        outline-none
                                        resize-none
                                        transition
                                        focus:border-blue-500
                                        focus:ring-1
                                        focus:ring-blue-500
                                    "
                                    />

                                </div>

                            </div>

                        </div>
                    )}

                    {/* =================================================
                    SETTINGS TAB
                ================================================= */}

                    {activeTab === "settings" && (
                        <div className="space-y-6">

                            {/* SECTION HEADER */}

                            <div
                                className="
                                pb-3
                                border-b
                                border-gray-200
                            "
                            >

                                <h3
                                    className="
                                    text-sm
                                    font-semibold
                                    text-gray-800
                                "
                                >
                                    Settings
                                </h3>

                                <p
                                    className="
                                    text-xs
                                    text-gray-500
                                    mt-1
                                "
                                >
                                    Configure size status.
                                </p>

                            </div>

                            {/* STATUS */}

                            <div className="max-w-md">

                                <label
                                    className="
                                    block
                                    text-xs
                                    font-medium
                                    text-gray-600
                                    mb-1.5
                                "
                                >
                                    Status
                                </label>

                                <select
                                    value={
                                        form.status ?? "ACTIVE"
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
                                    text-gray-700
                                    bg-white
                                    outline-none
                                    transition
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

                            {/* =================================================
                            STATUS SUMMARY
                        ================================================= */}

                            <div
                                className="
                                max-w-md
                                p-4
                                bg-white
                                border
                                border-gray-200
                                rounded-lg
                            "
                            >

                                <div
                                    className="
                                    flex
                                    items-center
                                    justify-between
                                "
                                >

                                    <div>

                                        <p
                                            className="
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        "
                                        >
                                            Size Status
                                        </p>

                                        <p
                                            className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        "
                                        >
                                            Current status of this size.
                                        </p>

                                    </div>

                                    <span
                                        className={`
                                        inline-flex
                                        items-center
                                        justify-center
                                        min-w-[85px]
                                        h-7
                                        px-3
                                        rounded-full
                                        text-sm
                                        font-bold
                                        ${form.status === "ACTIVE"
                                                ? "bg-green-50 text-green-700"
                                                : form.status === "INACTIVE"
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-yellow-50 text-yellow-700"
                                            }
                                    `}
                                    >
                                        {form.status || "ACTIVE"}
                                    </span>

                                </div>

                            </div>

                        </div>
                    )}

                </div>

                {/* =================================================
                FOOTER
            ================================================= */}

                <div
                    className="
                    shrink-0
                    h-[68px]
                    flex
                    items-center
                    justify-between
                    px-6
                    border-t
                    border-gray-200
                    bg-white
                "
                >

                    <div />

                    <div className="flex items-center gap-3">

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
                            bg-blue-500
                            text-white
                            text-sm
                            font-medium
                            hover:bg-blue-600
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

                </div>

            </form>

        </div>
    );
}