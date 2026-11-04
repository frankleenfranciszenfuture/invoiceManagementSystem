
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Mail,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    CheckCircle,
    PenLine,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createEmailSignature,
    fetchEmailSignaturesById,
    updateEmailSignature,
} from "../thunks/emailSignatureThunks";

import {
    resetEmailSignatureForm,
} from "../slices/emailSignatureSlice";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../common/custom/CustomSelect";
import LeaveConfirmationModal from "../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../../../common/confirmation/useLeaveConfirmation";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
    signatureName: "",
    signatureContent: "",
    defaultForNewMessages: false,
    defaultForReplies: false,
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
    <div className={`flex flex - col gap - 1.5 ${className} `}>
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
}) => (
    <input
        type={type}
        value={value ?? ""}
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

const TextAreaInput = ({
    value,
    onChange,
    placeholder,
    rows = 7,
    disabled = false,
}) => (
    <textarea
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="
            w-full resize-y rounded-lg border border-gray-200
            bg-white px-3 py-3 text-sm text-gray-700
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
   CHECKBOX FIELD
========================================================= */

const CheckboxField = ({
    checked,
    onChange,
    title,
    description,
}) => (
    <label className="
        flex cursor-pointer items-start gap-3
        rounded-lg border border-gray-100
        bg-gray-50 p-4
    ">
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="
                mt-0.5 h-4 w-4 rounded border-gray-300
                text-blue-600 focus:ring-blue-500
            "
        />

        <div>
            <p className="text-sm font-medium text-gray-700">
                {title}
            </p>

            <p className="mt-0.5 text-xs text-gray-400">
                {description}
            </p>
        </div>
    </label>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const EmailSignatureCreateSimple = ({ onClose }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const isEditMode = Boolean(id);

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const emailSignatureState = useSelector(
        (state) => state.emailSignatures ?? {}
    );

    const {
        emailSignature,
        loading = false,
    } = emailSignatureState;

    const {
        showLeaveConfirmation,
        confirmLeave,
        handleStay,
        handleLeave,
    } = useLeaveConfirmation();


    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    const userId = user?.id;

    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) => state.auth?.authChecking === true
    );

    /* =====================================================
       PERMISSION STATE
    ===================================================== */

    const permissions = useSelector(
        (state) => state.menuPermission?.userPermissions ?? []
    );

    const permissionLoading = useSelector(
        (state) => state.menuPermission?.loading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoaded === true
    );

    /* =====================================================
       LOCAL STATE
    ===================================================== */

    const [formData, setFormData] = useState({
        ...initialFormData,
    });

    const [saveMode, setSaveMode] = useState("close");

    const [showSaveOptions, setShowSaveOptions] = useState(false);

    /* =====================================================
       NORMALIZATION
    ===================================================== */

    const normalizeModule = (value) =>
        String(value ?? "").trim().toLowerCase();

    const normalizeAction = (value) =>
        String(value ?? "").trim().toUpperCase();

    /* =====================================================
       ROLE
    ===================================================== */

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole = normalizeAction(roleName);

    const isSuperAdmin = normalizedRole === "SUPER_ADMIN";
    const isAdmin = normalizedRole === "ADMIN";

    const hasFullAccess = isSuperAdmin || isAdmin;

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = (moduleName, actionName) => {

        if (hasFullAccess) {
            return true;
        }

        const requestedModule = normalizeModule(moduleName);
        const requestedAction = normalizeAction(actionName);

        if (!Array.isArray(permissions)) {
            return false;
        }

        return permissions.some((permission) => {

            const permissionModule = normalizeModule(
                permission?.moduleName ||
                permission?.module?.moduleName ||
                permission?.module?.name
            );

            if (permissionModule !== requestedModule) {
                return false;
            }

            if (
                permission?.active === false ||
                normalizeAction(permission?.status) === "INACTIVE"
            ) {
                return false;
            }

            if (Array.isArray(permission?.actions)) {

                const groupedPermission = permission.actions.some(
                    (action) => {

                        if (typeof action === "string") {
                            return (
                                normalizeAction(action) === requestedAction
                            );
                        }

                        const actionName = normalizeAction(
                            action?.actionName ||
                            action?.action?.actionName ||
                            action?.name
                        );

                        const allowed =
                            action?.allowed === true ||
                            action?.allowed === "true";

                        return (
                            actionName === requestedAction &&
                            allowed &&
                            action?.active !== false &&
                            normalizeAction(action?.status) !== "INACTIVE"
                        );
                    }
                );

                if (groupedPermission) {
                    return true;
                }
            }

            const permissionAction = normalizeAction(
                permission?.actionName ||
                permission?.action?.actionName ||
                permission?.action?.name
            );

            const allowed =
                permission?.allowed === true ||
                permission?.allowed === "true";

            return (
                permissionAction === requestedAction &&
                allowed
            );
        });
    };

    const requiredAction = isEditMode ? "EDIT" : "CREATE";

    const hasRequiredPermission = hasPermission(
        "Email Signatures",
        requiredAction
    );

    /* =====================================================
       LOAD PERMISSIONS
    ===================================================== */

    useEffect(() => {

        if (authChecking || !isAuthenticated || hasFullAccess) {
            return;
        }

        if (!permissionsLoaded && !permissionLoading) {
            dispatch(getUserPermission());
        }

    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    /* =====================================================
       FETCH EMAIL SIGNATURE FOR EDIT
    ===================================================== */

    useEffect(() => {

        if (!id || !isAuthenticated || !userId) {
            return;
        }

        dispatch(
            fetchEmailSignaturesById({
                id,
                userId,
            })
        );

    }, [
        dispatch,
        id,
        isAuthenticated,
        userId,
    ]);

    /* =====================================================
       CHECK CURRENT EMAIL SIGNATURE
    ===================================================== */

    const isCurrentEmailSignatureLoaded =
        isEditMode &&
        emailSignature?.id != null &&
        String(emailSignature.id) === String(id);

    /* =====================================================
       POPULATE EDIT FORM
    ===================================================== */

    useEffect(() => {

        if (!isCurrentEmailSignatureLoaded) {
            return;
        }

        setFormData({
            signatureName: emailSignature.signatureName ?? "",
            signatureContent: emailSignature.signatureContent ?? "",
            defaultForNewMessages:
                emailSignature.defaultForNewMessages ?? false,
            defaultForReplies:
                emailSignature.defaultForReplies ?? false,
            status: emailSignature.status ?? "ACTIVE",
        });

    }, [
        isCurrentEmailSignatureLoaded,
        emailSignature,
    ]);

    /* =====================================================
       STATUS OPTIONS
    ===================================================== */

    const statusOptions = useMemo(() => [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
    ], []);

    /* =====================================================
       HANDLE FIELD CHANGE
    ===================================================== */

    const handleChange = (field, value) => {

        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleClose = () => {
        confirmLeave(() => {
            if (onClose) {
                onClose();
            } else {
                navigate("/settings/emailSignatures")
            }
        });
    };
    /* =====================================================
       RESET FORM
    ===================================================== */

    const getEmailSignatureFormData = () => ({
        signatureName: emailSignature.signatureName ?? "",
        signatureContent: emailSignature.signatureContent ?? "",
        defaultForNewMessages:
            emailSignature.defaultForNewMessages ?? false,
        defaultForReplies:
            emailSignature.defaultForReplies ?? false,
        status: emailSignature.status ?? "ACTIVE",
    });

    const handleReset = () => {

        if (isEditMode) {

            if (!isCurrentEmailSignatureLoaded) {
                return;
            }

            setFormData(getEmailSignatureFormData());

        } else {

            setFormData({
                ...initialFormData,
            });
        }

        setSaveMode("close");
        setShowSaveOptions(false);

        dispatch(resetEmailSignatureForm());
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {

        if (!userId) {
            toast.error("User information is not available");
            return false;
        }

        if (!formData.signatureName.trim()) {
            toast.error("Signature name is required");
            return false;
        }

        if (formData.signatureName.trim().length > 100) {
            toast.error("Signature name cannot exceed 100 characters");
            return false;
        }

        if (!formData.signatureContent.trim()) {
            toast.error("Signature content is required");
            return false;
        }

        if (!formData.status) {
            toast.error("Signature status is required");
            return false;
        }

        return true;
    };

    /* =====================================================
       SAVE EMAIL SIGNATURE
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) {
            return;
        }

        if (isEditMode && !isCurrentEmailSignatureLoaded) {
            toast.error("Email signature details are still loading");
            return;
        }

        if (!isAuthenticated) {
            toast.error("You are not authenticated");
            return;
        }

        if (!hasFullAccess && !permissionsLoaded) {
            toast.error("Permissions are still loading");
            return;
        }

        if (!hasRequiredPermission) {
            toast.error(
                `You do not have permission to ${isEditMode ? "edit" : "create"} email signatures`
            );
            return;
        }

        if (!validateForm()) {
            return;
        }

        const payload = {
            signatureName: formData.signatureName.trim(),
            signatureContent: formData.signatureContent.trim(),
            defaultForNewMessages: Boolean(
                formData.defaultForNewMessages
            ),
            defaultForReplies: Boolean(
                formData.defaultForReplies
            ),
            status: formData.status,
        };

        try {

            const response = isEditMode
                ? await dispatch(
                    updateEmailSignature({
                        userId,
                        id,
                        data: payload,
                    })
                ).unwrap()
                : await dispatch(
                    createEmailSignature({
                        userId,
                        data: payload,
                    })
                ).unwrap();

            toast.success(
                response?.message ||
                `Email signature ${isEditMode ? "updated" : "created"} successfully`
            );

            if (!isEditMode && saveMode === "new") {

                setFormData({
                    ...initialFormData,
                });

                dispatch(resetEmailSignatureForm());

                setSaveMode("close");

                return;
            }

            dispatch(resetEmailSignatureForm());

            navigate("/settings/email-signatures");

        } catch (error) {

            console.error(
                `Email signature ${isEditMode ? "update" : "creation"} error: `,
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    `Failed to ${isEditMode ? "update" : "create"} email signature`
            );
        }
    };

    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    useEffect(() => {

        const handleEscape = (event) => {

            if (event.key === "Escape") {
                setShowSaveOptions(false);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };

    }, []);

    /* =====================================================
       LOADING
    ===================================================== */

    if (authChecking) {

        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Checking authentication...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (
        isEditMode &&
        (loading || !isCurrentEmailSignatureLoaded)
    ) {

        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading email signature...
                </div>
            </div>
        );
    }

    if (
        !hasFullAccess &&
        (permissionLoading || !permissionsLoaded)
    ) {

        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading permissions...
                </div>
            </div>
        );
    }

    /* =====================================================
       ACCESS DENIED
    ===================================================== */

    if (!hasRequiredPermission) {

        return (
            <div className="
                flex h-full items-center justify-center
                rounded-xl bg-white p-8
            ">
                <div className="text-center">

                    <div className="
                        mx-auto mb-3 flex h-12 w-12
                        items-center justify-center rounded-full
                        bg-red-50 text-lg font-semibold text-red-500
                    ">
                        !
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        You do not have permission to{" "}
                        {isEditMode ? "edit" : "create"} email signatures.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
                            mt-5 rounded-lg bg-blue-600
                            px-5 py-2 text-sm font-medium
                            text-white hover:bg-blue-700
                        "
                    >
                        Go Back
                    </button>

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
                            {isEditMode
                                ? "Edit Email Signature"
                                : "Create Email Signature"
                            }
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEditMode
                                ? "Update the existing email signature"
                                : "Create and configure your email signature"
                            }
                        </p>
                    </div>

                </div>

                <div className="
                    hidden items-center gap-2 rounded-lg
                    bg-blue-50 px-3 py-2 sm:flex
                ">
                    <Mail size={16} className="text-[#408DFB]" />

                    <span className="text-xs font-medium text-[#408DFB]">
                        Email Signature
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

                {/* SCROLL BODY */}

                <div className="flex-1 overflow-y-auto p-5">

                    {/* SIGNATURE INFORMATION */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Mail}
                            title="Signature Information"
                            description="Enter the signature name and content"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2
                        ">

                            <FormField
                                label="Signature Name"
                                required
                            >
                                <TextInput
                                    value={formData.signatureName}
                                    onChange={(e) =>
                                        handleChange(
                                            "signatureName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Example: Professional Signature"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField
                                label="Signature Status"
                                required
                            >
                                <CustomSelect
                                    value={formData.status}
                                    onChange={(value) =>
                                        handleChange("status", value)
                                    }
                                    options={statusOptions}
                                    placeholder="Select signature status"
                                />
                            </FormField>

                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* SIGNATURE CONTENT */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={PenLine}
                            title="Signature Content"
                            description="Enter the content that will appear at the bottom of your emails"
                        />

                        <FormField
                            label="Signature Content"
                            required
                        >
                            <TextAreaInput
                                value={formData.signatureContent}
                                onChange={(e) =>
                                    handleChange(
                                        "signatureContent",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your email signature content or HTML..."
                                rows={8}
                            />
                        </FormField>

                        <p className="mt-2 text-xs text-gray-400">
                            You can enter plain text or HTML markup, depending on the email editor used by your application.
                        </p>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* DEFAULT SETTINGS */}

                    <section>

                        <SectionHeading
                            icon={CheckCircle}
                            title="Default Signature Settings"
                            description="Choose where this signature should be used by default"
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                            <CheckboxField
                                checked={formData.defaultForNewMessages}
                                onChange={(e) =>
                                    handleChange(
                                        "defaultForNewMessages",
                                        e.target.checked
                                    )
                                }
                                title="Default for New Messages"
                                description="Automatically use this signature when composing a new email."
                            />

                            <CheckboxField
                                checked={formData.defaultForReplies}
                                onChange={(e) =>
                                    handleChange(
                                        "defaultForReplies",
                                        e.target.checked
                                    )
                                }
                                title="Default for Replies"
                                description="Automatically use this signature when replying to an email."
                            />

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
                            disabled={
                                loading ||
                                (isEditMode && !isCurrentEmailSignatureLoaded)
                            }
                            onClick={() => setSaveMode("close")}
                            className="
                                flex items-center gap-2 rounded-lg
                                bg-[#408DFB] px-5 py-2 text-sm
                                font-medium text-white transition
                                hover:bg-blue-600 disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >

                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}

                            {loading
                                ? "Saving..."
                                : isEditMode
                                    ? "Update"
                                    : "Save"
                            }

                        </button>

                        {/* SAVE OPTIONS - CREATE ONLY */}

                        {!isEditMode && (
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
                                                w-full px-4 py-2.5 text-left
                                                text-sm text-gray-600
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
                                                w-full px-4 py-2.5 text-left
                                                text-sm text-gray-600
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
                title="Leave EmailSignature?"
                message="Are you sure you want to leave this emailSignature page?"
                stayText="Stay Here"
                leaveText="Leave"
                onStay={handleStay}
                onLeave={handleLeave}
            />
        </div>
    );
};

export default EmailSignatureCreateSimple;
