
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    MapPin,
    Phone,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";

import {
    createWarehouse,
    fetchWarehouseById,
    updateWarehouse,
} from "../thunks/warehouseThunks";

import { resetWarehouseForm } from "../slices/warehouseSlice";

import CustomSelect from "../../../../common/custom/CustomISelect";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
    warehouseName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
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

const WarehouseCreate = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    // ID exists = Edit mode
    const isEdit = Boolean(id);

    const {
        loading = false,
        actionLoading = false,
    } = useSelector((state) => state.warehouse ?? {});

    const [formData, setFormData] = useState(initialFormData);

    const [saveMode, setSaveMode] = useState("close");

    const [showSaveOptions, setShowSaveOptions] = useState(false);

    /* =====================================================
       FETCH WAREHOUSE FOR EDIT
    ===================================================== */

    useEffect(() => {
        let isMounted = true;

        const loadWarehouse = async () => {
            if (!isEdit) {
                setFormData(initialFormData);
                return;
            }

            try {
                const response = await dispatch(
                    fetchWarehouseById(id)
                ).unwrap();

                if (!isMounted) return;

                // Supports both wrapped and unwrapped API responses
                const warehouse = response?.data ?? response;

                if (!warehouse) {
                    toast.error("Warehouse not found");
                    return;
                }

                setFormData({
                    warehouseName: warehouse.warehouseName ?? "",
                    contactPerson: warehouse.contactPerson ?? "",
                    phone: warehouse.phone ?? "",
                    email: warehouse.email ?? "",
                    address: warehouse.address ?? "",
                    city: warehouse.city ?? "",
                    state: warehouse.state ?? "",
                    pincode: warehouse.pincode ?? "",
                    status: warehouse.status ?? "ACTIVE",
                });

            } catch (error) {
                if (isMounted) {
                    toast.error(
                        typeof error === "string"
                            ? error
                            : "Failed to fetch warehouse details"
                    );
                }
            }
        };

        loadWarehouse();

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
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        if (!formData.warehouseName.trim()) {
            toast.error("Warehouse name is required");
            return false;
        }

        if (!formData.phone.trim()) {
            toast.error("Phone number is required");
            return false;
        }

        if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
            toast.error("Enter a valid 10-digit phone number");
            return false;
        }

        if (
            formData.email.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
        ) {
            toast.error("Enter a valid email address");
            return false;
        }

        if (!formData.address.trim()) {
            toast.error("Address is required");
            return false;
        }

        if (!formData.city.trim()) {
            toast.error("City is required");
            return false;
        }

        if (!formData.state.trim()) {
            toast.error("State is required");
            return false;
        }

        if (!formData.pincode.trim()) {
            toast.error("Pincode is required");
            return false;
        }

        if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
            toast.error("Enter a valid 6-digit pincode");
            return false;
        }

        return true;
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {
        if (isEdit) {
            // Reload original warehouse values
            dispatch(fetchWarehouseById(id))
                .unwrap()
                .then((response) => {
                    const warehouse = response?.data ?? response;

                    setFormData({
                        warehouseName: warehouse?.warehouseName ?? "",
                        contactPerson: warehouse?.contactPerson ?? "",
                        phone: warehouse?.phone ?? "",
                        email: warehouse?.email ?? "",
                        address: warehouse?.address ?? "",
                        city: warehouse?.city ?? "",
                        state: warehouse?.state ?? "",
                        pincode: warehouse?.pincode ?? "",
                        status: warehouse?.status ?? "ACTIVE",
                    });
                })
                .catch(() => {
                    toast.error("Failed to reset warehouse form");
                });

            return;
        }

        setFormData(initialFormData);
        dispatch(resetWarehouseForm());
    };

    /* =====================================================
       SAVE WAREHOUSE
    ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (actionLoading || loading) return;

        if (!validateForm()) return;

        const payload = {
            warehouseName: formData.warehouseName.trim(),
            contactPerson: formData.contactPerson.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim(),
            status: formData.status,
        };

        try {
            let response;

            if (isEdit) {
                // UPDATE EXISTING WAREHOUSE
                response = await dispatch(
                    updateWarehouse({
                        id,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    response?.message || "Warehouse updated successfully"
                );

                navigate(-1);
                return;
            }

            // CREATE NEW WAREHOUSE
            response = await dispatch(
                createWarehouse(payload)
            ).unwrap();

            toast.success(
                response?.message || "Warehouse created successfully"
            );

            if (saveMode === "new") {
                setFormData(initialFormData);
                dispatch(resetWarehouseForm());
            } else {
                navigate(-1);
            }

        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : isEdit
                        ? "Failed to update warehouse"
                        : "Failed to create warehouse"
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
                    Loading warehouse details...
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
                        onClick={() => navigate(-1)}
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
                            {isEdit ? "Edit Warehouse" : "Create Warehouse"}
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEdit
                                ? "Update your warehouse information"
                                : "Add a new warehouse to your organization"}
                        </p>
                    </div>

                </div>

                <div className="hidden items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 sm:flex">
                    <Building2 size={16} className="text-[#408DFB]" />

                    <span className="text-xs font-medium text-[#408DFB]">
                        Warehouse
                    </span>
                </div>

            </div>

            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm"
            >

                <div className="flex-1 overflow-y-auto p-5">

                    {/* WAREHOUSE DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Building2}
                            title="Warehouse Details"
                            description="Enter the basic warehouse information"
                        />

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                            <FormField label="Warehouse Name" required>
                                <TextInput
                                    value={formData.warehouseName}
                                    onChange={(e) =>
                                        handleChange(
                                            "warehouseName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter warehouse name"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField label="Contact Person">
                                <TextInput
                                    value={formData.contactPerson}
                                    onChange={(e) =>
                                        handleChange(
                                            "contactPerson",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter contact person"
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

                    {/* CONTACT INFORMATION */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Phone}
                            title="Contact Information"
                            description="Enter warehouse contact details"
                        />

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            <FormField label="Phone Number" required>
                                <TextInput
                                    value={formData.phone}
                                    onChange={(e) =>
                                        handleChange(
                                            "phone",
                                            e.target.value.replace(/\D/g, "").slice(0, 10)
                                        )
                                    }
                                    placeholder="Enter 10-digit phone number"
                                    maxLength={10}
                                />
                            </FormField>

                            <FormField label="Email Address">
                                <TextInput
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        handleChange(
                                            "email",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter email address"
                                    maxLength={150}
                                />
                            </FormField>

                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* ADDRESS DETAILS */}

                    <section>

                        <SectionHeading
                            icon={MapPin}
                            title="Address Details"
                            description="Enter the warehouse location"
                        />

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                            <FormField
                                label="Address"
                                required
                                className="md:col-span-2 lg:col-span-3"
                            >
                                <TextAreaField
                                    value={formData.address}
                                    onChange={(e) =>
                                        handleChange(
                                            "address",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter complete address"
                                    rows={3}
                                />
                            </FormField>

                            <FormField label="City" required>
                                <TextInput
                                    value={formData.city}
                                    onChange={(e) =>
                                        handleChange("city", e.target.value)
                                    }
                                    placeholder="Enter city"
                                />
                            </FormField>

                            <FormField label="State" required>
                                <TextInput
                                    value={formData.state}
                                    onChange={(e) =>
                                        handleChange("state", e.target.value)
                                    }
                                    placeholder="Enter state"
                                />
                            </FormField>

                            <FormField label="Pincode" required>
                                <TextInput
                                    value={formData.pincode}
                                    onChange={(e) =>
                                        handleChange(
                                            "pincode",
                                            e.target.value.replace(/\D/g, "").slice(0, 6)
                                        )
                                    }
                                    placeholder="Enter 6-digit pincode"
                                    maxLength={6}
                                />
                            </FormField>

                        </div>

                    </section>

                </div>

                {/* FOOTER */}

                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-3">

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
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

        </div>
    );
};

export default WarehouseCreate;
