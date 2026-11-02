import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    Wallet,
    Receipt,
    Building2,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    FileText,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createPayment,
} from "../thunks/paymentThunks";

import {
    resetPaymentForm,
} from "../slices/paymentSlice";

import {
    getUserPermission,
} from "../../../../module/menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../../common/custom/CustomSelect";

import {
    fetchAllSalesOrders,
} from "../../saleOrder/thunks/salesOrderThunks";

import {
    fetchAllPurchaseOrders,
} from "../../purchaseOrder/thunks/purchaseOrderThunks";

import {
    fetchAllExpenses,
} from "../../expenses/thunks/expenseThunks";

import {
    fetchAllBankAccounts,
} from "../../../../module/bankAccount/thunks/bankAccountThunks";

import {
    fetchAllCashAccounts,
} from "../../cashAccount/thunks/cashAccountThunks";

/* =========================================================
   DATE HELPER
========================================================= */

const getToday = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60000)
        .toISOString()
        .split("T")[0];
};

/* =========================================================
   REDUX RESPONSE NORMALIZER

   Supports:
   - Array
   - { content: [] }
   - { data: [] }
   - { data: { content: [] } }
   - { data: { data: { content: [] } } }
========================================================= */

const getList = (value) => {

    if (Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value?.content)) {
        return value.content;
    }

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    if (Array.isArray(value?.data?.content)) {
        return value.data.content;
    }

    if (Array.isArray(value?.data?.data)) {
        return value.data.data;
    }

    if (Array.isArray(value?.data?.data?.content)) {
        return value.data.data.content;
    }

    return [];
};

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
    paymentType: "SALES",
    sourceId: "",
    paymentDate: getToday(),

    paymentAmount: "",
    paymentMethod: "BANK_TRANSFER",

    bankAccountId: "",
    cashAccountId: "",

    referenceNumber: "",
    notes: "",
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

