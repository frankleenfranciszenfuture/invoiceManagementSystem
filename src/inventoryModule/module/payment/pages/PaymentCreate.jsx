
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
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    FileText,
    Plus,
    Trash2,
    IndianRupee,
    CircleDollarSign,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createPayment,
    fetchPaymentsBySource,
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
    fetchInvoices,
} from "../../../../module/invoices/thunks/invoiceThunks";

import {
    fetchAllCashAccounts,
} from "../../cashAccount/thunks/cashAccountThunks";
import useLeaveConfirmation from "../../../../common/confirmation/useLeaveConfirmation";
import LeaveConfirmationModal from "../../../../common/confirmation/LeaveConfirmationModal";

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
   PAYMENT RESPONSE NORMALIZER
========================================================= */

const getPaymentList = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.content)) {
        return response.data.content;
    }

    if (Array.isArray(response?.content)) {
        return response.content;
    }

    if (Array.isArray(response?.data?.data)) {
        return response.data.data;
    }

    return [];
};

/* =========================================================
   PAYMENT STATUS
========================================================= */

const isCompletedPayment = (payment) => {
    const status = String(
        payment?.paymentStatus ||
        payment?.status ||
        ""
    ).toUpperCase();

    return status === "COMPLETED";
};

/* =========================================================
   GET PAYMENT AMOUNT
========================================================= */

const getPaymentAmount = (payment) => {
    const amount = Number(
        payment?.paymentAmount ??
        payment?.amount ??
        0
    );

    return Number.isFinite(amount) && amount > 0
        ? amount
        : 0;
};

/* =========================================================
   CALCULATE PAID AMOUNT

   Supports:
   1. Normal payment records
   2. Split payment allocation records
   3. Parent records containing allocations

   Do not count parent and allocation amounts together.
========================================================= */

