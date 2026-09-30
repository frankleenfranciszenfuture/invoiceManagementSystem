
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BadgePercent, ChartColumnStackedIcon, X } from "lucide-react";
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

    const [errors, setErrors] =
        useState({});
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

    const validateCategory = () => {
        const newErrors = {};

        if (!String(form.categoryName ?? "").trim()) {
            newErrors.categoryName =
                "Category Name is required";
        }

        if (
            form.displayOrder === "" ||
            form.displayOrder === null ||
            form.displayOrder === undefined
        ) {
            newErrors.displayOrder =
                "Display Order is required";
        } else if (Number(form.displayOrder) < 1) {
            newErrors.displayOrder =
                "Display Order must be at least 1";
        }

        setErrors(newErrors);

        if (
            newErrors.categoryName ||
            newErrors.displayOrder
        ) {
            setActiveTab("category");

            toast.error(
                "Please complete Category Information"
            );

            return false;
        }

        return true;
    };
    // =========================================================
    // SAVE
    // CREATE / UPDATE
    // =========================================================

    const handleSave = async (e) => {

        e.preventDefault();

        if (!validateCategory()) {
            return;
        }
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


    const [activeTab, setActiveTab] = useState("category");

    const tabs = [
        {
            id: "category",
            label: "Category Information",
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
                        w-9
                        h-9
                        rounded-lg
                        bg-blue-50
                        flex
                        items-center
                        justify-center
                    "
                    >
                        <ChartColumnStackedIcon
                            size={20}
                            className="text-blue-600"
                        />
                    </div>

                    <div>

                        <h2
                            className="
                            text-[17px]
                            font-semibold
                            text-gray-800
                        "
                        >
                            {isEdit
                                ? "Edit Category"
                                : "New Category"}
                        </h2>

                        <p
                            className="
                            text-xs
                            text-gray-500
                            mt-0.5
                        "
                        >
                            {isEdit
                                ? "Update category information"
                                : "Create a new category"}
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
                px-6
                border-b
                border-gray-200
                bg-white
            "
            >

                <div
                    className="
                    flex
                    items-center
                    gap-8
                    h-[52px]
                "
                >

                    {tabs.map((tab) => {

                        const active =
                            activeTab === tab.id;

                        const hasError =
                            tab.id === "category" &&
                            (
                                errors.categoryName ||
                                errors.displayOrder
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
                                text-sm
                                font-medium
                                transition

                                ${active
                                        ? "text-blue-600"
                                        : hasError
                                            ? "text-red-500"
                                            : "text-gray-500 hover:text-gray-800"
                                    }
                            `}
                            >

                                <span
                                    className="
                                    flex
                                    items-center
                                    gap-1.5
                                "
                                >

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

                                {active && (
                                    <span
                                        className="
                                        absolute
                                        left-0
                                        right-0
                                        bottom-0
                                        h-[2px]
                                        bg-blue-600
                                        rounded-t
                                    "
                                    />
                                )}

                            </button>
                        );
                    })}

                </div>

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
                    CATEGORY INFORMATION
                ================================================= */}

                    {activeTab === "category" && (

                        <div>

                            {/* SECTION HEADER */}

                            <div
                                className="
                                mb-6
                                flex
                                items-start
                                justify-between
                                gap-6
                            "
                            >

                                <div>

                                    <h3
                                        className="
                                        text-base
                                        font-semibold
                                        text-gray-800
                                    "
                                    >
                                        Category Information
                                    </h3>

                                    <p
                                        className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                    >
                                        Configure the basic category
                                        information.
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

                                        ${form.status ===
                                                "ACTIVE"
                                                ? "bg-green-50 text-green-700"
                                                : form.status ===
                                                    "INACTIVE"
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-yellow-50 text-yellow-700"
                                            }
                                    `}
                                    >
                                        {form.status ||
                                            "ACTIVE"}
                                    </span>

                                </div>

                            </div>


                            {/* =================================================
                            CATEGORY FIELDS
                        ================================================= */}

                            <div
                                className="
                                grid
                                grid-cols-2
                                gap-x-6
                                gap-y-5
                            "
                            >

                                {/* CATEGORY NAME */}

                                <div>

                                    <label
                                        className={labelClass}
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
                                            form.categoryName ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "categoryName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter category name"
                                        className={inputClass}
                                    />

                                    {errors.categoryName && (
                                        <p
                                            className="
                                            text-xs
                                            text-red-500
                                            mt-1
                                        "
                                        >
                                            {
                                                errors.categoryName
                                            }
                                        </p>
                                    )}

                                </div>


                                {/* DISPLAY ORDER */}

                                <div>

                                    <label
                                        className={labelClass}
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
                                        className={inputClass}
                                    />

                                    {errors.displayOrder && (
                                        <p
                                            className="
                                            text-xs
                                            text-red-500
                                            mt-1
                                        "
                                        >
                                            {
                                                errors.displayOrder
                                            }
                                        </p>
                                    )}

                                </div>


                                {/* DESCRIPTION */}

                                <div
                                    className="
                                    col-span-2
                                "
                                >

                                    <label
                                        className={labelClass}
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        rows={5}
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
                                        placeholder="Enter category description"
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
                    SETTINGS
                ================================================= */}

                    {activeTab === "settings" && (

                        <div>

                            <div className="mb-6">

                                <h3
                                    className="
                                    text-base
                                    font-semibold
                                    text-gray-800
                                "
                                >
                                    Category Settings
                                </h3>

                                <p
                                    className="
                                    text-xs
                                    text-gray-500
                                    mt-1
                                "
                                >
                                    Configure the category availability
                                    and status.
                                </p>

                            </div>


                            {/* STATUS */}

                            <div className="max-w-[460px]">

                                <label
                                    className={labelClass}
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
                                    className={inputClass}
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


                            {/* CATEGORY STATE */}

                            <div
                                className="
                                mt-7
                                border
                                border-gray-200
                                rounded-lg
                                bg-white
                                p-5
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
                                            font-medium
                                            text-gray-800
                                        "
                                        >
                                            Category Status
                                        </p>

                                        <p
                                            className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        "
                                        >
                                            This category is currently
                                            set to{" "}

                                            <span
                                                className="
                                                font-medium
                                                text-gray-700
                                            "
                                            >
                                                {form.status ||
                                                    "ACTIVE"}
                                            </span>

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
                                        text-xs
                                        font-medium

                                        ${form.status ===
                                                "ACTIVE"
                                                ? "bg-green-50 text-green-700"
                                                : form.status ===
                                                    "INACTIVE"
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-yellow-50 text-yellow-700"
                                            }
                                    `}
                                    >
                                        {form.status ||
                                            "ACTIVE"}
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

                    <div
                        className="
                        text-xs
                        text-gray-500
                    "
                    >

                        <span className="text-red-500">
                            *
                        </span>

                        {" "}Required fields

                    </div>


                    <div
                        className="
                        flex
                        items-center
                        gap-3
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


                        {/* SAVE */}

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
                                ? isEdit
                                    ? "Updating..."
                                    : "Saving..."
                                : isEdit
                                    ? "Update Category"
                                    : "Save Category"}
                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}
