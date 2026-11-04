
import React, {
    useEffect,
    useMemo,
    useCallback,
} from "react";

import {
    useSelector,
    useDispatch,
} from "react-redux";

import {
    Plus,
    Download,
    Mail,
} from "lucide-react";

import toast from "react-hot-toast";

import EmailSignatureTable from "../pages/EmailSignatureTable";
import NavbarEmailSignature from "../components/bars/nav/NavbarEmailSignature";

import {
    clearEmailSignatureError,
} from "../slices/emailSignatureSlice";

import {
    openModal,
} from "../../ui/uiSlice";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

import EmailSignatureOverview from "../../emailSignature/pages/EmailSignatureOverview";

import {
    setEmailSignatureStatus,
    setSelectedEmailSignatureView,
    setSearch,
} from "../slices/emailSignatureViewSlice";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

const VALID_STATUSES = [
    "ALL",
    "ACTIVE",
    "INACTIVE",
];

/* =========================================================
   NORMALIZE HELPERS
========================================================= */

const normalizeModule = (value) =>
    String(value ?? "").trim().toLowerCase();

const normalizeAction = (value) =>
    String(value ?? "").trim().toUpperCase();

const normalizeSearch = (value) =>
    String(value ?? "").trim().toLowerCase();

const STATUS_LABELS = {
    ALL: "All Email Signatures",
    ACTIVE: "Active Email Signatures",
    INACTIVE: "Inactive Email Signatures",
};

/* =========================================================
   SEARCH HELPER
========================================================= */

