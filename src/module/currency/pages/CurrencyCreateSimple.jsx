
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Coins,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    FileText,
    CheckCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createCurrency,
    fetchAllCurrencies,
    fetchCurrencyById,
    updateCurrency,
} from "../thunks/currencyThunks";

import {
    resetCurrencyForm,
} from "../slices/currencySlice";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../common/custom/CustomSelect";



import LeaveConfirmationModal from "../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../../../common/confirmation/useLeaveConfirmation";

import { closeModal } from "../../../module/ui/uiSlice";

import {
    setCreatedExpenseReferenceSelection,
} from "../../../inventoryModule/module/expenses/slices/expenseSlice";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
    currencyCode: "",
    currencyName: "",
    symbol: "",
    decimalPlaces: 2,
    status: "ACTIVE",
    active: true,
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
    min,
    max,
}) => (
    <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        min={min}
        max={max}
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

const CurrencyCreateSimple = ({ onClose }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const isEditMode = Boolean(id);

    const modalData = useSelector(
        (state) => state.ui.modal?.data
    );

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const currencyState = useSelector(
        (state) => state.currency ?? {}
    );

    const {
        currency,
        loading = false,
    } = currencyState;

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


    const {
        showLeaveConfirmation,
        confirmLeave,
        handleStay,
        handleLeave,
    } = useLeaveConfirmation();


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
        "Currencies",
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
       FETCH CURRENCY FOR EDIT
    ===================================================== */

    useEffect(() => {

        if (!id || !isAuthenticated) {
            return;
        }

        dispatch(fetchCurrencyById(id));

    }, [dispatch, id, isAuthenticated]);

    /* =====================================================
       CHECK CURRENT CURRENCY
    ===================================================== */

    const isCurrentCurrencyLoaded =
        isEditMode &&
        currency?.id != null &&
        String(currency.id) === String(id);

    /* =====================================================
       POPULATE EDIT FORM
    ===================================================== */

    useEffect(() => {

        if (!isCurrentCurrencyLoaded) {
            return;
        }

        setFormData({
            currencyCode: currency.currencyCode ?? "",
            currencyName: currency.currencyName ?? "",
            symbol: currency.symbol ?? "",
            decimalPlaces: currency.decimalPlaces ?? 2,
            status: currency.status ?? "ACTIVE",
            active: currency.active ?? currency.status === "ACTIVE",
        });

    }, [
        isCurrentCurrencyLoaded,
        currency,
    ]);

    /* =====================================================
       STATUS OPTIONS
    ===================================================== */

    const statusOptions = useMemo(() => [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
    ], []);

    /* =====================================================
      CURRENCY SYMBOL OPTIONS
   ===================================================== */

    const currencySymbolOptions = useMemo(() => [
        { label: "₹", value: "₹" },
        { label: "$", value: "$" },
        { label: "€", value: "€" },
        { label: "AED", value: "AED" },
    ], []);


    /* =====================================================
     CURRENCY SYMBOL OPTIONS
  ===================================================== */

    const currencyCodeOptions = useMemo(() => [
        { label: "INR", value: "INR" },
        { label: "USD", value: "USD" },
        { label: "EURO", value: "EUR" },
        { label: "AED", value: "AED" },
    ], []);


    /* =====================================================
       DECIMAL PLACE OPTIONS
    ===================================================== */

    const decimalPlaceOptions = useMemo(() => [
        { label: "0 - No decimal places", value: 0 },
        { label: "1 - One decimal place", value: 1 },
        { label: "2 - Two decimal places", value: 2 },
        { label: "3 - Three decimal places", value: 3 },
        { label: "4 - Four decimal places", value: 4 },
    ], []);

    /* =====================================================
       HANDLE FIELD CHANGE
    ===================================================== */

    const handleChange = (field, value) => {

        setFormData((previous) => {

            const updated = {
                ...previous,
                [field]: value,
            };

            if (field === "status") {
                updated.active = value === "ACTIVE";
            }

            if (field === "active") {
                updated.status = value ? "ACTIVE" : "INACTIVE";
            }

            return updated;
        });
    };

    const handleClose = () => {
        confirmLeave(() => {
            if (onClose) {
                onClose();
            } else {
                navigate("/settings/currencies")
            }
        });
    };


    /* =====================================================
       RESET FORM
    ===================================================== */

    const getCurrencyFormData = () => ({
        currencyCode: currency.currencyCode ?? "",
        currencyName: currency.currencyName ?? "",
        symbol: currency.symbol ?? "",
        decimalPlaces: currency.decimalPlaces ?? 2,
        status: currency.status ?? "ACTIVE",
        active: currency.active ?? currency.status === "ACTIVE",
    });

    const handleReset = () => {

        if (isEditMode) {

            if (!isCurrentCurrencyLoaded) {
                return;
            }

            setFormData(getCurrencyFormData());

        } else {

            setFormData({
                ...initialFormData,
            });
        }

        setSaveMode("close");
        setShowSaveOptions(false);

        dispatch(resetCurrencyForm());
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {

        if (!formData.currencyCode.trim()) {
            toast.error("Currency code is required");
            return false;
        }

        if (!/^[A-Za-z]{3}$/.test(formData.currencyCode.trim())) {
            toast.error("Currency code must contain exactly 3 letters");
            return false;
        }

        if (!formData.currencyName.trim()) {
            toast.error("Currency name is required");
            return false;
        }

        if (!formData.symbol.trim()) {
            toast.error("Currency symbol is required");
            return false;
        }

        if (
            formData.decimalPlaces === "" ||
            !Number.isInteger(Number(formData.decimalPlaces)) ||
            Number(formData.decimalPlaces) < 0 ||
            Number(formData.decimalPlaces) > 4
        ) {
            toast.error("Select valid decimal places");
            return false;
        }

        if (!formData.status) {
            toast.error("Currency status is required");
            return false;
        }

        return true;
    };

    /* =====================================================
       SAVE CURRENCY
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) {
            return;
        }

        if (isEditMode && !isCurrentCurrencyLoaded) {
            toast.error("Currency details are still loading");
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
                `You do not have permission to ${isEditMode ? "edit" : "create"} currencies`
            );
            return;
        }

        if (!validateForm()) {
            return;
        }

        const payload = {
            currencyCode: formData.currencyCode.trim().toUpperCase(),
            currencyName: formData.currencyName.trim(),
            symbol: formData.symbol.trim(),
            decimalPlaces: Number(formData.decimalPlaces),
            status: formData.status,
            active: formData.status === "ACTIVE",
        };

        try {

            const response = isEditMode
                ? await dispatch(
                    updateCurrency({
                        id,
                        data: payload,
                    })
                ).unwrap()
                : await dispatch(
                    createCurrency(payload)
                ).unwrap();

            toast.success(
                response?.message ||
                `Currency ${isEditMode ? "updated" : "created"} successfully`
            );

            // Automatically select newly created party in Expense Vendor
            if (!isEditMode && modalData?.selectAfterCreate) {
                const CreatedCurrency =
                    response?.data?.data ??
                    response?.data ??
                    response;

                dispatch(
                    setCreatedExpenseReferenceSelection({
                        targetField: modalData.targetField,
                        entity: CreatedCurrency,
                    })
                );

                dispatch(fetchAllCurrencies());
                dispatch(closeModal());

                return;
            }


            dispatch(closeModal());
            dispatch(resetCurrencyForm());
            if (onClose || modalData) {
                dispatch(closeModal());
            } else {
                navigate("/settings/currencies");
            }

        } catch (error) {

            console.error(
                `Currency ${isEditMode ? "update" : "creation"} error:`,
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    `Failed to ${isEditMode ? "update" : "create"} currency`
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
        (loading || !isCurrentCurrencyLoaded)
    ) {

        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading currency...
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
                        {isEditMode ? "edit" : "create"} currencies.
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
                                ? "Edit Currency"
                                : "Create Currency"
                            }
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEditMode
                                ? "Update the existing currency information"
                                : "Create and configure your currency"
                            }
                        </p>
                    </div>

                </div>

                <div className="
                    hidden items-center gap-2 rounded-lg
                    bg-blue-50 px-3 py-2 sm:flex
                ">
                    <Coins size={16} className="text-[#408DFB]" />

                    <span className="text-xs font-medium text-[#408DFB]">
                        Currency
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

                    <section className="mb-7">

                        <SectionHeading
                            icon={Coins}
                            title="Currency Information"
                            description="Enter the currency code, name, symbol and formatting details"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-2
                        ">

                            <FormField label="Currency Code" required>
                                <CustomSelect
                                    value={formData.currencyCode}
                                    onChange={(value) =>
                                        handleChange(
                                            "currencyCode",
                                            value
                                        )
                                    }
                                    options={currencyCodeOptions}
                                    placeholder="Example: INR"
                                    maxLength={3}
                                />
                            </FormField>

                            <FormField label="Currency Name" required>
                                <TextInput
                                    value={formData.currencyName}
                                    onChange={(e) =>
                                        handleChange(
                                            "currencyName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Example: Indian Rupee"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField label="Currency Symbol" required>
                                <CustomSelect
                                    value={formData.symbol}
                                    onChange={(value) =>
                                        handleChange("symbol", value)
                                    }
                                    options={currencySymbolOptions}
                                    placeholder="Example: ₹"
                                    maxLength={10}
                                />
                            </FormField>

                            <FormField label="Decimal Places" required>
                                <CustomSelect
                                    value={Number(formData.decimalPlaces)}
                                    onChange={(value) =>
                                        handleChange(
                                            "decimalPlaces",
                                            Number(value)
                                        )
                                    }
                                    options={decimalPlaceOptions}
                                    placeholder="Select decimal places"
                                />
                            </FormField>

                            <FormField label="Currency Status" required>
                                <CustomSelect
                                    value={formData.status}
                                    onChange={(value) =>
                                        handleChange("status", value)
                                    }
                                    options={statusOptions}
                                    placeholder="Select currency status"
                                />
                            </FormField>

                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* STATUS INFORMATION */}

                    <section>

                        <SectionHeading
                            icon={CheckCircle}
                            title="Currency Availability"
                            description="Control whether this currency can be selected in the application"
                        />

                        <label className="
                            flex cursor-pointer items-center gap-3
                            rounded-lg border border-gray-100
                            bg-gray-50 p-4
                        ">

                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={(e) =>
                                    handleChange(
                                        "active",
                                        e.target.checked
                                    )
                                }
                                className="
                                    h-4 w-4 rounded border-gray-300
                                    text-blue-600 focus:ring-blue-500
                                "
                            />

                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    Enable this currency
                                </p>

                                <p className="mt-0.5 text-xs text-gray-400">
                                    Active currencies can be selected when creating invoices and transactions.
                                </p>
                            </div>

                        </label>

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
                                (isEditMode && !isCurrentCurrencyLoaded)
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

export default CurrencyCreateSimple;