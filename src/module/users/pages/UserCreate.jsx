
import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import toast from "react-hot-toast";

import { closeModal } from "../../ui/uiSlice";

import {
    resetUserForm,
    setUserField,
} from "../slices/userSlice";

import {
    createUser,
    updateUser,
} from "../thunks/userThunks";

import {
    UserKeyIcon,
} from "lucide-react";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

export default function UserCreate() {

    const dispatch = useDispatch();

    const { modal } = useSelector(
        (state) => state.ui
    );

    const {
        user,
        loading,
    } = useSelector(
        (state) => state.user
    );

    /*
     * Roles
     *
     * Change this selector if your role slice is mounted
     * under a different Redux key.
     */
    const {
        roles = [],
    } = useSelector(
        (state) => state.role
    );

    // =========================================================
    // AUTH / PERMISSIONS
    // =========================================================

    const userAuth = useSelector(
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
        modal.type === "editUser";

    const isOpen =
        modal.open &&
        (
            modal.type === "addUser" ||
            modal.type === "editUser"
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
        userAuth?.roleName ||
        userAuth?.role?.roleName ||
        userAuth?.role?.name ||
        userAuth?.role ||
        userAuth?.authority ||
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

    const requiredAction =
        isEdit
            ? "EDIT"
            : "CREATE";

    const hasRequiredPermission =
        hasPermission(
            "Users",
            requiredAction
        );

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

    const form = user || {

        id: null,

        userId: "",

        name: "",

        email: "",

        password: "",

        roleId: null,

        role: "",

        accountVerified: false,

        status: "ACTIVE",
    };

    // =========================================================
    // LOCAL STATE
    // =========================================================

    const [errors, setErrors] = useState({});

    const [activeTab, setActiveTab] =
        useState("user");

    // =========================================================
    // TABS
    // =========================================================

    const tabs = [

        {
            id: "user",
            label: "User Information",
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
    // CHANGE FIELD
    // =========================================================

    const handleChange = (
        field,
        value
    ) => {

        dispatch(
            setUserField({
                field,
                value,
            })
        );

        /*
         * Clear field error when user starts typing.
         */
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
            resetUserForm()
        );

        setErrors({});

        setActiveTab("user");
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
            modal.type === "editUser" &&
            modal.data
        ) {

            const existingUser =
                modal.data;

            /*
             * Basic fields
             */

            dispatch(
                setUserField({
                    field: "id",
                    value:
                        existingUser.id ??
                        null,
                })
            );

            dispatch(
                setUserField({
                    field: "userId",
                    value:
                        existingUser.userId ??
                        "",
                })
            );

            dispatch(
                setUserField({
                    field: "name",
                    value:
                        existingUser.name ??
                        "",
                })
            );

            dispatch(
                setUserField({
                    field: "email",
                    value:
                        existingUser.email ??
                        "",
                })
            );

            /*
             * IMPORTANT:
             *
             * Never load an existing password into
             * the frontend form.
             *
             * Leave it empty so password is changed
             * only when the user explicitly enters one.
             */

            dispatch(
                setUserField({
                    field: "password",
                    value: "",
                })
            );

            /*
             * roleId
             *
             * Prefer roleId if backend provides it.
             * Otherwise leave null.
             */

            dispatch(
                setUserField({
                    field: "roleId",
                    value:
                        existingUser.roleId ??
                        null,
                })
            );

            /*
             * Role name can still be displayed if
             * returned by backend.
             */

            dispatch(
                setUserField({
                    field: "role",
                    value:
                        existingUser.role ??
                        "",
                })
            );

            dispatch(
                setUserField({
                    field: "accountVerified",
                    value:
                        existingUser.accountVerified ??
                        false,
                })
            );

            dispatch(
                setUserField({
                    field: "status",
                    value:
                        existingUser.status ??
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
    // VALIDATION
    // =========================================================

    const validateForm = () => {

        const newErrors = {};

        // -----------------------------------------------------
        // NAME
        // -----------------------------------------------------

        if (!form.name?.trim()) {

            newErrors.name =
                "Name is required.";
        }

        // -----------------------------------------------------
        // EMAIL
        // -----------------------------------------------------

        if (!form.email?.trim()) {

            newErrors.email =
                "Email is required.";

        } else {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailRegex.test(
                    form.email.trim()
                )
            ) {

                newErrors.email =
                    "Enter a valid email address.";
            }
        }

        // -----------------------------------------------------
        // PASSWORD
        // -----------------------------------------------------

        /*
         * Password is required only while creating.
         *
         * During edit, empty password means:
         * "keep existing password".
         */

        if (
            !isEdit &&
            !form.password?.trim()
        ) {

            newErrors.password =
                "Password is required.";
        }

        // -----------------------------------------------------
        // ROLE
        // -----------------------------------------------------

        if (!form.roleId) {

            newErrors.roleId =
                "Role is required.";
        }

        setErrors(newErrors);

        return newErrors;
    };

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
                "You are not authenticated."
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
                "Permissions are still loading."
            );

            return;
        }

        if (
            !hasFullAccess &&
            !hasRequiredPermission
        ) {

            toast.error(
                `You do not have permission to ${requiredAction.toLowerCase()} users.`
            );

            return;
        }

        // =====================================================
        // VALIDATION
        // =====================================================

        const validationErrors =
            validateForm();

        if (
            Object.keys(
                validationErrors
            ).length > 0
        ) {

            /*
             * If User Information has an error,
             * automatically move to that tab.
             */

            if (
                validationErrors.name ||
                validationErrors.email ||
                validationErrors.password
            ) {

                setActiveTab("user");
            }

            /*
             * Role is also in User Information,
             * so keep the same tab.
             */

            return;
        }

        // =====================================================
        // PAYLOAD
        // =====================================================

        const payload = {

            name:
                form.name.trim(),

            email:
                form.email.trim(),

            roleId:
                Number(form.roleId),
        };

        /*
         * CREATE
         *
         * Password is mandatory.
         */

        if (!isEdit) {

            payload.password =
                form.password.trim();
        }

        /*
         * EDIT
         *
         * Only send password when the user
         * explicitly entered a new password.
         */

        if (
            isEdit &&
            form.password?.trim()
        ) {

            payload.password =
                form.password.trim();
        }

        try {

            // =================================================
            // EDIT
            // =================================================

            if (isEdit) {

                const userId =
                    form.id ??
                    modal.data?.id;

                if (!userId) {

                    toast.error(
                        "User ID is missing."
                    );

                    return;
                }

                await dispatch(
                    updateUser({
                        id: userId,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "User updated successfully."
                );
            }

            // =================================================
            // CREATE
            // =================================================

            else {

                await dispatch(
                    createUser(payload)
                ).unwrap();

                toast.success(
                    "User created successfully."
                );
            }

            // =================================================
            // CLOSE + RESET
            // =================================================

            dispatch(
                closeModal()
            );

            dispatch(
                resetUserForm()
            );

            setErrors({});

            setActiveTab("user");

        } catch (error) {

            console.error(
                "User save error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update user."
                            : "Failed to create user."
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

                {/* HEADER */}

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
                                    ? "Edit User"
                                    : "Add New User"}
                            </h2>

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                    mt-0.5
                                "
                            >
                                {isEdit
                                    ? "Update user details"
                                    : "Create a new user"}
                            </p>

                        </div>

                    </div>

                </div>

                {/* ACCESS DENIED BODY */}

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
                            users.
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
                                ? "Edit User"
                                : "Add New User"}
                        </h2>

                        <p
                            className="
                                text-xs
                                text-gray-500
                                mt-0.5
                            "
                        >
                            {isEdit
                                ? "Update user details"
                                : "Create a new user"}
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
                        tab.id === "user" &&
                        (
                            errors?.name ||
                            errors?.email ||
                            errors?.password ||
                            errors?.roleId
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
                        USER INFORMATION TAB
                    ================================================= */}

                    {activeTab === "user" && (

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
                                        User Information
                                    </h3>

                                    <p
                                        className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        "
                                    >
                                        Enter the basic user details.
                                    </p>

                                </div>

                                {/* ACCOUNT VERIFIED */}

                                {isEdit && (

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
                                                text-sm
                                                font-semibold
                                                text-gray-600
                                            "
                                        >
                                            Account :
                                        </label>

                                        <span
                                            className={`
                                                inline-flex
                                                items-center
                                                justify-center
                                                min-w-[100px]
                                                h-7
                                                px-3
                                                rounded-full
                                                text-xs
                                                font-bold
                                                ${form.accountVerified
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-yellow-50 text-yellow-700"
                                                }
                                            `}
                                        >
                                            {
                                                form.accountVerified
                                                    ? "VERIFIED"
                                                    : "NOT VERIFIED"
                                            }
                                        </span>

                                    </div>
                                )}

                            </div>

                            {/* NAME */}

                            <div>

                                <label
                                    className={labelClass}
                                >
                                    Name

                                    <span className="text-red-500 ml-1">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={
                                        form.name ?? ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "name",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter user name"
                                    className={inputClass}
                                />

                                {errors?.name && (

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            text-red-500
                                        "
                                    >
                                        {errors.name}
                                    </p>
                                )}

                            </div>

                            {/* EMAIL */}

                            <div>

                                <label
                                    className={labelClass}
                                >
                                    Email

                                    <span className="text-red-500 ml-1">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="email"
                                    value={
                                        form.email ?? ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "email",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter email address"
                                    className={inputClass}
                                />

                                {errors?.email && (

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            text-red-500
                                        "
                                    >
                                        {errors.email}
                                    </p>
                                )}

                            </div>

                            {/* PASSWORD */}

                            <div>

                                <label
                                    className={labelClass}
                                >
                                    Password

                                    {!isEdit && (

                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    )}

                                </label>

                                <input
                                    type="password"
                                    value={
                                        form.password ?? ""
                                    }
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
                                    className={inputClass}
                                />

                                {errors?.password && (

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            text-red-500
                                        "
                                    >
                                        {errors.password}
                                    </p>
                                )}

                            </div>

                            {/* ROLE */}

                            <div>

                                <label
                                    className={labelClass}
                                >
                                    Role

                                    <span className="text-red-500 ml-1">
                                        *
                                    </span>
                                </label>

                                <select
                                    value={
                                        form.roleId ?? ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "roleId",
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                >

                                    <option value="">
                                        Select role
                                    </option>

                                    {roles.map((role) => (

                                        <option
                                            key={role.id}
                                            value={role.id}
                                        >
                                            {role.roleName}
                                        </option>
                                    ))}

                                </select>

                                {errors?.roleId && (

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            text-red-500
                                        "
                                    >
                                        {errors.roleId}
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
                                    Configure user account settings.
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
                                        form.status ??
                                        "ACTIVE"
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

                            {/* ACCOUNT VERIFIED */}

                            <div className="max-w-md">

                                <label
                                    className={labelClass}
                                >
                                    Account Verification
                                </label>

                                <select
                                    value={
                                        form.accountVerified
                                            ? "true"
                                            : "false"
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "accountVerified",
                                            e.target.value === "true"
                                        )
                                    }
                                    className={inputClass}
                                >

                                    <option value="true">
                                        VERIFIED
                                    </option>

                                    <option value="false">
                                        NOT VERIFIED
                                    </option>

                                </select>

                            </div>

                            {/* STATUS SUMMARY */}

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
                                            User Status
                                        </p>

                                        <p
                                            className="
                                                text-xs
                                                text-gray-500
                                                mt-1
                                            "
                                        >
                                            Current status of this user.
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
                                        {
                                            form.status ||
                                            "ACTIVE"
                                        }
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
