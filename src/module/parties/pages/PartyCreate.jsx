import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { X, Loader2, Check, Users, Building2, MapPin, Landmark } from "lucide-react";

import { closeModal } from "../../ui/uiSlice";
import CustomSelect from "../../../common/custom/CustomSelect";

import {
    resetPartyForm,
    setParty,
    setPartyField,
    setPartyAddressField,
    addPartyAddress,
    removePartyAddress,
    setPartyBankAccountField,
    addPartyBankAccount,
    removePartyBankAccount,
} from "../slices/partySlice";

import {
    createParty,
    updateParty,
} from "../thunks/partyThunks";

import { getUserPermission } from "../../menuPermission/thunks/menuPermissionThunks";

const EMPTY_ADDRESS = {
    addressType: "BILLING",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    state: "",
    country: "India",
    postalCode: "",
    defaultAddress: true,
};

const EMPTY_BANK_ACCOUNT = {
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    accountType: "CURRENT",
    remarks: "",
    primaryAccount: true,
    status: "ACTIVE",
};

const EMPTY_PARTY = {
    id: null,
    partyCode: "",
    partyType: "SUPPLIER",
    companyName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    alternateMobile: "",
    gstNumber: "",
    panNumber: "",
    website: "",
    creditLimit: 0,
    paymentTerms: "30 Days",
    status: "ACTIVE",
    addresses: [{ ...EMPTY_ADDRESS }],
    bankAccounts: [{ ...EMPTY_BANK_ACCOUNT }],
};

const normalizeModule = (value) =>
    String(value ?? "").trim().toLowerCase();

const normalizeAction = (value) =>
    String(value ?? "").trim().toUpperCase();

