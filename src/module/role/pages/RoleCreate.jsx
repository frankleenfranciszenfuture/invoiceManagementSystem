
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { closeModal } from "../../ui/uiSlice";

import {
    resetRoleForm,
    setRoleField,
} from "../slices/roleSlice";

import {
    createRole,
    updateRole,
} from "../thunks/roleThunks";

import {
    UserKeyIcon,
} from "lucide-react";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

export default function RoleCreate() {

    const dispatch = useDispatch();

    const { modal } = useSelector(
        (state) => state.ui
    );

    const {
        role,
        loading,
    } = useSelector(
        (state) => state.role
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
        modal.type === "editRole";

    const isOpen =
        modal.open &&
        (
            modal.type === "addRole" ||
            modal.type === "editRole"
        );

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

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole =
        normalizeAction(roleName);

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

        return permissions.some(
            (permission) => {

                const permissionModule =
                    normalizeModule(
                        permission?.moduleName ||
                        permission?.module?.moduleName ||
                        permission?.module?.name ||
                        ""
                    );

                if (
                    permissionModule !==
                    requestedModule
                ) {
                    return false;
                }

                if (
                    permission?.active === false
                ) {
                    return false;
                }

                if (
                    normalizeAction(
                        permission?.status
                    ) === "INACTIVE"
                ) {
                    return false;
                }

                if (
                    Array.isArray(
                        permission?.actions
                    )
                ) {

                    return permission.actions.some(
                        (action) => {

                            if (
                                typeof action ===
                                "string"
                            ) {
                                return (
                                    normalizeAction(
                                        action
                                    ) ===
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

                            if (
                                action?.active === false
                            ) {
                                return false;
                            }

                            if (
                                normalizeAction(
                                    action?.status
                                ) === "INACTIVE"
                            ) {
                                return false;
                            }

                            return (
                                permissionAction ===
                                requestedAction &&
                                allowed
                            );
                        }
                    );
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
                    permissionAction ===
                    requestedAction &&
                    allowed
                );
            }
        );
    };

    // =========================================================
    // REQUIRED PERMISSION
    // =========================================================

    const requiredAction =
        isEdit
            ? "EDIT"
            : "CREATE";

    const hasRequiredPermission =
        hasPermission(
            "Roles",
            requiredAction
        );

    // =========================================================
    // LOCAL STATE
    // =========================================================

    const [errors, setErrors] = useState({});

    const [activeTab, setActiveTab] =
        useState("role");

    // =========================================================
    // LOAD USER PERMISSIONS
    // =========================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        if (authChecking) {
            return;
        }

        if (!isAuthenticated) {
            return;
        }

        if (hasFullAccess) {
            return;
        }

        if (
            !permissionsLoaded &&
            !permissionLoading
        ) {
            dispatch(
                getUserPermission()
            );
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

    const form = role || {
        id: null,
        roleName: "",
        description: "",
        status: "ACTIVE",
    };

    // =========================================================
    // CHANGE FIELD
    // =========================================================

    const handleChange = (
        field,
        value
    ) => {

        dispatch(
            setRoleField({
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
    // CLOSE MODAL
    // =========================================================

    const handleClose = () => {

        dispatch(closeModal());

        dispatch(
            resetRoleForm()
        );

        setErrors({});

        setActiveTab("role");
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
            modal.type === "editRole" &&
            modal.data
        ) {

            const existingRole =
                modal.data;

            dispatch(
                setRoleField({
                    field: "id",
                    value:
                        existingRole.id ??
                        null,
                })
            );

            dispatch(
                setRoleField({
                    field: "roleName",
                    value:
                        existingRole.roleName ??
                        "",
                })
            );

            dispatch(
                setRoleField({
                    field: "description",
                    value:
                        existingRole.description ??
                        "",
                })
            );

            dispatch(
                setRoleField({
                    field: "status",
                    value:
                        existingRole.status ??
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

    // =========================================================
    // SAVE
    // CREATE / UPDATE
    // =========================================================

    const handleSave = async (e) => {

        e.preventDefault();

        // =====================================================
        // AUTH CHECK
        // =====================================================

        if (authChecking) {
            return;
        }

        if (!isAuthenticated) {

            toast.error(
                "You are not authenticated"
            );

            return;
        }

        // =====================================================
        // PERMISSION CHECK
        // =====================================================

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
                `You do not have permission to ${requiredAction.toLowerCase()} roles`
            );

            return;
        }

        // -----------------------------------------------------
        // ROLE NAME
        // -----------------------------------------------------

        if (!form.roleName?.trim()) {

            setErrors({
                roleName:
                    "Role name is required",
            });

            setActiveTab("role");

            toast.error(
                "Role name is required"
            );

            return;
        }

        setErrors({});

        // -----------------------------------------------------
        // PAYLOAD
        // -----------------------------------------------------

        const payload = {

            roleName:
                form.roleName.trim(),

            description:
                form.description?.trim() ||
                "",

            status:
                form.status ||
                "ACTIVE",
        };

        try {

            // =================================================
            // EDIT
            // =================================================

            if (isEdit) {

                const roleId =
                    form.id ??
                    modal.data?.id;

                if (!roleId) {

                    toast.error(
                        "Role ID is missing"
                    );

                    return;
                }

                await dispatch(
                    updateRole({
                        id: roleId,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Role updated successfully"
                );

            }

            // =================================================
            // CREATE
            // =================================================

            else {

                await dispatch(
                    createRole(payload)
                ).unwrap();

                toast.success(
                    "Role created successfully"
                );

            }

            // =================================================
            // CLOSE + RESET
            // =================================================

            dispatch(
                closeModal()
            );

            dispatch(
                resetRoleForm()
            );

            setErrors({});

            setActiveTab("role");

        } catch (error) {

            console.error(
                "Role save error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update role"
                            : "Failed to create role"
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

    // =========================================================
    // PERMISSION LOADING
    // =========================================================

    if (
        authChecking ||
        (
            isAuthenticated &&
            !hasFullAccess &&
            (
                permissionLoading ||
                !permissionsLoaded
            )
        )
    ) {

        return (
            <div
                className="
                    w-[950px]
                    max-w-[95vw]
                    min-h-[300px]
                    bg-white
                    rounded-xl
                    shadow-2xl
                    flex
                    items-center
                    justify-center
                    p-8
                "
            >

                <div className="text-center">

                    <div
                        className="
                            w-10
                            h-10
                            mx-auto
                            mb-3
                            border-2
                            border-blue-200
                            border-t-blue-600
                            rounded-full
                            animate-spin
                        "
                    />

                    <p
                        className="
                            text-sm
                            font-medium
                            text-gray-600
                        "
                    >
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
        !hasFullAccess &&
        permissionsLoaded &&
        !hasRequiredPermission
    ) {

        return (
            <div
                className="
                    w-[950px]
                    max-w-[95vw]
                    min-h-[300px]
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
                                w-10
                                h-10
                                rounded-lg
                                bg-blue-50
                                text-blue-600
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <UserKeyIcon
                                size={22}
                                strokeWidth={2}
                            />

                        </div>

                        <div>

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    text-gray-800
                                "
                            >
                                {isEdit
                                    ? "Edit Role"
                                    : "Add New Role"}
                            </h2>

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                    mt-0.5
                                "
                            >
                                {isEdit
                                    ? "Update role details"
                                    : "Create a new role"}
                            </p>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    ACCESS DENIED BODY
                ================================================= */}

                <div
                    className="
                        flex-1
                        min-h-[230px]
                        flex
                        items-center
                        justify-center
                        px-6
                        py-8
                        bg-gray-50/50
                    "
                >

                    <div className="text-center">

                        <div
                            className="
                                w-14
                                h-14
                                mx-auto
                                mb-4
                                rounded-full
                                bg-red-50
                                text-red-500
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <UserKeyIcon
                                size={26}
                                strokeWidth={2}
                            />

                        </div>

                        <h3
                            className="
                                text-base
                                font-semibold
                                text-gray-800
                            "
                        >
                            Access Denied
                        </h3>

                        <p
                            className="
                                mt-2
                                text-sm
                                text-gray-500
                                max-w-md
                                mx-auto
                            "
                        >
                            You do not have permission to{" "}
                            {requiredAction.toLowerCase()}{" "}
                            roles.
                        </p>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="
                                mt-6
                                h-10
                                px-5
                                rounded-md
                                bg-blue-500
                                text-white
                                text-sm
                                font-medium
                                hover:bg-blue-600
                                transition
                            "
                        >
                            Close
                        </button>

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
            id: "role",
            label: "Role Information",
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
        focus:border-blue-500
        focus:ring-1
        focus:ring-blue-500
        disabled:bg-gray-100
        disabled:text-gray-500
        disabled:cursor-not-allowed
    `;

    // =========================================================
    // LABEL CLASS
    // =========================================================

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
                            w-10
                            h-10
                            rounded-lg
                            bg-blue-50
                            text-blue-600
                            flex
                            items-center
                            justify-center
                        "
                    >

                        <UserKeyIcon
                            size={22}
                            strokeWidth={2}
                        />

                    </div>

                    <div>

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-800
                            "
                        >
                            {isEdit
                                ? "Edit Role"
                                : "Add New Role"}
                        </h2>

                        <p
                            className="
                                text-xs
                                text-gray-500
                                mt-0.5
                            "
                        >
                            {isEdit
                                ? "Update role details"
                                : "Create a new role"}
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
                    h-[52px]
                    flex
                    items-center
                    gap-8
                    px-6
                    border-b
                    border-gray-200
                    bg-white
                "
            >

                {tabs.map((tab) => {

                    const hasError =
                        tab.id === "role" &&
                        (
                            errors?.roleName
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
                                px-1
                                text-sm
                                font-medium
                                transition
                                ${activeTab === tab.id
                                    ? hasError
                                        ? "text-red-600"
                                        : "text-blue-600"
                                    : hasError
                                        ? "text-red-600"
                                        : "text-gray-500 hover:text-gray-700"
                                }
                            `}
                        >

                            <span
                                className="
                                    flex
                                    items-center
                                    gap-2
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

                            {activeTab === tab.id && (

                                <span
                                    className={`
                                        absolute
                                        bottom-0
                                        left-0
                                        right-0
                                        h-0.5
                                        ${hasError
                                            ? "bg-red-500"
                                            : "bg-blue-500"
                                        }
                                    `}
                                />
                            )}

                        </button>
                    );
                })}

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
                        ROLE INFORMATION TAB
                    ================================================= */}

                    {activeTab === "role" && (

                        <div className="space-y-6">

                            {/* SECTION HEADER */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    pb-3
                                    border-b
                                    border-gray-200
                                "
                            >

                                <div>

                                    <h3
                                        className="
                                            text-sm
                                            font-semibold
                                            text-gray-800
                                        "
                                    >
                                        Role Information
                                    </h3>

                                    <p
                                        className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        "
                                    >
                                        Enter the basic role details.
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

                            {/* =================================================
                                ROLE NAME
                            ================================================= */}

                            <div>

                                <label
                                    className={labelClass}
                                >
                                    Role Name

                                    <span className="text-red-500 ml-1">
                                        *
                                    </span>

                                </label>

                                <input
                                    type="text"
                                    value={
                                        form.roleName ?? ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "roleName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter role name"
                                    className={inputClass}
                                />

                                {errors?.roleName && (

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            text-red-500
                                        "
                                    >
                                        {errors.roleName}
                                    </p>
                                )}

                            </div>

                            {/* =================================================
                                DESCRIPTION
                            ================================================= */}

                            <div>

                                <label
                                    className={labelClass}
                                >
                                    Description
                                </label>

                                <textarea
                                    rows={6}
                                    value={
                                        form.description ?? ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter role description"
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

                                {errors?.description && (

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            text-red-500
                                        "
                                    >
                                        {errors.description}
                                    </p>
                                )}

                            </div>

                        </div>
                    )}

                    {/* =================================================
                        SETTINGS TAB
                    ================================================= */}

                    {activeTab === "settings" && (

                        <div className="space-y-6">

                            {/* SECTION HEADER */}

                            <div
                                className="
                                    pb-3
                                    border-b
                                    border-gray-200
                                "
                            >

                                <h3
                                    className="
                                        text-sm
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    Settings
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Configure role status.
                                </p>

                            </div>

                            {/* STATUS */}

                            <div className="max-w-md">

                                <label
                                    className={labelClass}
                                >
                                    Status
                                </label>

                                <select
                                    value={
                                        form.status ?? "ACTIVE"
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

                            {/* =================================================
                                STATUS SUMMARY
                            ================================================= */}

                            <div
                                className="
                                    max-w-md
                                    p-4
                                    bg-white
                                    border
                                    border-gray-200
                                    rounded-lg
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
                                                font-semibold
                                                text-gray-700
                                            "
                                        >
                                            Role Status
                                        </p>

                                        <p
                                            className="
                                                text-xs
                                                text-gray-500
                                                mt-1
                                            "
                                        >
                                            Current status of this role.
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
                                            text-sm
                                            font-bold
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

                    <div />

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

                        {/* SAVE / UPDATE */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                h-10
                                px-6
                                rounded-md
                                bg-blue-500
                                text-white
                                text-sm
                                font-medium
                                hover:bg-blue-600
                                transition
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >

                            {loading
                                ? (
                                    isEdit
                                        ? "Updating..."
                                        : "Saving..."
                                )
                                : (
                                    isEdit
                                        ? "Update"
                                        : "Save"
                                )}

                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}
