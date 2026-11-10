
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Building2,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    FileText,
    Phone,
    MapPin,
    Receipt,
    Image as ImageIcon,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createCompany,
    fetchCompanyById,
    updateCompany,
} from "../thunks/companyThunks";

import {
    resetCompanyForm,
} from "../slices/companySlice";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../common/custom/CustomSelect";

import LeaveConfirmationModal from "../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../../../common/confirmation/useLeaveConfirmation";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
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

    logo: null,
    signature: null,

    invoicePrefix: "",
    invoiceStartNumber: 1,
    currency: "INR",
    financialYearStart: "",

    status: "ACTIVE",
    isDefault: false,
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
        <label
            className={`text-sm font-medium ${required ? "text-red-400" : "text-gray-500"
                }`}
        >
            {label}

            {required && (
                <span className="ml-1 text-red-400">*</span>
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
}) => (
    <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
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

const CompanyCreateSimple = ({ onClose }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const isEditMode = Boolean(id);

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const companyState = useSelector(
        (state) => state.company ?? {}
    );

    const {
        company,
        loading = false,
    } = companyState;

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

    const [logoPreview, setLogoPreview] = useState("");
    const [signaturePreview, setSignaturePreview] = useState("");

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
        "Companies",
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
       FETCH COMPANY FOR EDIT
    ===================================================== */

    useEffect(() => {

        if (!id || !isAuthenticated) {
            return;
        }

        dispatch(fetchCompanyById(id));

    }, [dispatch, id, isAuthenticated]);

    /* =====================================================
       CHECK CURRENT COMPANY
    ===================================================== */

    const isCurrentCompanyLoaded =
        isEditMode &&
        company?.id != null &&
        String(company.id) === String(id);

    /* =====================================================
       POPULATE EDIT FORM
    ===================================================== */

    useEffect(() => {

        if (!isCurrentCompanyLoaded) {
            return;
        }

        setFormData({
            companyName: company.companyName ?? "",
            displayName: company.displayName ?? "",
            legalName: company.legalName ?? "",
            companyCode: company.companyCode ?? "",

            gstNumber: company.gstNumber ?? "",
            panNumber: company.panNumber ?? "",
            tanNumber: company.tanNumber ?? "",

            email: company.email ?? "",
            phone: company.phone ?? "",
            alternatePhone: company.alternatePhone ?? "",
            website: company.website ?? "",

            addressLine1: company.addressLine1 ?? "",
            addressLine2: company.addressLine2 ?? "",
            city: company.city ?? "",
            state: company.state ?? "",
            country: company.country ?? "India",
            pincode: company.pincode ?? "",

            logo: company.logo ?? null,
            signature: company.signature ?? null,

            invoicePrefix: company.invoicePrefix ?? "",
            invoiceStartNumber: company.invoiceStartNumber ?? 1,
            currency: company.currency ?? "INR",
            financialYearStart: company.financialYearStart ?? "",

            status: company.status ?? "ACTIVE",
            isDefault: company.isDefault ?? false,
        });

        setLogoPreview(company.logo ?? "");
        setSignaturePreview(company.signature ?? "");

    }, [
        isCurrentCompanyLoaded,
        company,
    ]);

    /* =====================================================
       PREVIEW URL CLEANUP
    ===================================================== */

    useEffect(() => {

        return () => {

            if (logoPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(logoPreview);
            }

            if (signaturePreview?.startsWith("blob:")) {
                URL.revokeObjectURL(signaturePreview);
            }
        };

    }, [
        logoPreview,
        signaturePreview,
    ]);

    /* =====================================================
       CURRENCY OPTIONS
    ===================================================== */

    const currencyOptions = useMemo(() => [
        { label: "Indian Rupee (INR)", value: "INR" },
        { label: "US Dollar (USD)", value: "USD" },
        { label: "Euro (EUR)", value: "EUR" },
        { label: "British Pound (GBP)", value: "GBP" },
        { label: "UAE Dirham (AED)", value: "AED" },
        { label: "Saudi Riyal (SAR)", value: "SAR" },
    ], []);

    /* =====================================================
       STATUS OPTIONS
    ===================================================== */

    const statusOptions = useMemo(() => [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
    ], []);

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
       HANDLE IMAGE CHANGE
    ===================================================== */

    const handleImageChange = (field, file) => {

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5 MB");
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        if (field === "logo") {
            setLogoPreview(previewUrl);
        }

        if (field === "signature") {
            setSignaturePreview(previewUrl);
        }

        handleChange(field, file);
    };

    /* =====================================================
       HANDLE CLOSE
    ===================================================== */

    const handleClose = () => {

        confirmLeave(() => {

            if (onClose) {
                onClose();
            } else {
                navigate("/settings/companies");
            }
        });
    };

    /* =====================================================
       GET COMPANY FORM DATA
    ===================================================== */

    const getCompanyFormData = () => ({

        companyName: company.companyName ?? "",
        displayName: company.displayName ?? "",
        legalName: company.legalName ?? "",
        companyCode: company.companyCode ?? "",

        gstNumber: company.gstNumber ?? "",
        panNumber: company.panNumber ?? "",
        tanNumber: company.tanNumber ?? "",

        email: company.email ?? "",
        phone: company.phone ?? "",
        alternatePhone: company.alternatePhone ?? "",
        website: company.website ?? "",

        addressLine1: company.addressLine1 ?? "",
        addressLine2: company.addressLine2 ?? "",
        city: company.city ?? "",
        state: company.state ?? "",
        country: company.country ?? "India",
        pincode: company.pincode ?? "",

        logo: company.logo ?? null,
        signature: company.signature ?? null,

        invoicePrefix: company.invoicePrefix ?? "",
        invoiceStartNumber: company.invoiceStartNumber ?? 1,
        currency: company.currency ?? "INR",
        financialYearStart: company.financialYearStart ?? "",

        status: company.status ?? "ACTIVE",
        isDefault: company.isDefault ?? false,
    });

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {

        if (isEditMode) {

            if (!isCurrentCompanyLoaded) {
                return;
            }

            setFormData(getCompanyFormData());

            setLogoPreview(company.logo ?? "");
            setSignaturePreview(company.signature ?? "");

        } else {

            setFormData({
                ...initialFormData,
            });

            setLogoPreview("");
            setSignaturePreview("");
        }

        setSaveMode("close");
        setShowSaveOptions(false);

        dispatch(resetCompanyForm());
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {

        if (!formData.companyName.trim()) {
            toast.error("Company name is required");
            return false;
        }

        if (!formData.displayName.trim()) {
            toast.error("Display name is required");
            return false;
        }

        if (!formData.legalName.trim()) {
            toast.error("Legal name is required");
            return false;
        }

        if (!formData.companyCode.trim()) {
            toast.error("Company code is required");
            return false;
        }

        if (!formData.email.trim()) {
            toast.error("Email is required");
            return false;
        }

        if (!formData.phone.trim()) {
            toast.error("Phone number is required");
            return false;
        }

        if (!formData.currency) {
            toast.error("Currency is required");
            return false;
        }

        // if (!formData.invoicePrefix.trim()) {
        //     toast.error("Invoice prefix is required");
        //     return false;
        // }

        if (
            formData.invoiceStartNumber === "" ||
            Number(formData.invoiceStartNumber) < 1
        ) {
            toast.error("Enter a valid invoice start number");
            return false;
        }

        if (!formData.status) {
            toast.error("Company status is required");
            return false;
        }

        return true;
    };

    /* =====================================================
       SAVE COMPANY
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) {
            return;
        }

        if (isEditMode && !isCurrentCompanyLoaded) {
            toast.error("Company details are still loading");
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
                `You do not have permission to ${isEditMode ? "edit" : "create"} companies`
            );
            return;
        }

        if (!validateForm()) {
            return;
        }

        const payload = {

            companyName: formData.companyName.trim(),
            displayName: formData.displayName.trim(),
            legalName: formData.legalName.trim(),
            companyCode: formData.companyCode.trim().toUpperCase(),

            gstNumber: formData.gstNumber.trim().toUpperCase() || null,
            panNumber: formData.panNumber.trim().toUpperCase() || null,
            tanNumber: formData.tanNumber.trim().toUpperCase() || null,

            email: formData.email.trim(),
            phone: formData.phone.trim(),
            alternatePhone: formData.alternatePhone.trim() || null,
            website: formData.website.trim() || null,

            addressLine1: formData.addressLine1.trim() || null,
            addressLine2: formData.addressLine2.trim() || null,
            city: formData.city.trim() || null,
            state: formData.state.trim() || null,
            country: formData.country.trim() || null,
            pincode: formData.pincode.trim() || null,

            logo: formData.logo,
            signature: formData.signature,

            invoicePrefix: formData.invoicePrefix.trim().toUpperCase(),
            invoiceStartNumber: Number(formData.invoiceStartNumber),
            currency: formData.currency,
            financialYearStart: formData.financialYearStart || null,

            status: formData.status,
            isDefault: formData.isDefault,
        };

        try {

            const response = isEditMode
                ? await dispatch(
                    updateCompany({
                        id,
                        data: payload,
                    })
                ).unwrap()
                : await dispatch(
                    createCompany(payload)
                ).unwrap();

            toast.success(
                response?.message ||
                `Company ${isEditMode ? "updated" : "created"} successfully`
            );

            if (!isEditMode && saveMode === "new") {

                setFormData({
                    ...initialFormData,
                });

                setLogoPreview("");
                setSignaturePreview("");

                dispatch(resetCompanyForm());

                setSaveMode("close");

                return;
            }

            dispatch(resetCompanyForm());

            if (onClose) {
                onClose();
            } else {
                navigate("/settings/companies");
            }

        } catch (error) {

            console.error(
                `Company ${isEditMode ? "update" : "creation"} error:`,
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    `Failed to ${isEditMode ? "update" : "create"} company`
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
        (loading || !isCurrentCompanyLoaded)
    ) {

        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Loading company...
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
                        {isEditMode ? "edit" : "create"} companies.
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
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <h2 className="text-base font-semibold text-gray-800">
                            {isEditMode
                                ? "Edit Company"
                                : "Create Company"
                            }
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEditMode
                                ? "Update the existing company information"
                                : "Create and configure your company profile"
                            }
                        </p>
                    </div>

                </div>

                <div className="
                    hidden items-center gap-2 rounded-lg
                    bg-blue-50 px-3 py-2 sm:flex
                ">
                    <Building2 size={16} className="text-[#408DFB]" />

                    <span className="text-xs font-medium text-[#408DFB]">
                        Company
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

                    {/* COMPANY DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Building2}
                            title="Company Details"
                            description="Enter the basic information about your company"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField label="Company Name" required>
                                <TextInput
                                    value={formData.companyName}
                                    onChange={(e) =>
                                        handleChange("companyName", e.target.value)
                                    }
                                    placeholder="Enter company name"
                                    maxLength={150}
                                />
                            </FormField>

                            <FormField label="Display Name" required>
                                <TextInput
                                    value={formData.displayName}
                                    onChange={(e) =>
                                        handleChange("displayName", e.target.value)
                                    }
                                    placeholder="Enter display name"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField label="Legal Name" required>
                                <TextInput
                                    value={formData.legalName}
                                    onChange={(e) =>
                                        handleChange("legalName", e.target.value)
                                    }
                                    placeholder="Enter legal company name"
                                    maxLength={200}
                                />
                            </FormField>

                            <FormField label="Company Code" required>
                                <TextInput
                                    value={formData.companyCode}
                                    onChange={(e) =>
                                        handleChange("companyCode", e.target.value)
                                    }
                                    placeholder="Example: FFTECH"
                                    maxLength={50}
                                />
                            </FormField>

                            <FormField label="Company Status" required>
                                <CustomSelect
                                    value={formData.status}
                                    onChange={(value) =>
                                        handleChange("status", value)
                                    }
                                    options={statusOptions}
                                    placeholder="Select company status"
                                />
                            </FormField>

                            <FormField label="Currency" required>
                                <CustomSelect
                                    value={formData.currency}
                                    onChange={(value) =>
                                        handleChange("currency", value)
                                    }
                                    options={currencyOptions}
                                    placeholder="Select currency"
                                />
                            </FormField>

                        </div>

                    </section>

                    {/* CONTACT INFORMATION */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={Phone}
                            title="Contact Information"
                            description="Enter company contact and communication details"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-2
                        ">

                            <FormField label="Email" required>
                                <TextInput
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        handleChange("email", e.target.value)
                                    }
                                    placeholder="Enter company email"
                                    maxLength={150}
                                />
                            </FormField>

                            <FormField label="Phone" required>
                                <TextInput
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        handleChange("phone", e.target.value)
                                    }
                                    placeholder="Enter phone number"
                                    maxLength={20}
                                />
                            </FormField>

                            <FormField label="Alternate Phone">
                                <TextInput
                                    type="tel"
                                    value={formData.alternatePhone}
                                    onChange={(e) =>
                                        handleChange("alternatePhone", e.target.value)
                                    }
                                    placeholder="Enter alternate phone"
                                    maxLength={20}
                                />
                            </FormField>

                            <FormField label="Website">
                                <TextInput
                                    value={formData.website}
                                    onChange={(e) =>
                                        handleChange("website", e.target.value)
                                    }
                                    placeholder="https://example.com"
                                    maxLength={200}
                                />
                            </FormField>

                        </div>

                    </section>



                    <div className="my-6 border-t border-gray-100" />

                    {/* TAX INFORMATION */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={FileText}
                            title="Tax Information"
                            description="Enter your company tax registration details"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField label="GST Number">
                                <TextInput
                                    value={formData.gstNumber}
                                    onChange={(e) =>
                                        handleChange(
                                            "gstNumber",
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    placeholder="Enter GST number"
                                    maxLength={15}
                                />
                            </FormField>

                            <FormField label="PAN Number">
                                <TextInput
                                    value={formData.panNumber}
                                    onChange={(e) =>
                                        handleChange(
                                            "panNumber",
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    placeholder="Enter PAN number"
                                    maxLength={10}
                                />
                            </FormField>

                            <FormField label="TAN Number">
                                <TextInput
                                    value={formData.tanNumber}
                                    onChange={(e) =>
                                        handleChange(
                                            "tanNumber",
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    placeholder="Enter TAN number"
                                    maxLength={10}
                                />
                            </FormField>

                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />


                    <div className="my-6 border-t border-gray-100" />

                    {/* ADDRESS INFORMATION */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={MapPin}
                            title="Address Information"
                            description="Enter your registered company address"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField label="Address Line 1">
                                <TextInput
                                    value={formData.addressLine1}
                                    onChange={(e) =>
                                        handleChange("addressLine1", e.target.value)
                                    }
                                    placeholder="Enter address line 1"
                                    maxLength={200}
                                />
                            </FormField>

                            <FormField label="Address Line 2">
                                <TextInput
                                    value={formData.addressLine2}
                                    onChange={(e) =>
                                        handleChange("addressLine2", e.target.value)
                                    }
                                    placeholder="Enter address line 2"
                                    maxLength={200}
                                />
                            </FormField>

                            <FormField label="City">
                                <TextInput
                                    value={formData.city}
                                    onChange={(e) =>
                                        handleChange("city", e.target.value)
                                    }
                                    placeholder="Enter city"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField label="State">
                                <TextInput
                                    value={formData.state}
                                    onChange={(e) =>
                                        handleChange("state", e.target.value)
                                    }
                                    placeholder="Enter state"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField label="Country">
                                <TextInput
                                    value={formData.country}
                                    onChange={(e) =>
                                        handleChange("country", e.target.value)
                                    }
                                    placeholder="Enter country"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField label="Pincode">
                                <TextInput
                                    value={formData.pincode}
                                    onChange={(e) =>
                                        handleChange("pincode", e.target.value)
                                    }
                                    placeholder="Enter pincode"
                                    maxLength={10}
                                />
                            </FormField>

                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* COMPANY LOGO & SIGNATURE */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={ImageIcon}
                            title="Company Logo & Signature"
                            description="Upload your company logo and authorized signature"
                        />

                        <div className="
                            grid grid-cols-1 gap-6
                            md:grid-cols-2
                        ">

                            {/* COMPANY LOGO */}

                            <FormField label="Company Logo">

                                <div className="flex flex-col gap-3">

                                    <div className="
                                        flex h-36 w-full items-center
                                        justify-center overflow-hidden
                                        rounded-lg border border-dashed
                                        border-gray-300 bg-gray-50 p-3
                                    ">

                                        {logoPreview ? (

                                            <img
                                                src={logoPreview}
                                                alt="Company Logo Preview"
                                                className="
                                                    max-h-full max-w-full
                                                    object-contain
                                                "
                                            />

                                        ) : (

                                            <div className="text-center">
                                                <ImageIcon
                                                    size={30}
                                                    className="mx-auto text-gray-300"
                                                />

                                                <p className="mt-2 text-xs text-gray-400">
                                                    No company logo selected
                                                </p>
                                            </div>

                                        )}

                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={loading}
                                        onChange={(e) => {
                                            handleImageChange(
                                                "logo",
                                                e.target.files?.[0]
                                            );

                                            e.target.value = "";
                                        }}
                                        className="
                                            w-full rounded-lg border
                                            border-gray-200 bg-white
                                            px-3 py-2 text-sm text-gray-600
                                            file:mr-3 file:rounded-md
                                            file:border-0 file:bg-blue-50
                                            file:px-3 file:py-1.5
                                            file:text-sm file:font-medium
                                            file:text-blue-600
                                        "
                                    />

                                    <p className="text-xs text-gray-400">
                                        Supported image formats. Maximum size: 5 MB.
                                    </p>

                                </div>

                            </FormField>

                            {/* COMPANY SIGNATURE */}

                            <FormField label="Company Signature">

                                <div className="flex flex-col gap-3">

                                    <div className="
                                        flex h-36 w-full items-center
                                        justify-center overflow-hidden
                                        rounded-lg border border-dashed
                                        border-gray-300 bg-gray-50 p-3
                                    ">

                                        {signaturePreview ? (

                                            <img
                                                src={signaturePreview}
                                                alt="Company Signature Preview"
                                                className="
                                                    max-h-full max-w-full
                                                    object-contain
                                                "
                                            />

                                        ) : (

                                            <div className="text-center">
                                                <ImageIcon
                                                    size={30}
                                                    className="mx-auto text-gray-300"
                                                />

                                                <p className="mt-2 text-xs text-gray-400">
                                                    No signature selected
                                                </p>
                                            </div>

                                        )}

                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        disabled={loading}
                                        onChange={(e) => {
                                            handleImageChange(
                                                "signature",
                                                e.target.files?.[0]
                                            );

                                            e.target.value = "";
                                        }}
                                        className="
                                            w-full rounded-lg border
                                            border-gray-200 bg-white
                                            px-3 py-2 text-sm text-gray-600
                                            file:mr-3 file:rounded-md
                                            file:border-0 file:bg-blue-50
                                            file:px-3 file:py-1.5
                                            file:text-sm file:font-medium
                                            file:text-blue-600
                                        "
                                    />

                                    <p className="text-xs text-gray-400">
                                        Supported image formats. Maximum size: 5 MB.
                                    </p>

                                </div>

                            </FormField>

                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* INVOICE SETTINGS */}

                    <section>

                        <SectionHeading
                            icon={Receipt}
                            title="Invoice & Financial Settings"
                            description="Configure invoice numbering and financial year details"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField label="Invoice Prefix" >
                                <TextInput
                                    value={formData.invoicePrefix}
                                    onChange={(e) =>
                                        handleChange(
                                            "invoicePrefix",
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    placeholder="Example: INV"
                                    maxLength={20}
                                />
                            </FormField>

                            <FormField label="Invoice Start Number" required>
                                <TextInput
                                    type="number"
                                    value={formData.invoiceStartNumber}
                                    onChange={(e) =>
                                        handleChange(
                                            "invoiceStartNumber",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter starting number"
                                />
                            </FormField>

                            <FormField label="Financial Year Start">
                                <TextInput
                                    type="date"
                                    value={formData.financialYearStart}
                                    onChange={(e) =>
                                        handleChange(
                                            "financialYearStart",
                                            e.target.value
                                        )
                                    }
                                />
                            </FormField>

                        </div>

                        <div className="mt-5">
                            <label className="
                                flex cursor-pointer items-center gap-2
                                text-sm font-medium text-gray-700
                            ">
                                <input
                                    type="checkbox"
                                    checked={formData.isDefault}
                                    onChange={(e) =>
                                        handleChange(
                                            "isDefault",
                                            e.target.checked
                                        )
                                    }
                                    className="
                                        h-4 w-4 rounded border-gray-300
                                        text-blue-600 focus:ring-blue-500
                                    "
                                />

                                Set as default company
                            </label>
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
                                (isEditMode && !isCurrentCompanyLoaded)
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

            {/* LEAVE CONFIRMATION */}

            <LeaveConfirmationModal
                show={showLeaveConfirmation}
                title="Leave Company?"
                message="Are you sure you want to leave this company page? Any unsaved changes will be lost."
                stayText="Stay Here"
                leaveText="Leave"
                onStay={handleStay}
                onLeave={handleLeave}
            />

        </div>
    );
};

export default CompanyCreateSimple;
