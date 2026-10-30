import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Boxes,
    Warehouse,
    PackagePlus,
    CalendarDays,
    FileText,
    X,
    ChevronDown,
    CheckCircle2,
    Calculator,
    ArrowLeft,
    ArrowDownToLine,
    ArrowUpFromLine,
} from "lucide-react";
import toast from "react-hot-toast";

import { adjustStock } from "../../../thunks/inventoryThunk";

import { fetchAllProducts } from "../../../../module/items/thunks/productThunks";
import { fetchAllUnits } from "../../../../module/units/thunks/unitThunks";
import { fetchAllSizes } from "../../../../module/sizes/thunks/sizeThunks";
import { fetchAllWarehouse } from "../../warehouse/thunks/warehouseThunks";

import { getUserPermission } from "../../../../module/menuPermission/thunks/menuPermissionThunks";
import InvoiceSkeleton from "../../../../common/loader/InvoiceSkeleton";
import CustomISelect from "../../../../common/custom/CustomISelect";


/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const MOVEMENT_TYPES = [
    {
        value: "STOCK_ADJUSTMENT_IN",
        label: "Stock Increase",
        description: "Add additional quantity to the existing stock",
    },
    {
        value: "STOCK_ADJUSTMENT_OUT",
        label: "Stock Decrease",
        description: "Remove quantity from the existing stock",
    },
];

const inputClass = `
    w-full rounded-lg border border-gray-200 bg-white
    px-3 py-2.5 text-sm text-gray-700
    outline-none transition-all
    placeholder:text-gray-400
    focus:border-blue-500 focus:ring-2 focus:ring-blue-100
    disabled:cursor-not-allowed disabled:bg-gray-100
`;

const labelClass = `
    mb-1.5 block text-sm font-medium text-gray-700
`;

const sectionClass = `
    rounded-xl border border-gray-200 bg-white p-5
`;

const buttonSecondaryClass = `
    inline-flex items-center justify-center gap-2
    rounded-lg border border-gray-200 bg-white
    px-4 py-2.5 text-sm font-medium text-gray-600
    transition hover:bg-gray-50
    disabled:cursor-not-allowed disabled:opacity-50
`;

const buttonPrimaryClass = `
    inline-flex items-center justify-center gap-2
    rounded-lg bg-[#408DFB] px-5 py-2.5 border-r
    text-sm font-semibold text-white
    shadow-sm transition hover:bg-[#408DFB]
    disabled:cursor-not-allowed disabled:opacity-50
`;


/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const getLocalDateTime = () => {
    const date = new Date();

    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16);
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
};

const getItemId = (item) => {
    return item?.id ?? item?.productId ?? item?.value ?? "";
};

const getProductLabel = (product) => {
    return (
        product?.productName ||
        product?.itemName ||
        product?.name ||
        product?.productCode ||
        "Unnamed Product"
    );
};

const getWarehouseLabel = (warehouse) => {
    return (
        warehouse?.warehouseName ||
        warehouse?.name ||
        warehouse?.warehouseCode ||
        "Unnamed Warehouse"
    );
};

const getUnitLabel = (unit) => {
    return (
        unit?.unitName ||
        unit?.unitShortName ||
        unit?.name ||
        "Unnamed Unit"
    );
};

const getSizeLabel = (size) => {
    return (
        size?.sizeName ||
        size?.name ||
        size?.size ||
        "Unnamed Size"
    );
};

const getArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.content)) return data.data.content;

    return [];
};


/* -------------------------------------------------------------------------- */
/*                              REUSABLE COMPONENTS                           */
/* -------------------------------------------------------------------------- */

const FormField = ({
    label,
    required = false,
    children,
    className = "",
}) => {
    return (
        <div className={className}>
            <label className={labelClass}>
                {label}
                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            {children}
        </div>
    );
};

const TextInput = ({
    value,
    onChange,
    type = "text",
    placeholder = "",
    disabled = false,
    min,
    step,
}) => {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            step={step}
            className={inputClass}
        />
    );
};