const calculatePaidAmount = (response) => {
    const payments = getPaymentList(response);

    return payments.reduce((total, payment) => {
        if (!isCompletedPayment(payment)) {
            return total;
        }

        const allocations =
            payment?.allocations ||
            payment?.paymentAllocations ||
            [];

        if (Array.isArray(allocations) && allocations.length > 0) {
            const allocationTotal = allocations.reduce(
                (allocationSum, allocation) => {
                    if (!isCompletedPayment(allocation)) {
                        return allocationSum;
                    }

                    return allocationSum + getPaymentAmount(allocation);
                },
                0
            );

            return total + allocationTotal;
        }

        return total + getPaymentAmount(payment);
    }, 0);
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
   INITIAL SPLIT ALLOCATION
========================================================= */

const createEmptyAllocation = () => ({
    paymentAmount: "",
    paymentMethod: "BANK_TRANSFER",
    bankAccountId: "",
    cashAccountId: "",
});

/* =========================================================
   FORMAT AMOUNT
========================================================= */

const formatAmount = (amount, currencyCode = "INR") => {
    const numericAmount = Number(amount || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currencyCode || "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(
        Number.isFinite(numericAmount) ? numericAmount : 0
    );
};


/* =========================================================
   SOURCE DOCUMENT EXCHANGE RATE

   Exchange rate means:
   1 unit of source currency = X INR

   Prefer the API exchange rate.
   If unavailable, calculate it using base amount / source amount.
========================================================= */

const getSourceExchangeRate = (source, paymentType) => {
    if (!source) return null;

    const currencyCode = String(
        source.currencyCode || "INR"
    ).toUpperCase();

    if (currencyCode === "INR") {
        return 1;
    }

    const directRate = Number(
        source.exchangeRate ??
        source.exchangeRateToBase ??
        source.conversionRate ??
        0
    );

    if (Number.isFinite(directRate) && directRate > 0) {
        return directRate;
    }

    let sourceAmount = 0;
    let baseAmount = 0;

    if (paymentType === "EXPENSE") {
        sourceAmount = Number(source.totalAmount || 0);
        baseAmount = Number(source.baseTotalAmount || 0);
    } else {
        sourceAmount = Number(source.grandTotal || 0);
        baseAmount = Number(source.baseGrandTotal || 0);
    }

    if (
        sourceAmount > 0 &&
        baseAmount > 0
    ) {
        return baseAmount / sourceAmount;
    }

    return null;
};

/* =========================================================
   PAYMENT AMOUNT INR PREVIEW
========================================================= */

const PaymentAmountInrHint = ({
    amount,
    currencyCode,
    exchangeRate,
}) => {
    const numericAmount = Number(amount);

    const code = String(currencyCode || "INR").toUpperCase();

    if (
        code === "INR" ||
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0 ||
        !exchangeRate ||
        exchangeRate <= 0
    ) {
        return null;
    }

    const inrAmount = numericAmount * exchangeRate;

    return (
        <div className="mt-1.5 space-y-0.5">
            <p className="text-xs font-medium text-emerald-600">
                ≈ {formatAmount(inrAmount, "INR")} INR
            </p>

            <p className="text-[11px] text-gray-400">
                Exchange rate: 1 {code} ={" "}
                {formatAmount(exchangeRate, "INR")}
            </p>
        </div>
    );
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
   SOURCE PAYMENT SUMMARY
========================================================= */

const SourcePaymentSummary = ({
    source,
    paymentType,
    paymentLoading,
    paidAmount,
    exchangeRate,
}) => {
    if (!source) {
        return null;
    }

    const isExpense = paymentType === "EXPENSE";

    const currencyCode = source.currencyCode || "INR";

    const totalAmount = Number(
        isExpense
            ? source.totalAmount || 0
            : source.grandTotal || 0
    );

    const actualPaidAmount = isExpense
        ? Number(source.paidAmount || 0)
        : Number(paidAmount || 0);

    const remainingAmount = isExpense
        ? Number(source.dueAmount || 0)
        : Math.max(0, totalAmount - actualPaidAmount);

    const summaryItems = [
        {
            label: "Total Amount",
            amount: totalAmount,
            color: "text-gray-800",
            background: "bg-gray-50",
        },
        {
            label: "Paid Amount",
            amount: actualPaidAmount,
            color: "text-emerald-600",
            background: "bg-emerald-50",
        },
        {
            label: "Remaining Amount",
            amount: remainingAmount,
            color: remainingAmount <= 0
                ? "text-emerald-600"
                : "text-orange-600",
            background: remainingAmount <= 0
                ? "bg-emerald-50"
                : "bg-orange-50",
        },
    ];

    return (
        <div className="
            mt-5 overflow-hidden rounded-xl
            border border-blue-100 bg-white
        ">
            <div className="
                flex flex-wrap items-center
                justify-between gap-2
                border-b border-gray-100
                px-4 py-3
            ">
                <div className="flex items-center gap-2">
                    <div className="
                        flex h-8 w-8 items-center
                        justify-center rounded-lg
                        bg-blue-50 text-[#408DFB]
                    ">
                        <IndianRupee size={16} />
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-800">
                            Source Payment Summary
                        </h4>

                        <p className="text-xs text-gray-400">
                            {
                                source.orderNo ||
                                source.expenseNo ||
                                source.invoiceNumber ||
                                "Selected document"
                            }
                        </p>
                    </div>
                </div>

                {paymentLoading && (
                    <div className="
                        flex items-center gap-2
                        text-xs text-gray-400
                    ">
                        <Loader2
                            size={14}
                            className="animate-spin"
                        />
                        Updating paid amount...
                    </div>
                )}
            </div>

            <div className="
                grid grid-cols-1 gap-3 p-4
                sm:grid-cols-3
            ">
                {summaryItems.map((item) => (
                    <div
                        key={item.label}
                        className={`
                            rounded-lg p-3
                            ${item.background}
                        `}
                    >
                        <p className="text-xs text-gray-500">
                            {item.label}
                        </p>

                        <p className={`
    mt-2 text-base font-semibold
    ${item.color}
`}>
                            {formatAmount(
                                item.amount,
                                currencyCode
                            )}
                        </p>

                        <PaymentAmountInrHint
                            amount={item.amount}
                            currencyCode={currencyCode}
                            exchangeRate={exchangeRate}
                        />
                    </div>
                ))}
            </div>

            {!isExpense && (
                <p className="
                    border-t border-gray-100
                    px-4 py-2 text-[11px]
                    text-gray-400
                ">
                    Paid amount is calculated from completed payment records.
                </p>
            )}
        </div>
    );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const PaymentCreate = ({ onClose }) => {
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

    const invoiceState = useSelector(
        (state) => state.invoice ?? {}
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

    const invoices = useMemo(
        () => getList(invoiceState.invoices),
        [invoiceState.invoices]
    );

    const bankAccounts = useMemo(
        () => getList(bankAccountState.bankAccounts),
        [bankAccountState.bankAccounts]
    );

    const cashAccounts = useMemo(
        () => getList(cashAccountState.cashAccounts),
        [cashAccountState.cashAccounts]
    );

    const {
        showLeaveConfirmation,
        confirmLeave,
        handleStay,
        handleLeave,
    } = useLeaveConfirmation();


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

    const [isSplitPayment, setIsSplitPayment] = useState(false);

    const [allocations, setAllocations] = useState([
        createEmptyAllocation(),
        createEmptyAllocation(),
    ]);

    const [saveMode, setSaveMode] = useState("close");

    const [showSaveOptions, setShowSaveOptions] = useState(false);

    /* =====================================================
       SELECTED SOURCE PAYMENT DATA
    ===================================================== */

    const [sourcePayments, setSourcePayments] = useState([]);

    const [sourcePaymentLoading, setSourcePaymentLoading] =
        useState(false);

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
                    fetchInvoices({
                        page: 0,
                        size: 100,
                    })
                ).unwrap(),

                dispatch(fetchAllBankAccounts()).unwrap(),

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
        {
            label: "Invoice",
            value: "INVOICE",
        },
    ], []);

    /* =====================================================
       PAYMENT METHOD OPTIONS
    ===================================================== */

    const getPaymentMethodOptions = (paymentType) => {
        const options = [
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
        ];

        if (
            paymentType === "SALES" ||
            paymentType === "PURCHASE"
        ) {
            options.push({
                label: "Party Credit",
                value: "PARTY_CREDIT",
            });
        }

        return options;
    };

    const paymentMethodOptions = useMemo(
        () => getPaymentMethodOptions(formData.paymentType),
        [formData.paymentType]
    );

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

            case "INVOICE":
                return "Invoice";

            default:
                return "Source Document";
        }
    }, [formData.paymentType]);

    /* =====================================================
       SOURCE DOCUMENT DROPDOWN OPTIONS
       NO STATUS FILTERING
    ===================================================== */

    const sourceOptions = useMemo(() => {
        switch (formData.paymentType) {
            case "SALES":
                return salesOrders.map((order) => {
                    const customerName =
                        order.customer?.displayName ||
                        order.customer?.name ||
                        order.party?.companyName ||
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
                        order.party?.companyName ||
                        order.party?.name ||
                        order.supplier?.companyName ||
                        order.supplier?.name ||
                        order.partyName ||
                        "Party";

                    return {
                        label: `${order.orderNo || `PO-${order.id}`} - ${partyName} - ${order.currencyCode || "INR"} ${order.grandTotal ?? 0}`,
                        value: String(order.id),
                    };
                });

            case "EXPENSE":
                return expenses.map((expense) => ({
                    label: `${expense.expenseNo || `Expense-${expense.id}`} - ${expense.vendorName || expense.description || "Expense"} - ${expense.currencyCode || "INR"} ${expense.totalAmount ?? 0}`,
                    value: String(expense.id),
                }));


            case "INVOICE":
                return invoices
                    .filter((invoice) =>
                        ["APPROVED", "SENT", "PARTIAL", "OVERDUE"].includes(
                            String(invoice.status || invoice.invoiceStatus || "")
                                .toUpperCase()
                        )
                    )
                    .map((invoice) => ({
                        label: `${invoice.invoiceNumber || `INV-${invoice.id}`} - ${invoice.customer?.displayName ||
                            invoice.customer?.name ||
                            invoice.party?.companyName ||
                            invoice.party?.name ||
                            "Customer"
                            } - ${invoice.currencyCode || "INR"} ${invoice.grandTotal ?? 0}`,
                        value: String(invoice.id),
                    }));

            default:
                return [];
        }
    }, [
        formData.paymentType,
        salesOrders,
        purchaseOrders,
        expenses,
        invoices,
    ]);

    /* =====================================================
       SELECTED SOURCE DOCUMENT
    ===================================================== */

    const selectedSource = useMemo(() => {
        if (!formData.sourceId) {
            return null;
        }

        let sourceList = [];

        switch (formData.paymentType) {
            case "SALES":
                sourceList = salesOrders;
                break;

            case "PURCHASE":
                sourceList = purchaseOrders;
                break;

            case "EXPENSE":
                sourceList = expenses;
                break;

            case "INVOICE":
                sourceList = invoices;
                break;

            default:
                sourceList = [];
        }

        return sourceList.find(
            (item) => String(item.id) === String(formData.sourceId)
        ) || null;
    }, [
        formData.paymentType,
        formData.sourceId,
        salesOrders,
        purchaseOrders,
        expenses,
        invoices,
    ]);


    /* =========================================================
   SELECTED SOURCE EXCHANGE RATE
========================================================= */

    const sourceExchangeRate = useMemo(
        () => getSourceExchangeRate(
            selectedSource,
            formData.paymentType
        ),
        [
            selectedSource,
            formData.paymentType,
        ]
    );

    const sourceCurrencyCode = (
        selectedSource?.currencyCode || "INR"
    ).toUpperCase();

    /* =====================================================
       FETCH SELECTED SOURCE PAYMENTS

       Sales and Purchase use completed payment records.
       Expense summary comes directly from its API fields.
    ===================================================== */

    useEffect(() => {
        let cancelled = false;

        const loadSourcePayments = async () => {
            setSourcePayments([]);

            if (
                !formData.sourceId ||
                !selectedSource ||
                formData.paymentType === "EXPENSE"
            ) {
                setSourcePaymentLoading(false);
                return;
            }

            setSourcePaymentLoading(true);

            try {
                const response = await dispatch(
                    fetchPaymentsBySource({
                        paymentType: formData.paymentType,
                        sourceId: Number(formData.sourceId),
                    })
                ).unwrap();

                if (!cancelled) {
                    setSourcePayments(getPaymentList(response));
                }
            } catch (error) {
                if (!cancelled) {
                    setSourcePayments([]);

                    toast.error(
                        typeof error === "string"
                            ? error
                            : "Unable to load source payment history"
                    );
                }
            } finally {
                if (!cancelled) {
                    setSourcePaymentLoading(false);
                }
            }
        };

        loadSourcePayments();

        return () => {
            cancelled = true;
        };
    }, [
        dispatch,
        formData.paymentType,
        formData.sourceId,
        selectedSource,
    ]);

    /* =====================================================
       SELECTED SOURCE PAID AMOUNT
    ===================================================== */

    const sourcePaidAmount = useMemo(
        () => calculatePaidAmount(sourcePayments),
        [sourcePayments]
    );

    /* =====================================================
       SELECTED PARTY ID
    ===================================================== */

    const selectedPartyId = useMemo(() => {
        if (!selectedSource) {
            return null;
        }

        if (formData.paymentType === "SALES") {
            return (
                selectedSource.customer?.id ||
                selectedSource.party?.id ||
                selectedSource.customerId ||
                selectedSource.partyId ||
                selectedSource.customerParty?.id ||
                null
            );
        }

        if (formData.paymentType === "PURCHASE") {
            return (
                selectedSource.party?.id ||
                selectedSource.supplier?.id ||
                selectedSource.partyId ||
                selectedSource.supplierId ||
                selectedSource.supplierParty?.id ||
                null
            );
        }

        return null;
    }, [
        selectedSource,
        formData.paymentType,
    ]);

    const isPartyCredit =
        formData.paymentMethod === "PARTY_CREDIT";

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
       SPLIT PAYMENT TOTAL
    ===================================================== */

    const splitTotal = useMemo(() => {
        return allocations.reduce((total, allocation) => {
            const amount = Number(allocation.paymentAmount);

            return total + (
                Number.isFinite(amount) && amount > 0
                    ? amount
                    : 0
            );
        }, 0);
    }, [allocations]);

    /* =====================================================
       FIELD CHANGE
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
                navigate("/invoice/payments");
            }
        })
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

            paymentMethod:
                ["EXPENSE", "INVOICE"].includes(value) &&
                    previous.paymentMethod === "PARTY_CREDIT"
                    ? "BANK_TRANSFER"
                    : previous.paymentMethod,

            bankAccountId: "",
            cashAccountId: "",
        }));

        setSourcePayments([]);

        setAllocations((previous) =>
            previous.map((allocation) => ({
                ...allocation,
                paymentMethod:
                    ["EXPENSE", "INVOICE"].includes(value) &&
                        allocation.paymentMethod === "PARTY_CREDIT"
                        ? "BANK_TRANSFER"
                        : allocation.paymentMethod,
                bankAccountId: "",
                cashAccountId: "",
            }))
        );
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
       SPLIT ALLOCATION HANDLERS
    ===================================================== */

    const handleAllocationChange = (index, field, value) => {
        setAllocations((previous) =>
            previous.map((allocation, allocationIndex) => {
                if (allocationIndex !== index) {
                    return allocation;
                }

                return {
                    ...allocation,
                    [field]: value,
                };
            })
        );
    };

    const handleAllocationMethodChange = (index, value) => {
        setAllocations((previous) =>
            previous.map((allocation, allocationIndex) => {
                if (allocationIndex !== index) {
                    return allocation;
                }

                return {
                    ...allocation,
                    paymentMethod: value,
                    bankAccountId: "",
                    cashAccountId: "",
                };
            })
        );
    };

    const handleAddAllocation = () => {
        setAllocations((previous) => [
            ...previous,
            createEmptyAllocation(),
        ]);
    };

    const handleRemoveAllocation = (index) => {
        if (allocations.length <= 2) {
            toast.error("Split payment requires at least two allocations");
            return;
        }

        setAllocations((previous) =>
            previous.filter((_, allocationIndex) => allocationIndex !== index)
        );
    };

    /* =====================================================
       SPLIT MODE CHANGE
    ===================================================== */

    const handleSplitModeChange = (enabled) => {
        setIsSplitPayment(enabled);

        setAllocations([
            createEmptyAllocation(),
            createEmptyAllocation(),
        ]);
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {
        setFormData({
            ...initialFormData,
            paymentDate: getToday(),
        });

        setIsSplitPayment(false);

        setAllocations([
            createEmptyAllocation(),
            createEmptyAllocation(),
        ]);

        setSourcePayments([]);

        setSaveMode("close");
        setShowSaveOptions(false);

        dispatch(resetPaymentForm());
    };

    /* =====================================================
       VALIDATE NORMAL PAYMENT
    ===================================================== */

    const validateNormalPayment = () => {
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

        if (isPartyCredit) {
            if (
                formData.paymentType !== "SALES" &&
                formData.paymentType !== "PURCHASE"
            ) {
                toast.error(
                    "Party Credit is available only for Sales and Purchase"
                );
                return false;
            }

            const partyId = Number(selectedPartyId);

            if (
                !selectedPartyId ||
                !Number.isInteger(partyId) ||
                partyId <= 0
            ) {
                toast.error(
                    "The selected order does not contain a valid party"
                );
                return false;
            }

            return true;
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
       VALIDATE SPLIT PAYMENT
    ===================================================== */

    const validateSplitPayment = () => {
        if (!Array.isArray(allocations) || allocations.length < 2) {
            toast.error("Add at least two payment allocations");
            return false;
        }

        let total = 0;

        for (let index = 0; index < allocations.length; index++) {
            const allocation = allocations[index];

            const amount = Number(allocation.paymentAmount);

            if (
                allocation.paymentAmount === "" ||
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                toast.error(
                    `Enter a valid amount for allocation ${index + 1}`
                );
                return false;
            }

            total += amount;

            if (!allocation.paymentMethod) {
                toast.error(
                    `Select payment method for allocation ${index + 1}`
                );
                return false;
            }

            if (
                allocation.paymentMethod === "PARTY_CREDIT" &&
                formData.paymentType === "EXPENSE"
            ) {
                toast.error(
                    "Party Credit is not available for expenses"
                );
                return false;
            }

            if (allocation.paymentMethod === "CASH") {
                const cashAccountId = Number(
                    allocation.cashAccountId
                );

                if (
                    !allocation.cashAccountId ||
                    !Number.isInteger(cashAccountId) ||
                    cashAccountId <= 0
                ) {
                    toast.error(
                        `Select a cash account for allocation ${index + 1}`
                    );
                    return false;
                }

                if (allocation.bankAccountId) {
                    toast.error(
                        `Remove the bank account from allocation ${index + 1}`
                    );
                    return false;
                }
            } else if (
                allocation.paymentMethod !== "PARTY_CREDIT"
            ) {
                const bankAccountId = Number(
                    allocation.bankAccountId
                );

                if (
                    !allocation.bankAccountId ||
                    !Number.isInteger(bankAccountId) ||
                    bankAccountId <= 0
                ) {
                    toast.error(
                        `Select a bank account for allocation ${index + 1}`
                    );
                    return false;
                }

                if (allocation.cashAccountId) {
                    toast.error(
                        `Remove the cash account from allocation ${index + 1}`
                    );
                    return false;
                }
            } else if (
                allocation.bankAccountId ||
                allocation.cashAccountId
            ) {
                toast.error(
                    `Party Credit allocation ${index + 1} must not contain a bank or cash account`
                );
                return false;
            }
        }

        if (!Number.isFinite(total) || total <= 0) {
            toast.error("Enter a valid total split payment amount");
            return false;
        }

        return true;
    };

    /* =====================================================
       COMMON VALIDATION
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

        if (!selectedSource) {
            toast.error("Selected source document was not found");
            return false;
        }

        if (!formData.paymentDate) {
            toast.error("Payment date is required");
            return false;
        }

        if (isSplitPayment) {
            return validateSplitPayment();
        }

        return validateNormalPayment();
    };

    /* =====================================================
       BUILD SPLIT ALLOCATIONS
    ===================================================== */

    const buildAllocationsPayload = () => {
        return allocations.map((allocation) => ({
            paymentAmount: Number(allocation.paymentAmount),

            paymentMethod: allocation.paymentMethod,

            bankAccountId:
                allocation.paymentMethod === "PARTY_CREDIT" ||
                    allocation.paymentMethod === "CASH"
                    ? null
                    : Number(allocation.bankAccountId),

            cashAccountId:
                allocation.paymentMethod === "CASH"
                    ? Number(allocation.cashAccountId)
                    : null,
        }));
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

        const commonPayload = {
            paymentType: formData.paymentType,
            sourceId: Number(formData.sourceId),
            paymentDate: formData.paymentDate,

            referenceNumber:
                formData.referenceNumber.trim() || null,

            notes:
                formData.notes.trim() || null,
        };

        const payload = isSplitPayment
            ? {
                ...commonPayload,
                allocations: buildAllocationsPayload(),
            }
            : {
                ...commonPayload,

                ...(isPartyCredit && {
                    partyId: Number(selectedPartyId),
                }),

                paymentAmount: Number(formData.paymentAmount),

                paymentMethod: formData.paymentMethod,

                bankAccountId: isPartyCredit
                    ? null
                    : formData.paymentMethod === "CASH"
                        ? null
                        : Number(formData.bankAccountId),

                cashAccountId: isPartyCredit
                    ? null
                    : formData.paymentMethod === "CASH"
                        ? Number(formData.cashAccountId)
                        : null,
            };

        try {
            const response = await dispatch(
                createPayment(payload)
            ).unwrap();

            toast.success(
                response?.message ||
                (
                    isSplitPayment
                        ? "Split payment recorded successfully"
                        : "Payment recorded successfully"
                )
            );

            if (saveMode === "new") {
                setFormData({
                    ...initialFormData,
                    paymentDate: getToday(),
                });

                setIsSplitPayment(false);

                setAllocations([
                    createEmptyAllocation(),
                    createEmptyAllocation(),
                ]);

                setSourcePayments([]);

                dispatch(resetPaymentForm());

                setSaveMode("close");

                return;
            }

            dispatch(resetPaymentForm());

            navigate("/invoice/payments");
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

                        </div>

                        {sourceOptions.length === 0 && (
                            <p className="mt-3 text-xs text-amber-600">
                                No {sourceLabel.toLowerCase()} records are available for selection.
                            </p>
                        )}

                        {/* SOURCE PAYMENT SUMMARY */}

                        <SourcePaymentSummary
                            source={selectedSource}
                            paymentType={formData.paymentType}
                            paymentLoading={sourcePaymentLoading}
                            paidAmount={sourcePaidAmount}
                            exchangeRate={sourceExchangeRate}
                        />
                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* PAYMENT MODE */}

                    <section className="mb-7">

                        <div className="
                            mb-5 flex flex-wrap items-center
                            justify-between gap-3
                        ">
                            <SectionHeading
                                icon={Wallet}
                                title="Payment Method"
                                description="Choose normal payment or split the payment across multiple methods"
                            />

                            <div className="
                                flex items-center gap-1 rounded-lg
                                border border-gray-200 bg-gray-50 p-1
                            ">
                                <button
                                    type="button"
                                    onClick={() => handleSplitModeChange(false)}
                                    className={`
                                        rounded-md px-3 py-2 text-xs
                                        font-medium transition
                                        ${!isSplitPayment
                                            ? "bg-white text-[#408DFB] shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                        }
                                    `}
                                >
                                    Normal Payment
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleSplitModeChange(true)}
                                    className={`
                                        rounded-md px-3 py-2 text-xs
                                        font-medium transition
                                        ${isSplitPayment
                                            ? "bg-white text-[#408DFB] shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                        }
                                    `}
                                >
                                    Split Payment
                                </button>
                            </div>
                        </div>

                        {!isSplitPayment ? (
                            <>
                                <div className="
                                    grid grid-cols-1 gap-5
                                    md:grid-cols-2 lg:grid-cols-3
                                ">
                                    <FormField label="Payment Amount" required>
                                        <div>
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

                                            <PaymentAmountInrHint
                                                amount={formData.paymentAmount}
                                                currencyCode={sourceCurrencyCode}
                                                exchangeRate={sourceExchangeRate}
                                            />
                                        </div>
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

                                {isPartyCredit ? (
                                    <div className="
                                        mt-5 rounded-xl border border-blue-100
                                        bg-blue-50/60 p-4
                                    ">
                                        <div className="flex items-start gap-3">
                                            <div className="
                                                flex h-10 w-10 shrink-0
                                                items-center justify-center
                                                rounded-lg bg-white
                                                text-[#408DFB]
                                            ">
                                                <Wallet size={19} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-sm font-semibold text-gray-800">
                                                    {formData.paymentType === "SALES"
                                                        ? "Customer Credit"
                                                        : "Supplier Credit"
                                                    }
                                                </h4>

                                                <p className="mt-1 text-xs leading-5 text-gray-600">
                                                    {formData.paymentType === "SALES"
                                                        ? "The payment amount will be added to the customer's outstanding receivable balance."
                                                        : "The payment amount will be added to the supplier's outstanding payable balance."
                                                    }
                                                </p>

                                                <div className="
                                                    mt-3 flex flex-wrap
                                                    items-center gap-x-5 gap-y-2
                                                ">
                                                    <div>
                                                        <p className="text-[11px] text-gray-400">
                                                            Party ID
                                                        </p>

                                                        <p className="mt-0.5 text-sm font-semibold text-gray-700">
                                                            {selectedPartyId || "Not available"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[11px] text-gray-400">
                                                            Payment Amount
                                                        </p>

                                                        <p className="mt-0.5 text-sm font-semibold text-gray-700">
                                                            {formData.paymentAmount
                                                                ? Number(formData.paymentAmount).toLocaleString(
                                                                    "en-IN",
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    }
                                                                )
                                                                : "0.00"
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                {!selectedPartyId && formData.sourceId && (
                                                    <p className="mt-3 text-xs font-medium text-red-500">
                                                        A valid party could not be identified from this order. Please check the source document response.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <p className="mt-3 text-xs text-gray-400">
                                            No bank or cash account is required for Party Credit.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="
                                        mt-5 grid grid-cols-1 gap-5
                                        md:grid-cols-2 lg:grid-cols-3
                                    ">
                                        {formData.paymentMethod === "CASH" ? (
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
                                        ) : (
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
                                        )}
                                    </div>
                                )}

                            </>
                        ) : (
                            <div className="
                                rounded-xl border border-gray-200
                                bg-gray-50/60 p-4
                            ">

                                <div className="
                                    mb-4 flex flex-wrap items-center
                                    justify-between gap-3
                                ">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800">
                                            Payment Allocations
                                        </h4>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Add separate payment methods and accounts for this transaction.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddAllocation}
                                        className="
                                            flex items-center gap-2
                                            rounded-lg bg-[#408DFB]
                                            px-3 py-2 text-xs
                                            font-medium text-white
                                            transition hover:bg-blue-600
                                        "
                                    >
                                        <Plus size={15} />
                                        Add Allocation
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {allocations.map((allocation, index) => {
                                        const allocationIsCredit =
                                            allocation.paymentMethod === "PARTY_CREDIT";

                                        const allocationIsCash =
                                            allocation.paymentMethod === "CASH";

                                        return (
                                            <div
                                                key={index}
                                                className="
                                                    rounded-xl border
                                                    border-gray-200 bg-white p-4
                                                "
                                            >
                                                <div className="
                                                    mb-4 flex items-center
                                                    justify-between
                                                ">
                                                    <h5 className="text-sm font-semibold text-gray-700">
                                                        Allocation {index + 1}
                                                    </h5>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveAllocation(index)
                                                        }
                                                        disabled={allocations.length <= 2}
                                                        className="
                                                            flex h-8 w-8 items-center
                                                            justify-center rounded-lg
                                                            text-gray-400 transition
                                                            hover:bg-red-50 hover:text-red-500
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-30
                                                        "
                                                        title="Remove allocation"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="
                                                    grid grid-cols-1 gap-4
                                                    md:grid-cols-2 lg:grid-cols-3
                                                ">
                                                    <FormField
                                                        label="Payment Amount"
                                                        required
                                                    >
                                                        <div>
                                                            <TextInput
                                                                type="number"
                                                                value={allocation.paymentAmount}
                                                                onChange={(e) =>
                                                                    handleAllocationChange(
                                                                        index,
                                                                        "paymentAmount",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Enter amount"
                                                                min="0.01"
                                                                step="0.01"
                                                            />

                                                            <PaymentAmountInrHint
                                                                amount={allocation.paymentAmount}
                                                                currencyCode={sourceCurrencyCode}
                                                                exchangeRate={sourceExchangeRate}
                                                            />
                                                        </div>
                                                    </FormField>
                                                    <FormField
                                                        label="Payment Method"
                                                        required
                                                    >
                                                        <CustomSelect
                                                            value={allocation.paymentMethod}
                                                            onChange={(value) =>
                                                                handleAllocationMethodChange(
                                                                    index,
                                                                    value
                                                                )
                                                            }
                                                            options={paymentMethodOptions}
                                                            placeholder="Select payment method"
                                                        />
                                                    </FormField>

                                                    {allocationIsCredit ? (
                                                        <div className="
                                                            flex items-center
                                                            rounded-lg border
                                                            border-blue-100
                                                            bg-blue-50 px-3 py-2
                                                        ">
                                                            <div>
                                                                <p className="text-xs font-semibold text-blue-700">
                                                                    Party Credit
                                                                </p>

                                                                <p className="mt-0.5 text-[11px] text-blue-600">
                                                                    No account required
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : allocationIsCash ? (
                                                        <FormField
                                                            label="Cash Account"
                                                            required
                                                        >
                                                            <CustomSelect
                                                                value={allocation.cashAccountId}
                                                                onChange={(value) =>
                                                                    handleAllocationChange(
                                                                        index,
                                                                        "cashAccountId",
                                                                        value
                                                                    )
                                                                }
                                                                options={cashAccountOptions}
                                                                placeholder="Select cash account"
                                                            />
                                                        </FormField>
                                                    ) : (
                                                        <FormField
                                                            label="Bank Account"
                                                            required
                                                        >
                                                            <CustomSelect
                                                                value={allocation.bankAccountId}
                                                                onChange={(value) =>
                                                                    handleAllocationChange(
                                                                        index,
                                                                        "bankAccountId",
                                                                        value
                                                                    )
                                                                }
                                                                options={bankAccountOptions}
                                                                placeholder="Select bank account"
                                                            />
                                                        </FormField>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* SPLIT TOTAL */}

                                <div className="
                                    mt-4 flex flex-wrap
                                    items-center justify-between
                                    gap-3 rounded-lg border
                                    border-blue-100 bg-blue-50
                                    px-4 py-3
                                ">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Total Allocated Amount
                                        </p>

                                        <p className="mt-1 text-lg font-semibold text-gray-800">
                                            {splitTotal.toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }
                                            )}
                                        </p>
                                    </div>

                                    <p className="text-xs text-gray-500">
                                        {allocations.length} allocations
                                    </p>
                                </div>

                                {formData.paymentType === "EXPENSE" && (
                                    <p className="mt-3 text-xs text-gray-400">
                                        Party Credit is not available for expenses.
                                    </p>
                                )}
                            </div>
                        )}
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

            <LeaveConfirmationModal
                show={showLeaveConfirmation}
                title="Leave Expense?"
                message="Are you sure you want to leave this expense page?"
                stayText="Stay Here"
                leaveText="Leave"
                onStay={handleStay}
                onLeave={handleLeave}
            />
        </div>
    );
};

export default PaymentCreate;
