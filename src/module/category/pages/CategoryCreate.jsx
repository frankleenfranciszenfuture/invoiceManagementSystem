
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { closeModal } from "../../ui/uiSlice";

import {
    resetCategoryForm,
    setCategoryField,
} from "../slices/categorySlice";

import {
    createCategory,
    updateCategory,
} from "../thunks/categoryThunks";


export default function CategoryCreate() {

    const dispatch = useDispatch();


    // =========================================================
    // REDUX
    // =========================================================

    const { modal } = useSelector(
        (state) => state.ui
    );

    const {
        category,
        loading,
    } = useSelector(
        (state) => state.category
    );


    // =========================================================
    // ADD / EDIT MODE
    // =========================================================

    const isEdit =
        modal.type === "editCategory";

    const isOpen =
        modal.open &&
        (
            modal.type === "addCategory" ||
            modal.type === "editCategory"
        );


    // =========================================================
    // FORM
    // =========================================================

    const form = category || {
        id: null,
        categoryCode: "",
        categoryName: "",
        description: "",
        displayOrder: 1,
        status: "ACTIVE",
    };


    // =========================================================
    // CHANGE FIELD
    // =========================================================

    const handleChange = (field, value) => {

        dispatch(
            setCategoryField({
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
            resetCategoryForm()
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
            modal.type === "editCategory" &&
            modal.data
        ) {

            const existingCategory =
                modal.data;


            dispatch(
                setCategoryField({
                    field: "id",
                    value:
                        existingCategory.id ??
                        null,
                })
            );


            dispatch(
                setCategoryField({
                    field: "categoryCode",
                    value:
                        existingCategory.categoryCode ??
                        "",
                })
            );


            dispatch(
                setCategoryField({
                    field: "categoryName",
                    value:
                        existingCategory.categoryName ??
                        "",
                })
            );


            dispatch(
                setCategoryField({
                    field: "description",
                    value:
                        existingCategory.description ??
                        "",
                })
            );


            dispatch(
                setCategoryField({
                    field: "displayOrder",
                    value:
                        existingCategory.displayOrder ??
                        1,
                })
            );


            dispatch(
                setCategoryField({
                    field: "status",
                    value:
                        existingCategory.status ??
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
        // CATEGORY NAME
        // =====================================================

        if (!form.categoryName?.trim()) {

            toast.error(
                "Category name is required"
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

            categoryName:
                form.categoryName.trim(),

            description:
                form.description?.trim() || "",

            displayOrder:
                displayOrder,

            status:
                form.status || "ACTIVE",

        };


        try {

            // =================================================
            // EDIT
            // =================================================

            if (isEdit) {

                const categoryId =
                    form.id ??
                    modal.data?.id;


                if (!categoryId) {

                    toast.error(
                        "Category ID is missing"
                    );

                    return;
                }


                await dispatch(
                    updateCategory({
                        id: categoryId,
                        data: payload,
                    })
                ).unwrap();


                toast.success(
                    "Category updated successfully"
                );

            }


            // =================================================
            // CREATE
            // =================================================

            else {

                await dispatch(
                    createCategory(payload)
                ).unwrap();


                toast.success(
                    "Category created successfully"
                );

            }


            // =================================================
            // CLOSE + RESET
            // =================================================

            dispatch(
                closeModal()
            );

            dispatch(
                resetCategoryForm()
            );

        } catch (error) {

            console.error(
                "Category save error:",
                error
            );


            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update category"
                            : "Failed to create category"
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
                w-full
                bg-white
                rounded-xl
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
                            ? "Edit Category"
                            : "Add New Category"}
                    </h2>


                    <p
                        className="
                            text-sm
                            text-gray-100
                            mt-1
                        "
                    >
                        {isEdit
                            ? "Update category details"
                            : "Create a new category"}
                    </p>

                </div>


                {/* =================================================
                    CLOSE BUTTON
                ================================================= */}

                {/* <button
                    type="button"
                    onClick={handleClose}
                    className="
                        w-9
                        h-9

                        flex
                        items-center
                        justify-center

                        rounded-md

                        text-gray-100

                        hover:bg-red-600

                        transition
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
                    min-h-0
                "
            >

                {/* =================================================
                    FORM BODY
                ================================================= */}

                <div
                    className="
                        overflow-y-auto

                        px-6
                        py-6

                        max-h-[60vh]
                    "
                >

                    {/* =================================================
                        CATEGORY NAME
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

                            Category Name

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
                                form.categoryName ?? ""
                            }
                            onChange={(e) =>
                                handleChange(
                                    "categoryName",
                                    e.target.value
                                )
                            }
                            placeholder="Enter category name"
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
                                form.displayOrder ?? 1
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
