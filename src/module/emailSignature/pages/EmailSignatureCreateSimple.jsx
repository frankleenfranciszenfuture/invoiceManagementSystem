
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
    Building2,
    UserRoundArrowLeft,
    X,
    Mail,
    ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

import {
    resetEmailSignatureForm,
    setEmailSignatureField,
} from "../slices/emailSignatureSlice";

import {
    createEmailSignature,
    updateEmailSignature,
    fetchEmailSignaturesById,
} from "../thunks/emailSignatureThunks";

import { getUserPermission } from "../../menuPermission/thunks/menuPermissionThunks";
import CustomSelect from "../../../common/custom/CustomSelect";

const INITIAL_FORM = {
    id: null,
    userId: null,
    signatureName: "",
    signatureContent: "",
    defaultForNewMessages: false,
    defaultForReplies: false,
    status: "ACTIVE",
};

const TABS = [
    { id: "emailSignatures", label: "Email Signature Information" },
];

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "DRAFT", label: "Draft" },
];

const labelClass = "mb-1.5 block text-xs font-medium text-gray-500";
const getLabelClass = (required = false) => `
        block
        text-xs
        font-medium
        ${required ? "text-red-500" : "text-[#0F4659]"}
        mb-1.5
    `;

const errorClass = "mt-1 text-xs text-red-500";

const inputBaseClass =
    "h-10 w-full rounded-md border bg-white px-3 text-sm " +
    "text-[#0F4659] transition focus:outline-none focus:ring-2";

const textareaBaseClass =
    "w-full rounded-md border bg-white px-3 py-2 text-sm " +
    "text-[#0F4659] resize-y focus:outline-none focus:ring-2";

const inputClass = (hasError = false) =>
    `${inputBaseClass} ${hasError
        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
        : "border-gray-300 focus:border-[#0F4659] focus:ring-[#0F4659]/20"
    }`;

const textareaClass = (hasError = false) =>
    `${textareaBaseClass} ${hasError
        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
        : "border-gray-300 focus:border-[#0F4659] focus:ring-[#0F4659]/20"
    }`;

const normalizeModule = (value) =>
    String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

