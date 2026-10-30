// InventoryOpeningStock.jsx

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
    useParams,
} from "react-router-dom";

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
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createOpeningStock,
} from "../../../thunks/inventoryThunk";

import {
    fetchAllProducts
} from "../../../../module/items/thunks/productThunks"

import { fetchAllUnits } from "../../../../module/units/thunks/unitThunks";

import CustomISelect from "../../../../common/custom/CustomISelect";
import { fetchAllSizes } from "../../../../module/sizes/thunks/sizeThunks";
import { fetchAllWarehouse } from "../../warehouse/thunks/warehouseThunks";

import {
    getUserPermission,
} from "../../../../module/menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton
    from "../../../../common/loader/InvoiceSkeleton";
/* =========================================================
   CONSTANTS
========================================================= */

const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400";

const labelClass =
    "mb-1.5 block text-sm font-medium text-gray-500";

const sectionClass =
    "rounded-xl border border-gray-200 bg-white p-5";

const buttonSecondaryClass =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

const buttonPrimaryClass =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[#408DFB] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#2878E8] disabled:cursor-not-allowed disabled:opacity-60";


/* =========================================================
   HELPERS
========================================================= */

const getLocalDateTime = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60000)
        .toISOString()
        .slice(0, 16);
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);
};

const getItemId = (item) => {
    return (
        item?.id ??
        item?.productId ??
        item?.warehouseId ??
        item?.unitId ??
        item?.sizeId ??
        ""
    );
};

const getProductLabel = (item) => {
    return (
        item?.productName ??
        item?.name ??
        item?.itemName ??
        item?.displayName ??
        `Product ${getItemId(item)}`
    );
};

const getWarehouseLabel = (item) => {
    return (
        item?.warehouseName ??
        item?.name ??
        item?.branchName ??
        item?.displayName ??
        `Warehouse ${getItemId(item)}`
    );
};

const getUnitLabel = (item) => {
    return (
        item?.unitName ??
        item?.unitShortName ??
        item?.name ??
        item?.displayName ??
        `Unit ${getItemId(item)}`
    );
};

const getSizeLabel = (item) => {
    return (
        item?.sizeName ??
        item?.name ??
        item?.displayName ??
        `Size ${getItemId(item)}`
    );
};

const toSelectOptions = (items, labelGetter) => {
    if (!Array.isArray(items)) return [];

    return items
        .filter(Boolean)
        .map((item) => {
            // Allow already formatted CustomSelect options.
            if (
                item?.value !== undefined &&
                item?.label !== undefined
            ) {
                return {
                    value: String(item.value),
                    label: item.label,
                };
            }

            return {
                value: String(getItemId(item)),
                label: labelGetter(item),
            };
        })
        .filter((option) => option.value !== "");
};


/* =========================================================
   REUSABLE FORM COMPONENTS
========================================================= */

const FormField = ({
    label,
    required = false,
    hint,
    children,
}) => {
    return (
        <div className="min-w-0">
            <label className={labelClass}>
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            {children}

            {hint && (
                <p className="mt-1.5 text-xs text-gray-400">
                    {hint}
                </p>
            )}
        </div>
    );
};


const TextInput = ({
    value,
    onChange,
    placeholder,
    type = "text",
    disabled = false,
    min,
    max,
    step,
    maxLength,
    autoComplete = "off",
}) => {
    return (
        <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            maxLength={maxLength}
            autoComplete={autoComplete}
            className={inputClass}
        />
    );
};


const TextAreaField = ({
    value,
    onChange,
    placeholder,
    rows = 3,
    maxLength,
}) => {
    return (
        <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className={`${inputClass} resize-none`}
        />
    );
};


const SelectField = ({
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
}) => {
    return (
        <CustomISelect
            value={String(value ?? "")}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            width="w-full"
            size="md"
            disabled={disabled}
        />
    );
};