const TextAreaField = ({
    value,
    onChange,
    placeholder = "Enter notes...",
    rows = 3,
}) => {
    return (
        <textarea
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${inputClass} resize-none`}
        />
    );
};

const SelectField = ({
    value,
    onChange,
    options = [],
    placeholder = "Select option",
    disabled = false,
}) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`${inputClass} cursor-pointer`}
        >
            <option value="">{placeholder}</option>

            {options.map((option) => (
                <option
                    key={option.value}
                    value={option.value}
                >
                    {option.label}
                </option>
            ))}
        </select>
    );
};

const SectionHeading = ({
    icon: Icon,
    title,
    description,
}) => {
    return (
        <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon size={19} />
            </div>

            <div>
                <h3 className="text-base font-semibold text-gray-800">
                    {title}
                </h3>

                {description && (
                    <p className="mt-1 text-sm text-gray-500">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};


/* -------------------------------------------------------------------------- */
/*                         PERMISSION HELPER                                  */
/* -------------------------------------------------------------------------- */

const normalizeRole = (user) => {
    const role =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    return String(role).toUpperCase();
};

const hasPermission = (
    userPermissions,
    moduleName,
    actionName,
) => {
    if (!Array.isArray(userPermissions)) return false;

    const modulePermission = userPermissions.find((permission) => {
        const name =
            permission?.moduleName ||
            permission?.module?.moduleName ||
            permission?.name;

        return (
            String(name || "").toLowerCase() ===
            moduleName.toLowerCase()
        );
    });

    if (!modulePermission) return false;

    const actions =
        modulePermission?.actions ||
        modulePermission?.permissions ||
        modulePermission?.moduleActions ||
        [];

    if (!Array.isArray(actions)) return false;

    return actions.some((action) => {
        const actionNameValue =
            typeof action === "string"
                ? action
                : action?.actionName ||
                action?.name ||
                action?.action?.actionName;

        const isAllowed =
            typeof action === "string"
                ? true
                : action?.allowed !== false &&
                action?.active !== false &&
                String(action?.status || "ACTIVE").toUpperCase() !==
                "INACTIVE";

        return (
            String(actionNameValue || "").toUpperCase() ===
            actionName.toUpperCase() &&
            isAllowed
        );
    });
};


/* -------------------------------------------------------------------------- */
/*                         MAIN COMPONENT                                     */
/* -------------------------------------------------------------------------- */

const InventoryStockAdjustment = ({
    products: productsProp,
    warehouses: warehousesProp,
    units: unitsProp,
    sizes: sizesProp,
    onClose,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* ----------------------------- REDUX STATE ---------------------------- */

    const authState = useSelector((state) => state.auth || {});
    const permissionState = useSelector(
        (state) => state.menuPermission || {},
    );

    const inventoryState = useSelector(
        (state) => state.inventory || {},
    );

    const productState = useSelector(
        (state) => state.product || {},
    );

    const warehouseState = useSelector(
        (state) => state.warehouse || {},
    );

    const unitState = useSelector(
        (state) => state.unit || {},
    );

    const sizeState = useSelector(
        (state) => state.size || {},
    );

    const user = authState.user;
    const isAuthenticated = authState.isAuthenticated;
    const authChecking = authState.authChecking;

    const userPermissions =
        permissionState.userPermissions || [];

    const userPermissionsLoading =
        permissionState.userPermissionsLoading ?? false;

    const userPermissionsLoaded =
        permissionState.userPermissionsLoaded ?? false;

    const role = normalizeRole(user);

    const isFullAccess =
        role === "SUPER_ADMIN" || role === "ADMIN";

    const actionLoading =
        inventoryState.actionLoading ?? false;


    /* ---------------------------- PERMISSIONS ----------------------------- */

    const canCreateAdjustment =
        isFullAccess ||
        hasPermission(
            userPermissions,
            "Inventory",
            "CREATE",
        );

    const permissionLoading =
        !isFullAccess &&
        !userPermissionsLoaded &&
        userPermissionsLoading;

    const permissionResolved =
        isFullAccess || userPermissionsLoaded;

    useEffect(() => {
        if (
            isAuthenticated &&
            !isFullAccess &&
            !userPermissionsLoaded &&
            !userPermissionsLoading
        ) {
            dispatch(getUserPermission());
        }
    }, [
        dispatch,
        isAuthenticated,
        isFullAccess,
        userPermissionsLoaded,
        userPermissionsLoading,
    ]);


    /* ---------------------------- FORM STATE ------------------------------ */

    const initialFormData = {
        productId: "",
        warehouseId: "",
        unitId: "",
        sizeId: "",
        movementType: "STOCK_ADJUSTMENT_IN",
        quantity: "",
        unitCost: "",
        transactionDate: getLocalDateTime(),
        notes: "",
    };

    const [formData, setFormData] = useState(initialFormData);
    const [showSaveOptions, setShowSaveOptions] = useState(false);


    /* --------------------------- MASTER DATA ------------------------------ */

    const products = useMemo(
        () =>
            getArray(
                productsProp?.length
                    ? productsProp
                    : productState.products,
            ),
        [productsProp, productState.products],
    );

    const warehouses = useMemo(
        () =>
            getArray(
                warehousesProp?.length
                    ? warehousesProp
                    : warehouseState.warehouses,
            ),
        [warehousesProp, warehouseState.warehouses],
    );

    const units = useMemo(
        () =>
            getArray(
                unitsProp?.length
                    ? unitsProp
                    : unitState.units,
            ),
        [unitsProp, unitState.units],
    );

    const sizes = useMemo(
        () =>
            getArray(
                sizesProp?.length
                    ? sizesProp
                    : sizeState.sizes,
            ),
        [sizesProp, sizeState.sizes],
    );


    /* --------------------------- FETCH MASTER DATA ------------------------ */

    useEffect(() => {
        if (!productsProp?.length) {
            dispatch(fetchAllProducts());
        }

        if (!warehousesProp?.length) {
            dispatch(fetchAllWarehouse());
        }

        if (!unitsProp?.length) {
            dispatch(fetchAllUnits());
        }

        if (!sizesProp?.length) {
            dispatch(fetchAllSizes());
        }
    }, [
        dispatch,
        productsProp,
        warehousesProp,
        unitsProp,
        sizesProp,
    ]);


    /* ---------------------------- SELECT OPTIONS -------------------------- */

    const productOptions = useMemo(
        () =>
            products.map((product) => ({
                value: String(getItemId(product)),
                label: getProductLabel(product),
            })),
        [products],
    );

    const warehouseOptions = useMemo(
        () =>
            warehouses.map((warehouse) => ({
                value: String(getItemId(warehouse)),
                label: getWarehouseLabel(warehouse),
            })),
        [warehouses],
    );

    const unitOptions = useMemo(
        () =>
            units.map((unit) => ({
                value: String(getItemId(unit)),
                label: getUnitLabel(unit),
            })),
        [units],
    );

    const sizeOptions = useMemo(
        () =>
            sizes.map((size) => ({
                value: String(getItemId(size)),
                label: getSizeLabel(size),
            })),
        [sizes],
    );


    /* ----------------------------- SELECTED DATA -------------------------- */

    const selectedProduct = useMemo(
        () =>
            products.find(
                (product) =>
                    String(getItemId(product)) ===
                    String(formData.productId),
            ),
        [products, formData.productId],
    );

    const selectedWarehouse = useMemo(
        () =>
            warehouses.find(
                (warehouse) =>
                    String(getItemId(warehouse)) ===
                    String(formData.warehouseId),
            ),
        [warehouses, formData.warehouseId],
    );

    const selectedMovement = MOVEMENT_TYPES.find(
        (movement) => movement.value === formData.movementType,
    );


    /* ----------------------------- CALCULATIONS --------------------------- */

    const quantity = Number(formData.quantity || 0);
    const unitCost = Number(formData.unitCost || 0);

    const totalAdjustmentValue = quantity * unitCost;

    const isStockIncrease =
        formData.movementType === "STOCK_ADJUSTMENT_IN";


    /* ----------------------------- FORM HANDLERS -------------------------- */

    const handleChange = (field, value) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            ...initialFormData,
            transactionDate: getLocalDateTime(),
        });

        setShowSaveOptions(false);
    };

    const handleClose = () => {
        if (actionLoading) return;

        if (onClose) {
            onClose();
        } else {
            navigate(-1);
        }
    };


    /* ------------------------------ VALIDATION ---------------------------- */

    const validateForm = () => {
        if (!formData.productId) {
            toast.error("Please select a product.");
            return false;
        }

        if (!formData.warehouseId) {
            toast.error("Please select a warehouse.");
            return false;
        }

        if (!formData.unitId) {
            toast.error("Please select a unit.");
            return false;
        }

        if (!formData.movementType) {
            toast.error("Please select an adjustment type.");
            return false;
        }

        if (!formData.quantity || quantity <= 0) {
            toast.error("Please enter a quantity greater than zero.");
            return false;
        }

        if (
            formData.unitCost === "" ||
            unitCost < 0 ||
            !Number.isFinite(unitCost)
        ) {
            toast.error("Please enter a valid unit cost.");
            return false;
        }

        if (!formData.transactionDate) {
            toast.error("Please select a transaction date.");
            return false;
        }

        return true;
    };


    /* ------------------------------- SAVE --------------------------------- */

    const handleSave = async (saveMode = "close") => {
        if (actionLoading) return;

        if (!validateForm()) return;

        const payload = {
            productId: Number(formData.productId),
            warehouseId: Number(formData.warehouseId),
            unitId: Number(formData.unitId),
            sizeId: formData.sizeId
                ? Number(formData.sizeId)
                : null,

            movementType: formData.movementType,

            quantity: Number(formData.quantity),
            unitCost: Number(formData.unitCost),

            transactionDate:
                formData.transactionDate.length === 16
                    ? `${formData.transactionDate}:00`
                    : formData.transactionDate,

            notes: formData.notes.trim(),
        };

        try {
            await dispatch(adjustStock(payload)).unwrap();

            toast.success("Stock adjustment created successfully.");

            if (saveMode === "new") {
                resetForm();
                return;
            }

            handleClose();
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to create stock adjustment.",
            );
        }
    };


    /* ----------------------------- KEY HANDLER ---------------------------- */

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                if (showSaveOptions) {
                    setShowSaveOptions(false);
                } else {
                    handleClose();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showSaveOptions, actionLoading]);


    /* ------------------------------- LOADING ------------------------------ */

    if (authChecking || permissionLoading) {
        return <InvoiceSkeleton />;
    }


    /* ----------------------------- ACCESS CHECK --------------------------- */

    if (!isAuthenticated || !permissionResolved) {
        return <InvoiceSkeleton />;
    }

    if (!canCreateAdjustment) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-6">
                <div className="max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <X size={26} />
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        You don't have permission to create stock adjustments.
                        Please contact your administrator.
                    </p>

                    <button
                        type="button"
                        onClick={handleClose}
                        className={`${buttonPrimaryClass} mt-5`}
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }


    /* ---------------------------------------------------------------------- */
    /*                                    UI                                  */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}

            <div className="border border-lime-400 rounded bg-white px-2 py-4 m-3">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={actionLoading}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50"
                            title="Go back"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <PackagePlus size={22} />
                        </div>

                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">
                                Create Stock Adjustment
                            </h1>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Increase or decrease existing inventory stock
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={actionLoading}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-100 transition bg-red-500 hover:bg-red-400 hover:text-gray-100"
                        title="Close"
                    >
                        <X size={19} />
                    </button>

                </div>
            </div>


            {/* Main Content */}

            <div className="mx-auto max-w-7xl space-y-5 p-2">

                {/* Product and Warehouse Details */}

                <div className={sectionClass}>
                    <SectionHeading
                        icon={Boxes}
                        title="Product & Warehouse Details"
                        description="Select the product and warehouse where the stock adjustment should be applied."
                    />

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <FormField
                            label="Product"
                            required
                        >
                            <CustomISelect
                                value={formData.productId}
                                onChange={(value) =>
                                    handleChange("productId", value)
                                }
                                options={productOptions}
                                placeholder="Select product"
                                disabled={actionLoading}
                            />
                        </FormField>

                        <FormField
                            label="Warehouse"
                            required
                        >
                            <CustomISelect
                                value={formData.warehouseId}
                                onChange={(value) =>
                                    handleChange("warehouseId", value)
                                }
                                options={warehouseOptions}
                                placeholder="Select warehouse"
                                disabled={actionLoading}
                            />
                        </FormField>

                        <FormField
                            label="Unit"
                            required
                        >
                            <CustomISelect
                                value={formData.unitId}
                                onChange={(value) =>
                                    handleChange("unitId", value)
                                }
                                options={unitOptions}
                                placeholder="Select unit"
                                disabled={actionLoading}
                            />
                        </FormField>

                        <FormField label="Size">
                            <CustomISelect
                                value={formData.sizeId}
                                onChange={(value) =>
                                    handleChange("sizeId", value)
                                }
                                options={sizeOptions}
                                placeholder="Select size (optional)"
                                disabled={actionLoading}
                            />
                        </FormField>

                    </div>
                </div>


                {/* Adjustment Details */}

                <div className={sectionClass}>
                    <SectionHeading
                        icon={isStockIncrease ? ArrowDownToLine : ArrowUpFromLine}
                        title="Stock Adjustment Details"
                        description="Choose whether to increase or decrease stock and enter the adjustment quantity."
                    />

                    <div className="space-y-5">

                        <FormField
                            label="Adjustment Type"
                            required
                        >
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                                {MOVEMENT_TYPES.map((movement) => {
                                    const isSelected =
                                        formData.movementType === movement.value;

                                    const isIncrease =
                                        movement.value === "STOCK_ADJUSTMENT_IN";

                                    const MovementIcon = isIncrease
                                        ? ArrowDownToLine
                                        : ArrowUpFromLine;

                                    return (
                                        <button
                                            key={movement.value}
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() =>
                                                handleChange(
                                                    "movementType",
                                                    movement.value,
                                                )
                                            }
                                            className={`
                                                flex items-start gap-3 rounded-xl border p-4 text-left transition
                                                ${isSelected
                                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                                                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                                                }
                                            `}
                                        >
                                            <div
                                                className={`
                                                    flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
                                                    ${isIncrease
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-orange-100 text-orange-600"
                                                    }
                                                `}
                                            >
                                                <MovementIcon size={20} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {movement.label}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {movement.description}
                                                </p>
                                            </div>

                                            {isSelected && (
                                                <CheckCircle2
                                                    size={19}
                                                    className="shrink-0 text-blue-600"
                                                />
                                            )}
                                        </button>
                                    );
                                })}

                            </div>
                        </FormField>


                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            <FormField
                                label="Adjustment Quantity"
                                required
                            >
                                <TextInput
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(value) =>
                                        handleChange("quantity", value)
                                    }
                                    placeholder="Enter quantity"
                                    min="0.0001"
                                    step="0.0001"
                                    disabled={actionLoading}
                                />

                                <p className="mt-1.5 text-xs text-gray-400">
                                    Enter a quantity greater than zero.
                                </p>
                            </FormField>

                            <FormField
                                label="Unit Cost"
                                required
                            >
                                <TextInput
                                    type="number"
                                    value={formData.unitCost}
                                    onChange={(value) =>
                                        handleChange("unitCost", value)
                                    }
                                    placeholder="Enter unit cost"
                                    min="0"
                                    step="0.01"
                                    disabled={actionLoading}
                                />
                            </FormField>

                        </div>


                        {/* Total Adjustment Value */}

                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600">
                                        <Calculator size={20} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">
                                            Total Adjustment Value
                                        </p>

                                        <p className="mt-0.5 text-xs text-gray-500">
                                            Quantity × Unit Cost
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xl font-bold text-blue-700">
                                    {formatCurrency(totalAdjustmentValue)}
                                </p>

                            </div>
                        </div>

                    </div>
                </div>


                {/* Transaction Details */}

                <div className={sectionClass}>
                    <SectionHeading
                        icon={CalendarDays}
                        title="Transaction Details"
                        description="Provide the date and any additional information for this adjustment."
                    />

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        <FormField
                            label="Transaction Date"
                            required
                        >
                            <TextInput
                                type="datetime-local"
                                value={formData.transactionDate}
                                onChange={(value) =>
                                    handleChange("transactionDate", value)
                                }
                                disabled={actionLoading}
                            />
                        </FormField>

                        <FormField label="Notes">
                            <TextAreaField
                                value={formData.notes}
                                onChange={(value) =>
                                    handleChange("notes", value)
                                }
                                placeholder="Enter adjustment reason or notes..."
                                rows={3}
                            />
                        </FormField>

                    </div>
                </div>


                {/* Adjustment Summary */}

                <div className={sectionClass}>
                    <SectionHeading
                        icon={FileText}
                        title="Adjustment Summary"
                        description="Review the adjustment information before saving."
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-xs font-medium text-gray-500">
                                Product
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                                {selectedProduct
                                    ? getProductLabel(selectedProduct)
                                    : "Not selected"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-xs font-medium text-gray-500">
                                Warehouse
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                                {selectedWarehouse
                                    ? getWarehouseLabel(selectedWarehouse)
                                    : "Not selected"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-xs font-medium text-gray-500">
                                Adjustment Type
                            </p>

                            <p
                                className={`mt-1 text-sm font-semibold ${isStockIncrease
                                    ? "text-green-600"
                                    : "text-orange-600"
                                    }`}
                            >
                                {selectedMovement?.label || "Not selected"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-xs font-medium text-gray-500">
                                Adjustment Quantity
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-800">
                                {quantity || 0}
                            </p>
                        </div>

                    </div>

                    <div className="mt-4 flex flex-col justify-between gap-3 rounded-lg border border-gray-100 p-4 sm:flex-row sm:items-center">

                        <div>
                            <p className="text-sm text-gray-500">
                                Total Adjustment Value
                            </p>

                            <p className="mt-1 text-xl font-bold text-gray-800">
                                {formatCurrency(totalAdjustmentValue)}
                            </p>
                        </div>

                        <div
                            className={`
                                inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold
                                ${isStockIncrease
                                    ? "bg-green-50 text-green-700"
                                    : "bg-orange-50 text-orange-700"
                                }
                            `}
                        >
                            {isStockIncrease ? (
                                <ArrowDownToLine size={17} />
                            ) : (
                                <ArrowUpFromLine size={17} />
                            )}

                            {isStockIncrease
                                ? "Stock Increase"
                                : "Stock Decrease"}
                        </div>

                    </div>
                </div>


                {/* Footer Actions */}

                <div className="flex flex-col-reverse justify-between gap-3 pb-6 sm:flex-row sm:items-center">

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={actionLoading}
                        className={buttonSecondaryClass}
                    >
                        Cancel
                    </button>


                    <div className="flex flex-col gap-3 sm:flex-row">

                        <button
                            type="button"
                            onClick={() => handleSave("new")}
                            disabled={actionLoading}
                            className={buttonSecondaryClass}
                        >
                            {actionLoading ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                            ) : (
                                <PackagePlus size={16} />
                            )}

                            Save & New
                        </button>


                        {/* Save Dropdown */}

                        <div className="relative flex">

                            <button
                                type="button"
                                onClick={() => handleSave("close")}
                                disabled={actionLoading}
                                className={`${buttonPrimaryClass} rounded-r-none`}
                            >
                                {actionLoading ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                ) : (
                                    <CheckCircle2 size={17} />
                                )}

                                Save Adjustment
                            </button>

                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() =>
                                    setShowSaveOptions((previous) => !previous)
                                }
                                className="rounded-r-lg border-l border-blue-500 bg-[#408DFB] px-3 text-white transition hover:bg-blue-700 disabled:opacity-50"
                            >
                                <ChevronDown size={17} />
                            </button>


                            {showSaveOptions && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Close save options"
                                        className="fixed inset-0 z-10 cursor-default"
                                        onClick={() =>
                                            setShowSaveOptions(false)
                                        }
                                    />

                                    <div className="absolute bottom-full right-0 z-20 mb-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowSaveOptions(false);
                                                handleSave("new");
                                            }}
                                            disabled={actionLoading}
                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <PackagePlus
                                                size={16}
                                                className="text-gray-500"
                                            />

                                            Save & New
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowSaveOptions(false);
                                                handleSave("close");
                                            }}
                                            disabled={actionLoading}
                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <CheckCircle2
                                                size={16}
                                                className="text-gray-500"
                                            />

                                            Save & Close
                                        </button>

                                    </div>
                                </>
                            )}

                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default InventoryStockAdjustment;