const normalizeAction = (value) =>
    String(value ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");

const isTrue = (value) => value === true || value === "true";

export default function EmailSignatureCreateSimple() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);

    // Redux form state: emailSignature is the form object,
    // while emailSignatures is the collection/list.
    const emailSignatureState = useSelector(
        (state) => state.emailSignatures || {}
    );

    const {
        emailSignature,
        loading = false,
    } = emailSignatureState;

    const form = emailSignature || INITIAL_FORM;

    const authState = useSelector((state) => state.auth || {});
    const { user } = authState;

    const permissionState = useSelector(
        (state) => state.menuPermission || {}
    );

    const isAuthenticated = authState.isAuthenticated !== false;

    const authChecking = Boolean(
        authState.authChecking ?? authState.loading
    );

    const [activeTab, setActiveTab] = useState("emailSignatures");
    const [showSaveMenu, setShowSaveMenu] = useState(false);
    const [editLoading, setEditLoading] = useState(isEdit);
    const [editLoadError, setEditLoadError] = useState(false);
    const [errors, setErrors] = useState({});

    // Permissions
    const userPermissions = Array.isArray(
        permissionState.userPermissions
    )
        ? permissionState.userPermissions
        : [];

    const permissionLoading = Boolean(
        permissionState.userPermissionsLoading ??
        permissionState.loading
    );

    const permissionsLoaded =
        permissionState.userPermissionsLoaded === true ||
        permissionState.permissionsLoaded === true ||
        permissionState.loaded === true ||
        (
            permissionState.userPermissions !== undefined &&
            permissionState.userPermissions !== null
        );

    const role = useMemo(
        () =>
            user?.roleName ||
            user?.role?.roleName ||
            user?.role?.name ||
            user?.role ||
            user?.authority ||
            "",
        [user]
    );

    const normalizedRole = normalizeAction(
        typeof role === "object"
            ? role?.name || role?.roleName
            : role
    );

    const hasFullAccess = ["ADMIN", "SUPER_ADMIN"].includes(
        normalizedRole
    );

    const hasPermission = (moduleName, actionName) => {
        if (hasFullAccess) return true;

        const requestedModule = normalizeModule(moduleName);
        const requestedAction = normalizeAction(actionName);

        return userPermissions.some((permission) => {
            const permissionModule = normalizeModule(
                permission?.moduleName ||
                permission?.module?.moduleName ||
                permission?.module?.name ||
                ""
            );

            if (permissionModule !== requestedModule) return false;

            if (
                permission?.active === false ||
                normalizeAction(permission?.status) === "INACTIVE"
            ) {
                return false;
            }

            const nestedActions = Array.isArray(permission?.actions)
                ? permission.actions
                : [];

            const matchingNestedAction = nestedActions.find((action) => {
                const actionNameValue =
                    typeof action === "string"
                        ? action
                        : action?.actionName ||
                        action?.action?.actionName ||
                        action?.action?.name ||
                        action?.name ||
                        "";

                return normalizeAction(actionNameValue) === requestedAction;
            });

            if (matchingNestedAction !== undefined) {
                if (typeof matchingNestedAction === "string") {
                    return true;
                }

                return (
                    matchingNestedAction?.active !== false &&
                    normalizeAction(matchingNestedAction?.status) !==
                    "INACTIVE" &&
                    (
                        isTrue(matchingNestedAction?.allowed) ||
                        isTrue(matchingNestedAction?.isAllowed)
                    )
                );
            }

            const directAction = normalizeAction(
                permission?.actionName ||
                permission?.action?.actionName ||
                permission?.action?.name ||
                ""
            );

            return (
                directAction === requestedAction &&
                (
                    isTrue(permission?.allowed) ||
                    isTrue(permission?.isAllowed)
                )
            );
        });
    };

    const hasCreatePermission = hasPermission(
        "Email Signatures",
        "CREATE"
    );

    const hasEditPermission = hasPermission(
        "Email Signatures",
        "EDIT"
    );

    const hasSavePermission = isEdit
        ? hasEditPermission
        : hasCreatePermission;

    // Load permissions when required.
    useEffect(() => {
        if (
            authChecking ||
            !isAuthenticated ||
            hasFullAccess ||
            permissionsLoaded ||
            permissionLoading
        ) {
            return;
        }

        dispatch(getUserPermission());
    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    // Load existing signature for editing.
    useEffect(() => {
        let cancelled = false;

        const loadEmailSignature = async () => {
            setEditLoadError(false);
            setErrors({});

            if (!isEdit) {
                dispatch(resetEmailSignatureForm());
                setEditLoading(false);
                return;
            }

            setEditLoading(true);
            dispatch(resetEmailSignatureForm());

            try {
                const response = await dispatch(
                    fetchEmailSignaturesById({
                        id: Number(id),
                        userId: user?.id,
                    })
                ).unwrap();

                if (cancelled) return;

                const result =
                    response?.data?.data ??
                    response?.data ??
                    response;

                if (
                    !result ||
                    typeof result !== "object" ||
                    Array.isArray(result) ||
                    result.id == null
                ) {
                    throw new Error(
                        "Email signature details were not found."
                    );
                }

                const loadedForm = {
                    id: result.id,
                    userId: result.userId ?? null,
                    signatureName: result.signatureName ?? "",
                    signatureContent: result.signatureContent ?? "",
                    defaultForNewMessages:
                        result.defaultForNewMessages ?? false,
                    defaultForReplies:
                        result.defaultForReplies ?? false,
                    status: result.status ?? "ACTIVE",
                };

                Object.entries(loadedForm).forEach(([field, value]) => {
                    dispatch(setEmailSignatureField({ field, value }));
                });
            } catch (error) {
                if (cancelled) return;

                console.error("Failed to load email signature:", error);
                setEditLoadError(true);

                toast.error(
                    typeof error === "string"
                        ? error
                        : error?.message ||
                        "Failed to load email signature."
                );
            } finally {
                if (!cancelled) setEditLoading(false);
            }
        };

        loadEmailSignature();

        return () => {
            cancelled = true;
        };
    }, [dispatch, id, isEdit, user?.id]);

    const handleChange = (field, value) => {
        dispatch(setEmailSignatureField({ field, value }));

        setErrors((previous) => {
            if (!previous[field]) return previous;

            const updated = { ...previous };
            delete updated[field];
            return updated;
        });
    };

    const handleClose = () => {
        if (loading || editLoading) return;

        setShowSaveMenu(false);
        setErrors({});
        dispatch(resetEmailSignatureForm());
        navigate("/settings/emailsignatures");
    };

    // Escape closes the form.
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") handleClose();
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [loading, editLoading, dispatch, navigate]);

    const validateForm = () => {
        const nextErrors = {};

        if (!form.signatureName?.trim()) {
            nextErrors.signatureName = "Signature name is required.";
        }

        if (!form.signatureContent?.trim()) {
            nextErrors.signatureContent =
                "Signature content is required.";
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            setActiveTab("emailSignatures");
            toast.error(Object.values(nextErrors)[0]);
            return false;
        }

        return true;
    };

    const handleSave = async ({
        saveAndNew = false,
    } = {}) => {
        if (!isAuthenticated) {
            toast.error("You are not authenticated.");
            return;
        }

        if (loading || editLoading) return;

        if (isEdit && editLoadError) {
            toast.error(
                "Cannot update because email signature details failed to load."
            );
            return;
        }

        if (
            !hasFullAccess &&
            (permissionLoading || !permissionsLoaded)
        ) {
            toast.error(
                "Permissions are still loading. Please try again."
            );
            return;
        }

        if (!hasSavePermission) {
            toast.error(
                isEdit
                    ? "You do not have permission to edit email signatures."
                    : "You do not have permission to create email signatures."
            );
            return;
        }

        if (!validateForm()) return;

        const payload = {
            userId: user?.id ?? form.userId ?? null,
            signatureName: form.signatureName.trim(),
            signatureContent: form.signatureContent.trim(),
            defaultForNewMessages: Boolean(
                form.defaultForNewMessages
            ),
            defaultForReplies: Boolean(form.defaultForReplies),
            status: form.status || "ACTIVE",
        };

        try {
            if (isEdit) {
                await dispatch(
                    updateEmailSignature({
                        userId: payload.userId,
                        id: Number(id),
                        data: payload,
                    })
                ).unwrap();

                toast.success("Email signature updated successfully.");
            } else {
                await dispatch(
                    createEmailSignature({
                        userId: payload.userId,
                        data: payload,
                    })
                ).unwrap();

                toast.success("Email signature created successfully.");
            }

            setErrors({});
            setShowSaveMenu(false);
            dispatch(resetEmailSignatureForm());

            if (saveAndNew && !isEdit) {
                // Stay on the create page with an empty form.
                setActiveTab("emailSignatures");
                setEditLoadError(false);
                return;
            }

            navigate("/settings/emailSignatures");
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to save email signature."
            );
        }
    };

    const renderInput = ({
        field,
        label,
        placeholder = "",
        type = "text",
        required = false,
        maxLength,
    }) => (
        <div>
            <label className={getLabelClass(true)}>
                {label}
                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <input
                type={type}
                value={form[field] ?? ""}
                maxLength={maxLength}
                placeholder={placeholder}
                onChange={(event) =>
                    handleChange(field, event.target.value)
                }
                className={inputClass(Boolean(errors[field]))}
            />

            {errors[field] && (
                <p className={errorClass}>{errors[field]}</p>
            )}
        </div>
    );

    const renderSelect = ({
        field,
        label,
        options,
        required = false,
    }) => (
        <div>
            <label className={labelClass}>
                {label}
                {required && (
                    <span className="ml-1 text-red-500"></span>
                )}
            </label>

            <CustomSelect
                value={form[field] ?? ""}
                onChange={(value) => handleChange(field, value)}
                options={options}
            />

            {errors[field] && (
                <p className={errorClass}>{errors[field]}</p>
            )}
        </div>
    );

    const renderEmailSignaturesTab = () => (
        <div className="w-full max-w-7xl">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-gray-500">
                        Email Signature Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                        Create and configure your email signature.
                    </p>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="space-y-5">
                        {renderInput({
                            field: "signatureName",
                            label: "Signature Name",
                            placeholder: "Enter signature name",
                            required: true,
                            maxLength: 150,
                        })}

                        <div>
                            <label className={getLabelClass(true)}>
                                Signature Content
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <textarea
                                value={form.signatureContent ?? ""}
                                onChange={(event) =>
                                    handleChange(
                                        "signatureContent",
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your email signature HTML or text"
                                rows={8}
                                className={textareaClass(
                                    Boolean(errors.signatureContent)
                                )}
                            />

                            {errors.signatureContent && (
                                <p className={errorClass}>
                                    {errors.signatureContent}
                                </p>
                            )}

                            <p className="mt-1 text-xs text-gray-400">
                                Enter the signature content supported by
                                your email editor.
                            </p>
                        </div>

                        <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-500">
                                Default Preferences
                            </h3>

                            <label className="flex cursor-pointer items-center gap-2
                             text-sm text-gray-400">
                                <input
                                    type="checkbox"
                                    checked={Boolean(
                                        form.defaultForNewMessages
                                    )}
                                    onChange={(event) =>
                                        handleChange(
                                            "defaultForNewMessages",
                                            event.target.checked
                                        )
                                    }
                                    className="h-4 w-4 accent-[#0F4659]"
                                />
                                Use as default for new messages
                            </label>

                            <label className="flex cursor-pointer items-center gap-2 
                            text-sm text-gray-400">
                                <input
                                    type="checkbox"
                                    checked={Boolean(
                                        form.defaultForReplies
                                    )}
                                    onChange={(event) =>
                                        handleChange(
                                            "defaultForReplies",
                                            event.target.checked
                                        )
                                    }
                                    className="h-4 w-4 accent-[#0F4659]"
                                />
                                Use as default for replies and forwards
                            </label>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="mb-4 flex items-center gap-2">
                            <Mail
                                size={18}
                                className="text-gray-500"
                            />
                            <h3 className="text-sm font-semibold text-gray-500">
                                Signature Settings
                            </h3>
                        </div>

                        {renderSelect({
                            field: "status",
                            label: "Status",
                            options: STATUS_OPTIONS,
                            required: true,
                        })}

                        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
                            <p className="text-xs leading-5 text-gray-500">
                                Active signatures are available for use.
                                Inactive signatures are retained but should
                                not be selected as defaults.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Authentication checks
    if (authChecking) {
        return (
            <div className="flex min-h-40 items-center justify-center">
                <p className="text-sm text-gray-500">
                    Checking authentication...
                </p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-64 items-center justify-center px-6">
                <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                    <UserRoundArrowLeft
                        className="mx-auto mb-4 text-red-500"
                        size={42}
                    />
                    <h2 className="text-lg font-semibold text-gray-800">
                        Authentication Required
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Please sign in to manage email signatures.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/email-signatures")}
                        className="mt-6 rounded-md bg-[#0F4659] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0F4659]/90"
                    >
                        Back to Email Signatures
                    </button>
                </div>
            </div>
        );
    }

    if (
        !hasFullAccess &&
        (permissionLoading || !permissionsLoaded)
    ) {
        return (
            <div className="flex min-h-40 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[#0F4659]/20 border-t-[#0F4659]" />
                    <p className="text-sm font-medium text-gray-600">
                        Loading permissions...
                    </p>
                </div>
            </div>
        );
    }

    if (!hasSavePermission) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-full max-w-md text-center">
                    <UserRoundArrowLeft
                        size={28}
                        className="mx-auto mb-3 text-red-500"
                    />
                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {isEdit
                            ? "You do not have permission to edit email signatures."
                            : "You do not have permission to create email signatures."}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/email-signatures")}
                        className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm text-[#0F4659] hover:bg-gray-50"
                    >
                        Back to Email Signatures
                    </button>
                </div>
            </div>
        );
    }

    if (editLoading) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center bg-gray-50">
                <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[#0F4659]/20 border-t-[#0F4659]" />
                <p className="text-sm font-medium text-[#0F4659]">
                    Loading email signature details...
                </p>
            </div>
        );
    }

    if (isEdit && editLoadError) {
        return (
            <div className="flex min-h-64 items-center justify-center px-4">
                <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center">
                    <Building2
                        size={32}
                        className="mx-auto mb-3 text-red-500"
                    />
                    <h2 className="text-lg font-semibold text-[#0F4659]">
                        Unable to Load Email Signature
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Email signature details could not be loaded.
                        Return to the list and try again.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/email-signatures")}
                        className="mt-5 h-10 rounded-md bg-[#0F4659] px-5 text-sm font-medium text-white hover:bg-[#0F4659]/90"
                    >
                        Back to Email Signatures
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col bg-gray-50 px-3.5 py-5">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between 
            border border-lime-500 rounded bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 cursor-pointer items-center
                         justify-center rounded-lg border border-blue-100 bg-[#408DFB]"
                        onClick={() => navigate("/settings/emailSignatures")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                navigate("/settings/emailSignatures");
                            }
                        }}
                    >
                        <Mail size={20} className="text-gray-100" />
                    </div>

                    <div>
                        <h1 className="text-lg font-semibold text-gray-500">
                            {isEdit
                                ? "Edit Email Signature"
                                : "New Email Signature"}
                        </h1>
                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEdit
                                ? `Update email signature${form.signatureName ? ` — ${form.signatureName}` : ""}`
                                : "Create a new email signature"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={loading || editLoading}
                    onClick={handleClose}
                    className="px-2 py-1 text-gray-100 hover:text-gray-100 bg-red-500 hover:bg-red-600 
                    rounded  disabled:opacity-50"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 items-center gap-7 overflow-x-auto border-b border-gray-200 bg-white px-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`whitespace-nowrap border-b-2 py-3 text-sm font-medium transition ${activeTab === tab.id
                            ? "border-lime-500 text-gray-500"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Scrollable body */}
            <div className="min-h-0 flex-1 overflow-y-auto py-6">
                {activeTab === "emailSignatures" &&
                    renderEmailSignaturesTab()}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-6 py-3">
                <div className="text-xs text-gray-500">
                    <span className="text-red-500">*</span> Required fields
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        disabled={loading || editLoading}
                        onClick={handleClose}
                        className="h-10 rounded-md border border-gray-300 bg-white px-5 text-sm font-medium text-[#0F4659] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <div className="relative flex">
                        <button
                            type="button"
                            disabled={loading || editLoading}
                            onClick={() => handleSave()}
                            className="h-10 rounded-l-md bg-[#408DFB] px-5 text-sm font-medium text-white 
                            hover:bg-[#408DFB]/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? isEdit
                                    ? "Updating..."
                                    : "Saving..."
                                : isEdit
                                    ? "Update Signature"
                                    : "Save Signature"}
                        </button>

                        <button
                            type="button"
                            disabled={loading || editLoading}
                            onClick={() =>
                                setShowSaveMenu((previous) => !previous)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-r-md border-l border-white/30
                             bg-[#408DFB] text-white hover:bg-[#408DFB]/90 disabled:opacity-50"
                            aria-label="More save options"
                        >
                            <ChevronDown
                                size={16}
                                className={
                                    showSaveMenu
                                        ? "rotate-180 transition-transform"
                                        : "transition-transform"
                                }
                            />
                        </button>

                        {showSaveMenu && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Close save options"
                                    className="fixed inset-0 z-[80] cursor-default"
                                    onClick={() => setShowSaveMenu(false)}
                                />

                                <div className="absolute bottom-full right-0 z-[90] mb-2 w-56 overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl">
                                    {!isEdit && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSave({
                                                    saveAndNew: true,
                                                })
                                            }
                                            className="w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
                                        >
                                            <div className="text-sm font-medium text-gray-700">
                                                Save & New
                                            </div>
                                            <div className="mt-0.5 text-xs text-gray-400">
                                                Save and create another signature
                                            </div>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleSave()}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50"
                                    >
                                        <div className="text-sm font-medium text-gray-700">
                                            {isEdit
                                                ? "Update & Close"
                                                : "Save & Close"}
                                        </div>
                                        <div className="mt-0.5 text-xs text-gray-400">
                                            Save and return to the signature list
                                        </div>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
