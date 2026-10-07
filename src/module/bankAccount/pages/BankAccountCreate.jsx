import React, {
    useEffect,
    useState,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    UserRoundArrowLeft,
    Landmark,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    closeModal,
} from "../../ui/uiSlice";

import {
    resetBankAccountForm,
    setBankAccountField,
} from "../slices/bankAccountSlice";

import {
    createBankAccount,
    updateBankAccount,
} from "../thunks/bankAccountThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

export default function BankAccountCreate() {

    const dispatch = useDispatch();

    // =========================================================
    // UI
    // =========================================================

    const { modal } = useSelector(
        (state) => state.ui
    );

    // =========================================================
    // BANK ACCOUNT
    // =========================================================

    const {
        bankAccount,
        loading,
    } = useSelector(
        (state) => state.bankAccount
    );

    // =========================================================
    // AUTH
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

    // =========================================================
    // PERMISSIONS
    // =========================================================

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
        modal.type === "editBankAccount";

    const isAdd =
        modal.type === "addBankAccount";

    const isOpen =
        modal.open &&
        (
            isAdd ||
            isEdit
        );

    // =========================================================
    // ROLE
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
        isSuperAdmin ||
        isAdmin;

    // =========================================================
    // PERMISSION CHECK
    // =========================================================

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

                // -------------------------------------------------
                // Nested actions
                // -------------------------------------------------

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

                // -------------------------------------------------
                // Flat permission
                // -------------------------------------------------

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
    // REQUIRED ACTION
    // =========================================================

    const requiredAction =
        isEdit
            ? "EDIT"
            : "CREATE";

    const hasRequiredPermission =
        hasPermission(
            "BankAccounts",
            requiredAction
        );

    // =========================================================
    // LOAD PERMISSIONS
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

    const form =
        bankAccount || {
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

    // =========================================================
    // LOCAL STATE
    // =========================================================

    const [activeTab, setActiveTab] =
        useState("account");

    // =========================================================
    // CHANGE FIELD
    // =========================================================

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

    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const handleClose = () => {

        dispatch(
            closeModal()
        );

        dispatch(
            resetBankAccountForm()
        );

        setActiveTab("account");
    };

    // =========================================================
    // ESCAPE KEY
    // =========================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const handleEscape = (
            event
        ) => {

            if (
                event.key === "Escape"
            ) {
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
            modal.type === "editBankAccount" &&
            modal.data
        ) {

            const existingBankAccount =
                modal.data;

            dispatch(
                setBankAccountField({
                    field: "id",
                    value:
                        existingBankAccount.id ??
                        null,
                })
            );

            dispatch(
                setBankAccountField({
                    field: "accountType",
                    value:
                        existingBankAccount.accountType ??
                        "CURRENT",
                })
            );

            dispatch(
                setBankAccountField({
                    field: "accountName",
                    value:
                        existingBankAccount.accountName ??
                        "",
                })
            );

            dispatch(
                setBankAccountField({
                    field: "accountCode",
                    value:
                        existingBankAccount.accountCode ??
                        "",
                })
            );

            dispatch(
                setBankAccountField({
                    field: "currency",
                    value:
                        existingBankAccount.currency ??
                        "INR",
                })
            );

            dispatch(
                setBankAccountField({
                    field: "accountNumber",
                    value:
                        existingBankAccount.accountNumber ??
                        "",
                })
            );

            dispatch(
                setBankAccountField({
                    field: "bankName",
                    value:
                        existingBankAccount.bankName ??
                        "",
                })
            );

            dispatch(
                setBankAccountField({
                    field: "ifsc",
                    value:
                        existingBankAccount.ifsc ??
                        "",
                })
            );

            dispatch(
                setBankAccountField({
                    field: "userIds",
                    value:
                        existingBankAccount.userIds ??
                        [],
                })
            );

            dispatch(
                setBankAccountField({
                    field: "description",
                    value:
                        existingBankAccount.description ??
                        "",
                })
            );

            dispatch(
                setBankAccountField({
                    field: "primaryAccount",
                    value:
                        existingBankAccount.primaryAccount ??
                        false,
                })
            );

            dispatch(
                setBankAccountField({
                    field: "status",
                    value:
                        existingBankAccount.status ??
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

        // -----------------------------------------------------
        // AUTHENTICATION
        // -----------------------------------------------------

        if (!isAuthenticated) {

            toast.error(
                "You are not authenticated."
            );

            return;
        }

        // -----------------------------------------------------
        // PERMISSION LOADING
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // PERMISSION
        // -----------------------------------------------------

        if (!hasRequiredPermission) {

            toast.error(
                isEdit
                    ? "You do not have permission to edit bank accounts."
                    : "You do not have permission to create bank accounts."
            );

            return;
        }

        // -----------------------------------------------------
        // ACCOUNT NAME
        // -----------------------------------------------------

        if (
            !form.accountName?.trim()
        ) {

            toast.error(
                "Account name is required"
            );

            return;
        }

        // -----------------------------------------------------
        // ACCOUNT NUMBER
        // -----------------------------------------------------

        if (
            !form.accountNumber?.trim()
        ) {

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

            toast.error(
                "Account number must contain 9 to 18 digits"
            );

            return;
        }

        // -----------------------------------------------------
        // BANK NAME
        // -----------------------------------------------------

        if (
            !form.bankName?.trim()
        ) {

            toast.error(
                "Bank name is required"
            );

            return;
        }

        // -----------------------------------------------------
        // IFSC
        // -----------------------------------------------------

        if (
            !form.ifsc?.trim()
        ) {

            toast.error(
                "IFSC code is required"
            );

            return;
        }

        if (
            !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(
                form.ifsc
                    .trim()
                    .toUpperCase()
            )
        ) {

            toast.error(
                "Enter a valid IFSC code"
            );

            return;
        }

        // -----------------------------------------------------
        // PAYLOAD
        // -----------------------------------------------------

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
                form.ifsc
                    .trim()
                    .toUpperCase(),

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

        try {

            // =================================================
            // EDIT
            // =================================================

            if (isEdit) {

                const bankAccountId =
                    form.id ??
                    modal.data?.id;

                if (!bankAccountId) {

                    toast.error(
                        "Bank account ID is missing"
                    );

                    return;
                }

                await dispatch(
                    updateBankAccount({
                        id: bankAccountId,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Bank account updated successfully"
                );

            }

            // =================================================
            // CREATE
            // =================================================

            else {

                await dispatch(
                    createBankAccount(
                        payload
                    )
                ).unwrap();

                toast.success(
                    "Bank account created successfully"
                );
            }

            // =================================================
            // CLOSE + RESET
            // =================================================

            dispatch(
                closeModal()
            );

            dispatch(
                resetBankAccountForm()
            );

            setActiveTab("account");

        } catch (error) {

            console.error(
                "Bank account save error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update bank account"
                            : "Failed to create bank account"
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
    // AUTH CHECKING
    // =========================================================

    if (authChecking) {

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
                        Checking authentication...
                    </p>

                </div>

            </div>
        );
    }

    // =========================================================
    // NOT AUTHENTICATED
    // =========================================================

    if (!isAuthenticated) {
        return null;
    }

    // =========================================================
    // PERMISSION LOADING
    // =========================================================

    if (
        !hasFullAccess &&
        (
            permissionLoading ||
            !permissionsLoaded
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

    if (!hasRequiredPermission) {

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

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                w-9
                                h-9
                                rounded-lg
                                bg-red-50
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <UserRoundArrowLeft
                                size={20}
                                className="text-red-500"
                            />

                        </div>

                        <div>

                            <h2
                                className="
                                    text-[17px]
                                    font-semibold
                                    text-gray-800
                                "
                            >
                                Access Denied
                            </h2>

                            <p
                                className="
                                    text-xs
                                    text-gray-500
                                    mt-0.5
                                "
                            >
                                Bank account access restricted
                            </p>

                        </div>

                    </div>

                </div>

                {/* MESSAGE */}

                <div
                    className="
                        flex-1
                        flex
                        items-center
                        justify-center
                        px-6
                        py-10
                    "
                >

                    <div className="text-center">

                        <div
                            className="
                                w-12
                                h-12
                                mx-auto
                                mb-3
                                rounded-full
                                bg-red-50
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <span
                                className="
                                    text-red-500
                                    text-lg
                                    font-semibold
                                "
                            >
                                !
                            </span>

                        </div>

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-800
                            "
                        >
                            Access Denied
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-gray-500
                            "
                        >
                            {isEdit
                                ? "You do not have permission to edit bank accounts."
                                : "You do not have permission to create bank accounts."
                            }
                        </p>

                    </div>

                </div>

                {/* FOOTER */}

                <div
                    className="
                        shrink-0
                        h-[68px]
                        flex
                        items-center
                        justify-end
                        px-6
                        border-t
                        border-gray-200
                        bg-white
                    "
                >

                    <button
                        type="button"
                        onClick={handleClose}
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
                        "
                    >
                        Close
                    </button>

                </div>

            </div>
        );
    }

    // =========================================================
    // TABS
    // =========================================================

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
        bg-white
        outline-none
        transition
        focus:border-blue-500
        focus:ring-1
        focus:ring-blue-500
    `;

    const labelClass = `
        block
        text-[13px]
        font-medium
        text-gray-700
        mb-1.5
    `;

    // =========================================================
    // MAIN MODAL
    // =========================================================

    return (

        <div
            className="
                w-[950px]
                max-w-[95vw]
                h-[960px]
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

                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >

                    <div
                        className="
                            w-9
                            h-9
                            rounded-lg
                            bg-blue-50
                            flex
                            items-center
                            justify-center
                        "
                    >

                        <Landmark
                            size={20}
                            className="text-blue-600"
                        />

                    </div>

                    <div>

                        <h2
                            className="
                                text-[17px]
                                font-semibold
                                text-gray-800
                            "
                        >
                            {isEdit
                                ? "Edit Bank Account"
                                : "New Bank Account"}
                        </h2>

                        <p
                            className="
                                text-xs
                                text-gray-500
                                mt-0.5
                            "
                        >
                            {isEdit
                                ? "Update bank account information"
                                : "Create a new bank account"}
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
                    px-6
                    border-b
                    border-gray-200
                    bg-white
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-8
                        h-[52px]
                    "
                >

                    {tabs.map((tab) => {

                        const active =
                            activeTab === tab.id;

                        return (

                            <button
                                key={tab.id}
                                type="button"
                                onClick={() =>
                                    setActiveTab(
                                        tab.id
                                    )
                                }
                                className={`
                                    relative
                                    h-full
                                    text-sm
                                    font-medium
                                    transition
                                    ${active
                                        ? "text-blue-600"
                                        : "text-gray-500 hover:text-gray-800"
                                    }
                                `}
                            >

                                {tab.label}

                                {active && (

                                    <span
                                        className="
                                            absolute
                                            left-0
                                            right-0
                                            bottom-0
                                            h-[2px]
                                            bg-blue-600
                                            rounded-t
                                        "
                                    />

                                )}

                            </button>

                        );

                    })}

                </div>

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
                        ACCOUNT DETAILS
                    ================================================= */}

                    {activeTab === "account" && (

                        <div>

                            <div className="mb-6">

                                <h3
                                    className="
                                        text-base
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    Account Information
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Configure the basic bank account
                                    information.
                                </p>

                            </div>

                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-x-6
                                    gap-y-5
                                "
                            >

                                {/* ACCOUNT TYPE */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        Account Type
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={
                                            form.accountType ??
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

                                    <label
                                        className={labelClass}
                                    >
                                        Currency
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={
                                            form.currency ??
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

                                {/* ACCOUNT NAME */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        Account Name
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.accountName ??
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

                                    <label
                                        className={labelClass}
                                    >
                                        Account Code
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.accountCode ??
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

                        </div>

                    )}

                    {/* =================================================
                        BANK DETAILS
                    ================================================= */}

                    {activeTab === "bank" && (

                        <div>

                            <div className="mb-6">

                                <h3
                                    className="
                                        text-base
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    Bank Information
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Enter the bank and account
                                    identification details.
                                </p>

                            </div>

                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-x-6
                                    gap-y-5
                                "
                            >

                                {/* BANK NAME */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        Bank Name
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.bankName ??
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

                                    <label
                                        className={labelClass}
                                    >
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
                                            form.accountNumber ??
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

                                    <p
                                        className="
                                            text-[11px]
                                            text-gray-400
                                            mt-1
                                        "
                                    >
                                        9 to 18 digits
                                    </p>

                                </div>

                                {/* IFSC */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        IFSC Code
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={11}
                                        value={
                                            form.ifsc ??
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
                                        className={`
                                            ${inputClass}
                                            uppercase
                                        `}
                                    />

                                </div>

                                {/* PRIMARY ACCOUNT */}

                                <div>

                                    <label
                                        className={labelClass}
                                    >
                                        Primary Account
                                    </label>

                                    <div
                                        className="
                                            h-11
                                            flex
                                            items-center
                                            gap-3
                                            px-3
                                            border
                                            border-gray-300
                                            rounded-md
                                            bg-white
                                        "
                                    >

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
                                            className="
                                                h-4
                                                w-4
                                                accent-blue-600
                                            "
                                        />

                                        <span
                                            className="
                                                text-sm
                                                text-gray-700
                                            "
                                        >
                                            Set as primary bank account
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {/* BANK SUMMARY */}

                            <div
                                className="
                                    mt-7
                                    p-5
                                    border
                                    border-blue-100
                                    rounded-lg
                                    bg-blue-50/50
                                "
                            >

                                <p
                                    className="
                                        text-sm
                                        font-medium
                                        text-blue-800
                                    "
                                >
                                    Bank Account
                                </p>

                                <p
                                    className="
                                        text-xs
                                        text-blue-700
                                        mt-1
                                    "
                                >
                                    {form.bankName ||
                                        "Bank name"}{" "}
                                    •{" "}
                                    {form.accountNumber
                                        ? `•••• ${form.accountNumber.slice(-4)}`
                                        : "Account number"}
                                </p>

                            </div>

                        </div>

                    )}

                    {/* =================================================
                        ACCESS & NOTES
                    ================================================= */}

                    {activeTab === "access" && (

                        <div>

                            <div className="mb-6">

                                <h3
                                    className="
                                        text-base
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    Access & Notes
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Manage users associated with this
                                    account and add internal notes.
                                </p>

                            </div>

                            {/* USER IDS */}

                            <div className="mb-6">

                                <label
                                    className={labelClass}
                                >
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
                                                        !Number.isNaN(id)
                                                )
                                        )
                                    }
                                    placeholder="Enter user IDs separated by commas"
                                    className={inputClass}
                                />

                                <p
                                    className="
                                        text-[11px]
                                        text-gray-400
                                        mt-1
                                    "
                                >
                                    Example: 1, 2, 5
                                </p>

                            </div>

                            {/* DESCRIPTION */}

                            <div>

                                <label
                                    className={labelClass}
                                >
                                    Description
                                </label>

                                <textarea
                                    rows={6}
                                    value={
                                        form.description ??
                                        ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter bank account description"
                                    className="
                                        w-full
                                        px-3
                                        py-3
                                        border
                                        border-gray-300
                                        rounded-md
                                        text-sm
                                        bg-white
                                        outline-none
                                        resize-none
                                        transition
                                        focus:border-blue-500
                                        focus:ring-1
                                        focus:ring-blue-500
                                    "
                                />

                            </div>

                        </div>

                    )}

                    {/* =================================================
                        SETTINGS
                    ================================================= */}

                    {activeTab === "settings" && (

                        <div>

                            <div className="mb-6">

                                <h3
                                    className="
                                        text-base
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    Account Settings
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Configure the account availability
                                    and status.
                                </p>

                            </div>

                            {/* STATUS */}

                            <div
                                className="
                                    max-w-[460px]
                                "
                            >

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

                            {/* ACCOUNT STATE */}

                            <div
                                className="
                                    mt-7
                                    border
                                    border-gray-200
                                    rounded-lg
                                    bg-white
                                    p-5
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
                                                font-medium
                                                text-gray-800
                                            "
                                        >
                                            Account Status
                                        </p>

                                        <p
                                            className="
                                                text-xs
                                                text-gray-500
                                                mt-1
                                            "
                                        >
                                            This account is currently set
                                            to{" "}
                                            <span
                                                className="
                                                    font-medium
                                                    text-gray-700
                                                "
                                            >
                                                {form.status ||
                                                    "ACTIVE"}
                                            </span>
                                        </p>

                                    </div>

                                    <span
                                        className={`
                                            px-3
                                            py-1
                                            rounded-full
                                            text-xs
                                            font-medium
                                            ${form.status ===
                                                "ACTIVE"
                                                ? "bg-green-50 text-green-700"
                                                : form.status ===
                                                    "INACTIVE"
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-yellow-50 text-yellow-700"
                                            }
                                        `}
                                    >
                                        {form.status ||
                                            "ACTIVE"}
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

                    <div
                        className="
                            text-xs
                            text-gray-500
                        "
                    >

                        <span className="text-red-500">
                            *
                        </span>

                        {" "}Required fields

                    </div>

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

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

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                h-10
                                px-6
                                rounded-md
                                bg-blue-600
                                text-white
                                text-sm
                                font-medium
                                hover:bg-blue-700
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
                                        ? "Update Account"
                                        : "Save Account"
                                )}

                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
}