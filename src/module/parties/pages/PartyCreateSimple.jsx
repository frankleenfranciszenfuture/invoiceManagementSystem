// PartyCreateSimple.jsx
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
    ChevronDown,
    UserRoundArrowLeft,
    X,
    Plus,
    Trash2,
    MapPin,
    Landmark,
    Settings,
    UserRound,
    Check,
} from "lucide-react";

import toast from "react-hot-toast";

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
    fetchPartyById,
} from "../thunks/partyThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import CustomSelect from "../../../common/custom/CustomSelect";


/* =========================================================
   CONSTANTS
========================================================= */

const PARTY_TYPES = [
    { value: "SUPPLIER", label: "Supplier" },
    { value: "CUSTOMER", label: "Customer" },
    { value: "BOTH", label: "Supplier & Customer" },
];

const PARTY_STATUSES = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "DRAFT", label: "Draft" },
];

const ADDRESS_TYPES = [
    { value: "BILLING", label: "Billing Address" },
    { value: "SHIPPING", label: "Shipping Address" },
    { value: "OFFICE", label: "Office Address" },
    { value: "OTHER", label: "Other Address" },
];

const BANK_ACCOUNT_TYPES = [
    { value: "CURRENT", label: "Current Account" },
    { value: "SAVINGS", label: "Savings Account" },
];

const BANK_ACCOUNT_STATUSES = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
];

const PAYMENT_TERMS = [
    { value: "Due on Receipt", label: "Due on Receipt" },
    { value: "7 Days", label: "7 Days" },
    { value: "15 Days", label: "15 Days" },
    { value: "30 Days", label: "30 Days" },
    { value: "45 Days", label: "45 Days" },
    { value: "60 Days", label: "60 Days" },
];

const TABS = [
    {
        id: "details",
        label: "Party Details",
        icon: UserRound,
    },
    {
        id: "addresses",
        label: "Addresses",
        icon: MapPin,
    },
    {
        id: "bankAccounts",
        label: "Bank Accounts",
        icon: Landmark,
    },
    {
        id: "settings",
        label: "Settings",
        icon: Settings,
    },
];


/* =========================================================
   HELPERS
========================================================= */

const getResponseData = (response) => {
    let result = response;

    if (result?.data !== undefined) {
        result = result.data;
    }

    if (result?.data !== undefined) {
        result = result.data;
    }

    return result?.party ?? result;
};

const normalizePermissionAction = (value) =>
    String(value ?? "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");

const normalizeModuleName = (value) =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");

const getFieldError = (value) =>
    String(value ?? "").trim();

const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-500 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

const labelClass =
    "mb-1.5 block text-sm font-medium text-gray-500";


const getLabelClass = (required = false) => `
        block
        text-xs
        font-medium
        ${required ? "text-red-500" : "text-[#0F4659]"}
        mb-1.5
    `;

const sectionClass =
    "rounded-xl border border-gray-200 bg-white p-5 ";

const buttonSecondaryClass =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";


/* =========================================================
   REUSABLE FORM COMPONENTS
========================================================= */

function FormField({
    label,
    required = false,
    children,
    hint,
    className = "",
}) {
    return (
        <div className={className}>
            <label className={`${getLabelClass(required)} ${labelClass}`}>
                {label}
                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            {children}

            {hint && (
                <p className="mt-1 text-xs text-gray-400">
                    {hint}
                </p>
            )}
        </div>
    );
}

function TextInput({
    label,
    required = false,
    value,
    onChange,
    placeholder,
    type = "text",
    disabled = false,
    hint,
    className = "",
    min,
    step,
    maxLength,
    autoComplete,
}) {
    return (
        <FormField
            label={label}
            required={required}
            hint={hint}
            className={className}
        >
            <input
                type={type}
                value={value ?? ""}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder={placeholder}
                disabled={disabled}
                min={min}
                step={step}
                maxLength={maxLength}
                autoComplete={autoComplete}
                className={`${inputClass} ${disabled ? "cursor-not-allowed bg-gray-50" : ""
                    }`}
            />
        </FormField>
    );
}

function TextAreaField({
    label,
    value,
    onChange,
    placeholder,
    rows = 3,
}) {
    return (
        <FormField label={label}>
            <textarea
                value={value ?? ""}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder={placeholder}
                rows={rows}
                className={`${inputClass} resize-y`}
            />
        </FormField>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
    placeholder = "Select",
    required = false,
}) {
    return (
        <FormField
            label={label}
            required={required}
        >
            <CustomSelect
                value={String(value ?? "")}
                onChange={onChange}
                options={options}
                placeholder={placeholder}
                width="w-full"
                size="md"
            />
        </FormField>
    );
}

