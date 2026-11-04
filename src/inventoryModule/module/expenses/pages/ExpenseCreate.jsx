import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Receipt,
    Wallet,
    Building2,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    FileText,
    Plus,
    Eye,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createExpense,
    fetchExpenseById,
    updateExpense,
} from "../thunks/expenseThunks";

import {
    resetExpenseForm,
    clearCreatedExpenseCategorySelection,
    setCreatedExpenseReferenceSelection,
    clearCreatedExpenseReferenceSelection,
} from "../slices/expenseSlice";


import {
    fetchAllParties,
} from "../../../../module/parties/thunks/partyThunks";

import {
    fetchAllWarehouse,
} from "../../warehouse/thunks/warehouseThunks";

import {
    fetchAllCurrencies,
} from "../../../../module/currency/thunks/currencyThunks";

// Update these two imports to your actual module paths.
import {
    fetchAllExpenseCategories,
} from "../../expenses/thunks/expenseCategoryThunks";

import {
    fetchAllTaxMasters,
} from "../../../../module/taxMaster/thunks/taxMasterThunks";

import CustomSelect from "../../../../common/custom/CustomSelect";
import { openModal } from "../../../../module/ui/uiSlice";
import Tooltip from "../../../../common/toolTip/Tooltip";

import LeaveConfirmationModal from "../../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../../../../common/confirmation/useLeaveConfirmation";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const getToday = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60000)
        .toISOString()
        .split("T")[0];
};

const initialFormData = {
    expenseType: "INTERNAL",
    expenseCategoryId: "",
    expenseDate: getToday(),

    description: "",
    referenceNo: "",

    vendorId: "",
    warehouseId: "",

    currencyId: 1,
    taxMasterId: "",

    amount: "",
    discountAmount: 0,

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
   RESPONSE DATA HELPER
========================================================= */

const extractList = (response) => {
    const data =
        response?.data?.data ??
        response?.data ??
        response;

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.content)) {
        return data.content;
    }

    return [];
};

/* =========================================================
   OPTION FORMATTER
========================================================= */

