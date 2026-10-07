import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    useNavigate,
} from "react-router-dom";

import {
    ChevronDown,
    Landmark,
    ShieldCheck,
    UserRoundArrowLeft,
    X,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    resetBankAccountForm,
    setBankAccountField,
} from "../slices/bankAccountSlice";

import {
    createBankAccount,
} from "../thunks/bankAccountThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";


const INITIAL_FORM = {
    id: null,
    accountType: "CURRENT",
    accountName: "",
    accountCode: "",
    currency: "INR",
    accountNumber: "",
    bankName: "",
    ifsc: "",
    userIds: [],
    description: "",
    primaryAccount: false,
    status: "ACTIVE",
    active: true,
};


export default function BankAccountCreateSimple() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =========================================================
       REDUX
    ========================================================= */

    const bankAccountState =
        useSelector(
            (state) =>
                state.bankAccount || {}
        );

    const {
        bankAccount,
        loading,
    } = bankAccountState;

    const authState =
        useSelector(
            (state) =>
                state.auth || {}
        );

    const {
        user,
    } = authState;

    const permissionState =
        useSelector(
            (state) =>
                state.menuPermission || {}
        );

    const form =
        bankAccount || INITIAL_FORM;

    /* =========================================================
       AUTH
    ========================================================= */

    const isAuthenticated =
        authState.isAuthenticated !== false;

    const authChecking =
        Boolean(
            authState.authChecking ??
            authState.loading
        );

    /* =========================================================
       PERMISSIONS
    ========================================================= */

    const userPermissions =
        Array.isArray(
            permissionState.userPermissions
        )
            ? permissionState.userPermissions
            : [];

    const permissionLoading =
        Boolean(
            permissionState.userPermissionsLoading ??
            permissionState.loading
        );

    const permissionsLoaded =
        permissionState.userPermissionsLoaded === true ||
        permissionState.permissionsLoaded === true ||
        permissionState.loaded === true ||
        (
            permissionState.userPermissions !==
            undefined &&
            permissionState.userPermissions !==
            null
        );

    /* =========================================================
       LOCAL STATE
    ========================================================= */

    const [activeTab, setActiveTab] =
        useState("account");

    const [showSaveMenu, setShowSaveMenu] =
        useState(false);

    /* =========================================================
       ROLE
    ========================================================= */

    const normalizeModule = (
        value
    ) =>
        String(value ?? "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

    const normalizeAction = (
        value
    ) =>
        String(value ?? "")
            .trim()
            .toUpperCase()
            .replace(/[\s-]+/g, "_");

    const role = useMemo(() => {

        return (
            user?.roleName ||
            user?.role?.roleName ||
            user?.role?.name ||
            user?.role ||
            user?.authority ||
            ""
        );

    }, [user]);

    const normalizedRole =
        normalizeAction(role);

    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";

    const isAdmin =
        normalizedRole === "ADMIN";

    const hasFullAccess =
        isSuperAdmin ||
        isAdmin;

    /* =========================================================
       PERMISSION CHECK
    ========================================================= */

    const hasPermission = (
        moduleName,
        actionName
    ) => {

        if (hasFullAccess) {
            return true;
        }

        if (
            !Array.isArray(userPermissions)
        ) {
            return false;
        }

        const requestedModule =
            normalizeModule(moduleName);

        const requestedAction =
            normalizeAction(actionName);

        return userPermissions.some(
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

                    const nestedAllowed =
                        permission.actions.some(
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
                                    action?.allowed === "true" ||
                                    action?.isAllowed === true ||
                                    action?.isAllowed === "true";

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

                    if (nestedAllowed) {
                        return true;
                    }
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
                    permission?.allowed === "true" ||
                    permission?.isAllowed === true ||
                    permission?.isAllowed === "true";

                return (
                    permissionAction ===
                    requestedAction &&
                    allowed
                );
            }
        );
    };

    const hasCreatePermission =
        hasPermission(
            "BankAccounts",
            "CREATE"
        );

    /* =========================================================
       LOAD PERMISSIONS
    ========================================================= */

    useEffect(() => {

        if (
            authChecking ||
            !isAuthenticated ||
            hasFullAccess
        ) {
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
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    /* =========================================================
       TABS
    ========================================================= */

    const tabs = [
        {
            id: "account",
            label: "Account Details",
        },
        {
            id: "bank",
            label: "Bank Details",
        },
        {
            id: "access",
            label: "Access & Notes",
        },
        {
            id: "settings",
            label: "Settings",
        },
    ];

    /* =========================================================
       FIELD HANDLER
    ========================================================= */

    const handleChange = (
        field,
        value
    ) => {

        dispatch(
            setBankAccountField({
                field,
                value,
            })
        );
    };

    /* =========================================================
       CLOSE
    ========================================================= */

    const handleClose = () => {

        if (loading) {
            return;
        }

        setShowSaveMenu(false);

        dispatch(
            resetBankAccountForm()
        );

        setActiveTab("account");

        navigate("/bank-accounts");
    };

    /* =========================================================
       ESCAPE
    ========================================================= */

    useEffect(() => {

        const handleEscape = (event) => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }

            handleClose();
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

    }, [loading]);

    /* =========================================================
       SAVE
    ========================================================= */

    const handleSave = async ({
        saveAndNew = false,
        saveAndClose = true,
    } = {}) => {

        /* -----------------------------------------------------
           AUTH
        ----------------------------------------------------- */

        if (!isAuthenticated) {

            toast.error(
                "You are not authenticated."
            );

            return;
        }

        /* -----------------------------------------------------
           PERMISSION LOADING
        ----------------------------------------------------- */

        if (
            !hasFullAccess &&
            (
                permissionLoading ||
                !permissionsLoaded
            )
        ) {

            toast.error(
                "Permissions are still loading. Please try again."
            );

            return;
        }

        /* -----------------------------------------------------
           CREATE PERMISSION
        ----------------------------------------------------- */

        if (!hasCreatePermission) {

            toast.error(
                "You do not have permission to create bank accounts."
            );

            return;
        }

        /* -----------------------------------------------------
           ACCOUNT NAME
        ----------------------------------------------------- */

        if (
            !form.accountName?.trim()
        ) {

            setActiveTab("account");

            toast.error(
                "Account name is required"
            );

            return;
        }

        /* -----------------------------------------------------
           ACCOUNT NUMBER
        ----------------------------------------------------- */

        if (
            !form.accountNumber?.trim()
        ) {

            setActiveTab("bank");

            toast.error(
                "Account number is required"
            );

            return;
        }

        if (
            !/^\d{9,18}$/.test(
                form.accountNumber.trim()
            )
        ) {

            setActiveTab("bank");

            toast.error(
                "Account number must contain 9 to 18 digits"
            );

            return;
        }

        /* -----------------------------------------------------
           BANK NAME
        ----------------------------------------------------- */

        if (
            !form.bankName?.trim()
        ) {

            setActiveTab("bank");

            toast.error(
                "Bank name is required"
            );

            return;
        }

        /* -----------------------------------------------------
           IFSC
        ----------------------------------------------------- */

        if (
            !form.ifsc?.trim()
        ) {

            setActiveTab("bank");

            toast.error(
                "IFSC code is required"
            );

            return;
        }

        const normalizedIfsc =
            form.ifsc
                .trim()
                .toUpperCase();

        if (
            !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(
                normalizedIfsc
            )
        ) {

            setActiveTab("bank");

            toast.error(
                "Enter a valid IFSC code"
            );

            return;
        }

        /* -----------------------------------------------------
           PAYLOAD
        ----------------------------------------------------- */

        const payload = {

            accountType:
                form.accountType ||
                "CURRENT",

            accountName:
                form.accountName.trim(),

            accountCode:
                form.accountCode?.trim() ||
                "",

            currency:
                form.currency ||
                "INR",

            accountNumber:
                form.accountNumber.trim(),

            bankName:
                form.bankName.trim(),

            ifsc:
                normalizedIfsc,

            userIds:
                Array.isArray(
                    form.userIds
                )
                    ? form.userIds
                    : [],

            description:
                form.description?.trim() ||
                "",

            primaryAccount:
                Boolean(
                    form.primaryAccount
                ),

            status:
                form.status ||
                "ACTIVE",
        };

        /* -----------------------------------------------------
           CREATE
        ----------------------------------------------------- */

        try {

            await dispatch(
                createBankAccount(
                    payload
                )
            ).unwrap();

            toast.success(
                "Bank account created successfully"
            );

            dispatch(
                resetBankAccountForm()
            );

            setActiveTab("account");
            setShowSaveMenu(false);

            if (saveAndNew) {
                return;
            }

            if (saveAndClose) {
                navigate("/bank-accounts");
            }

        } catch (error) {

            console.error(
                "Bank account create error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    "Failed to create bank account"
            );
        }
    };

    /* =========================================================
       ACCESS CHECK
    ========================================================= */

    if (authChecking) {

        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">

                <div className="text-sm text-gray-500">
                    Checking authentication...
                </div>

            </div>
        );
    }

    /* =========================================================
       NOT AUTHENTICATED
    ========================================================= */

    if (!isAuthenticated) {

        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center max-w-md w-full">

                    <UserRoundArrowLeft
                        className="mx-auto text-red-500 mb-4"
                        size={42}
                    />

                    <h2 className="text-lg font-semibold text-gray-800">
                        Authentication Required
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                        Please sign in to create a bank account.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/bank-accounts")
                        }
                        className="mt-6 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                    >
                        Back to Bank Accounts
                    </button>

                </div>

            </div>
        );
    }

    /* =========================================================
       PERMISSION LOADING
    ========================================================= */

    if (
        !hasFullAccess &&
        (
            permissionLoading ||
            !permissionsLoaded
        )
    ) {

        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">

                <div className="text-sm text-gray-500">
                    Checking permissions...
                </div>

            </div>
        );
    }

    /* =========================================================
       ACCESS DENIED
    ========================================================= */

    if (!hasCreatePermission) {

        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center max-w-md w-full">

                    <ShieldCheck
                        className="mx-auto text-red-500 mb-4"
                        size={44}
                    />

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                        You do not have permission to create bank accounts.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/bank-accounts")
                        }
                        className="mt-6 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                    >
                        Back to Bank Accounts
                    </button>

                </div>

            </div>
        );
    }

    /* =========================================================
       INPUT STYLES
    ========================================================= */

    const inputClass =
        "w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";

    const labelClass =
        "block text-sm font-medium text-gray-700 mb-1.5";

    /* =========================================================
       ACCOUNT TAB
    ========================================================= */

    const renderAccountTab = () => {

        return (
            <div className="w-full max-w-7xl">

                <div className="bg-white border border-gray-200 rounded-lg p-6">

                    <div className="mb-6">

                        <h2 className="text-base font-semibold text-gray-800">
                            Account Information
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Configure the basic bank account information.
                        </p>

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8 items-start">

                        <div className="space-y-5">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* ACCOUNT TYPE */}

                                <div>

                                    <label className={labelClass}>
                                        Account Type
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={
                                            form.accountType ||
                                            "CURRENT"
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "accountType",
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="CURRENT">
                                            CURRENT
                                        </option>

                                        <option value="SAVINGS">
                                            SAVINGS
                                        </option>
                                    </select>

                                </div>

                                {/* CURRENCY */}

                                <div>

                                    <label className={labelClass}>
                                        Currency
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={
                                            form.currency ||
                                            "INR"
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "currency",
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="INR">
                                            INR
                                        </option>

                                        <option value="USD">
                                            USD
                                        </option>

                                        <option value="EUR">
                                            EUR
                                        </option>
                                    </select>

                                </div>

                            </div>

                            {/* ACCOUNT NAME */}

                            <div>

                                <label className={labelClass}>
                                    Account Name
                                    <span className="text-red-500 ml-1">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={
                                        form.accountName ||
                                        ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "accountName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter account name"
                                    className={inputClass}
                                />

                            </div>

                            {/* ACCOUNT CODE */}

                            <div>

                                <label className={labelClass}>
                                    Account Code
                                </label>

                                <input
                                    type="text"
                                    value={
                                        form.accountCode ||
                                        ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "accountCode",
                                            e.target.value
                                        )
                                    }
                                    placeholder="BANK-001"
                                    className={inputClass}
                                />

                            </div>

                        </div>

                        {/* SUMMARY */}

                        <div className="border border-gray-200 rounded-lg p-4">

                            <div className="flex items-center gap-2 mb-4">

                                <Landmark
                                    size={18}
                                    className="text-blue-600"
                                />

                                <h3 className="text-sm font-semibold text-gray-800">
                                    Account Summary
                                </h3>

                            </div>

                            <div className="space-y-4">

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Account Type
                                    </p>

                                    <p className="text-sm font-medium text-gray-800 mt-1">
                                        {form.accountType ||
                                            "CURRENT"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Currency
                                    </p>

                                    <p className="text-sm font-medium text-gray-800 mt-1">
                                        {form.currency ||
                                            "INR"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Status
                                    </p>

                                    <span className="inline-flex mt-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                                        {form.status ||
                                            "ACTIVE"}
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        );
    };

    /* =========================================================
       BANK TAB
    ========================================================= */

    const renderBankTab = () => {

        return (
            <div className="w-full max-w-7xl">

                <div className="bg-white border border-gray-200 rounded-lg p-6">

                    <div className="mb-6">

                        <h2 className="text-base font-semibold text-gray-800">
                            Bank Information
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Enter the bank and account identification details.
                        </p>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">

                        {/* BANK NAME */}

                        <div>

                            <label className={labelClass}>
                                Bank Name
                                <span className="text-red-500 ml-1">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                value={
                                    form.bankName ||
                                    ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "bankName",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter bank name"
                                className={inputClass}
                            />

                        </div>

                        {/* ACCOUNT NUMBER */}

                        <div>

                            <label className={labelClass}>
                                Account Number
                                <span className="text-red-500 ml-1">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={18}
                                value={
                                    form.accountNumber ||
                                    ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "accountNumber",
                                        e.target.value.replace(
                                            /\D/g,
                                            ""
                                        )
                                    )
                                }
                                placeholder="Enter account number"
                                className={inputClass}
                            />

                            <p className="text-xs text-gray-400 mt-1">
                                9 to 18 digits
                            </p>

                        </div>

                        {/* IFSC */}

                        <div>

                            <label className={labelClass}>
                                IFSC Code
                                <span className="text-red-500 ml-1">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                maxLength={11}
                                value={
                                    form.ifsc ||
                                    ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "ifsc",
                                        e.target.value
                                            .toUpperCase()
                                            .replace(
                                                /[^A-Z0-9]/g,
                                                ""
                                            )
                                    )
                                }
                                placeholder="SBIN0001234"
                                className={`${inputClass} uppercase`}
                            />

                        </div>

                        {/* PRIMARY */}

                        <div>

                            <label className={labelClass}>
                                Primary Account
                            </label>

                            <label className="h-10 px-3 border border-gray-300 rounded-md bg-white flex items-center gap-3 cursor-pointer">

                                <input
                                    type="checkbox"
                                    checked={
                                        Boolean(
                                            form.primaryAccount
                                        )
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "primaryAccount",
                                            e.target.checked
                                        )
                                    }
                                    className="h-4 w-4 accent-blue-600"
                                />

                                <span className="text-sm text-gray-700">
                                    Set as primary bank account
                                </span>

                            </label>

                        </div>

                    </div>

                    <div className="mt-7 p-4 rounded-lg bg-blue-50 border border-blue-100 max-w-5xl">

                        <p className="text-sm font-medium text-blue-800">
                            Bank Account
                        </p>

                        <p className="text-xs text-blue-700 mt-1">

                            {form.bankName ||
                                "Bank name"}

                            {" • "}

                            {form.accountNumber
                                ? `•••• ${form.accountNumber.slice(-4)}`
                                : "Account number"}

                        </p>

                    </div>

                </div>

            </div>
        );
    };

    /* =========================================================
       ACCESS TAB
    ========================================================= */

    const renderAccessTab = () => {

        return (
            <div className="w-full max-w-7xl">

                <div className="bg-white border border-gray-200 rounded-lg p-6">

                    <div className="mb-6">

                        <h2 className="text-base font-semibold text-gray-800">
                            Access & Notes
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Manage users associated with this account and add internal notes.
                        </p>

                    </div>

                    <div className="max-w-5xl space-y-6">

                        {/* USER IDS */}

                        <div>

                            <label className={labelClass}>
                                User IDs
                            </label>

                            <input
                                type="text"
                                value={
                                    Array.isArray(
                                        form.userIds
                                    )
                                        ? form.userIds.join(", ")
                                        : ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "userIds",
                                        e.target.value
                                            .split(",")
                                            .map((id) =>
                                                id.trim()
                                            )
                                            .filter(Boolean)
                                            .map((id) =>
                                                Number(id)
                                            )
                                            .filter(
                                                (id) =>
                                                    !Number.isNaN(
                                                        id
                                                    )
                                            )
                                    )
                                }
                                placeholder="Enter user IDs separated by commas"
                                className={inputClass}
                            />

                            <p className="text-xs text-gray-400 mt-1">
                                Example: 1, 2, 5
                            </p>

                        </div>

                        {/* DESCRIPTION */}

                        <div>

                            <label className={labelClass}>
                                Description
                            </label>

                            <textarea
                                rows={6}
                                value={
                                    form.description ||
                                    ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "description",
                                        e.target.value
                                    )
                                }
                                placeholder="Enter bank account description"
                                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                    </div>

                </div>

            </div>
        );
    };

    /* =========================================================
       SETTINGS TAB
    ========================================================= */

    const renderSettingsTab = () => {

        return (
            <div className="w-full max-w-7xl">

                <div className="bg-white border border-gray-200 rounded-lg p-6">

                    <div className="mb-6">

                        <h2 className="text-base font-semibold text-gray-800">
                            Account Settings
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Configure the account availability and status.
                        </p>

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8 items-start">

                        <div className="max-w-md">

                            <label className={labelClass}>
                                Status
                            </label>

                            <select
                                value={
                                    form.status ||
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

                        <div className="border border-gray-200 rounded-lg p-4">

                            <div className="flex items-center gap-2 mb-4">

                                <Landmark
                                    size={18}
                                    className="text-blue-600"
                                />

                                <h3 className="text-sm font-semibold text-gray-800">
                                    Account Status
                                </h3>

                            </div>

                            <p className="text-xs text-gray-500">
                                Current status
                            </p>

                            <span
                                className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-medium ${form.status ===
                                    "ACTIVE"
                                    ? "bg-green-50 text-green-700"
                                    : form.status ===
                                        "INACTIVE"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-yellow-50 text-yellow-700"
                                    }`}
                            >
                                {form.status ||
                                    "ACTIVE"}
                            </span>

                            <p className="text-xs text-gray-400 mt-4">
                                Inactive accounts should not be used for normal transactions.
                            </p>

                        </div>

                    </div>

                </div>

            </div>
        );
    };

    /* =========================================================
       MAIN UI
    ========================================================= */

    return (

        <div className="flex flex-col h-full min-h-0 bg-gray-50">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="shrink-0 px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">

                        <Landmark
                            size={20}
                            className="text-blue-600"
                        />

                    </div>

                    <div>

                        <h1 className="text-lg font-semibold text-gray-800">
                            New Bank Account
                        </h1>

                        <p className="text-xs text-gray-500 mt-0.5">
                            Create a new bank account
                        </p>

                    </div>

                </div>

                <button
                    type="button"
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

            </div>

            {/* =================================================
                TABS
            ================================================= */}

            <div className="shrink-0 px-6 bg-white border-b border-gray-200 flex items-center gap-7 overflow-x-auto">

                {tabs.map((tab) => (

                    <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                            setActiveTab(tab.id)
                        }
                        className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${activeTab === tab.id
                            ? "text-blue-600 border-blue-600"
                            : "text-gray-500 border-transparent hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>

                ))}

            </div>

            {/* =================================================
                BODY
            ================================================= */}

            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">

                {activeTab === "account" &&
                    renderAccountTab()}

                {activeTab === "bank" &&
                    renderBankTab()}

                {activeTab === "access" &&
                    renderAccessTab()}

                {activeTab === "settings" &&
                    renderSettingsTab()}

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4 flex items-center justify-between">

                <div className="text-xs text-gray-500">

                    <span className="text-red-500">
                        *
                    </span>

                    {" "}Required fields

                </div>

                <div className="flex items-center justify-end gap-3">

                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleClose}
                        className="h-10 px-5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>

                    <div className="relative flex">

                        {/* MAIN SAVE */}

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                                handleSave({
                                    saveAndNew: false,
                                    saveAndClose: true,
                                })
                            }
                            className="h-10 px-5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Saving..."
                                : "Save Bank Account"}
                        </button>

                        {/* DROPDOWN */}

                        <button
                            type="button"
                            disabled={loading}
                            onClick={() =>
                                setShowSaveMenu(
                                    (previous) =>
                                        !previous
                                )
                            }
                            className="h-10 w-10 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md border-l border-blue-400 flex items-center justify-center disabled:opacity-50"
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

                                <div
                                    className="fixed inset-0 z-[80]"
                                    onClick={() =>
                                        setShowSaveMenu(
                                            false
                                        )
                                    }
                                />

                                <div className="absolute right-0 bottom-full mb-2 w-56 bg-white border border-gray-200 rounded-md shadow-xl z-[90] overflow-hidden">

                                    {/* SAVE & NEW */}

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setShowSaveMenu(
                                                false
                                            );

                                            handleSave({
                                                saveAndNew: true,
                                                saveAndClose: false,
                                            });

                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                                    >

                                        <div className="font-medium text-sm text-gray-700">
                                            Save & New
                                        </div>

                                        <div className="text-xs text-gray-400 mt-0.5">
                                            Save and create another bank account
                                        </div>

                                    </button>

                                    {/* SAVE & CLOSE */}

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setShowSaveMenu(
                                                false
                                            );

                                            handleSave({
                                                saveAndNew: false,
                                                saveAndClose: true,
                                            });

                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50"
                                    >

                                        <div className="font-medium text-sm text-gray-700">
                                            Save & Close
                                        </div>

                                        <div className="text-xs text-gray-400 mt-0.5">
                                            Save and return to bank accounts
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