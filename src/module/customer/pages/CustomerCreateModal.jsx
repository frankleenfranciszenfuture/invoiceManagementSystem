import React, { useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux";

import { closeModal } from "../../ui/uiSlice";
import toast from "react-hot-toast";

import {
    loadCustomers,
    addCustomer,
    editCustomer,
} from "../thunks/customerThunks"

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import {
    validateCustomerForm,
    setField,
    clearFieldError,
    setActiveTab,
    setAddressField,
    copyBillingToShipping,
    setErrors,
    resetSelectedCustomer,
    setSelectedCustomer,
    clearSelectedCustomer,
} from "../slices/customerSlices"

import {
    HelpCircle,
    Mail,
    Globe,
    MessageCircle,
    UploadCloud,
    ChevronDown,
    FileSpreadsheet,
    Users2Icon,
} from "lucide-react";
import CustomSelect from '../../../common/custom/CustomSelect';
import CustomSUSelect from '../../../common/custom/CustomSUSelect';
import { clearCurrencyState, setCurrencyField } from '../../currency/slices/currencySlice';

const TwitterIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231ZM17.083 19.77h1.833L7.084 4.126H5.117Z" />
    </svg>
);

const Facebook = ({ className, fill }) => (
    <svg viewBox="0 0 24 24" className={className} fill={fill || "currentColor"}>
        <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.018 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.493-3.89 3.776-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.773-1.63 1.567v1.883h2.773l-.443 2.91h-2.33V22c4.78-.756 8.438-4.922 8.438-9.94Z" />
    </svg>
);

const InfoIcon = () => (
    <HelpCircle className="inline w-3.5 h-3.5 text-gray-400 ml-1 -mt-0.5" />
);

const Label = ({ children, required }) => (
    <label className="text-sm text-gray-700 flex items-center">
        {required && <span className="text-red-500 mr-0.5">*</span>}
        <span className={required ? "text-red-500" : ""}>{children}</span>
    </label>
);


