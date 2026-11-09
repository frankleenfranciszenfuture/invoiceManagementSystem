
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Receipt,
    Percent,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    FileText,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createTaxMaster,
    fetchTaxMasterById,
    updateTaxMaster,
    fetchAllTaxMasters,
} from "../thunks/taxMasterThunks";

import {
    resetTaxMasterForm,
    setCreatedTaxMasterSelection,
} from "../slices/taxMasterSlice";

import CustomSelect from "../../../common/custom/CustomSelect";

import LeaveConfirmationModal from "../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../../../common/confirmation/useLeaveConfirmation";

import { closeModal } from "../../ui/uiSlice";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
    taxName: "",
    taxType: "CGST_SGST",
    taxRate: "",
    cgstRate: "",
    sgstRate: "",
    igstRate: "",
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
            {required && (
                <span className="ml-1 text-red-500">*</span>
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
    step,
    min,
    max,
    readOnly = false,
}) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        step={step}
        min={min}
        max={max}
        readOnly={readOnly}
        className="
            h-10 w-full rounded-lg border border-gray-200
            bg-white px-3 text-sm text-gray-700
            outline-none transition
            placeholder:text-gray-400
            focus:border-[#408DFB] focus:ring-2
            focus:ring-[#408DFB]/10
            read-only:bg-gray-50
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

const TaxCreateSimple = ({ onClose }) => {
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
        (state) => state.taxMaster ?? {}
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
       TAX RATE CALCULATION
    ===================================================== */

    const calculateTaxComponents = (taxType, taxRate) => {
        const rate = Number(taxRate);

        if (taxRate === "" || !Number.isFinite(rate)) {
            return {
                cgstRate: "",
                sgstRate: "",
                igstRate: "",
            };
        }

        if (taxType === "CGST_SGST") {
            const halfRate = Number((rate / 2).toFixed(2));

            return {
                cgstRate: halfRate,
                sgstRate: halfRate,
                igstRate: "",
            };
        }

        return {
            cgstRate: "",
            sgstRate: "",
            igstRate: Number(rate.toFixed(2)),
        };
    };

    /* =====================================================
       FETCH TAX MASTER FOR EDIT
    ===================================================== */

    useEffect(() => {
        let isMounted = true;

        const loadTaxMaster = async () => {
            if (!isEdit) {
                setFormData(initialFormData);
                return;
            }

            try {
                const response = await dispatch(
                    fetchTaxMasterById(id)
                ).unwrap();

                if (!isMounted) return;

                const taxMaster = response?.data ?? response;

                if (!taxMaster) {
                    toast.error("Tax master not found");
                    return;
                }

                setFormData({
                    taxName: taxMaster.taxName ?? "",
                    taxType: taxMaster.taxType ?? "CGST_SGST",
                    taxRate: taxMaster.taxRate ?? "",
                    cgstRate: taxMaster.cgstRate ?? "",
                    sgstRate: taxMaster.sgstRate ?? "",
                    igstRate: taxMaster.igstRate ?? "",
                    description: taxMaster.description ?? "",
                    status: taxMaster.status ?? "ACTIVE",
                });

            } catch (error) {
                if (isMounted) {
                    toast.error(
                        typeof error === "string"
                            ? error
                            : "Failed to fetch tax master details"
                    );
                }
            }
        };

        loadTaxMaster();

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
            taxName: modalData.taxName ?? previous.taxName,
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
       HANDLE TAX TYPE CHANGE
    ===================================================== */

    const handleTaxTypeChange = (value) => {
        const components = calculateTaxComponents(
            value,
            formData.taxRate
        );

        setFormData((prev) => ({
            ...prev,
            taxType: value,
            ...components,
        }));
    };

    /* =====================================================
       HANDLE TAX RATE CHANGE
    ===================================================== */

    const handleTaxRateChange = (value) => {
        const components = calculateTaxComponents(
            formData.taxType,
            value
        );

        setFormData((prev) => ({
            ...prev,
            taxRate: value,
            ...components,
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
                navigate("/settings/taxes");
            }
        });
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        if (!formData.taxName.trim()) {
            toast.error("Tax name is required");
            return false;
        }

        if (!formData.taxType) {
            toast.error("Tax type is required");
            return false;
        }

        if (
            formData.taxRate === "" ||
            !Number.isFinite(Number(formData.taxRate))
        ) {
            toast.error("Tax rate is required");
            return false;
        }

        const taxRate = Number(formData.taxRate);

        if (taxRate < 0 || taxRate > 100) {
            toast.error("Tax rate must be between 0 and 100");
            return false;
        }

        if (!formData.status) {
            toast.error("Status is required");
            return false;
        }

        return true;
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {
        if (isEdit) {
            dispatch(fetchTaxMasterById(id))
                .unwrap()
                .then((response) => {
                    const taxMaster = response?.data ?? response;

                    setFormData({
                        taxName: taxMaster?.taxName ?? "",
                        taxType: taxMaster?.taxType ?? "CGST_SGST",
                        taxRate: taxMaster?.taxRate ?? "",
                        cgstRate: taxMaster?.cgstRate ?? "",
                        sgstRate: taxMaster?.sgstRate ?? "",
                        igstRate: taxMaster?.igstRate ?? "",
                        description: taxMaster?.description ?? "",
                        status: taxMaster?.status ?? "ACTIVE",
                    });
                })
                .catch(() => {
                    toast.error("Failed to reset tax master form");
                });

            return;
        }

        setFormData(initialFormData);
        dispatch(resetTaxMasterForm());
    };

    /* =====================================================
       SAVE TAX MASTER
    ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        if (!validateForm()) return;

        const payload = {
            taxName: formData.taxName.trim(),
            taxType: formData.taxType,
            taxRate: Number(formData.taxRate),
            cgstRate:
                formData.cgstRate === ""
                    ? 0
                    : Number(formData.cgstRate),
            sgstRate:
                formData.sgstRate === ""
                    ? 0
                    : Number(formData.sgstRate),
            igstRate:
                formData.igstRate === ""
                    ? 0
                    : Number(formData.igstRate),
            description: formData.description.trim(),
            status: formData.status,
        };

        try {
            let response;

            /* =============================================
               UPDATE TAX MASTER
            ============================================= */

            if (isEdit) {
                response = await dispatch(
                    updateTaxMaster({
                        id,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    response?.message ||
                    "Tax master updated successfully"
                );

                navigate(-1);
                return;
            }

            /* =============================================
               CREATE TAX MASTER
            ============================================= */

            response = await dispatch(
                createTaxMaster(payload)
            ).unwrap();

            toast.success(
                response?.message ||
                "Tax master created successfully"
            );

            const createdTaxMaster =
                response?.data?.data ??
                response?.data ??
                response;

            /* =============================================
    SELECT CREATED TAX MASTER
 ============================================= */

            if (modalData?.selectAfterCreate) {
                const createdTaxMasterId =
                    createdTaxMaster?.id ??
                    createdTaxMaster?.taxMasterId;

                if (createdTaxMasterId == null) {
                    toast.error(
                        "Tax master created, but tax master ID was not returned."
                    );
                    return;
                }

                dispatch(
                    setCreatedTaxMasterSelection({
                        id: createdTaxMasterId,
                        taxMasterId: createdTaxMasterId,

                        taxName:
                            createdTaxMaster?.taxName ??
                            payload.taxName,

                        targetField:
                            modalData.targetField ?? "taxMasterId",
                    })
                );

                dispatch(fetchAllTaxMasters());

                dispatch(closeModal());

                return;
            }

            /* =============================================
               SAVE & NEW
            ============================================= */

            if (saveMode === "new") {
                setFormData(initialFormData);
                setSaveMode("close");

                dispatch(resetTaxMasterForm());
                dispatch(fetchAllTaxMasters());

                return;
            }

            /* =============================================
               SAVE & CLOSE
            ============================================= */

            dispatch(fetchAllTaxMasters());
            dispatch(resetTaxMasterForm());

            if (onClose) {
                onClose();
            } else {
                dispatch(closeModal());
                navigate("/settings/taxes");
            }

        } catch (error) {
            console.error(
                isEdit
                    ? "Tax master update error:"
                    : "Tax master creation error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    (isEdit
                        ? "Failed to update tax master"
                        : "Failed to create tax master")
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
       SELECT OPTIONS
    ===================================================== */

    const taxTypeOptions = [
        {
            label: "CGST + SGST",
            value: "CGST_SGST",
        },
        {
            label: "IGST",
            value: "IGST",
        },
    ];

    const statusOptions = [
        {
            label: "Active",
            value: "ACTIVE",
        },
        {
            label: "Inactive",
            value: "INACTIVE",
        },
        {
            label: "Draft",
            value: "DRAFT",
        },
    ];

    /* =====================================================
       LOADING SCREEN
    ===================================================== */

    if (isEdit && loading && !formData.taxName) {
        return (
            <div className="
                flex h-full items-center justify-center
                bg-gray-50
            ">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading tax master details...
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
                            {isEdit
                                ? "Edit Tax Master"
                                : "Create Tax Master"}
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEdit
                                ? "Update your tax information"
                                : "Add a new tax configuration to your organization"}
                        </p>
                    </div>

                </div>

                <div className="
                    hidden items-center gap-2 rounded-lg
                    bg-blue-50 px-3 py-2 sm:flex
                ">
                    <Receipt size={16} className="text-[#408DFB]" />

                    <span className="text-xs font-medium text-[#408DFB]">
                        Tax Master
                    </span>
                </div>

            </div>

            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="
                    flex min-h-0 flex-1 flex-col
                    overflow-hidden rounded-xl bg-white shadow-sm
                "
            >

                <div className="flex-1 overflow-y-auto p-5">

                    {/* TAX DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Receipt}
                            title="Tax Details"
                            description="Enter the basic tax master information"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField
                                label="Tax Name"
                                required
                            >
                                <TextInput
                                    value={formData.taxName}
                                    onChange={(e) =>
                                        handleChange(
                                            "taxName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter tax name"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField
                                label="Tax Type"
                                required
                            >
                                <CustomSelect
                                    value={formData.taxType}
                                    onChange={handleTaxTypeChange}
                                    options={taxTypeOptions}
                                    placeholder="Select tax type"
                                />
                            </FormField>

                            <FormField
                                label="Status"
                                required
                            >
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

                    {/* TAX RATE DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Percent}
                            title="Tax Rate Details"
                            description="Configure the applicable tax percentage"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField
                                label="Total Tax Rate (%)"
                                required
                            >
                                <TextInput
                                    type="number"
                                    value={formData.taxRate}
                                    onChange={(e) =>
                                        handleTaxRateChange(e.target.value)
                                    }
                                    placeholder="Enter tax rate"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                />
                            </FormField>

                            {formData.taxType === "CGST_SGST" && (
                                <>
                                    <FormField label="CGST Rate (%)">
                                        <TextInput
                                            type="number"
                                            value={formData.cgstRate}
                                            readOnly
                                            placeholder="CGST rate"
                                        />
                                    </FormField>

                                    <FormField label="SGST Rate (%)">
                                        <TextInput
                                            type="number"
                                            value={formData.sgstRate}
                                            readOnly
                                            placeholder="SGST rate"
                                        />
                                    </FormField>
                                </>
                            )}

                            {formData.taxType === "IGST" && (
                                <FormField label="IGST Rate (%)">
                                    <TextInput
                                        type="number"
                                        value={formData.igstRate}
                                        readOnly
                                        placeholder="IGST rate"
                                    />
                                </FormField>
                            )}

                        </div>

                        <p className="mt-3 text-xs text-gray-400">
                            {formData.taxType === "CGST_SGST"
                                ? "The total tax rate is automatically divided equally between CGST and SGST."
                                : "The total tax rate is applied as IGST."}
                        </p>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* DESCRIPTION */}

                    <section>

                        <SectionHeading
                            icon={FileText}
                            title="Additional Information"
                            description="Add an optional description for this tax"
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
                                    placeholder="Enter tax description"
                                    rows={4}
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
                            disabled={loading}
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
                            disabled={loading}
                            onClick={() => setSaveMode("close")}
                            className="
                                flex items-center gap-2 rounded-lg
                                bg-[#408DFB] px-5 py-2 text-sm
                                font-medium text-white transition
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

                        {!isEdit && (
                            <div className="relative">

                                <button
                                    type="button"
                                    disabled={loading}
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

            {/* LEAVE CONFIRMATION */}

            <LeaveConfirmationModal
                show={showLeaveConfirmation}
                title="Leave Tax Master?"
                message="Are you sure you want to leave this tax master page?"
                stayText="Stay Here"
                leaveText="Leave"
                onStay={handleStay}
                onLeave={handleLeave}
            />

        </div>
    );
};

export default TaxCreateSimple;
