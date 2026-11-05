
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Users,
    CalendarDays,
    FileText,
    Hash,
    UserRound,
    Mail,
    Phone,
    Globe,
    MapPin,
    MapPinned,
    Building2,
    CreditCard,
    Wallet,
    ShieldCheck,
    Briefcase,
    Contact,
    Truck,
} from "lucide-react";

import { getCustomerById } from "../thunks/customerThunks";

// ============================================================
// HELPERS
// ============================================================

const formatDateTime = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatLabel = (value) => {
    if (!value) return "—";

    return String(value)
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatBoolean = (value) => {
    if (value === true) return "Yes";
    if (value === false) return "No";
    return "—";
};

const getCustomerName = (customer) => {
    if (customer?.displayName) {
        return customer.displayName;
    }

    if (customer?.companyName) {
        return customer.companyName;
    }

    return [
        customer?.salutation,
        customer?.firstName,
        customer?.lastName,
    ]
        .filter(Boolean)
        .join(" ") || "Customer Details";
};

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

const SectionCard = ({ title, icon: Icon, children }) => {
    return (
        <section className="
            overflow-hidden rounded-xl border
            border-gray-200 bg-white shadow-sm
        ">
            <div className="
                flex items-center gap-2 border-b
                border-gray-100 px-5 py-4
            ">
                {Icon && (
                    <div className="
                        flex h-9 w-9 items-center justify-center
                        rounded-lg bg-blue-50 text-blue-600
                    ">
                        <Icon size={18} />
                    </div>
                )}

                <h2 className="
                    text-sm font-semibold text-gray-800
                ">
                    {title}
                </h2>
            </div>

            <div className="p-5">
                {children}
            </div>
        </section>
    );
};

const ReadField = ({ label, value }) => {
    return (
        <div className="min-w-0">
            <p className="
                mb-1 text-xs font-medium text-gray-400
            ">
                {label}
            </p>

            <div className="
                break-words text-sm font-medium text-gray-700
            ">
                {value === null ||
                    value === undefined ||
                    value === ""
                    ? "—"
                    : value}
            </div>
        </div>
    );
};

const CustomerStatusBadge = ({ status }) => {
    const styles = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
        DRAFT: "bg-amber-100 text-amber-700",
    };

    const normalizedStatus = String(status || "").toUpperCase();

    return (
        <span className={`
            inline-flex rounded-full px-3 py-1
            text-xs font-semibold
            ${styles[normalizedStatus] ||
            "bg-gray-100 text-gray-700"}
        `}>
            {formatLabel(status)}
        </span>
    );
};

const CustomerTypeBadge = ({ type }) => {
    const styles = {
        BUSINESS: "bg-blue-100 text-blue-700",
        INDIVIDUAL: "bg-purple-100 text-purple-700",
    };

    const normalizedType = String(type || "").toUpperCase();

    return (
        <span className={`
            inline-flex rounded-full px-3 py-1
            text-xs font-semibold
            ${styles[normalizedType] ||
            "bg-gray-100 text-gray-700"}
        `}>
            {formatLabel(type)}
        </span>
    );
};

const InfoCard = ({ title, value, icon: Icon, color }) => {
    const styles = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        amber: "bg-amber-50 text-amber-600",
    };

    return (
        <div className="
            rounded-xl border border-gray-200
            bg-white p-4 shadow-sm transition hover:shadow-md
        ">
            <div className="
                flex items-center justify-between gap-3
            ">
                <div className="min-w-0">
                    <p className="
                        text-xs font-medium uppercase
                        tracking-wide text-gray-500
                    ">
                        {title}
                    </p>

                    <p className="
                        mt-2 truncate text-lg font-bold text-gray-800
                    ">
                        {value ?? "—"}
                    </p>
                </div>

                <div className={`
                    flex h-10 w-10 shrink-0 items-center
                    justify-center rounded-lg
                    ${styles[color] || styles.blue}
                `}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
};

// ============================================================
// ADDRESS CARD
// ============================================================