const formatOptions = (items = [], labelFields = []) => {
    return items.map((item) => {
        const label = labelFields
            .map((field) => item?.[field])
            .find((value) => value !== null && value !== undefined && value !== "");

        return {
            label: label ?? "",
            value: String(item.id),
        };
    }).filter((option) => option.value && option.label);
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ExpenseCreate = ({ onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();
    const isEdit = Boolean(id);

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const expenseState = useSelector((state) => state.expense ?? {});

    const {
        loading = false,
        actionLoading = false,
        createdExpenseCategorySelection = null,
    } = expenseState;

    const parties = useSelector(
        (state) => state.party?.parties ?? []
    );

    const warehouses = useSelector(
        (state) => state.warehouse?.warehouses ?? []
    );

    const currencies = useSelector(
        (state) => state.currency?.currencies ?? []
    );

    const expenseCategories = useSelector(
        (state) => state.expenseCategory?.expenseCategories ?? []
    );

    const taxMasters = useSelector(
        (state) => state.taxMaster?.taxMasters ?? []
    );

    const createdExpenseReferenceSelection = useSelector(
        (state) =>
            state.expense?.createdExpenseReferenceSelection ?? null
    );
    /* =====================================================
       LOCAL STATE
    ===================================================== */

    const [formData, setFormData] = useState({
        ...initialFormData,
    });

    const [saveMode, setSaveMode] = useState("close");
    const [showSaveOptions, setShowSaveOptions] = useState(false);
    const [newlyCreatedCategory, setNewlyCreatedCategory] = useState(null);

    const {
        showLeaveConfirmation,
        confirmLeave,
        handleStay,
        handleLeave,
    } = useLeaveConfirmation();

    /* =====================================================
       FETCH DROPDOWN DATA
    ===================================================== */

    useEffect(() => {
        dispatch(fetchAllParties());
        dispatch(fetchAllWarehouse());
        dispatch(fetchAllCurrencies());
        dispatch(fetchAllExpenseCategories());
        dispatch(fetchAllTaxMasters());
    }, [dispatch]);

    /* =====================================================
       DROPDOWN OPTIONS
    ===================================================== */

    const expenseTypeOptions = useMemo(() => [
        { label: "Internal", value: "INTERNAL" },
        { label: "External", value: "EXTERNAL" },
    ], []);

    const vendorOptions = useMemo(
        () => formatOptions(parties, [
            "companyName",
            "vendorName",
            "partyName",
            "name",
        ]),
        [parties]
    );

    const warehouseOptions = useMemo(
        () => formatOptions(warehouses, [
            "warehouseName",
            "name",
        ]),
        [warehouses]
    );

    const currencyOptions = useMemo(
        () => formatOptions(currencies, [
            "currencyName",
            "currencyCode",
        ]),
        [currencies]
    );

    const taxMasterOptions = useMemo(() => [
        { label: "No Tax", value: "" },
        ...formatOptions(taxMasters, ["taxName"]),
    ], [taxMasters]);

    const categoryOptions = useMemo(() => {
        const options = formatOptions(
            expenseCategories,
            ["categoryName"]
        ).filter(
            (option) =>
                String(option.value) !==
                String(newlyCreatedCategory?.id)
        );

        if (newlyCreatedCategory?.id) {
            options.push({
                label: newlyCreatedCategory.categoryName,
                value: String(newlyCreatedCategory.id),
            });
        }

        options.push({
            label: "+ Create New Expense Category",
            value: "__CREATE_EXPENSE_CATEGORY__",
        });

        return options;
    }, [expenseCategories, newlyCreatedCategory]);

    /* =====================================================
       MAP EXPENSE RESPONSE
    ===================================================== */

    const mapExpenseToForm = useCallback((response) => {
        const expense =
            response?.data?.data ??
            response?.data ??
            response;

        if (!expense) {
            toast.error("Expense not found");
            return;
        }

        setFormData({
            expenseType: expense.expenseType ?? "INTERNAL",

            expenseCategoryId: expense.expenseCategoryId
                ? String(expense.expenseCategoryId)
                : "",

            expenseDate: expense.expenseDate ?? getToday(),

            description: expense.description ?? "",
            referenceNo: expense.referenceNo ?? "",

            vendorId: expense.vendorId
                ? String(expense.vendorId)
                : "",

            warehouseId: expense.warehouseId
                ? String(expense.warehouseId)
                : "",

            currencyId: expense.currencyId
                ? String(expense.currencyId)
                : "",

            taxMasterId: expense.taxMasterId
                ? String(expense.taxMasterId)
                : "",

            amount: expense.amount ?? "",
            discountAmount: expense.discountAmount ?? 0,

            notes: expense.notes ?? "",
        });
    }, []);

    /* =====================================================
       FETCH EXPENSE FOR EDIT
    ===================================================== */

    useEffect(() => {
        let isMounted = true;

        const loadExpense = async () => {
            if (!isEdit) {
                setFormData({ ...initialFormData });
                return;
            }

            try {
                const response = await dispatch(
                    fetchExpenseById(id)
                ).unwrap();

                if (isMounted) {
                    mapExpenseToForm(response);
                }
            } catch (error) {
                if (isMounted) {
                    toast.error(
                        typeof error === "string"
                            ? error
                            : "Failed to fetch expense details"
                    );
                }
            }
        };

        loadExpense();

        return () => {
            isMounted = false;
        };
    }, [dispatch, id, isEdit, mapExpenseToForm]);



    /* =====================================================
   HANDLE NEWLY CREATED REFERENCE MASTER
===================================================== */

    useEffect(() => {
        if (!createdExpenseReferenceSelection) return;

        const { targetField, entity } =
            createdExpenseReferenceSelection;

        const allowedFields = [
            "vendorId",
            "warehouseId",
            "currencyId",
            "taxMasterId",
        ];

        if (
            !allowedFields.includes(targetField) ||
            !entity?.id
        ) {
            dispatch(clearCreatedExpenseReferenceSelection());
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [targetField]: String(entity.id),
        }));

        dispatch(clearCreatedExpenseReferenceSelection());

    }, [createdExpenseReferenceSelection, dispatch]);


    /* =====================================================
       HANDLE FIELD CHANGE
    ===================================================== */

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };


    /* =====================================================
   CREATE REFERENCE MASTER
===================================================== */

    const handleCreateVendor = () => {
        dispatch(
            openModal({
                type: "addParty",
                data: {
                    selectAfterCreate: true,
                    targetField: "vendorId",
                },
            })
        );
    };

    const handleCreateWarehouse = () => {
        dispatch(
            openModal({
                type: "addWarehouse",
                data: {
                    selectAfterCreate: true,
                    targetField: "warehouseId",
                },
            })
        );
    };

    const handleCreateCurrency = () => {
        dispatch(
            openModal({
                type: "addCurrency",
                data: {
                    selectAfterCreate: true,
                    targetField: "currencyId",
                },
            })
        );
    };

    const handleCreateTaxMaster = () => {
        dispatch(
            openModal({
                type: "addTaxMaster",
                data: {
                    selectAfterCreate: true,
                    targetField: "taxMasterId",
                },
            })
        );
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        if (!formData.expenseType) {
            toast.error("Expense type is required");
            return false;
        }

        if (!formData.expenseCategoryId) {
            toast.error("Expense category is required");
            return false;
        }

        if (!formData.expenseDate) {
            toast.error("Expense date is required");
            return false;
        }

        if (!formData.currencyId) {
            toast.error("Currency is required");
            return false;
        }

        const amount = Number(formData.amount);
        const discount = Number(formData.discountAmount || 0);

        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error("Enter a valid expense amount");
            return false;
        }

        if (!Number.isFinite(discount) || discount < 0) {
            toast.error("Discount amount cannot be negative");
            return false;
        }

        if (discount > amount) {
            toast.error("Discount cannot exceed expense amount");
            return false;
        }

        return true;
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {
        if (isEdit) {
            dispatch(fetchExpenseById(id))
                .unwrap()
                .then(mapExpenseToForm)
                .catch(() => {
                    toast.error("Failed to reset expense form");
                });

            return;
        }

        setFormData({ ...initialFormData });
        setNewlyCreatedCategory(null);

        dispatch(resetExpenseForm());
    };

    const handleClose = () => {
        confirmLeave(() => {
            if (onClose) {
                onClose();
            } else {
                navigate("/inventory/expenses");
            }
        })
    };

    /* =====================================================
       CREATE EXPENSE CATEGORY
    ===================================================== */

    const handleCreateExpenseCategory = () => {
        dispatch(
            openModal({
                type: "addExpenseCategory",
                data: {
                    selectAfterCreate: true,
                    targetField: "expenseCategoryId",
                    expenseType: formData.expenseType,
                },
            })
        );
    };

    /* =====================================================
       SAVE EXPENSE
    ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (actionLoading || loading) return;
        if (!validateForm()) return;

        const payload = {
            expenseType: formData.expenseType,

            expenseCategoryId: Number(
                formData.expenseCategoryId
            ),

            expenseDate: formData.expenseDate,

            description: formData.description.trim() || null,
            referenceNo: formData.referenceNo.trim() || null,

            vendorId: formData.vendorId
                ? Number(formData.vendorId)
                : null,

            warehouseId: formData.warehouseId
                ? Number(formData.warehouseId)
                : null,

            currencyId: Number(formData.currencyId),

            taxMasterId: formData.taxMasterId
                ? Number(formData.taxMasterId)
                : null,

            amount: Number(formData.amount),

            discountAmount: Number(
                formData.discountAmount || 0
            ),

            notes: formData.notes.trim() || null,
        };

        try {
            let response;

            if (isEdit) {
                response = await dispatch(
                    updateExpense({
                        id,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    response?.message ||
                    "Expense updated successfully"
                );

                navigate(-1);
                return;
            }

            response = await dispatch(
                createExpense(payload)
            ).unwrap();

            toast.success(
                response?.message ||
                "Expense created successfully"
            );

            if (saveMode === "new") {
                setFormData({ ...initialFormData });
                setNewlyCreatedCategory(null);

                dispatch(resetExpenseForm());
            } else {
                navigate(-1);
            }
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : isEdit
                        ? "Failed to update expense"
                        : "Failed to create expense"
            );
        }
    };

    /* =====================================================
       HANDLE NEWLY CREATED CATEGORY
    ===================================================== */

    useEffect(() => {
        if (!createdExpenseCategorySelection?.id) return;

        setNewlyCreatedCategory(createdExpenseCategorySelection);

        setFormData((prev) => ({
            ...prev,
            expenseCategoryId: String(
                createdExpenseCategorySelection.id
            ),
        }));

        dispatch(clearCreatedExpenseCategorySelection());

    }, [createdExpenseCategorySelection, dispatch]);
    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
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

    if (isEdit && loading) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading expense details...
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
                            {isEdit ? "Edit Expense" : "Create Expense"}
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEdit
                                ? "Update your expense information"
                                : "Record a new business expense"}
                        </p>
                    </div>

                </div>

                <div className="relative flex items-center gap-2">

                    <button
                        type="button"
                        onClick={handleCreateExpenseCategory}
                        className="group relative
            flex items-center gap-2 rounded-lg
            border border-blue-200 bg-blue-50
            px-3 py-2 text-xs font-medium
            text-[#408DFB] transition hover:bg-blue-100
        "
                    >
                        <Plus size={16} />
                        New Expense Category
                    </button>

                    <button
                        type="button"
                        disabled={!formData.expenseCategoryId}
                        onClick={() =>
                            navigate(
                                `/inventory/expenses-categories/view/${formData.expenseCategoryId}`
                            )
                        }
                        title="View Expense Category"
                        className="
            flex items-center gap-2 rounded-lg
            border border-blue-200 bg-blue-50
            px-3 py-2 text-xs font-medium
            text-[#408DFB] transition hover:bg-blue-100
            disabled:cursor-not-allowed disabled:opacity-50
        "
                    >
                        <Eye size={16} />
                        View Category

                    </button>

                    <div className="
        hidden items-center gap-2 rounded-lg
        bg-blue-50 px-3 py-2 sm:flex
    ">
                        <Receipt size={16} className="text-[#408DFB]" />

                        <span className="text-xs font-medium text-[#408DFB]">
                            Expense
                        </span>
                    </div>

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

                <div className="flex-1 overflow-y-auto p-5">

                    {/* EXPENSE DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Receipt}
                            title="Expense Details"
                            description="Enter the basic expense information"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField label="Expense Type" required>
                                <CustomSelect
                                    value={formData.expenseType}
                                    onChange={(value) =>
                                        handleChange("expenseType", value)
                                    }
                                    options={expenseTypeOptions}
                                    placeholder="Select expense type"
                                />
                            </FormField>

                            <FormField label="Expense Category" required>
                                <CustomSelect
                                    value={formData.expenseCategoryId}
                                    onChange={(value) => {
                                        if (
                                            value ===
                                            "__CREATE_EXPENSE_CATEGORY__"
                                        ) {
                                            handleCreateExpenseCategory();
                                            return;
                                        }

                                        handleChange(
                                            "expenseCategoryId",
                                            value
                                        );
                                    }}
                                    options={categoryOptions}
                                    placeholder="Select category"
                                />
                            </FormField>

                            <FormField label="Expense Date" required>
                                <TextInput
                                    type="date"
                                    value={formData.expenseDate}
                                    onChange={(e) =>
                                        handleChange(
                                            "expenseDate",
                                            e.target.value
                                        )
                                    }
                                />
                            </FormField>

                            <FormField label="Reference Number">
                                <TextInput
                                    value={formData.referenceNo}
                                    onChange={(e) =>
                                        handleChange(
                                            "referenceNo",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter reference number"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField
                                label="Description"
                                className="md:col-span-2"
                            >
                                <TextInput
                                    value={formData.description}
                                    onChange={(e) =>
                                        handleChange(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter expense description"
                                    maxLength={1000}
                                />
                            </FormField>

                        </div>
                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* VENDOR AND LOCATION */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Building2}
                            title="Vendor & Location"
                            description="Enter vendor and warehouse information"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField label="Vendor">
                                <div className="flex items-center gap-2">
                                    <div className="min-w-0 flex-1">
                                        <CustomSelect
                                            value={formData.vendorId}
                                            onChange={(value) =>
                                                handleChange("vendorId", value)
                                            }
                                            options={vendorOptions}
                                            placeholder="Select vendor"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCreateVendor}
                                        title="Create Vendor"
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-[#408DFB] hover:bg-blue-100"
                                    >
                                        <Plus size={17} />
                                    </button>
                                </div>
                            </FormField>

                            <FormField label="Warehouse">
                                <div className="flex items-center gap-2">
                                    <div className="min-w-0 flex-1">
                                        <CustomSelect
                                            value={formData.warehouseId}
                                            onChange={(value) =>
                                                handleChange("warehouseId", value)
                                            }
                                            options={warehouseOptions}
                                            placeholder="Select warehouse"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCreateWarehouse}
                                        title="Create Warehouse"
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-[#408DFB] hover:bg-blue-100"
                                    >
                                        <Plus size={17} />
                                    </button>
                                </div>
                            </FormField>

                        </div>
                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* AMOUNT DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Wallet}
                            title="Amount Details"
                            description="Enter currency, amount, discount and tax configuration"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-2
                        ">

                            <FormField label="Currency" required>
                                <div className="flex items-center gap-2">
                                    <div className="min-w-0 flex-1">
                                        <CustomSelect
                                            value={formData.currencyId}
                                            onChange={(value) =>
                                                handleChange("currencyId", value)
                                            }
                                            options={currencyOptions}
                                            placeholder="Select currency"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCreateCurrency}
                                        title="Create Currency"
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-[#408DFB] hover:bg-blue-100"
                                    >
                                        <Plus size={17} />
                                    </button>
                                </div>
                            </FormField>

                            <FormField label="Tax Master">
                                <div className="flex items-center gap-2">
                                    <div className="min-w-0 flex-1">
                                        <CustomSelect
                                            value={formData.taxMasterId}
                                            onChange={(value) =>
                                                handleChange("taxMasterId", value)
                                            }
                                            options={taxMasterOptions}
                                            placeholder="Select tax (optional)"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCreateTaxMaster}
                                        title="Create Tax Master"
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-[#408DFB] hover:bg-blue-100"
                                    >
                                        <Plus size={17} />
                                    </button>
                                </div>
                            </FormField>

                            <FormField label="Amount" required>
                                <TextInput
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) =>
                                        handleChange("amount", e.target.value)
                                    }
                                    placeholder="Enter amount"
                                    min="0.01"
                                    step="0.01"
                                />
                            </FormField>

                            <FormField label="Discount Amount">
                                <TextInput
                                    type="number"
                                    value={formData.discountAmount}
                                    onChange={(e) =>
                                        handleChange(
                                            "discountAmount",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter discount amount"
                                    min="0"
                                    step="0.01"
                                />
                            </FormField>

                        </div>

                        <p className="mt-4 text-xs text-gray-400">
                            Exchange rate and GST amounts are calculated
                            automatically by the backend using the selected
                            currency, expense date and tax configuration.
                        </p>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* ADDITIONAL INFORMATION */}

                    <section>

                        <SectionHeading
                            icon={FileText}
                            title="Additional Information"
                            description="Add any additional expense notes"
                        />

                        <FormField label="Notes">
                            <TextAreaField
                                value={formData.notes}
                                onChange={(e) =>
                                    handleChange("notes", e.target.value)
                                }
                                placeholder="Enter additional notes"
                                rows={3}
                            />
                        </FormField>

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
                        disabled={actionLoading}
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
                                : isEdit
                                    ? "Update"
                                    : "Save"}
                        </button>

                        {!isEdit && (
                            <div className="relative">

                                <button
                                    type="button"
                                    disabled={actionLoading}
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

export default ExpenseCreate;