
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
    resetCompanyForm,
    setCompanyField,
} from "../slices/companySlice";

import {
    createCompany,
    updateCompany,
    fetchCompanyById,
} from "../thunks/companyThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../common/custom/CustomSelect";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FORM = {
    id: null,
    companyName: "",
    displayName: "",
    legalName: "",
    companyCode: "",
    gstNumber: "",
    panNumber: "",
    tanNumber: "",
    email: "",
    phone: "",
    alternatePhone: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    invoicePrefix: "NT",
    invoiceStartNumber: "1",
    currency: "INR",
    financialYearStart: "",
    status: "ACTIVE",
    logo: null,
    signature: null,
};

const TABS = [
    { id: "company", label: "Company Information" },
    { id: "contact", label: "Contact & Address" },
    { id: "tax", label: "Tax & Registration" },
    { id: "settings", label: "Invoice & Settings" },
    { id: "branding", label: "Branding" },
];

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "DRAFT", label: "Draft" },
];

const CURRENCY_OPTIONS = [
    { value: "INR", label: "INR - Indian Rupee" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
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

export default function CompanyCreateSimpleNew() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);

    /* =====================================================
       REDUX
    ===================================================== */

    const companyState = useSelector(
        (state) => state.company || {}
    );

    const {
        company,
        loading,
    } = companyState;

    const authState = useSelector(
        (state) => state.auth || {}
    );

    const { user } = authState;

    const permissionState = useSelector(
        (state) => state.menuPermission || {}
    );

    const form = company || INITIAL_FORM;

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

    const [activeTab, setActiveTab] = useState("company");

    const [showSaveMenu, setShowSaveMenu] = useState(false);

    const [editLoading, setEditLoading] = useState(isEdit);

    const [editLoadError, setEditLoadError] = useState(false);

    const [errors, setErrors] = useState({});

    const [logoPreview, setLogoPreview] = useState("");

    const [signaturePreview, setSignaturePreview] = useState("");

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
        "Companies",
        "CREATE"
    );

    const hasEditPermission = hasPermission(
        "Companies",
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
       LOAD COMPANY FOR EDIT
    ===================================================== */

    useEffect(() => {
        let cancelled = false;

        const loadCompany = async () => {
            if (!isEdit) {
                dispatch(resetCompanyForm());

                setEditLoading(false);
                setEditLoadError(false);

                return;
            }

            setEditLoading(true);
            setEditLoadError(false);

            dispatch(resetCompanyForm());

            try {
                const response = await dispatch(
                    fetchCompanyById(id)
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
                        "Company details were not found."
                    );
                }

                const populatedForm = {
                    ...INITIAL_FORM,
                    ...result,

                    id: result.id,

                    logo: result.logo ?? null,

                    signature: result.signature ?? null,

                    invoiceStartNumber:
                        result.invoiceStartNumber == null
                            ? "1"
                            : String(result.invoiceStartNumber),

                    financialYearStart:
                        result.financialYearStart
                            ? String(result.financialYearStart).slice(0, 10)
                            : "",

                    status: result.status || "ACTIVE",
                };

                Object.entries(populatedForm).forEach(
                    ([field, value]) => {
                        dispatch(
                            setCompanyField({
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
                    "Failed to load company:",
                    error
                );

                setEditLoadError(true);

                toast.error(
                    typeof error === "string"
                        ? error
                        : error?.message ||
                        "Failed to load company details."
                );
            } finally {
                if (!cancelled) {
                    setEditLoading(false);
                }
            }
        };

        loadCompany();

        return () => {
            cancelled = true;
        };
    }, [dispatch, id, isEdit]);

    /* =====================================================
       IMAGE PREVIEWS
    ===================================================== */

    useEffect(() => {
        if (form.logo instanceof File) {
            const objectUrl = URL.createObjectURL(form.logo);

            setLogoPreview(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        }

        setLogoPreview(getFileUrl(form.logo));

        return undefined;
    }, [form.logo]);

    useEffect(() => {
        if (form.signature instanceof File) {
            const objectUrl = URL.createObjectURL(
                form.signature
            );

            setSignaturePreview(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        }

        setSignaturePreview(getFileUrl(form.signature));

        return undefined;
    }, [form.signature]);

    /* =====================================================
       FIELD HANDLERS
    ===================================================== */

    const handleChange = (field, value) => {
        dispatch(
            setCompanyField({
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

        dispatch(resetCompanyForm());

        setActiveTab("company");

        navigate("/companies");
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

        if (!form.companyName?.trim()) {
            nextErrors.companyName =
                "Company name is required.";
        }

        if (!form.companyCode?.trim()) {
            nextErrors.companyCode =
                "Company code is required.";
        }

        if (!form.phone?.trim()) {
            nextErrors.phone =
                "Phone number is required.";
        } else if (!/^\d{10}$/.test(form.phone.trim())) {
            nextErrors.phone =
                "Phone number must contain 10 digits.";
        }

        if (
            form.alternatePhone?.trim() &&
            !/^\d{10}$/.test(form.alternatePhone.trim())
        ) {
            nextErrors.alternatePhone =
                "Alternate phone must contain 10 digits.";
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

        if (
            form.website?.trim() &&
            !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(
                form.website.trim()
            )
        ) {
            nextErrors.website =
                "Enter a valid website URL.";
        }

        if (
            form.addressLine1?.trim() === ""
        ) {
            nextErrors.addressLine1 =
                "Address is required.";
        }

        if (!form.city?.trim()) {
            nextErrors.city = "City is required.";
        }

        if (!form.state?.trim()) {
            nextErrors.state = "State is required.";
        }

        if (!form.country?.trim()) {
            nextErrors.country = "Country is required.";
        }

        if (!form.pincode?.trim()) {
            nextErrors.pincode = "Pincode is required.";
        } else if (!/^\d{6}$/.test(form.pincode.trim())) {
            nextErrors.pincode =
                "Pincode must contain 6 digits.";
        }

        if (
            form.gstNumber?.trim() &&
            !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
                form.gstNumber.trim().toUpperCase()
            )
        ) {
            nextErrors.gstNumber =
                "Enter a valid GST number.";
        }

        if (
            form.panNumber?.trim() &&
            !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
                form.panNumber.trim().toUpperCase()
            )
        ) {
            nextErrors.panNumber =
                "Enter a valid PAN number.";
        }

        if (
            form.tanNumber?.trim() &&
            !/^[A-Z]{4}[0-9]{5}[A-Z]$/.test(
                form.tanNumber.trim().toUpperCase()
            )
        ) {
            nextErrors.tanNumber =
                "Enter a valid TAN number.";
        }

        if (!form.invoicePrefix?.trim()) {
            nextErrors.invoicePrefix =
                "Invoice prefix is required.";
        }

        if (
            !Number.isInteger(
                Number(form.invoiceStartNumber)
            ) ||
            Number(form.invoiceStartNumber) < 1
        ) {
            nextErrors.invoiceStartNumber =
                "Invoice start number must be at least 1.";
        }

        if (!form.currency) {
            nextErrors.currency = "Currency is required.";
        }

        if (!form.financialYearStart) {
            nextErrors.financialYearStart =
                "Financial year start is required.";
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            const tabFields = {
                company: [
                    "companyName",
                    "companyCode",
                ],
                contact: [
                    "phone",
                    "alternatePhone",
                    "email",
                    "website",
                    "addressLine1",
                    "city",
                    "state",
                    "country",
                    "pincode",
                ],
                tax: [
                    "gstNumber",
                    "panNumber",
                    "tanNumber",
                ],
                settings: [
                    "invoicePrefix",
                    "invoiceStartNumber",
                    "currency",
                    "financialYearStart",
                ],
            };

            const firstTab = Object.entries(tabFields).find(
                ([, fields]) =>
                    fields.some((field) => nextErrors[field])
            );

            setActiveTab(firstTab?.[0] || "company");

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

            companyName: form.companyName.trim(),

            displayName: form.displayName?.trim() || "",

            legalName: form.legalName?.trim() || "",

            companyCode: form.companyCode.trim().toUpperCase(),

            gstNumber:
                form.gstNumber?.trim().toUpperCase() || "",

            panNumber:
                form.panNumber?.trim().toUpperCase() || "",

            tanNumber:
                form.tanNumber?.trim().toUpperCase() || "",

            email: form.email?.trim() || "",

            phone: form.phone?.trim() || "",

            alternatePhone:
                form.alternatePhone?.trim() || "",

            website: form.website?.trim() || "",

            addressLine1:
                form.addressLine1?.trim() || "",

            addressLine2:
                form.addressLine2?.trim() || "",

            city: form.city?.trim() || "",

            state: form.state?.trim() || "",

            country: form.country?.trim() || "India",

            pincode: form.pincode?.trim() || "",

            invoicePrefix:
                form.invoicePrefix?.trim().toUpperCase() || "NT",

            invoiceStartNumber: Number(
                form.invoiceStartNumber || 1
            ),

            currency: form.currency || "INR",

            financialYearStart:
                form.financialYearStart || null,

            status: form.status || "ACTIVE",
        };

        try {
            if (isEdit) {
                await dispatch(
                    updateCompany({
                        id: Number(id),
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Company updated successfully."
                );
            } else {
                await dispatch(
                    createCompany(payload)
                ).unwrap();

                toast.success(
                    "Company created successfully."
                );
            }

            setShowSaveMenu(false);
            setErrors({});

            if (saveAndNew && !isEdit) {
                dispatch(resetCompanyForm());

                setActiveTab("company");

                return;
            }

            dispatch(resetCompanyForm());

            setActiveTab("company");

            if (saveAndClose) {
                navigate("/companies");
            }
        } catch (error) {
            console.error(
                isEdit
                    ? "Company update error:"
                    : "Company create error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (
                        isEdit
                            ? "Failed to update company."
                            : "Failed to create company."
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

    const renderCompanyTab = () => (
        <div className="w-full max-w-7xl">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-[#0F4659]">
                        Company Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Enter the basic information of the company.
                    </p>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="space-y-5">
                        {renderInput({
                            field: "companyName",
                            label: "Company Name",
                            placeholder: "Enter company name",
                            required: true,
                        })}

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {renderInput({
                                field: "companyCode",
                                label: "Company Code",
                                placeholder: "Company code",
                                required: true,
                                onValueChange: (value) =>
                                    value.toUpperCase(),
                            })}

                            {renderInput({
                                field: "displayName",
                                label: "Display Name",
                                placeholder: "Display name",
                            })}
                        </div>

                        {renderInput({
                            field: "legalName",
                            label: "Legal Name",
                            placeholder: "Legal company name",
                        })}
                    </div>

                    <div className="rounded-lg border border-gray-200 p-4">
                        <div className="mb-4 flex items-center gap-2">
                            <Building2
                                size={18}
                                className="text-[#0F4659]"
                            />

                            <h3 className="text-sm font-semibold text-gray-800">
                                Company Status
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
                                Company status controls whether this
                                company is available for normal transactions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    /* =====================================================
       CONTACT & ADDRESS TAB
    ===================================================== */

    const renderContactTab = () => (
        <div className="w-full max-w-7xl">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-[#0F4659]">
                        Contact & Address
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Add company contact information and registered address.
                    </p>
                </div>

                <div>
                    <h3 className="mb-4 text-sm font-semibold text-gray-700">
                        Contact Information
                    </h3>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {renderInput({
                            field: "phone",
                            label: "Phone",
                            placeholder: "10 digit phone number",
                            required: true,
                            maxLength: 10,
                            onValueChange: (value) =>
                                value.replace(/\D/g, ""),
                        })}

                        {renderInput({
                            field: "alternatePhone",
                            label: "Alternate Phone",
                            placeholder: "Alternate phone",
                            maxLength: 10,
                            onValueChange: (value) =>
                                value.replace(/\D/g, ""),
                        })}

                        {renderInput({
                            field: "email",
                            label: "Email",
                            placeholder: "Email address",
                            type: "email",
                        })}

                        {renderInput({
                            field: "website",
                            label: "Website",
                            placeholder: "https://example.com",
                        })}
                    </div>
                </div>

                <div className="mt-7 border-t border-gray-200 pt-6">
                    <h3 className="mb-4 text-sm font-semibold text-gray-700">
                        Company Address
                    </h3>

                    <div className="space-y-5">
                        <div>
                            <label className={labelClass}>
                                Address Line 1
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <textarea
                                rows={3}
                                value={form.addressLine1 || ""}
                                onChange={(event) =>
                                    handleChange(
                                        "addressLine1",
                                        event.target.value
                                    )
                                }
                                placeholder="Address"
                                className={textareaClass(
                                    Boolean(errors.addressLine1)
                                )}
                            />

                            {errors.addressLine1 && (
                                <p className={errorClass}>
                                    {errors.addressLine1}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                Address Line 2
                            </label>

                            <textarea
                                rows={2}
                                value={form.addressLine2 || ""}
                                onChange={(event) =>
                                    handleChange(
                                        "addressLine2",
                                        event.target.value
                                    )
                                }
                                placeholder="Additional address"
                                className={textareaClass()}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {renderInput({
                                field: "city",
                                label: "City",
                                placeholder: "City",
                                required: true,
                            })}

                            {renderInput({
                                field: "state",
                                label: "State",
                                placeholder: "State",
                                required: true,
                            })}

                            {renderInput({
                                field: "country",
                                label: "Country",
                                placeholder: "Country",
                                required: true,
                            })}

                            {renderInput({
                                field: "pincode",
                                label: "Pincode",
                                placeholder: "6 digit pincode",
                                required: true,
                                maxLength: 6,
                                onValueChange: (value) =>
                                    value.replace(/\D/g, ""),
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    /* =====================================================
       TAX TAB
    ===================================================== */

    const renderTaxTab = () => (
        <div className="w-full max-w-7xl">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-[#0F4659]">
                        Tax & Registration
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Enter the company's tax and registration details.
                    </p>
                </div>

                <div className="grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
                    {renderInput({
                        field: "gstNumber",
                        label: "GST Number",
                        placeholder: "GST number",
                        maxLength: 15,
                        onValueChange: (value) =>
                            value.toUpperCase(),
                    })}

                    {renderInput({
                        field: "panNumber",
                        label: "PAN Number",
                        placeholder: "PAN number",
                        maxLength: 10,
                        onValueChange: (value) =>
                            value.toUpperCase(),
                    })}

                    {renderInput({
                        field: "tanNumber",
                        label: "TAN Number",
                        placeholder: "TAN number",
                        maxLength: 10,
                        onValueChange: (value) =>
                            value.toUpperCase(),
                    })}
                </div>

                <div className="mt-8 max-w-4xl rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                        GST, PAN and TAN are optional. If provided,
                        they will be validated before saving.
                    </p>
                </div>
            </div>
        </div>
    );

    /* =====================================================
       SETTINGS TAB
    ===================================================== */

    const renderSettingsTab = () => (
        <div className="w-full max-w-7xl">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-[#0F4659]">
                        Invoice & Company Settings
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Configure invoice numbering, currency and financial year.
                    </p>
                </div>

                <div className="grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
                    {renderInput({
                        field: "invoicePrefix",
                        label: "Invoice Prefix",
                        placeholder: "NT",
                        required: true,
                        onValueChange: (value) =>
                            value.toUpperCase(),
                    })}

                    {renderInput({
                        field: "invoiceStartNumber",
                        label: "Invoice Start Number",
                        type: "number",
                        required: true,
                        onValueChange: (value) =>
                            value === "" ? "" : Number(value),
                    })}

                    {renderSelect({
                        field: "currency",
                        label: "Currency",
                        options: CURRENCY_OPTIONS,
                        required: true,
                    })}

                    {renderInput({
                        field: "financialYearStart",
                        label: "Financial Year Start",
                        type: "date",
                        required: true,
                    })}
                </div>

                <div className="mt-8 max-w-sm border-t border-gray-200 pt-6">
                    <h3 className="mb-4 text-sm font-semibold text-gray-700">
                        Company Status
                    </h3>

                    {renderSelect({
                        field: "status",
                        label: "Status",
                        options: STATUS_OPTIONS,
                        required: true,
                    })}
                </div>
            </div>
        </div>
    );

    /* =====================================================
       BRANDING TAB
    ===================================================== */

    const renderBrandingTab = () => (
        <div className="w-full max-w-7xl">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-[#0F4659]">
                        Company Branding
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Upload the company logo and signature used in documents and invoices.
                    </p>
                </div>

                <div className="grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* LOGO */}

                    <div className="rounded-lg border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-800">
                            Company Logo
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                            PNG, JPG or WEBP. Maximum 5 MB.
                        </p>

                        <label className="mt-4 flex h-52 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 transition hover:bg-gray-50">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Company logo"
                                    className="h-40 max-w-full object-contain"
                                />
                            ) : (
                                <>
                                    <Upload
                                        size={28}
                                        className="text-gray-400"
                                    />

                                    <span className="mt-2 text-sm text-gray-500">
                                        Upload Logo
                                    </span>
                                </>
                            )}

                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(event) => {
                                    handleFileChange(
                                        "logo",
                                        event.target.files?.[0]
                                    );

                                    event.target.value = "";
                                }}
                            />
                        </label>

                        {form.logo && (
                            <button
                                type="button"
                                onClick={() =>
                                    handleChange("logo", null)
                                }
                                className="mt-3 text-xs font-medium text-red-500 hover:text-red-700"
                            >
                                Remove logo
                            </button>
                        )}
                    </div>

                    {/* SIGNATURE */}

                    <div className="rounded-lg border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-800">
                            Signature
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                            PNG, JPG or WEBP. Maximum 5 MB.
                        </p>

                        <label className="mt-4 flex h-52 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 transition hover:bg-gray-50">
                            {signaturePreview ? (
                                <img
                                    src={signaturePreview}
                                    alt="Company signature"
                                    className="h-40 max-w-full object-contain"
                                />
                            ) : (
                                <>
                                    <Upload
                                        size={28}
                                        className="text-gray-400"
                                    />

                                    <span className="mt-2 text-sm text-gray-500">
                                        Upload Signature
                                    </span>
                                </>
                            )}

                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(event) => {
                                    handleFileChange(
                                        "signature",
                                        event.target.files?.[0]
                                    );

                                    event.target.value = "";
                                }}
                            />
                        </label>

                        {form.signature && (
                            <button
                                type="button"
                                onClick={() =>
                                    handleChange("signature", null)
                                }
                                className="mt-3 text-xs font-medium text-red-500 hover:text-red-700"
                            >
                                Remove signature
                            </button>
                        )}
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
                        onClick={() => navigate("/companies")}
                        className="mt-6 rounded-md bg-[#0F4659] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0F4659]/90"
                    >
                        Back to Companies
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
                            ? "You do not have permission to edit companies."
                            : "You do not have permission to create companies."}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/companies")}
                        className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm text-[#0F4659] hover:bg-gray-50"
                    >
                        Back to Companies
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
                    Loading company details...
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
                        Unable to Load Company
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Company details could not be loaded.
                        Return to the company list and try again.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/companies")}
                        className="mt-5 h-10 rounded-md bg-[#0F4659] px-5 text-sm font-medium text-white hover:bg-[#0F4659]/90"
                    >
                        Back to Companies
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
                        onClick={() => navigate("/bankAccount")}
                    >
                        <Landmark
                            size={20}
                            className="text-[#0F4659]"
                        />
                    </div>


                    <div>
                        <h1 className="text-lg font-semibold text-[#0F4659]">
                            {isEdit ? "Edit Company" : "New Company"}
                        </h1>

                        <p className="mt-0.5 text-xs text-gray-500">
                            {isEdit
                                ? `Update company details${form.companyName ? ` — ${form.companyName}` : ""}`
                                : "Create new company details"}
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
                {activeTab === "company" && renderCompanyTab()}

                {activeTab === "contact" && renderContactTab()}

                {activeTab === "tax" && renderTaxTab()}

                {activeTab === "settings" && renderSettingsTab()}

                {activeTab === "branding" && renderBrandingTab()}
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
                                    ? "Update Company"
                                    : "Save Company"}
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
                                                Save and create another company
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
                                            Save and return to companies
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
