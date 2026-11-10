import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Building2,
    UserRound,
    MapPin,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    FileText,
    Globe,
    ShieldCheck,
    Copy,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    addCustomer,
    getCustomerById,
    editCustomer,
    fetchAllCustomers,
} from "../thunks/customerThunks";

import {
    setField,
    setAddressField,
    copyBillingToShipping,
    setSelectedCustomer,
    resetCustomerForm,
    resetDirty,
} from "../slices/customerSlices";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../common/custom/CustomSelect";

import LeaveConfirmationModal from "../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../../../common/confirmation/useLeaveConfirmation";

import { closeModal } from "../../ui/uiSlice";

/* =========================================================
   FORM FIELD
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


/* =========================================================
   TEXT INPUT
========================================================= */

const TextInput = ({
    value,
    onChange,
    placeholder,
    type = "text",
    disabled = false,
    maxLength,
    min,
    step,
}) => (
    <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        min={min}
        step={step}
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

/* =========================================================
   TEXTAREA
========================================================= */

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

/* =========================================================
   SECTION HEADING
========================================================= */

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
   ADDRESS SECTION
========================================================= */

const AddressSection = ({
    title,
    description,
    addressType,
    address,
    onChange,
    onCopy,
    showCopy = false,
}) => {
    const handleChange = (field, value) => {
        onChange(addressType, field, value);
    };

    return (
        <section className="mb-7">
            <div className="
                mb-5 flex flex-wrap items-center
                justify-between gap-3
            ">
                <SectionHeading
                    icon={MapPin}
                    title={title}
                    description={description}
                />

                {showCopy && (
                    <button
                        type="button"
                        onClick={onCopy}
                        className="
                            flex items-center gap-2 rounded-lg
                            border border-blue-200 px-3 py-2
                            text-xs font-medium text-[#408DFB]
                            transition hover:bg-blue-50
                        "
                    >
                        <Copy size={14} />
                        Copy Billing Address
                    </button>
                )}
            </div>

            <div className="
                grid grid-cols-1 gap-4
                rounded-xl border border-gray-200
                bg-gray-50/50 p-4
                md:grid-cols-2 lg:grid-cols-3
            ">
                <FormField label="Attention">
                    <TextInput
                        value={address?.attention}
                        onChange={(e) =>
                            handleChange("attention", e.target.value)
                        }
                        placeholder="Enter attention name"
                        maxLength={100}
                    />
                </FormField>

                <FormField label="Country">
                    <TextInput
                        value={address?.country}
                        onChange={(e) =>
                            handleChange("country", e.target.value)
                        }
                        placeholder="Enter country"
                        maxLength={100}
                    />
                </FormField>

                <FormField label="Address">
                    <TextInput
                        value={address?.address}
                        onChange={(e) =>
                            handleChange("address", e.target.value)
                        }
                        placeholder="Enter address"
                        maxLength={250}
                    />
                </FormField>

                <FormField label="City">
                    <TextInput
                        value={address?.city}
                        onChange={(e) =>
                            handleChange("city", e.target.value)
                        }
                        placeholder="Enter city"
                        maxLength={100}
                    />
                </FormField>

                <FormField label="State">
                    <TextInput
                        value={address?.state}
                        onChange={(e) =>
                            handleChange("state", e.target.value)
                        }
                        placeholder="Enter state"
                        maxLength={100}
                    />
                </FormField>

                <FormField label="ZIP Code">
                    <TextInput
                        value={address?.zipCode}
                        onChange={(e) =>
                            handleChange(
                                "zipCode",
                                e.target.value.replace(/\D/g, "").slice(0, 10)
                            )
                        }
                        placeholder="Enter ZIP code"
                        maxLength={10}
                    />
                </FormField>

                <FormField label="Phone Code">
                    <TextInput
                        value={address?.phoneCode}
                        onChange={(e) =>
                            handleChange("phoneCode", e.target.value)
                        }
                        placeholder="+91"
                        maxLength={6}
                    />
                </FormField>

                <FormField label="Phone">
                    <TextInput
                        value={address?.phone}
                        onChange={(e) =>
                            handleChange(
                                "phone",
                                e.target.value.replace(/\D/g, "").slice(0, 15)
                            )
                        }
                        placeholder="Enter phone number"
                        maxLength={15}
                    />
                </FormField>

                <FormField label="Fax">
                    <TextInput
                        value={address?.fax}
                        onChange={(e) =>
                            handleChange("fax", e.target.value)
                        }
                        placeholder="Enter fax number"
                        maxLength={30}
                    />
                </FormField>
            </div>
        </section>
    );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const CustomerCreateNew = ({ onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const isEditMode = Boolean(id);

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const customerState = useSelector(
        (state) => state.customer ?? {}
    );

    const {
        customerForm = {},
        loading = false,
        error,
        isDirty = false,
    } = customerState;

    const customer = customerForm;

    const modalData = useSelector(
        (state) => state.ui.modal?.data
    );

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
        if (hasFullAccess) return true;

        const requestedModule = normalizeModule(moduleName);
        const requestedAction = normalizeAction(actionName);

        if (!Array.isArray(permissions)) return false;

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
                            return normalizeAction(action) === requestedAction;
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

                if (groupedPermission) return true;
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
        "Customers",
        isEditMode ? "EDIT" : "CREATE"
    );

    /* =====================================================
       CLOSE
    ===================================================== */

    const handleClose = () => {
        confirmLeave(() => {
            if (onClose) {
                onClose();
            } else {
                navigate("/invoice/customers");
            }

        });
        dispatch(closeModal());
    };

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
       FETCH CUSTOMER FOR EDIT
    ===================================================== */

    useEffect(() => {
        let mounted = true;

        if (id) {
            dispatch(getCustomerById(id))
                .unwrap()
                .then((response) => {
                    if (!mounted) return;

                    const customerData =
                        response?.data?.data ??
                        response?.data ??
                        response?.customer ??
                        response;

                    if (!customerData || !customerData.id) {
                        toast.error("Customer details not found");
                        return;
                    }

                    dispatch(setSelectedCustomer(customerData));
                })
                .catch((fetchError) => {
                    if (!mounted) return;

                    toast.error(
                        typeof fetchError === "string"
                            ? fetchError
                            : fetchError?.message ||
                            "Failed to load customer details"
                    );
                });
        } else {
            dispatch(resetCustomerForm());
            dispatch(resetDirty());
        }

        return () => {
            mounted = false;
        };
    }, [dispatch, id]);

    /* =====================================================
       DROPDOWN OPTIONS
    ===================================================== */

    const customerTypeOptions = useMemo(
        () => [
            { label: "Business", value: "Business" },
            { label: "Individual", value: "Individual" },
        ],
        []
    );

    const currencyOptions = useMemo(
        () => [
            { label: "INR - Indian Rupee", value: "INR" },
            { label: "USD - US Dollar", value: "USD" },
            { label: "EUR - Euro", value: "EUR" },
            { label: "GBP - British Pound", value: "GBP" },
        ],
        []
    );

    const languageOptions = useMemo(
        () => [
            { label: "English", value: "English" },
            { label: "Tamil", value: "Tamil" },
            { label: "Hindi", value: "Hindi" },
        ],
        []
    );

    const paymentTermsOptions = useMemo(
        () => [
            { label: "Due on Receipt", value: "Due on Receipt" },
            { label: "7 Days", value: "7 Days" },
            { label: "15 Days", value: "15 Days" },
            { label: "30 Days", value: "30 Days" },
            { label: "45 Days", value: "45 Days" },
            { label: "60 Days", value: "60 Days" },
            { label: "90 Days", value: "90 Days" },
        ],
        []
    );

    const statusOptions = useMemo(
        () => [
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" },
            { label: "Draft", value: "DRAFT" },
        ],
        []
    );

    /* =====================================================
       FIELD CHANGE
    ===================================================== */

    const handleChange = (field, value) => {
        dispatch(
            setField({
                field,
                value,
            })
        );
    };

    /* =====================================================
       ADDRESS CHANGE
    ===================================================== */

    const handleAddressChange = (addressType, field, value) => {
        dispatch(
            setAddressField({
                addressType,
                field,
                value,
            })
        );
    };

    /* =====================================================
       COPY BILLING TO SHIPPING
    ===================================================== */

    const handleCopyBilling = () => {
        dispatch(copyBillingToShipping());
        toast.success("Billing address copied to shipping address");
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {
        if (isEditMode) {
            dispatch(getCustomerById(id))
                .unwrap()
                .then((response) => {
                    const customerData =
                        response?.data?.data ??
                        response?.data ??
                        response?.customer ??
                        response;

                    dispatch(setSelectedCustomer(customerData));
                    toast.success("Customer details restored");
                })
                .catch(() => {
                    toast.error("Failed to reset customer details");
                });
        } else {
            dispatch(resetCustomerForm());
            dispatch(resetDirty());
            toast.success("Form reset successfully");
        }

        setSaveMode("close");
        setShowSaveOptions(false);
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        if (!customer.customerType) {
            toast.error("Customer type is required");
            return false;
        }

        if (!customer.firstName?.trim()) {
            toast.error("First name is required");
            return false;
        }

        if (!customer.lastName?.trim()) {
            toast.error("Last name is required");
            return false;
        }

        if (
            customer.customerType === "Business" &&
            !customer.companyName?.trim()
        ) {
            toast.error("Company name is required");
            return false;
        }

        if (!customer.displayName?.trim()) {
            toast.error("Display name is required");
            return false;
        }

        if (!customer.currency) {
            toast.error("Currency is required");
            return false;
        }

        if (!customer.email?.trim()) {
            toast.error("Email is required");
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
            toast.error("Enter a valid email address");
            return false;
        }

        if (!customer.mobile?.trim()) {
            toast.error("Mobile number is required");
            return false;
        }

        if (!/^[0-9]{10,15}$/.test(customer.mobile)) {
            toast.error("Enter a valid mobile number");
            return false;
        }

        if (
            customer.workPhone &&
            !/^[0-9]{6,15}$/.test(customer.workPhone)
        ) {
            toast.error("Enter a valid work phone number");
            return false;
        }

        if (
            customer.pan &&
            !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(customer.pan.toUpperCase())
        ) {
            toast.error("Enter a valid PAN number");
            return false;
        }

        if (
            customer.websiteUrl &&
            !/^https?:\/\/.+/i.test(customer.websiteUrl)
        ) {
            toast.error("Website URL must start with http:// or https://");
            return false;
        }

        return true;
    };

    /* =====================================================
       BUILD PAYLOAD
    ===================================================== */

    const buildPayload = () => ({
        ...(isEditMode ? { id: Number(id) } : {}),

        customerType: customer.customerType,
        salutation: customer.salutation || "",

        firstName: customer.firstName?.trim() || "",
        lastName: customer.lastName?.trim() || "",

        companyName: customer.companyName?.trim() || "",
        displayName: customer.displayName?.trim() || "",

        currency: customer.currency,

        email: customer.email?.trim() || "",

        workPhoneCode: customer.workPhoneCode || "+91",
        workPhone: customer.workPhone?.trim() || "",

        mobileCode: customer.mobileCode || "+91",
        mobile: customer.mobile?.trim() || "",

        customerLanguage: customer.customerLanguage || "",
        pan: customer.pan?.trim().toUpperCase() || "",

        paymentTerms: customer.paymentTerms || "Due on Receipt",

        enablePortal: customer.enablePortal === true,

        websiteUrl: customer.websiteUrl?.trim() || "",

        department: customer.department?.trim() || "",
        designation: customer.designation?.trim() || "",

        twitter: customer.twitter?.trim() || "",
        skype: customer.skype?.trim() || "",
        facebook: customer.facebook?.trim() || "",

        status: customer.status || "DRAFT",

        billingAddress: {
            attention: customer.billingAddress?.attention?.trim() || "",
            country: customer.billingAddress?.country?.trim() || "",
            address: customer.billingAddress?.address?.trim() || "",
            city: customer.billingAddress?.city?.trim() || "",
            state: customer.billingAddress?.state?.trim() || "",
            zipCode: customer.billingAddress?.zipCode?.trim() || "",
            phoneCode: customer.billingAddress?.phoneCode || "+91",
            phone: customer.billingAddress?.phone?.trim() || "",
            fax: customer.billingAddress?.fax?.trim() || "",
        },

        shippingAddress: {
            attention: customer.shippingAddress?.attention?.trim() || "",
            country: customer.shippingAddress?.country?.trim() || "",
            address: customer.shippingAddress?.address?.trim() || "",
            city: customer.shippingAddress?.city?.trim() || "",
            state: customer.shippingAddress?.state?.trim() || "",
            zipCode: customer.shippingAddress?.zipCode?.trim() || "",
            phoneCode: customer.shippingAddress?.phoneCode || "+91",
            phone: customer.shippingAddress?.phone?.trim() || "",
            fax: customer.shippingAddress?.fax?.trim() || "",
        },
    });

    /* =====================================================
       SUBMIT CUSTOMER
    ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

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
                `You do not have permission to ${isEditMode ? "edit" : "create"
                } customers`
            );
            return;
        }

        if (!validateForm()) return;

        const payload = buildPayload();

        try {
            const response = isEditMode
                ? await dispatch(editCustomer(payload)).unwrap()
                : await dispatch(addCustomer(payload)).unwrap();

            const responseData =
                response?.data?.data ??
                response?.data ??
                response;

            toast.success(
                response?.message ||
                (isEditMode
                    ? "Customer updated successfully"
                    : "Customer created successfully")
            );

            if (!isEditMode && saveMode === "new") {
                dispatch(resetCustomerForm());
                dispatch(resetDirty());

                dispatch(fetchAllCustomers());

                setSaveMode("close");

                return;
            }

            dispatch(fetchAllCustomers());

            dispatch(resetCustomerForm());
            dispatch(resetDirty());

            if (onClose || modalData) {
                dispatch(closeModal());
            } else {
                navigate("/invoice/customers");
            }
        } catch (submitError) {
            console.error(
                isEditMode
                    ? "Customer update error:"
                    : "Customer creation error:",
                submitError
            );

            toast.error(
                typeof submitError === "string"
                    ? submitError
                    : submitError?.message ||
                    submitError?.error ||
                    (isEditMode
                        ? "Failed to update customer"
                        : "Failed to create customer")
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

    if (!isAuthenticated) return null;

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
            <div className="flex h-full items-center justify-center rounded-xl bg-white p-8">
                <div className="text-center">
                    <div className="
                        mx-auto mb-3 flex h-12 w-12 items-center
                        justify-center rounded-full bg-red-50
                        text-lg font-semibold text-red-500
                    ">
                        !
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        You do not have permission to{" "}
                        {isEditMode ? "edit" : "create"} customers.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="
                            mt-5 rounded-lg bg-blue-600 px-5 py-2
                            text-sm font-medium text-white hover:bg-blue-700
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
                mb-3 flex shrink-0 items-center justify-between
                rounded-xl border-b-[3px] border-[#B7E34A]
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
                            {isEditMode ? "Edit Customer" : "Create Customer"}
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEditMode
                                ? "Update customer and business account details"
                                : "Add customer and business account details"}
                        </p>
                    </div>
                </div>

                <div className="
                    hidden items-center gap-2 rounded-lg
                    bg-blue-50 px-3 py-2 sm:flex
                ">
                    <Building2 size={16} className="text-[#408DFB]" />
                    <span className="text-xs font-medium text-[#408DFB]">
                        Customer
                    </span>
                </div>
            </div>

            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="
                    flex min-h-0 flex-1 flex-col
                    overflow-hidden rounded-xl bg-white shadow-sm
                "
            >
                {/* SCROLL BODY */}

                <div className="flex-1 overflow-y-auto p-5">

                    {/* BASIC INFORMATION */}

                    <section className="mb-7">
                        <SectionHeading
                            icon={UserRound}
                            title="Basic Information"
                            description="Enter customer type and personal or business information"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField label="Customer Type" required>
                                <CustomSelect
                                    value={customer.customerType || "Business"}
                                    onChange={(value) =>
                                        handleChange("customerType", value)
                                    }
                                    options={customerTypeOptions}
                                    placeholder="Select customer type"
                                />
                            </FormField>

                            <FormField label="Salutation">
                                <CustomSelect
                                    value={customer.salutation || ""}
                                    onChange={(value) =>
                                        handleChange("salutation", value)
                                    }
                                    options={[
                                        { label: "Mr.", value: "Mr." },
                                        { label: "Mrs.", value: "Mrs." },
                                        { label: "Ms.", value: "Ms." },
                                        { label: "Dr.", value: "Dr." },
                                    ]}
                                    placeholder="Select salutation"
                                />
                            </FormField>

                            <FormField label="First Name" required>
                                <TextInput
                                    value={customer.firstName}
                                    onChange={(e) =>
                                        handleChange("firstName", e.target.value)
                                    }
                                    placeholder="Enter first name"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField label="Last Name" required>
                                <TextInput
                                    value={customer.lastName}
                                    onChange={(e) =>
                                        handleChange("lastName", e.target.value)
                                    }
                                    placeholder="Enter last name"
                                    maxLength={100}
                                />
                            </FormField>

                            {customer.customerType === "Business" && (
                                <FormField label="Company Name" required>
                                    <TextInput
                                        value={customer.companyName}
                                        onChange={(e) =>
                                            handleChange("companyName", e.target.value)
                                        }
                                        placeholder="Enter company name"
                                        maxLength={150}
                                    />
                                </FormField>
                            )}

                            <FormField label="Display Name" required>
                                <TextInput
                                    value={customer.displayName}
                                    onChange={(e) =>
                                        handleChange("displayName", e.target.value)
                                    }
                                    placeholder="Enter display name"
                                    maxLength={150}
                                />
                            </FormField>

                            <FormField label="Email" required>
                                <TextInput
                                    type="email"
                                    value={customer.email}
                                    onChange={(e) =>
                                        handleChange("email", e.target.value)
                                    }
                                    placeholder="Enter email address"
                                    maxLength={150}
                                />
                            </FormField>

                            <FormField label="Currency" required>
                                <CustomSelect
                                    value={customer.currency || ""}
                                    onChange={(value) =>
                                        handleChange("currency", value)
                                    }
                                    options={currencyOptions}
                                    placeholder="Select currency"
                                />
                            </FormField>

                            <FormField label="Customer Language">
                                <CustomSelect
                                    value={customer.customerLanguage || ""}
                                    onChange={(value) =>
                                        handleChange("customerLanguage", value)
                                    }
                                    options={languageOptions}
                                    placeholder="Select language"
                                />
                            </FormField>

                            <FormField label="Mobile Code">
                                <TextInput
                                    value={customer.mobileCode || "+91"}
                                    onChange={(e) =>
                                        handleChange("mobileCode", e.target.value)
                                    }
                                    placeholder="+91"
                                    maxLength={6}
                                />
                            </FormField>

                            <FormField label="Mobile" required>
                                <TextInput
                                    value={customer.mobile}
                                    onChange={(e) =>
                                        handleChange(
                                            "mobile",
                                            e.target.value.replace(/\D/g, "").slice(0, 15)
                                        )
                                    }
                                    placeholder="Enter mobile number"
                                    maxLength={15}
                                />
                            </FormField>

                            <FormField label="Work Phone Code">
                                <TextInput
                                    value={customer.workPhoneCode || "+91"}
                                    onChange={(e) =>
                                        handleChange("workPhoneCode", e.target.value)
                                    }
                                    placeholder="+91"
                                    maxLength={6}
                                />
                            </FormField>

                            <FormField label="Work Phone">
                                <TextInput
                                    value={customer.workPhone}
                                    onChange={(e) =>
                                        handleChange(
                                            "workPhone",
                                            e.target.value.replace(/\D/g, "").slice(0, 15)
                                        )
                                    }
                                    placeholder="Enter work phone"
                                    maxLength={15}
                                />
                            </FormField>

                            <FormField label="PAN Number">
                                <TextInput
                                    value={customer.pan}
                                    onChange={(e) =>
                                        handleChange("pan", e.target.value.toUpperCase())
                                    }
                                    placeholder="Enter PAN number"
                                    maxLength={10}
                                />
                            </FormField>

                            <FormField label="Website">
                                <TextInput
                                    value={customer.websiteUrl}
                                    onChange={(e) =>
                                        handleChange("websiteUrl", e.target.value)
                                    }
                                    placeholder="https://example.com"
                                    maxLength={200}
                                />
                            </FormField>

                        </div>
                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* OTHER DETAILS */}

                    <section className="mb-7">
                        <SectionHeading
                            icon={FileText}
                            title="Other Details"
                            description="Configure customer payment and business details"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField label="Payment Terms">
                                <CustomSelect
                                    value={customer.paymentTerms || "Due on Receipt"}
                                    onChange={(value) =>
                                        handleChange("paymentTerms", value)
                                    }
                                    options={paymentTermsOptions}
                                    placeholder="Select payment terms"
                                />
                            </FormField>

                            <FormField label="Department">
                                <TextInput
                                    value={customer.department}
                                    onChange={(e) =>
                                        handleChange("department", e.target.value)
                                    }
                                    placeholder="Enter department"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField label="Designation">
                                <TextInput
                                    value={customer.designation}
                                    onChange={(e) =>
                                        handleChange("designation", e.target.value)
                                    }
                                    placeholder="Enter designation"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField label="Twitter">
                                <TextInput
                                    value={customer.twitter}
                                    onChange={(e) =>
                                        handleChange("twitter", e.target.value)
                                    }
                                    placeholder="Enter Twitter profile"
                                    maxLength={150}
                                />
                            </FormField>

                            <FormField label="Skype">
                                <TextInput
                                    value={customer.skype}
                                    onChange={(e) =>
                                        handleChange("skype", e.target.value)
                                    }
                                    placeholder="Enter Skype ID"
                                    maxLength={150}
                                />
                            </FormField>

                            <FormField label="Facebook">
                                <TextInput
                                    value={customer.facebook}
                                    onChange={(e) =>
                                        handleChange("facebook", e.target.value)
                                    }
                                    placeholder="Enter Facebook profile"
                                    maxLength={150}
                                />
                            </FormField>

                            <FormField label="Status">
                                <CustomSelect
                                    value={customer.status || "DRAFT"}
                                    onChange={(value) =>
                                        handleChange("status", value)
                                    }
                                    options={statusOptions}
                                    placeholder="Select status"
                                />
                            </FormField>

                        </div>
                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* BILLING ADDRESS */}

                    <AddressSection
                        title="Billing Address"
                        description="Enter the customer's billing address"
                        addressType="billingAddress"
                        address={customer.billingAddress}
                        onChange={handleAddressChange}
                    />

                    <div className="my-6 border-t border-gray-100" />

                    {/* SHIPPING ADDRESS */}

                    <AddressSection
                        title="Shipping Address"
                        description="Enter the customer's shipping address"
                        addressType="shippingAddress"
                        address={customer.shippingAddress}
                        onChange={handleAddressChange}
                        showCopy
                        onCopy={handleCopyBilling}
                    />

                    <div className="my-6 border-t border-gray-100" />

                    {/* CUSTOMER PORTAL */}

                    <section className="mb-3">
                        <SectionHeading
                            icon={ShieldCheck}
                            title="Customer Portal"
                            description="Configure customer portal access"
                        />

                        <div className="
                            flex flex-wrap items-center
                            justify-between gap-4 rounded-xl
                            border border-gray-200 bg-gray-50/50 p-4
                        ">
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    Enable Customer Portal
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Allow this customer to access the customer portal.
                                </p>
                            </div>

                            <label className="relative inline-flex cursor-pointer items-center">
                                <input
                                    type="checkbox"
                                    checked={customer.enablePortal === true}
                                    onChange={(e) =>
                                        handleChange("enablePortal", e.target.checked)
                                    }
                                    className="peer sr-only"
                                />

                                <div className="
                                    h-6 w-11 rounded-full bg-gray-300
                                    transition peer-checked:bg-[#408DFB]
                                    after:absolute after:left-[3px]
                                    after:top-[3px] after:h-[18px]
                                    after:w-[18px] after:rounded-full
                                    after:bg-white after:transition-all
                                    peer-checked:after:translate-x-5
                                " />
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
                            disabled={loading}
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
                                ? isEditMode ? "Updating..." : "Saving..."
                                : isEditMode ? "Update" : "Save"
                            }
                        </button>

                        <div className="relative">

                            <button
                                type="button"
                                disabled={loading}
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
                                    {!isEditMode && (
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
                                    )}

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
                                        {isEditMode ? "Update & Close" : "Save & Close"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            {/* LEAVE CONFIRMATION */}

            <LeaveConfirmationModal
                show={showLeaveConfirmation}
                title="Leave Customer?"
                message="Are you sure you want to leave this customer page?"
                stayText="Stay Here"
                leaveText="Leave"
                onStay={handleStay}
                onLeave={handleLeave}
            />
        </div>
    );
};

export default CustomerCreateNew;