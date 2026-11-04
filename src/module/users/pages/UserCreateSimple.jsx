
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Users,
    FileText,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    Check,
    Mail,
    Lock,
    ShieldCheck,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createUser,
    fetchUserById,
    updateUser,
    fetchAllUsers
} from "../thunks/userThunks";

import {
    fetchAllRoles,
} from "../../role/thunks/roleThunks";

import {
    resetUserForm,
} from "../slices/userSlice";

import CustomSelect from "../../../common/custom/CustomSelect";

import LeaveConfirmationModal from "../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../../../common/confirmation/useLeaveConfirmation";

import { closeModal } from "../../../module/ui/uiSlice";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
    name: "",
    email: "",
    password: "",
    roleId: "",
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
    autoComplete,
}) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete={autoComplete}
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
   RESPONSE HELPERS
========================================================= */

const getResponseData = (response) => {
    return response?.data ?? response;
};

const getRoleList = (response) => {
    const data = getResponseData(response);

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.content)) {
        return data.content;
    }

    if (Array.isArray(data?.roles)) {
        return data.roles;
    }

    return [];
};

const getUserRoleId = (user, roles) => {

    if (user?.roleId) {
        return user.roleId;
    }

    if (user?.role?.id) {
        return user.role.id;
    }

    const roleName =
        typeof user?.role === "string"
            ? user.role
            : user?.roleName ||
            user?.role?.roleName ||
            user?.role?.name ||
            "";

    if (roleName) {
        const matchedRole = roles.find((role) =>
            String(role?.roleName || role?.name || "")
                .trim()
                .toUpperCase() ===
            String(roleName).trim().toUpperCase()
        );

        return matchedRole?.id ?? "";
    }

    return "";
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const UserCreateSimple = ({ onClose }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const isEdit = Boolean(id);

    const {
        loading = false,
        actionLoading = false,
    } = useSelector((state) => state.user ?? {});

    const [formData, setFormData] = useState(initialFormData);

    const [roles, setRoles] = useState([]);

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
       FETCH ROLES AND USER DETAILS
    ===================================================== */

    useEffect(() => {

        let isMounted = true;

        const loadFormData = async () => {

            try {

                /* LOAD AVAILABLE ROLES */

                const rolesResponse = await dispatch(
                    fetchAllRoles()
                ).unwrap();

                if (!isMounted) return;

                const availableRoles = getRoleList(rolesResponse);

                setRoles(availableRoles);

                /* CREATE MODE */

                if (!isEdit) {
                    setFormData(initialFormData);
                    return;
                }

                /* EDIT MODE */

                const userResponse = await dispatch(
                    fetchUserById(id)
                ).unwrap();

                if (!isMounted) return;

                const selectedUser = getResponseData(userResponse);

                if (!selectedUser) {
                    toast.error("User not found");
                    return;
                }

                setFormData({
                    name: selectedUser.name ?? "",
                    email: selectedUser.email ?? "",
                    password: "",
                    roleId: getUserRoleId(
                        selectedUser,
                        availableRoles
                    ),
                });

            } catch (error) {

                if (!isMounted) return;

                console.error("User form loading error:", error);

                toast.error(
                    typeof error === "string"
                        ? error
                        : "Failed to load user details"
                );
            }
        };

        loadFormData();

        return () => {
            isMounted = false;
        };

    }, [dispatch, id, isEdit]);

    /* =====================================================
       ROLE OPTIONS
    ===================================================== */

    const roleOptions = roles.map((role) => ({
        label:
            role?.roleName ||
            role?.name ||
            "Unnamed Role",
        value: String(role.id),
    }));

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

        dispatch(resetUserForm());
    };

    const handleClose = () => {

        confirmLeave(() => {

            if (onClose) {
                onClose();
            } else {
                navigate("/settings/users");
            }

            dispatch(resetUserForm());
        });
    };

    const handleCancel = () => {

        setShowSuccessDialog(false);
        setSavedAction("");

        if (onClose) {
            onClose();
        } else {
            navigate("/settings/users");
        }

        dispatch(resetUserForm());
    };

    /* =====================================================
       SUCCESS DIALOG ACTIONS
    ===================================================== */

    const handleGoToMenuPermission = () => {

        setShowSuccessDialog(false);
        setSavedAction("");

        dispatch(resetUserForm());

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

            dispatch(fetchUserById(id))
                .unwrap()
                .then((response) => {

                    const selectedUser = getResponseData(response);

                    setFormData({
                        name: selectedUser?.name ?? "",
                        email: selectedUser?.email ?? "",
                        password: "",
                        roleId: getUserRoleId(
                            selectedUser,
                            roles
                        ),
                    });

                })
                .catch(() => {
                    toast.error("Failed to refresh user details");
                });

            return;
        }

        setFormData(initialFormData);
        setSaveMode("ask");

        dispatch(resetUserForm());

        navigate("/settings/users");
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {

        const name = formData.name.trim();
        const email = formData.email.trim();
        const password = formData.password;

        if (!name) {
            toast.error("User name is required");
            return false;
        }

        if (name.length < 2) {
            toast.error("User name must contain at least 2 characters");
            return false;
        }

        if (name.length > 100) {
            toast.error("User name cannot exceed 100 characters");
            return false;
        }

        if (!email) {
            toast.error("Email address is required");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return false;
        }

        if (email.length > 150) {
            toast.error("Email address cannot exceed 150 characters");
            return false;
        }

        if (!isEdit && !password.trim()) {
            toast.error("Password is required");
            return false;
        }

        if (password && password.length < 5) {
            toast.error("Password must contain at least 5 characters");
            return false;
        }

        if (!formData.roleId) {
            toast.error("Please select a user role");
            return false;
        }

        return true;
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {

        if (isEdit) {

            dispatch(fetchUserById(id))
                .unwrap()
                .then((response) => {

                    const selectedUser = getResponseData(response);

                    setFormData({
                        name: selectedUser?.name ?? "",
                        email: selectedUser?.email ?? "",
                        password: "",
                        roleId: getUserRoleId(
                            selectedUser,
                            roles
                        ),
                    });

                })
                .catch(() => {
                    toast.error("Failed to reset user form");
                });

            return;
        }

        setFormData(initialFormData);
        setSaveMode("ask");

        dispatch(resetUserForm());
    };

    /* =====================================================
       SAVE USER
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (actionLoading || loading) return;

        if (!validateForm()) return;

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            roleId: Number(formData.roleId),
        };

        /*
         * Password:
         * Required for create.
         * Only sent during edit when a new password is entered.
         */

        if (formData.password.trim()) {
            payload.password = formData.password;
        }

        try {

            let response;

            /* ---------------- EDIT USER ---------------- */

            if (isEdit) {

                response = await dispatch(
                    updateUser({
                        id,
                        data: payload,
                    })
                ).unwrap();

                dispatch(fetchAllUsers());

                toast.success(
                    response?.message || "User updated successfully"
                );

                setSavedAction("updated");
                setShowSuccessDialog(true);

                return;
            }

            /* ---------------- CREATE USER ---------------- */

            response = await dispatch(
                createUser(payload)
            ).unwrap();

            dispatch(fetchAllUsers());

            toast.success(
                response?.message || "User created successfully"
            );

            /* SAVE & NEW */

            if (saveMode === "new") {

                setFormData(initialFormData);
                setSaveMode("ask");

                dispatch(resetUserForm());

                return;
            }

            /* SAVE & CLOSE */

            if (saveMode === "close") {
                closeForm();
                return;
            }

            /* NORMAL SAVE */

            setSavedAction("created");
            setShowSuccessDialog(true);

        } catch (error) {

            console.error(
                isEdit
                    ? "User update error:"
                    : "User creation error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    (isEdit
                        ? "Failed to update user"
                        : "Failed to create user")
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
       RENDER LOADING
    ===================================================== */

    if (isEdit && loading && !formData.email) {

        return (
            <div className="
                flex h-full items-center justify-center
                bg-gray-50
            ">
                <div className="
                    flex items-center gap-2
                    text-sm text-gray-500
                ">
                    <Loader2 size={20} className="animate-spin" />
                    Loading user details...
                </div>
            </div>
        );
    }

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <>
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
                                {isEdit ? "Edit User" : "Create User"}
                            </h2>

                            <p className="mt-0.5 text-xs text-gray-400">
                                {isEdit
                                    ? "Update your user information"
                                    : "Add a new user to your organization"}
                            </p>
                        </div>
                    </div>

                    <div className="
                        hidden items-center gap-2
                        rounded-lg bg-blue-50 px-3 py-2 sm:flex
                    ">
                        <Users size={16} className="text-[#408DFB]" />

                        <span className="text-xs font-medium text-[#408DFB]">
                            User
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

                        {/* USER DETAILS */}

                        <section className="mb-7">

                            <SectionHeading
                                icon={Users}
                                title="User Details"
                                description="Enter the basic user information"
                            />

                            <div className="
                                grid grid-cols-1 gap-5
                                md:grid-cols-2 lg:grid-cols-2
                            ">

                                <FormField
                                    label="Full Name"
                                    required
                                >
                                    <TextInput
                                        value={formData.name}
                                        onChange={(e) =>
                                            handleChange(
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter full name"
                                        maxLength={100}
                                        autoComplete="name"
                                    />
                                </FormField>

                                <FormField
                                    label="Email Address"
                                    required
                                >
                                    <div className="relative">
                                        <Mail
                                            size={16}
                                            className="
                                                absolute left-3 top-1/2
                                                -translate-y-1/2
                                                text-gray-400
                                            "
                                        />

                                        <input
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
                                            autoComplete="email"
                                            className="
                                                h-10 w-full rounded-lg
                                                border border-gray-200
                                                bg-white pl-9 pr-3
                                                text-sm text-gray-700
                                                outline-none transition
                                                placeholder:text-gray-400
                                                focus:border-[#408DFB]
                                                focus:ring-2
                                                focus:ring-[#408DFB]/10
                                            "
                                        />
                                    </div>
                                </FormField>

                                <FormField
                                    label={isEdit
                                        ? "New Password"
                                        : "Password"
                                    }
                                    required={!isEdit}
                                >
                                    <div className="relative">
                                        <Lock
                                            size={16}
                                            className="
                                                absolute left-3 top-1/2
                                                -translate-y-1/2
                                                text-gray-400
                                            "
                                        />

                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) =>
                                                handleChange(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                            placeholder={
                                                isEdit
                                                    ? "Leave blank to keep current password"
                                                    : "Enter password"
                                            }
                                            autoComplete="new-password"
                                            className="
                                                h-10 w-full rounded-lg
                                                border border-gray-200
                                                bg-white pl-9 pr-3
                                                text-sm text-gray-700
                                                outline-none transition
                                                placeholder:text-gray-400
                                                focus:border-[#408DFB]
                                                focus:ring-2
                                                focus:ring-[#408DFB]/10
                                            "
                                        />
                                    </div>

                                    {isEdit && (
                                        <p className="text-[11px] text-gray-400">
                                            Leave blank if you do not want to change the password.
                                        </p>
                                    )}
                                </FormField>

                                <FormField
                                    label="User Role"
                                    required
                                >
                                    <CustomSelect
                                        value={
                                            formData.roleId
                                                ? String(formData.roleId)
                                                : ""
                                        }
                                        onChange={(value) =>
                                            handleChange(
                                                "roleId",
                                                value
                                            )
                                        }
                                        options={roleOptions}
                                        placeholder="Select user role"
                                    />
                                </FormField>

                            </div>
                        </section>

                        <div className="my-6 border-t border-gray-100" />

                        {/* ROLE INFORMATION */}

                        <section>

                            <SectionHeading
                                icon={ShieldCheck}
                                title="Access Information"
                                description="Assign a role to control this user's module access"
                            />

                            <div className="
                                rounded-lg border border-blue-100
                                bg-blue-50/50 p-4
                            ">
                                <div className="flex items-start gap-3">

                                    <ShieldCheck
                                        size={19}
                                        className="mt-0.5 shrink-0 text-[#408DFB]"
                                    />

                                    <div>
                                        <p className="
                                            text-sm font-medium text-gray-700
                                        ">
                                            Role-based permissions
                                        </p>

                                        <p className="
                                            mt-1 text-xs leading-5
                                            text-gray-500
                                        ">
                                            The selected role determines
                                            which modules and actions this
                                            user can access. You can manage
                                            the permissions from the Menu
                                            Permission settings.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </section>

                    </div>

                    {/* FOOTER */}

                    <div className="
                        flex shrink-0 flex-wrap
                        items-center justify-between gap-3
                        border-t border-gray-100
                        bg-white px-5 py-3
                    ">

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={actionLoading}
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
                                disabled={actionLoading || loading}
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

                            {/* NORMAL SAVE */}

                            <button
                                type="submit"
                                disabled={actionLoading || loading}
                                onClick={() => setSaveMode("ask")}
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
                                {actionLoading ? (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
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
                                            setShowSaveOptions(
                                                (prev) => !prev
                                            )
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
            </div>

            {/* SUCCESS DIALOG */}

            {showSuccessDialog && (
                <div className="
                    fixed inset-0 z-[99999]
                    flex items-center justify-center
                    bg-black/40 p-4
                ">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="user-save-title"
                        className="
                            w-full max-w-md rounded-2xl
                            bg-white p-6 shadow-2xl
                        "
                    >

                        <div className="
                            mb-4 flex h-12 w-12
                            items-center justify-center
                            rounded-full bg-emerald-50
                        ">
                            <Check
                                className="text-emerald-600"
                                size={26}
                            />
                        </div>

                        <h2
                            id="user-save-title"
                            className="
                                text-xl font-semibold text-gray-900
                            "
                        >
                            User{" "}
                            {savedAction === "updated"
                                ? "Updated"
                                : "Created"}{" "}
                            Successfully
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            What would you like to do next?
                        </p>

                        <div className="
                            mt-6 flex flex-col gap-3
                            sm:flex-row sm:justify-end
                        ">

                            <button
                                type="button"
                                onClick={handleCancel}
                                className="
                                    rounded-lg border border-gray-300
                                    px-4 py-2.5 text-sm font-medium
                                    text-gray-700 transition
                                    hover:bg-gray-50
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleGoToMenuPermission}
                                className="
                                    rounded-lg bg-[#088178]
                                    px-4 py-2.5 text-sm
                                    font-semibold text-white
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
                title="Leave User?"
                message="Are you sure you want to leave this user form?"
                stayText="Stay Here"
                leaveText="Leave"
                onStay={handleStayOnLeave}
                onLeave={handleLeaveOnLeave}
            />
        </>
    );
};

export default UserCreateSimple;
