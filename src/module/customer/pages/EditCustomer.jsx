import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

import CustomerBottomActionBar from '../components/bars/CustomerBottomActionBar';
import { closeCustomerModal, closeModal } from "../../ui/uiSlice";
import toast from "react-hot-toast";
import store from "../../../redux/store";


import {
    loadCustomers,
    addCustomer,
    editCustomer,
    removeCustomer,
    saveCustomer,
    getCustomerById,
    saveCustomerAddress
} from "../thunks/customerThunks"

import {
    validateCustomerForm,
    setField,
    clearFieldError,
    setActiveTab,
    toggleEnablePortal,
    setAddressField,
    copySelectedBillingToShipping,
    setCurrency,
    setErrors,
    setSelectedCustomer,
    updateSelectedCustomerField,
    setSelectedCustomerAddressField,
    resetSelectedCustomer,
    resetDirty,
} from "../slices/customerSlices"

import {
    Search,
    RotateCcw,
    HelpCircle,
    Mail,
    Globe,
    MessageCircle,
    UploadCloud,
    ChevronDown,
    FileSpreadsheet,
    ArrowDown,
    User,
    Users,
    Users2Icon,
    SquarePenIcon,
} from "lucide-react";

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
    showCopyLink,
}) => {
    const handleAddrChange = (field) => (e) => {
        dispatch(setSelectedCustomerAddressField({ addressType, field, value: e.target.value }));
    };

    const errors = useSelector((state) => state.customers.errors);
    const safeAddress = address || emptyAddress;

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

    return (
        <div className="flex-1 min-w-[400px]">
            <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-lg">{title}</h3>

                {showCopyLink && (
                    <button
                        type="button"
                        onClick={() => dispatch(copySelectedBillingToShipping())}
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
                        className="w-full border rounded px-2 py-1.5"
                    />
                </div>

                {/* Country */}
                <div className="grid grid-cols-[110px_1fr] items-center">
                    <Label>Country/Region</Label>

                    <div className="relative">
                        <select
                            value={safeAddress.country}
                            onChange={handleAddrChange("country")}
                            className={`w-full rounded px-3 py-2 border ${errors.country
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300"
                                }`}
                        >
                            <option value="">Select Country</option>

                            {countries.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                        <select
                            value={safeAddress.state}
                            onChange={handleAddrChange("state")}
                            className="w-full border rounded px-2 py-1.5 appearance-none"
                        >
                            <option value="">Select State</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Maharashtra">Maharashtra</option>
                        </select>

                        <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {/* Pin Code */}
                <div className="grid grid-cols-[110px_1fr] items-center">
                    <Label>Zip Code</Label>

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
                        <select
                            value={safeAddress.phoneCode}
                            onChange={handleAddrChange("phoneCode")}
                            className="border-r px-2"
                        >
                            <option value="+91">+91</option>
                            <option value="+1">+1</option>
                            <option value="+44">+44</option>
                        </select>

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

export default function EditCustomer({ mode = "page",
    onSuccess, }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();


    const { selectedCustomer, errors, activeTab } = useSelector(
        (state) => state.customers
    );



    const customerLanguage = useSelector(
        (state) => state.customerLanguage?.customerLanguage || "",
    );

    const isDirty = useSelector((state) => state.customers.isDirty);

    useEffect(() => {
        console.log("isDirty:", isDirty);
    }, [isDirty]);

    const changeTab = (tab) => {
        const errors = {};

        if (!selectedCustomer.firstName?.trim()) {
            errors.firstName = "First name is required";
        }

        if (!selectedCustomer.lastName?.trim()) {
            errors.lastName = "Last name is required";
        }

        if (!selectedCustomer.companyName?.trim()) {
            errors.companyName = "Company name is required";
        }

        if (!selectedCustomer.displayName?.trim()) {
            errors.displayName = "Display name is required";
        }

        // ❌ use correct variable
        if (Object.keys(errors).length > 0) {
            toast.error(Object.values(errors)[0], {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: "#dc2626",
                    color: "#fff",
                    fontWeight: "500",
                },
            });

            // optional: store errors in redux
            dispatch(setErrors(errors));

            return;
        }

        dispatch(setActiveTab(tab));
    };


    const handleChange = (field) => (e) => {
        dispatch(
            updateSelectedCustomerField({
                field,
                value: e.target.value,
            })
        );

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


    const handleUpdate = async (status) => {
        const errors = validateCustomerForm(selectedCustomer);
        dispatch(setErrors(errors));

        if (Object.keys(errors).length > 0) return;

        try {
            const updatedCustomer = await dispatch(
                editCustomer({
                    ...selectedCustomer,
                    status,
                })
            ).unwrap();

            dispatch(resetDirty());
            dispatch(resetSelectedCustomer());
            dispatch(closeModal());

            toast.success(
                status === "DRAFT"
                    ? "Customer draft updated successfully!"
                    : "Customer updated successfully!"
            );

            await dispatch(
                loadCustomers({
                    page: 0,
                    size: 5,
                    search: "",
                    sortBy: "displayName",
                    direction: "asc",
                    status: updatedCustomer.status,
                })
            );

            navigate(`/customers?status=${updatedCustomer.status}`);
        } catch (error) {
            toast.error(error?.message || "Failed to update customer");
        }
    };

    const handleCancel = () => {
        dispatch(resetDirty());

        if (mode === "modal") {
            dispatch(closeCustomerModal());
        } else {
            dispatch(closeModal());
            navigate("/customers");
        }
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteCustomer(id)).unwrap();

            toast.success("Customer deleted successfully!");
        } catch (error) {
            toast.error(error || "Delete failed");
        }
    };

    const handleSubmit = async () => {
        try {
            await dispatch(
                loadCustomers({
                    page: 0,
                    size: 5,
                    search: "",
                    sortBy: "displayName",
                    direction: "asc",
                }),
            ).unwrap();

            console.log("Customers loaded successfully");
        } catch (error) {
            console.error("Failed to load customers:", error);
        }
    };

    useEffect(() => {
        if (id) {
            dispatch(getCustomerById(id))
                .unwrap()
                .then(() => dispatch(resetDirty()));
        }
    }, [id, dispatch]);


    return (
        <div className="flex h-screen bg-gray-50 font-sans text-[13px] overflow-hidden">
            {/* Form Container Wrapper allowing separate inner scrolling */}
            <div className="flex-1 min-h-0 bg-white overflow-y-auto">
                <div className="px-6 py-5 max-w-30xl w-full ">
                    <div className="w-full border-b border-gray-100">
                        <h1 className="flex items-center gap-2 text-xl font-medium text-gray-800 mt-2 mb-4">
                            <SquarePenIcon className="w-6 h-6" />
                            <span>Edit Customer</span>
                        </h1>
                    </div>


                    <div className="mt-6 space-y-4">
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
                                        checked={selectedCustomer.customerType === "Business"}
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
                                        checked={selectedCustomer.customerType === "Individual"}
                                        onChange={handleChange("customerType")}
                                        className="w-4 h-4 text-blue-600 accent-blue-600"
                                    />
                                    <span>Individual</span>
                                </label>
                            </div>
                        </div>

                        {/* Primary Contact */}
                        <div className="grid grid-cols-[160px_1fr] items-start">
                            <Label>
                                Primary Contact <InfoIcon />
                            </Label>
                            <div className="flex gap-2 max-w-md">
                                <div className="relative w-32 flex-shrink-0">
                                    <select
                                        value={selectedCustomer.salutation}
                                        onChange={handleChange("salutation")}
                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-500 appearance-none bg-white outline-none focus:border-blue-400"
                                    >
                                        <option value="">Salutation</option>
                                        <option value="Mr.">Mr.</option>
                                        <option value="Mrs.">Mrs.</option>
                                        <option value="Ms.">Ms.</option>
                                        <option value="Dr.">Dr.</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={selectedCustomer?.firstName || ""}
                                        onChange={handleChange("firstName")}
                                        className={`w-full rounded px-3 py-2 border ${errors.firstName
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300"
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
                                        value={selectedCustomer?.lastName || ""}
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
                            <Label>Company Name</Label>

                            <div className="max-w-md w-full">
                                <input
                                    value={selectedCustomer?.companyName || ""}
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
                                    value={selectedCustomer?.displayName}
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
                            <Label>
                                Currency <InfoIcon />
                            </Label>
                            <div className="max-w-md w-full">
                                <div className="relative">
                                    <select
                                        value={selectedCustomer?.currency}
                                        onChange={(e) => {
                                            dispatch(setCurrency(e.target.value));
                                            dispatch(clearFieldError("currency"));
                                        }}
                                        className={`w-full rounded px-3 py-2 border ${errors.currency
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300"
                                            }`}
                                    >
                                        <option value="">Select Currency</option>

                                        {currencies.map((code) => (
                                            <option key={code} value={code}>
                                                {getCurrencySymbol(code)} {code} -{" "}
                                                {currencyNames.of(code)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                {/* <p className="text-xs text-gray-400 mt-1">
                    Currency cannot be edited as multi-currency handling is
                    unavailable in Zoho Invoice. <InfoIcon />
                  </p> */}
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="grid grid-cols-[160px_1fr] items-center">
                            <Label>
                                Email Address <InfoIcon />
                            </Label>

                            <div className="relative max-w-md w-full">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                                <input
                                    type="email"
                                    value={selectedCustomer?.email}
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
                                    <div className="relative">
                                        <select
                                            value={selectedCustomer?.workPhoneCode}
                                            onChange={handleChange("workPhoneCode")}
                                            className="appearance-none bg-gray-50 border-r border-gray-300 pl-2 pr-5 py-1.5 text-sm outline-none"
                                        >
                                            <option value="+91">+91</option>
                                            <option value="+1">+1</option>
                                            <option value="+44">+44</option>
                                        </select>
                                        <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                    <input
                                        value={selectedCustomer?.workPhone}
                                        onChange={handleChange("workPhone")}
                                        className={`flex-1 px-2 py-2 ${errors.workPhone ? "bg-red-50" : ""
                                            }`}
                                    />
                                </div>
                                <div className="flex flex-1 border border-gray-300 rounded overflow-hidden focus-within:border-blue-400">
                                    <div className="relative">
                                        <select
                                            value={selectedCustomer?.mobileCode}
                                            onChange={handleChange("mobileCode")}
                                            className="appearance-none bg-gray-50 border-r border-gray-300 pl-2 pr-5 py-1.5 text-sm outline-none"
                                        >
                                            <option value="+91">+91</option>
                                            <option value="+1">+1</option>
                                            <option value="+44">+44</option>
                                        </select>
                                        <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                    <input
                                        value={selectedCustomer?.mobile}
                                        onChange={handleChange("mobile")}
                                        className={`flex-1 px-2 py-2 ${errors.mobile ? "bg-red-50" : ""
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Customer Language */}
                        <div className="grid grid-cols-[160px_1fr] items-center">
                            <Label>
                                Customer Language <InfoIcon />
                            </Label>
                            <div className="relative max-w-md w-full">
                                <select
                                    value={selectedCustomer.customerLanguage}
                                    onChange={(e) => {
                                        dispatch(
                                            setField({
                                                field: "customerLanguage",
                                                value: e.target.value,
                                            }),
                                        );
                                        dispatch(clearFieldError("customerLanguage"));
                                    }}
                                    className={`w-full rounded px-3 py-2 border ${errors.customerLanguage
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300"
                                        }`}
                                >
                                    {languages.map((lang) => (
                                        <option key={lang} value={lang}>
                                            {lang}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab content */}
                    {activeTab === "Other Details" && (
                        <div className="space-y-4 mt-6">
                            {/* PAN */}
                            <div className="grid grid-cols-[160px_1fr] items-center">
                                <Label>
                                    PAN <InfoIcon />
                                </Label>
                                <input
                                    type="text"
                                    value={selectedCustomer.pan}
                                    onChange={handleChange("pan")}
                                    className="max-w-md w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                                />
                            </div>

                            {/* Payment Terms */}
                            <div className="grid grid-cols-[160px_1fr] items-center">
                                <Label>Payment Terms</Label>
                                <div className="relative max-w-md w-full">
                                    <select
                                        value={selectedCustomer.paymentTerms}
                                        onChange={handleChange("paymentTerms")}
                                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-700 appearance-none bg-white outline-none focus:border-blue-400"
                                    >
                                        <option value="Due on Receipt">Due on Receipt</option>
                                        <option value="Net 15">Net 15</option>
                                        <option value="Net 30">Net 30</option>
                                        <option value="Net 45">Net 45</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                                        checked={selectedCustomer.enablePortal}
                                        onChange={() => dispatch(toggleEnablePortal())}
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
                                        value={selectedCustomer.websiteUrl}
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
                                    value={selectedCustomer.department}
                                    onChange={handleChange("department")}
                                    className="max-w-md w-full border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                                />
                            </div>

                            {/* Designation */}
                            <div className="grid grid-cols-[160px_1fr] items-center">
                                <Label>Designation</Label>
                                <input
                                    type="text"
                                    value={selectedCustomer.designation}
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
                                            value={selectedCustomer.twitter}
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
                                        value={selectedCustomer.skype}
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
                                            value={selectedCustomer.facebook}
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
                                    address={selectedCustomer?.billingAddress}
                                    addressType="billingAddress"
                                    dispatch={dispatch}
                                    showCopyLink={false}
                                />
                                <AddressColumn
                                    title="Shipping Address"
                                    address={selectedCustomer?.shippingAddress}
                                    addressType="shippingAddress"
                                    dispatch={dispatch}
                                    showCopyLink={true}
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
                    {/* Action buttons */}
                    <div className="flex-1 flex flex-col overflow-hidden relative h-full  gap-3 mt-8 pb-10">
                        <CustomerBottomActionBar
                            onSave={() => handleUpdate("ACTIVE")}
                            onSubmit={() => handleUpdate("DRAFT")}
                            onCancel={handleCancel}

                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