export default function PartyCreate() {
    const dispatch = useDispatch();

    const { modal } = useSelector((state) => state.ui);
    const { party, loading } = useSelector((state) => state.party);

    const user = useSelector((state) => state.auth?.user);
    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated === true
    );
    const authChecking = useSelector(
        (state) => state.auth?.authChecking === true
    );

    const permissions = useSelector((state) =>
        Array.isArray(state.menuPermission?.userPermissions)
            ? state.menuPermission.userPermissions
            : []
    );
    const permissionLoading = useSelector(
        (state) => state.menuPermission?.userPermissionsLoading === true
    );
    const permissionsLoaded = useSelector(
        (state) => state.menuPermission?.userPermissionsLoaded === true
    );

    const isEdit = modal.type === "editParty";
    const isOpen =
        modal.open &&
        (modal.type === "addParty" || modal.type === "editParty");

    const [showSaveOptions, setShowSaveOptions] = useState(false);
    const [savedAction, setSavedAction] = useState("");
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState("party");

    const roleNameFromUser =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole = normalizeAction(roleNameFromUser);
    const hasFullAccess =
        normalizedRole === "SUPER_ADMIN" || normalizedRole === "ADMIN";

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
            if (normalizeAction(permission?.status) === "INACTIVE") return false;

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
                        action?.allowed === true || action?.allowed === "true";

                    return (
                        permissionAction === requestedAction &&
                        allowed &&
                        action?.active !== false &&
                        normalizeAction(action?.status) !== "INACTIVE"
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
                permission?.allowed === true || permission?.allowed === "true";

            return permissionAction === requestedAction && allowed;
        });
    };

    const requiredAction = isEdit ? "EDIT" : "CREATE";
    const hasRequiredPermission = hasPermission("Parties", requiredAction);

    useEffect(() => {
        if (!isOpen || authChecking || !isAuthenticated || hasFullAccess) return;

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

    useEffect(() => {
        if (!isOpen) return;

        if (isEdit && modal.data) {
            dispatch(
                setParty({
                    ...EMPTY_PARTY,
                    ...modal.data,
                    addresses:
                        modal.data.addresses?.length > 0
                            ? modal.data.addresses
                            : [{ ...EMPTY_ADDRESS }],
                    bankAccounts:
                        modal.data.bankAccounts?.length > 0
                            ? modal.data.bankAccounts
                            : [{ ...EMPTY_BANK_ACCOUNT }],
                })
            );
        } else {
            dispatch(resetPartyForm());
        }

        setErrors({});
        setActiveTab("party");
        setShowSaveOptions(false);
        setSavedAction("");
    }, [isOpen, isEdit, modal.data, dispatch]);

    const form = party || EMPTY_PARTY;

    const handleChange = (field, value) => {
        dispatch(setPartyField({ field, value }));
        setErrors((previous) => ({ ...previous, [field]: "" }));
    };

    const handleAddressChange = (index, field, value) => {
        dispatch(setPartyAddressField({ index, field, value }));
        setErrors((previous) => ({
            ...previous,
            [`address-${index}-${field}`]: "",
        }));
    };

    const handleBankChange = (index, field, value) => {
        dispatch(setPartyBankAccountField({ index, field, value }));
        setErrors((previous) => ({
            ...previous,
            [`bank-${index}-${field}`]: "",
        }));
    };

    const handleClose = () => {
        setShowSaveOptions(false);
        setSavedAction("");
        dispatch(closeModal());
        dispatch(resetPartyForm());
        setErrors({});
        setActiveTab("party");
    };

    useEffect(() => {
        if (!isOpen || showSaveOptions) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") handleClose();
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, showSaveOptions]);

    const validate = () => {
        const nextErrors = {};

        if (!form.companyName?.trim()) {
            nextErrors.companyName = "Company name is required";
        }

        if (!form.partyType) {
            nextErrors.partyType = "Party type is required";
        }

        if (form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            nextErrors.email = "Enter a valid email address";
        }

        if (!form.mobile?.trim()) {
            nextErrors.mobile = "Mobile number is required";
        }

        form.addresses?.forEach((address, index) => {
            if (!address.addressLine1?.trim()) {
                nextErrors[`address-${index}-addressLine1`] =
                    "Address line 1 is required";
            }
            if (!address.city?.trim()) {
                nextErrors[`address-${index}-city`] = "City is required";
            }
            if (!address.state?.trim()) {
                nextErrors[`address-${index}-state`] = "State is required";
            }
            if (!address.country?.trim()) {
                nextErrors[`address-${index}-country`] = "Country is required";
            }
        });

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            if (nextErrors.companyName || nextErrors.partyType ||
                nextErrors.email || nextErrors.mobile) {
                setActiveTab("party");
            } else if (Object.keys(nextErrors).some((key) => key.startsWith("address-"))) {
                setActiveTab("addresses");
            } else {
                setActiveTab("bank");
            }
            toast.error("Please correct the highlighted fields");
            return false;
        }

        return true;
    };

    const handleSave = async (event) => {
        event.preventDefault();
        if (loading) return;

        if (authChecking) return;

        if (!isAuthenticated) {
            toast.error("You are not authenticated");
            return;
        }

        if (!hasFullAccess && !permissionsLoaded) {
            toast.error("Permissions are still loading");
            return;
        }

        if (!hasRequiredPermission) {
            toast.error(`You do not have permission to ${requiredAction.toLowerCase()} parties`);
            return;
        }

        if (!validate()) return;

        const payload = {
            partyType: form.partyType,
            companyName: form.companyName.trim(),
            contactPerson: form.contactPerson?.trim() || "",
            email: form.email?.trim() || "",
            mobile: form.mobile?.trim() || "",
            alternateMobile: form.alternateMobile?.trim() || "",
            gstNumber: form.gstNumber?.trim() || "",
            panNumber: form.panNumber?.trim() || "",
            website: form.website?.trim() || "",
            creditLimit: Number(form.creditLimit || 0),
            paymentTerms: form.paymentTerms?.trim() || "",
            status: form.status || "ACTIVE",
            addresses: (form.addresses || []).map((address) => ({
                ...(address.id != null ? { id: address.id } : {}),
                addressType: address.addressType || "BILLING",
                addressLine1: address.addressLine1?.trim() || "",
                addressLine2: address.addressLine2?.trim() || "",
                city: address.city?.trim() || "",
                district: address.district?.trim() || "",
                state: address.state?.trim() || "",
                country: address.country?.trim() || "India",
                postalCode: address.postalCode?.trim() || "",
                defaultAddress: Boolean(address.defaultAddress),
            })),
            bankAccounts: (form.bankAccounts || []).map((account) => ({
                ...(account.id != null ? { id: account.id } : {}),
                bankName: account.bankName?.trim() || "",
                accountHolderName: account.accountHolderName?.trim() || "",
                accountNumber: account.accountNumber?.trim() || "",
                ifscCode: account.ifscCode?.trim() || "",
                branchName: account.branchName?.trim() || "",
                accountType: account.accountType || "CURRENT",
                remarks: account.remarks?.trim() || "",
                primaryAccount: Boolean(account.primaryAccount),
                status: account.status || "ACTIVE",
            })),
        };

        try {
            if (isEdit) {
                const partyId = form.id ?? modal.data?.id;
                if (!partyId) {
                    toast.error("Party ID is missing");
                    return;
                }

                await dispatch(updateParty({ id: partyId, data: payload })).unwrap();
                setSavedAction("updated");
            } else {
                await dispatch(createParty(payload)).unwrap();
                setSavedAction("created");
            }

            setShowSaveOptions(true);
        } catch (error) {
            console.error("Party save error:", error);
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    error?.response?.data?.message ||
                    (isEdit ? "Failed to update party" : "Failed to create party")
            );
        }
    };

    const finishSave = () => {
        toast.success(
            savedAction === "updated"
                ? "Party updated successfully"
                : "Party created successfully"
        );
        setShowSaveOptions(false);
        setSavedAction("");
        dispatch(closeModal());
        dispatch(resetPartyForm());
        setErrors({});
        setActiveTab("party");
    };

    const inputClass = `w-full h-10 px-3 border border-gray-300 rounded-md text-sm text-gray-700 bg-white outline-none transition focus:border-[#0F4659] focus:ring-1 focus:ring-[#0F4659]/70 disabled:bg-gray-100`;
    const labelClass = "block text-xs font-medium text-[#0F4659] mb-1.5";
    const fieldError = (key) =>
        errors[key] ? (
            <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
        ) : null;

    if (!isOpen && !showSaveOptions) return null;

    if (
        isOpen &&
        !showSaveOptions &&
        (authChecking ||
            (isAuthenticated &&
                !hasFullAccess &&
                (permissionLoading || !permissionsLoaded)))
    ) {
        return (
            <div className="w-[1000px] max-w-[95vw] min-h-[300px] bg-white rounded-xl shadow-2xl flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-10 h-10 mx-auto mb-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm font-medium text-gray-600">Loading permissions...</p>
                </div>
            </div>
        );
    }

    if (
        isOpen &&
        !showSaveOptions &&
        !hasFullAccess &&
        permissionsLoaded &&
        !hasRequiredPermission
    ) {
        return (
            <div className="w-[950px] max-w-[95vw] min-h-[300px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                <div className="h-[68px] flex items-center gap-3 px-6 border-b">
                    <Users size={22} className="text-[#0F4659]" />
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {isEdit ? "Edit Party" : "Add New Party"}
                        </h2>
                        <p className="text-xs text-gray-500">Manage party details</p>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <h3 className="text-base font-semibold text-gray-800">Access Denied</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        You do not have permission to {requiredAction.toLowerCase()} parties.
                    </p>
                    <button onClick={handleClose} className="mt-6 h-10 px-5 rounded-md bg-blue-500 text-white text-sm">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: "party", label: "Party Information", icon: Building2 },
        { id: "addresses", label: "Addresses", icon: MapPin },
        { id: "bank", label: "Bank Accounts", icon: Landmark },
        { id: "settings", label: "Settings", icon: Users },
    ];

    return (
        <>
            {isOpen && (
                <div className="w-[1000px] max-w-[96vw] h-[780px] max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="shrink-0 h-[68px] flex items-center justify-between px-6 border-b border-gray-200 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#0F4659]/10 text-[#0F4659] flex items-center justify-center">
                                <Users size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-[#0F4659]">
                                    {isEdit ? "Edit Party" : "Add New Party"}
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {isEdit
                                        ? `Update ${form.companyName || "party"} details`
                                        : "Create a supplier, customer, or other party"}
                                </p>
                            </div>
                        </div>
                        <button type="button" onClick={handleClose} disabled={loading} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50" aria-label="Close party form">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="shrink-0 min-h-[52px] flex items-center gap-5 px-5 border-b border-gray-200 bg-white overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;
                            const hasTabError =
                                (tab.id === "party" &&
                                    Object.keys(errors).some((key) =>
                                        ["companyName", "partyType", "email", "mobile"].includes(key)
                                    )) ||
                                (tab.id === "addresses" &&
                                    Object.keys(errors).some((key) => key.startsWith("address-"))) ||
                                (tab.id === "bank" &&
                                    Object.keys(errors).some((key) => key.startsWith("bank-")));

                            return (
                                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`relative shrink-0 h-[52px] px-1 flex items-center gap-2 text-sm font-medium ${active ? "text-[#0F4659]" : "text-gray-500 hover:text-[#0F4659]"}`}>
                                    <Icon size={16} />
                                    {tab.label}
                                    {hasTabError && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                                    {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F4659]" />}
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div className="flex-1 min-h-0 overflow-y-auto px-7 py-6 bg-gray-50/60">
                            {activeTab === "party" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                        <div>
                                            <h3 className="text-sm font-semibold text-[#0F4659]">Party Information</h3>
                                            <p className="text-xs text-gray-500 mt-1">Enter company and contact details.</p>
                                        </div>
                                        <span className={`inline-flex items-center px-3 h-7 rounded-full text-xs font-semibold ${form.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                            {form.status || "ACTIVE"}
                                        </span>
                                    </div>

                                    {isEdit && form.partyCode && (
                                        <div>
                                            <label className={labelClass}>Party Code</label>
                                            <input value={form.partyCode} readOnly className={`${inputClass} bg-gray-100`} />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelClass}>Party Type <span className="text-red-500">*</span></label>
                                            <CustomSelect
                                                value={form.partyType || "SUPPLIER"}
                                                onChange={(value) => handleChange("partyType", value)}
                                                options={[
                                                    { value: "SUPPLIER", label: "Supplier" },
                                                    { value: "CUSTOMER", label: "Customer" },
                                                    { value: "BOTH", label: "Supplier & Customer" },
                                                ]}
                                            />
                                            {fieldError("partyType")}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Company Name <span className="text-red-500">*</span></label>
                                            <input value={form.companyName || ""} onChange={(e) => handleChange("companyName", e.target.value)} placeholder="Enter company name" className={`${inputClass} ${errors.companyName ? "border-red-500" : ""}`} disabled={loading} />
                                            {fieldError("companyName")}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Contact Person</label>
                                            <input value={form.contactPerson || ""} onChange={(e) => handleChange("contactPerson", e.target.value)} placeholder="Enter contact person" className={inputClass} disabled={loading} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Email</label>
                                            <input type="email" value={form.email || ""} onChange={(e) => handleChange("email", e.target.value)} placeholder="name@company.com" className={`${inputClass} ${errors.email ? "border-red-500" : ""}`} disabled={loading} />
                                            {fieldError("email")}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Mobile <span className="text-red-500">*</span></label>
                                            <input value={form.mobile || ""} onChange={(e) => handleChange("mobile", e.target.value)} placeholder="Enter mobile number" className={`${inputClass} ${errors.mobile ? "border-red-500" : ""}`} disabled={loading} />
                                            {fieldError("mobile")}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Alternate Mobile</label>
                                            <input value={form.alternateMobile || ""} onChange={(e) => handleChange("alternateMobile", e.target.value)} placeholder="Enter alternate mobile" className={inputClass} disabled={loading} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>GST Number</label>
                                            <input value={form.gstNumber || ""} onChange={(e) => handleChange("gstNumber", e.target.value.toUpperCase())} placeholder="Enter GST number" className={inputClass} disabled={loading} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>PAN Number</label>
                                            <input value={form.panNumber || ""} onChange={(e) => handleChange("panNumber", e.target.value.toUpperCase())} placeholder="Enter PAN number" className={inputClass} disabled={loading} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Website</label>
                                            <input value={form.website || ""} onChange={(e) => handleChange("website", e.target.value)} placeholder="https://example.com" className={inputClass} disabled={loading} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Credit Limit</label>
                                            <input type="number" min="0" step="0.01" value={form.creditLimit ?? 0} onChange={(e) => handleChange("creditLimit", e.target.value)} placeholder="0.00" className={inputClass} disabled={loading} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Payment Terms</label>
                                            <input value={form.paymentTerms || ""} onChange={(e) => handleChange("paymentTerms", e.target.value)} placeholder="e.g. 30 Days" className={inputClass} disabled={loading} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "addresses" && (
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                        <div>
                                            <h3 className="text-sm font-semibold text-[#0F4659]">Party Addresses</h3>
                                            <p className="text-xs text-gray-500 mt-1">Add billing and shipping addresses.</p>
                                        </div>
                                        <button type="button" onClick={() => dispatch(addPartyAddress())} className="h-9 px-3 rounded-md bg-[#0F4659] text-white text-xs font-medium hover:bg-[#0F4659]/90">+ Add Address</button>
                                    </div>

                                    {(form.addresses || []).map((address, index) => (
                                        <section key={address.id ?? `address-${index}`} className="p-5 bg-white border border-gray-200 rounded-lg space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-semibold text-gray-800">Address {index + 1}</h4>
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-2 text-xs text-gray-600">
                                                        <input type="checkbox" checked={Boolean(address.defaultAddress)} onChange={(e) => handleAddressChange(index, "defaultAddress", e.target.checked)} />
                                                        Default address
                                                    </label>
                                                    {(form.addresses || []).length > 1 && (
                                                        <button type="button" onClick={() => dispatch(removePartyAddress(index))} className="text-xs text-red-600 hover:text-red-700">Remove</button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelClass}>Address Type</label>
                                                    <CustomSelect value={address.addressType || "BILLING"} onChange={(value) => handleAddressChange(index, "addressType", value)} options={[{ value: "BILLING", label: "Billing" }, { value: "SHIPPING", label: "Shipping" }, { value: "BOTH", label: "Billing & Shipping" }]} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Address Line 1 <span className="text-red-500">*</span></label>
                                                    <input value={address.addressLine1 || ""} onChange={(e) => handleAddressChange(index, "addressLine1", e.target.value)} className={`${inputClass} ${errors[`address-${index}-addressLine1`] ? "border-red-500" : ""}`} placeholder="Street address" />
                                                    {fieldError(`address-${index}-addressLine1`)}
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Address Line 2</label>
                                                    <input value={address.addressLine2 || ""} onChange={(e) => handleAddressChange(index, "addressLine2", e.target.value)} className={inputClass} placeholder="Landmark / area" />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>City <span className="text-red-500">*</span></label>
                                                    <input value={address.city || ""} onChange={(e) => handleAddressChange(index, "city", e.target.value)} className={`${inputClass} ${errors[`address-${index}-city`] ? "border-red-500" : ""}`} />
                                                    {fieldError(`address-${index}-city`)}
                                                </div>
                                                <div>
                                                    <label className={labelClass}>District</label>
                                                    <input value={address.district || ""} onChange={(e) => handleAddressChange(index, "district", e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>State <span className="text-red-500">*</span></label>
                                                    <input value={address.state || ""} onChange={(e) => handleAddressChange(index, "state", e.target.value)} className={`${inputClass} ${errors[`address-${index}-state`] ? "border-red-500" : ""}`} />
                                                    {fieldError(`address-${index}-state`)}
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Country <span className="text-red-500">*</span></label>
                                                    <input value={address.country || ""} onChange={(e) => handleAddressChange(index, "country", e.target.value)} className={`${inputClass} ${errors[`address-${index}-country`] ? "border-red-500" : ""}`} />
                                                    {fieldError(`address-${index}-country`)}
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Postal Code</label>
                                                    <input value={address.postalCode || ""} onChange={(e) => handleAddressChange(index, "postalCode", e.target.value)} className={inputClass} />
                                                </div>
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            )}

                            {activeTab === "bank" && (
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                        <div>
                                            <h3 className="text-sm font-semibold text-[#0F4659]">Bank Accounts</h3>
                                            <p className="text-xs text-gray-500 mt-1">Manage bank details for this party.</p>
                                        </div>
                                        <button type="button" onClick={() => dispatch(addPartyBankAccount())} className="h-9 px-3 rounded-md bg-[#0F4659] text-white text-xs font-medium hover:bg-[#0F4659]/90">+ Add Bank Account</button>
                                    </div>

                                    {(form.bankAccounts || []).map((account, index) => (
                                        <section key={account.id ?? `bank-${index}`} className="p-5 bg-white border border-gray-200 rounded-lg space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-semibold text-gray-800">Bank Account {index + 1}</h4>
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-2 text-xs text-gray-600">
                                                        <input type="checkbox" checked={Boolean(account.primaryAccount)} onChange={(e) => handleBankChange(index, "primaryAccount", e.target.checked)} />
                                                        Primary account
                                                    </label>
                                                    {(form.bankAccounts || []).length > 1 && (
                                                        <button type="button" onClick={() => dispatch(removePartyBankAccount(index))} className="text-xs text-red-600 hover:text-red-700">Remove</button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelClass}>Bank Name</label>
                                                    <input value={account.bankName || ""} onChange={(e) => handleBankChange(index, "bankName", e.target.value)} className={inputClass} placeholder="Bank name" />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Account Holder Name</label>
                                                    <input value={account.accountHolderName || ""} onChange={(e) => handleBankChange(index, "accountHolderName", e.target.value)} className={inputClass} placeholder="Account holder" />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Account Number</label>
                                                    <input value={account.accountNumber || ""} onChange={(e) => handleBankChange(index, "accountNumber", e.target.value)} className={inputClass} placeholder="Account number" />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>IFSC Code</label>
                                                    <input value={account.ifscCode || ""} onChange={(e) => handleBankChange(index, "ifscCode", e.target.value.toUpperCase())} className={inputClass} placeholder="IFSC code" />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Branch Name</label>
                                                    <input value={account.branchName || ""} onChange={(e) => handleBankChange(index, "branchName", e.target.value)} className={inputClass} placeholder="Branch name" />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Account Type</label>
                                                    <CustomSelect value={account.accountType || "CURRENT"} onChange={(value) => handleBankChange(index, "accountType", value)} options={[{ value: "CURRENT", label: "Current" }, { value: "SAVINGS", label: "Savings" }, { value: "CASH_CREDIT", label: "Cash Credit" }, { value: "OVERDRAFT", label: "Overdraft" }, { value: "OTHER", label: "Other" }]} />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className={labelClass}>Remarks</label>
                                                    <textarea rows={2} value={account.remarks || ""} onChange={(e) => handleBankChange(index, "remarks", e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm outline-none focus:border-[#0F4659] focus:ring-1 focus:ring-[#0F4659]/70 resize-y" placeholder="Optional remarks" />
                                                </div>
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            )}

                            {activeTab === "settings" && (
                                <div className="space-y-5">
                                    <div className="pb-3 border-b border-gray-200">
                                        <h3 className="text-sm font-semibold text-[#0F4659]">Settings</h3>
                                        <p className="text-xs text-gray-500 mt-1">Configure the party status.</p>
                                    </div>
                                    <div className="max-w-md">
                                        <label className={labelClass}>Status</label>
                                        <CustomSelect value={form.status || "ACTIVE"} onChange={(value) => handleChange("status", value)} options={[{ value: "ACTIVE", label: "Active" }, { value: "INACTIVE", label: "Inactive" }]} />
                                    </div>
                                    <div className="max-w-md p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-[#0F4659]">Party Status</p>
                                            <p className="text-xs text-gray-500 mt-1">Current status of this party.</p>
                                        </div>
                                        <span className={`inline-flex items-center px-3 h-7 rounded-full text-xs font-semibold ${form.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{form.status || "ACTIVE"}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="shrink-0 h-[68px] flex items-center justify-between px-6 border-t border-gray-200 bg-white">
                            <div className="text-xs text-gray-400">
                                {isEdit && form.partyCode ? `Party Code: ${form.partyCode}` : "Fields marked * are required"}
                            </div>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={handleClose} disabled={loading} className="h-10 px-5 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                                <button type="submit" disabled={loading} className="h-10 px-6 rounded-md bg-[#0F4659] text-white text-sm font-medium hover:bg-[#0F4659]/90 disabled:opacity-50 inline-flex items-center gap-2">
                                    {loading && <Loader2 size={16} className="animate-spin" />}
                                    {loading ? (isEdit ? "Updating..." : "Saving...") : (isEdit ? "Update Party" : "Save Party")}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {showSaveOptions && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4">
                    <div role="dialog" aria-modal="true" aria-labelledby="party-save-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                            <Check className="text-emerald-600" size={26} />
                        </div>
                        <h2 id="party-save-title" className="text-xl font-semibold text-gray-900">
                            Party {savedAction === "updated" ? "Updated" : "Created"} Successfully
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            {form.companyName ? `${form.companyName} has been saved.` : "The party has been saved."}
                        </p>
                        <div className="mt-6 flex justify-end">
                            <button type="button" onClick={finishSave} className="rounded-lg bg-[#0F4659] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0F4659]/90">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
