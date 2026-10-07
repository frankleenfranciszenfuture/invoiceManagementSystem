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
} from "react-router-dom";

import {
    Building2,
    ChevronDown,
    ShieldCheck,
    Upload,
    UserRoundArrowLeft,
    X,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    resetCompanyForm,
    setCompanyField,
} from "../slices/companySlice";

import {
    createCompany,
} from "../thunks/companyThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

/* =========================================================
   INITIAL FORM
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
    invoiceStartNumber: 1,
    currency: "INR",
    financialYearStart: "",
    status: "ACTIVE",
    logo: null,
    signature: null,
    logoUrl: "",
    signatureUrl: "",
};

/* =========================================================
   NORMALIZERS
========================================================= */

const normalizeModule = (value) =>
    String(value ?? "")
        .trim()
        .toLowerCase();

const normalizeAction = (value) =>
    String(value ?? "")
        .trim()
        .toUpperCase();

/* =========================================================
   COMPONENT
========================================================= */

export default function CompanyCreateSimple() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =========================================================
       REDUX
    ========================================================= */

    const companyState = useSelector(
        (state) => state.company || {}
    );

    const authState = useSelector(
        (state) => state.auth || {}
    );

    const permissionState = useSelector(
        (state) => state.menuPermission || {}
    );

    const form =
        companyState.company || INITIAL_FORM;

    const loading =
        Boolean(companyState.loading);

    const user =
        authState.user;

    const isAuthenticated =
        authState.isAuthenticated !== false;

    const authChecking =
        Boolean(authState.loading);

    const userPermissions =
        permissionState.userPermissions || [];

    const permissionLoading =
        Boolean(permissionState.loading);

    const permissionsLoaded =
        permissionState.userPermissions !== undefined &&
        permissionState.userPermissions !== null;

    /* =========================================================
       LOCAL STATE
    ========================================================= */

    const [errors, setErrors] = useState({});

    const [logoPreview, setLogoPreview] =
        useState("");

    const [signaturePreview, setSignaturePreview] =
        useState("");

    const [activeTab, setActiveTab] =
        useState("company");

    const [showSaveMenu, setShowSaveMenu] =
        useState(false);

    /* =========================================================
       TABS
    ========================================================= */

    const tabs = [
        {
            id: "company",
            label: "Company Information",
        },
        {
            id: "contact",
            label: "Contact & Address",
        },
        {
            id: "tax",
            label: "Tax & Registration",
        },
        {
            id: "settings",
            label: "Invoice & Settings",
        },
        {
            id: "branding",
            label: "Branding",
        },
    ];

    /* =========================================================
       ROLE / PERMISSION
    ========================================================= */

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

    const normalizedRole =
        normalizeAction(role);

    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";

    const isAdmin =
        normalizedRole === "ADMIN";

    const hasFullAccess =
        isSuperAdmin || isAdmin;

    /* =========================================================
       PERMISSION CHECK
    ========================================================= */

    const hasPermission = (
        moduleName,
        actionName
    ) => {
        if (hasFullAccess) {
            return true;
        }

        const targetModule =
            normalizeModule(moduleName);

        const targetAction =
            normalizeAction(actionName);

        return userPermissions.some(
            (permission) => {
                const permissionModule =
                    permission?.moduleName ||
                    permission?.module?.moduleName ||
                    permission?.module?.name;

                if (
                    normalizeModule(
                        permissionModule
                    ) !== targetModule
                ) {
                    return false;
                }

                const permissionStatus =
                    permission?.status ??
                    permission?.module?.status ??
                    "ACTIVE";

                if (
                    normalizeAction(
                        permissionStatus
                    ) !== "ACTIVE"
                ) {
                    return false;
                }

                const actions =
                    Array.isArray(
                        permission?.actions
                    )
                        ? permission.actions
                        : [];

                return actions.some(
                    (action) => {
                        if (
                            typeof action ===
                            "string"
                        ) {
                            return (
                                normalizeAction(
                                    action
                                ) === targetAction
                            );
                        }

                        const actionNameValue =
                            action?.actionName ||
                            action?.name ||
                            action?.action;

                        const actionStatus =
                            action?.status ??
                            "ACTIVE";

                        const allowed =
                            action?.allowed ??
                            action?.isAllowed ??
                            true;

                        return (
                            normalizeAction(
                                actionNameValue
                            ) === targetAction &&
                            normalizeAction(
                                actionStatus
                            ) === "ACTIVE" &&
                            allowed !== false
                        );
                    }
                );
            }
        );
    };

    const canCreateCompany =
        hasPermission(
            "Company Detail",
            "CREATE"
        );

    /* =========================================================
       LOAD USER PERMISSIONS
    ========================================================= */

    useEffect(() => {
        if (
            authChecking ||
            !isAuthenticated ||
            hasFullAccess
        ) {
            return;
        }

        if (
            !permissionsLoaded &&
            !permissionLoading
        ) {
            dispatch(
                getUserPermission()
            );
        }
    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    /* =========================================================
       CLEANUP IMAGE PREVIEWS
    ========================================================= */

    useEffect(() => {
        return () => {
            if (logoPreview) {
                URL.revokeObjectURL(
                    logoPreview
                );
            }

            if (signaturePreview) {
                URL.revokeObjectURL(
                    signaturePreview
                );
            }
        };
    }, [
        logoPreview,
        signaturePreview,
    ]);

    /* =========================================================
       FIELD HANDLER
    ========================================================= */

    const handleChange = (
        field,
        value
    ) => {
        dispatch(
            setCompanyField({
                field,
                value,
            })
        );

        if (errors[field]) {
            setErrors((previous) => {
                const updated = {
                    ...previous,
                };

                delete updated[field];

                return updated;
            });
        }
    };

    /* =========================================================
       FILE HANDLER
    ========================================================= */

    const handleFileChange = (
        field,
        file
    ) => {
        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error(
                "Please select an image file"
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error(
                "Image size must be less than 5MB"
            );
            return;
        }

        handleChange(
            field,
            file
        );

        const preview =
            URL.createObjectURL(file);

        if (field === "logo") {
            if (logoPreview) {
                URL.revokeObjectURL(
                    logoPreview
                );
            }

            setLogoPreview(preview);
        }

        if (field === "signature") {
            if (signaturePreview) {
                URL.revokeObjectURL(
                    signaturePreview
                );
            }

            setSignaturePreview(
                preview
            );
        }
    };

    /* =========================================================
       VALIDATION
    ========================================================= */

    const validateForm = () => {
        const newErrors = {};

        /* COMPANY */

        if (!form.companyName?.trim()) {
            newErrors.companyName =
                "Company name is required";
        }

        if (!form.companyCode?.trim()) {
            newErrors.companyCode =
                "Company code is required";
        }

        /* CONTACT */

        if (!form.phone?.trim()) {
            newErrors.phone =
                "Phone number is required";
        } else if (
            !/^[0-9]{10}$/.test(
                form.phone.trim()
            )
        ) {
            newErrors.phone =
                "Phone number must contain 10 digits";
        }

        if (
            form.alternatePhone?.trim() &&
            !/^[0-9]{10}$/.test(
                form.alternatePhone.trim()
            )
        ) {
            newErrors.alternatePhone =
                "Alternate phone must contain 10 digits";
        }

        if (
            form.email?.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                form.email.trim()
            )
        ) {
            newErrors.email =
                "Enter a valid email address";
        }

        /* TAX */

        if (
            form.gstNumber?.trim() &&
            !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
                form.gstNumber
                    .trim()
                    .toUpperCase()
            )
        ) {
            newErrors.gstNumber =
                "Enter a valid GST number";
        }

        if (
            form.panNumber?.trim() &&
            !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(
                form.panNumber
                    .trim()
                    .toUpperCase()
            )
        ) {
            newErrors.panNumber =
                "Enter a valid PAN number";
        }

        if (
            form.tanNumber?.trim() &&
            !/^[A-Z]{4}[0-9]{5}[A-Z]$/.test(
                form.tanNumber
                    .trim()
                    .toUpperCase()
            )
        ) {
            newErrors.tanNumber =
                "Enter a valid TAN number";
        }

        /* ADDRESS */

        if (!form.addressLine1?.trim()) {
            newErrors.addressLine1 =
                "Address is required";
        }

        if (!form.city?.trim()) {
            newErrors.city =
                "City is required";
        }

        if (!form.state?.trim()) {
            newErrors.state =
                "State is required";
        }

        if (!form.country?.trim()) {
            newErrors.country =
                "Country is required";
        }

        if (!form.pincode?.trim()) {
            newErrors.pincode =
                "Pincode is required";
        } else if (
            !/^[0-9]{6}$/.test(
                form.pincode.trim()
            )
        ) {
            newErrors.pincode =
                "Pincode must contain 6 digits";
        }

        /* INVOICE */

        if (!form.invoicePrefix?.trim()) {
            newErrors.invoicePrefix =
                "Invoice prefix is required";
        }

        if (
            !form.invoiceStartNumber ||
            Number(form.invoiceStartNumber) < 1
        ) {
            newErrors.invoiceStartNumber =
                "Invoice start number must be at least 1";
        }

        if (!form.currency?.trim()) {
            newErrors.currency =
                "Currency is required";
        }

        if (!form.financialYearStart) {
            newErrors.financialYearStart =
                "Financial year start is required";
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };

    /* =========================================================
       PAYLOAD
    ========================================================= */

    const buildPayload = () => {
        return {
            companyName:
                form.companyName?.trim() || "",

            displayName:
                form.displayName?.trim() || "",

            legalName:
                form.legalName?.trim() || "",

            companyCode:
                form.companyCode?.trim() || "",

            gstNumber:
                form.gstNumber
                    ?.trim()
                    .toUpperCase() || "",

            panNumber:
                form.panNumber
                    ?.trim()
                    .toUpperCase() || "",

            tanNumber:
                form.tanNumber
                    ?.trim()
                    .toUpperCase() || "",

            email:
                form.email?.trim() || "",

            phone:
                form.phone?.trim() || "",

            alternatePhone:
                form.alternatePhone?.trim() || "",

            website:
                form.website?.trim() || "",

            addressLine1:
                form.addressLine1?.trim() || "",

            addressLine2:
                form.addressLine2?.trim() || "",

            city:
                form.city?.trim() || "",

            state:
                form.state?.trim() || "",

            country:
                form.country?.trim() || "",

            pincode:
                form.pincode?.trim() || "",

            invoicePrefix:
                form.invoicePrefix
                    ?.trim()
                    .toUpperCase() || "",

            invoiceStartNumber:
                Number(
                    form.invoiceStartNumber
                ),

            currency:
                form.currency
                    ?.trim()
                    .toUpperCase() || "INR",

            financialYearStart:
                form.financialYearStart ||
                null,

            status:
                form.status || "ACTIVE",

            logo:
                form.logo || null,

            signature:
                form.signature || null,
        };
    };

    /* =========================================================
       SAVE
    ========================================================= */

    const handleSave = async ({
        saveAndNew = false,
        saveAndClose = true,
    } = {}) => {
        if (!isAuthenticated) {
            toast.error(
                "You are not authenticated"
            );
            return;
        }

        if (
            !hasFullAccess &&
            !permissionsLoaded
        ) {
            toast.error(
                "Checking permissions. Please try again."
            );
            return;
        }

        if (
            !hasFullAccess &&
            !canCreateCompany
        ) {
            toast.error(
                "You do not have permission to create a company"
            );
            return;
        }

        if (!validateForm()) {
            toast.error(
                "Please correct the highlighted fields"
            );
            return;
        }

        try {
            const payload =
                buildPayload();

            await dispatch(
                createCompany(payload)
            ).unwrap();

            toast.success(
                "Company created successfully"
            );

            dispatch(
                resetCompanyForm()
            );

            setErrors({});
            setActiveTab("company");

            if (saveAndNew) {
                return;
            }

            if (saveAndClose) {
                navigate("/companies");
            }
        } catch (error) {
            toast.error(
                error?.message ||
                error ||
                "Failed to create company"
            );
        }
    };

    /* =========================================================
       CANCEL / CLOSE
    ========================================================= */

    const handleCancel = () => {
        setShowSaveMenu(false);
        setErrors({});

        dispatch(
            resetCompanyForm()
        );

        navigate("/companies");
    };

    /* =========================================================
       SHARED FIELD CLASS
    ========================================================= */

    const inputClass = (field) =>
        `w-full h-10 border rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 transition ${errors[field]
            ? "border-red-400 focus:ring-red-100"
            : "border-gray-300 focus:border-blue-400 focus:ring-blue-100"
        }`;

    const labelClass =
        "block text-sm font-medium text-gray-700 mb-1.5";

    const errorClass =
        "mt-1 text-xs text-red-500";

    /* =========================================================
       COMPANY TAB
    ========================================================= */

    const renderCompanyTab = () => {
        return (
            <div className="w-full max-w-7xl">
                <div className="bg-white border border-gray-200 rounded-lg p-6">

                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-gray-800">
                            Company Information
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Enter the basic information of the company.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8 items-start">

                        {/* LEFT */}

                        <div className="space-y-5">

                            <div>
                                <label className={labelClass}>
                                    Company Name
                                    <span className="text-red-500 ml-1">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    value={
                                        form.companyName || ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "companyName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter company name"
                                    className={inputClass(
                                        "companyName"
                                    )}
                                />

                                {errors.companyName && (
                                    <p className={errorClass}>
                                        {errors.companyName}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <div>
                                    <label className={labelClass}>
                                        Company Code
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.companyCode || ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "companyCode",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Company code"
                                        className={inputClass(
                                            "companyCode"
                                        )}
                                    />

                                    {errors.companyCode && (
                                        <p className={errorClass}>
                                            {errors.companyCode}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Display Name
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.displayName || ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "displayName",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Display name"
                                        className={inputClass(
                                            "displayName"
                                        )}
                                    />
                                </div>

                            </div>

                            <div>
                                <label className={labelClass}>
                                    Legal Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        form.legalName || ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            "legalName",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Legal company name"
                                    className={inputClass(
                                        "legalName"
                                    )}
                                />
                            </div>

                        </div>

                        {/* RIGHT */}

                        <div className="border border-gray-200 rounded-lg p-4">

                            <div className="flex items-center gap-2 mb-4">
                                <Building2
                                    size={18}
                                    className="text-blue-600"
                                />

                                <h3 className="text-sm font-semibold text-gray-800">
                                    Company Status
                                </h3>
                            </div>

                            <label className={labelClass}>
                                Status
                            </label>

                            <select
                                value={
                                    form.status || "ACTIVE"
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "status",
                                        e.target.value
                                    )
                                }
                                className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>

                                <option value="DRAFT">
                                    Draft
                                </option>
                            </select>

                            <div className="mt-4 p-3 rounded-md bg-gray-50 border border-gray-200">
                                <p className="text-xs text-gray-500">
                                    Company status controls whether this company is available for normal transactions.
                                </p>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        );
    };

    /* =========================================================
       CONTACT TAB
    ========================================================= */

    const renderContactTab = () => {
        return (
            <div className="w-full max-w-7xl">

                <div className="bg-white border border-gray-200 rounded-lg p-6">

                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-gray-800">
                            Contact & Address
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Add company contact information and registered address.
                        </p>
                    </div>

                    <div className="space-y-6">

                        {/* CONTACT */}

                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">
                                Contact Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <div>
                                    <label className={labelClass}>
                                        Phone
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={10}
                                        value={
                                            form.phone || ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "phone",
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            )
                                        }
                                        placeholder="10 digit phone number"
                                        className={inputClass(
                                            "phone"
                                        )}
                                    />

                                    {errors.phone && (
                                        <p className={errorClass}>
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Alternate Phone
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={10}
                                        value={
                                            form.alternatePhone || ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "alternatePhone",
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                )
                                            )
                                        }
                                        placeholder="Alternate phone"
                                        className={inputClass(
                                            "alternatePhone"
                                        )}
                                    />

                                    {errors.alternatePhone && (
                                        <p className={errorClass}>
                                            {errors.alternatePhone}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={
                                            form.email || ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Email address"
                                        className={inputClass(
                                            "email"
                                        )}
                                    />

                                    {errors.email && (
                                        <p className={errorClass}>
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Website
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.website || ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "website",
                                                e.target.value
                                            )
                                        }
                                        placeholder="https://example.com"
                                        className={inputClass(
                                            "website"
                                        )}
                                    />
                                </div>

                            </div>
                        </div>

                        {/* ADDRESS */}

                        <div className="border-t border-gray-200 pt-6">

                            <h3 className="text-sm font-semibold text-gray-700 mb-4">
                                Company Address
                            </h3>

                            <div className="space-y-5">

                                <div>
                                    <label className={labelClass}>
                                        Address Line 1
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    </label>

                                    <textarea
                                        rows={3}
                                        value={
                                            form.addressLine1 || ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "addressLine1",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Address"
                                        className={`w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 ${errors.addressLine1
                                            ? "border-red-400 focus:ring-red-100"
                                            : "border-gray-300 focus:border-blue-400 focus:ring-blue-100"
                                            }`}
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
                                        value={
                                            form.addressLine2 || ""
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "addressLine2",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Additional address"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                    <div>
                                        <label className={labelClass}>
                                            City
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                form.city || ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "city",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="City"
                                            className={inputClass(
                                                "city"
                                            )}
                                        />

                                        {errors.city && (
                                            <p className={errorClass}>
                                                {errors.city}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            State
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                form.state || ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "state",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="State"
                                            className={inputClass(
                                                "state"
                                            )}
                                        />

                                        {errors.state && (
                                            <p className={errorClass}>
                                                {errors.state}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Country
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                form.country || "India"
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "country",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Country"
                                            className={inputClass(
                                                "country"
                                            )}
                                        />

                                        {errors.country && (
                                            <p className={errorClass}>
                                                {errors.country}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Pincode
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={
                                                form.pincode || ""
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "pincode",
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                )
                                            }
                                            placeholder="6 digit pincode"
                                            className={inputClass(
                                                "pincode"
                                            )}
                                        />

                                        {errors.pincode && (
                                            <p className={errorClass}>
                                                {errors.pincode}
                                            </p>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    };

    /* =========================================================
       TAX TAB
    ========================================================= */

    const renderTaxTab = () => {
        return (
            <div className="w-full max-w-7xl">

                <div className="bg-white border border-gray-200 rounded-lg p-6">

                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-gray-800">
                            Tax & Registration
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Enter the company's tax and registration details.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">

                        <div>
                            <label className={labelClass}>
                                GST Number
                            </label>

                            <input
                                type="text"
                                maxLength={15}
                                value={
                                    form.gstNumber || ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "gstNumber",
                                        e.target.value
                                            .toUpperCase()
                                    )
                                }
                                placeholder="GST number"
                                className={inputClass(
                                    "gstNumber"
                                )}
                            />

                            {errors.gstNumber && (
                                <p className={errorClass}>
                                    {errors.gstNumber}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                PAN Number
                            </label>

                            <input
                                type="text"
                                maxLength={10}
                                value={
                                    form.panNumber || ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "panNumber",
                                        e.target.value
                                            .toUpperCase()
                                    )
                                }
                                placeholder="PAN number"
                                className={inputClass(
                                    "panNumber"
                                )}
                            />

                            {errors.panNumber && (
                                <p className={errorClass}>
                                    {errors.panNumber}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                TAN Number
                            </label>

                            <input
                                type="text"
                                maxLength={10}
                                value={
                                    form.tanNumber || ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "tanNumber",
                                        e.target.value
                                            .toUpperCase()
                                    )
                                }
                                placeholder="TAN number"
                                className={inputClass(
                                    "tanNumber"
                                )}
                            />

                            {errors.tanNumber && (
                                <p className={errorClass}>
                                    {errors.tanNumber}
                                </p>
                            )}
                        </div>

                    </div>

                    <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-200 max-w-4xl">
                        <p className="text-xs text-gray-500">
                            GST, PAN and TAN are optional. If provided, they will be validated before the company is created.
                        </p>
                    </div>

                </div>
            </div>
        );
    };

    /* =========================================================
       SETTINGS TAB
    ========================================================= */

    const renderSettingsTab = () => {
        return (
            <div className="w-full max-w-7xl">

                <div className="bg-white border border-gray-200 rounded-lg p-6">

                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-gray-800">
                            Invoice & Company Settings
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Configure invoice numbering, currency and financial year settings.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">

                        <div>
                            <label className={labelClass}>
                                Invoice Prefix
                                <span className="text-red-500 ml-1">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                value={
                                    form.invoicePrefix || ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "invoicePrefix",
                                        e.target.value
                                            .toUpperCase()
                                    )
                                }
                                placeholder="NT"
                                className={inputClass(
                                    "invoicePrefix"
                                )}
                            />

                            {errors.invoicePrefix && (
                                <p className={errorClass}>
                                    {errors.invoicePrefix}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                Invoice Start Number
                                <span className="text-red-500 ml-1">
                                    *
                                </span>
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={
                                    form.invoiceStartNumber ?? 1
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "invoiceStartNumber",
                                        e.target.value === ""
                                            ? ""
                                            : Number(
                                                e.target.value
                                            )
                                    )
                                }
                                className={inputClass(
                                    "invoiceStartNumber"
                                )}
                            />

                            {errors.invoiceStartNumber && (
                                <p className={errorClass}>
                                    {errors.invoiceStartNumber}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                Currency
                                <span className="text-red-500 ml-1">
                                    *
                                </span>
                            </label>

                            <select
                                value={
                                    form.currency || "INR"
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "currency",
                                        e.target.value
                                    )
                                }
                                className={`w-full h-10 border rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 ${errors.currency
                                    ? "border-red-400 focus:ring-red-100"
                                    : "border-gray-300 focus:border-blue-400 focus:ring-blue-100"
                                    }`}
                            >
                                <option value="INR">
                                    INR - Indian Rupee
                                </option>

                                <option value="USD">
                                    USD - US Dollar
                                </option>

                                <option value="EUR">
                                    EUR - Euro
                                </option>
                            </select>

                            {errors.currency && (
                                <p className={errorClass}>
                                    {errors.currency}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>
                                Financial Year Start
                                <span className="text-red-500 ml-1">
                                    *
                                </span>
                            </label>

                            <input
                                type="date"
                                value={
                                    form.financialYearStart || ""
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "financialYearStart",
                                        e.target.value
                                    )
                                }
                                className={inputClass(
                                    "financialYearStart"
                                )}
                            />

                            {errors.financialYearStart && (
                                <p className={errorClass}>
                                    {errors.financialYearStart}
                                </p>
                            )}
                        </div>

                    </div>

                    <div className="mt-8 border-t border-gray-200 pt-6 max-w-4xl">

                        <h3 className="text-sm font-semibold text-gray-700 mb-4">
                            Company Status
                        </h3>

                        <div className="max-w-sm">
                            <label className={labelClass}>
                                Status
                            </label>

                            <select
                                value={
                                    form.status || "ACTIVE"
                                }
                                onChange={(e) =>
                                    handleChange(
                                        "status",
                                        e.target.value
                                    )
                                }
                                className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>

                                <option value="DRAFT">
                                    Draft
                                </option>
                            </select>
                        </div>

                    </div>

                </div>
            </div>
        );
    };

    /* =========================================================
       BRANDING TAB
    ========================================================= */

    const renderBrandingTab = () => {
        return (
            <div className="w-full max-w-7xl">

                <div className="bg-white border border-gray-200 rounded-lg p-6">

                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-gray-800">
                            Company Branding
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Upload the company logo and signature used in documents and invoices.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">

                        {/* LOGO */}

                        <div className="border border-gray-200 rounded-lg p-4">

                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-gray-800">
                                    Company Logo
                                </h3>

                                <p className="text-xs text-gray-500 mt-1">
                                    Recommended for invoices and company documents.
                                </p>
                            </div>

                            <label className="border border-dashed border-gray-300 rounded-lg h-52 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">

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

                                        <span className="text-sm text-gray-500 mt-2">
                                            Upload Logo
                                        </span>

                                        <span className="text-xs text-gray-400 mt-1">
                                            PNG, JPG, WEBP
                                        </span>
                                    </>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleFileChange(
                                            "logo",
                                            e.target.files?.[0]
                                        )
                                    }
                                />

                            </label>
                        </div>

                        {/* SIGNATURE */}

                        <div className="border border-gray-200 rounded-lg p-4">

                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-gray-800">
                                    Signature
                                </h3>

                                <p className="text-xs text-gray-500 mt-1">
                                    Signature used on invoices and documents.
                                </p>
                            </div>

                            <label className="border border-dashed border-gray-300 rounded-lg h-52 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">

                                {signaturePreview ? (
                                    <img
                                        src={signaturePreview}
                                        alt="Signature"
                                        className="h-40 max-w-full object-contain"
                                    />
                                ) : (
                                    <>
                                        <Upload
                                            size={28}
                                            className="text-gray-400"
                                        />

                                        <span className="text-sm text-gray-500 mt-2">
                                            Upload Signature
                                        </span>

                                        <span className="text-xs text-gray-400 mt-1">
                                            PNG, JPG, WEBP
                                        </span>
                                    </>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleFileChange(
                                            "signature",
                                            e.target.files?.[0]
                                        )
                                    }
                                />

                            </label>
                        </div>

                    </div>

                </div>
            </div>
        );
    };

    /* =========================================================
       ACCESS CHECK - AUTH / PERMISSION LOADING
    ========================================================= */

    if (
        authChecking ||
        (
            !hasFullAccess &&
            permissionLoading &&
            !permissionsLoaded
        )
    ) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-sm text-gray-500">
                    Checking permissions...
                </div>
            </div>
        );
    }

    /* =========================================================
       AUTHENTICATION CHECK
    ========================================================= */

    if (!isAuthenticated) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center max-w-md w-full">

                    <UserRoundArrowLeft
                        className="mx-auto text-red-500 mb-4"
                        size={42}
                    />

                    <h2 className="text-lg font-semibold text-gray-800">
                        Authentication Required
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                        Please login to create a company.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/companies")
                        }
                        className="mt-6 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                    >
                        Back to Companies
                    </button>

                </div>

            </div>
        );
    }

    /* =========================================================
       PERMISSION CHECK
    ========================================================= */

    if (
        !hasFullAccess &&
        permissionsLoaded &&
        !canCreateCompany
    ) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center max-w-md w-full">

                    <ShieldCheck
                        className="mx-auto text-red-500 mb-4"
                        size={44}
                    />

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                        You do not have permission to create a company.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/companies")
                        }
                        className="mt-6 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                    >
                        Back to Companies
                    </button>

                </div>

            </div>
        );
    }

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="flex flex-col h-full min-h-0 bg-gray-50">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="shrink-0 px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Building2
                            size={20}
                            className="text-blue-600"
                        />
                    </div>

                    <div>

                        <h1 className="text-lg font-semibold text-gray-800">
                            New Company
                        </h1>

                        <p className="text-xs text-gray-500 mt-0.5">
                            Create a new company
                        </p>

                    </div>

                </div>

                <button
                    type="button"
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

            </div>

            {/* =================================================
                TABS
            ================================================= */}

            <div className="shrink-0 px-6 bg-white border-b border-gray-200 flex items-center gap-7 overflow-x-auto">

                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                            setActiveTab(tab.id)
                        }
                        className={`py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${activeTab === tab.id
                            ? "text-blue-600 border-blue-600"
                            : "text-gray-500 border-transparent hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}

            </div>

            {/* =================================================
                BODY
            ================================================= */}

            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">

                {activeTab === "company" &&
                    renderCompanyTab()}

                {activeTab === "contact" &&
                    renderContactTab()}

                {activeTab === "tax" &&
                    renderTaxTab()}

                {activeTab === "settings" &&
                    renderSettingsTab()}

                {activeTab === "branding" &&
                    renderBrandingTab()}

            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4 flex items-center justify-end gap-3">

                <button
                    type="button"
                    disabled={loading}
                    onClick={handleCancel}
                    className="h-10 px-5 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancel
                </button>

                <div className="relative flex">

                    {/* MAIN SAVE */}

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                            handleSave({
                                saveAndNew: false,
                                saveAndClose: true,
                            })
                        }
                        className="h-10 px-5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading
                            ? "Saving..."
                            : "Save Company"}
                    </button>

                    {/* DROPDOWN */}

                    <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                            setShowSaveMenu(
                                (previous) =>
                                    !previous
                            )
                        }
                        className="h-10 w-10 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md border-l border-blue-400 flex items-center justify-center disabled:opacity-50"
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
                            <div
                                className="fixed inset-0 z-[80]"
                                onClick={() =>
                                    setShowSaveMenu(
                                        false
                                    )
                                }
                            />

                            <div className="absolute right-0 bottom-full mb-2 w-56 bg-white border border-gray-200 rounded-md shadow-xl z-[90] overflow-hidden">

                                {/* SAVE & NEW */}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSaveMenu(
                                            false
                                        );

                                        handleSave({
                                            saveAndNew: true,
                                            saveAndClose: false,
                                        });
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                                >
                                    <div className="font-medium text-sm text-gray-700">
                                        Save & New
                                    </div>

                                    <div className="text-xs text-gray-400 mt-0.5">
                                        Save and create another company
                                    </div>
                                </button>

                                {/* SAVE & CLOSE */}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSaveMenu(
                                            false
                                        );

                                        handleSave({
                                            saveAndNew: false,
                                            saveAndClose: true,
                                        });
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50"
                                >
                                    <div className="font-medium text-sm text-gray-700">
                                        Save & Close
                                    </div>

                                    <div className="text-xs text-gray-400 mt-0.5">
                                        Save and return to companies
                                    </div>
                                </button>

                            </div>
                        </>
                    )}

                </div>

            </div>

        </div>
    );
}