const AddressColumn = ({
    title,
    address,
    addressType,
    dispatch,
    showCopyLink = false,
}) => {
    const errors = useSelector((state) => state.customers.errors || {});

    const safeAddress = address || {
        attention: "", country: "", address: "", city: "", state: "",
        zipCode: "", phoneCode: "+91", phone: "", fax: "",
    };

    const countries = [
        "India",
        "USA",
        "UK",
        "UAE",
        "Australia",
        "New Zealand",
        "Pakistan",
        "Japan",
        "China",
    ];

    const handleAddrChange = (field) => (e) => {
        dispatch(
            setAddressField({
                addressType,
                field,
                value: e.target.value,
            })
        );

        dispatch(clearFieldError(field));
    };

    const Label = ({ children }) => (
        <label className="text-sm font-xs text-gray-500">
            {children}
        </label>
    );
    return (
        <div className="flex-1 min-w-[400px]">
            <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-lg text-gray-500">{title}</h3>

                {showCopyLink && (
                    <button
                        type="button"
                        onClick={() => dispatch(copyBillingToShipping())}
                        className="text-blue-600 hover:underline text-sm"
                    >
                        Copy billing address
                    </button>
                )}
            </div>

            <div className="space-y-4">

                {/* Attention */}
                <div className="grid grid-cols-[110px_1fr] items-center">
                    <Label>Attention</Label>

                    <input
                        type="text"
                        value={safeAddress.attention}
                        onChange={handleAddrChange("attention")}
                        className="w-full border border-gray-400 rounded px-2 py-1.5 text-gray-500 outline-none focus:border-blue-400"
                    />
                </div>

                {/* Country */}
                <div className="grid grid-cols-[110px_1fr] items-center">
                    <Label>Country/Region</Label>

                    <div className="relative">
                        <CustomSUSelect
                            value={safeAddress.country || ""}
                            onChange={(selectedOption) => {
                                const value =
                                    typeof selectedOption === "object"
                                        ? selectedOption?.value
                                        : selectedOption;

                                dispatch(setAddressField({
                                    addressType,
                                    field: "country",
                                    value: value || "",
                                }));

                                dispatch(clearFieldError("country"));
                            }}
                            options={[
                                { value: "", label: "Select Country" },
                                ...countries.map((item) => ({
                                    value: item,
                                    label: item,
                                })),
                            ]}
                            placeholder="Select Country"
                        />

                    </div>
                </div>

                {/* Street 1 */}
                <div className="grid grid-cols-[110px_1fr] items-start">
                    <Label>Address</Label>

                    <div className="space-y-3">
                        <textarea
                            rows={2}
                            placeholder="address"
                            value={safeAddress.address}
                            onChange={handleAddrChange("address")}
                            className="w-full border rounded px-2 py-1.5"
                        />


                    </div>
                </div>

                {/* City */}
                <div className="grid grid-cols-[110px_1fr] items-center">
                    <Label>City</Label>

                    <input
                        value={safeAddress.city}
                        onChange={handleAddrChange("city")}
                        className="w-full border rounded px-2 py-1.5"
                    />
                </div>

                {/* State */}
                <div className="grid grid-cols-[110px_1fr] items-center">
                    <Label>State</Label>

                    <div className="relative">
                        <CustomSUSelect
                            value={safeAddress.state || ""}
                            onChange={(selectedOption) => {
                                const value =
                                    typeof selectedOption === "object"
                                        ? selectedOption?.value
                                        : selectedOption;

                                dispatch(setAddressField({
                                    addressType,
                                    field: "state",
                                    value: value || "",
                                }));

                                dispatch(clearFieldError("state"));
                            }}
                            options={[
                                { value: "", label: "Select State" },
                                { value: "Tamil Nadu", label: "Tamil Nadu" },
                                { value: "Karnataka", label: "Karnataka" },
                                { value: "AndhraPradesh", label: "AndhraPradesh" },
                                { value: "Kerala", label: "Kerala" },
                                { value: "Maharashtra", label: "Maharashtra" },
                                { value: "Delhi", label: "Delhi" },
                                { value: "Others", label: "Others" },
                            ]}
                            placeholder="Select State"
                        />
                    </div>
                </div>

                {/* Pin Code */}
                <div className="grid grid-cols-[110px_1fr] items-center">
                    <Label>Pin Code</Label>

                    <input
                        value={safeAddress.zipCode}
                        onChange={handleAddrChange("zipCode")}
                        className="w-full border rounded px-2 py-1.5"
                    />
                </div>

                {/* Phone */}
                <div className="grid grid-cols-[110px_1fr] items-center">
                    <Label>Phone</Label>

                    <div className="flex border rounded overflow-hidden">
                        <CustomSUSelect
                            value={safeAddress.phoneCode || "+91"}
                            onChange={(selectedOption) => {
                                const value =
                                    typeof selectedOption === "object"
                                        ? selectedOption?.value
                                        : selectedOption;

                                dispatch(setAddressField({
                                    addressType,
                                    field: "phoneCode",
                                    value,
                                }));
                            }}
                            options={[
                                { value: "+91", label: "+91" },
                                { value: "+1", label: "+1" },
                                { value: "+44", label: "+44" },
                            ]}
                            width="w-[90px]"
                            size="sm"
                        />

                        <input
                            value={safeAddress.phone}
                            onChange={handleAddrChange("phone")}
                            className="flex-1 px-2 py-1.5 outline-none"
                        />
                    </div>
                </div>

                {/* Fax */}
                <div className="grid grid-cols-[110px_1fr] items-center">
                    <Label>Fax Number</Label>

                    <input
                        value={safeAddress.fax}
                        onChange={handleAddrChange("fax")}
                        className="w-full border rounded px-2 py-1.5"
                    />
                </div>

            </div>
        </div>
    );
};


