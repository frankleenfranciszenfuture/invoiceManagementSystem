import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Landmark,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    FileText,
    CreditCard,
    Users,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createBankAccount,
    fetchBankAccountById,
    updateBankAccount,
} from "../thunks/bankAccountThunks";

import {
    resetBankAccountForm,
} from "../slices/bankAccountSlice";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../common/custom/CustomSelect";
import LeaveConfirmationModal from "../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../../../common/confirmation/useLeaveConfirmation";
import { closeModal } from "../../ui/uiSlice";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
    accountType: "",
    accountName: "",
    accountCode: "",
    currency: "INR",

    openingBalance: "0.00",

    accountNumber: "",
    bankName: "",
    branchName: "",
    ifsc: "",
    swiftCode: "",

    userIds: [],

    description: "",

    primaryAccount: false,

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

const TextAreaField = ({
    value,
    onChange,
    placeholder,
    rows = 3,
}) => (
    <textarea
        value={value ?? ""}
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
   MAIN COMPONENT
========================================================= */

const BankAccountCreateSimple = ({ onClose }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const isEditMode = Boolean(id);

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const bankAccountState = useSelector(
        (state) => state.bankAccount ?? {}
    );

    const {
        bankAccount,
        loading = false,
    } = bankAccountState;

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

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

    const {
        showLeaveConfirmation,
        confirmLeave,
        handleStay,
        handleLeave,
    } = useLeaveConfirmation();


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
        "Bank Accounts",
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
       FETCH BANK ACCOUNT FOR EDIT
    ===================================================== */

    useEffect(() => {

        if (!id || !isAuthenticated) {
            return;
        }

        dispatch(fetchBankAccountById(id));

    }, [dispatch, id, isAuthenticated]);

    /* =====================================================
       POPULATE EDIT FORM
    ===================================================== */

    const isCurrentAccountLoaded =
        isEditMode &&
        bankAccount?.id != null &&
        String(bankAccount.id) === String(id);

    useEffect(() => {

        if (!isCurrentAccountLoaded) {
            return;
        }

        setFormData({
            accountType: bankAccount.accountType ?? "",
            accountName: bankAccount.accountName ?? "",
            accountCode: bankAccount.accountCode ?? "",
            currency: bankAccount.currency ?? "INR",

            openingBalance: bankAccount.openingBalance ?? "0.00",

            accountNumber: bankAccount.accountNumber ?? "",
            bankName: bankAccount.bankName ?? "",
            branchName: bankAccount.branchName ?? "",
            ifsc: bankAccount.ifsc ?? "",
            swiftCode: bankAccount.swiftCode ?? "",

            userIds: bankAccount.userIds ?? [],

            description: bankAccount.description ?? "",

            primaryAccount: bankAccount.primaryAccount ?? false,

            status: bankAccount.status ?? "ACTIVE",
        });

    }, [
        isCurrentAccountLoaded,
        bankAccount,
    ]);

    /* =====================================================
       ACCOUNT TYPE OPTIONS
    ===================================================== */

    const accountTypeOptions = useMemo(() => [
        {
            label: "Current Account",
            value: "CURRENT",
        },
        {
            label: "Savings Account",
            value: "SAVINGS",
        },
    ], []);

    /* =====================================================
       CURRENCY OPTIONS
    ===================================================== */

    const currencyOptions = useMemo(() => [
        { label: "Indian Rupee (INR)", value: "INR" },
        { label: "US Dollar (USD)", value: "USD" },
        { label: "Euro (EUR)", value: "EUR" },
        { label: "British Pound (GBP)", value: "GBP" },
        { label: "UAE Dirham (AED)", value: "AED" },
        { label: "Saudi Riyal (SAR)", value: "SAR" },
    ], []);

    /* =====================================================
       STATUS OPTIONS
    ===================================================== */

    const statusOptions = useMemo(() => [
        {
            label: "Active",
            value: "ACTIVE",
        },
        {
            label: "Inactive",
            value: "INACTIVE",
        },
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

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {

        if (isEditMode) {

            if (!isCurrentAccountLoaded) {
                return;
            }

            setFormData({
                accountType: bankAccount.accountType ?? "",
                accountName: bankAccount.accountName ?? "",
                accountCode: bankAccount.accountCode ?? "",
                currency: bankAccount.currency ?? "INR",

                openingBalance: bankAccount.openingBalance ?? "0.00",

                accountNumber: bankAccount.accountNumber ?? "",
                bankName: bankAccount.bankName ?? "",
                branchName: bankAccount.branchName ?? "",
                ifsc: bankAccount.ifsc ?? "",
                swiftCode: bankAccount.swiftCode ?? "",

                userIds: bankAccount.userIds ?? [],

                description: bankAccount.description ?? "",

                primaryAccount: bankAccount.primaryAccount ?? false,

                status: bankAccount.status ?? "ACTIVE",
            });

        } else {

            setFormData({
                ...initialFormData,
            });
        }

        setSaveMode("close");
        setShowSaveOptions(false);

        dispatch(resetBankAccountForm());
    };

    const handleClose = () => {
        confirmLeave(() => {
            if (onClose) {
                onClose();
            } else {
                navigate("/settings/bankAccount");
            }
        });

    };


    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {

        if (!formData.accountType) {
            toast.error("Account type is required");
            return false;
        }

        if (!formData.accountName.trim()) {
            toast.error("Account name is required");
            return false;
        }

        // if (!formData.accountCode.trim()) {
        //     toast.error("Account code is required");
        //     return false;
        // }

        if (!formData.currency) {
            toast.error("Currency is required");
            return false;
        }

        if (
            !isEditMode &&
            (
                formData.openingBalance === "" ||
                Number.isNaN(Number(formData.openingBalance)) ||
                Number(formData.openingBalance) < 0
            )
        ) {
            toast.error("Opening balance must be zero or greater");
            return false;
        }

        if (!formData.accountNumber.trim()) {
            toast.error("Account number is required");
            return false;
        }

        if (!formData.bankName.trim()) {
            toast.error("Bank name is required");
            return false;
        }

        if (!formData.ifsc.trim()) {
            toast.error("IFSC code is required");
            return false;
        }


        if (!formData.status) {
            toast.error("Account status is required");
            return false;
        }

        return true;
    };

    /* =====================================================
       SAVE BANK ACCOUNT
    ===================================================== */
    const closeAfterSubmit = () => {
        dispatch(resetBankAccountForm());

        if (onClose) {
            onClose();
        } else {
            dispatch(closeModal());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        if (isEditMode && !isCurrentAccountLoaded) {
            toast.error("Bank account details are still loading");
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
                `You do not have permission to ${isEditMode ? "edit" : "create"
                } bank accounts`
            );
            return;
        }

        if (!validateForm()) {
            return;
        }

        const payload = {
            accountType: formData.accountType,
            accountName: formData.accountName.trim(),
            accountCode: formData.accountCode.trim().toUpperCase(),
            currency: formData.currency,

            // Always send opening balance during creation.
            // Editing does not modify the opening balance.
            ...(!isEditMode && {
                openingBalance: Number(formData.openingBalance || 0),
            }),

            accountNumber: formData.accountNumber.trim(),
            bankName: formData.bankName.trim(),
            branchName: formData.branchName.trim(),
            ifsc: formData.ifsc.trim().toUpperCase(),
            swiftCode: formData.swiftCode.trim().toUpperCase(),

            userIds: formData.userIds,

            description: formData.description.trim() || null,

            primaryAccount: formData.primaryAccount,
            status: formData.status,
        };

        try {
            const response = isEditMode
                ? await dispatch(
                    updateBankAccount({
                        id,
                        data: payload,
                    })
                ).unwrap()
                : await dispatch(
                    createBankAccount(payload)
                ).unwrap();

            toast.success(
                response?.message ||
                `Bank account ${isEditMode ? "updated" : "created"
                } successfully`
            );

            if (!isEditMode && saveMode === "new") {
                setFormData({ ...initialFormData });

                dispatch(resetBankAccountForm());

                setSaveMode("close");
                setShowSaveOptions(false);

                return;
            }

            closeAfterSubmit();




        } catch (error) {
            console.error(
                `Bank account ${isEditMode ? "update" : "creation"
                } error:`,
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    `Failed to ${isEditMode ? "update" : "create"
                    } bank account`
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
        (loading || !isCurrentAccountLoaded)
    ) {

        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading bank account...
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
                        {isEditMode ? "edit" : "create"} bank accounts.
                    </p>

                    <button
                        type="button"
                        onClick={handleClose}
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
                            {isEditMode
                                ? "Edit Bank Account"
                                : "Create Bank Account"
                            }
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEditMode
                                ? "Update the existing bank account information"
                                : "Create and configure a bank account for your business"
                            }
                        </p>
                    </div>

                </div>

                <div className="
                    hidden items-center gap-2 rounded-lg
                    bg-blue-50 px-3 py-2 sm:flex
                ">
                    <Landmark size={16} className="text-[#408DFB]" />

                    <span className="text-xs font-medium text-[#408DFB]">
                        Bank Account
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

                    {/* ACCOUNT DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Landmark}
                            title="Account Details"
                            description="Enter the basic information for your bank account"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-2
                        ">

                            <FormField label="Account Type" required>
                                <CustomSelect
                                    value={formData.accountType}
                                    onChange={(value) =>
                                        handleChange("accountType", value)
                                    }
                                    options={accountTypeOptions}
                                    placeholder="Select account type"
                                />
                            </FormField>

                            <FormField label="Account Holder Name" required>
                                <TextInput
                                    value={formData.accountName}
                                    onChange={(e) =>
                                        handleChange("accountName", e.target.value)
                                    }
                                    placeholder="Enter account name"
                                    maxLength={150}
                                />
                            </FormField>

                            {/* <FormField label="Account Code" required>
                                <TextInput
                                    value={formData.accountCode}
                                    onChange={(e) =>
                                        handleChange("accountCode", e.target.value)
                                    }
                                    placeholder="Example: BANK-001"
                                    maxLength={50}
                                />
                            </FormField> */}

                            <FormField label="Currency" required>
                                <CustomSelect
                                    value={formData.currency}
                                    onChange={(value) =>
                                        handleChange("currency", value)
                                    }
                                    options={currencyOptions}
                                    placeholder="Select currency"
                                />
                            </FormField>

                            <FormField label="Opening Balance" required>
                                <TextInput
                                    type="number"
                                    value={formData.openingBalance}
                                    onChange={(e) =>
                                        handleChange("openingBalance", e.target.value)
                                    }
                                    placeholder="Enter opening balance"
                                    disabled={isEditMode}
                                />
                                <p className="text-xs text-gray-400">
                                    Initial account balance in the selected currency
                                </p>
                            </FormField>
                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* BANK DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={CreditCard}
                            title="Bank Details"
                            description="Enter your bank account and branch information"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-2
                        ">

                            <FormField label="Account Number" required>
                                <TextInput
                                    value={formData.accountNumber}
                                    onChange={(e) =>
                                        handleChange("accountNumber", e.target.value)
                                    }
                                    placeholder="Enter account number"
                                    maxLength={30}
                                />
                            </FormField>

                            <FormField label="Bank Name" required>
                                <TextInput
                                    value={formData.bankName}
                                    onChange={(e) =>
                                        handleChange("bankName", e.target.value)
                                    }
                                    placeholder="Enter bank name"
                                    maxLength={150}
                                />
                            </FormField>

                            <FormField label="Branch Name" required>
                                <TextInput
                                    value={formData.branchName}
                                    onChange={(e) =>
                                        handleChange("branchName", e.target.value)
                                    }
                                    placeholder="Enter branch name"
                                    maxLength={150}
                                />
                            </FormField>

                            <FormField label="IFSC Code" required>
                                <TextInput
                                    value={formData.ifsc}
                                    onChange={(e) =>
                                        handleChange("ifsc", e.target.value.toUpperCase())
                                    }
                                    placeholder="Example: SBIN0001234"
                                    maxLength={11}
                                />
                            </FormField>

                            <FormField label="SWIFT Code" >
                                <TextInput
                                    value={formData.swiftCode}
                                    onChange={(e) =>
                                        handleChange("swiftCode", e.target.value.toUpperCase())
                                    }
                                    placeholder="Example: HDFCINBBCTS"
                                    maxLength={11}
                                />
                            </FormField>
                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* ADDITIONAL INFORMATION */}

                    <section>

                        <SectionHeading
                            icon={FileText}
                            title="Additional Information"
                            description="Configure account ownership, primary status and description"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2
                        ">

                            <FormField label="Description">
                                <TextAreaField
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleChange("description", e.target.value)
                                    }
                                    placeholder="Enter bank account description"
                                    rows={3}
                                />
                            </FormField>

                            <div className="flex flex-col gap-4">

                                <FormField label="Account Status" required>
                                    <CustomSelect
                                        value={formData.status}
                                        onChange={(value) =>
                                            handleChange("status", value)
                                        }
                                        options={statusOptions}
                                        placeholder="Select account status"
                                    />
                                </FormField>

                                <label className="
                                    flex cursor-pointer items-center gap-2
                                    text-sm font-medium text-gray-700
                                ">
                                    <input
                                        type="checkbox"
                                        checked={formData.primaryAccount}
                                        onChange={(e) =>
                                            handleChange(
                                                "primaryAccount",
                                                e.target.checked
                                            )
                                        }
                                        className="
                                            h-4 w-4 rounded border-gray-300
                                            text-blue-600 focus:ring-blue-500
                                        "
                                    />

                                    Set as primary bank account
                                </label>

                            </div>

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
                                (isEditMode && !isCurrentAccountLoaded)
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

            </form >

            <LeaveConfirmationModal
                show={showLeaveConfirmation}
                title="Leave Bank Account?"
                message="Are you sure you want to leave this bank account page?"
                stayText="Stay Here"
                leaveText="Leave"
                onStay={handleStay}
                onLeave={handleLeave}
            />
        </div >
    );
};

export default BankAccountCreateSimple;