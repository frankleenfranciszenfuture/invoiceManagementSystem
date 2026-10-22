
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
    Building2,
    UserRoundArrowLeft,
    X,
    Upload,
    Landmark,
    ChevronDown,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    resetCurrencyForm,
    setCurrencyField,
} from "../slices/currencySlice";

import {
    createCurrency,
    updateCurrency,
    fetchCurrencyById,
} from "../thunks/currencyThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../common/custom/CustomSelect";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FORM = {
    id: null,
    currencyCode: "",
    currencyName: "",
    symbol: "",
    decimalPlaces: "",
    status: "ACTIVE",
};

const TABS = [
    { id: "currency", label: "Currency Information" },

];

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "DRAFT", label: "Draft" },
];


/* =========================================================
   STYLES
========================================================= */

const labelClass =
    "mb-1.5 block text-xs font-medium text-[#0F4659]";



const getLabelClass = (required = false) => `
        block
        text-xs
        font-medium
        ${required ? "text-red-500" : "text-[#0F4659]"}
        mb-1.5
    `;

const errorClass =
    "mt-1 text-xs text-red-500";

const inputBaseClass =
    "h-10 w-full rounded-md border bg-white px-3 text-sm " +
    "text-[#0F4659] transition focus:outline-none focus:ring-2";

const textareaBaseClass =
    "w-full rounded-md border bg-white px-3 py-2 text-sm " +
    "text-[#0F4659] resize-none focus:outline-none focus:ring-2";

const inputClass = (hasError = false) =>
    `${inputBaseClass} ${hasError
        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
        : "border-gray-300 focus:border-[#0F4659] focus:ring-[#0F4659]/20"
    }`;

const textareaClass = (hasError = false) =>
    `${textareaBaseClass} ${hasError
        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
        : "border-gray-300 focus:border-[#0F4659] focus:ring-[#0F4659]/20"
    }`;

const normalizeModule = (value) =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

const normalizeAction = (value) =>
    String(value ?? "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");

const isTrue = (value) =>
    value === true || value === "true";