const matchesEmailSignatureSearch = (
    signature,
    search
) => {
    if (!search) {
        return true;
    }

    const searchableFields = [
        signature?.signatureName,
        signature?.userId,
        signature?.status,
        signature?.signatureContent,
        signature?.id,
    ];

    return searchableFields.some((value) =>
        normalizeSearch(value).includes(search)
    );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function EmailSignatureDashboard() {
    const dispatch = useDispatch();

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    const userId = user?.id;

    const isAuthenticated = useSelector(
        (state) =>
            state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) =>
            state.auth?.authChecking === true
    );

    /* =====================================================
       PERMISSION STATE
    ===================================================== */

    const permissions = useSelector(
        (state) => {
            const value =
                state.menuPermission?.userPermissions;

            return Array.isArray(value)
                ? value
                : EMPTY_ARRAY;
        }
    );

    const permissionLoading = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoaded === true
    );

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

    const hasFullAccess =
        normalizedRole === "SUPER_ADMIN" ||
        normalizedRole === "ADMIN";

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = useCallback(
        (moduleName, actionName) => {
            if (hasFullAccess) {
                return true;
            }

            if (!Array.isArray(permissions)) {
                return false;
            }

            const requestedModule =
                normalizeModule(moduleName);

            const requestedAction =
                normalizeAction(actionName);

            return permissions.some((permission) => {
                const permissionModule = normalizeModule(
                    permission?.moduleName ||
                    permission?.module?.moduleName ||
                    permission?.module?.name ||
                    ""
                );

                if (
                    permissionModule !== requestedModule
                ) {
                    return false;
                }

                if (permission?.active === false) {
                    return false;
                }

                if (
                    normalizeAction(permission?.status) ===
                    "INACTIVE"
                ) {
                    return false;
                }

                /* GROUPED ACTIONS */

                if (Array.isArray(permission?.actions)) {
                    return permission.actions.some((action) => {
                        if (typeof action === "string") {
                            return (
                                normalizeAction(action) ===
                                requestedAction
                            );
                        }

                        const permissionAction = normalizeAction(
                            action?.actionName ||
                            action?.action?.actionName ||
                            action?.action?.name ||
                            action?.name ||
                            ""
                        );

                        const allowed =
                            action?.allowed === true ||
                            action?.allowed === "true";

                        if (action?.active === false) {
                            return false;
                        }

                        if (
                            normalizeAction(action?.status) ===
                            "INACTIVE"
                        ) {
                            return false;
                        }

                        return (
                            permissionAction === requestedAction &&
                            allowed
                        );
                    });
                }

                /* DIRECT / FLAT ACTION */

                const permissionAction = normalizeAction(
                    permission?.actionName ||
                    permission?.action?.actionName ||
                    permission?.action?.name ||
                    ""
                );

                const allowed =
                    permission?.allowed === true ||
                    permission?.allowed === "true";

                return (
                    permissionAction === requestedAction &&
                    allowed
                );
            });
        },
        [
            hasFullAccess,
            permissions,
        ]
    );

    /* =====================================================
       EMAIL SIGNATURE PERMISSIONS
    ===================================================== */

    const canViewEmailSignature = hasPermission(
        "Email Signatures",
        "VIEW"
    );

    const canCreateEmailSignature = hasPermission(
        "Email Signatures",
        "CREATE"
    );

    /* =====================================================
       EMAIL SIGNATURE STATE
    ===================================================== */

    const emailSignaturesFromRedux = useSelector(
        (state) =>
            state.emailSignatures?.emailSignatures
    );

    const emailSignatures = Array.isArray(
        emailSignaturesFromRedux
    )
        ? emailSignaturesFromRedux
        : EMPTY_ARRAY;

    const loading = useSelector(
        (state) =>
            state.emailSignatures?.loading === true
    );

    const error = useSelector(
        (state) =>
            state.emailSignatures?.error
    );

    /* =====================================================
       EMAIL SIGNATURE VIEW STATE
    ===================================================== */

    const search = useSelector(
        (state) =>
            state.emailSignatureView?.search || ""
    );

    const emailSignatureStatus = useSelector(
        (state) =>
            state.emailSignatureView?.emailSignatureStatus ||
            "ALL"
    );

    /* =====================================================
       LOAD USER PERMISSIONS
    ===================================================== */

    useEffect(() => {
        if (authChecking || !isAuthenticated) {
            return;
        }

        if (hasFullAccess) {
            return;
        }

        if (
            permissionsLoaded ||
            permissionLoading
        ) {
            return;
        }

        dispatch(getUserPermission());
    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    /* =====================================================
       FILTER EMAIL SIGNATURES
    ===================================================== */

    const filteredEmailSignatures = useMemo(() => {
        const normalizedStatus = VALID_STATUSES.includes(
            String(emailSignatureStatus).toUpperCase()
        )
            ? String(emailSignatureStatus).toUpperCase()
            : "ALL";

        const normalizedQuery =
            normalizeSearch(search);

        return emailSignatures.filter((signature) => {
            /* USER FILTER */

            if (
                String(signature?.userId) !==
                String(userId)
            ) {
                return false;
            }

            /* STATUS FILTER */

            const signatureStatus = String(
                signature?.status || ""
            )
                .trim()
                .toUpperCase();

            if (
                normalizedStatus !== "ALL" &&
                signatureStatus !== normalizedStatus
            ) {
                return false;
            }

            /* SEARCH FILTER */

            if (
                !matchesEmailSignatureSearch(
                    signature,
                    normalizedQuery
                )
            ) {
                return false;
            }

            return true;
        });
    }, [
        emailSignatures,
        userId,
        emailSignatureStatus,
        search,
    ]);

    /* =====================================================
       ACTIVE FILTER CHECK
    ===================================================== */

    const hasActiveFilters =
        normalizeSearch(search) !== "" ||
        emailSignatureStatus !== "ALL";

    /* =====================================================
       CLEAR FILTERS
    ===================================================== */

    const handleClearFilters = useCallback(() => {
        dispatch(setSearch(""));
        dispatch(setEmailSignatureStatus("ALL"));
        dispatch(
            setSelectedEmailSignatureView(
                STATUS_LABELS.ALL
            )
        );
    }, [dispatch]);

    /* =====================================================
       OPEN CREATE EMAIL SIGNATURE MODAL
    ===================================================== */

    const handleCreateEmailSignature = useCallback(() => {
        if (!isAuthenticated || !userId) {
            return;
        }

        if (
            !hasFullAccess &&
            (
                permissionLoading ||
                !permissionsLoaded
            )
        ) {
            return;
        }

        if (!canCreateEmailSignature) {
            toast.error(
                "You do not have permission to create email signatures."
            );
            return;
        }

        dispatch(
            openModal({
                type: "addEmailSignature",
            })
        );
    }, [
        isAuthenticated,
        userId,
        hasFullAccess,
        permissionLoading,
        permissionsLoaded,
        canCreateEmailSignature,
        dispatch,
    ]);

    /* =====================================================
       CLEAR ERROR
    ===================================================== */

    useEffect(() => {
        if (!error) {
            return;
        }

        const timer = setTimeout(() => {
            dispatch(clearEmailSignatureError());
        }, 2000);

        return () => clearTimeout(timer);
    }, [
        error,
        dispatch,
    ]);

    /* =====================================================
       AUTH CHECKING
    ===================================================== */

    if (authChecking) {
        return <InvoiceSkeleton />;
    }

    /* =====================================================
       NOT AUTHENTICATED
    ===================================================== */

    if (!isAuthenticated) {
        return null;
    }

    /* =====================================================
       PERMISSION LOADING
    ===================================================== */

    if (
        !hasFullAccess &&
        (
            permissionLoading ||
            !permissionsLoaded
        )
    ) {
        return <InvoiceSkeleton />;
    }

    /* =====================================================
       VIEW PERMISSION DENIED
    ===================================================== */

    if (!canViewEmailSignature) {
        return (
            <div
                className="
                    flex h-screen items-center justify-center
                    bg-gray-50 font-sans
                "
            >
                <div className="px-6 text-center">
                    <div
                        className="
                            mx-auto mb-4 flex h-16 w-16
                            items-center justify-center
                            rounded-full bg-red-50
                            text-2xl font-semibold text-red-500
                        "
                    >
                        !
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                        You do not have permission to view email signatures.
                    </p>
                </div>
            </div>
        );
    }

    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <div
            className="
                flex h-screen overflow-hidden
                bg-gray-50 font-sans text-[13px]
            "
        >
            <div
                className="
                    min-h-0 flex-1 overflow-y-auto bg-white
                "
            >
                <div
                    className="
                        w-full max-w-30xl px-2 py-5
                    "
                >
                    {/* EMAIL SIGNATURE NAVBAR */}

                    <NavbarEmailSignature />

                    {/* EMAIL SIGNATURE OVERVIEW */}

                    <EmailSignatureOverview
                        canViewEmailSignature={canViewEmailSignature}
                        isAuthenticated={isAuthenticated}
                        authChecking={authChecking}
                    />

                    {/* ERROR */}

                    {error && (
                        <div
                            className="
                                mx-2 mt-4 rounded-md
                                border border-red-200
                                bg-red-50 px-4 py-3
                                text-sm text-red-600
                            "
                        >
                            {error}
                        </div>
                    )}

                    {/* TABLE / LOADING / EMPTY STATE */}

                    {loading ? (
                        <div
                            className="
                                flex min-h-[250px]
                                items-center justify-center
                            "
                        >
                            <p className="text-sm text-gray-500">
                                Loading email signatures...
                            </p>
                        </div>
                    ) : filteredEmailSignatures.length > 0 ? (
                        <EmailSignatureTable
                            emailSignatures={filteredEmailSignatures}
                        />
                    ) : hasActiveFilters ? (
                        /* FILTERED EMPTY STATE */

                        <div
                            className="
                                flex min-h-[300px] flex-col
                                items-center justify-center gap-3
                                px-4
                            "
                        >
                            <div
                                className="
                                    flex h-20 w-20 items-center
                                    justify-center rounded-full
                                    bg-gray-100 text-gray-400
                                "
                            >
                                <Mail
                                    size={36}
                                    strokeWidth={1.7}
                                />
                            </div>

                            <p className="text-center text-base font-medium text-gray-800">
                                No matching email signatures found
                            </p>

                            <p className="max-w-sm text-center text-sm text-gray-500">
                                No email signatures match your current
                                search or status filter. Try changing
                                your search or clearing the filters.
                            </p>

                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="
                                    mt-1 rounded-md bg-blue-500
                                    px-4 py-2 text-sm font-medium
                                    text-white transition-colors
                                    hover:bg-blue-600
                                "
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        /* ORIGINAL EMPTY STATE */

                        <div
                            className="
                                flex min-h-full flex-col
                                items-center justify-center
                                gap-3 px-4
                            "
                        >
                            <div
                                className="
                                    relative mt-30 mb-1
                                    flex h-24 w-24 shrink-0
                                    items-center justify-center
                                    rounded-full bg-gray-100
                                "
                            >
                                <div
                                    className="
                                        flex items-center justify-center
                                        text-gray-400
                                    "
                                >
                                    <Mail
                                        size={42}
                                        strokeWidth={1.7}
                                    />
                                </div>

                                <div
                                    className="
                                        absolute bottom-1 right-1
                                        flex h-7 w-7 items-center
                                        justify-center rounded-full
                                        bg-blue-500 text-white
                                    "
                                >
                                    <Plus className="h-4 w-4" />
                                </div>
                            </div>

                            <p
                                className="
                                    text-center text-base
                                    font-medium text-gray-800
                                "
                            >
                                Manage your email signatures
                            </p>

                            <p
                                className="
                                    max-w-sm text-center
                                    text-sm text-gray-500
                                "
                            >
                                Create and manage your email signatures,
                                customize signature content, configure
                                defaults for new messages and replies,
                                and maintain your professional email identity.
                            </p>

                            <div
                                className="
                                    mt-1 flex flex-wrap
                                    items-center justify-center gap-2.5
                                "
                            >
                                {canCreateEmailSignature && (
                                    <button
                                        type="button"
                                        onClick={handleCreateEmailSignature}
                                        className="
                                            flex items-center gap-2
                                            whitespace-nowrap rounded-md
                                            bg-blue-500 px-4 py-2
                                            text-sm font-medium text-white
                                            transition-colors hover:bg-blue-600
                                        "
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Email Signature
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        toast(
                                            "Email signature import is not configured yet."
                                        );
                                    }}
                                    className="
                                        flex items-center gap-2
                                        whitespace-nowrap rounded-md
                                        border border-gray-300 bg-white
                                        px-4 py-2 text-sm text-gray-700
                                        transition-colors hover:bg-gray-50
                                    "
                                >
                                    <Download className="h-4 w-4" />
                                    Import File
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