export default function CreateCustomerModel() {

    const dispatch = useDispatch();

    // =========================================================
    // REDUX
    // =========================================================

    const { open, type, data } = useSelector(
        (state) => state.ui.modal
    );

    const customer = useSelector(
        (state) => state.customers.customerForm || {}
    );

    const activeTab = useSelector(
        (state) => state.customers.activeTab
    );

    const errors = useSelector(
        (state) => state.customers.errors || {}
    );

    const loading = useSelector(
        (state) => state.customers.loading === true
    );

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
        (state) => state.menuPermission?.userPermissions || []
    );

    const permissionLoading = useSelector(
        (state) => state.menuPermission?.loading === true
    );

    const permissionsLoaded = useSelector(
        (state) => state.menuPermission?.userPermissionsLoaded === true
    );

    // =========================================================
    // ADD / EDIT MODE
    // =========================================================

    const isEdit = type === "editCustomer";

    const isOpen =
        open &&
        (type === "addCustomer" || type === "editCustomer");

    // =========================================================
    // ROLE + PERMISSION CHECK
    // =========================================================

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

            const permissionAction = normalizeAction(
                permission?.actionName ||
                permission?.action?.actionName ||
                permission?.action?.name ||
                ""
            );

            if (permissionAction === requestedAction) {
                return (
                    permission?.allowed === true ||
                    permission?.allowed === "true"
                );
            }

            if (Array.isArray(permission?.actions)) {
                return permission.actions.some((action) => {

                    if (typeof action === "string") {
                        return normalizeAction(action) === requestedAction;
                    }

                    const nestedActionName = normalizeAction(
                        action?.actionName ||
                        action?.action?.actionName ||
                        action?.name ||
                        ""
                    );

                    return (
                        nestedActionName === requestedAction &&
                        (
                            action?.allowed === true ||
                            action?.allowed === "true"
                        ) &&
                        action?.active !== false &&
                        normalizeAction(action?.status) !== "INACTIVE"
                    );
                });
            }

            return false;
        });
    };

    const requiredAction = isEdit ? "EDIT" : "CREATE";

    const hasRequiredPermission = hasPermission(
        "Customers",
        requiredAction
    );

    // =========================================================
    // LOAD PERMISSIONS
    // =========================================================

    useEffect(() => {

        if (!isOpen || authChecking || !isAuthenticated) {
            return;
        }

        if (hasFullAccess) {
            return;
        }

        if (!permissionsLoaded && !permissionLoading) {
            dispatch(getUserPermission());
        }

    }, [
        isOpen,
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    // =========================================================
    // INITIALIZE FORM
    // =========================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        if (isEdit && data) {
            dispatch(setSelectedCustomer(data));
        } else {
            dispatch(resetSelectedCustomer());
        }

        dispatch(setActiveTab("Other Details"));

    }, [dispatch, isOpen, isEdit, data]);

    const changeTab = (tab) => {
        const errors = {};

        if (!customer.firstName?.trim()) {
            errors.firstName = "First name is required";
        }

        if (!customer.lastName?.trim()) {
            errors.lastName = "Last name is required";
        }

        if (!customer.companyName?.trim()) {
            errors.companyName = "Company name is required";
        }

        if (!customer.displayName?.trim()) {
            errors.displayName = "Display name is required";
        }

        // ❌ use correct variable
        if (Object.keys(errors).length > 0) {
            toast.error(Object.values(errors)[0]);

            // optional: store errors in redux
            dispatch(setErrors(errors));

            return;
        }

        dispatch(setActiveTab(tab));
    };

    const handleChange = (field) => (e) => {
        const value =
            e.target.type === "checkbox"
                ? e.target.checked
                : e.target.value;

        dispatch(setField({ field, value }));
        dispatch(clearFieldError(field));
    };


    const tabs = [
        "Other Details",
        "Address",
        "Contact Persons",
        "Custom Fields",
        "Remarks",
    ];

    const currencyNames = new Intl.DisplayNames(["en"], {
        type: "currency",
    });

    const currencies = Intl.supportedValuesOf("currency");

    const languages = [
        "English",
        "Tamil",
        "Hindi",
        "Malayalam",
        "Telugu",
        "Kannada",
        "French",
        "German",
        "Spanish",
        "Chinese",
        "Japanese",
    ];

    const getCurrencySymbol = (currency) => {
        try {
            return (0)
                .toLocaleString("en", {
                    style: "currency",
                    currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                })
                .replace(/\d/g, "")
                .trim();
        } catch {
            return "";
        }
    };

    const handleSave = async (status = "ACTIVE") => {

        if (!hasFullAccess && !permissionsLoaded) {
            toast.error("Permissions are still loading. Please try again.");
            return;
        }

        if (!hasRequiredPermission) {
            toast.error(
                isEdit
                    ? "You do not have permission to edit customers."
                    : "You do not have permission to create customers."
            );
            return;
        }

        const validationErrors = validateCustomerForm(customer);
        dispatch(setErrors(validationErrors));

        if (Object.keys(validationErrors).length > 0) {
            toast.error(Object.values(validationErrors)[0]);
            return;
        }

        try {
            const payload = { ...customer, status };

            if (isEdit) {
                await dispatch(editCustomer(payload)).unwrap();
                toast.success("Customer updated successfully!");
            } else {
                await dispatch(addCustomer(payload)).unwrap();
                toast.success(
                    status === "DRAFT"
                        ? "Customer saved as draft!"
                        : "Customer created successfully!"
                );
            }

            await dispatch(loadCustomers({
                page: 0,
                size: 10,
                search: "",
                sortBy: "displayName",
                direction: "asc",
            }));

            dispatch(resetSelectedCustomer());
            dispatch(clearSelectedCustomer());
            dispatch(closeModal());
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message || error?.description || "Failed to save customer"
            );
        }
    };

    const handleCancel = () => {
        dispatch(resetSelectedCustomer());
        dispatch(clearSelectedCustomer());
        dispatch(closeModal());
    };

    if (!isOpen) {
        return null;
    }

    // =========================================================
    // PERMISSION LOADING
    // =========================================================

    if (
        !hasFullAccess &&
        (
            authChecking ||
            permissionLoading ||
            !permissionsLoaded
        )
    ) {
        return (
            <div className="w-[950px] max-w-[95vw] min-h-[260px] rounded-xl bg-white shadow-2xl flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm font-medium text-gray-600">
                        Loading permissions...
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // UNAUTHORIZED
    // =========================================================

    if (!hasRequiredPermission) {
        return (
            <div className="w-[950px] max-w-[95vw] min-h-[300px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                <div className="shrink-0 h-[68px] flex items-center gap-3 px-6 border-b border-gray-200 bg-white">
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                        <Users2Icon size={20} className="text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-[17px] font-semibold text-gray-800">
                            Access Denied
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Customer access restricted
                        </p>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center px-6 py-10">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
                            <span className="text-red-500 text-lg font-semibold">!</span>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Access Denied
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {isEdit
                                ? "You do not have permission to edit customers."
                                : "You do not have permission to create customers."}
                        </p>
                    </div>
                </div>

                <div className="shrink-0 h-[68px] flex items-center justify-end px-6 border-t border-gray-200 bg-white">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="h-10 px-5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="
    w-full
    max-w-[1200px]
    h-[90vh]
    max-h-[90vh]
    min-h-0
    overflow-hidden
    rounded-xl
    bg-white
    shadow-2xl
    flex
    flex-col
    font-sans
    text-[13px]
">
            <div className="flex shrink-0 items-center justify-between border-b border-lime-500 px-6 py-4">
                <div className="flex items-center gap-2">
                    <div
                        className="
                    w-9
                    h-9
                    rounded-lg
                    bg-blue-50
                    flex
                    items-center
                    justify-center
                    "
                    >
                        <Users2Icon className="h-7 w-7 text-blue-600" /></div>
                    <div>

                        <h2
                            className="
                        text-[17px]
                        font-semibold
                        text-gray-800
                        "
                        >
                            {isEdit
                                ? "Edit Customer"
                                : "New Customer"}
                        </h2>

                        <p
                            className="
                        text-xs
                        text-gray-500
                        mt-0.5
                        "
                        >
                            {isEdit
                                ? "Update customer information"
                                : "Create a new customer"}
                        </p>

                    </div>
                </div>
            </div>


            {/* SCROLLABLE BODY */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-5">
                {/* GST Profile banner */}

                <div className="space-y-4">
                    {/* Customer Type */}
                    <div className="grid grid-cols-[160px_1fr] items-center">
                        <Label>
                            Customer Type <InfoIcon />
                        </Label>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="radio"
                                    name="customerType"
                                    value="Business"
                                    checked={customer.customerType === "Business"}
                                    onChange={handleChange("customerType")}
                                    className="w-4 h-4 text-blue-600 accent-blue-600"
                                />
                                <span>Business</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="radio"
                                    name="customerType"
                                    value="Individual"
                                    checked={customer.customerType === "Individual"}
                                    onChange={handleChange("customerType")}
                                    className="w-4 h-4 text-blue-600 accent-blue-600"
                                />
                                <span>Individual</span>
                            </label>
                        </div>
                    </div>

                    {/* Primary Contact */}
                    <div className="grid grid-cols-[160px_1fr] items-start">
                        <Label required>
                            Primary Contact <InfoIcon />
                        </Label>
                        <div className="flex gap-2 max-w-md">
                            <div className="relative w-32 flex-shrink-0">
                                <CustomSelect
                                    value={customer.salutation || ""}
                                    onChange={(value) => handleChange("salutation")(value)}
                                    options={[
                                        { value: "", label: "Salutation" },
                                        { value: "Mr.", label: "Mr." },
                                        { value: "Mrs.", label: "Mrs." },
                                        { value: "Ms.", label: "Ms." },
                                        { value: "Dr.", label: "Dr." },
                                    ]}
                                    placeholder="Salutation"
                                />
                            </div>
                            <div className="flex-1">
                                <input
                                    value={customer.firstName}
                                    placeholder="FirstName"
                                    onChange={handleChange("firstName")}
                                    className={`w-full rounded px-3 py-2 border  ${errors.firstName
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-400"
                                        }`}
                                />

                                {errors.firstName && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <span>⚠</span>
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>

                            <div className="flex-1">
                                <input
                                    value={customer.lastName}
                                    placeholder="LastName"
                                    onChange={handleChange("lastName")}
                                    className={`w-full rounded px-3 py-2 border  ${errors.lastName
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-400"
                                        }`}
                                />

                                {errors.lastName && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <span>⚠</span>
                                        {errors.lastName}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Company Name */}
                    <div className="grid grid-cols-[160px_1fr] items-start">
                        <Label required>Company Name</Label>

                        <div className="max-w-md w-full">
                            <input
                                value={customer.companyName}
                                onChange={handleChange("companyName")}
                                className={`w-full rounded px-3 py-2 border outline-none
                 ${errors.companyName
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300 focus:border-blue-500"
                                    }`}
                            />

                            {errors.companyName && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                    <span>⚠</span>
                                    <span>{errors.companyName}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Display Name */}
                    <div className="grid grid-cols-[160px_1fr] items-center">
                        <Label required>
                            Display Name <InfoIcon />
                        </Label>
                        <div className="relative max-w-md w-full">
                            <input
                                value={customer.displayName}
                                onChange={handleChange("displayName")}
                                className={`w-full rounded px-3 py-2 border ${errors.displayName
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                    }`}
                            />

                            {errors.displayName && (
                                <p className="mt-1 text-xs text-red-500">
                                    ⚠ {errors.displayName}
                                </p>
                            )}
                            {/* <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" /> */}
                        </div>
                    </div>

                    {/* Currency */}
                    <div className="grid grid-cols-[160px_1fr] items-start">
                        <Label required>
                            Currency <InfoIcon />
                        </Label>

                        <div className="w-full max-w-md">
                            <CustomSelect
                                value={customer.currency || ""}
                                onChange={(selectedOption) => {
                                    const value =
                                        typeof selectedOption === "object"
                                            ? selectedOption?.value
                                            : selectedOption;

                                    dispatch(
                                        setField({
                                            field: "currency",
                                            value: value || "",
                                        })
                                    );

                                    dispatch(clearFieldError("currency"));
                                }}
                                options={[
                                    { value: "", label: "Select Currency" },
                                    ...currencies.map((code) => ({
                                        value: code,
                                        label: `${getCurrencySymbol(code)} ${code} - ${currencyNames.of(code)}`,
                                    })),
                                ]}
                                placeholder="Select Currency"
                            />

                            {errors.currency && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.currency}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Email Address */}
                    <div className="grid grid-cols-[160px_1fr] items-center">
                        <Label required>
                            Email Address <InfoIcon />
                        </Label>

                        <div className="relative max-w-md w-full">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                            <input
                                type="email"
                                value={customer.email}
                                onChange={handleChange("email")}
                                className={`w-full rounded border py-2 pl-10 pr-3 ${errors.email
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300"
                                    }`}
                                placeholder="Enter email address"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="grid grid-cols-[160px_1fr] items-center">
                        <Label>
                            Phone <InfoIcon />
                        </Label>
                        <div className="flex gap-4 max-w-md w-full">
                            <div className="flex flex-1 border border-gray-300 rounded overflow-hidden focus-within:border-blue-400">

                                <div className="flex flex-1 border border-gray-300 rounded overflow-hidden focus-within:border-blue-400">
                                    <div className="relative w-[75px] shrink-0 border-r border-gray-300 bg-gray-50">
                                        <CustomSUSelect
                                            value={customer.workPhoneCode || "+91"}
                                            onChange={(selectedOption) => {
                                                const value =
                                                    typeof selectedOption === "object"
                                                        ? selectedOption?.value
                                                        : selectedOption;

                                                dispatch(setField({
                                                    field: "workPhoneCode",
                                                    value,
                                                }));

                                                dispatch(clearFieldError("workPhoneCode"));
                                            }}
                                            options={[
                                                { value: "+91", label: "+91" },
                                                { value: "+1", label: "+1" },
                                                { value: "+44", label: "+44" },
                                            ]}
                                        />
                                    </div>
                                    <input
                                        value={customer.mobile}
                                        onChange={handleChange("mobile")}
                                        className={`flex-1 px-2 py-2 ${errors.mobile ? "" : ""
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Language */}
                    <div className="grid grid-cols-[160px_1fr] items-center">
                        <Label>
                            Customer Language <InfoIcon />
                        </Label>
                        <div className="relative max-w-md w-full">
                            <CustomSelect
                                value={customer.customerLanguage || ""}
                                onChange={(selectedOption) => {
                                    const value =
                                        typeof selectedOption === "object"
                                            ? selectedOption?.value
                                            : selectedOption;

                                    dispatch(
                                        setField({
                                            field: "customerLanguage",
                                            value,
                                        })
                                    );

                                    dispatch(clearFieldError("customerLanguage"));
                                }}
                                options={[
                                    { value: "", label: "Select Language" },
                                    ...languages.map((lang) => ({
                                        value: lang,
                                        label: lang,
                                    })),
                                ]}
                                placeholder="Select Language"
                            />

                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-8 border-b border-gray-200">
                    <div className="flex gap-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => changeTab(tab)}
                                className={`pb-2.5 text-sm transition-colors relative ${activeTab === tab
                                    ? "text-blue-600 font-medium"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-600 rounded-t" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab content */}
                {activeTab === "Other Details" && (
                    <div className="space-y-4 mt-6">
                        {/* PAN */}
                        <div className="grid grid-cols-[160px_1fr] items-center border-gray-100">
                            <Label>
                                PAN <InfoIcon />
                            </Label>
                            <input
                                type="text"
                                value={customer.pan}
                                onChange={handleChange("pan")}
                                className="max-w-md w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                            />
                        </div>

                        {/* Payment Terms */}
                        <div className="grid grid-cols-[160px_1fr] items-center">
                            <Label>Payment Terms</Label>
                            <div className="relative max-w-md w-full">
                                <CustomSelect
                                    value={customer.paymentTerms || "Due on Receipt"}
                                    onChange={(selectedOption) => {
                                        const value =
                                            typeof selectedOption === "object"
                                                ? selectedOption?.value
                                                : selectedOption;

                                        dispatch(
                                            setField({
                                                field: "paymentTerms",
                                                value,
                                            })
                                        );

                                        dispatch(clearFieldError("paymentTerms"));
                                    }}
                                    options={[
                                        { value: "Due on Receipt", label: "Due on Receipt" },
                                        { value: "Net 15", label: "Net 15" },
                                        { value: "Net 30", label: "Net 30" },
                                        { value: "Net 45", label: "Net 45" },
                                    ]}
                                    placeholder="Select Payment Terms"
                                />
                            </div>
                        </div>

                        {/* Enable Portal */}
                        <div className="grid grid-cols-[160px_1fr] items-center">
                            <Label>
                                Enable Portal? <InfoIcon />
                            </Label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={customer.enablePortal}
                                    onChange={() => dispatch(setField({
                                        field: "enablePortal",
                                        value: !customer.enablePortal,
                                    }))}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600"
                                />
                                <span className="text-gray-700">
                                    Allow portal access for this customer
                                </span>
                            </label>
                        </div>

                        {/* Documents */}
                        <div className="grid grid-cols-[160px_1fr] items-start">
                            <Label>Documents</Label>
                            <div>
                                <div className="flex w-fit border border-gray-300 rounded overflow-hidden">
                                    <button
                                        type="button"
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 border-r border-gray-300"
                                    >
                                        <UploadCloud className="w-4 h-4 text-gray-500" />
                                        Upload File
                                    </button>
                                    <button type="button" className="px-2 hover:bg-gray-50">
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    You can upload a maximum of 3 files, 10MB each
                                </p>
                            </div>
                        </div>

                        {/* Website URL */}
                        <div className="grid grid-cols-[160px_1fr] items-center">
                            <Label>Website URL</Label>
                            <div className="relative max-w-md w-full">
                                <Globe className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="ex: www.zylker.com"
                                    value={customer.websiteUrl}
                                    onChange={handleChange("websiteUrl")}
                                    className="w-full border border-gray-300 rounded pl-8 pr-2 py-1.5 text-sm outline-none focus:border-blue-400 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div className="grid grid-cols-[160px_1fr] items-center">
                            <Label>Department</Label>
                            <input
                                type="text"
                                value={customer.department}
                                onChange={handleChange("department")}
                                className="max-w-md w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                            />
                        </div>

                        {/* Designation */}
                        <div className="grid grid-cols-[160px_1fr] items-center">
                            <Label>Designation</Label>
                            <input
                                type="text"
                                value={customer.designation}
                                onChange={handleChange("designation")}
                                className="max-w-md w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                            />
                        </div>

                        {/* X (Twitter) */}
                        <div className="grid grid-cols-[160px_1fr] items-start">
                            <Label>X</Label>
                            <div className="max-w-md w-full">
                                <div className="flex border border-gray-300 rounded overflow-hidden focus-within:border-blue-400">
                                    <div className="flex items-center justify-center w-9 bg-black flex-shrink-0">
                                        <TwitterIcon className="w-4 h-4 text-white" />
                                    </div>
                                    <input
                                        type="text"
                                        value={customer.twitter}
                                        onChange={handleChange("twitter")}
                                        className="flex-1 px-2 py-1.5 text-sm outline-none w-0"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">https://x.com/</p>
                            </div>
                        </div>

                        {/* Skype */}
                        <div className="grid grid-cols-[160px_1fr] items-center">
                            <Label>Skype Name/Number</Label>
                            <div className="flex max-w-md w-full border border-gray-300 rounded overflow-hidden focus-within:border-blue-400">
                                <div className="flex items-center justify-center w-9 bg-sky-400 flex-shrink-0">
                                    <MessageCircle className="w-4 h-4 text-white" />
                                </div>
                                <input
                                    type="text"
                                    value={customer.skype}
                                    onChange={handleChange("skype")}
                                    className="flex-1 px-2 py-1.5 text-sm outline-none w-0"
                                />
                            </div>
                        </div>

                        {/* Facebook */}
                        <div className="grid grid-cols-[160px_1fr] items-start">
                            <Label>Facebook</Label>
                            <div className="max-w-md w-full">
                                <div className="flex border border-gray-300 rounded overflow-hidden focus-within:border-blue-400">
                                    <div className="flex items-center justify-center w-9 bg-blue-600 flex-shrink-0">
                                        <Facebook className="w-4 h-4 text-white" fill="white" />
                                    </div>
                                    <input
                                        type="text"
                                        value={customer.facebook}
                                        onChange={handleChange("facebook")}
                                        className="flex-1 px-2 py-1.5 text-sm outline-none w-0"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    http://www.facebook.com/
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Address" && (
                    <div className="mt-6">
                        <div className="flex flex-wrap gap-10 lg:gap-20">
                            <AddressColumn
                                title="Billing Address"
                                address={customer.billingAddress}
                                addressType="billingAddress"
                                dispatch={dispatch}
                            />
                            <AddressColumn
                                title="Shipping Address"
                                address={customer.shippingAddress}
                                addressType="shippingAddress"
                                dispatch={dispatch}
                                showCopyLink
                            />
                        </div>

                        <div className="mt-8 border-l-4 border-amber-400 bg-amber-50/40 pl-4 py-2 max-w-3xl">
                            <p className="font-medium text-gray-800 mb-1">Note:</p>
                            <ul className="list-disc pl-4 text-gray-600 text-sm leading-relaxed">
                                <li>
                                    You can customise how customers' addresses are displayed in
                                    transaction PDFs. To do this, go to Settings &gt;
                                    Preferences &gt; Customers, and navigate to the Address
                                    Format sections.
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
                {activeTab === "Contact Persons" && (
                    <div className="mt-6 text-gray-400 text-sm">
                        Contact persons go here.
                    </div>
                )}
                {activeTab === "Custom Fields" && (
                    <div className="mt-6 text-gray-400 text-sm">
                        Custom fields go here.
                    </div>
                )}
                {activeTab === "Remarks" && (
                    <div className="mt-6 text-gray-400 text-sm">Remarks go here.</div>
                )}

                {/* Customer Owner */}
                <div className="mt-8 text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Customer Owner:</span>{" "}
                    Assign a user as the customer owner to provide access only to the
                    data of this customer.{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                        Learn More
                    </a>
                </div>
            </div>

            {/* Footer actions are rendered outside the scrolling form area. */}


            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">
                <button type="button" onClick={handleCancel} disabled={loading} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                {!isEdit && (
                    <button type="button" onClick={() => handleSave("DRAFT")} disabled={loading || !hasRequiredPermission} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Save as Draft</button>
                )}
                <button type="button" onClick={() => handleSave(isEdit ? (customer.status || "ACTIVE") : "ACTIVE")} disabled={loading || !hasRequiredPermission} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? (isEdit ? "Updating..." : "Saving...") : (isEdit ? "Update Customer" : "Save Customer")}</button>
            </div>
        </div>
    );
}