const SectionHeading = ({
    icon: Icon,
    title,
    description,
}) => {
    return (
        <div className="mb-5 flex items-start gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon size={18} />
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-700">
                    {title}
                </h3>

                {description && (
                    <p className="mt-1 text-xs text-gray-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

const InventoryOpeningStock = ({
    products: productsProp,
    warehouses: warehousesProp,
    units: unitsProp,
    sizes: sizesProp,
    onClose,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const isEdit = Boolean(id);

    const user = useSelector(
        (state) => state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) => state.auth?.authChecking === true
    );

    const permissions = useSelector(
        (state) =>
            Array.isArray(state.menuPermission?.userPermissions)
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

    /* -----------------------------------------------------
       REDUX STATE
    ----------------------------------------------------- */

    const inventoryState = useSelector(
        (state) => state.inventory ?? {}
    );

    const productState = useSelector(
        (state) => state.product ?? {}
    );

    const warehouseState = useSelector(
        (state) => state.warehouse ?? {}
    );

    const unitState = useSelector(
        (state) => state.unit ?? {}
    );

    const sizeState = useSelector(
        (state) => state.size ?? {}
    );

    const actionLoading =
        inventoryState.actionLoading ?? false;


    const normalizeModule = (value) =>
        String(value ?? "").trim().toLowerCase();

    const normalizeAction = (value) =>
        String(value ?? "").trim().toUpperCase();

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

    const hasPermission = (moduleName, actionName) => {
        if (hasFullAccess) return true;

        const requestedModule = normalizeModule(moduleName);
        const requestedAction = normalizeAction(actionName);

        return permissions.some((permission) => {
            const permissionModule = normalizeModule(
                permission?.moduleName ||
                permission?.module?.moduleName ||
                permission?.module?.name ||
                ""
            );

            if (permissionModule !== requestedModule) return false;

            if (permission?.active === false) return false;

            if (normalizeAction(permission?.status) === "INACTIVE") {
                return false;
            }

            if (Array.isArray(permission?.actions)) {
                return permission.actions.some((action) => {
                    if (typeof action === "string") {
                        return normalizeAction(action) === requestedAction;
                    }

                    const permissionAction = normalizeAction(
                        action?.actionName ||
                        action?.action?.actionName ||
                        action?.action?.name ||
                        action?.name ||
                        ""
                    );

                    const allowed =
                        action?.allowed === true ||
                        action?.allowed === "true";

                    if (action?.active === false) return false;

                    if (normalizeAction(action?.status) === "INACTIVE") {
                        return false;
                    }

                    return (
                        permissionAction === requestedAction &&
                        allowed
                    );
                });
            }

            const permissionAction = normalizeAction(
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

    const canCreateOpeningStock = hasPermission(
        "Inventory",
        "CREATE"
    );

    const canEditOpeningStock = hasPermission(
        "Inventory",
        "EDIT"
    );

    const canAccessOpeningStock = isEdit
        ? canEditOpeningStock
        : canCreateOpeningStock;
    /* -----------------------------------------------------
       MASTER DATA

       Props take priority. If not passed, the component
       tries the corresponding Redux master-data arrays.
    ----------------------------------------------------- */

    const products =
        productsProp ??
        productState.products ??
        productState.items ??
        [];

    const warehouses =
        warehousesProp ??
        warehouseState.warehouses ??
        warehouseState.items ??
        [];

    const units =
        unitsProp ??
        unitState.units ??
        unitState.items ??
        [];

    const sizes =
        sizesProp ??
        sizeState.sizes ??
        sizeState.items ??
        [];

    /* -----------------------------------------------------
       FORM STATE
    ----------------------------------------------------- */

    const [formData, setFormData] = useState({
        productId: "",
        warehouseId: "",
        unitId: "",
        sizeId: "",
        quantity: "",
        unitCost: "",
        transactionDate: getLocalDateTime(),
        notes: "",
    });

    const [saveMenuOpen, setSaveMenuOpen] = useState(false);

    /* -----------------------------------------------------
       SELECT OPTIONS
    ----------------------------------------------------- */

    const productOptions = useMemo(
        () => toSelectOptions(products, getProductLabel),
        [products]
    );

    const warehouseOptions = useMemo(
        () => toSelectOptions(warehouses, getWarehouseLabel),
        [warehouses]
    );

    const unitOptions = useMemo(
        () => toSelectOptions(units, getUnitLabel),
        [units]
    );

    const sizeOptions = useMemo(
        () => toSelectOptions(sizes, getSizeLabel),
        [sizes]
    );

    /* -----------------------------------------------------
       CALCULATED VALUES
    ----------------------------------------------------- */

    const totalStockValue = useMemo(() => {
        const quantity = Number(formData.quantity) || 0;
        const unitCost = Number(formData.unitCost) || 0;

        return quantity * unitCost;
    }, [formData.quantity, formData.unitCost]);

    const selectedProduct = useMemo(() => {
        return products.find(
            (item) =>
                String(getItemId(item)) ===
                String(formData.productId)
        );
    }, [products, formData.productId]);

    const selectedWarehouse = useMemo(() => {
        return warehouses.find(
            (item) =>
                String(getItemId(item)) ===
                String(formData.warehouseId)
        );
    }, [warehouses, formData.warehouseId]);

    useEffect(() => {
        if (authChecking || !isAuthenticated) return;

        if (hasFullAccess) return;

        if (permissionsLoaded || permissionLoading) return;

        dispatch(getUserPermission());

    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    useEffect(() => {
        dispatch(fetchAllProducts());
        dispatch(fetchAllUnits());
        dispatch(fetchAllSizes());
        dispatch(fetchAllWarehouse());
    }, [dispatch])


    /* -----------------------------------------------------
       FORM HANDLERS
    ----------------------------------------------------- */

    const updateField = (field, value) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            productId: "",
            warehouseId: "",
            unitId: "",
            sizeId: "",
            quantity: "",
            unitCost: "",
            transactionDate: getLocalDateTime(),
            notes: "",
        });

        setSaveMenuOpen(false);
    };

    const handleClose = () => {
        if (actionLoading) return;

        if (onClose) {
            onClose();
            return;
        }

        navigate(-1);
    };

    /* -----------------------------------------------------
       ESCAPE KEY
    ----------------------------------------------------- */

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setSaveMenuOpen(false);

                if (!actionLoading) {
                    handleClose();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [actionLoading]);

    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

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

        if (
            formData.quantity === "" ||
            !Number.isFinite(Number(formData.quantity)) ||
            Number(formData.quantity) <= 0
        ) {
            toast.error("Please enter a quantity greater than zero.");
            return false;
        }

        if (
            formData.unitCost === "" ||
            !Number.isFinite(Number(formData.unitCost)) ||
            Number(formData.unitCost) < 0
        ) {
            toast.error("Please enter a valid unit cost.");
            return false;
        }

        if (!formData.transactionDate) {
            toast.error("Please select the transaction date.");
            return false;
        }

        return true;
    };

    /* -----------------------------------------------------
       SAVE OPENING STOCK
    ----------------------------------------------------- */

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
            quantity: Number(formData.quantity),
            unitCost: Number(formData.unitCost),
            transactionDate:
                formData.transactionDate.length === 16
                    ? `${formData.transactionDate}:00`
                    : formData.transactionDate,
            notes: formData.notes.trim(),
        };

        try {
            await dispatch(
                createOpeningStock(payload)
            ).unwrap();

            toast.success("Opening stock created successfully.");

            if (saveMode === "new") {
                resetForm();
                return;
            }

            handleClose();
        } catch (error) {
            const message =
                typeof error === "string"
                    ? error
                    : error?.message ??
                    error?.error ??
                    "Unable to create opening stock.";

            toast.error(message);
        }
    };

    if (!canAccessOpeningStock) {
        toast.error(
            isEdit
                ? "You do not have permission to edit opening stock."
                : "You do not have permission to create opening stock."
        );
        return;
    }

    /* -----------------------------------------------------
       FORM SUBMIT
    ----------------------------------------------------- */

    const handleSubmit = (event) => {
        event.preventDefault();
        handleSave("close");
    };


    if (authChecking) {
        return <InvoiceSkeleton />;
    }

    if (!isAuthenticated) {
        return null;
    }

    if (
        !hasFullAccess &&
        (permissionLoading || !permissionsLoaded)
    ) {
        return <InvoiceSkeleton />;
    }

    if (!canAccessOpeningStock) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 font-sans">
                <div className="px-6 text-center">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-semibold text-red-500">
                        !
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                        {isEdit
                            ? "You do not have permission to edit opening stock."
                            : "You do not have permission to create opening stock."}
                    </p>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                    >
                        Go Back
                    </button>

                </div>
            </div>
        );
    }
    /* =====================================================
      RENDER UI
    ===================================================== */

    return (
        <div className="flex h-full min-h-0 flex-col bg-gray-50 px-3 mr-3">

            <div className="mt-5 px-2 flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-50">

                {/* =========================================
                    HEADER
                ========================================= */}

                <header className="shrink-0 px-3 rounded-lg border border-lime-500 bg-white">

                    <div className="flex items-center justify-between gap-4 px-5 py-4">

                        <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <PackagePlus size={22} />
                            </div>

                            <div className="min-w-0">
                                <h1 className="truncate text-base font-semibold text-gray-700">
                                    Create Opening Stock
                                </h1>

                                <p className="mt-1 text-xs text-gray-400">
                                    Add initial stock quantity and cost for a product.
                                </p>
                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={actionLoading}
                            title="Close"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X size={18} />
                        </button>

                    </div>

                </header>


                {/* =========================================
                    FORM CONTENT
                ========================================= */}

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col overflow-hidden"
                >

                    <main className="min-h-0 flex-1 overflow-y-auto px-5 py-5 lg:px-1">

                        <div className="mx-auto flex max-w-10xl flex-col gap-5">

                            {/* =================================
                                PRODUCT AND WAREHOUSE
                            ================================= */}

                            <section className={sectionClass}>

                                <SectionHeading
                                    icon={Boxes}
                                    title="Product & Warehouse Details"
                                    description="Select the product and warehouse where the opening stock will be recorded."
                                />

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                    <FormField
                                        label="Product"
                                        required
                                    >
                                        <SelectField
                                            value={formData.productId}
                                            onChange={(value) =>
                                                updateField("productId", value)
                                            }
                                            options={productOptions}
                                            placeholder="Select product"
                                        />
                                    </FormField>


                                    <FormField
                                        label="Warehouse"
                                        required
                                    >
                                        <SelectField
                                            value={formData.warehouseId}
                                            onChange={(value) =>
                                                updateField("warehouseId", value)
                                            }
                                            options={warehouseOptions}
                                            placeholder="Select warehouse"
                                        />
                                    </FormField>


                                    <FormField
                                        label="Unit"
                                        required
                                        hint="Select the unit used to record this stock quantity."
                                    >
                                        <SelectField
                                            value={formData.unitId}
                                            onChange={(value) =>
                                                updateField("unitId", value)
                                            }
                                            options={unitOptions}
                                            placeholder="Select unit"
                                        />
                                    </FormField>


                                    <FormField
                                        label="Size"
                                        hint="Optional. Select a size if this product uses size variations."
                                    >
                                        <SelectField
                                            value={formData.sizeId}
                                            onChange={(value) =>
                                                updateField("sizeId", value)
                                            }
                                            options={sizeOptions}
                                            placeholder="Select size (optional)"
                                        />
                                    </FormField>

                                </div>

                            </section>


                            {/* =================================
                                OPENING STOCK QUANTITY AND COST
                            ================================= */}

                            <section className={sectionClass}>

                                <SectionHeading
                                    icon={Calculator}
                                    title="Opening Stock & Cost"
                                    description="Enter the initial quantity and unit cost. The total stock value is calculated automatically."
                                />

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                    <FormField
                                        label="Opening Quantity"
                                        required
                                        hint="Enter the initial quantity available in the selected warehouse."
                                    >
                                        <TextInput
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(value) =>
                                                updateField("quantity", value)
                                            }
                                            placeholder="Enter quantity"
                                            min="0.001"
                                            step="any"
                                        />
                                    </FormField>


                                    <FormField
                                        label="Unit Cost"
                                        required
                                        hint="Enter the cost for one unit of this product."
                                    >
                                        <TextInput
                                            type="number"
                                            value={formData.unitCost}
                                            onChange={(value) =>
                                                updateField("unitCost", value)
                                            }
                                            placeholder="Enter unit cost"
                                            min="0"
                                            step="0.01"
                                        />
                                    </FormField>

                                </div>


                                {/* TOTAL VALUE PREVIEW */}

                                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4">

                                    <div className="flex flex-wrap items-center justify-between gap-4">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                                                <Calculator size={19} />
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-gray-500">
                                                    Total Opening Stock Value
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    Quantity × Unit Cost
                                                </p>
                                            </div>

                                        </div>

                                        <p className="text-xl font-semibold tabular-nums text-blue-700">
                                            {formatCurrency(totalStockValue)}
                                        </p>

                                    </div>

                                </div>

                            </section>


                            {/* =================================
                                TRANSACTION DETAILS
                            ================================= */}

                            <section className={sectionClass}>

                                <SectionHeading
                                    icon={CalendarDays}
                                    title="Transaction Details"
                                    description="Set the date and add any notes related to this opening stock entry."
                                />

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                    <FormField
                                        label="Transaction Date"
                                        required
                                        hint="Date and time when the opening stock is recorded."
                                    >
                                        <TextInput
                                            type="datetime-local"
                                            value={formData.transactionDate}
                                            onChange={(value) =>
                                                updateField("transactionDate", value)
                                            }
                                        />
                                    </FormField>


                                    <FormField
                                        label="Notes"
                                        hint="Optional notes for reference."
                                    >
                                        <TextAreaField
                                            value={formData.notes}
                                            onChange={(value) =>
                                                updateField("notes", value)
                                            }
                                            placeholder="Enter opening stock notes..."
                                            rows={3}
                                            maxLength={500}
                                        />
                                    </FormField>

                                </div>

                            </section>


                            {/* =================================
                                SUMMARY
                            ================================= */}

                            <section className={sectionClass}>

                                <SectionHeading
                                    icon={CheckCircle2}
                                    title="Opening Stock Summary"
                                    description="Review the selected details before saving."
                                />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                        <p className="text-xs text-gray-400">
                                            Product
                                        </p>

                                        <p className="mt-2 truncate text-sm font-semibold text-gray-700">
                                            {selectedProduct
                                                ? getProductLabel(selectedProduct)
                                                : "Not selected"}
                                        </p>
                                    </div>


                                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                        <p className="text-xs text-gray-400">
                                            Warehouse
                                        </p>

                                        <p className="mt-2 truncate text-sm font-semibold text-gray-700">
                                            {selectedWarehouse
                                                ? getWarehouseLabel(selectedWarehouse)
                                                : "Not selected"}
                                        </p>
                                    </div>


                                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                        <p className="text-xs text-gray-400">
                                            Opening Quantity
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-gray-700">
                                            {formData.quantity || "0"}
                                        </p>
                                    </div>


                                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                        <p className="text-xs text-gray-400">
                                            Unit Cost
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-gray-700">
                                            {formatCurrency(formData.unitCost)}
                                        </p>
                                    </div>

                                </div>

                            </section>

                        </div>

                    </main>


                    {/* =====================================
                        FOOTER
                    ===================================== */}

                    <footer className="relative z-20 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-3.5 lg:px-7">

                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="text-red-500">*</span>
                            Required fields
                        </div>


                        <div className="flex flex-wrap items-center justify-end gap-2">

                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={actionLoading}
                                className={buttonSecondaryClass}
                            >
                                <ArrowLeft size={16} />
                                Cancel
                            </button>


                            {/* SAVE & NEW */}

                            <button
                                type="button"
                                onClick={() => handleSave("new")}
                                disabled={actionLoading}
                                className={buttonSecondaryClass}
                            >
                                {actionLoading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save & New"
                                )}
                            </button>


                            {/* SAVE DROPDOWN */}

                            <div className="relative">

                                <div className="flex overflow-hidden rounded-lg shadow-sm">

                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className={`${buttonPrimaryClass} rounded-r-none`}
                                    >
                                        {actionLoading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={16} />
                                                Save
                                            </>
                                        )}
                                    </button>


                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() =>
                                            setSaveMenuOpen((previous) => !previous)
                                        }
                                        className="inline-flex items-center justify-center border-l border-blue-400 bg-[#408DFB] px-3 text-white transition hover:bg-[#2878E8] disabled:cursor-not-allowed disabled:opacity-60"
                                        title="More save options"
                                    >
                                        <ChevronDown size={16} />
                                    </button>

                                </div>


                                {saveMenuOpen && (
                                    <>
                                        <button
                                            type="button"
                                            aria-label="Close save options"
                                            onClick={() => setSaveMenuOpen(false)}
                                            className="fixed inset-0 z-30 cursor-default"
                                        />

                                        <div className="absolute bottom-full right-0 z-40 mb-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSaveMenuOpen(false);
                                                    handleSave("new");
                                                }}
                                                disabled={actionLoading}
                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <PackagePlus
                                                    size={15}
                                                    className="text-gray-400"
                                                />
                                                Save & New
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSaveMenuOpen(false);
                                                    handleSave("close");
                                                }}
                                                disabled={actionLoading}
                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <CheckCircle2
                                                    size={15}
                                                    className="text-gray-400"
                                                />
                                                Save & Close
                                            </button>

                                        </div>
                                    </>
                                )}

                            </div>

                        </div>

                    </footer>

                </form>

            </div>

        </div>
    );
};

export default InventoryOpeningStock;