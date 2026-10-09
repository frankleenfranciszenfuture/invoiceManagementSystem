import React, { useEffect, useState } from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import {
    Check,
    UserKeyIcon,
} from "lucide-react";

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
    fetchAllRoles,
} from "../../role/thunks/roleThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

export default function UserCreate() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // =========================================================
    // REDUX STATE
    // =========================================================

    const { modal } = useSelector(
        (state) => state.ui
    );

    const {
        user,
        loading,
    } = useSelector(
        (state) => state.user
    );

    const roleState = useSelector(
        (state) => state.role
    );

    // Always work with an array for the role dropdown.
    const roles = Array.isArray(roleState?.roles)
        ? roleState.roles
        : Array.isArray(roleState?.roles?.data)
            ? roleState.roles.data
            : [];

    const rolesLoading =
        roleState?.loading === true ||
        roleState?.fetching === true;

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
            state.menuPermission?.userPermissionsLoading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoaded === true
    );

    // =========================================================
    // ADD / EDIT MODE
    // =========================================================

    const isEdit = modal.type === "editUser";

    const isOpen =
        modal.open &&
        (
            modal.type === "addUser" ||
            modal.type === "editUser"
        );

    // =========================================================
    // LOCAL STATE
    // =========================================================

    const [showSaveOptions, setShowSaveOptions] =
        useState(false);

    const [savedAction, setSavedAction] =
        useState("");

    const [errors, setErrors] = useState({});

    const [activeTab, setActiveTab] =
        useState("user");

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

    const normalizedRole = normalizeAction(roleName);

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

            if (permissionModule !== requestedModule) {
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

    const requiredAction = isEdit
        ? "EDIT"
        : "CREATE";

    const hasRequiredPermission = hasPermission(
        "Users",
        requiredAction
    );

    // =========================================================
    // LOAD ROLES
    // =========================================================
    // Fetch roles when the User modal opens.
    // The loading flag prevents duplicate requests while loading.

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (roles.length === 0 && !rolesLoading) {
            dispatch(fetchAllRoles());
        }
    }, [
        isOpen,
        roles.length,
        rolesLoading,
        dispatch,
    ]);

    // =========================================================
    // LOAD USER PERMISSIONS
    // =========================================================

    useEffect(() => {
        if (!isOpen || authChecking || !isAuthenticated) {
            return;
        }

        if (hasFullAccess) {
            return;
        }

        if (!permissionsLoaded && !permissionLoading) {
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
    // INPUT STYLES
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

    const getLabelClass = (required = false) => `
    block
    text-xs
    font-medium
    ${required ? "text-red-500" : "text-gray-600"}
    mb-1.5
`;

    // =========================================================
    // CHANGE FIELD
    // =========================================================

    const handleChange = (field, value) => {
        dispatch(
            setUserField({
                field,
                value,
            })
        );

        if (errors[field]) {
            setErrors((previous) => ({
                ...previous,
                [field]: "",
            }));
        }
    };

    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const handleClose = () => {
        dispatch(closeModal());
        dispatch(resetUserForm());

        setErrors({});
        setActiveTab("user");
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
                dispatch(closeModal());
                dispatch(resetUserForm());

                setErrors({});
                setActiveTab("user");
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
    }, [
        isOpen,
        showSaveOptions,
        dispatch,
    ]);

    // =========================================================
    // LOAD EXISTING USER FOR EDIT
    // =========================================================
    // Important:
    // This effect does NOT depend on roles.
    // Therefore, loading roles will not reset the user's inputs.

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (modal.type === "addUser") {
            dispatch(resetUserForm());

            setErrors({});
            setActiveTab("user");

            return;
        }

        if (
            modal.type !== "editUser" ||
            !modal.data
        ) {
            return;
        }

        const existingUser =
            modal.data?.data?.user ??
            modal.data?.user ??
            modal.data?.data ??
            modal.data;

        const role = existingUser?.role;

        const roleNameFromUser =
            existingUser?.roleName ??
            (
                typeof role === "string"
                    ? role
                    : role?.roleName ??
                    role?.name ??
                    ""
            );

        const numericRoleString =
            typeof role === "string" &&
                /^\d+$/.test(role)
                ? Number(role)
                : null;

        const resolvedRoleId =
            existingUser?.roleId ??
            role?.id ??
            role?.roleId ??
            numericRoleString ??
            null;

        const fields = {
            id:
                existingUser?.id ??
                existingUser?.userId ??
                null,

            userId:
                existingUser?.userId ?? "",

            name:
                existingUser?.name ?? "",

            email:
                existingUser?.email ?? "",

            password: "",

            roleId: resolvedRoleId,

            role:
                typeof role === "string"
                    ? role
                    : role?.roleName ??
                    role?.name ??
                    roleNameFromUser,

            accountVerified:
                existingUser?.accountVerified ?? false,

            status:
                existingUser?.status ?? "ACTIVE",
        };

        dispatch(resetUserForm());

        Object.entries(fields).forEach(
            ([field, value]) => {
                dispatch(
                    setUserField({
                        field,
                        value,
                    })
                );
            }
        );

        setErrors({});
        setActiveTab("user");
    }, [
        isOpen,
        modal.type,
        modal.data,
        dispatch,
    ]);

    // =========================================================
    // RESOLVE ROLE ID AFTER ROLES ARE LOADED
    // =========================================================
    // Some APIs return roleName or role as an object/string
    // instead of roleId. Resolve it against the loaded roles.
    //
    // This effect updates only roleId. It does not reset the form.

    useEffect(() => {
        if (
            !isOpen ||
            modal.type !== "editUser" ||
            !modal.data ||
            roles.length === 0
        ) {
            return;
        }

        const existingUser =
            modal.data?.data?.user ??
            modal.data?.user ??
            modal.data?.data ??
            modal.data;

        const existingRole = existingUser?.role;

        const existingRoleId =
            existingUser?.roleId ??
            existingRole?.id ??
            existingRole?.roleId ??
            (
                typeof existingRole === "string" &&
                    /^\d+$/.test(existingRole)
                    ? Number(existingRole)
                    : null
            );

        // A valid role ID was already supplied by the API.
        if (existingRoleId != null) {
            return;
        }

        const existingRoleName =
            existingUser?.roleName ??
            (
                typeof existingRole === "string"
                    ? existingRole
                    : existingRole?.roleName ??
                    existingRole?.name ??
                    ""
            );

        if (!existingRoleName) {
            return;
        }

        const matchingRole = roles.find((item) => {
            const itemRoleName =
                String(item?.roleName ?? "")
                    .trim()
                    .toLowerCase();

            return (
                itemRoleName ===
                String(existingRoleName)
                    .trim()
                    .toLowerCase()
            );
        });

        if (matchingRole?.id != null) {
            dispatch(
                setUserField({
                    field: "roleId",
                    value: Number(matchingRole.id),
                })
            );
        }
    }, [
        isOpen,
        modal.type,
        modal.data,
        roles,
        dispatch,
    ]);

    // =========================================================
    // VALIDATION
    // =========================================================

    const validateForm = () => {
        const newErrors = {};

        if (!form.name?.trim()) {
            newErrors.name = "Name is required.";
        }

        if (!form.email?.trim()) {
            newErrors.email = "Email is required.";
        } else {
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(form.email.trim())) {
                newErrors.email =
                    "Enter a valid email address.";
            }
        }

        if (
            !isEdit &&
            !form.password?.trim()
        ) {
            newErrors.password =
                "Password is required.";
        }

        if (
            form.roleId == null ||
            form.roleId === ""
        ) {
            newErrors.roleId =
                "Role is required.";
        }

        setErrors(newErrors);

        return newErrors;
    };

    // =========================================================
    // SAVE USER
    // =========================================================

    const handleSave = async (event) => {
        event.preventDefault();

        if (authChecking) {
            return;
        }

        if (!isAuthenticated) {
            toast.error(
                "You are not authenticated."
            );
            return;
        }

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

        const validationErrors = validateForm();

        if (
            Object.keys(validationErrors).length > 0
        ) {
            setActiveTab("user");
            return;
        }

        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            roleId: Number(form.roleId),
        };

        if (!isEdit) {
            payload.password = form.password.trim();
        } else if (form.password?.trim()) {
            payload.password = form.password.trim();
        }


        try {
            if (isEdit) {
                const userId =
                    form.id ??
                    form.userId ??
                    modal.data?.id ??
                    modal.data?.userId ??
                    modal.data?.data?.id ??
                    modal.data?.data?.userId;

                if (userId == null) {
                    toast.error("User ID is missing.");
                    return;
                }

                await dispatch(
                    updateUser({
                        id: userId,
                        data: payload,
                    })
                ).unwrap();

                setSavedAction("updated");
                toast.success("User updated successfully.");
            } else {
                await dispatch(createUser(payload)).unwrap();

                setSavedAction("created");
                toast.success("User created successfully.");
            }

            // Show the success popup before closing the modal.
            // Do NOT close or reset the modal here.
            setShowSaveOptions(true);
        } catch (error) {
            console.error("User save error:", error);

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (isEdit
                        ? "Failed to update user."
                        : "Failed to create user.")
            );
        }

    };

    // =========================================================
    // SAVE SUCCESS: STAY HERE
    // =========================================================

    const handleStayHere = () => {
        setShowSaveOptions(false);
        setSavedAction("");

        dispatch(closeModal());
        dispatch(resetUserForm());

        setErrors({});
        setActiveTab("user");
    };

    // =========================================================
    // SAVE SUCCESS: MENU PERMISSION
    // =========================================================

    const handleGoToMenuPermission = () => {
        setShowSaveOptions(false);
        setSavedAction("");

        dispatch(closeModal());
        dispatch(resetUserForm());

        setErrors({});
        setActiveTab("user");

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
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <UserKeyIcon
                                size={22}
                                strokeWidth={2}
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                                {isEdit ? "Edit User" : "Add New User"}
                            </h2>

                            <p className="text-xs text-gray-500 mt-0.5">
                                {isEdit
                                    ? "Update user details"
                                    : "Create a new user"}
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
                            {requiredAction.toLowerCase()} users.
                        </p>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="mt-6 h-10 px-5 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // MAIN UI
    // =========================================================

    return (
        <>
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
                                        ? "Edit User"
                                        : "Add New User"}
                                </h2>

                                <p className="text-xs text-[#0F4659] mt-0.5">
                                    {isEdit
                                        ? "Update user details"
                                        : "Create a new user"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* TABS */}

                    <div className="shrink-0 h-[52px] flex items-center gap-8 px-6 border-b border-gray-200 bg-white">
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
                                        relative h-full px-1 text-sm
                                        font-medium transition
                                        ${activeTab === tab.id
                                            ? hasError
                                                ? "text-red-600"
                                                : "text-[#0F4659]"
                                            : hasError
                                                ? "text-red-600"
                                                : "text-gray-500 hover:text-gray-700"
                                        }
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
                                                absolute bottom-0 left-0
                                                right-0 h-0.5
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
                        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-7 py-6 bg-gray-50/50">

                            {/* USER INFORMATION */}

                            {activeTab === "user" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-800">
                                                User Information
                                            </h3>

                                            <p className="text-xs text-gray-500 mt-1">
                                                Enter the basic user details.
                                            </p>
                                        </div>

                                        {isEdit && (
                                            <div className="flex items-center gap-3 shrink-0">
                                                <label className="text-sm font-semibold text-gray-600">
                                                    Account :
                                                </label>

                                                <span
                                                    className={`
                                                        inline-flex items-center
                                                        justify-center min-w-[100px]
                                                        h-7 px-3 rounded-full
                                                        text-xs font-bold
                                                        ${form.accountVerified
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-yellow-50 text-yellow-700"
                                                        }
                                                    `}
                                                >
                                                    {form.accountVerified
                                                        ? "VERIFIED"
                                                        : "NOT VERIFIED"}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* NAME */}

                                    <div>
                                        <label className={getLabelClass(true)}>
                                            Name
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>

                                        <input
                                            type="text"
                                            value={form.name ?? ""}
                                            onChange={(event) =>
                                                handleChange(
                                                    "name",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter user name"
                                            className={inputClass}
                                        />

                                        {errors.name && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* EMAIL */}

                                    <div>
                                        <label className={getLabelClass(true)}>
                                            Email
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>

                                        <input
                                            type="email"
                                            value={form.email ?? ""}
                                            onChange={(event) =>
                                                handleChange(
                                                    "email",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter email address"
                                            className={inputClass}
                                        />

                                        {errors.email && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* PASSWORD */}

                                    <div>
                                        <label className={getLabelClass(true)}>
                                            Password

                                            {!isEdit && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </label>

                                        <input
                                            type="password"
                                            value={form.password ?? ""}
                                            onChange={(event) =>
                                                handleChange(
                                                    "password",
                                                    event.target.value
                                                )
                                            }
                                            placeholder={
                                                isEdit
                                                    ? "Leave blank to keep current password"
                                                    : "Enter password"
                                            }
                                            className={inputClass}
                                        />

                                        {errors.password && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* ROLE */}

                                    <div>
                                        <label className={getLabelClass(true)}>
                                            Role
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>

                                        <select
                                            value={
                                                form.roleId == null
                                                    ? ""
                                                    : String(form.roleId)
                                            }
                                            onChange={(event) =>
                                                handleChange(
                                                    "roleId",
                                                    event.target.value === ""
                                                        ? null
                                                        : Number(event.target.value)
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">
                                                {rolesLoading
                                                    ? "Loading roles..."
                                                    : "Select role"}
                                            </option>

                                            {roles.map((role) => (
                                                <option
                                                    key={role.id}
                                                    value={String(role.id)}
                                                >
                                                    {role.roleName}
                                                </option>
                                            ))}
                                        </select>

                                        {errors.roleId && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.roleId}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* SETTINGS */}

                            {activeTab === "settings" && (
                                <div className="space-y-6">
                                    <div className="pb-3 border-b border-gray-200">
                                        <h3 className="text-sm font-semibold text-gray-800">
                                            Settings
                                        </h3>

                                        <p className="text-xs text-gray-500 mt-1">
                                            Configure user account settings.
                                        </p>
                                    </div>

                                    {/* STATUS */}

                                    <div className="max-w-md">
                                        <label className={getLabelClass(false)}>
                                            Status
                                        </label>

                                        <select
                                            value={form.status ?? "ACTIVE"}
                                            onChange={(event) =>
                                                handleChange(
                                                    "status",
                                                    event.target.value
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

                                    {/* ACCOUNT VERIFICATION */}

                                    <div className="max-w-md">
                                        <label className={getLabelClass(false)}>
                                            Account Verification
                                        </label>

                                        <select
                                            value={
                                                form.accountVerified
                                                    ? "true"
                                                    : "false"
                                            }
                                            onChange={(event) =>
                                                handleChange(
                                                    "accountVerified",
                                                    event.target.value === "true"
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

                                    <div className="max-w-md p-4 bg-white border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">
                                                    User Status
                                                </p>

                                                <p className="text-xs text-gray-500 mt-1">
                                                    Current status of this user.
                                                </p>
                                            </div>

                                            <span
                                                className={`
                                                    inline-flex items-center justify-center
                                                    min-w-[85px] h-7 px-3 rounded-full
                                                    text-sm font-bold
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
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="h-10 px-5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="h-10 px-6 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
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

            {/* SAVE SUCCESS CONFIRMATION */}

            {showSaveOptions && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                    >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                            <Check
                                className="text-emerald-600"
                                size={26}
                            />
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900">
                            User{" "}
                            {savedAction === "updated" ? "Updated" : "Created"}{" "}
                            Successfully
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            What would you like to do next?
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleStayHere}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Stay and Save Here
                            </button>

                            <button
                                type="button"
                                onClick={handleGoToMenuPermission}
                                className="rounded-lg bg-[#088178] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#066b63]"
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