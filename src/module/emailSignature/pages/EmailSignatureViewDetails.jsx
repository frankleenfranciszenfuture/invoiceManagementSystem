
import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Mail,
    CalendarDays,
    FileText,
    Hash,
    CheckCircle,
    XCircle,
    User,
    Star,
    Reply,
} from "lucide-react";

import {
    fetchEmailSignaturesById,
} from "../thunks/emailSignatureThunks";

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

const EmailSignatureStatusBadge = ({ status }) => {
    const styles = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-red-100 text-red-700",
        DRAFT: "bg-amber-100 text-amber-700",
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

const BooleanBadge = ({ value, trueLabel = "Yes", falseLabel = "No" }) => {
    return (
        <span className={`
            inline-flex items-center gap-1 rounded-full
            px-3 py-1 text-xs font-semibold
            ${value
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }
        `}>
            {value
                ? <CheckCircle size={12} />
                : <XCircle size={12} />
            }

            {value ? trueLabel : falseLabel}
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
                        {value || "—"}
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

const EmailSignatureViewDetails = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    const user = useSelector(
        (state) => state.auth?.user
    );

    const userId = user?.id;

    const {
        emailSignature,
        loading,
        error,
    } = useSelector((state) => state.emailSignatures || {});

    // --------------------------------------------------
    // Fetch email signature details
    // --------------------------------------------------

    useEffect(() => {

        if (id && userId) {
            dispatch(
                fetchEmailSignaturesById({
                    id,
                    userId,
                })
            );
        }

    }, [
        dispatch,
        id,
        userId,
    ]);

    // --------------------------------------------------
    // Prevent displaying stale details
    // --------------------------------------------------

    const loaded =
        emailSignature &&
        String(emailSignature.id) === String(id);

    const data = loaded ? emailSignature : null;

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
                        Loading email signature details...
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

                <Mail
                    size={42}
                    className="text-gray-300"
                />

                <h2 className="
                    mt-3 text-lg font-semibold text-gray-700
                ">
                    Email Signature Not Found
                </h2>

                <p className="
                    mt-1 text-sm text-gray-500
                ">
                    {error || "Unable to load email signature details."}
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
                                    {data.signatureName || "Email Signature Details"}
                                </h1>

                                <EmailSignatureStatusBadge
                                    status={data.status}
                                />

                            </div>

                            <p className="
                                mt-1 text-sm text-gray-500
                            ">
                                Email signature configuration
                            </p>

                        </div>

                    </div>

                    <div className="
                        flex items-center gap-2 rounded-lg
                        border border-gray-200 bg-white
                        px-3 py-2 text-sm text-gray-600
                    ">
                        <Hash
                            size={16}
                            className="text-gray-400"
                        />

                        Signature ID: {data.id || "—"}
                    </div>

                </div>

            </div>

            {/* Statistics Cards */}

            <div className="
                grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4
            ">

                <InfoCard
                    title="Signature Name"
                    value={data.signatureName}
                    icon={Mail}
                    color="blue"
                />

                <InfoCard
                    title="User ID"
                    value={data.userId}
                    icon={User}
                    color="purple"
                />

                <InfoCard
                    title="Default for New Messages"
                    value={data.defaultForNewMessages ? "Yes" : "No"}
                    icon={Star}
                    color="green"
                />

                <InfoCard
                    title="Default for Replies"
                    value={data.defaultForReplies ? "Yes" : "No"}
                    icon={Reply}
                    color="amber"
                />

            </div>

            {/* Email Signature Information */}

            <SectionCard
                title="Email Signature Information"
                icon={Mail}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Signature Name"
                        value={data.signatureName}
                    />

                    <ReadField
                        label="Signature ID"
                        value={data.id}
                    />

                    <ReadField
                        label="User ID"
                        value={data.userId}
                    />

                    <ReadField
                        label="Status"
                        value={
                            <EmailSignatureStatusBadge
                                status={data.status}
                            />
                        }
                    />

                    <ReadField
                        label="Default for New Messages"
                        value={
                            <BooleanBadge
                                value={data.defaultForNewMessages}
                            />
                        }
                    />

                    <ReadField
                        label="Default for Replies"
                        value={
                            <BooleanBadge
                                value={data.defaultForReplies}
                            />
                        }
                    />

                </div>

            </SectionCard>

            {/* Signature Content */}

            <SectionCard
                title="Signature Content"
                icon={FileText}
            >

                <div className="
                    rounded-lg border border-gray-200
                    bg-gray-50 p-4
                ">
                    {data.signatureContent ? (
                        <div
                            className="
                                break-words text-sm text-gray-700
                            "
                            dangerouslySetInnerHTML={{
                                __html: data.signatureContent,
                            }}
                        />
                    ) : (
                        <p className="text-sm text-gray-400">
                            No signature content available.
                        </p>
                    )}
                </div>

            </SectionCard>

            {/* Signature Settings */}

            <SectionCard
                title="Signature Settings"
                icon={CheckCircle}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Default for New Messages"
                        value={
                            <BooleanBadge
                                value={data.defaultForNewMessages}
                                trueLabel="Default"
                                falseLabel="Not Default"
                            />
                        }
                    />

                    <ReadField
                        label="Default for Replies"
                        value={
                            <BooleanBadge
                                value={data.defaultForReplies}
                                trueLabel="Default"
                                falseLabel="Not Default"
                            />
                        }
                    />

                    <ReadField
                        label="Signature Status"
                        value={
                            <EmailSignatureStatusBadge
                                status={data.status}
                            />
                        }
                    />

                </div>

            </SectionCard>

            {/* Audit Information */}

            <SectionCard
                title="Audit Information"
                icon={CalendarDays}
            >

                <div className="
                    grid grid-cols-1 gap-5
                    sm:grid-cols-2 lg:grid-cols-4
                ">

                    <ReadField
                        label="Created At"
                        value={formatDateTime(data.createdAt)}
                    />

                    <ReadField
                        label="Updated At"
                        value={formatDateTime(data.updatedAt)}
                    />

                </div>

            </SectionCard>

        </div>
    );
};

export default EmailSignatureViewDetails;