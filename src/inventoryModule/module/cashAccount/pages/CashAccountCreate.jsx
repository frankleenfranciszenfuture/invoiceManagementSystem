import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Wallet,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    FileText,
    Coins,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createCashAccount,
    fetchCashAccountById,
    updateCashAccount,
} from "../thunks/cashAccountThunks";

import {
    resetCashAccountForm,
} from "../slices/cashAccountSlice";

import {
    getUserPermission,
} from "../../../../module/menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../../common/custom/CustomSelect";



import LeaveConfirmationModal from "../../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../../../../common/confirmation/useLeaveConfirmation";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
    accountName: "",
    accountCode: "",
    currency: "INR",
    openingBalance: "",
    description: "",
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
        <label
            className={`text-sm font-medium ${required ? "text-red-400" : "text-gray-500"
                }`}
        >
            {label}

            {required && (
                <span className="ml-1 text-red-400">*</span>
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
    step,
    min,
}) => (
    <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        step={step}
        min={min}
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
            w-full h-[50px] resize-none rounded-lg border border-gray-200
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

const CashAccountCreate = ({ onClose }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const isEditMode = Boolean(id);

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const cashAccountState = useSelector(
        (state) => state.cashAccount ?? {}
    );

    const {
        cashAccount,
        actionLoading = false,
        loading = false,
    } = cashAccountState;

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
        "Cash Accounts",
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
       FETCH CASH ACCOUNT FOR EDIT
    ===================================================== */

    useEffect(() => {

        if (!id || !isAuthenticated) {
            return;
        }

        dispatch(fetchCashAccountById(id));

    }, [dispatch, id, isAuthenticated]);

    /* =====================================================
       POPULATE EDIT FORM
    ===================================================== */

    const isCurrentAccountLoaded =
        isEditMode &&
        cashAccount?.id != null &&
        String(cashAccount.id) === String(id);

    useEffect(() => {

        if (!isCurrentAccountLoaded) {
            return;
        }

        setFormData({
            accountName: cashAccount.accountName ?? "",
            accountCode: cashAccount.accountCode ?? "",
            currency: cashAccount.currency ?? "INR",
            openingBalance: cashAccount.openingBalance ?? "",
            description: cashAccount.description ?? "",
            status: cashAccount.status ?? "ACTIVE",
        });

    }, [
        isCurrentAccountLoaded,
        cashAccount,
    ]);

    /* =====================================================
       CURRENCY OPTIONS
    ===================================================== */

    const currencyOptions = useMemo(() => [
        {
            label: "Indian Rupee (INR)",
            value: "INR",
        },
        {
            label: "US Dollar (USD)",
            value: "USD",
        },
        {
            label: "Euro (EUR)",
            value: "EUR",
        },
        {
            label: "British Pound (GBP)",
            value: "GBP",
        },
        {
            label: "United Arab Emirates Dirham (AED)",
            value: "AED",
        },
        {
            label: "Saudi Riyal (SAR)",
            value: "SAR",
        },
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

    const handleClose = () => {
        confirmLeave(() => {
            if (onClose) {
                onClose();
            } else {
                navigate("/settings/cash-accounts")
            }
        });
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
                accountName: cashAccount.accountName ?? "",
                accountCode: cashAccount.accountCode ?? "",
                currency: cashAccount.currency ?? "INR",
                openingBalance: cashAccount.openingBalance ?? "",
                description: cashAccount.description ?? "",
                status: cashAccount.status ?? "ACTIVE",
            });

        } else {

            setFormData({
                ...initialFormData,
            });
        }

        setSaveMode("close");
        setShowSaveOptions(false);

        dispatch(resetCashAccountForm());
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {

        if (!formData.accountName.trim()) {
            toast.error("Account name is required");
            return false;
        }


        if (!formData.currency) {
            toast.error("Currency is required");
            return false;
        }

        const openingBalance = Number(formData.openingBalance);

        if (
            formData.openingBalance === "" ||
            !Number.isFinite(openingBalance) ||
            openingBalance < 0
        ) {
            toast.error("Enter a valid opening balance");
            return false;
        }

        if (!formData.status) {
            toast.error("Account status is required");
            return false;
        }

        return true;
    };

    /* =====================================================
       SAVE CASH ACCOUNT
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (actionLoading || loading) {
            return;
        }

        if (isEditMode && !isCurrentAccountLoaded) {
            toast.error("Cash account details are still loading");
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
                `You do not have permission to ${isEditMode ? "edit" : "create"} cash accounts`
            );
            return;
        }

        if (!validateForm()) {
            return;
        }

        const payload = {
            accountName: formData.accountName.trim(),
            accountCode: formData.accountCode.trim().toUpperCase(),
            currency: formData.currency,
            openingBalance: Number(formData.openingBalance),
            description: formData.description.trim() || null,
            status: formData.status,
        };

        try {

            const response = isEditMode
                ? await dispatch(
                    updateCashAccount({
                        id,
                        data: payload,
                    })
                ).unwrap()
                : await dispatch(
                    createCashAccount(payload)
                ).unwrap();

            toast.success(
                response?.message ||
                `Cash account ${isEditMode ? "updated" : "created"} successfully`
            );

            if (!isEditMode && saveMode === "new") {

                setFormData({
                    ...initialFormData,
                });

                dispatch(resetCashAccountForm());

                setSaveMode("close");

                return;
            }

            dispatch(resetCashAccountForm());

            navigate("/settings/cash-accounts");

        } catch (error) {

            console.error(
                `Cash account ${isEditMode ? "update" : "creation"} error:`,
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    `Failed to ${isEditMode ? "update" : "create"} cash account`
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
            <div className="
                flex h-full items-center justify-center bg-gray-50
            ">
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
            <div className="
                flex h-full items-center justify-center bg-gray-50
            ">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading cash account...
                </div>
            </div>
        );
    }

    if (
        !hasFullAccess &&
        (permissionLoading || !permissionsLoaded)
    ) {

        return (
            <div className="
                flex h-full items-center justify-center bg-gray-50
            ">
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
                        items-center justify-center
                        rounded-full bg-red-50
                        text-lg font-semibold text-red-500
                    ">
                        !
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        You do not have permission to{" "}
                        {isEditMode ? "edit" : "create"} cash accounts.
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
                                ? "Edit Cash Account"
                                : "Create Cash Account"
                            }
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEditMode
                                ? "Update the existing cash account information"
                                : "Create and configure a cash account for your business"
                            }
                        </p>
                    </div>

                </div>

                <div className="
                    hidden items-center gap-2 rounded-lg
                    bg-blue-50 px-3 py-2 sm:flex
                ">
                    <Wallet size={16} className="text-[#408DFB]" />

                    <span className="text-xs font-medium text-[#408DFB]">
                        Cash Account
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
                            icon={Wallet}
                            title="Account Details"
                            description="Enter the basic information for your cash account"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-2
                        ">

                            {/* <FormField label="Account Code">

                                <TextInput
                                    value={formData.accountCode}
                                    onChange={(e) =>
                                        handleChange(
                                            "accountCode",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Auto generated"
                                    disabled={!isEditMode}
                                    maxLength={50}
                                />

                            </FormField> */}

                            <FormField label="Account Name" required>
                                <TextInput
                                    value={formData.accountName}
                                    onChange={(e) =>
                                        handleChange(
                                            "accountName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter account name"
                                    maxLength={150}
                                />
                            </FormField>



                            {/* <FormField label="Account Code" required>
                                <TextInput
                                    value={formData.accountCode}
                                    onChange={(e) =>
                                        handleChange(
                                            "accountCode",
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    placeholder="Example: CASH-001"
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

                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* BALANCE DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Coins}
                            title="Balance Details"
                            description="Set the initial balance for this cash account"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-2
                        ">

                            <FormField label="Opening Balance" required>
                                <TextInput
                                    type="number"
                                    value={formData.openingBalance}
                                    onChange={(e) =>
                                        handleChange(
                                            "openingBalance",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter opening balance"
                                    min="0"
                                    step="0.01"
                                />
                            </FormField>

                            <FormField label="Current Balance">
                                <TextInput
                                    value={
                                        isEditMode
                                            ? Number(
                                                cashAccount?.currentBalance ?? 0
                                            ).toFixed(2)
                                            : formData.openingBalance === ""
                                                ? "0.00"
                                                : Number(
                                                    formData.openingBalance
                                                ).toFixed(2)
                                    }
                                    disabled
                                    placeholder="Current balance"
                                />

                                <p className="text-xs text-gray-400">
                                    {isEditMode
                                        ? "Current balance reflects the account's existing transactions."
                                        : "Initially matches the opening balance."
                                    }
                                </p>
                            </FormField>

                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* ADDITIONAL INFORMATION */}

                    <section>

                        <SectionHeading
                            icon={FileText}
                            title="Additional Information"
                            description="Add account description and status"
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
                                    placeholder="Enter cash account description"
                                    rows={3}
                                />
                            </FormField>

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
                        disabled={actionLoading || loading}
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
                            disabled={actionLoading || loading}
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
                                actionLoading ||
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
                                    disabled={actionLoading || loading}
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
                title="Leave CashAccount?"
                message="Are you sure you want to leave this expense page?"
                stayText="Stay Here"
                leaveText="Leave"
                onStay={handleStay}
                onLeave={handleLeave}
            />
        </div>
    );
};

export default CashAccountCreate;