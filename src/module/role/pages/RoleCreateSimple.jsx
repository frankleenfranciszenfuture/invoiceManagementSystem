
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ShieldCheck,
    FileText,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    Check,
} from "lucide-react";
import toast from "react-hot-toast";

import {
    createRole,
    fetchRoleById,
    updateRole,
    fetchAllRoles,
} from "../thunks/roleThunks";

import { resetRoleForm } from "../slices/roleSlice";

import CustomSelect from "../../../common/custom/CustomSelect";

import LeaveConfirmationModal from "../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../../../common/confirmation/useLeaveConfirmation";

import { closeModal } from "../../../module/ui/uiSlice";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
    roleName: "",
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

const RoleCreateSimple = ({ onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const isEdit = Boolean(id);

    const {
        loading = false,
        actionLoading = false,
    } = useSelector((state) => state.role ?? {});

    const [formData, setFormData] = useState(initialFormData);

    // ask = show success dialog after normal Save
    // new = save and reset
    // close = save and close
    const [saveMode, setSaveMode] = useState("ask");

    const [showSaveOptions, setShowSaveOptions] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [savedAction, setSavedAction] = useState("");

    const {
        showLeaveConfirmation,
        confirmLeave,
        handleStay: handleStayOnLeave,
        handleLeave: handleLeaveOnLeave,
    } = useLeaveConfirmation();

    /* =====================================================
       FETCH ROLE FOR EDIT
    ===================================================== */

    useEffect(() => {
        let isMounted = true;

        const loadRole = async () => {
            if (!isEdit) {
                setFormData(initialFormData);
                return;
            }

            try {
                const response = await dispatch(
                    fetchRoleById(id)
                ).unwrap();

                if (!isMounted) return;

                const role = response?.data ?? response;

                if (!role) {
                    toast.error("Role not found");
                    return;
                }

                setFormData({
                    roleName: role.roleName ?? "",
                    description: role.description ?? "",
                    status: role.status ?? "ACTIVE",
                });
            } catch (error) {
                if (isMounted) {
                    toast.error(
                        typeof error === "string"
                            ? error
                            : "Failed to fetch role details"
                    );
                }
            }
        };

        loadRole();

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
       CLOSE FORM
    ===================================================== */

    const closeForm = () => {
        if (onClose) {
            onClose();
        } else {
            dispatch(closeModal());
        }

        dispatch(resetRoleForm());
    };

    const handleClose = () => {
        confirmLeave(() => {
            if (onClose) {
                onClose();
            } else {
                navigate("/settings/roles")
            }
        });
    };

    const handleCancel = () => {
        if (onClose) {
            onClose();
        } else {
            navigate("/settings/roles")
        }

    };

    /* =====================================================
       SUCCESS DIALOG ACTIONS
    ===================================================== */

    const handleGoToMenuPermission = () => {
        setShowSuccessDialog(false);
        setSavedAction("");

        dispatch(resetRoleForm());

        if (onClose) {
            onClose();
        } else {
            dispatch(closeModal());
        }

        navigate("/settings/menuPermission");
    };

    const handleStayHere = () => {
        setShowSuccessDialog(false);
        setSavedAction("");

        if (isEdit) {
            // Keep the updated role details on the screen
            dispatch(fetchRoleById(id))
                .unwrap()
                .then((response) => {
                    const role = response?.data ?? response;

                    setFormData({
                        roleName: role?.roleName ?? "",
                        description: role?.description ?? "",
                        status: role?.status ?? "ACTIVE",
                    });
                })
                .catch(() => {
                    toast.error("Failed to refresh role details");
                });

            return;
        }

        // Create mode: prepare for another role
        setFormData(initialFormData);
        setSaveMode("ask");

        dispatch(resetRoleForm());

        navigate("/settings/roles")
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        if (!formData.roleName.trim()) {
            toast.error("Role name is required");
            return false;
        }

        if (formData.roleName.trim().length < 2) {
            toast.error("Role name must contain at least 2 characters");
            return false;
        }

        if (formData.roleName.trim().length > 100) {
            toast.error("Role name cannot exceed 100 characters");
            return false;
        }

        if (formData.description.trim().length > 500) {
            toast.error("Description cannot exceed 500 characters");
            return false;
        }

        if (!formData.status) {
            toast.error("Please select a role status");
            return false;
        }

        return true;
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {
        if (isEdit) {
            dispatch(fetchRoleById(id))
                .unwrap()
                .then((response) => {
                    const role = response?.data ?? response;

                    setFormData({
                        roleName: role?.roleName ?? "",
                        description: role?.description ?? "",
                        status: role?.status ?? "ACTIVE",
                    });
                })
                .catch(() => {
                    toast.error("Failed to reset role form");
                });

            return;
        }

        setFormData(initialFormData);
        setSaveMode("ask");
        dispatch(resetRoleForm());
    };

    /* =====================================================
       SAVE ROLE
    ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (actionLoading || loading) return;

        if (!validateForm()) return;

        const payload = {
            roleName: formData.roleName.trim(),
            description: formData.description.trim(),
            status: formData.status,
        };

        try {
            let response;

            /* ---------------- EDIT ROLE ---------------- */

            if (isEdit) {
                response = await dispatch(
                    updateRole({
                        id,
                        data: payload,
                    })
                ).unwrap();

                dispatch(fetchAllRoles());

                toast.success(
                    response?.message || "Role updated successfully"
                );

                setSavedAction("updated");
                setShowSuccessDialog(true);
                return;
            }

            /* ---------------- CREATE ROLE ---------------- */

            response = await dispatch(
                createRole(payload)
            ).unwrap();

            dispatch(fetchAllRoles());

            toast.success(
                response?.message || "Role created successfully"
            );

            /* Save & New */

            if (saveMode === "new") {
                setFormData(initialFormData);
                setSaveMode("ask");
                dispatch(resetRoleForm());
                return;
            }

            /* Save & Close */

            if (saveMode === "close") {
                closeForm();
                return;
            }

            /* Normal Save: Ask user what to do next */

            setSavedAction("created");
            setShowSuccessDialog(true);

        } catch (error) {
            console.error(
                isEdit ? "Role update error:" : "Role creation error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    (isEdit
                        ? "Failed to update role"
                        : "Failed to create role")
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
                    Loading role details...
                </div>
            </div>
        );
    }

    return (
        <>
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
                                {isEdit ? "Edit Role" : "Create Role"}
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-400">
                                {isEdit
                                    ? "Update your role information"
                                    : "Add a new role to your organization"}
                            </p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 sm:flex">
                        <ShieldCheck size={16} className="text-[#408DFB]" />

                        <span className="text-xs font-medium text-[#408DFB]">
                            Role
                        </span>
                    </div>
                </div>

                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm"
                >
                    <div className="flex-1 overflow-y-auto p-5">

                        {/* ROLE DETAILS */}

                        <section className="mb-7">
                            <SectionHeading
                                icon={ShieldCheck}
                                title="Role Details"
                                description="Enter the basic role information"
                            />

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2">

                                <FormField label="Role Name" required>
                                    <TextInput
                                        value={formData.roleName}
                                        onChange={(e) =>
                                            handleChange("roleName", e.target.value)
                                        }
                                        placeholder="Enter role name"
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

                        <section>
                            <SectionHeading
                                icon={FileText}
                                title="Role Description"
                                description="Describe the responsibilities and purpose of this role"
                            />

                            <div className="grid grid-cols-1 gap-5">
                                <FormField label="Description">
                                    <TextAreaField
                                        value={formData.description}
                                        onChange={(e) =>
                                            handleChange("description", e.target.value)
                                        }
                                        placeholder="Enter role description"
                                        rows={5}
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

                            {/* NORMAL SAVE */}

                            <button
                                type="submit"
                                disabled={actionLoading || loading}
                                onClick={() => setSaveMode("ask")}
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

                            {/* SAVE OPTIONS */}

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

            {/* SUCCESS DIALOG */}

            {showSuccessDialog && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="role-save-title"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                    >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                            <Check
                                className="text-emerald-600"
                                size={26}
                            />
                        </div>

                        <h2
                            id="role-save-title"
                            className="text-xl font-semibold text-gray-900"
                        >
                            Role{" "}
                            {savedAction === "updated" ? "Updated" : "Created"}{" "}
                            Successfully
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            What would you like to do next?
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            {/* <button
                                type="button"
                                onClick={handleStayHere}
                                className="
                                    rounded-lg border border-gray-300
                                    px-4 py-2.5 text-sm font-medium text-gray-700
                                    transition hover:bg-gray-50
                                "
                            >
                                Stay Here
                            </button> */}

                            <button
                                type="button"
                                onClick={handleCancel}
                                className="
                                    rounded-lg border border-gray-300
                                    px-4 py-2.5 text-sm font-medium text-gray-700
                                    transition hover:bg-gray-50
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleGoToMenuPermission}
                                className="
                                    rounded-lg bg-[#088178] px-4 py-2.5
                                    text-sm font-semibold text-white
                                    transition hover:bg-[#066b63]
                                "
                            >
                                Menu Permission
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LEAVE CONFIRMATION */}

            <LeaveConfirmationModal
                show={showLeaveConfirmation}
                title="Leave Role?"
                message="Are you sure you want to leave this role form?"
                stayText="Stay Here"
                leaveText="Leave"
                onStay={handleStayOnLeave}
                onLeave={handleLeaveOnLeave}
            />
        </>
    );
};

export default RoleCreateSimple;