const getFileUrl = (value) => {
    if (typeof value === "string") {
        return value;
    }

    if (value && typeof value === "object") {
        return (
            value.url ||
            value.fileUrl ||
            value.path ||
            ""
        );
    }

    return "";
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CurrencyCreateSimple() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);

    /* =====================================================
       REDUX
    ===================================================== */

    const currencyState = useSelector(
        (state) => state.currency || {}
    );

    const {
        currency,
        loading,
    } = currencyState;

    const authState = useSelector(
        (state) => state.auth || {}
    );

    const { user } = authState;

    const permissionState = useSelector(
        (state) => state.menuPermission || {}
    );

    const form = currency || INITIAL_FORM;

    /* =====================================================
       AUTH
    ===================================================== */

    const isAuthenticated =
        authState.isAuthenticated !== false;

    const authChecking = Boolean(
        authState.authChecking ?? authState.loading
    );

    /* =====================================================
       LOCAL STATE
    ===================================================== */

    const [activeTab, setActiveTab] = useState("currency");

    const [showSaveMenu, setShowSaveMenu] = useState(false);

    const [editLoading, setEditLoading] = useState(isEdit);

    const [editLoadError, setEditLoadError] = useState(false);

    const [errors, setErrors] = useState({});

    /* =====================================================
       PERMISSIONS
    ===================================================== */

    const userPermissions = Array.isArray(
        permissionState.userPermissions
    )
        ? permissionState.userPermissions
        : [];

    const permissionLoading = Boolean(
        permissionState.userPermissionsLoading ??
        permissionState.loading
    );

    const permissionsLoaded =
        permissionState.userPermissionsLoaded === true ||
        permissionState.permissionsLoaded === true ||
        permissionState.loaded === true ||
        (
            permissionState.userPermissions !== undefined &&
            permissionState.userPermissions !== null
        );

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

    const normalizedRole = normalizeAction(
        typeof role === "object"
            ? role?.name || role?.roleName
            : role
    );

    const hasFullAccess = [
        "ADMIN",
        "SUPER_ADMIN",
    ].includes(normalizedRole);

    const hasPermission = (moduleName, actionName) => {
        if (hasFullAccess) {
            return true;
        }

        const requestedModule = normalizeModule(moduleName);
        const requestedAction = normalizeAction(actionName);

        return userPermissions.some((permission) => {
            const permissionModule = normalizeModule(
                permission?.moduleName ||
                permission?.module?.moduleName ||
                permission?.module?.name ||
                ""
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

            const nestedActions = Array.isArray(
                permission?.actions
            )
                ? permission.actions
                : [];

            const matchingNestedAction = nestedActions.find(
                (action) => {
                    const actionNameValue =
                        typeof action === "string"
                            ? action
                            : (
                                action?.actionName ||
                                action?.action?.actionName ||
                                action?.action?.name ||
                                action?.name ||
                                ""
                            );

                    return (
                        normalizeAction(actionNameValue) ===
                        requestedAction
                    );
                }
            );

            if (matchingNestedAction !== undefined) {
                if (typeof matchingNestedAction === "string") {
                    return true;
                }

                return (
                    matchingNestedAction?.active !== false &&
                    normalizeAction(
                        matchingNestedAction?.status
                    ) !== "INACTIVE" &&
                    (
                        isTrue(matchingNestedAction?.allowed) ||
                        isTrue(matchingNestedAction?.isAllowed)
                    )
                );
            }

            const directAction = normalizeAction(
                permission?.actionName ||
                permission?.action?.actionName ||
                permission?.action?.name ||
                ""
            );

            return (
                directAction === requestedAction &&
                (
                    isTrue(permission?.allowed) ||
                    isTrue(permission?.isAllowed)
                )
            );
        });
    };

    const hasCreatePermission = hasPermission(
        "Currencies",
        "CREATE"
    );

    const hasEditPermission = hasPermission(
        "Currencies",
        "EDIT"
    );

    const hasSavePermission = isEdit
        ? hasEditPermission
        : hasCreatePermission;

    /* =====================================================
       LOAD PERMISSIONS
    ===================================================== */

    useEffect(() => {
        if (
            authChecking ||
            !isAuthenticated ||
            hasFullAccess
        ) {
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
       LOAD SALES PERSON FOR EDIT
    ===================================================== */

    useEffect(() => {
        let cancelled = false;

        const loadCurrency = async () => {
            if (!isEdit) {
                dispatch(resetCurrencyForm());

                setEditLoading(false);
                setEditLoadError(false);

                return;
            }

            setEditLoading(true);
            setEditLoadError(false);

            dispatch(resetCurrencyForm());

            try {
                const response = await dispatch(
                    fetchCurrencyById(id)
                ).unwrap();

                if (cancelled) {
                    return;
                }

                const result =
                    response?.data?.data ??
                    response?.data ??
                    response?.company ??
                    response;

                if (
                    !result ||
                    typeof result !== "object" ||
                    Array.isArray(result) ||
                    result.id == null
                ) {
                    throw new Error(
                        "Currency details were not found."
                    );
                }

                const populatedForm = {
                    ...INITIAL_FORM,
                    ...result,

                    id: result.id,

                    currencyCode: result.currencyCode || "",

                    currencyName: result.currencyName || "",

                    symbol: result.symbol || "",

                    decimalPlaces: result.decimalPlaces || "",

                    status: result.status || "ACTIVE",
                };

                Object.entries(populatedForm).forEach(
                    ([field, value]) => {
                        dispatch(
                            setCurrencyField({
                                field,
                                value,
                            })
                        );
                    }
                );
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Failed to load currency:",
                    error
                );

                setEditLoadError(true);

                toast.error(
                    typeof error === "string"
                        ? error
                        : error?.message ||
                        "Failed to load currency details."
                );
            } finally {
                if (!cancelled) {
                    setEditLoading(false);
                }
            }
        };

        loadCurrency();

        return () => {
            cancelled = true;
        };
    }, [dispatch, id, isEdit]);

    /* =====================================================
       FIELD HANDLERS
    ===================================================== */

    const handleChange = (field, value) => {
        dispatch(
            setCurrencyField({
                field,
                value,
            })
        );

        setErrors((previous) => {
            if (!previous[field]) {
                return previous;
            }

            const updated = { ...previous };
            delete updated[field];

            return updated;
        });
    };

    const handleFileChange = (field, file) => {
        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must not exceed 5 MB.");
            return;
        }

        handleChange(field, file);
    };

    /* =====================================================
       CLOSE
    ===================================================== */

    const handleClose = () => {
        if (loading || editLoading) {
            return;
        }

        setShowSaveMenu(false);
        setErrors({});

        dispatch(resetCurrencyForm());

        setActiveTab("currency");

        navigate("/currencies");
    };

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
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
    }, [loading, editLoading]);

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        const nextErrors = {};

        if (!form.currencyName?.trim()) {
            nextErrors.currencyName =
                "Currency currencyName is required.";
        }

        if (!form.symbol?.trim()) {
            nextErrors.symbol =
                "Currency symbol is required.";
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            const tabFields = {
                currency: [
                    "currencyName",
                    "symbol",
                    "decimalPlaces",
                ],

            };

            const firstTab = Object.entries(tabFields).find(
                ([, fields]) =>
                    fields.some((field) => nextErrors[field])
            );

            setActiveTab(firstTab?.[0] || "salesPerson");

            toast.error(
                Object.values(nextErrors)[0]
            );

            return false;
        }

        return true;
    };

    /* =====================================================
       SAVE
    ===================================================== */

    const handleSave = async ({
        saveAndNew = false,
        saveAndClose = true,
    } = {}) => {
        if (!isAuthenticated) {
            toast.error("You are not authenticated.");
            return;
        }

        if (loading || editLoading) {
            return;
        }

        if (isEdit && editLoadError) {
            toast.error(
                "Cannot update because company details failed to load."
            );
            return;
        }

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

        if (!hasSavePermission) {
            toast.error(
                isEdit
                    ? "You do not have permission to edit companies."
                    : "You do not have permission to create companies."
            );
            return;
        }

        if (!validateForm()) {
            return;
        }

        const payload = {
            ...form,

            currencyCode: form.currencyCode.trim().toUpperCase(),
            currencyName: form.currencyName.trim(),
            symbol: form.symbol?.trim() || "",
            decimalPlaces: Number(form.decimalPlaces ?? 2),
            status: form.status ?? "ACTIVE",
            active: form.active ?? true,
        };

        try {
            if (isEdit) {
                await dispatch(
                    updateCurrency({
                        id: Number(id),
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Currency updated successfully."
                );
            } else {
                await dispatch(
                    createCurrency(payload)
                ).unwrap();

                toast.success(
                    "Currency created successfully."
                );
            }

            setShowSaveMenu(false);
            setErrors({});

            if (saveAndNew && !isEdit) {
                dispatch(resetCurrencyForm());

                setActiveTab("currency");

                return;
            }

            dispatch(resetCurrencyForm());

            setActiveTab("currency");

            if (saveAndClose) {
                navigate("/currencies");
            }
        } catch (error) {
            console.error(
                isEdit
                    ? "Currency update error:"
                    : "Currency create error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update currency."
                            : "Failed to create currency."
                    )
            );
        }
    };

    /* =====================================================
       REUSABLE FIELD
    ===================================================== */

    const renderInput = ({
        field,
        label,
        placeholder = "",
        type = "text",
        required = false,
        maxLength,
        onValueChange,
    }) => (
        <div>
            <label className={required ? getLabelClass(true) : labelClass}>
                {label}
                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <input
                type={type}
                value={form[field] ?? ""}
                maxLength={maxLength}
                placeholder={placeholder}
                onChange={(event) => {
                    const rawValue = event.target.value;

                    const value = onValueChange
                        ? onValueChange(rawValue)
                        : rawValue;

                    handleChange(field, value);
                }}
                className={inputClass(Boolean(errors[field]))}
            />

            {errors[field] && (
                <p className={errorClass}>
                    {errors[field]}
                </p>
            )}
        </div>
    );

    const renderSelect = ({
        field,
        label,
        options,
        required = false,
    }) => (
        <div>
            <label className={required ? getLabelClass(true) : labelClass}>
                {label}
                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <CustomSelect
                value={form[field] || ""}
                onChange={(value) => handleChange(field, value)}
                options={options}
            />

            {errors[field] && (
                <p className={errorClass}>
                    {errors[field]}
                </p>
            )}
        </div>
    );

    /* =====================================================
       COMPANY TAB
    ===================================================== */

    const renderCurrencyTab = () => (
        <div className="w-full max-w-7xl">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-[#0F4659]">
                        Currency Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Enter the basic information of the currency.
                    </p>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="space-y-5">

                        {renderInput({
                            field: "currencyName",
                            label: "Currency Name",
                            placeholder: "Enter currency name (e.g., US Dollar, Euro, Indian Rupee)",
                            required: true,
                        })}
                        {renderInput({
                            field: "currencyCode",
                            label: "Currency Code",
                            placeholder: "Enter currency code (e.g., USD, EUR, INR)",
                            required: true,
                        })}


                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                            {renderInput({
                                field: "symbol",
                                label: "Currency Symbol",
                                placeholder: "Enter currency symbol (e.g., ₹, $, €, £)",
                                required: true,
                            })}
                            {renderInput({
                                field: "decimalPlaces",
                                label: "Decimal Places",
                                placeholder: "Enter decimal places (e.g., 2 for USD, 3 for JPY)",
                                required: true,
                                type: "number",
                                min: 0,
                            })}
                        </div>


                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="mb-4 flex items-center gap-2">
                            <Building2
                                size={18}
                                className="text-[#0F4659]"
                            />

                            <h3 className="text-sm font-semibold text-gray-800">
                                Currency Status
                            </h3>
                        </div>

                        {renderSelect({
                            field: "status",
                            label: "Status",
                            options: STATUS_OPTIONS,
                            required: true,
                        })}

                        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">
                                Currency status controls whether this
                                currency is available for normal transactions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );


    /* =====================================================
       AUTH CHECK
    ===================================================== */

    if (authChecking) {
        return (
            <div className="flex min-h-40 items-center justify-center">
                <p className="text-sm text-gray-500">
                    Checking authentication...
                </p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-64 items-center justify-center px-6">
                <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                    <UserRoundArrowLeft
                        className="mx-auto mb-4 text-red-500"
                        size={42}
                    />

                    <h2 className="text-lg font-semibold text-gray-800">
                        Authentication Required
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Please sign in to manage companies.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/salesPersons")}
                        className="mt-6 rounded-md bg-[#0F4659] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0F4659]/90"
                    >
                        Back to Sales Persons
                    </button>
                </div>
            </div>
        );
    }

    if (
        !hasFullAccess &&
        (
            permissionLoading ||
            !permissionsLoaded
        )
    ) {
        return (
            <div className="flex min-h-40 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[#0F4659]/20 border-t-[#0F4659]" />

                    <p className="text-sm font-medium text-gray-600">
                        Loading permissions...
                    </p>
                </div>
            </div>
        );
    }

    if (!hasSavePermission) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-full max-w-md text-center">
                    <UserRoundArrowLeft
                        size={28}
                        className="mx-auto mb-3 text-red-500"
                    />

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        {isEdit
                            ? "You do not have permission to edit currencies."
                            : "You do not have permission to create currencies."}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/currencies")}
                        className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm text-[#0F4659] hover:bg-gray-50"
                    >
                        Back to Currencies
                    </button>
                </div>
            </div>
        );
    }

    if (editLoading) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center bg-gray-50">
                <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[#0F4659]/20 border-t-[#0F4659]" />

                <p className="text-sm font-medium text-[#0F4659]">
                    Loading currency details...
                </p>
            </div>
        );
    }

    if (isEdit && editLoadError) {
        return (
            <div className="flex min-h-64 items-center justify-center px-4">
                <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center">
                    <Building2
                        size={32}
                        className="mx-auto mb-3 text-red-500"
                    />

                    <h2 className="text-lg font-semibold text-[#0F4659]">
                        Unable to Load Currency Details
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Currency details could not be loaded.
                        Return to the currency list and try again.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/currencies")}
                        className="mt-5 h-10 rounded-md bg-[#0F4659] px-5 text-sm font-medium text-white hover:bg-[#0F4659]/90"
                    >
                        Back to Currencies
                    </button>
                </div>
            </div>
        );
    }

    /* =====================================================
       MAIN UI
    ===================================================== */

    return (
        <div className="flex flex-col h-full min-h-0 bg-gray-50 px-3.5 py-5">
            {/* HEADER */}

            <div className="shrink-0 px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg bg-[#0F4659]/20 border border-blue-100 flex items-center justify-center cursor-pointer"
                        onClick={() => navigate("/currencies")}
                    >
                        <Landmark
                            size={20}
                            className="text-[#0F4659]"
                        />
                    </div>


                    <div>
                        <h1 className="text-lg font-semibold text-[#0F4659]">
                            {isEdit ? "Edit Currency" : "New Currency"}
                        </h1>

                        <p className="mt-0.5 text-xs text-gray-500">
                            {isEdit
                                ? `Update currency details${form.name ? ` — ${form.name}` : ""}`
                                : "Create new currency details"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={loading || editLoading}
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
            </div>

            {/* TABS */}

            <div className="flex shrink-0 items-center gap-7 overflow-x-auto border-b border-gray-200 bg-white px-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`whitespace-nowrap border-b-2 py-3 text-sm font-medium transition ${activeTab === tab.id
                            ? "border-[#0F4659] text-[#0F4659]"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* BODY */}

            <div className="min-h-0 flex-1 overflow-y-auto py-6">
                {activeTab === "currency" && renderCurrencyTab()}

            </div>

            {/* FOOTER */}

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-6 py-3">
                <div className="text-xs text-gray-500">
                    <span className="text-red-500">*</span>
                    {" "}Required fields
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        disabled={loading || editLoading}
                        onClick={handleClose}
                        className="h-10 rounded-md border border-gray-300 bg-white px-5 text-sm font-medium text-[#0F4659] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <div className="relative flex">
                        <button
                            type="button"
                            disabled={loading || editLoading}
                            onClick={() =>
                                handleSave({
                                    saveAndNew: false,
                                    saveAndClose: true,
                                })
                            }
                            className="h-10 rounded-l-md bg-[#0F4659] px-5 text-sm font-medium text-white hover:bg-[#0F4659]/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? isEdit
                                    ? "Updating..."
                                    : "Saving..."
                                : isEdit
                                    ? "Update Currency"
                                    : "Save Currency"}
                        </button>

                        <button
                            type="button"
                            disabled={loading || editLoading}
                            onClick={() =>
                                setShowSaveMenu((previous) => !previous)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-r-md border-l border-white/30 bg-[#0F4659] text-white hover:bg-[#0F4659]/90 disabled:opacity-50"
                            aria-label="More save options"
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
                                <button
                                    type="button"
                                    aria-label="Close save options"
                                    className="fixed inset-0 z-[80] cursor-default"
                                    onClick={() => setShowSaveMenu(false)}
                                />

                                <div className="absolute bottom-full right-0 z-[90] mb-2 w-56 overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl">
                                    {!isEdit && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowSaveMenu(false);

                                                handleSave({
                                                    saveAndNew: true,
                                                    saveAndClose: false,
                                                });
                                            }}
                                            className="w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
                                        >
                                            <div className="text-sm font-medium text-gray-700">
                                                Save & New
                                            </div>

                                            <div className="mt-0.5 text-xs text-gray-400">
                                                Save and create another currency
                                            </div>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSaveMenu(false);

                                            handleSave({
                                                saveAndNew: false,
                                                saveAndClose: true,
                                            });
                                        }}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50"
                                    >
                                        <div className="text-sm font-medium text-gray-700">
                                            {isEdit
                                                ? "Update & Close"
                                                : "Save & Close"}
                                        </div>

                                        <div className="mt-0.5 text-xs text-gray-400">
                                            Save and return to currency list
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