function CheckboxField({
    checked,
    onChange,
    label,
    description,
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50">
            <input
                type="checkbox"
                checked={Boolean(checked)}
                onChange={(event) =>
                    onChange(event.target.checked)
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-500">
                    {label}
                </span>

                {description && (
                    <span className="mt-0.5 block text-xs text-gray-400">
                        {description}
                    </span>
                )}
            </span>
        </label>
    );
}

function SectionHeading({
    title,
    description,
    action,
}) {
    return (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
                <h3 className="text-xm font-semibold text-gray-500">
                    {title}
                </h3>

                {description && (
                    <p className="mt-1 text-sm text-gray-400">
                        {description}
                    </p>
                )}
            </div>

            {action}
        </div>
    );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PartyCreateSimple() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);

    const partyState = useSelector(
        (state) => state.party ?? {}
    );

    const authState = useSelector(
        (state) => state.auth ?? {}
    );

    const permissionState = useSelector(
        (state) => state.menuPermission ?? {}
    );

    const party = partyState.party ?? {};

    const addresses = Array.isArray(party.addresses)
        ? party.addresses
        : [];

    const bankAccounts = Array.isArray(party.bankAccounts)
        ? party.bankAccounts
        : [];

    const [activeTab, setActiveTab] = useState("details");
    const [saveMenuOpen, setSaveMenuOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editLoadError, setEditLoadError] = useState(false);
    const [permissionsLoading, setPermissionsLoading] = useState(false);

    const [validationErrors, setValidationErrors] = useState({});


    /* =========================================================
       AUTH AND PERMISSION STATE
    ========================================================= */

    const roleName = String(
        authState.user?.roleName ??
        authState.user?.role?.name ??
        authState.roleName ??
        authState.role ??
        ""
    )
        .trim()
        .toUpperCase();

    const isAdmin =
        roleName === "SUPER_ADMIN" ||
        roleName === "ADMIN";

    const isAuthenticated =
        authState.isAuthenticated !== false;

    const authChecking = Boolean(
        authState.authChecking ??
        authState.loading
    );

    const userPermissions =
        permissionState.userPermissions ??
        permissionState.permissions ??
        permissionState.currentUserPermission ??
        [];

    const permissionsLoaded = Boolean(
        permissionState.userPermissionsLoaded ??
        permissionState.permissionsLoaded ??
        permissionState.loaded ??
        (userPermissions && (
            Array.isArray(userPermissions)
                ? userPermissions.length > 0
                : Object.keys(userPermissions).length > 0
        ))
    );

    const hasPermission = (
        moduleName,
        requestedAction
    ) => {
        if (isAdmin) return true;

        const requiredAction =
            normalizePermissionAction(requestedAction);

        const requiredModule =
            normalizeModuleName(moduleName);

        const permissionList = Array.isArray(userPermissions)
            ? userPermissions
            : Array.isArray(userPermissions?.data)
                ? userPermissions.data
                : Array.isArray(userPermissions?.permissions)
                    ? userPermissions.permissions
                    : [];

        return permissionList.some((permission) => {
            const currentModule = normalizeModuleName(
                permission.moduleName ??
                permission.module?.moduleName ??
                permission.module?.name ??
                permission.module
            );

            if (currentModule !== requiredModule) {
                return false;
            }

            const actions = permission.actions ??
                permission.moduleActions ??
                permission.permissions ??
                [];

            if (!Array.isArray(actions)) {
                return false;
            }

            return actions.some((action) => {
                const actionName = normalizePermissionAction(
                    typeof action === "string"
                        ? action
                        : action.actionName ??
                        action.action ??
                        action.name
                );

                const allowedValue =
                    typeof action === "object"
                        ? action.allowed ??
                        action.isAllowed ??
                        action.active
                        : true;

                const isEnabled =
                    allowedValue === true ||
                    String(allowedValue).toLowerCase() === "true" ||
                    allowedValue === 1 ||
                    String(allowedValue).toUpperCase() === "ACTIVE";

                const status = String(
                    typeof action === "object"
                        ? action.status ?? "ACTIVE"
                        : "ACTIVE"
                ).toUpperCase();

                return (
                    actionName === requiredAction &&
                    isEnabled &&
                    status !== "INACTIVE" &&
                    status !== "DISABLED"
                );
            });
        });
    };

    const canCreate = hasPermission(
        "Parties",
        "CREATE"
    );

    const canEdit = hasPermission(
        "Parties",
        "EDIT"
    );

    const canSave = isEdit
        ? canEdit
        : canCreate;


    /* =========================================================
       LOAD PERMISSIONS
    ========================================================= */

    useEffect(() => {
        if (
            authChecking ||
            !isAuthenticated ||
            isAdmin ||
            permissionsLoaded
        ) {
            return;
        }

        let cancelled = false;

        const loadPermissions = async () => {
            try {
                setPermissionsLoading(true);
                await dispatch(getUserPermission()).unwrap();
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        "Failed to load user permissions:",
                        error
                    );
                }
            } finally {
                if (!cancelled) {
                    setPermissionsLoading(false);
                }
            }
        };

        loadPermissions();

        return () => {
            cancelled = true;
        };
    }, [
        dispatch,
        authChecking,
        isAuthenticated,
        isAdmin,
        permissionsLoaded,
    ]);


    /* =========================================================
       LOAD PARTY FOR EDIT
    ========================================================= */

    useEffect(() => {
        let cancelled = false;

        const loadParty = async () => {
            dispatch(resetPartyForm());
            setValidationErrors({});
            setEditLoadError(false);

            if (!isEdit) {
                setEditLoading(false);
                return;
            }

            try {
                setEditLoading(true);

                const response = await dispatch(
                    fetchPartyById(id)
                ).unwrap();

                const existingParty =
                    getResponseData(response);

                if (
                    !existingParty ||
                    existingParty.id == null
                ) {
                    throw new Error(
                        "Party details were not returned by the server."
                    );
                }

                if (!cancelled) {
                    dispatch(setParty(existingParty));
                }
            } catch (error) {
                console.error(
                    "Failed to load party:",
                    error
                );

                if (!cancelled) {
                    setEditLoadError(true);

                    toast.error(
                        error?.message ||
                        "Failed to load party details."
                    );
                }
            } finally {
                if (!cancelled) {
                    setEditLoading(false);
                }
            }
        };

        loadParty();

        return () => {
            cancelled = true;
        };
    }, [
        dispatch,
        id,
        isEdit,
    ]);


    /* =========================================================
       CLOSE FORM / ESCAPE KEY
    ========================================================= */

    const handleClose = () => {
        if (submitting) return;

        dispatch(resetPartyForm());
        navigate("/parties");
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                if (
                    submitting ||
                    editLoading
                ) {
                    return;
                }

                dispatch(resetPartyForm());
                navigate("/parties");
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        dispatch,
        navigate,
        submitting,
        editLoading,
    ]);


    /* =========================================================
       FIELD UPDATES
    ========================================================= */

    const updateField = (field, value) => {
        dispatch(
            setPartyField({
                field,
                value,
            })
        );

        setValidationErrors((previous) => {
            if (!previous[field]) return previous;

            const next = { ...previous };
            delete next[field];

            return next;
        });
    };

    const updateAddress = (
        index,
        field,
        value
    ) => {
        dispatch(
            setPartyAddressField({
                index,
                field,
                value,
            })
        );
    };

    const updateBankAccount = (
        index,
        field,
        value
    ) => {
        dispatch(
            setPartyBankAccountField({
                index,
                field,
                value,
            })
        );
    };


    /* =========================================================
       PAYLOAD
    ========================================================= */

    const buildPayload = () => ({
        partyCode: getFieldError(party.partyCode),
        partyType: party.partyType || "SUPPLIER",

        companyName: getFieldError(party.companyName),
        contactPerson: getFieldError(party.contactPerson),
        email: getFieldError(party.email),
        mobile: getFieldError(party.mobile),
        alternateMobile: getFieldError(
            party.alternateMobile
        ),

        gstNumber: getFieldError(
            party.gstNumber
        ).toUpperCase(),

        panNumber: getFieldError(
            party.panNumber
        ).toUpperCase(),

        website: getFieldError(party.website),

        creditLimit: Number(
            party.creditLimit || 0
        ),

        paymentTerms: party.paymentTerms || "30 Days",
        status: party.status || "ACTIVE",

        addresses: addresses.map((address) => ({
            id: address.id ?? null,

            addressType:
                address.addressType || "BILLING",

            addressLine1: getFieldError(
                address.addressLine1
            ),

            addressLine2: getFieldError(
                address.addressLine2
            ),

            city: getFieldError(address.city),
            district: getFieldError(address.district),
            state: getFieldError(address.state),
            country: getFieldError(address.country) || "India",

            postalCode: getFieldError(
                address.postalCode
            ),

            defaultAddress: Boolean(
                address.defaultAddress
            ),
        })),

        bankAccounts: bankAccounts.map((account) => ({
            id: account.id ?? null,

            bankName: getFieldError(
                account.bankName
            ),

            accountHolderName: getFieldError(
                account.accountHolderName
            ),

            accountNumber: getFieldError(
                account.accountNumber
            ),

            ifscCode: getFieldError(
                account.ifscCode
            ).toUpperCase(),

            branchName: getFieldError(
                account.branchName
            ),

            accountType:
                account.accountType || "CURRENT",

            remarks: getFieldError(
                account.remarks
            ),

            primaryAccount: Boolean(
                account.primaryAccount
            ),

            status: account.status || "ACTIVE",
        })),
    });


    /* =========================================================
       VALIDATION
    ========================================================= */

    const validateForm = () => {
        const errors = {};

        if (!getFieldError(party.companyName)) {
            errors.companyName =
                "Company / party name is required.";
        }

        if (!party.partyType) {
            errors.partyType =
                "Please select a party type.";
        }

        const email = getFieldError(party.email);

        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            errors.email =
                "Enter a valid email address.";
        }

        const creditLimit = Number(
            party.creditLimit ?? 0
        );

        if (
            !Number.isFinite(creditLimit) ||
            creditLimit < 0
        ) {
            errors.creditLimit =
                "Credit limit cannot be negative.";
        }

        const gstNumber = getFieldError(
            party.gstNumber
        );

        if (
            gstNumber &&
            !/^[A-Z0-9]{15}$/i.test(gstNumber)
        ) {
            errors.gstNumber =
                "GST number must contain 15 letters or digits.";
        }

        const panNumber = getFieldError(
            party.panNumber
        );

        if (
            panNumber &&
            !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(panNumber)
        ) {
            errors.panNumber =
                "Enter a valid PAN number.";
        }

        addresses.forEach((address, index) => {
            const hasAnyAddressValue = [
                address.addressLine1,
                address.addressLine2,
                address.city,
                address.district,
                address.state,
                address.postalCode,
            ].some((value) => getFieldError(value));

            if (
                hasAnyAddressValue &&
                !getFieldError(address.addressLine1)
            ) {
                errors[`address-${index}`] =
                    "Address Line 1 is required when entering an address.";
            }
        });

        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            if (errors.companyName || errors.partyType) {
                setActiveTab("details");
            } else if (
                Object.keys(errors).some((key) =>
                    key.startsWith("address-")
                )
            ) {
                setActiveTab("addresses");
            } else {
                setActiveTab("details");
            }

            toast.error(
                Object.values(errors)[0]
            );

            return false;
        }

        return true;
    };


    /* =========================================================
       SAVE
    ========================================================= */

    const handleSave = async (
        saveMode = "close"
    ) => {
        if (!isAuthenticated) {
            toast.error(
                "Please log in to continue."
            );
            return;
        }

        if (submitting || editLoading) {
            return;
        }

        if (editLoadError && isEdit) {
            toast.error(
                "Party details could not be loaded. Please reopen the party."
            );
            return;
        }

        if (!canSave) {
            toast.error(
                `You do not have permission to ${isEdit ? "edit" : "create"} parties.`
            );
            return;
        }

        if (!validateForm()) {
            return;
        }

        const payload = buildPayload();

        try {
            setSubmitting(true);
            setSaveMenuOpen(false);

            if (isEdit) {
                await dispatch(
                    updateParty({
                        id: Number(id),
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    "Party updated successfully."
                );
            } else {
                await dispatch(
                    createParty(payload)
                ).unwrap();

                toast.success(
                    "Party created successfully."
                );
            }

            if (
                saveMode === "new" &&
                !isEdit
            ) {
                dispatch(resetPartyForm());
                setValidationErrors({});
                setActiveTab("details");
                return;
            }

            dispatch(resetPartyForm());
            navigate("/parties");
        } catch (error) {
            console.error(
                "Failed to save party:",
                error
            );

            const message =
                typeof error === "string"
                    ? error
                    : error?.message ??
                    error?.data?.message ??
                    "Failed to save party.";

            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };


    /* =========================================================
       TAB CONTENT
    ========================================================= */

    const renderPartyDetails = () => (
        <div className="space-y-5">
            <section className={sectionClass}>
                <SectionHeading
                    title="Basic Information"
                    description="Enter the party's business and contact details."
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 ">
                    <TextInput
                        label="Party Code"
                        value={party.partyCode}
                        labelClassName="!text-gray-400"
                        onChange={(value) =>
                            updateField("partyCode", value)
                        }
                        placeholder="Auto-generated or enter code"
                        hint="Leave blank if the backend generates the code."
                    />

                    <SelectField
                        label="Party Type"
                        required
                        value={party.partyType || "SUPPLIER"}
                        onChange={(value) =>
                            updateField("partyType", value)
                        }
                        options={PARTY_TYPES}
                        placeholder="Select party type"
                    />

                    <TextInput
                        label="Company / Party Name"
                        required
                        value={party.companyName}
                        onChange={(value) =>
                            updateField("companyName", value)
                        }
                        placeholder="Enter company or party name"
                    />

                    <TextInput
                        label="Contact Person"
                        value={party.contactPerson}
                        onChange={(value) =>
                            updateField("contactPerson", value)
                        }
                        placeholder="Enter contact person"
                    />

                    <TextInput
                        label="Email Address"
                        type="email"
                        value={party.email}
                        onChange={(value) =>
                            updateField("email", value)
                        }
                        placeholder="example@company.com"
                        autoComplete="email"
                    />

                    <TextInput
                        label="Mobile Number"
                        value={party.mobile}
                        onChange={(value) =>
                            updateField("mobile", value)
                        }
                        placeholder="Enter mobile number"
                        autoComplete="tel"
                    />

                    <TextInput
                        label="Alternate Mobile"
                        value={party.alternateMobile}
                        onChange={(value) =>
                            updateField("alternateMobile", value)
                        }
                        placeholder="Enter alternate mobile"
                    />

                    <TextInput
                        label="Website"
                        value={party.website}
                        onChange={(value) =>
                            updateField("website", value)
                        }
                        placeholder="https://example.com"
                    />

                    <TextInput
                        label="Credit Limit"
                        type="number"
                        min="0"
                        step="0.01"
                        value={party.creditLimit ?? 0}
                        onChange={(value) =>
                            updateField(
                                "creditLimit",
                                value === "" ? "" : Number(value)
                            )
                        }
                        placeholder="0.00"
                    />
                </div>

                {validationErrors.companyName && (
                    <p className="mt-2 text-xs text-red-500">
                        {validationErrors.companyName}
                    </p>
                )}

                {validationErrors.partyType && (
                    <p className="mt-2 text-xs text-red-500">
                        {validationErrors.partyType}
                    </p>
                )}

                {validationErrors.email && (
                    <p className="mt-2 text-xs text-red-500">
                        {validationErrors.email}
                    </p>
                )}

                {validationErrors.creditLimit && (
                    <p className="mt-2 text-xs text-red-500">
                        {validationErrors.creditLimit}
                    </p>
                )}
            </section>

            <section className={sectionClass}>
                <SectionHeading
                    title="Tax Information"
                    description="Add the party's GST and PAN details, if applicable."
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <TextInput
                            label="GST Number"
                            value={party.gstNumber}
                            onChange={(value) =>
                                updateField(
                                    "gstNumber",
                                    value.toUpperCase()
                                )
                            }
                            placeholder="15-character GST number"
                            maxLength={15}
                        />

                        {validationErrors.gstNumber && (
                            <p className="mt-1 text-xs text-red-500">
                                {validationErrors.gstNumber}
                            </p>
                        )}
                    </div>

                    <div>
                        <TextInput
                            label="PAN Number"
                            value={party.panNumber}
                            onChange={(value) =>
                                updateField(
                                    "panNumber",
                                    value.toUpperCase()
                                )
                            }
                            placeholder="ABCDE1234F"
                            maxLength={10}
                        />

                        {validationErrors.panNumber && (
                            <p className="mt-1 text-xs text-red-500">
                                {validationErrors.panNumber}
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );


    const renderAddresses = () => (
        <div className="space-y-5">
            <SectionHeading
                title="Party Addresses"
                description="Add billing, shipping, and other addresses for this party."
                action={
                    <button
                        type="button"
                        onClick={() => dispatch(addPartyAddress())}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        Add Address
                    </button>
                }
            />

            {addresses.map((address, index) => (
                <section
                    key={address.id ?? `address-${index}`}
                    className={sectionClass}
                >
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <MapPin size={19} />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-500">
                                    Address {index + 1}
                                </h3>

                                <p className="mt-0.5 text-xs text-gray-400">
                                    {address.addressType || "BILLING"}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                dispatch(removePartyAddress(index))
                            }
                            disabled={addresses.length <= 1}
                            title={
                                addresses.length <= 1
                                    ? "At least one address is required"
                                    : "Remove address"
                            }
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <Trash2 size={17} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <SelectField
                            label="Address Type"
                            value={address.addressType || "BILLING"}
                            onChange={(value) =>
                                updateAddress(
                                    index,
                                    "addressType",
                                    value
                                )
                            }
                            options={ADDRESS_TYPES}
                            placeholder="Select address type"
                        />

                        <TextInput
                            label="Address Line 1"
                            value={address.addressLine1}
                            onChange={(value) =>
                                updateAddress(
                                    index,
                                    "addressLine1",
                                    value
                                )
                            }
                            placeholder="Street, building, door number"
                        />

                        <TextInput
                            label="Address Line 2"
                            value={address.addressLine2}
                            onChange={(value) =>
                                updateAddress(
                                    index,
                                    "addressLine2",
                                    value
                                )
                            }
                            placeholder="Area, locality"
                        />

                        <TextInput
                            label="City"
                            value={address.city}
                            onChange={(value) =>
                                updateAddress(
                                    index,
                                    "city",
                                    value
                                )
                            }
                            placeholder="Enter city"
                        />

                        <TextInput
                            label="District"
                            value={address.district}
                            onChange={(value) =>
                                updateAddress(
                                    index,
                                    "district",
                                    value
                                )
                            }
                            placeholder="Enter district"
                        />

                        <TextInput
                            label="State"
                            value={address.state}
                            onChange={(value) =>
                                updateAddress(
                                    index,
                                    "state",
                                    value
                                )
                            }
                            placeholder="Enter state"
                        />

                        <TextInput
                            label="Country"
                            value={address.country}
                            onChange={(value) =>
                                updateAddress(
                                    index,
                                    "country",
                                    value
                                )
                            }
                            placeholder="Enter country"
                        />

                        <TextInput
                            label="Postal Code"
                            value={address.postalCode}
                            onChange={(value) =>
                                updateAddress(
                                    index,
                                    "postalCode",
                                    value
                                )
                            }
                            placeholder="Enter postal code"
                        />
                    </div>

                    <div className="mt-4">
                        <CheckboxField
                            checked={address.defaultAddress}
                            onChange={(checked) =>
                                updateAddress(
                                    index,
                                    "defaultAddress",
                                    checked
                                )
                            }
                            label="Default address"
                            description="Use this as the primary address for the party."
                        />
                    </div>

                    {validationErrors[`address-${index}`] && (
                        <p className="mt-2 text-xs text-red-500">
                            {validationErrors[`address-${index}`]}
                        </p>
                    )}
                </section>
            ))}
        </div>
    );


    const renderBankAccounts = () => (
        <div className="space-y-5">
            <SectionHeading
                title="Bank Accounts"
                description="Manage the party's bank accounts and primary account."
                action={
                    <button
                        type="button"
                        onClick={() =>
                            dispatch(addPartyBankAccount())
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        Add Bank Account
                    </button>
                }
            />

            {bankAccounts.map((account, index) => (
                <section
                    key={account.id ?? `bank-account-${index}`}
                    className={sectionClass}
                >
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                <Landmark size={19} />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-500">
                                    Bank Account {index + 1}
                                </h3>

                                <p className="mt-0.5 text-xs text-gray-400">
                                    {account.bankName || "Bank details"}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                dispatch(
                                    removePartyBankAccount(index)
                                )
                            }
                            disabled={bankAccounts.length <= 1}
                            title={
                                bankAccounts.length <= 1
                                    ? "At least one bank account is required"
                                    : "Remove bank account"
                            }
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <Trash2 size={17} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <TextInput
                            label="Bank Name"
                            value={account.bankName}
                            onChange={(value) =>
                                updateBankAccount(
                                    index,
                                    "bankName",
                                    value
                                )
                            }
                            placeholder="Enter bank name"
                        />

                        <TextInput
                            label="Account Holder Name"
                            value={account.accountHolderName}
                            onChange={(value) =>
                                updateBankAccount(
                                    index,
                                    "accountHolderName",
                                    value
                                )
                            }
                            placeholder="Enter account holder name"
                        />

                        <TextInput
                            label="Account Number"
                            value={account.accountNumber}
                            onChange={(value) =>
                                updateBankAccount(
                                    index,
                                    "accountNumber",
                                    value
                                )
                            }
                            placeholder="Enter account number"
                        />

                        <TextInput
                            label="IFSC Code"
                            value={account.ifscCode}
                            onChange={(value) =>
                                updateBankAccount(
                                    index,
                                    "ifscCode",
                                    value.toUpperCase()
                                )
                            }
                            placeholder="e.g. SBIN0001234"
                            maxLength={11}
                        />

                        <TextInput
                            label="Branch Name"
                            value={account.branchName}
                            onChange={(value) =>
                                updateBankAccount(
                                    index,
                                    "branchName",
                                    value
                                )
                            }
                            placeholder="Enter branch name"
                        />

                        <SelectField
                            label="Account Type"
                            value={account.accountType || "CURRENT"}
                            onChange={(value) =>
                                updateBankAccount(
                                    index,
                                    "accountType",
                                    value
                                )
                            }
                            options={BANK_ACCOUNT_TYPES}
                            placeholder="Select account type"
                        />

                        <SelectField
                            label="Account Status"
                            value={account.status || "ACTIVE"}
                            onChange={(value) =>
                                updateBankAccount(
                                    index,
                                    "status",
                                    value
                                )
                            }
                            options={BANK_ACCOUNT_STATUSES}
                            placeholder="Select status"
                        />

                        <div className="md:col-span-2">
                            <TextAreaField
                                label="Remarks"
                                value={account.remarks}
                                onChange={(value) =>
                                    updateBankAccount(
                                        index,
                                        "remarks",
                                        value
                                    )
                                }
                                placeholder="Optional bank account notes"
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <CheckboxField
                            checked={account.primaryAccount}
                            onChange={(checked) =>
                                updateBankAccount(
                                    index,
                                    "primaryAccount",
                                    checked
                                )
                            }
                            label="Primary bank account"
                            description="Use this as the party's primary bank account."
                        />
                    </div>
                </section>
            ))}
        </div>
    );


    const renderSettings = () => (
        <div className="space-y-5">
            <section className={sectionClass}>
                <SectionHeading
                    title="Party Settings"
                    description="Configure payment terms and the party's status."
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <SelectField
                        label="Payment Terms"
                        value={party.paymentTerms || "30 Days"}
                        onChange={(value) =>
                            updateField("paymentTerms", value)
                        }
                        options={PAYMENT_TERMS}
                        placeholder="Select payment terms"
                    />

                    <SelectField
                        label="Party Status"
                        value={party.status || "ACTIVE"}
                        onChange={(value) =>
                            updateField("status", value)
                        }
                        options={PARTY_STATUSES}
                        placeholder="Select status"
                    />
                </div>
            </section>

            <section className={sectionClass}>
                <SectionHeading
                    title="Record Summary"
                    description="Review the details entered for this party."
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Addresses
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                            {addresses.length}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Bank Accounts
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                            {bankAccounts.length}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Party Type
                        </p>
                        <p className="mt-2 text-base font-semibold text-gray-900">
                            {PARTY_TYPES.find(
                                (option) =>
                                    option.value === party.partyType
                            )?.label ?? "Supplier"}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );


    /* =========================================================
       ACCESS / LOADING STATES
    ========================================================= */

    if (authChecking || permissionsLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    Loading permissions...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                <Building2
                    size={40}
                    className="mb-3 text-gray-300"
                />

                <h2 className="text-lg font-semibold text-gray-900">
                    Authentication required
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Please log in to manage parties.
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/parties")}
                    className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Back to Parties
                </button>
            </div>
        );
    }

    if (!canSave && permissionsLoaded) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                <Building2
                    size={40}
                    className="mb-3 text-gray-300"
                />

                <h2 className="text-lg font-semibold text-gray-900">
                    Access denied
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    You do not have permission to{" "}
                    {isEdit ? "edit" : "create"} parties.
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/parties")}
                    className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Back to Parties
                </button>
            </div>
        );
    }


    /* =========================================================
       MAIN UI
    ========================================================= */

    return (
        <div className="flex flex-col h-full min-h-0 bg-gray-50 px-3.5 py-3">
            <div className="flex  min-h-0 flex-col overflow-hidden bg-gray-50 mt-5 ">
                {/* HEADER */}
                <header className="shrink-0 border border-lime-500 rounded bg-white rounded">
                    <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-7">
                        <div className="flex min-w-0 items-center gap-3">


                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                                onClick={handleClose}
                            >
                                <Building2 size={22} />
                            </div>

                            <div className="min-w-0">
                                <h1 className="truncate text-lg font-semibold text-gray-500">
                                    {isEdit ? "Edit Party" : "Create Party"}
                                </h1>

                                <p className="mt-0.5 text-sm text-gray-400">
                                    {isEdit
                                        ? "Update party information and account details."
                                        : "Add a new supplier or customer to your records."}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            title="Close"
                            className="flex h-9 w-9 items-center justify-center rounded-lg
                             text-gray-100 transition bg-red-500 hover:bg-red-400 
                             hover:text-gray-100 disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </header>


                {/* TABS */}
                <div className="overflow-x-auto px-5 lg:px-7 mt-3 border-b border-gray-300 rounded">
                    <div className="flex min-w-max gap-6">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(tab.id)
                                    }
                                    className={`relative inline-flex items-center gap-2 border-b-2 px-1 pb-3 pt-1 text-sm font-medium transition ${active
                                        ? "border-lime-500 text-gray-500"
                                        : "border-transparent text-gray-400 hover:text-gray-500"
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>



                {/* CONTENT */}
                <main className="min-h-0 flex-1 overflow-y-auto px-5 py-5 lg:px-2">
                    {editLoading ? (
                        <div className="flex min-h-[280px] items-center justify-center">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                Loading party details...
                            </div>
                        </div>
                    ) : editLoadError ? (
                        <div className="mx-auto flex min-h-[280px] max-w-lg flex-col items-center justify-center text-center">
                            <Building2
                                size={40}
                                className="mb-3 text-gray-300"
                            />

                            <h2 className="text-base font-semibold text-gray-900">
                                Unable to load party
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                The party details could not be loaded. Return to the party list and try again.
                            </p>

                            <button
                                type="button"
                                onClick={handleClose}
                                className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Back to Parties
                            </button>
                        </div>
                    ) : (
                        <div className="mx-auto max-w-full">
                            {activeTab === "details" &&
                                renderPartyDetails()}

                            {activeTab === "addresses" &&
                                renderAddresses()}

                            {activeTab === "bankAccounts" &&
                                renderBankAccounts()}

                            {activeTab === "settings" &&
                                renderSettings()}
                        </div>
                    )}
                </main>


                {/* FOOTER */}
                <footer className="relative z-20 shrink-0 border-t border-gray-200 bg-white px-5 py-3.5 lg:px-7">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-gray-500">
                            Fields marked with{" "}
                            <span className="font-semibold text-red-500">*</span>{" "}
                            are required.
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={submitting}
                                className={buttonSecondaryClass}
                            >
                                Cancel
                            </button>

                            <div className="relative flex">
                                <button
                                    type="button"
                                    onClick={() => handleSave("close")}
                                    disabled={
                                        submitting ||
                                        editLoading ||
                                        editLoadError ||
                                        !canSave
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-l-lg bg-[#408DFB] px-4 py-2.5 text-sm font-medium text-white 
                                    transition hover:bg-[#408DFB] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            {isEdit ? "Update Party" : "Save Party"}
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSaveMenuOpen((previous) => !previous)
                                    }
                                    disabled={
                                        submitting ||
                                        editLoading ||
                                        editLoadError ||
                                        !canSave
                                    }
                                    title="More save options"
                                    className="inline-flex items-center justify-center rounded-r-lg border-l border-gray-100 bg-[#408DFB] 
                                    px-3 text-white transition hover:bg-[#408DFB] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <ChevronDown size={17} />
                                </button>

                                {saveMenuOpen && (
                                    <>
                                        <button
                                            type="button"
                                            aria-label="Close save menu"
                                            onClick={() => setSaveMenuOpen(false)}
                                            className="fixed inset-0 z-30 cursor-default"
                                        />

                                        <div className="absolute bottom-full right-0 z-40 mb-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
                                            {!isEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSave("new")}
                                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                                                >
                                                    <Plus
                                                        size={15}
                                                        className="text-gray-400"
                                                    />
                                                    Save & New
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleSave("close")}
                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                                            >
                                                <Check
                                                    size={15}
                                                    className="text-gray-400"
                                                />
                                                Save & Close
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
