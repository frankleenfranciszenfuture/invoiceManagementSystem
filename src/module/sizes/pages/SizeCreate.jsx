import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Ruler,
    Tag,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    AlignLeft,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createSize,
    fetchSizeById,
    updateSize,
    fetchAllSizes,
} from "../thunks/sizeThunks";

import { resetSizeForm } from "../slices/sizeSlice";

import CustomSelect from "../../../common/custom/CustomSelect";



import { closeModal } from "../../../module/ui/uiSlice";
import useLeaveConfirmation from "../../../common/confirmation/useLeaveConfirmation";
import LeaveConfirmationModal from "../../../common/confirmation/LeaveConfirmationModal";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
    sizeName: "",
    sizeShortName: "",
    description: "",
    status: "ACTIVE",
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
        <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
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
}) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className="
            h-10 w-full rounded-lg border border-gray-200
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
    rows = 3,
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#408DFB]">
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

const SizeCreate = ({ onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    // ID exists = Edit mode
    const isEdit = Boolean(id);

    const modalData = useSelector(
        (state) => state.ui.modal?.data
    );

    const modalOpen = useSelector(
        (state) => state.ui.modal?.open
    );

    const {
        loading = false,
        actionLoading = false,
    } = useSelector((state) => state.size ?? {});

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
       FETCH SIZE FOR EDIT
    ===================================================== */

    useEffect(() => {
        let isMounted = true;

        const loadSize = async () => {
            if (!isEdit) {
                setFormData(initialFormData);
                return;
            }

            try {
                const response = await dispatch(
                    fetchSizeById(id)
                ).unwrap();

                if (!isMounted) return;

                // Supports wrapped and unwrapped API responses
                const size = response?.data ?? response;

                if (!size) {
                    toast.error("Size not found");
                    return;
                }

                setFormData({
                    sizeName: size.sizeName ?? "",
                    sizeShortName: size.sizeShortName ?? "",
                    description: size.description ?? "",
                    status: size.status ?? "ACTIVE",
                });
            } catch (error) {
                if (isMounted) {
                    toast.error(
                        typeof error === "string"
                            ? error
                            : "Failed to fetch size details"
                    );
                }
            }
        };

        loadSize();

        return () => {
            isMounted = false;
        };
    }, [dispatch, id, isEdit]);

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
                return;
            }

            if (modalOpen) {
                dispatch(closeModal());
                return;
            }

            navigate("/settings/sizes");
        });
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        if (!formData.sizeName.trim()) {
            toast.error("Size name is required");
            return false;
        }

        if (!formData.sizeShortName.trim()) {
            toast.error("Size short name is required");
            return false;
        }

        if (formData.sizeName.trim().length > 100) {
            toast.error("Size name cannot exceed 100 characters");
            return false;
        }

        if (formData.sizeShortName.trim().length > 20) {
            toast.error("Size short name cannot exceed 20 characters");
            return false;
        }

        return true;
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {
        if (isEdit) {
            dispatch(fetchSizeById(id))
                .unwrap()
                .then((response) => {
                    const size = response?.data ?? response;

                    setFormData({
                        sizeName: size?.sizeName ?? "",
                        sizeShortName: size?.sizeShortName ?? "",
                        description: size?.description ?? "",
                        status: size?.status ?? "ACTIVE",
                    });
                })
                .catch(() => {
                    toast.error("Failed to reset size form");
                });

            return;
        }

        setFormData(initialFormData);
        setSaveMode("close");
        dispatch(resetSizeForm());
    };

    /* =====================================================
       SAVE SIZE
    ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (actionLoading || loading) return;

        if (!validateForm()) return;

        // Matches the supplied backend request fields.
        const payload = {
            sizeName: formData.sizeName.trim(),
            sizeShortName: formData.sizeShortName.trim(),
            description: formData.description.trim(),
        };

        // Status is included when updating an existing size.
        if (isEdit) {
            payload.status = formData.status;
        }

        try {
            let response;

            if (isEdit) {
                response = await dispatch(
                    updateSize({
                        id,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    response?.message || "Size updated successfully"
                );

                navigate(-1);
                return;
            }

            response = await dispatch(
                createSize(payload)
            ).unwrap();

            toast.success(
                response?.message || "Size created successfully"
            );

            // Refresh size data after creation.
            dispatch(fetchAllSizes());

            // Save & New keeps the form open and clears its values.
            if (saveMode === "new") {
                setFormData(initialFormData);
                setSaveMode("close");
                dispatch(resetSizeForm());
                return;
            }

            // Close modal when this component is rendered as a modal.
            if (onClose) {
                onClose();
            } else if (modalOpen) {
                dispatch(closeModal());
            } else {
                navigate("/settings/sizes");
            }

            dispatch(resetSizeForm());
        } catch (error) {
            console.error(
                isEdit ? "Size update error:" : "Size creation error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    (isEdit
                        ? "Failed to update size"
                        : "Failed to create size")
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
       STATUS OPTIONS
    ===================================================== */

    const statusOptions = [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
    ];

    /* =====================================================
       RENDER
    ===================================================== */

    if (isEdit && loading) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading size details...
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col bg-gray-50 px-3.5 py-3">

            {/* HEADER */}

            <div className="mb-3 flex shrink-0 items-center justify-between rounded-xl border-b-[3px] border-[#B7E34A] bg-white px-5 py-4 shadow-sm">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            flex h-9 w-9 items-center justify-center
                            rounded-lg border border-gray-200
                            text-gray-500 transition hover:bg-gray-100
                        "
                        title="Go Back"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <h2 className="text-base font-semibold text-gray-800">
                            {isEdit ? "Edit Size" : "Create Size"}
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEdit
                                ? "Update your size information"
                                : "Add a new size to your organization"}
                        </p>
                    </div>

                </div>

                <div className="hidden items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 sm:flex">
                    <Ruler size={16} className="text-[#408DFB]" />

                    <span className="text-xs font-medium text-[#408DFB]">
                        Size
                    </span>
                </div>

            </div>

            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm"
            >

                <div className="flex-1 overflow-y-auto p-5">

                    {/* SIZE DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Ruler}
                            title="Size Details"
                            description="Enter the basic size information"
                        />

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2">

                            <FormField label="Size Name" required>
                                <TextInput
                                    value={formData.sizeName}
                                    onChange={(e) =>
                                        handleChange(
                                            "sizeName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter size name"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField label="Short Name" required>
                                <TextInput
                                    value={formData.sizeShortName}
                                    onChange={(e) =>
                                        handleChange(
                                            "sizeShortName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter short name (e.g. M, L, XL)"
                                    maxLength={20}
                                />
                            </FormField>

                            {isEdit && (
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
                            )}

                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* DESCRIPTION */}

                    <section>

                        <SectionHeading
                            icon={AlignLeft}
                            title="Description"
                            description="Add additional information about this size"
                        />

                        <div className="grid grid-cols-1 gap-5">

                            <FormField label="Description">
                                <TextAreaField
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleChange(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter size description"
                                    rows={4}
                                />
                            </FormField>

                        </div>

                    </section>

                </div>

                {/* FOOTER */}

                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-3">

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={actionLoading}
                        className="
                            rounded-lg border border-gray-200
                            px-4 py-2 text-sm font-medium
                            text-gray-600 transition hover:bg-gray-50
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={actionLoading || loading}
                            className="
                                flex items-center gap-2 rounded-lg
                                border border-gray-200 px-4 py-2
                                text-sm font-medium text-gray-600
                                transition hover:bg-gray-50
                                disabled:opacity-50
                            "
                        >
                            <RotateCcw size={15} />
                            Reset
                        </button>

                        <button
                            type="submit"
                            disabled={actionLoading || loading}
                            onClick={() => setSaveMode("close")}
                            className="
                                flex items-center gap-2 rounded-lg
                                bg-[#408DFB] px-5 py-2 text-sm
                                font-medium text-white transition
                                hover:bg-blue-600 disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {actionLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}

                            {actionLoading
                                ? "Saving..."
                                : isEdit
                                    ? "Update"
                                    : "Save"}
                        </button>

                        {!isEdit && (
                            <div className="relative">

                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() =>
                                        setShowSaveOptions((prev) => !prev)
                                    }
                                    className="
                                        flex h-9 items-center justify-center
                                        rounded-lg border border-gray-200
                                        px-2 text-gray-600 transition
                                        hover:bg-gray-50 disabled:opacity-50
                                    "
                                >
                                    <ChevronDown size={17} />
                                </button>

                                {showSaveOptions && (
                                    <div className="
                                        absolute bottom-11 right-0 z-20
                                        w-44 overflow-hidden rounded-lg
                                        border border-gray-100 bg-white
                                        py-1 shadow-lg
                                    ">

                                        <button
                                            type="submit"
                                            onClick={() => {
                                                setSaveMode("new");
                                                setShowSaveOptions(false);
                                            }}
                                            className="
                                                w-full px-4 py-2.5
                                                text-left text-sm text-gray-600
                                                transition hover:bg-blue-50
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
                                                text-left text-sm text-gray-600
                                                transition hover:bg-blue-50
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

            <LeaveConfirmationModal
                show={showLeaveConfirmation}
                title="Leave Size?"
                message="Are you sure you want to leave this size page?"
                stayText="Stay Here"
                leaveText="Leave"
                onStay={handleStay}
                onLeave={handleLeave}
            />

        </div>
    );
};

export default SizeCreate;