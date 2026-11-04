
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    ShieldCheck,
    CalendarDays,
    FileText,
    Hash,
    UserRound,
    CheckCircle,
    XCircle,
    Shield,
    Lock,
    Clock,
    Activity,
    Mail,
    BadgeCheck,
    Fingerprint,
} from "lucide-react";

import { fetchUserById } from "../thunks/userThunks";

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------

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

const getUserStatus = (user) => {
    if (user?.status) {
        return String(user.status).toUpperCase();
    }

    if (user?.audit?.active === true) {
        return "ACTIVE";
    }

    if (user?.audit?.active === false) {
        return "INACTIVE";
    }

    return null;
};

// ------------------------------------------------------
// Reusable Components
// ------------------------------------------------------

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

const UserStatusBadge = ({ status }) => {
    const styles = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
        DRAFT: "bg-orange-100 text-orange-700",
    };

    return (
        <span className={`
            inline-flex rounded-full px-3 py-1
            text-xs font-semibold
            ${styles[String(status || "").toUpperCase()] ||
            "bg-gray-100 text-gray-700"}
        `}>
            {formatLabel(status)}
        </span>
    );
};

const VerificationBadge = ({ verified }) => {
    return verified ? (
        <span className="
            inline-flex items-center gap-1.5 rounded-full
            bg-green-100 px-3 py-1 text-xs font-semibold
            text-green-700
        ">
            <CheckCircle size={13} />
            Verified
        </span>
    ) : (
        <span className="
            inline-flex items-center gap-1.5 rounded-full
            bg-orange-100 px-3 py-1 text-xs font-semibold
            text-orange-700
        ">
            <XCircle size={13} />
            Not Verified
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

// ------------------------------------------------------
// Main Component
// ------------------------------------------------------

const UserViewDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const {
        user,
        loading,
        error,
    } = useSelector((state) => state.user || {});

    // --------------------------------------------------
    // Fetch user details
    // --------------------------------------------------

    useEffect(() => {
        if (id) {
            dispatch(fetchUserById(id));
        }
    }, [dispatch, id]);

    // --------------------------------------------------
    // Prevent displaying stale user details
    // --------------------------------------------------

    const loaded =
        user &&
        String(user.id) === String(id);

    const data = loaded ? user : null;
    const audit = data?.audit;

    const userStatus = getUserStatus(data);

    const isSystemUser =
        String(data?.role || "")
            .trim()
            .toUpperCase() === "SUPER_ADMIN";

    const accountVerified = data?.accountVerified === true;

    // --------------------------------------------------
    // Loading
    // --------------------------------------------------

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
                        Loading user details...
                    </p>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // Error / Not Found
    // --------------------------------------------------

    if (!loaded) {
        return (
            <div className="
                flex min-h-[400px] flex-col items-center justify-center
            ">
                <UserRound
                    size={42}
                    className="text-gray-300"
                />

                <h2 className="
                    mt-3 text-lg font-semibold text-gray-700
                ">
                    User Not Found
                </h2>

                <p className="
                    mt-1 text-sm text-gray-500
                ">
                    {error || "Unable to load user details."}
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

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    return (
        <div className="mt-3 space-y-6 pb-8">

            {/* Header */}

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
                                    {data.name || "User Details"}
                                </h1>

                                <UserStatusBadge
                                    status={userStatus}
                                />

                                {isSystemUser && (
                                    <span className="
                                        inline-flex rounded-full
                                        bg-purple-100 px-3 py-1
                                        text-xs font-semibold
                                        text-purple-700
                                    ">
                                        System User
                                    </span>
                                )}
                            </div>

                            <p className="
                                mt-1 text-sm text-gray-500
                            ">
                                User ID: {data.userId || data.id}
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

            {/* Statistics Cards */}

            <div className="
                grid grid-cols-1 gap-4
                sm:grid-cols-2 xl:grid-cols-4
            ">
                <InfoCard
                    title="User ID"
                    value={data.userId || data.id}
                    icon={Hash}
                    color="blue"
                />

                <InfoCard
                    title="User Name"
                    value={data.name}
                    icon={UserRound}
                    color="purple"
                />

                <InfoCard
                    title="User Role"
                    value={formatLabel(data.role)}
                    icon={Shield}
                    color="green"
                />

                <InfoCard
                    title="Account Verification"
                    value={accountVerified ? "Verified" : "Pending"}
                    icon={BadgeCheck}
                    color="amber"
                />
            </div>

            {/* User Information */}

            <SectionCard
                title="User Information"
                icon={UserRound}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Database ID"
                        value={data.id}
                    />

                    <ReadField
                        label="User ID"
                        value={data.userId}
                    />

                    <ReadField
                        label="Full Name"
                        value={data.name}
                    />

                    <ReadField
                        label="Email Address"
                        value={data.email}
                    />

                    <ReadField
                        label="Role"
                        value={formatLabel(data.role)}
                    />

                    <ReadField
                        label="Account Status"
                        value={<UserStatusBadge status={userStatus} />}
                    />

                    <ReadField
                        label="Account Verification"
                        value={
                            <VerificationBadge
                                verified={accountVerified}
                            />
                        }
                    />

                    <ReadField
                        label="Active"
                        value={
                            audit?.active === true
                                ? "Yes"
                                : audit?.active === false
                                    ? "No"
                                    : "—"
                        }
                    />
                </div>
            </SectionCard>

            {/* Account Security */}

            <SectionCard
                title="Account Security"
                icon={ShieldCheck}
            >
                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">
                    <ReadField
                        label="Account Verification"
                        value={
                            <VerificationBadge
                                verified={accountVerified}
                            />
                        }
                    />

                    <ReadField
                        label="System User"
                        value={isSystemUser ? "Yes" : "No"}
                    />

                    <ReadField
                        label="Assigned Role"
                        value={formatLabel(data.role)}
                    />

                    <ReadField
                        label="Account Active"
                        value={
                            audit?.active === true
                                ? "Yes"
                                : audit?.active === false
                                    ? "No"
                                    : "—"
                        }
                    />
                </div>
            </SectionCard>

            {/* Audit Information */}

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
                        value={
                            audit?.active === true
                                ? "Yes"
                                : audit?.active === false
                                    ? "No"
                                    : "—"
                        }
                    />
                </div>
            </SectionCard>

        </div>
    );
};

export default UserViewDetails;
