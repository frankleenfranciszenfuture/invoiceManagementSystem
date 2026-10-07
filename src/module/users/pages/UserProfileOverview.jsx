import React, {
    useEffect,
    useRef,
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
    SquarePen,
    Check,
    X,
    Loader2,
    AlertCircle,
    RotateCcw,
    UserRound,
    ShieldCheck,
    BadgeCheck,
    Clock3,
    Mail,
    UserCog,
} from "lucide-react";

import {
    fetchAllUsers,
    fetchUserById,
    updateUser,
    updateUserStatus,
} from "../thunks/userThunks";

/* =========================================================
   FIELD CONFIG
========================================================= */

const BASIC_FIELDS = [
    {
        key: "userId",
        label: "User ID",
        required: true,
    },
    {
        key: "name",
        label: "Name",
        required: true,
    },
    {
        key: "email",
        label: "Email",
        type: "email",
    },
    {
        key: "role",
        label: "Role",
        required: true,
    },
];

const ACCOUNT_FIELDS = [
    {
        key: "accountVerified",
        label: "Account Verified",
        type: "boolean",
    },
    {
        key: "status",
        label: "Status",
        type: "status",
    },
];

const TABS = [
    "Dashboard",
    "Transaction",
    "Recent Updates",
    "Activity",
];

/* =========================================================
   HELPERS
========================================================= */

const toText = (value) =>
    value === null || value === undefined
        ? ""
        : String(value);

function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return toText(value);
    }

    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

function timeAgo(milliseconds) {
    const seconds = Math.floor(
        (Date.now() - milliseconds) / 1000
    );

    if (seconds < 60) {
        return "Just now";
    }

    const minutes = Math.floor(
        seconds / 60
    );

    if (minutes < 60) {
        return `${minutes} min ago`;
    }

    const hours = Math.floor(
        minutes / 60
    );

    if (hours < 24) {
        return `${hours} hr ago`;
    }

    return `${Math.floor(hours / 24)} days ago`;
}

function validate(fields, values) {
    const errors = {};

    fields.forEach((field) => {
        const value = toText(
            values[field.key]
        ).trim();

        if (
            field.required &&
            !value
        ) {
            errors[field.key] =
                `${field.label} is required`;
        }

        else if (
            value &&
            field.type === "email" &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                value
            )
        ) {
            errors[field.key] =
                "Enter a valid email";
        }
    });

    return errors;
}

function useSavedFlash() {
    const [saved, setSaved] =
        useState(false);

    const timer =
        useRef(null);

    useEffect(() => {
        return () => {
            clearTimeout(timer.current);
        };
    }, []);

    const flash = () => {
        setSaved(true);

        clearTimeout(
            timer.current
        );

        timer.current = setTimeout(() => {
            setSaved(false);
        }, 2000);
    };

    return [
        saved,
        flash,
    ];
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
    title,
    editing,
    saving,
    saved,
    error,
    canSave = true,
    onEdit,
    onSave,
    onCancel,
    children,
}) {
    return (
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* HEADER */}

            <div className="flex items-center justify-between gap-3 px-4 pt-4">

                <h3 className="text-[14px] font-semibold text-slate-900">
                    {title}
                </h3>

                <div className="flex items-center gap-2">

                    {saved && !editing && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10.5px] font-medium text-emerald-600">
                            <Check size={11} />
                            Saved
                        </span>
                    )}

                    {editing ? (
                        <>
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={saving}
                                className="
                                    flex
                                    items-center
                                    gap-1
                                    rounded-md
                                    border
                                    border-slate-200
                                    bg-white
                                    px-2.5
                                    py-1.5
                                    text-[11.5px]
                                    font-medium
                                    text-slate-600
                                    transition
                                    hover:bg-slate-50
                                    disabled:opacity-50
                                "
                            >
                                <X size={12} />
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={onSave}
                                disabled={
                                    saving ||
                                    !canSave
                                }
                                className="
                                    flex
                                    items-center
                                    gap-1
                                    rounded-md
                                    bg-blue-600
                                    px-2.5
                                    py-1.5
                                    text-[11.5px]
                                    font-medium
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-blue-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                {saving ? (
                                    <Loader2
                                        size={12}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Check size={12} />
                                )}

                                {saving
                                    ? "Saving..."
                                    : "Save"}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={onEdit}
                            aria-label={`Edit ${title}`}
                            title="Edit"
                            className="
                                flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                rounded-md
                                text-slate-600
                                transition
                                hover:bg-slate-100
                                hover:text-slate-900
                            "
                        >
                            <SquarePen size={15} />
                        </button>
                    )}

                </div>
            </div>

            {/* CONTENT */}

            <div className="px-4 pb-4 pt-2.5">

                {error && (
                    <div className="mb-2.5 flex items-start gap-2 rounded-md bg-red-50 px-2.5 py-2 text-[11.5px] text-red-600">

                        <AlertCircle
                            size={13}
                            className="mt-0.5 shrink-0"
                        />

                        {error}

                    </div>
                )}

                {children}

            </div>

        </div>
    );
}