const AddressCard = ({ address, title, icon: Icon }) => {
    if (!address) return null;

    return (
        <div className="
            rounded-xl border border-gray-200
            bg-gray-50/70 p-4
        ">
            <div className="
                mb-4 flex items-center gap-2
            ">
                <div className="
                    flex h-8 w-8 items-center justify-center
                    rounded-lg bg-blue-50 text-blue-600
                ">
                    <Icon size={16} />
                </div>

                <h3 className="
                    text-sm font-semibold text-gray-800
                ">
                    {title}
                </h3>
            </div>

            <div className="
                grid grid-cols-1 gap-5
                sm:grid-cols-2 lg:grid-cols-3
            ">
                <ReadField
                    label="Address ID"
                    value={address.id}
                />

                <ReadField
                    label="Attention"
                    value={address.attention}
                />

                <ReadField
                    label="Address"
                    value={address.address}
                />

                <ReadField
                    label="City"
                    value={address.city}
                />

                <ReadField
                    label="State"
                    value={address.state}
                />

                <ReadField
                    label="Country"
                    value={address.country}
                />

                <ReadField
                    label="ZIP Code"
                    value={address.zipCode}
                />

                <ReadField
                    label="Phone"
                    value={address.phone}
                />

                <ReadField
                    label="Fax"
                    value={address.fax}
                />
            </div>
        </div>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const CustomerViewDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    // ========================================================
    // REDUX STATE
    // ========================================================

    const {
        selectedCustomer,
        loading = false,
        error = null,
    } = useSelector((state) => state.customer || {});

    // ========================================================
    // FETCH CUSTOMER DETAILS
    // ========================================================

    useEffect(() => {
        if (id) {
            dispatch(getCustomerById(id));
        }
    }, [dispatch, id]);

    // ========================================================
    // PREVENT STALE CUSTOMER DETAILS
    // ========================================================

    const loaded =
        selectedCustomer &&
        String(selectedCustomer.id) === String(id);

    const data = loaded ? selectedCustomer : null;


    const audit = data?.audit;

    const customerName = getCustomerName(data);

    const billingAddress = data?.billingAddress || null;
    const shippingAddress = data?.shippingAddress || null;

    // ========================================================
    // LOADING
    // ========================================================

    if (loading && !loaded) {
        return (
            <div className="
                flex min-h-[400px] items-center justify-center
            ">
                <div className="text-center">
                    <div className="
                        mx-auto h-9 w-9 animate-spin rounded-full
                        border-4 border-blue-100 border-t-blue-600
                    " />

                    <p className="
                        mt-3 text-sm text-gray-500
                    ">
                        Loading customer details...
                    </p>
                </div>
            </div>
        );
    }

    // ========================================================
    // ERROR / NOT FOUND
    // ========================================================

    if (!loaded) {
        return (
            <div className="
                flex min-h-[400px] flex-col items-center justify-center
            ">
                <Users
                    size={42}
                    className="text-gray-300"
                />

                <h2 className="
                    mt-3 text-lg font-semibold text-gray-700
                ">
                    Customer Not Found
                </h2>

                <p className="
                    mt-1 text-sm text-gray-500
                ">
                    {error || "Unable to load customer details."}
                </p>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="
                        mt-5 flex items-center gap-2 rounded-lg
                        bg-blue-600 px-4 py-2 text-sm font-medium
                        text-white transition hover:bg-blue-700
                    "
                >
                    <ArrowLeft size={16} />
                    Go Back
                </button>
            </div>
        );
    }

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="mt-3 space-y-6 pb-8">

            {/* HEADER */}

            <div className="
                rounded-xl border border-gray-100
                bg-white p-5 shadow-sm
            ">
                <div className="
                    flex flex-col justify-between gap-4
                    lg:flex-row lg:items-center
                ">
                    <div className="
                        flex items-start gap-3
                    ">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            title="Go back"
                            className="
                                mt-1 flex h-9 w-9 shrink-0
                                items-center justify-center rounded-lg
                                border border-gray-200 bg-white
                                text-gray-600 transition hover:bg-gray-50
                            "
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div>
                            <div className="
                                flex flex-wrap items-center gap-3
                            ">
                                <h1 className="
                                    text-xl font-bold text-gray-800
                                ">
                                    {customerName}
                                </h1>

                                <CustomerTypeBadge
                                    type={data.customerType}
                                />

                                <CustomerStatusBadge
                                    status={data.status}
                                />
                            </div>

                            <p className="
                                mt-1 text-sm text-gray-500
                            ">
                                Customer ID: {data.id}
                            </p>
                        </div>
                    </div>

                    <div className="
                        flex items-center gap-2 rounded-lg
                        border border-gray-200 bg-white
                        px-3 py-2 text-sm text-gray-600
                    ">
                        <CalendarDays
                            size={16}
                            className="text-gray-400"
                        />

                        Created: {formatDateTime(audit?.createdAt)}
                    </div>
                </div>
            </div>

            {/* STATISTICS CARDS */}

            <div className="
                grid grid-cols-1 gap-4
                sm:grid-cols-2 xl:grid-cols-4
            ">
                <InfoCard
                    title="Customer ID"
                    value={data.id}
                    icon={Hash}
                    color="blue"
                />

                <InfoCard
                    title="Customer Type"
                    value={formatLabel(data.customerType)}
                    icon={Users}
                    color="purple"
                />

                <InfoCard
                    title="Currency"
                    value={data.currency}
                    icon={Wallet}
                    color="green"
                />

                <InfoCard
                    title="Payment Terms"
                    value={data.paymentTerms}
                    icon={CreditCard}
                    color="amber"
                />
            </div>

            {/* CUSTOMER INFORMATION */}

            <SectionCard
                title="Customer Information"
                icon={Users}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Customer ID"
                        value={data.id}
                    />

                    <ReadField
                        label="Customer Type"
                        value={<CustomerTypeBadge type={data.customerType} />}
                    />

                    <ReadField
                        label="Salutation"
                        value={data.salutation}
                    />

                    <ReadField
                        label="First Name"
                        value={data.firstName}
                    />

                    <ReadField
                        label="Last Name"
                        value={data.lastName}
                    />

                    <ReadField
                        label="Company Name"
                        value={data.companyName}
                    />

                    <ReadField
                        label="Display Name"
                        value={data.displayName}
                    />

                    <ReadField
                        label="Currency"
                        value={data.currency}
                    />

                    <ReadField
                        label="Customer Status"
                        value={<CustomerStatusBadge status={data.status} />}
                    />
                </div>
            </SectionCard>

            {/* CONTACT INFORMATION */}

            <SectionCard
                title="Contact Information"
                icon={Contact}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Email"
                        value={data.email}
                    />

                    <ReadField
                        label="Work Phone Code"
                        value={data.workPhoneCode}
                    />

                    <ReadField
                        label="Work Phone"
                        value={data.workPhone}
                    />

                    <ReadField
                        label="Mobile Code"
                        value={data.mobileCode}
                    />

                    <ReadField
                        label="Mobile"
                        value={data.mobile}
                    />

                    <ReadField
                        label="Website"
                        value={
                            data.websiteUrl ? (
                                <a
                                    href={data.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                                        break-all text-blue-600
                                        hover:underline
                                    "
                                >
                                    {data.websiteUrl}
                                </a>
                            ) : "—"
                        }
                    />

                    <ReadField
                        label="Customer Language"
                        value={data.customerLanguage}
                    />
                </div>
            </SectionCard>

            {/* ADDITIONAL INFORMATION */}

            <SectionCard
                title="Additional Information"
                icon={Briefcase}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="PAN"
                        value={data.pan}
                    />

                    <ReadField
                        label="Department"
                        value={data.department}
                    />

                    <ReadField
                        label="Designation"
                        value={data.designation}
                    />

                    <ReadField
                        label="Payment Terms"
                        value={data.paymentTerms}
                    />
                </div>
            </SectionCard>

            {/* BILLING ADDRESS */}

            <SectionCard
                title="Billing Address"
                icon={MapPinned}
            >
                {billingAddress ? (
                    <AddressCard
                        address={billingAddress}
                        title="Billing Address Details"
                        icon={MapPin}
                    />
                ) : (
                    <div className="
                        py-8 text-center text-sm text-gray-400
                    ">
                        <MapPin
                            size={30}
                            className="mx-auto mb-2 text-gray-300"
                        />
                        No billing address available.
                    </div>
                )}
            </SectionCard>

            {/* SHIPPING ADDRESS */}

            <SectionCard
                title="Shipping Address"
                icon={Truck}
            >
                {shippingAddress ? (
                    <AddressCard
                        address={shippingAddress}
                        title="Shipping Address Details"
                        icon={Truck}
                    />
                ) : (
                    <div className="
                        py-8 text-center text-sm text-gray-400
                    ">
                        <Truck
                            size={30}
                            className="mx-auto mb-2 text-gray-300"
                        />
                        No shipping address available.
                    </div>
                )}
            </SectionCard>

            {/* SOCIAL INFORMATION */}

            <SectionCard
                title="Social Information"
                icon={Globe}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Twitter"
                        value={data.twitter}
                    />

                    <ReadField
                        label="Skype"
                        value={data.skype}
                    />

                    <ReadField
                        label="Facebook"
                        value={data.facebook}
                    />

                    <ReadField
                        label="Website URL"
                        value={data.websiteUrl}
                    />
                </div>
            </SectionCard>

            {/* CUSTOMER PREFERENCES */}

            <SectionCard
                title="Customer Preferences"
                icon={ShieldCheck}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Customer Language"
                        value={data.customerLanguage}
                    />

                    <ReadField
                        label="Currency"
                        value={data.currency}
                    />

                    <ReadField
                        label="Payment Terms"
                        value={data.paymentTerms}
                    />

                    <ReadField
                        label="Enable Customer Portal"
                        value={formatBoolean(data.enablePortal)}
                    />
                </div>
            </SectionCard>

            {/* AUDIT INFORMATION */}

            <SectionCard
                title="Audit Information"
                icon={FileText}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Created At"
                        value={formatDateTime(audit?.createdAt)}
                    />

                    <ReadField
                        label="Updated At"
                        value={formatDateTime(audit?.updatedAt)}
                    />

                    <ReadField
                        label="Created By"
                        value={audit?.createdBy}
                    />

                    <ReadField
                        label="Updated By"
                        value={audit?.updatedBy}
                    />

                    <ReadField
                        label="Active"
                        value={formatBoolean(audit?.active)}
                    />
                </div>
            </SectionCard>

        </div>
    );
};

export default CustomerViewDetails;
