import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
    UserKeyIcon,
    Check,
    X,
    Loader2,
} from "lucide-react";

import { closeModal } from "../../ui/uiSlice";

import {
    resetEmailSignatureForm,
    setEmailSignatureField,
} from "../slices/emailSignatureSlice";

import {
    createEmailSignature,
    updateEmailSignature,
} from "../thunks/emailSignatureThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../common/custom/CustomSelect";

export default function EmailSignatureCreate() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // =========================================================
    // MODAL
    // =========================================================

    const { modal } = useSelector(
        (state) => state.ui
    );

    // =========================================================
    // EMAIL SIGNATURE REDUX STATE
    // =========================================================

    const {
        emailSignature,
        loading,
    } = useSelector(
        (state) => state.emailSignatures
    );

    // =========================================================
    // AUTH / PERMISSIONS
    // =========================================================

    const user = useSelector(
        (state) => state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) =>
            state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) =>
            state.auth?.authChecking === true
    );

    const permissions = useSelector(
        (state) =>
            Array.isArray(
                state.menuPermission?.userPermissions
            )
                ? state.menuPermission.userPermissions
                : []
    );

    const permissionLoading = useSelector(
        (state) =>
            state.menuPermission
                ?.userPermissionsLoading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission
                ?.userPermissionsLoaded === true
    );

    // =========================================================
    // ADD / EDIT MODE
    // =========================================================

    const isEdit =
        modal.type === "editEmailSignature";

    const isOpen =
        modal.open &&
        (
            modal.type === "addEmailSignature" ||
            modal.type === "editEmailSignature"
        );

    // =========================================================
    // SAVE SUCCESS OPTIONS
    // =========================================================

    const [showSaveOptions, setShowSaveOptions] =
        useState(false);

    const [savedAction, setSavedAction] =
        useState("");

    // =========================================================
    // LOCAL STATE
    // =========================================================

    const [errors, setErrors] = useState({});

    const [activeTab, setActiveTab] =
        useState("emailSignature");

    // =========================================================
    // PERMISSION HELPERS
    // =========================================================

    const normalizeModule = (value) =>
        String(value ?? "")
            .trim()
            .toLowerCase();

    const normalizeAction = (value) =>
        String(value ?? "")
            .trim()
            .toUpperCase();

    const roleNameFromUser =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole =
        normalizeAction(roleNameFromUser);

    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";

    const isAdmin =
        normalizedRole === "ADMIN";

    const hasFullAccess =
        isSuperAdmin || isAdmin;

    const hasPermission = (
        moduleName,
        actionName
    ) => {
        if (hasFullAccess) {
            return true;
        }

        if (!Array.isArray(permissions)) {
            return false;
        }

        const requestedModule =
            normalizeModule(moduleName);

        const requestedAction =
            normalizeAction(actionName);

        return permissions.some((permission) => {
            const permissionModule =
                normalizeModule(
                    permission?.moduleName ||
                    permission?.module?.moduleName ||
                    permission?.module?.name ||
                    ""
                );

            if (
                permissionModule !== requestedModule
            ) {
                return false;
            }

            if (permission?.active === false) {
                return false;
            }

            if (
                normalizeAction(permission?.status) ===
                "INACTIVE"
            ) {
                return false;
            }

            if (Array.isArray(permission?.actions)) {
                return permission.actions.some((action) => {
                    if (typeof action === "string") {
                        return (
                            normalizeAction(action) ===
                            requestedAction
                        );
                    }

                    const permissionAction =
                        normalizeAction(
                            action?.actionName ||
                            action?.action?.actionName ||
                            action?.action?.name ||
                            action?.name ||
                            ""
                        );

                    const allowed =
                        action?.allowed === true ||
                        action?.allowed === "true";

                    if (action?.active === false) {
                        return false;
                    }

                    if (
                        normalizeAction(action?.status) ===
                        "INACTIVE"
                    ) {
                        return false;
                    }

                    return (
                        permissionAction === requestedAction &&
                        allowed
                    );
                });
            }

            const permissionAction =
                normalizeAction(
                    permission?.actionName ||
                    permission?.action?.actionName ||
                    permission?.action?.name ||
                    ""
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

    // =========================================================
    // REQUIRED PERMISSION
    // =========================================================

    const requiredAction =
        isEdit ? "EDIT" : "CREATE";

    // Keep this module name aligned with the exact module name
    // configured in your menu permission master.
    const hasRequiredPermission =
        hasPermission(
            "Email Signature",
            requiredAction
        );

    // =========================================================
    // LOAD USER PERMISSIONS
    // =========================================================

    useEffect(() => {
        if (!isOpen) return;

        if (authChecking) return;

        if (!isAuthenticated) return;

        if (hasFullAccess) return;

        if (
            !permissionsLoaded &&
            !permissionLoading
        ) {
            dispatch(getUserPermission());
        }
    }, [
        isOpen,
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    // =========================================================
    // FORM
    // =========================================================

    const form = emailSignature || {
        id: null,
        userId: user?.id ?? null,
        signatureName: "",
        signatureContent: "",
        defaultForNewMessages: false,
        defaultForReplies: false,
        status: "ACTIVE",
    };

    // =========================================================
    // CHANGE FIELD
    // =========================================================

    const handleChange = (field, value) => {
        dispatch(
            setEmailSignatureField({
                field,
                value,
            })
        );

        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    // =========================================================
    // RESET AND CLOSE
    // =========================================================

    const handleClose = () => {
        setShowSaveOptions(false);
        setSavedAction("");

        dispatch(closeModal());
        dispatch(resetEmailSignatureForm());

        setErrors({});
        setActiveTab("emailSignature");
    };

    // =========================================================
    // ESCAPE KEY
    // =========================================================

    useEffect(() => {
        if (!isOpen || showSaveOptions) {
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
    }, [isOpen, showSaveOptions]);

    // =========================================================
    // LOAD EXISTING DATA FOR EDIT
    // =========================================================

    useEffect(() => {
        if (
            !modal.open ||
            modal.type !== "editEmailSignature" ||
            !modal.data
        ) {
            return;
        }

        const existingEmailSignature = modal.data;

        dispatch(
            setEmailSignatureField({
                field: "id",
                value: existingEmailSignature.id ?? null,
            })
        );

        dispatch(
            setEmailSignatureField({
                field: "userId",
                value:
                    existingEmailSignature.userId ??
                    user?.id ??
                    null,
            })
        );

        dispatch(
            setEmailSignatureField({
                field: "signatureName",
                value:
                    existingEmailSignature.signatureName ?? "",
            })
        );

        dispatch(
            setEmailSignatureField({
                field: "signatureContent",
                value:
                    existingEmailSignature.signatureContent ?? "",
            })
        );

        dispatch(
            setEmailSignatureField({
                field: "defaultForNewMessages",
                value:
                    existingEmailSignature.defaultForNewMessages ??
                    false,
            })
        );

        dispatch(
            setEmailSignatureField({
                field: "defaultForReplies",
                value:
                    existingEmailSignature.defaultForReplies ??
                    false,
            })
        );

        dispatch(
            setEmailSignatureField({
                field: "status",
                value:
                    existingEmailSignature.status ?? "ACTIVE",
            })
        );
    }, [
        modal.open,
        modal.type,
        modal.data,
        user?.id,
        dispatch,
    ]);

    // =========================================================
    // SAVE
    // CREATE / UPDATE EMAIL SIGNATURE
    // =========================================================

    const handleSave = async (e) => {
        e.preventDefault();

        if (loading) return;

        // AUTH CHECK

        if (authChecking) {
            return;
        }

        if (!isAuthenticated) {
            toast.error("You are not authenticated");
            return;
        }

        // PERMISSION CHECK

        if (
            !hasFullAccess &&
            !permissionsLoaded
        ) {
            toast.error(
                "Permissions are still loading"
            );
            return;
        }

        if (
            !hasFullAccess &&
            !hasRequiredPermission
        ) {
            toast.error(
                `You do not have permission to ${requiredAction.toLowerCase()} email signatures`
            );
            return;
        }

        // USER ID VALIDATION

        const userId = user?.id ?? form.userId;

        if (!userId) {
            toast.error(
                "User ID is missing. Please log in again."
            );
            return;
        }

        // SIGNATURE NAME VALIDATION

        if (!form.signatureName?.trim()) {
            setErrors({
                signatureName:
                    "Signature name is required",
            });

            setActiveTab("emailSignature");

            toast.error(
                "Signature name is required"
            );

            return;
        }

        // SIGNATURE CONTENT VALIDATION

        if (!form.signatureContent?.trim()) {
            setErrors({
                signatureContent:
                    "Signature content is required",
            });

            setActiveTab("emailSignature");

            toast.error(
                "Signature content is required"
            );

            return;
        }

        setErrors({});

        // PAYLOAD

        const payload = {
            signatureName:
                form.signatureName.trim(),

            signatureContent:
                form.signatureContent.trim(),

            defaultForNewMessages:
                Boolean(form.defaultForNewMessages),

            defaultForReplies:
                Boolean(form.defaultForReplies),

            status:
                form.status || "ACTIVE",
        };

        try {
            // UPDATE EMAIL SIGNATURE

            if (isEdit) {
                const signatureId =
                    form.id ?? modal.data?.id;

                if (!signatureId) {
                    toast.error(
                        "Email signature ID is missing"
                    );
                    return;
                }

                await dispatch(
                    updateEmailSignature({
                        userId,
                        id: signatureId,
                        data: payload,
                    })
                ).unwrap();

                setSavedAction("updated");
            }

            // CREATE EMAIL SIGNATURE

            else {
                await dispatch(
                    createEmailSignature({
                        userId,
                        data: payload,
                    })
                ).unwrap();

                setSavedAction("created");
            }

            // Keep the modal open until the user chooses
            // what to do next.

            setShowSaveOptions(true);
        } catch (error) {
            console.error(
                "Email signature save error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    (
                        isEdit
                            ? "Failed to update email signature"
                            : "Failed to create email signature"
                    )
            );
        }
    };

    // =========================================================
    // SAVE SUCCESS - STAY HERE
    // =========================================================

    const handleStayHere = () => {
        const message =
            savedAction === "updated"
                ? "Email signature updated successfully"
                : "Email signature created successfully";

        setShowSaveOptions(false);
        setSavedAction("");

        dispatch(closeModal());
        dispatch(resetEmailSignatureForm());

        setErrors({});
        setActiveTab("emailSignature");

        toast.success(message);
    };

    // =========================================================
    // SAVE SUCCESS - GO TO MENU PERMISSION
    // =========================================================

    const handleGoToMenuPermission = () => {
        const message =
            savedAction === "updated"
                ? "Email signature updated successfully"
                : "Email signature created successfully";

        setShowSaveOptions(false);
        setSavedAction("");

        dispatch(closeModal());
        dispatch(resetEmailSignatureForm());

        setErrors({});
        setActiveTab("emailSignature");

        toast.success(message);

        navigate("/menuPermission");
    };

    // =========================================================
    // DO NOT RENDER
    // =========================================================

    if (!isOpen && !showSaveOptions) {
        return null;
    }

    // =========================================================
    // PERMISSION LOADING
    // =========================================================

    if (
        isOpen &&
        !showSaveOptions &&
        (
            authChecking ||
            (
                isAuthenticated &&
                !hasFullAccess &&
                (
                    permissionLoading ||
                    !permissionsLoaded
                )
            )
        )
    ) {
        return (
            <div className="w-[950px] max-w-[95vw] min-h-[300px] bg-white rounded-xl shadow-2xl flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />

                    <p className="text-sm font-medium text-gray-600">
                        Loading permissions...
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // ACCESS DENIED
    // =========================================================

    if (
        isOpen &&
        !showSaveOptions &&
        !hasFullAccess &&
        permissionsLoaded &&
        !hasRequiredPermission
    ) {
        return (
            <div className="w-[950px] max-w-[95vw] min-h-[300px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                <div className="shrink-0 h-[68px] flex items-center justify-between px-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0F4659] flex items-center justify-center">
                            <UserKeyIcon
                                size={22}
                                strokeWidth={2}
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                                {isEdit
                                    ? "Edit Email Signature"
                                    : "Add Email Signature"}
                            </h2>

                            <p className="text-xs text-gray-500 mt-0.5">
                                {isEdit
                                    ? "Update your email signature"
                                    : "Create a new email signature"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-[230px] flex items-center justify-center px-6 py-8 bg-gray-50/50">
                    <div className="text-center">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                            <UserKeyIcon
                                size={26}
                                strokeWidth={2}
                            />
                        </div>

                        <h3 className="text-base font-semibold text-gray-800">
                            Access Denied
                        </h3>

                        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                            You do not have permission to{" "}
                            {requiredAction.toLowerCase()}{" "}
                            email signatures.
                        </p>


                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // TABS
    // =========================================================

    const tabs = [
        {
            id: "emailSignature",
            label: "Signature Information",
        },
        {
            id: "settings",
            label: "Settings",
        },
    ];

    // =========================================================
    // INPUT CLASS
    // =========================================================

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
        focus:border-[#0F4659]
        focus:ring-1
        focus:ring-[#0F4659]/70
        disabled:bg-gray-100
        disabled:text-gray-500
        disabled:cursor-not-allowed
    `;

    // =========================================================
    // LABEL CLASS
    // =========================================================

    const getLabelClass = (required = false) => `
        block
        text-xs
        font-medium
        ${required ? "text-red-500" : "text-[#0F4659]"}
        mb-1.5
    `;

    // =========================================================
    // UI
    // =========================================================

    return (
        <>
            {/* =================================================
                EMAIL SIGNATURE MODAL
            ================================================= */}

            {isOpen && (
                <div className="w-[950px] max-w-[95vw] h-[700px] max-h-[88vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                    {/* HEADER */}

                    <div className="shrink-0 h-[68px] flex items-center justify-between px-6 border-b border-gray-200 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#0F4659]/20 text-[#0F4659] flex items-center justify-center">
                                <UserKeyIcon
                                    size={22}
                                    strokeWidth={2}
                                />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-[#0F4659]">
                                    {isEdit
                                        ? "Edit Email Signature"
                                        : "Add Email Signature"}
                                </h2>

                                <p className="text-xs text-[#0F4659] mt-0.5">
                                    {isEdit
                                        ? "Update your email signature details"
                                        : "Create a new email signature"}
                                </p>
                            </div>
                        </div>


                    </div>

                    {/* TABS */}

                    <div className="shrink-0 h-[52px] flex items-center gap-8 px-6 border-b border-gray-200 bg-white">
                        {tabs.map((tab) => {
                            const hasError =
                                tab.id === "emailSignature" &&
                                Boolean(
                                    errors?.signatureName ||
                                    errors?.signatureContent
                                );

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(tab.id)
                                    }
                                    className={`
                                        relative h-full px-1 text-sm font-medium transition
                                        ${activeTab === tab.id
                                            ? "text-[#0F4659]"
                                            : "text-[#0F4659] hover:text-[#0F4659]/90"
                                        }
                                        ${hasError ? "text-red-600" : ""}
                                    `}
                                >
                                    <span className="flex items-center gap-2">
                                        {tab.label}

                                        {hasError && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        )}
                                    </span>

                                    {activeTab === tab.id && (
                                        <span
                                            className={`
                                                absolute bottom-0 left-0 right-0 h-0.5
                                                ${hasError
                                                    ? "bg-red-500"
                                                    : "bg-[#0F4659]"
                                                }
                                            `}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* FORM */}

                    <form
                        onSubmit={handleSave}
                        className="flex flex-col flex-1 min-h-0 overflow-hidden"
                    >
                        {/* SCROLL BODY */}

                        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-7 py-6 bg-gray-50/50">
                            {/* SIGNATURE INFORMATION */}

                            {activeTab === "emailSignature" && (
                                <div className="space-y-6">
                                    {/* SECTION HEADER */}

                                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                        <div>
                                            <h3 className="text-sm font-semibold text-[#0F4659]">
                                                Signature Information
                                            </h3>

                                            <p className="text-xs text-[#0F4659]/80 mt-1">
                                                Enter the name and content of your email signature.
                                            </p>
                                        </div>

                                        {/* STATUS */}

                                        <div className="flex items-center gap-3 shrink-0">
                                            <label className="text-md font-semibold text-[#0F4659]">
                                                Status :
                                            </label>

                                            <span
                                                className={`
                                                    inline-flex items-center justify-center min-w-[85px] h-7 px-3 rounded-full text-sm font-bold
                                                    ${form.status === "ACTIVE"
                                                        ? "bg-green-50 text-green-700"
                                                        : form.status === "INACTIVE"
                                                            ? "bg-red-50 text-red-700"
                                                            : "bg-yellow-50 text-yellow-700"
                                                    }
                                                `}
                                            >
                                                {form.status || "ACTIVE"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* SIGNATURE NAME */}

                                    <div>
                                        <label className={getLabelClass(true)}>
                                            Signature Name
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                form.signatureName ?? ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "signatureName",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter signature name"
                                            className={`
                                                ${inputClass}
                                                ${errors.signatureName
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                    : ""
                                                }
                                            `}
                                            disabled={loading}
                                        />

                                        {errors?.signatureName && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.signatureName}
                                            </p>
                                        )}
                                    </div>

                                    {/* SIGNATURE CONTENT */}

                                    <div>
                                        <label className={getLabelClass(true)}>
                                            Signature Content
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </label>

                                        <textarea
                                            rows={8}
                                            value={
                                                form.signatureContent ?? ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "signatureContent",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter your email signature content"
                                            disabled={loading}
                                            className={`
                                                w-full px-3 py-3 border rounded-md
                                                text-sm text-gray-700 bg-white outline-none resize-y
                                                transition focus:border-[#0F4659] focus:ring-1 focus:ring-[#0F4659]/70
                                                disabled:bg-gray-100
                                                ${errors.signatureContent
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                    : "border-gray-300"
                                                }
                                            `}
                                        />

                                        {errors?.signatureContent && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.signatureContent}
                                            </p>
                                        )}

                                        <p className="mt-1 text-xs text-gray-500">
                                            Enter the content that should appear at the end of your emails.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* SETTINGS TAB */}

                            {activeTab === "settings" && (
                                <div className="space-y-6">
                                    <div className="pb-3 border-b border-gray-200">
                                        <h3 className="text-sm font-semibold text-[#0F4659]">
                                            Settings
                                        </h3>

                                        <p className="text-xs text-[#0F4659]/70 mt-1">
                                            Configure default signature options and status.
                                        </p>
                                    </div>

                                    {/* STATUS */}

                                    <div className="max-w-md">
                                        <label className={getLabelClass(false)}>
                                            Status
                                        </label>

                                        <CustomSelect
                                            value={
                                                form.status || "ACTIVE"
                                            }
                                            onChange={(value) =>
                                                handleChange(
                                                    "status",
                                                    value
                                                )
                                            }
                                            options={[
                                                {
                                                    value: "ACTIVE",
                                                    label: "ACTIVE",
                                                },
                                                {
                                                    value: "INACTIVE",
                                                    label: "INACTIVE",
                                                },
                                                {
                                                    value: "DRAFT",
                                                    label: "DRAFT",
                                                },
                                            ]}
                                        />
                                    </div>

                                    {/* DEFAULT FOR NEW MESSAGES */}

                                    <div className="max-w-md p-4 bg-white border border-gray-200 rounded-lg">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    Boolean(
                                                        form.defaultForNewMessages
                                                    )
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        "defaultForNewMessages",
                                                        e.target.checked
                                                    )
                                                }
                                                disabled={loading}
                                                className="mt-1 h-4 w-4 accent-[#0F4659]"
                                            />

                                            <span>
                                                <span className="block text-sm font-semibold text-[#0F4659]">
                                                    Default for New Messages
                                                </span>

                                                <span className="block text-xs text-gray-500 mt-1">
                                                    Automatically use this signature when composing new emails.
                                                </span>
                                            </span>
                                        </label>
                                    </div>

                                    {/* DEFAULT FOR REPLIES */}

                                    <div className="max-w-md p-4 bg-white border border-gray-200 rounded-lg">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    Boolean(
                                                        form.defaultForReplies
                                                    )
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        "defaultForReplies",
                                                        e.target.checked
                                                    )
                                                }
                                                disabled={loading}
                                                className="mt-1 h-4 w-4 accent-[#0F4659]"
                                            />

                                            <span>
                                                <span className="block text-sm font-semibold text-[#0F4659]">
                                                    Default for Replies
                                                </span>

                                                <span className="block text-xs text-gray-500 mt-1">
                                                    Automatically use this signature when replying to emails.
                                                </span>
                                            </span>
                                        </label>
                                    </div>

                                    {/* STATUS SUMMARY */}

                                    <div className="max-w-md p-4 bg-white border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-[#0F4659]">
                                                    Email Signature Status
                                                </p>

                                                <p className="text-xs text-[#0F4659]/80 mt-1">
                                                    Current status of this email signature.
                                                </p>
                                            </div>

                                            <span
                                                className={`
                                                    inline-flex items-center justify-center min-w-[85px] h-7 px-3 rounded-full text-sm font-bold
                                                    ${form.status === "ACTIVE"
                                                        ? "bg-green-50 text-green-700"
                                                        : form.status === "INACTIVE"
                                                            ? "bg-red-50 text-red-700"
                                                            : "bg-yellow-50 text-yellow-700"
                                                    }
                                                `}
                                            >
                                                {form.status || "ACTIVE"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* FOOTER */}

                        <div className="shrink-0 h-[68px] flex items-center justify-between px-6 border-t border-gray-200 bg-white">
                            <div />

                            <div className="flex items-center gap-3">
                                {/* CANCEL */}

                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="
                                        h-10 px-5 rounded-md border border-gray-300
                                        text-sm font-medium text-gray-700 bg-white
                                        hover:bg-gray-50 transition
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    "
                                >
                                    Cancel
                                </button>

                                {/* SAVE / UPDATE */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        h-10 px-6 rounded-md bg-[#0F4659] text-white
                                        text-sm font-medium hover:bg-[#0F4659]/90 transition
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        inline-flex items-center gap-2
                                    "
                                >
                                    {loading && (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    )}

                                    {loading
                                        ? isEdit
                                            ? "Updating..."
                                            : "Saving..."
                                        : isEdit
                                            ? "Update"
                                            : "Save"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* =================================================
                SAVE SUCCESS CONFIRMATION
            ================================================= */}

            {showSaveOptions && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="email-signature-save-title"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                    >
                        {/* SUCCESS ICON */}

                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                            <Check
                                className="text-emerald-600"
                                size={26}
                            />
                        </div>

                        {/* TITLE */}

                        <h2
                            id="email-signature-save-title"
                            className="text-xl font-semibold text-gray-900"
                        >
                            Email Signature{" "}
                            {savedAction === "updated"
                                ? "Updated"
                                : "Created"}{" "}
                            Successfully
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            What would you like to do next?
                        </p>

                        {/* ACTIONS */}

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleStayHere}
                                className="
                                    rounded-lg border border-gray-300
                                    px-4 py-2.5 text-sm font-medium text-gray-700
                                    transition hover:bg-gray-50
                                "
                            >
                                Stay and Save Here
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
        </>
    );
}