/* =========================================================
   FIELDS SECTION
========================================================= */

function FieldsSection({
    title,
    fields,
    values,
    onSave,
}) {
    const [editing, setEditing] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [draft, setDraft] =
        useState({});

    const [errors, setErrors] =
        useState({});

    const [serverError, setServerError] =
        useState("");

    const [saved, flash] =
        useSavedFlash();

    /* -------------------------------------------------------
       START EDIT
    ------------------------------------------------------- */

    const startEdit = () => {
        const draftValues = {};

        fields.forEach((field) => {
            draftValues[field.key] =
                values[field.key];
        });

        setDraft(draftValues);
        setErrors({});
        setServerError("");
        setEditing(true);
    };

    /* -------------------------------------------------------
       CANCEL
    ------------------------------------------------------- */

    const cancel = () => {
        setEditing(false);
        setErrors({});
        setServerError("");
    };

    /* -------------------------------------------------------
       SAVE
    ------------------------------------------------------- */

    const save = async () => {
        const validationErrors =
            validate(
                fields,
                draft
            );

        setErrors(
            validationErrors
        );

        if (
            Object.keys(
                validationErrors
            ).length > 0
        ) {
            return;
        }

        const patch = {};

        fields.forEach((field) => {
            let value =
                draft[field.key];

            if (
                field.type ===
                "boolean"
            ) {
                value =
                    Boolean(value);
            } else {
                value =
                    toText(value).trim();
            }

            patch[field.key] =
                value;
        });

        setSaving(true);
        setServerError("");

        const result =
            await onSave(patch);

        setSaving(false);

        if (result.ok) {
            setEditing(false);
            flash();
        } else {
            setServerError(
                result.message ||
                "Failed to save changes."
            );
        }
    };

    /* -------------------------------------------------------
       FIELD DISPLAY
    ------------------------------------------------------- */

    const displayValue = (
        field,
        value
    ) => {
        if (
            field.type ===
            "boolean"
        ) {
            return value
                ? "Yes"
                : "No";
        }

        return toText(value);
    };

    return (
        <SectionCard
            title={title}
            editing={editing}
            saving={saving}
            saved={saved}
            error={serverError}
            onEdit={startEdit}
            onSave={save}
            onCancel={cancel}
        >

            {fields.map(
                (
                    field,
                    index
                ) => {

                    const value =
                        values[
                        field.key
                        ];

                    return (
                        <div
                            key={
                                field.key
                            }
                            className={`
                                py-2.5
                                ${index >
                                    0
                                    ? "border-t border-slate-100"
                                    : ""
                                }
                            `}
                        >

                            <p className="text-[12px] font-medium text-slate-700">
                                {field.label}

                                {editing &&
                                    field.required && (
                                        <span className="text-red-500">
                                            {" "}*
                                        </span>
                                    )}
                            </p>

                            {editing ? (

                                <div className="mt-1.5">

                                    {field.type ===
                                        "boolean" ? (

                                        <select
                                            value={
                                                draft[
                                                    field.key
                                                ]
                                                    ? "true"
                                                    : "false"
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setDraft({
                                                    ...draft,
                                                    [field.key]:
                                                        event
                                                            .target
                                                            .value ===
                                                        "true",
                                                })
                                            }
                                            disabled={
                                                saving
                                            }
                                            className="
                                                h-[34px]
                                                w-full
                                                rounded-lg
                                                border
                                                border-slate-300
                                                bg-white
                                                px-3
                                                text-[13px]
                                                text-slate-800
                                                outline-none
                                                transition
                                                focus:border-blue-500
                                                focus:ring-2
                                                focus:ring-blue-100
                                                disabled:bg-slate-50
                                            "
                                        >
                                            <option value="true">
                                                Yes
                                            </option>

                                            <option value="false">
                                                No
                                            </option>
                                        </select>

                                    ) : field.type ===
                                        "status" ? (

                                        <select
                                            value={
                                                draft[
                                                field.key
                                                ] ??
                                                "ACTIVE"
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setDraft({
                                                    ...draft,
                                                    [field.key]:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            }
                                            disabled={
                                                saving
                                            }
                                            className="
                                                h-[34px]
                                                w-full
                                                rounded-lg
                                                border
                                                border-slate-300
                                                bg-white
                                                px-3
                                                text-[13px]
                                                text-slate-800
                                                outline-none
                                                transition
                                                focus:border-blue-500
                                                focus:ring-2
                                                focus:ring-blue-100
                                                disabled:bg-slate-50
                                            "
                                        >
                                            <option value="ACTIVE">
                                                ACTIVE
                                            </option>

                                            <option value="INACTIVE">
                                                INACTIVE
                                            </option>

                                            <option value="DRAFT">
                                                DRAFT
                                            </option>
                                        </select>

                                    ) : (

                                        <input
                                            type={
                                                field.type ===
                                                    "email"
                                                    ? "email"
                                                    : "text"
                                            }
                                            value={
                                                draft[
                                                field.key
                                                ] ??
                                                ""
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setDraft({
                                                    ...draft,
                                                    [field.key]:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            }
                                            placeholder={
                                                field.label
                                            }
                                            disabled={
                                                saving
                                            }
                                            className={`
                                                h-[34px]
                                                w-full
                                                rounded-lg
                                                border
                                                bg-white
                                                px-3
                                                text-[13px]
                                                text-slate-800
                                                outline-none
                                                transition
                                                placeholder:text-slate-400
                                                focus:ring-2
                                                disabled:bg-slate-50
                                                ${errors[
                                                    field.key
                                                ]
                                                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                                                }
                                            `}
                                        />

                                    )}

                                    {errors[
                                        field.key
                                    ] && (
                                            <p className="mt-1 text-[11.5px] text-red-500">
                                                {
                                                    errors[
                                                    field.key
                                                    ]
                                                }
                                            </p>
                                        )}

                                </div>

                            ) : (

                                <p className="mt-0.5 break-words text-[12.5px] leading-5 text-gray-900">

                                    {field.type ===
                                        "boolean" ? (

                                        <span
                                            className={`
                                                inline-flex
                                                items-center
                                                gap-1
                                                rounded-full
                                                px-2
                                                py-1
                                                text-[11px]
                                                font-medium
                                                ${value
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : "bg-amber-50 text-amber-600"
                                                }
                                            `}
                                        >
                                            {value ? (
                                                <Check
                                                    size={11}
                                                />
                                            ) : (
                                                <X
                                                    size={11}
                                                />
                                            )}

                                            {value
                                                ? "Yes"
                                                : "No"}
                                        </span>

                                    ) : field.type ===
                                        "status" ? (

                                        <span
                                            className={`
                                                inline-flex
                                                rounded-full
                                                px-2
                                                py-1
                                                text-[11px]
                                                font-medium
                                                ${String(
                                                value ||
                                                ""
                                            ).toUpperCase() ===
                                                    "ACTIVE"
                                                    ? "bg-emerald-50 text-emerald-600"
                                                    : String(
                                                        value ||
                                                        ""
                                                    ).toUpperCase() ===
                                                        "INACTIVE"
                                                        ? "bg-slate-100 text-slate-600"
                                                        : "bg-amber-50 text-amber-600"
                                                }
                                            `}
                                        >
                                            {value ||
                                                "—"}
                                        </span>

                                    ) : (

                                        !displayValue(
                                            field,
                                            value
                                        ) ? (
                                            <span className="text-slate-300">
                                                -
                                            </span>
                                        ) : (
                                            displayValue(
                                                field,
                                                value
                                            )
                                        )

                                    )}

                                </p>

                            )}

                        </div>
                    );
                }
            )}

        </SectionCard>
    );
}

/* =========================================================
   USER AVATAR SECTION
========================================================= */

function UserAvatarSection({
    name,
    initials,
}) {
    return (
        <div className="flex h-full min-h-[190px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between px-4 pt-4">

                <h3 className="text-[14px] font-semibold text-slate-900">
                    User Profile
                </h3>

            </div>

            <div className="flex flex-1 items-center justify-center px-3 py-5">

                <div
                    className="
                        flex
                        h-[110px]
                        w-[110px]
                        items-center
                        justify-center
                        rounded-full
                        bg-gradient-to-br
                        from-blue-500
                        to-indigo-600
                        shadow-sm
                    "
                    title={name || "User"}
                >
                    <span className="text-[30px] font-bold tracking-tight text-white">
                        {initials}
                    </span>
                </div>

            </div>

            <div className="border-t border-slate-100 px-4 py-2.5 text-center">

                <p className="truncate text-[12px] text-slate-400">
                    {name ||
                        "User profile"}
                </p>

            </div>

        </div>
    );
}

/* =========================================================
   STAT TILE
========================================================= */

function StatTile({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="min-w-0 rounded-lg border border-slate-200 bg-blue-500 px-3 py-2.5">

            <div className="flex items-center gap-1.5 text-gray-100">

                <Icon
                    size={14}
                    className="shrink-0 text-gray-100"
                />

                <span className="truncate text-[10.5px]">
                    {label}
                </span>

            </div>

            <p className="mt-1 truncate text-[14px] font-semibold leading-tight text-white">

                {value || (
                    <span className="text-slate-300">
                        -
                    </span>
                )}

            </p>

        </div>
    );
}

/* =========================================================
   COVER ART
========================================================= */

function CoverArt() {
    return (
        <svg
            viewBox="0 0 800 160"
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full"
            aria-hidden="true"
        >
            <defs>
                <linearGradient
                    id="user-cover-sky"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop
                        offset="0"
                        stopColor="#2c6a9b"
                    />

                    <stop
                        offset="1"
                        stopColor="#c3dcec"
                    />
                </linearGradient>
            </defs>

            <rect
                width="800"
                height="160"
                fill="url(#user-cover-sky)"
            />

            <path
                d="M0 120 L90 72 L150 96 L240 48 L330 100 L420 62 L520 106 L610 56 L700 96 L800 70 L800 160 L0 160Z"
                fill="#86aecb"
                opacity="0.85"
            />

            <path
                d="M0 138 L120 92 L200 112 L330 28 L400 82 L462 52 L560 112 L650 86 L760 122 L800 106 L800 160 L0 160Z"
                fill="#3a6a92"
            />

            <path
                d="M330 28 L298 64 L316 58 L330 72 L346 56 L364 64Z"
                fill="#f4f8fb"
            />

            <path
                d="M462 52 L440 76 L455 70 L463 82 L478 68 L488 78Z"
                fill="#f4f8fb"
            />

            <path
                d="M0 152 Q200 128 400 146 T800 140 L800 160 L0 160Z"
                fill="#24496b"
            />
        </svg>
    );
}

/* =========================================================
   PAGE
========================================================= */

export default function UserProfileOverview({
    userId,
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        id: paramId,
    } = useParams();

    const {
        user,
        users,
        loading,
        error,
    } = useSelector(
        (state) =>
            state.user || {}
    );

    /* -------------------------------------------------------
       USER ID
    ------------------------------------------------------- */

    const id =
        userId ?? paramId;

    const current =
        id
            ? user
            : users?.[0];

    const ready =
        !!current?.id;

    /* -------------------------------------------------------
       LOCAL UI STATE
    ------------------------------------------------------- */

    const [tab, setTab] =
        useState("Dashboard");

    const [activity, setActivity] =
        useState([]);

    /* -------------------------------------------------------
       FETCH USER
    ------------------------------------------------------- */

    useEffect(() => {
        if (id) {
            dispatch(
                fetchUserById(id)
            );
        } else {
            dispatch(
                fetchAllUsers({
                    page: 0,
                    size: 10,
                })
            );
        }
    }, [
        id,
        dispatch,
    ]);

    /* -------------------------------------------------------
       ACTIVITY
    ------------------------------------------------------- */

    const logActivity = (
        text
    ) => {
        setActivity(
            (previous) => [
                {
                    text,
                    at: Date.now(),
                },
                ...previous,
            ].slice(0, 8)
        );
    };

    /* -------------------------------------------------------
       SAVE USER
    ------------------------------------------------------- */

    const saveFields = async (
        patch,
        label
    ) => {
        const response =
            await dispatch(
                updateUser({
                    id: current.id,
                    data: {
                        ...current,
                        ...patch,
                    },
                })
            );

        if (
            updateUser.fulfilled.match(
                response
            )
        ) {
            if (label) {
                logActivity(
                    `Updated ${label}`
                );
            }

            return {
                ok: true,
            };
        }

        return {
            ok: false,
            message:
                response.payload ||
                "Failed to update user.",
        };
    };

    /* -------------------------------------------------------
       REACTIVATE / ACTIVATE USER
    ------------------------------------------------------- */

    const handleReactivate =
        async () => {
            const response =
                await dispatch(
                    updateUserStatus({
                        id: current.id,
                        status: "ACTIVE",
                    })
                );

            if (
                updateUserStatus.fulfilled.match(
                    response
                )
            ) {
                logActivity(
                    "Reactivated user"
                );
            }
        };

    /* -------------------------------------------------------
       RETRY
    ------------------------------------------------------- */

    const retry = () => {
        if (id) {
            dispatch(
                fetchUserById(id)
            );
        } else {
            dispatch(
                fetchAllUsers({
                    page: 0,
                    size: 10,
                })
            );
        }
    };

    /* =======================================================
       LOADING
    ======================================================= */

    if (!ready && loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center text-slate-400">
                <Loader2
                    size={26}
                    className="animate-spin"
                />
            </div>
        );
    }

    /* =======================================================
       EMPTY / ERROR
    ======================================================= */

    if (!ready) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">

                <AlertCircle
                    size={32}
                    className="text-slate-300"
                />

                <p className="text-sm text-slate-500">
                    {error ||
                        "No user found."}
                </p>

                <button
                    type="button"
                    onClick={retry}
                    className="
                        flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        px-3
                        py-1.5
                        text-[13px]
                        font-medium
                        text-slate-700
                        transition
                        hover:bg-slate-50
                    "
                >
                    <RotateCcw size={13} />
                    Try again
                </button>

            </div>
        );
    }

    /* =======================================================
       DERIVED VALUES
    ======================================================= */

    const initials =
        toText(
            current.name
        )
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .toUpperCase() ||
        "US";

    const isActive =
        String(
            current.status ||
            "ACTIVE"
        ).toUpperCase() ===
        "ACTIVE";

    const isVerified =
        Boolean(
            current.accountVerified
        );

    /* =======================================================
       UI
    ======================================================= */

    return (
        <div className="min-h-full bg-[#f7f8fa]">

            {/* =================================================
               TABS
            ================================================= */}

            <div className="border-b border-slate-200 bg-white px-6 pt-4">

                <nav className="-mb-px flex gap-7">

                    {TABS.map(
                        (tabName) => (
                            <button
                                key={
                                    tabName
                                }
                                type="button"
                                onClick={() =>
                                    setTab(
                                        tabName
                                    )
                                }
                                className={`
                                    border-b-2
                                    pb-3
                                    text-[13.5px]
                                    transition
                                    ${tab ===
                                        tabName
                                        ? "border-blue-600 font-semibold text-slate-900"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                    }
                                `}
                            >
                                {
                                    tabName
                                }
                            </button>
                        )
                    )}

                </nav>

            </div>

            {/* =================================================
               BODY
            ================================================= */}

            {tab !==
                "Dashboard" ? (

                <div className="p-10 text-center text-sm text-slate-400">
                    {tab} will appear here.
                </div>

            ) : (

                <div className="space-y-6 p-8">

                    {/* =================================================
                       PROFILE HEADER
                    ================================================= */}

                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">

                        {/* <div className="h-[122px] overflow-hidden rounded-lg">
                            <CoverArt />
                        </div> */}

                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-5 pb-2">

                            <div className="flex items-start gap-4">

                                {/* AVATAR */}

                                <div
                                    className="
                                        -mt-[38px]
                                        flex
                                        h-[86px]
                                        w-[86px]
                                        shrink-0
                                        cursor-pointer
                                        items-center
                                        justify-center
                                        overflow-hidden
                                        rounded-full
                                        border-[4px]
                                        border-white
                                        bg-gradient-to-br
                                        from-blue-500
                                        to-indigo-600
                                        shadow-md
                                    "
                                    onClick={() =>
                                        navigate(
                                            "/users"
                                        )
                                    }
                                    title="Back to Users"
                                >
                                    <span className="text-[24px] font-bold tracking-tight text-white">
                                        {
                                            initials
                                        }
                                    </span>
                                </div>

                                {/* USER DETAILS */}

                                <div className="pt-2.5">

                                    <h2
                                        className="
                                            cursor-pointer
                                            text-[24px]
                                            font-semibold
                                            leading-tight
                                            text-blue-600
                                            hover:text-[#3b82f6]
                                        "
                                        onClick={() =>
                                            navigate(
                                                "/users"
                                            )
                                        }
                                    >
                                        {
                                            current.name ||
                                            "User"
                                        }
                                    </h2>

                                    <p className="mt-0.5 text-[12px] text-blue-900">
                                        @ -
                                        {toText(
                                            current.userId
                                        ).toLowerCase() ||
                                            "user"}
                                    </p>

                                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-slate-500">

                                        <span className="flex items-center gap-1 text-slate-700">
                                            <UserRound
                                                size={
                                                    13
                                                }
                                            />

                                            {
                                                current.userId ||
                                                "-"
                                            }
                                        </span>

                                        <span className="flex items-center gap-1 text-slate-700">
                                            <Mail
                                                size={
                                                    13
                                                }
                                            />

                                            {
                                                current.email ||
                                                "-"
                                            }
                                        </span>

                                        <span>
                                            Role:{" "}
                                            <b className="font-semibold text-slate-900">
                                                {
                                                    current.role ||
                                                    "-"
                                                }
                                            </b>
                                        </span>

                                        <span>
                                            Status:{" "}
                                            <b
                                                className={`
                                                    font-semibold
                                                    ${isActive
                                                        ? "text-emerald-600"
                                                        : "text-slate-500"
                                                    }
                                                `}
                                            >
                                                {
                                                    current.status ||
                                                    "ACTIVE"
                                                }
                                            </b>
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {/* REACTIVATE */}

                            {!isActive && (
                                <div className="pt-2.5">

                                    <button
                                        type="button"
                                        onClick={
                                            handleReactivate
                                        }
                                        disabled={
                                            loading
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-1.5
                                            rounded-lg
                                            border
                                            border-emerald-200
                                            bg-white
                                            px-3.5
                                            py-2
                                            text-[13px]
                                            font-medium
                                            text-emerald-600
                                            transition
                                            hover:bg-emerald-50
                                            disabled:opacity-50
                                        "
                                    >
                                        <RotateCcw
                                            size={
                                                14
                                            }
                                        />

                                        Reactivate
                                    </button>

                                </div>
                            )}

                        </div>

                    </div>

                    {/* =================================================
                       ROW 1
                       USER INFORMATION + PROFILE
                    ================================================= */}

                    <div className="grid items-stretch gap-4 lg:grid-cols-2">

                        {/* LEFT — USER INFORMATION */}

                        <div>
                            <FieldsSection
                                title="User Information"
                                fields={
                                    BASIC_FIELDS
                                }
                                values={
                                    current
                                }
                                onSave={(
                                    patch
                                ) =>
                                    saveFields(
                                        patch,
                                        "user information"
                                    )
                                }
                            />
                        </div>

                        {/* RIGHT — USER PROFILE */}

                        <div className="flex flex-col gap-4">

                            <UserAvatarSection
                                name={
                                    current.name
                                }
                                initials={
                                    initials
                                }
                            />

                            <FieldsSection
                                title="Account Information"
                                fields={
                                    ACCOUNT_FIELDS
                                }
                                values={
                                    current
                                }
                                onSave={(
                                    patch
                                ) =>
                                    saveFields(
                                        patch,
                                        "account information"
                                    )
                                }
                            />

                        </div>

                    </div>

                    {/* =================================================
                       ROW 2
                       ACTIVITY + USER STATUS
                    ================================================= */}

                    <div className="grid items-stretch gap-4 lg:grid-cols-2">

                        {/* ACCOUNT OVERVIEW */}

                        <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                            <h3 className="text-[14px] font-semibold text-slate-900">
                                Account Overview
                            </h3>

                            <div className="mt-3 grid grid-cols-3 gap-2.5">

                                <StatTile
                                    icon={
                                        UserCog
                                    }
                                    label="Role"
                                    value={
                                        current.role
                                    }
                                />

                                <StatTile
                                    icon={
                                        BadgeCheck
                                    }
                                    label="Verified"
                                    value={
                                        isVerified
                                            ? "Yes"
                                            : "No"
                                    }
                                />

                                <StatTile
                                    icon={
                                        ShieldCheck
                                    }
                                    label="Status"
                                    value={
                                        current.status
                                    }
                                />

                            </div>

                            <h4 className="mb-2 mt-5 text-[13px] font-semibold text-slate-900">
                                Account Details
                            </h4>

                            <div className="space-y-0">

                                <div className="flex items-center justify-between border-t border-slate-100 px-3 py-3 text-[12.5px]">

                                    <span className="text-slate-500">
                                        User ID
                                    </span>

                                    <span className="font-medium text-slate-800">
                                        {
                                            current.userId ||
                                            "-"
                                        }
                                    </span>

                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 px-3 py-3 text-[12.5px]">

                                    <span className="text-slate-500">
                                        Email
                                    </span>

                                    <span className="max-w-[65%] truncate font-medium text-slate-800">
                                        {
                                            current.email ||
                                            "-"
                                        }
                                    </span>

                                </div>

                                <div className="flex items-center justify-between border-t border-slate-100 px-3 py-3 text-[12.5px]">

                                    <span className="text-slate-500">
                                        Account Verified
                                    </span>

                                    <span
                                        className={`
                                            font-medium
                                            ${isVerified
                                                ? "text-emerald-600"
                                                : "text-amber-600"
                                            }
                                        `}
                                    >
                                        {isVerified
                                            ? "Verified"
                                            : "Not Verified"}
                                    </span>

                                </div>

                            </div>

                        </div>

                        {/* ACTIVITY */}

                        <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                            <h3 className="text-[14px] font-semibold text-slate-900">
                                Recent Activity
                            </h3>

                            {activity.length ===
                                0 ? (

                                <div className="flex flex-1 items-center justify-center">

                                    <p className="px-3 py-8 text-center text-[13px] text-slate-400">
                                        Changes you make on this page will appear here.
                                    </p>

                                </div>

                            ) : (

                                <ul className="mt-3">

                                    {activity.map(
                                        (
                                            activityItem,
                                            index
                                        ) => (
                                            <li
                                                key={
                                                    activityItem.at +
                                                    index
                                                }
                                                className={`
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-3
                                                    px-3
                                                    py-3
                                                    text-[12.5px]
                                                    ${index >
                                                        0
                                                        ? "border-t border-slate-100"
                                                        : ""
                                                    }
                                                `}
                                            >
                                                <span className="text-slate-800">
                                                    {
                                                        activityItem.text
                                                    }
                                                </span>

                                                <span className="shrink-0 text-[11.5px] text-slate-400">
                                                    {timeAgo(
                                                        activityItem.at
                                                    )}
                                                </span>
                                            </li>
                                        )
                                    )}

                                </ul>

                            )}

                        </div>

                    </div>

                    {/* =================================================
                       ROW 3
                       ROLE + ACCOUNT
                    ================================================= */}

                    <div className="grid items-stretch gap-4 lg:grid-cols-2">

                        <FieldsSection
                            title="Role Information"
                            fields={[
                                {
                                    key: "role",
                                    label: "Role",
                                    required: true,
                                },
                            ]}
                            values={
                                current
                            }
                            onSave={(
                                patch
                            ) =>
                                saveFields(
                                    patch,
                                    "role information"
                                )
                            }
                        />

                        <FieldsSection
                            title="Account Status"
                            fields={[
                                {
                                    key: "accountVerified",
                                    label: "Account Verified",
                                    type: "boolean",
                                },
                                {
                                    key: "status",
                                    label: "Status",
                                    type: "status",
                                },
                            ]}
                            values={
                                current
                            }
                            onSave={(
                                patch
                            ) =>
                                saveFields(
                                    patch,
                                    "account status"
                                )
                            }
                        />

                    </div>

                </div>

            )}

        </div>
    );
}