import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { closeModal } from "../../ui/uiSlice";

import {
    resetSubCategoryForm,
    setSubCategoryField,
} from "../slices/subCategorySlice";

import {
    createSubCategory,
    updateSubCategory,
} from "../thunks/subCategoryThunks";

export default function SubCategoryCreate() {

    const dispatch = useDispatch();

    // =========================================================
    // REDUX
    // =========================================================

    const { modal } = useSelector(
        (state) => state.ui
    );

    const {
        subCategory,
        loading,
    } = useSelector(
        (state) => state.subCategory
    );

    // =========================================================
    // ADD / EDIT MODE
    // =========================================================

    const isEdit =
        modal.type === "editSubCategory";

    const isOpen =
        modal.open &&
        (
            modal.type === "addSubCategory" ||
            modal.type === "editSubCategory"
        );

    // =========================================================
    // FORM
    // =========================================================

    const form = subCategory || {
        id: null,
        categoryId: null,
        name: "",
        description: "",
        displayOrder: 1,
        status: "ACTIVE",
    };

    // =========================================================
    // CHANGE FIELD
    // =========================================================

    const handleChange = (field, value) => {

        dispatch(
            setSubCategoryField({
                field,
                value,
            })
        );

    };

    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const handleClose = () => {

        dispatch(
            closeModal()
        );

        dispatch(
            resetSubCategoryForm()
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
            modal.type === "editSubCategory" &&
            modal.data
        ) {

            const existingSubCategory =
                modal.data;

            dispatch(
                setSubCategoryField({
                    field: "id",
                    value:
                        existingSubCategory.id ??
                        null,
                })
            );

            dispatch(
                setSubCategoryField({
                    field: "categoryId",
                    value:
                        existingSubCategory.categoryId ??
                        null,
                })
            );

            dispatch(
                setSubCategoryField({
                    field: "name",
                    value:
                        existingSubCategory.name ??
                        "",
                })
            );

            dispatch(
                setSubCategoryField({
                    field: "description",
                    value:
                        existingSubCategory.description ??
                        "",
                })
            );

            dispatch(
                setSubCategoryField({
                    field: "displayOrder",
                    value:
                        existingSubCategory.displayOrder ??
                        1,
                })
            );

            dispatch(
                setSubCategoryField({
                    field: "status",
                    value:
                        existingSubCategory.status ??
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

        // =====================================================
        // CATEGORY
        // =====================================================

        if (!form.categoryId) {

            toast.error(
                "Category is required"
            );

            return;
        }

        // =====================================================
        // NAME
        // =====================================================

        if (!form.name?.trim()) {

            toast.error(
                "Sub category name is required"
            );

            return;
        }

        // =====================================================
        // DISPLAY ORDER
        // =====================================================

        const displayOrder =
            Number(form.displayOrder);

        if (
            !Number.isInteger(displayOrder) ||
            displayOrder < 1
        ) {

            toast.error(
                "Display order must be a valid number greater than 0"
            );

            return;
        }

        // =====================================================
        // PAYLOAD
        // =====================================================

        const payload = {

            categoryId:
                Number(form.categoryId),

            name:
                form.name.trim(),

            description:
                form.description?.trim() ||
                "",

            displayOrder:
                displayOrder,

        };

        try {

            // =================================================
            // EDIT
            // =================================================

            if (isEdit) {

                const subCategoryId =
                    form.id ??
                    modal.data?.id;

                if (!subCategoryId) {

                    toast.error(
                        "Sub category ID is missing"
                    );

                    return;
                }

                await dispatch(
                    updateSubCategory({
                        id: subCategoryId,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Sub category updated successfully"
                );

            }

            // =================================================
            // CREATE
            // =================================================

            else {

                await dispatch(
                    createSubCategory(payload)
                ).unwrap();

                toast.success(
                    "Sub category created successfully"
                );

            }

            // =================================================
            // CLOSE + RESET
            // =================================================

            dispatch(
                closeModal()
            );

            dispatch(
                resetSubCategoryForm()
            );

        } catch (error) {

            console.error(
                "Sub category save error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update sub category"
                            : "Failed to create sub category"
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
                            ? "Edit Sub Category"
                            : "Add New Sub Category"}
                    </h2>

                    <p
                        className="
                            text-sm
                            text-gray-100
                            mt-1
                        "
                    >
                        {isEdit
                            ? "Update sub category details"
                            : "Create a new sub category"}
                    </p>

                </div>

                {/* =================================================
                    CLOSE BUTTON
                ================================================= */}

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
                        CATEGORY
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

                            Category

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
                                form.categoryId ??
                                ""
                            }
                            onChange={(e) =>
                                handleChange(
                                    "categoryId",
                                    e.target.value
                                        ? Number(e.target.value)
                                        : null
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
                                Select Category
                            </option>

                            {/* 
                                Replace with categories
                                from Redux.

                                Example:

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.categoryName}
                                    </option>
                                ))}
                            */}

                        </select>

                    </div>

                    {/* =================================================
                        SUB CATEGORY NAME
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

                            Sub Category Name

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
                                form.name ??
                                ""
                            }
                            onChange={(e) =>
                                handleChange(
                                    "name",
                                    e.target.value
                                )
                            }
                            placeholder="Enter sub category name"
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
                        DISPLAY ORDER
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

                            Display Order

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
                            min="1"
                            value={
                                form.displayOrder ??
                                1
                            }
                            onChange={(e) =>
                                handleChange(
                                    "displayOrder",
                                    e.target.value
                                )
                            }
                            placeholder="Enter display order"
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

                    {/* =================================================
                        CANCEL
                    ================================================= */}

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

                    {/* =================================================
                        SAVE / UPDATE
                    ================================================= */}

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