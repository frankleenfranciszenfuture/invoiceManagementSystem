
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
    Building2,
    UserRoundArrowLeft,
    Upload,
    Landmark,
    ChevronDown,
} from "lucide-react";

import toast from "react-hot-toast";

import { closeModal } from "../../ui/uiSlice";

import {
    resetSalesPersonForm,
    setSalesPersonField,
} from "../slices/salesPersonSlice";

import {
    createSalesPerson,
    updateSalesPerson,
    fetchSalesPersonById,
} from "../thunks/salesPersonThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../common/custom/CustomSelect";
import CustomStatusSelect from "../../../common/custom/CustomStatusSelect";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FORM = {
    id: null,
    salesPersonCode: "",
    salesPersonType: "",
    salesPersonName: "",
    email: "",
    mobile: "",
    status: "ACTIVE",
};

const TABS = [
    { id: "salesPerson", label: "Sales Person Information" },
];

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "DRAFT", label: "Draft" },
];

const SALESPERSON_OPTIONS = [
    { value: "EMPLOYEE", label: "Employee" },
    { value: "AGENT", label: "Agent" },
    { value: "COMMISSION_BASED", label: "Commission Based" },
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

const errorClass = "mt-1 text-xs text-red-500";

const inputBaseClass =
    "h-10 w-full rounded-md border bg-white px-3 text-sm " +
    "text-[#0F4659] transition focus:outline-none focus:ring-2";

const inputClass = (hasError = false) =>
    `${inputBaseClass} ${hasError
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

/* =========================================================
   COMPONENT
========================================================= */

export default function SalesPersonCreateModel() {
    const dispatch = useDispatch();

    /* =====================================================
       MODAL STATE
    ===================================================== */

    const modal = useSelector(
        (state) => state.ui?.modal || {}
    );

    const modalType = modal.type;

    const isEdit = modalType === "editSalesPerson";

    const modalData = modal.data;

    const id =
        typeof modalData === "object"
            ? modalData?.id
            : modalData;

    /* =====================================================
       REDUX
    ===================================================== */

    const salesPersonState = useSelector(
        (state) => state.salesPerson || {}
    );

    const {
        salesPerson,
        loading = false,
    } = salesPersonState;

    const authState = useSelector(
        (state) => state.auth || {}
    );

    const { user } = authState;

    const permissionState = useSelector(
        (state) => state.menuPermission || {}
    );

    const form = salesPerson || INITIAL_FORM;

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

    const [activeTab, setActiveTab] = useState("salesPerson");

    const [showSaveMenu, setShowSaveMenu] = useState(false);

    const [editLoading, setEditLoading] = useState(false);

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
        "SalesPersons",
        "CREATE"
    );

    const hasEditPermission = hasPermission(
        "SalesPersons",
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
            hasFullAccess ||
            permissionsLoaded ||
            permissionLoading
        ) {
            return;
        }

        dispatch(getUserPermission());
    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    /* =====================================================
       RESET FORM WHEN MODAL OPENS / CHANGES
    ===================================================== */

    useEffect(() => {
        setActiveTab("salesPerson");
        setShowSaveMenu(false);
        setErrors({});
        setEditLoadError(false);

        dispatch(resetSalesPersonForm());

        if (!isEdit) {
            setEditLoading(false);
        }
    }, [
        dispatch,
        modalType,
        id,
        isEdit,
    ]);

    /* =====================================================
       LOAD SALES PERSON FOR EDIT
    ===================================================== */

    useEffect(() => {
        let cancelled = false;

        const loadSalesPerson = async () => {
            if (!isEdit || !id) {
                setEditLoading(false);
                return;
            }

            setEditLoading(true);
            setEditLoadError(false);

            try {
                const response = await dispatch(
                    fetchSalesPersonById(id)
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
                        "Sales person details were not found."
                    );
                }

                const populatedForm = {
                    ...INITIAL_FORM,
                    ...result,

                    id: result.id,

                    salesPersonCode:
                        result.salesPersonCode || "",

                    salesPersonType:
                        result.salesPersonType || "",

                    salesPersonName:
                        result.salesPersonName || "",

                    email: result.email || "",

                    mobile: result.mobile || "",

                    status: result.status || "ACTIVE",
                };

                Object.entries(populatedForm).forEach(
                    ([field, value]) => {
                        dispatch(
                            setSalesPersonField({
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
                    "Failed to load sales person:",
                    error
                );

                setEditLoadError(true);

                toast.error(
                    typeof error === "string"
                        ? error
                        : error?.message ||
                        "Failed to load sales person details."
                );
            } finally {
                if (!cancelled) {
                    setEditLoading(false);
                }
            }
        };

        loadSalesPerson();

        return () => {
            cancelled = true;
        };
    }, [
        dispatch,
        id,
        isEdit,
    ]);

    /* =====================================================
       FIELD HANDLERS
    ===================================================== */

    const handleChange = (field, value) => {
        dispatch(
            setSalesPersonField({
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

    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    const handleClose = () => {
        if (loading || editLoading) {
            return;
        }

        setShowSaveMenu(false);
        setErrors({});
        setActiveTab("salesPerson");

        dispatch(resetSalesPersonForm());
        dispatch(closeModal());
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        const nextErrors = {};

        if (!form.salesPersonName?.trim()) {
            nextErrors.salesPersonName =
                "Sales person name is required.";
        }

        if (!form.salesPersonType?.trim()) {
            nextErrors.salesPersonType =
                "Sales person type is required.";
        }

        if (!form.mobile?.trim()) {
            nextErrors.mobile =
                "Mobile number is required.";
        } else if (!/^\d{10}$/.test(form.mobile.trim())) {
            nextErrors.mobile =
                "Mobile number must contain 10 digits.";
        }

        if (
            form.email?.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                form.email.trim()
            )
        ) {
            nextErrors.email =
                "Enter a valid email address.";
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            setActiveTab("salesPerson");

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
                "Cannot update because sales person details failed to load."
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
                    ? "You do not have permission to edit sales persons."
                    : "You do not have permission to create sales persons."
            );
            return;
        }

        if (!validateForm()) {
            return;
        }

        const payload = {
            ...form,

            salesPersonName:
                form.salesPersonName?.trim() || "",

            salesPersonType:
                form.salesPersonType?.trim() || "",

            salesPersonCode:
                form.salesPersonCode?.trim() || "",

            email:
                form.email?.trim() || "",

            mobile:
                form.mobile?.trim() || "",

            status: form.status || "ACTIVE",
        };

        try {
            if (isEdit) {
                await dispatch(
                    updateSalesPerson({
                        id: Number(id),
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Sales Person updated successfully."
                );
            } else {
                await dispatch(
                    createSalesPerson(payload)
                ).unwrap();

                toast.success(
                    "Sales Person created successfully."
                );
            }

            setShowSaveMenu(false);
            setErrors({});

            // Save & New: reset form and keep Add modal open
            if (saveAndNew && !isEdit) {
                dispatch(resetSalesPersonForm());

                setActiveTab("salesPerson");
                setEditLoadError(false);

                return;
            }

            // Save / Update: close modal
            dispatch(resetSalesPersonForm());
            dispatch(closeModal());

        } catch (error) {
            console.error(
                isEdit
                    ? "Sales Person update error:"
                    : "Sales Person create error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update sales person."
                            : "Failed to create sales person."
                    )
            );
        }
    };

    /* =====================================================
       REUSABLE INPUT
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
            <label
                className={
                    required
                        ? getLabelClass(true)
                        : labelClass
                }
            >
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
                className={inputClass(
                    Boolean(errors[field])
                )}
            />

            {errors[field] && (
                <p className={errorClass}>
                    {errors[field]}
                </p>
            )}
        </div>
    );

    /* =====================================================
       REUSABLE SELECT
    ===================================================== */

    const renderSelect = ({
        field,
        label,
        options,
        required = false,
    }) => (
        <div>
            <label
                className={
                    required
                        ? getLabelClass(true)
                        : labelClass
                }
            >
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <CustomSelect
                value={form[field] || ""}
                onChange={(value) =>
                    handleChange(field, value)
                }
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
       STATUS SELECT
    ===================================================== */

    const renderStatusSelect = ({
        field,
        label,
        options,
        required = false,
    }) => (
        <div>
            <label
                className={
                    required
                        ? getLabelClass(true)
                        : labelClass
                }
            >
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <CustomStatusSelect
                value={form[field] || ""}
                onChange={(value) =>
                    handleChange(field, value)
                }
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
       SALES PERSON TAB
    ===================================================== */

    const renderSalesPersonTab = () => (
        <div className="w-full min-w-0">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-gray-500">
                        Sales Person Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                        Enter the basic information of the sales person.
                    </p>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {renderSelect({
                                field: "salesPersonType",
                                label: "Sales Person Type",
                                options: SALESPERSON_OPTIONS,
                                required: true,
                            })}

                            {renderInput({
                                field: "salesPersonName",
                                label: "Sales Person Name",
                                placeholder: "Enter sales person name",
                                required: true,
                            })}
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {renderInput({
                                field: "mobile",
                                label: "Mobile",
                                placeholder: "10 digit phone number",
                                required: true,
                                maxLength: 10,
                                onValueChange: (value) =>
                                    value.replace(/\D/g, ""),
                            })}

                            {renderInput({
                                field: "email",
                                label: "Email",
                                placeholder: "Email address",
                                type: "email",
                                required: true,
                            })}
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="mb-4 flex items-center gap-2">
                            <Building2
                                size={18}
                                className="text-gray-500"
                            />

                            <h3 className="text-sm font-semibold text-gray-500">
                                Sales Person Status
                            </h3>
                        </div>

                        {renderStatusSelect({
                            field: "status",
                            label: "Status",
                            options: STATUS_OPTIONS,
                            required: true,
                        })}

                        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
                            <p className="text-xs text-gray-500">
                                Sales person status controls whether this
                                sales person is available for normal transactions.
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
                        Please sign in to manage sales persons.
                    </p>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="mt-6 rounded-md bg-[#0F4659] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0F4659]/90"
                    >
                        Close
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
                            ? "You do not have permission to edit sales persons."
                            : "You do not have permission to create sales persons."}
                    </p>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm text-[#0F4659] hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (editLoading) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center">
                <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-[#0F4659]/20 border-t-[#0F4659]" />

                <p className="text-sm font-medium text-[#0F4659]">
                    Loading sales person details...
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
                        Unable to Load Sales Person Details
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Sales person details could not be loaded.
                        Close this window and try again.
                    </p>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="mt-5 h-10 rounded-md bg-[#0F4659] px-5 text-sm font-medium text-white hover:bg-[#0F4659]/90"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    /* =====================================================
       MAIN MODAL UI
    ===================================================== */

    return (
        <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-gray-50">
            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between rounded border border-lime-400 bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-100 bg-[#408DFB]">
                        <Landmark
                            size={20}
                            className="text-gray-100"
                        />
                    </div>

                    <div>
                        <h1 className="text-lg font-semibold text-gray-500">
                            {isEdit
                                ? "Edit Sales Person"
                                : "New Sales Person"}
                        </h1>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEdit
                                ? `Update sales person details${form.salesPersonName
                                    ? ` — ${form.salesPersonName}`
                                    : ""
                                }`
                                : "Create new sales person details"}
                        </p>
                    </div>
                </div>
            </div>

            {/* TABS */}

            <div className="flex shrink-0 items-center gap-7 overflow-x-auto border-b border-gray-200 bg-white px-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`whitespace-nowrap border-b-2 py-3 text-sm font-medium transition ${activeTab === tab.id
                            ? "border-lime-500 text-gray-400"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* BODY */}

            <div className="min-h-0 flex-1 overflow-y-auto px-3.5 py-5">
                {activeTab === "salesPerson" &&
                    renderSalesPersonTab()}
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
                            onClick={() => handleSave()}
                            className="h-10 rounded-l-md bg-[#408DFB] px-5 text-sm font-medium text-white hover:bg-[#408DFB]/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? isEdit
                                    ? "Updating..."
                                    : "Saving..."
                                : isEdit
                                    ? "Update Sales Person"
                                    : "Save Sales Person"}
                        </button>

                        <button
                            type="button"
                            disabled={loading || editLoading}
                            onClick={() =>
                                setShowSaveMenu((previous) => !previous)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-r-md border-l border-white/30 bg-[#408DFB] text-white hover:bg-[#408DFB]/90 disabled:opacity-50"
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
                                    onClick={() =>
                                        setShowSaveMenu(false)
                                    }
                                />

                                <div className="absolute bottom-full right-0 z-[90] mb-2 w-56 overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl">
                                    {!isEdit && (
                                        <button
                                            type="button"
                                            disabled={loading || editLoading}
                                            onClick={() =>
                                                handleSave({
                                                    saveAndNew: true,
                                                })
                                            }
                                            className="w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <div className="text-sm font-medium text-gray-700">
                                                Save & New
                                            </div>

                                            <div className="mt-0.5 text-xs text-gray-400">
                                                Save and create another sales person
                                            </div>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        disabled={loading || editLoading}
                                        onClick={() => handleSave()}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <div className="text-sm font-medium text-gray-700">
                                            {isEdit
                                                ? "Update & Close"
                                                : "Save & Close"}
                                        </div>

                                        <div className="mt-0.5 text-xs text-gray-400">
                                            Save and close this window
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
