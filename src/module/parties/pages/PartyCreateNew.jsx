
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Building2,
    UserRound,
    MapPin,
    Landmark,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    FileText,
    Plus,
    Trash2,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createParty,
    fetchPartyById,
    updateParty,
    fetchAllParties
} from "../thunks/partyThunks";

import {
    setPartyField,
    setPartyAddressField,
    addPartyAddress,
    removePartyAddress,
    setPartyBankAccountField,
    addPartyBankAccount,
    removePartyBankAccount,
    resetPartyForm,
    clearError,
} from "../slices/partySlice";


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
   FORM FIELD
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
   MAIN COMPONENT
========================================================= */

const PartyCreateNew = ({ onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const isEditMode = Boolean(id);

    const modalData = useSelector(
        (state) => state.ui.modal?.data
    );

    /* =====================================================
       PARTY REDUX STATE
    ===================================================== */

    const partyState = useSelector(
        (state) => state.party ?? {}
    );

    const {
        party = {},
        loading = false,
    } = partyState;

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
        "Parties",
        isEditMode ? "EDIT" : "CREATE"
    );

    const handleClose = () => {
        confirmLeave(() => {
            if (onClose) {
                onClose();
            } else {
                dispatch(closeModal());
            }
        });
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
   FETCH PARTY DETAILS FOR EDIT
===================================================== */

    useEffect(() => {
        if (id) {
            dispatch(fetchPartyById(id));
        } else {
            dispatch(resetPartyForm());
            dispatch(clearError());
        }
    }, [dispatch, id]);

    /* =====================================================
       DROPDOWN OPTIONS
    ===================================================== */

    const partyTypeOptions = useMemo(() => [
        { label: "Supplier", value: "SUPPLIER" },
        { label: "Customer", value: "CUSTOMER" },
        { label: "Both", value: "BOTH" },
    ], []);

    const statusOptions = useMemo(() => [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
    ], []);

    const paymentTermsOptions = useMemo(() => [
        { label: "Due on Receipt", value: "Due on Receipt" },
        { label: "7 Days", value: "7 Days" },
        { label: "15 Days", value: "15 Days" },
        { label: "30 Days", value: "30 Days" },
        { label: "45 Days", value: "45 Days" },
        { label: "60 Days", value: "60 Days" },
        { label: "90 Days", value: "90 Days" },
    ], []);

    const addressTypeOptions = useMemo(() => [
        { label: "Billing", value: "BILLING" },
        { label: "Shipping", value: "SHIPPING" },
        { label: "Both", value: "BOTH" },
    ], []);

    const accountTypeOptions = useMemo(() => [
        { label: "Current", value: "CURRENT" },
        { label: "Savings", value: "SAVINGS" },
    ], []);

    /* =====================================================
       HANDLE PARTY FIELD CHANGE
    ===================================================== */

    const handleChange = (field, value) => {
        dispatch(
            setPartyField({
                field,
                value,
            })
        );
    };

    /* =====================================================
       HANDLE ADDRESS CHANGE
    ===================================================== */

    const handleAddressChange = (index, field, value) => {
        dispatch(
            setPartyAddressField({
                index,
                field,
                value,
            })
        );
    };

    /* =====================================================
       HANDLE BANK ACCOUNT CHANGE
    ===================================================== */

    const handleBankAccountChange = (index, field, value) => {
        dispatch(
            setPartyBankAccountField({
                index,
                field,
                value,
            })
        );
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {
        dispatch(resetPartyForm());
        dispatch(clearError());

        setSaveMode("close");
        setShowSaveOptions(false);
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        if (!party.partyType) {
            toast.error("Party type is required");
            return false;
        }

        if (!party.companyName?.trim()) {
            toast.error("Company name is required");
            return false;
        }

        if (party.mobile && !/^[0-9]{10}$/.test(party.mobile)) {
            toast.error("Enter a valid 10-digit mobile number");
            return false;
        }

        if (
            party.alternateMobile &&
            !/^[0-9]{10}$/.test(party.alternateMobile)
        ) {
            toast.error("Enter a valid alternate mobile number");
            return false;
        }

        if (
            party.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(party.email)
        ) {
            toast.error("Enter a valid email address");
            return false;
        }

        if (
            party.creditLimit !== "" &&
            (!Number.isFinite(Number(party.creditLimit)) ||
                Number(party.creditLimit) < 0)
        ) {
            toast.error("Enter a valid credit limit");
            return false;
        }

        if (!Array.isArray(party.addresses) || party.addresses.length === 0) {
            toast.error("At least one address is required");
            return false;
        }

        for (let i = 0; i < party.addresses.length; i++) {
            const address = party.addresses[i];

            if (!address.addressLine1?.trim()) {
                toast.error(`Address ${i + 1}: Address line 1 is required`);
                return false;
            }

            if (!address.city?.trim()) {
                toast.error(`Address ${i + 1}: City is required`);
                return false;
            }

            if (!address.state?.trim()) {
                toast.error(`Address ${i + 1}: State is required`);
                return false;
            }

            if (!address.country?.trim()) {
                toast.error(`Address ${i + 1}: Country is required`);
                return false;
            }

            if (
                address.postalCode &&
                !/^[0-9]{6}$/.test(address.postalCode)
            ) {
                toast.error(`Address ${i + 1}: Enter a valid 6-digit postal code`);
                return false;
            }
        }

        for (let i = 0; i < (party.bankAccounts || []).length; i++) {
            const account = party.bankAccounts[i];

            const hasBankDetails =
                account.bankName?.trim() ||
                account.accountHolderName?.trim() ||
                account.accountNumber?.trim() ||
                account.ifscCode?.trim() ||
                account.branchName?.trim();

            if (!hasBankDetails) continue;

            if (!account.bankName?.trim()) {
                toast.error(`Bank account ${i + 1}: Bank name is required`);
                return false;
            }

            if (!account.accountHolderName?.trim()) {
                toast.error(`Bank account ${i + 1}: Account holder name is required`);
                return false;
            }

            if (!account.accountNumber?.trim()) {
                toast.error(`Bank account ${i + 1}: Account number is required`);
                return false;
            }

            if (!account.ifscCode?.trim()) {
                toast.error(`Bank account ${i + 1}: IFSC code is required`);
                return false;
            }

            if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(account.ifscCode)) {
                toast.error(`Bank account ${i + 1}: Invalid IFSC code`);
                return false;
            }
        }

        return true;
    };

    /* =====================================================
       CREATE PARTY
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
            toast.error(`You do not have permission to ${isEditMode ? "edit" : "create"} parties`);
            return;
        }

        if (!validateForm()) return;

        const payload = {
            partyType: party.partyType,
            companyName: party.companyName.trim(),

            contactPerson: party.contactPerson?.trim() || null,
            email: party.email?.trim() || null,
            mobile: party.mobile?.trim() || null,
            alternateMobile: party.alternateMobile?.trim() || null,

            gstNumber: party.gstNumber?.trim() || null,
            panNumber: party.panNumber?.trim() || null,
            website: party.website?.trim() || null,

            creditLimit: Number(party.creditLimit || 0),
            paymentTerms: party.paymentTerms,
            status: party.status,

            addresses: party.addresses.map((address) => ({
                addressType: address.addressType,
                addressLine1: address.addressLine1.trim(),
                addressLine2: address.addressLine2?.trim() || null,
                city: address.city.trim(),
                district: address.district?.trim() || null,
                state: address.state.trim(),
                country: address.country.trim(),
                postalCode: address.postalCode?.trim() || null,
                defaultAddress: address.defaultAddress === true,
            })),

            bankAccounts: (party.bankAccounts || [])
                .filter((account) =>
                    account.bankName?.trim() ||
                    account.accountHolderName?.trim() ||
                    account.accountNumber?.trim() ||
                    account.ifscCode?.trim()
                )
                .map((account) => ({
                    bankName: account.bankName.trim(),
                    accountHolderName: account.accountHolderName.trim(),
                    accountNumber: account.accountNumber.trim(),
                    ifscCode: account.ifscCode.trim().toUpperCase(),
                    branchName: account.branchName?.trim() || null,
                    accountType: account.accountType,
                    remarks: account.remarks?.trim() || null,
                    primaryAccount: account.primaryAccount === true,
                    status: account.status,
                })),
        };

        try {
            const response = isEditMode
                ? await dispatch(
                    updateParty({
                        id,
                        data: payload,
                    })
                ).unwrap()
                : await dispatch(
                    createParty(payload)
                ).unwrap();

            toast.success(
                response?.message ||
                (isEditMode
                    ? "Party updated successfully"
                    : "Party created successfully")
            );

            // Automatically select newly created party in Expense Vendor
            if (!isEditMode && modalData?.selectAfterCreate) {
                const createdParty =
                    response?.data?.data ??
                    response?.data ??
                    response;

                dispatch(
                    setCreatedExpenseReferenceSelection({
                        targetField: modalData.targetField,
                        entity: createdParty,
                    })
                );

                dispatch(fetchAllParties());
                dispatch(closeModal());

                return;
            }

            if (!isEditMode && saveMode === "new") {
                dispatch(resetPartyForm());
                setSaveMode("close");
                return;
            }

            dispatch(closeModal());
            dispatch(resetPartyForm());

        } catch (error) {
            console.error(
                isEditMode ? "Party update error:" : "Party creation error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    (isEditMode
                        ? "Failed to update party"
                        : "Failed to create party")
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
                        You do not have permission to create parties.
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
                        onClick={() => navigate(-1)}
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
                            {isEditMode ? "Edit Party" : "Create Party"}
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEditMode
                                ? "Update supplier, customer and business account details"
                                : "Add supplier, customer and business account details"}
                        </p>
                    </div>
                </div>

                <div className="
                    hidden items-center gap-2 rounded-lg
                    bg-blue-50 px-3 py-2 sm:flex
                ">
                    <Building2 size={16} className="text-[#408DFB]" />
                    <span className="text-xs font-medium text-[#408DFB]">
                        Party
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

                    {/* BASIC DETAILS */}

                    <section className="mb-7">
                        <SectionHeading
                            icon={UserRound}
                            title="Basic Information"
                            description="Enter the party type and business information"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField label="Party Type" required>
                                <CustomSelect
                                    value={party.partyType || "SUPPLIER"}
                                    onChange={(value) =>
                                        handleChange("partyType", value)
                                    }
                                    options={partyTypeOptions}
                                    placeholder="Select party type"
                                />
                            </FormField>

                            <FormField label="Company Name" required>
                                <TextInput
                                    value={party.companyName}
                                    onChange={(e) =>
                                        handleChange("companyName", e.target.value)
                                    }
                                    placeholder="Enter company name"
                                    maxLength={150}
                                />
                            </FormField>

                            <FormField label="Contact Person">
                                <TextInput
                                    value={party.contactPerson}
                                    onChange={(e) =>
                                        handleChange("contactPerson", e.target.value)
                                    }
                                    placeholder="Enter contact person"
                                    maxLength={100}
                                />
                            </FormField>

                            <FormField label="Email">
                                <TextInput
                                    type="email"
                                    value={party.email}
                                    onChange={(e) =>
                                        handleChange("email", e.target.value)
                                    }
                                    placeholder="Enter email address"
                                    maxLength={150}
                                />
                            </FormField>

                            <FormField label="Mobile">
                                <TextInput
                                    value={party.mobile}
                                    onChange={(e) =>
                                        handleChange(
                                            "mobile",
                                            e.target.value.replace(/\D/g, "").slice(0, 10)
                                        )
                                    }
                                    placeholder="Enter 10-digit mobile"
                                    maxLength={10}
                                />
                            </FormField>

                            <FormField label="Alternate Mobile">
                                <TextInput
                                    value={party.alternateMobile}
                                    onChange={(e) =>
                                        handleChange(
                                            "alternateMobile",
                                            e.target.value.replace(/\D/g, "").slice(0, 10)
                                        )
                                    }
                                    placeholder="Enter alternate mobile"
                                    maxLength={10}
                                />
                            </FormField>

                            <FormField label="GST Number">
                                <TextInput
                                    value={party.gstNumber}
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
                                    value={party.panNumber}
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

                            <FormField label="Website">
                                <TextInput
                                    value={party.website}
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

                    {/* CREDIT DETAILS */}

                    <section className="mb-7">
                        <SectionHeading
                            icon={FileText}
                            title="Credit & Payment Details"
                            description="Configure the credit limit and payment terms"
                        />

                        <div className="
                            grid grid-cols-1 gap-5
                            md:grid-cols-2 lg:grid-cols-3
                        ">

                            <FormField label="Credit Limit">
                                <TextInput
                                    type="number"
                                    value={party.creditLimit}
                                    onChange={(e) =>
                                        handleChange("creditLimit", e.target.value)
                                    }
                                    placeholder="Enter credit limit"
                                    min="0"
                                    step="0.01"
                                />
                            </FormField>

                            <FormField label="Payment Terms">
                                <CustomSelect
                                    value={party.paymentTerms || "30 Days"}
                                    onChange={(value) =>
                                        handleChange("paymentTerms", value)
                                    }
                                    options={paymentTermsOptions}
                                    placeholder="Select payment terms"
                                />
                            </FormField>

                            <FormField label="Status">
                                <CustomSelect
                                    value={party.status || "ACTIVE"}
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

                    {/* ADDRESSES */}

                    <section className="mb-7">

                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <SectionHeading
                                icon={MapPin}
                                title="Address Information"
                                description="Add billing and shipping addresses"
                            />

                            <button
                                type="button"
                                onClick={() => dispatch(addPartyAddress())}
                                className="
                                    flex items-center gap-2 rounded-lg
                                    border border-blue-200 px-3 py-2
                                    text-xs font-medium text-[#408DFB]
                                    transition hover:bg-blue-50
                                "
                            >
                                <Plus size={15} />
                                Add Address
                            </button>
                        </div>

                        {(party.addresses || []).map((address, index) => (
                            <div
                                key={address.id ?? `address-${index}`}
                                className="
                                    mb-4 rounded-xl border border-gray-200
                                    bg-gray-50/50 p-4
                                "
                            >

                                <div className="mb-4 flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        Address {index + 1}
                                    </h4>

                                    <div className="flex items-center gap-3">

                                        <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={address.defaultAddress === true}
                                                onChange={(e) =>
                                                    handleAddressChange(
                                                        index,
                                                        "defaultAddress",
                                                        e.target.checked
                                                    )
                                                }
                                                className="accent-[#408DFB]"
                                            />
                                            Default Address
                                        </label>

                                        {(party.addresses || []).length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    dispatch(removePartyAddress(index))
                                                }
                                                className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                                                title="Remove Address"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="
                                    grid grid-cols-1 gap-4
                                    md:grid-cols-2 lg:grid-cols-3
                                ">

                                    <FormField label="Address Type">
                                        <CustomSelect
                                            value={address.addressType || "BILLING"}
                                            onChange={(value) =>
                                                handleAddressChange(index, "addressType", value)
                                            }
                                            options={addressTypeOptions}
                                        />
                                    </FormField>

                                    <FormField label="Address Line 1" required>
                                        <TextInput
                                            value={address.addressLine1}
                                            onChange={(e) =>
                                                handleAddressChange(index, "addressLine1", e.target.value)
                                            }
                                            placeholder="Enter address line 1"
                                            maxLength={200}
                                        />
                                    </FormField>

                                    <FormField label="Address Line 2">
                                        <TextInput
                                            value={address.addressLine2}
                                            onChange={(e) =>
                                                handleAddressChange(index, "addressLine2", e.target.value)
                                            }
                                            placeholder="Enter address line 2"
                                            maxLength={200}
                                        />
                                    </FormField>

                                    <FormField label="City" required>
                                        <TextInput
                                            value={address.city}
                                            onChange={(e) =>
                                                handleAddressChange(index, "city", e.target.value)
                                            }
                                            placeholder="Enter city"
                                        />
                                    </FormField>

                                    <FormField label="District">
                                        <TextInput
                                            value={address.district}
                                            onChange={(e) =>
                                                handleAddressChange(index, "district", e.target.value)
                                            }
                                            placeholder="Enter district"
                                        />
                                    </FormField>

                                    <FormField label="State" required>
                                        <TextInput
                                            value={address.state}
                                            onChange={(e) =>
                                                handleAddressChange(index, "state", e.target.value)
                                            }
                                            placeholder="Enter state"
                                        />
                                    </FormField>

                                    <FormField label="Country" required>
                                        <TextInput
                                            value={address.country}
                                            onChange={(e) =>
                                                handleAddressChange(index, "country", e.target.value)
                                            }
                                            placeholder="Enter country"
                                        />
                                    </FormField>

                                    <FormField label="Postal Code">
                                        <TextInput
                                            value={address.postalCode}
                                            onChange={(e) =>
                                                handleAddressChange(
                                                    index,
                                                    "postalCode",
                                                    e.target.value.replace(/\D/g, "").slice(0, 6)
                                                )
                                            }
                                            placeholder="Enter postal code"
                                            maxLength={6}
                                        />
                                    </FormField>

                                </div>
                            </div>
                        ))}
                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* BANK ACCOUNTS */}

                    <section>

                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <SectionHeading
                                icon={Landmark}
                                title="Bank Account Information"
                                description="Add party bank account details for transactions"
                            />

                            <button
                                type="button"
                                onClick={() => dispatch(addPartyBankAccount())}
                                className="
                                    flex items-center gap-2 rounded-lg
                                    border border-blue-200 px-3 py-2
                                    text-xs font-medium text-[#408DFB]
                                    transition hover:bg-blue-50
                                "
                            >
                                <Plus size={15} />
                                Add Bank Account
                            </button>
                        </div>

                        {(party.bankAccounts || []).map((account, index) => (
                            <div
                                key={account.id ?? `bank-${index}`}
                                className="
                                    mb-4 rounded-xl border border-gray-200
                                    bg-gray-50/50 p-4
                                "
                            >

                                <div className="mb-4 flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        Bank Account {index + 1}
                                    </h4>

                                    <div className="flex items-center gap-3">

                                        <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={account.primaryAccount === true}
                                                onChange={(e) =>
                                                    handleBankAccountChange(
                                                        index,
                                                        "primaryAccount",
                                                        e.target.checked
                                                    )
                                                }
                                                className="accent-[#408DFB]"
                                            />
                                            Primary Account
                                        </label>

                                        {(party.bankAccounts || []).length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    dispatch(removePartyBankAccount(index))
                                                }
                                                className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                                                title="Remove Bank Account"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="
                                    grid grid-cols-1 gap-4
                                    md:grid-cols-2 lg:grid-cols-3
                                ">

                                    <FormField label="Bank Name">
                                        <TextInput
                                            value={account.bankName}
                                            onChange={(e) =>
                                                handleBankAccountChange(index, "bankName", e.target.value)
                                            }
                                            placeholder="Enter bank name"
                                        />
                                    </FormField>

                                    <FormField label="Account Holder Name">
                                        <TextInput
                                            value={account.accountHolderName}
                                            onChange={(e) =>
                                                handleBankAccountChange(index, "accountHolderName", e.target.value)
                                            }
                                            placeholder="Enter account holder name"
                                        />
                                    </FormField>

                                    <FormField label="Account Number">
                                        <TextInput
                                            value={account.accountNumber}
                                            onChange={(e) =>
                                                handleBankAccountChange(index, "accountNumber", e.target.value)
                                            }
                                            placeholder="Enter account number"
                                            maxLength={30}
                                        />
                                    </FormField>

                                    <FormField label="IFSC Code">
                                        <TextInput
                                            value={account.ifscCode}
                                            onChange={(e) =>
                                                handleBankAccountChange(
                                                    index,
                                                    "ifscCode",
                                                    e.target.value.toUpperCase()
                                                )
                                            }
                                            placeholder="Enter IFSC code"
                                            maxLength={11}
                                        />
                                    </FormField>

                                    <FormField label="Branch Name">
                                        <TextInput
                                            value={account.branchName}
                                            onChange={(e) =>
                                                handleBankAccountChange(index, "branchName", e.target.value)
                                            }
                                            placeholder="Enter branch name"
                                        />
                                    </FormField>

                                    <FormField label="Account Type">
                                        <CustomSelect
                                            value={account.accountType || "CURRENT"}
                                            onChange={(value) =>
                                                handleBankAccountChange(index, "accountType", value)
                                            }
                                            options={accountTypeOptions}
                                        />
                                    </FormField>

                                    <FormField label="Status">
                                        <CustomSelect
                                            value={account.status || "ACTIVE"}
                                            onChange={(value) =>
                                                handleBankAccountChange(index, "status", value)
                                            }
                                            options={statusOptions}
                                        />
                                    </FormField>

                                    <FormField label="Remarks">
                                        <TextInput
                                            value={account.remarks}
                                            onChange={(e) =>
                                                handleBankAccountChange(index, "remarks", e.target.value)
                                            }
                                            placeholder="Enter remarks"
                                        />
                                    </FormField>

                                </div>
                            </div>
                        ))}
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

export default PartyCreateNew;
