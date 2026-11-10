import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Tags,
    Hash,
    AlignLeft,
    ListOrdered,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createCategory,
    fetchCategoryById,
    updateCategory,
    fetchAllCategories,
} from "../thunks/categoryThunks";

import {
    resetCategoryForm,
    setCreatedCategorySelection,
} from "../slices/categorySlice";

import CustomSelect from "../../../common/custom/CustomSelect";

import LeaveConfirmationModal from "../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../../../common/confirmation/useLeaveConfirmation";

import { closeModal } from "../../../module/ui/uiSlice";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
    categoryCode: "",
    categoryName: "",
    description: "",
    status: "ACTIVE",
    displayOrder: 1,
};

/* =========================================================
   REUSABLE FORM COMPONENTS
========================================================= */

const FormField = ({
    label,
    required = false,
    children,
    className = "",
}) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <label
            className={`text-sm font-medium ${required ? "text-red-400" : "text-gray-500"
                }`}
        >
            {label}

            {required && (
                <span className="ml-1 text-red-400">*</span>
            )}
        </label>

        {children}
    </div>
);


const TextInput = ({
    value,
    onChange,
    placeholder,
    type = "text",
    disabled = false,
    maxLength,
    min,
}) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        min={min}
        className="
            h-10 w-max-full rounded-lg border border-gray-200
            bg-white px-3 text-sm text-gray-700
            outline-none transition
            placeholder:text-gray-400
            focus:border-[#408DFB] focus:ring-2
            focus:ring-[#408DFB]/10
            disabled:cursor-not-allowed disabled:bg-gray-100
        "
    />
);

const TextAreaField = ({
    value,
    onChange,
    placeholder,
    rows = 4,
}) => (
    <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="
            w-full resize-none rounded-lg border border-gray-200
            bg-white px-3 py-2.5 text-sm text-gray-700
            outline-none transition
            placeholder:text-gray-400
            focus:border-[#408DFB] focus:ring-2
            focus:ring-[#408DFB]/10
        "
    />
);

const SectionHeading = ({
    icon: Icon,
    title,
    description,
}) => (
    <div className="mb-5 flex items-center gap-3">
        <div className="
            flex h-10 w-10 items-center justify-center
            rounded-xl bg-blue-50 text-[#408DFB]
        ">
            <Icon size={19} />
        </div>

        <div>
            <h3 className="text-sm font-semibold text-gray-800">
                {title}
            </h3>

            {description && (
                <p className="mt-0.5 text-xs text-gray-400">
                    {description}
                </p>
            )}
        </div>
    </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const CategoryCreateSimple = ({ onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const isEdit = Boolean(id);

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const modalData = useSelector(
        (state) => state.ui.modal?.data
    );

    const {
        loading = false,
    } = useSelector(
        (state) => state.category ?? {}
    );

    /* =====================================================
       LOCAL STATE
    ===================================================== */

    const [formData, setFormData] = useState(initialFormData);

    const [saveMode, setSaveMode] = useState("close");

    const [showSaveOptions, setShowSaveOptions] = useState(false);

    const {
        showLeaveConfirmation,
        confirmLeave,
        handleStay,
        handleLeave,
    } = useLeaveConfirmation();

    /* =====================================================
       STATUS OPTIONS
    ===================================================== */

    const statusOptions = [
        {
            label: "Active",
            value: "ACTIVE",
        },
        {
            label: "Inactive",
            value: "INACTIVE",
        },
    ];

    /* =====================================================
       FETCH CATEGORY FOR EDIT
    ===================================================== */

    useEffect(() => {
        let isMounted = true;

        const loadCategory = async () => {
            if (!isEdit) {
                setFormData(initialFormData);
                dispatch(resetCategoryForm());
                return;
            }

            try {
                const response = await dispatch(
                    fetchCategoryById(id)
                ).unwrap();

                if (!isMounted) return;

                const category =
                    response?.data ?? response;

                if (!category) {
                    toast.error("Category not found");
                    return;
                }

                setFormData({
                    categoryCode: category.categoryCode ?? "",
                    categoryName: category.categoryName ?? "",
                    description: category.description ?? "",
                    status: category.status ?? "ACTIVE",
                    displayOrder: category.displayOrder ?? 1,
                });

            } catch (error) {
                if (isMounted) {
                    toast.error(
                        typeof error === "string"
                            ? error
                            : "Failed to fetch category details"
                    );
                }
            }
        };

        loadCategory();

        return () => {
            isMounted = false;
        };
    }, [dispatch, id, isEdit]);

    /* =====================================================
   PREFILL FORM FROM PRODUCT MODAL
===================================================== */

    useEffect(() => {
        if (isEdit || !modalData?.selectAfterCreate) return;

        setFormData((previous) => ({
            ...previous,
            categoryName:
                modalData.categoryName ?? previous.categoryName,
        }));
    }, [modalData, isEdit]);

    /* =====================================================
       HANDLE FIELD CHANGE
    ===================================================== */

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    /* =====================================================
       HANDLE CLOSE
    ===================================================== */

    const handleClose = () => {
        confirmLeave(() => {
            if (onClose) {
                onClose();
            } else {
                navigate("/settings/categories");
            }
        });
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        if (!formData.categoryName.trim()) {
            toast.error("Category name is required");
            return false;
        }

        if (formData.categoryName.trim().length < 2) {
            toast.error("Category name must contain at least 2 characters");
            return false;
        }

        if (
            formData.categoryCode.trim() &&
            formData.categoryCode.trim().length > 30
        ) {
            toast.error("Category code cannot exceed 30 characters");
            return false;
        }

        if (
            !Number.isInteger(Number(formData.displayOrder)) ||
            Number(formData.displayOrder) < 1
        ) {
            toast.error("Display order must be a positive whole number");
            return false;
        }

        return true;
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = async () => {
        if (loading) return;

        if (isEdit) {
            try {
                const response = await dispatch(
                    fetchCategoryById(id)
                ).unwrap();

                const category =
                    response?.data ?? response;

                if (!category) {
                    toast.error("Category not found");
                    return;
                }

                setFormData({
                    categoryCode: category.categoryCode ?? "",
                    categoryName: category.categoryName ?? "",
                    description: category.description ?? "",
                    status: category.status ?? "ACTIVE",
                    displayOrder: category.displayOrder ?? 1,
                });

            } catch (error) {
                toast.error(
                    typeof error === "string"
                        ? error
                        : "Failed to reset category form"
                );
            }

            return;
        }

        setFormData(initialFormData);

        dispatch(resetCategoryForm());
    };

    /* =====================================================
       SAVE CATEGORY
    ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        if (!validateForm()) return;

        const payload = {
            categoryCode: formData.categoryCode.trim(),
            categoryName: formData.categoryName.trim(),
            description: formData.description.trim(),
            status: formData.status,
            displayOrder: Number(formData.displayOrder),
        };

        try {
            let response;

            /* =============================================
               UPDATE CATEGORY
            ============================================= */

            if (isEdit) {
                response = await dispatch(
                    updateCategory({
                        id,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    response?.message ||
                    "Category updated successfully"
                );

                navigate(-1);

                return;
            }

            /* =============================================
               CREATE CATEGORY
            ============================================= */

            response = await dispatch(
                createCategory(payload)
            ).unwrap();

            toast.success(
                response?.message ||
                "Category created successfully"
            );

            const createdCategory =
                response?.data?.data ??
                response?.data ??
                response;

            /* =============================================
               SELECT CREATED CATEGORY
            ============================================= */

            if (modalData?.selectAfterCreate) {

                const createdCategoryId =
                    createdCategory?.id ??
                    createdCategory?.categoryId;

                if (createdCategoryId == null) {
                    toast.error(
                        "Category created, but category ID was not returned."
                    );
                    return;
                }

                // Store the category for ProductCreateNew.
                dispatch(
                    setCreatedCategorySelection({
                        id: createdCategoryId,
                        categoryId: createdCategoryId,
                        categoryName:
                            createdCategory?.categoryName ??
                            createdCategory?.name ??
                            payload.categoryName,
                        targetField:
                            modalData.targetField ?? "categoryId",
                    })
                );

                // Refresh available categories.
                await dispatch(fetchAllCategories()).unwrap();

                // Close the global modal.
                dispatch(closeModal());

                return;
            }

            /* =============================================
               SAVE & NEW
            ============================================= */

            if (saveMode === "new") {
                setFormData(initialFormData);

                dispatch(resetCategoryForm());

                setSaveMode("close");

                return;
            }

            /* =============================================
               SAVE & CLOSE
            ============================================= */

            dispatch(fetchAllCategories());

            dispatch(resetCategoryForm());

            if (onClose) {
                onClose();
            } else {
                dispatch(closeModal());
                navigate("/settings/categories");
            }

        } catch (error) {
            console.error(
                isEdit
                    ? "Category update error:"
                    : "Category creation error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    (isEdit
                        ? "Failed to update category"
                        : "Failed to create category")
            );
        }
    };

    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setShowSaveOptions(false);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, []);

    /* =====================================================
       LOADING SCREEN
    ===================================================== */

    if (isEdit && loading && !formData.categoryName) {
        return (
            <div className="
                flex h-full items-center justify-center
                bg-gray-50
            ">
                <div className="
                    flex items-center gap-2
                    text-sm text-gray-500
                ">
                    <Loader2
                        size={20}
                        className="animate-spin"
                    />

                    Loading category details...
                </div>
            </div>
        );
    }

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="
            flex h-full min-h-0 flex-col
            bg-gray-50 px-3.5 py-3
        ">

            {/* HEADER */}

            <div className="
                mb-3 flex shrink-0 items-center
                justify-between rounded-xl
                border-b-[3px] border-[#B7E34A]
                bg-white px-5 py-4 shadow-sm
            ">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            flex h-9 w-9 items-center
                            justify-center rounded-lg
                            border border-gray-200
                            text-gray-500 transition
                            hover:bg-gray-100
                        "
                        title="Go Back"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <h2 className="text-base font-semibold text-gray-800">
                            {isEdit
                                ? "Edit Category"
                                : "Create Category"}
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEdit
                                ? "Update your category information"
                                : "Add a new category to your organization"}
                        </p>
                    </div>

                </div>

                <div className="
                    hidden items-center gap-2
                    rounded-lg bg-blue-50 px-3 py-2 sm:flex
                ">
                    <Tags
                        size={16}
                        className="text-[#408DFB]"
                    />

                    <span className="
                        text-xs font-medium text-[#408DFB]
                    ">
                        Category
                    </span>
                </div>

            </div>

            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="
                    flex min-h-0 flex-1 flex-col
                    overflow-hidden rounded-xl
                    bg-white shadow-sm
                "
            >

                <div className="flex-1 overflow-y-auto p-5">

                    {/* CATEGORY DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Tags}
                            title="Category Details"
                            description="Enter the basic category information"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-2
                        ">
                            {/* <FormField label="Category Code">

                                <TextInput
                                    value={formData.categoryCode}
                                    onChange={(e) =>
                                        handleChange(
                                            "categoryCode",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Auto generated"
                                    disabled={!isEdit}
                                    maxLength={50}
                                />

                            </FormField> */}

                            <FormField label="Category Name" required>
                                <TextInput
                                    value={formData.categoryName}
                                    onChange={(e) =>
                                        handleChange(
                                            "categoryName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter category name"
                                    maxLength={100}
                                />
                            </FormField>


                            <FormField label="Status" required>
                                <CustomSelect
                                    value={formData.status}
                                    onChange={(value) =>
                                        handleChange("status", value)
                                    }
                                    options={statusOptions}
                                    placeholder="Select status"
                                />
                            </FormField>

                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* DESCRIPTION */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={AlignLeft}
                            title="Description"
                            description="Add additional information about this category"
                        />

                        <div className="grid grid-cols-1 gap-5">

                            <FormField label="Category Description">

                                <TextAreaField
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleChange(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter category description"
                                    rows={4}
                                />

                            </FormField>

                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* DISPLAY ORDER */}

                    <section>

                        <SectionHeading
                            icon={ListOrdered}
                            title="Display Settings"
                            description="Configure the category display order"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField
                                label="Display Order"
                                required
                            >
                                <TextInput
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) =>
                                        handleChange(
                                            "displayOrder",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter display order"
                                    min={1}
                                />
                            </FormField>

                        </div>

                    </section>

                </div>

                {/* FOOTER */}

                <div className="
                    flex shrink-0 flex-wrap items-center
                    justify-between gap-3 border-t
                    border-gray-100 bg-white px-5 py-3
                ">

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="
                            rounded-lg border border-gray-200
                            px-4 py-2 text-sm font-medium
                            text-gray-600 transition
                            hover:bg-gray-50
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>

                    <div className="flex items-center gap-2">

                        {/* RESET */}

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={loading}
                            className="
                                flex items-center gap-2
                                rounded-lg border border-gray-200
                                px-4 py-2 text-sm font-medium
                                text-gray-600 transition
                                hover:bg-gray-50
                                disabled:opacity-50
                            "
                        >
                            <RotateCcw size={15} />

                            Reset
                        </button>

                        {/* SAVE */}

                        <button
                            type="submit"
                            disabled={loading}
                            onClick={() => setSaveMode("close")}
                            className="
                                flex items-center gap-2
                                rounded-lg bg-[#408DFB]
                                px-5 py-2 text-sm font-medium
                                text-white transition
                                hover:bg-blue-600
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {loading ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save size={16} />
                            )}

                            {loading
                                ? "Saving..."
                                : isEdit
                                    ? "Update"
                                    : "Save"}
                        </button>

                        {/* SAVE OPTIONS */}

                        {!isEdit && (
                            <div className="relative">

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        setShowSaveOptions((prev) => !prev)
                                    }
                                    className="
                                        flex h-9 items-center
                                        justify-center rounded-lg
                                        border border-gray-200
                                        px-2 text-gray-600
                                        transition hover:bg-gray-50
                                        disabled:opacity-50
                                    "
                                >
                                    <ChevronDown size={17} />
                                </button>

                                {showSaveOptions && (
                                    <div className="
                                        absolute bottom-11 right-0
                                        z-20 w-44 overflow-hidden
                                        rounded-lg border border-gray-100
                                        bg-white py-1 shadow-lg
                                    ">

                                        <button
                                            type="submit"
                                            onClick={() => {
                                                setSaveMode("new");
                                                setShowSaveOptions(false);
                                            }}
                                            className="
                                                w-full px-4 py-2.5
                                                text-left text-sm
                                                text-gray-600 transition
                                                hover:bg-blue-50
                                                hover:text-[#408DFB]
                                            "
                                        >
                                            Save & New
                                        </button>

                                        <button
                                            type="submit"
                                            onClick={() => {
                                                setSaveMode("close");
                                                setShowSaveOptions(false);
                                            }}
                                            className="
                                                w-full px-4 py-2.5
                                                text-left text-sm
                                                text-gray-600 transition
                                                hover:bg-blue-50
                                                hover:text-[#408DFB]
                                            "
                                        >
                                            Save & Close
                                        </button>

                                    </div>
                                )}

                            </div>
                        )}

                    </div>

                </div>

            </form>

            {/* LEAVE CONFIRMATION */}

            <LeaveConfirmationModal
                show={showLeaveConfirmation}
                title="Leave Category?"
                message="Are you sure you want to leave this category page?"
                stayText="Stay Here"
                leaveText="Leave"
                onStay={handleStay}
                onLeave={handleLeave}
            />

        </div>
    );
};

export default CategoryCreateSimple;