const PaymentCreate = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       PAYMENT REDUX STATE
    ===================================================== */

    const paymentState = useSelector(
        (state) => state.payment ?? {}
    );

    const {
        loading = false,
        actionLoading = false,
    } = paymentState;

    /* =====================================================
       SOURCE DOCUMENT REDUX STATE
    ===================================================== */

    const salesOrderState = useSelector(
        (state) => state.salesOrder ?? {}
    );

    const purchaseOrderState = useSelector(
        (state) => state.purchaseOrder ?? {}
    );

    const expenseState = useSelector(
        (state) => state.expense ?? {}
    );

    const bankAccountState = useSelector(
        (state) => state.bankAccount ?? {}
    );

    const cashAccountState = useSelector(
        (state) => state.cashAccount ?? {}
    );

    /* =====================================================
       NORMALIZED DROPDOWN DATA
    ===================================================== */

    const salesOrders = useMemo(
        () => getList(salesOrderState.salesOrders),
        [salesOrderState.salesOrders]
    );

    const purchaseOrders = useMemo(
        () => getList(purchaseOrderState.purchaseOrders),
        [purchaseOrderState.purchaseOrders]
    );

    const expenses = useMemo(
        () => getList(expenseState.expenses),
        [expenseState.expenses]
    );

    const bankAccounts = useMemo(
        () => getList(bankAccountState.bankAccounts),
        [bankAccountState.bankAccounts]
    );

    const cashAccounts = useMemo(
        () => getList(cashAccountState.cashAccounts),
        [cashAccountState.cashAccounts]
    );

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

    const hasRequiredPermission = hasPermission(
        "Payments",
        "CREATE"
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
       FETCH ALL PAYMENT DROPDOWN DATA
    ===================================================== */

    useEffect(() => {

        if (authChecking || !isAuthenticated) {
            return;
        }

        const loadPaymentDropdowns = async () => {

            const results = await Promise.allSettled([

                dispatch(
                    fetchAllSalesOrders({
                        page: 0,
                        size: 100,
                    })
                ).unwrap(),

                dispatch(
                    fetchAllPurchaseOrders({
                        page: 0,
                        size: 100,
                    })
                ).unwrap(),

                dispatch(
                    fetchAllExpenses({
                        page: 0,
                        size: 100,
                    })
                ).unwrap(),

                dispatch(
                    fetchAllBankAccounts()
                ).unwrap(),

                dispatch(
                    fetchAllCashAccounts({
                        page: 0,
                        size: 100,
                        status: "ACTIVE",
                    })
                ).unwrap(),

            ]);

            results.forEach((result, index) => {

                if (result.status === "rejected") {
                    console.error(
                        `Payment dropdown request ${index + 1} failed:`,
                        result.reason
                    );
                }

            });

        };

        loadPaymentDropdowns();

    }, [
        dispatch,
        authChecking,
        isAuthenticated,
    ]);

    /* =====================================================
       PAYMENT TYPE OPTIONS
    ===================================================== */

    const paymentTypeOptions = useMemo(() => [
        {
            label: "Sales",
            value: "SALES",
        },
        {
            label: "Purchase",
            value: "PURCHASE",
        },
        {
            label: "Expense",
            value: "EXPENSE",
        },
    ], []);

    /* =====================================================
       PAYMENT METHOD OPTIONS
    ===================================================== */

    const paymentMethodOptions = useMemo(() => [
        {
            label: "Bank Transfer",
            value: "BANK_TRANSFER",
        },
        {
            label: "UPI",
            value: "UPI",
        },
        {
            label: "Card",
            value: "CARD",
        },
        {
            label: "Cheque",
            value: "CHEQUE",
        },
        {
            label: "Cash",
            value: "CASH",
        },
    ], []);

    /* =====================================================
       SOURCE DOCUMENT LABEL
    ===================================================== */

    const sourceLabel = useMemo(() => {

        switch (formData.paymentType) {

            case "SALES":
                return "Sales Order";

            case "PURCHASE":
                return "Purchase Order";

            case "EXPENSE":
                return "Expense";

            default:
                return "Source Document";
        }

    }, [formData.paymentType]);

    /* =====================================================
       SOURCE DOCUMENT DROPDOWN OPTIONS
    ===================================================== */

    const sourceOptions = useMemo(() => {

        switch (formData.paymentType) {

            case "SALES":

                return salesOrders
                    .filter((order) =>
                        order.salesOrderStatus === "DISPATCHED"
                    )
                    .map((order) => {

                        const customerName =
                            order.customer?.displayName ||
                            order.customer?.name ||
                            order.party?.name ||
                            "Customer";

                        return {
                            label: `${order.orderNo || `SO-${order.id}`} - ${customerName} - ${order.currencyCode || "INR"} ${order.grandTotal ?? 0}`,
                            value: String(order.id),
                        };
                    });

            case "PURCHASE":

                return purchaseOrders.map((order) => {

                    const partyName =
                        order.party?.name ||
                        order.party?.companyName ||
                        order.partyName ||
                        "Party";

                    return {
                        label: `${order.orderNo || `PO-${order.id}`} - ${partyName} - ${order.currencyCode || "INR"} ${order.grandTotal ?? 0}`,
                        value: String(order.id),
                    };
                });

            case "EXPENSE":

                return expenses.map((expense) => ({
                    label: `${expense.expenseNo || `Expense-${expense.id}`} - ${expense.vendorName || expense.description || "Expense"} - ${expense.totalAmount ?? 0}`,
                    value: String(expense.id),
                }));

            default:
                return [];
        }

    }, [
        formData.paymentType,
        salesOrders,
        purchaseOrders,
        expenses,
    ]);

    /* =====================================================
       BANK ACCOUNT DROPDOWN OPTIONS
    ===================================================== */

    const bankAccountOptions = useMemo(() => {

        return bankAccounts
            .filter((account) =>
                String(account.status ?? "").toUpperCase() !== "INACTIVE"
            )
            .map((account) => {

                const accountName =
                    account.accountName ||
                    account.bankName ||
                    `Bank Account ${account.id}`;

                const bankName = account.bankName
                    ? ` - ${account.bankName}`
                    : "";

                const accountNumber = account.accountNumber
                    ? ` - ${account.accountNumber}`
                    : "";

                return {
                    label: `${accountName}${bankName}${accountNumber}`,
                    value: String(account.id),
                };
            });

    }, [bankAccounts]);

    /* =====================================================
       CASH ACCOUNT DROPDOWN OPTIONS
    ===================================================== */

    const cashAccountOptions = useMemo(() => {

        return cashAccounts
            .filter((account) =>
                String(account.status ?? "").toUpperCase() === "ACTIVE"
            )
            .map((account) => ({
                label: `${account.accountName} - ${account.accountCode} (${account.currency})`,
                value: String(account.id),
            }));

    }, [cashAccounts]);

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
       PAYMENT TYPE CHANGE
    ===================================================== */

    const handlePaymentTypeChange = (value) => {

        setFormData((previous) => ({
            ...previous,
            paymentType: value,
            sourceId: "",
            paymentAmount: "",
        }));
    };

    /* =====================================================
       PAYMENT METHOD CHANGE
    ===================================================== */

    const handlePaymentMethodChange = (value) => {

        setFormData((previous) => ({
            ...previous,
            paymentMethod: value,
            bankAccountId: "",
            cashAccountId: "",
        }));
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {

        setFormData({
            ...initialFormData,
            paymentDate: getToday(),
        });

        setSaveMode("close");
        setShowSaveOptions(false);

        dispatch(resetPaymentForm());
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {

        if (!formData.paymentType) {
            toast.error("Payment type is required");
            return false;
        }

        const sourceId = Number(formData.sourceId);

        if (
            !formData.sourceId ||
            !Number.isInteger(sourceId) ||
            sourceId <= 0
        ) {
            toast.error(`Select a valid ${sourceLabel.toLowerCase()}`);
            return false;
        }

        if (!formData.paymentDate) {
            toast.error("Payment date is required");
            return false;
        }

        const amount = Number(formData.paymentAmount);

        if (
            formData.paymentAmount === "" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            toast.error("Enter a valid payment amount");
            return false;
        }

        if (!formData.paymentMethod) {
            toast.error("Payment method is required");
            return false;
        }

        if (formData.paymentMethod === "CASH") {

            const cashAccountId = Number(formData.cashAccountId);

            if (
                !formData.cashAccountId ||
                !Number.isInteger(cashAccountId) ||
                cashAccountId <= 0
            ) {
                toast.error("Select a valid cash account");
                return false;
            }

        } else {

            const bankAccountId = Number(formData.bankAccountId);

            if (
                !formData.bankAccountId ||
                !Number.isInteger(bankAccountId) ||
                bankAccountId <= 0
            ) {
                toast.error("Select a valid bank account");
                return false;
            }
        }

        return true;
    };

    /* =====================================================
       SAVE PAYMENT
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (actionLoading || loading) {
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
            toast.error("You do not have permission to create payments");
            return;
        }

        if (!validateForm()) {
            return;
        }

        const payload = {

            paymentType: formData.paymentType,

            sourceId: Number(formData.sourceId),

            paymentDate: formData.paymentDate,

            paymentAmount: Number(formData.paymentAmount),

            paymentMethod: formData.paymentMethod,

            bankAccountId:
                formData.paymentMethod === "CASH"
                    ? null
                    : Number(formData.bankAccountId),

            cashAccountId:
                formData.paymentMethod === "CASH"
                    ? Number(formData.cashAccountId)
                    : null,

            referenceNumber:
                formData.referenceNumber.trim() || null,

            notes:
                formData.notes.trim() || null,
        };

        try {

            const response = await dispatch(
                createPayment(payload)
            ).unwrap();

            toast.success(
                response?.message ||
                "Payment recorded successfully"
            );

            if (saveMode === "new") {

                setFormData({
                    ...initialFormData,
                    paymentDate: getToday(),
                });

                dispatch(resetPaymentForm());

                setSaveMode("close");

                return;
            }

            dispatch(resetPaymentForm());

            navigate("/inventory/payments");

        } catch (error) {

            console.error("Payment creation error:", error);

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to record payment"
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
                        You do not have permission to create payments.
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
                            Record Payment
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            Record money received or paid for a business transaction
                        </p>
                    </div>

                </div>

                <div className="
                    hidden items-center gap-2 rounded-lg
                    bg-blue-50 px-3 py-2 sm:flex
                ">
                    <Wallet size={16} className="text-[#408DFB]" />

                    <span className="text-xs font-medium text-[#408DFB]">
                        Payment
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

                    {/* PAYMENT DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Receipt}
                            title="Payment Details"
                            description="Enter the source document and basic payment information"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField label="Payment Type" required>

                                <CustomSelect
                                    value={formData.paymentType}
                                    onChange={handlePaymentTypeChange}
                                    options={paymentTypeOptions}
                                    placeholder="Select payment type"
                                />

                            </FormField>

                            <FormField
                                label={sourceLabel}
                                required
                            >

                                <CustomSelect
                                    value={formData.sourceId}
                                    onChange={(value) =>
                                        handleChange("sourceId", value)
                                    }
                                    options={sourceOptions}
                                    placeholder={`Select ${sourceLabel.toLowerCase()}`}
                                />

                            </FormField>

                            <FormField label="Payment Date" required>

                                <TextInput
                                    type="date"
                                    value={formData.paymentDate}
                                    onChange={(e) =>
                                        handleChange(
                                            "paymentDate",
                                            e.target.value
                                        )
                                    }
                                />

                            </FormField>

                            <FormField label="Payment Amount" required>

                                <TextInput
                                    type="number"
                                    value={formData.paymentAmount}
                                    onChange={(e) =>
                                        handleChange(
                                            "paymentAmount",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter payment amount"
                                    min="0.01"
                                    step="0.01"
                                />

                            </FormField>

                            <FormField label="Payment Method" required>

                                <CustomSelect
                                    value={formData.paymentMethod}
                                    onChange={handlePaymentMethodChange}
                                    options={paymentMethodOptions}
                                    placeholder="Select payment method"
                                />

                            </FormField>

                        </div>

                        {sourceOptions.length === 0 && (
                            <p className="mt-3 text-xs text-amber-600">
                                No {sourceLabel.toLowerCase()} records are available for selection.
                            </p>
                        )}

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* PAYMENT ACCOUNT */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Building2}
                            title="Payment Account"
                            description="Select the bank or cash account used for this transaction"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            {formData.paymentMethod !== "CASH" ? (

                                <FormField
                                    label="Bank Account"
                                    required
                                >

                                    <CustomSelect
                                        value={formData.bankAccountId}
                                        onChange={(value) =>
                                            handleChange(
                                                "bankAccountId",
                                                value
                                            )
                                        }
                                        options={bankAccountOptions}
                                        placeholder="Select bank account"
                                    />

                                </FormField>

                            ) : (

                                <FormField
                                    label="Cash Account"
                                    required
                                >

                                    <CustomSelect
                                        value={formData.cashAccountId}
                                        onChange={(value) =>
                                            handleChange(
                                                "cashAccountId",
                                                value
                                            )
                                        }
                                        options={cashAccountOptions}
                                        placeholder="Select cash account"
                                    />

                                </FormField>

                            )}

                        </div>

                        <p className="mt-4 text-xs text-gray-400">
                            {formData.paymentMethod === "CASH"
                                ? "The selected cash account will be used for this payment."
                                : "The selected bank account will be used for this payment."
                            }
                        </p>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* ADDITIONAL INFORMATION */}

                    <section>

                        <SectionHeading
                            icon={FileText}
                            title="Additional Information"
                            description="Add transaction reference and payment notes"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2
                        ">

                            <FormField label="Reference Number">

                                <TextInput
                                    value={formData.referenceNumber}
                                    onChange={(e) =>
                                        handleChange(
                                            "referenceNumber",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter transaction reference number"
                                    maxLength={100}
                                />

                            </FormField>

                            <FormField label="Notes">

                                <TextAreaField
                                    value={formData.notes}
                                    onChange={(e) =>
                                        handleChange(
                                            "notes",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter payment notes"
                                    rows={3}
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
                        onClick={() => navigate(-1)}
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
                            disabled={actionLoading || loading}
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
                                : "Save"
                            }

                        </button>

                        <div className="relative">

                            <button
                                type="button"
                                disabled={actionLoading || loading}
                                onClick={() =>
                                    setShowSaveOptions((previous) => !previous)
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

                    </div>

                </div>

            </form>

        </div>
    );
};

export default PaymentCreate;