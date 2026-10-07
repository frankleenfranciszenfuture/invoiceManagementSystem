import React, {
    useEffect,
    useMemo,
} from "react";

import {
    useSelector,
    useDispatch,
} from "react-redux";

import {
    Plus,
    Download,
} from "lucide-react";

import toast from "react-hot-toast";

import SizeTable from "./SizeTable";
import NavbarSize from "../components/bars/nav/NavbarSize";

import {
    fetchAllSizes,
} from "../thunks/sizeThunks";

import {
    setSizeStatus,
    setSelectedSizeView,
} from "../slices/sizeSlice";

import {
    openModal,
} from "../../ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

export default function SizeDashboard() {

    const dispatch = useDispatch();

    // ============================================================
    // AUTH
    // ============================================================

    const user = useSelector(
        (state) => state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated
    );

    const authChecking = useSelector(
        (state) => state.auth?.authChecking
    );

    // ============================================================
    // USER PERMISSIONS
    // ============================================================

    const permissions = useSelector(
        (state) =>
            Array.isArray(
                state.menuPermission?.userPermissions
            )
                ? state.menuPermission.userPermissions
                : []
    );

    const permissionLoading = useSelector(
        (state) =>
            state.menuPermission
                ?.userPermissionsLoading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission
                ?.userPermissionsLoaded === true
    );

    // ============================================================
    // ROLE
    // ============================================================

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole =
        String(roleName)
            .trim()
            .toUpperCase();

    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";

    const isAdmin =
        normalizedRole === "ADMIN";

    const hasFullAccess =
        isSuperAdmin || isAdmin;

    // ============================================================
    // PERMISSION CHECKER
    //
    // Supports:
    //
    // FLAT:
    // {
    //     moduleName: "Sizes",
    //     actionName: "VIEW",
    //     allowed: true
    // }
    //
    // GROUPED:
    // {
    //     moduleName: "Sizes",
    //     actions: [
    //         {
    //             actionName: "VIEW",
    //             allowed: true
    //         }
    //     ]
    // }
    // ============================================================

    const hasPermission = (
        moduleName,
        actionName
    ) => {

        // ADMIN / SUPER_ADMIN
        if (hasFullAccess) {
            return true;
        }

        if (!Array.isArray(permissions)) {
            return false;
        }

        const requestedModule =
            String(moduleName)
                .trim()
                .toLowerCase();

        const requestedAction =
            String(actionName)
                .trim()
                .toUpperCase();

        return permissions.some(
            (permission) => {

                const permissionModule =
                    String(
                        permission?.moduleName ||
                        permission?.module?.moduleName ||
                        permission?.module?.name ||
                        ""
                    )
                        .trim()
                        .toLowerCase();

                if (
                    permissionModule !==
                    requestedModule
                ) {
                    return false;
                }

                // =================================================
                // INACTIVE MODULE PERMISSION
                // =================================================

                if (
                    permission?.active === false
                ) {
                    return false;
                }

                if (
                    String(
                        permission?.status || ""
                    )
                        .trim()
                        .toUpperCase() ===
                    "INACTIVE"
                ) {
                    return false;
                }

                // =================================================
                // GROUPED PERMISSIONS
                // =================================================

                if (
                    Array.isArray(
                        permission?.actions
                    )
                ) {

                    return permission.actions.some(
                        (action) => {

                            const permissionAction =
                                String(
                                    action?.actionName ||
                                    action?.action?.actionName ||
                                    action?.action?.name ||
                                    ""
                                )
                                    .trim()
                                    .toUpperCase();

                            const allowed =
                                action?.allowed === true ||
                                action?.allowed === "true";

                            return (
                                permissionAction ===
                                requestedAction &&
                                allowed
                            );
                        }
                    );
                }

                // =================================================
                // FLAT PERMISSIONS
                // =================================================

                const permissionAction =
                    String(
                        permission?.actionName ||
                        permission?.action?.actionName ||
                        permission?.action?.name ||
                        ""
                    )
                        .trim()
                        .toUpperCase();

                const allowed =
                    permission?.allowed === true ||
                    permission?.allowed === "true";

                return (
                    permissionAction ===
                    requestedAction &&
                    allowed
                );
            }
        );
    };

    // ============================================================
    // SIZE PERMISSIONS
    // ============================================================

    const canViewSize =
        hasPermission(
            "Sizes",
            "VIEW"
        );

    const canCreateSize =
        hasPermission(
            "Sizes",
            "CREATE"
        );

    // ============================================================
    // SIZE STATE
    // ============================================================

    const sizesFromRedux =
        useSelector(
            (state) =>
                state.size?.sizes
        );

    const sizes =
        sizesFromRedux ?? [];

    const loading =
        useSelector(
            (state) =>
                state.size?.loading || false
        );

    const error =
        useSelector(
            (state) =>
                state.size?.error
        );

    // ============================================================
    // SIZE FILTER STATE
    // ============================================================

    const sizeStatus =
        useSelector(
            (state) =>
                state.sizeView?.sizeStatus ||
                "ALL"
        );

    // ============================================================
    // FETCH SIZES
    //
    // IMPORTANT:
    // STAFF must have VIEW permission before API call.
    // ============================================================

    useEffect(() => {

        if (authChecking) {
            return;
        }

        if (!isAuthenticated) {
            return;
        }

        // ADMIN / SUPER_ADMIN
        // can directly fetch.
        if (!hasFullAccess) {

            // Wait for permission request.
            if (permissionLoading) {
                return;
            }

            // Wait until permission state is initialized.
            if (!permissionsLoaded) {
                return;
            }

            // No VIEW permission.
            if (!canViewSize) {
                return;
            }
        }

        dispatch(
            fetchAllSizes()
        );

    }, [
        dispatch,
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionLoading,
        permissionsLoaded,
        canViewSize,
    ]);

    // ============================================================
    // SYNC URL STATUS → REDUX
    // ============================================================

    useEffect(() => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const urlStatus =
            params.get(
                "sizeStatus"
            );

        if (!urlStatus) {
            return;
        }

        const normalizedStatus =
            String(urlStatus)
                .toUpperCase();

        const validStatuses = [
            "ALL",
            "ACTIVE",
            "INACTIVE",
            "DRAFT",
        ];

        if (
            !validStatuses.includes(
                normalizedStatus
            )
        ) {
            return;
        }

        dispatch(
            setSizeStatus(
                normalizedStatus
            )
        );

        const statusLabels = {
            ALL:
                "All Sizes",

            ACTIVE:
                "Active Sizes",

            INACTIVE:
                "Inactive Sizes",

            DRAFT:
                "Draft Sizes",
        };

        dispatch(
            setSelectedSizeView(
                statusLabels[
                normalizedStatus
                ]
            )
        );

    }, [dispatch]);

    // ============================================================
    // FILTER SIZES BY STATUS
    // ============================================================

    const filteredSizes =
        useMemo(() => {

            const selectedStatus =
                String(
                    sizeStatus ||
                    "ALL"
                ).toUpperCase();

            // ====================================================
            // ALL
            // ====================================================

            if (
                selectedStatus === "ALL"
            ) {
                return sizes;
            }

            // ====================================================
            // FILTER
            // ====================================================

            return sizes.filter(
                (size) => {

                    const backendStatus =
                        String(
                            size?.status ||
                            ""
                        ).toUpperCase();

                    return (
                        backendStatus ===
                        selectedStatus
                    );
                }
            );

        }, [
            sizes,
            sizeStatus,
        ]);

    // ============================================================
    // OPEN CREATE SIZE MODAL
    // ============================================================

    const handleCreateSize = () => {

        if (
            !hasFullAccess &&
            !permissionsLoaded
        ) {

            toast.error(
                "Permissions are still loading. Please try again."
            );

            return;
        }

        if (!canCreateSize) {

            toast.error(
                "You do not have permission to create sizes."
            );

            return;
        }

        dispatch(
            openModal({
                type: "addSize",
            })
        );
    };

    // ============================================================
    // AUTH CHECKING
    // ============================================================

    if (authChecking) {
        return <InvoiceSkeleton />;
    }

    // ============================================================
    // NOT AUTHENTICATED
    // ============================================================

    if (!isAuthenticated) {
        return null;
    }

    // ============================================================
    // PERMISSION LOADING
    // ============================================================

    if (
        !hasFullAccess &&
        (
            permissionLoading ||
            !permissionsLoaded
        )
    ) {

        return <InvoiceSkeleton />;
    }

    // ============================================================
    // VIEW PERMISSION DENIED
    // ============================================================

    if (
        !hasFullAccess &&
        !canViewSize
    ) {

        return (
            <div
                className="
                    flex
                    h-screen
                    bg-gray-50
                    font-sans
                    text-[13px]
                    overflow-hidden
                "
            >

                <div
                    className="
                        flex-1
                        flex
                        items-center
                        justify-center
                    "
                >

                    <div
                        className="
                            text-center
                            px-6
                        "
                    >

                        <div
                            className="
                                w-14
                                h-14
                                rounded-full
                                bg-red-50
                                flex
                                items-center
                                justify-center
                                mx-auto
                                mb-4
                            "
                        >

                            <span
                                className="
                                    text-red-500
                                    text-xl
                                    font-semibold
                                "
                            >
                                !
                            </span>

                        </div>

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-800
                            "
                        >
                            Access Denied
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-gray-500
                            "
                        >
                            You do not have permission
                            to view sizes.
                        </p>

                    </div>

                </div>

            </div>
        );
    }

    // ============================================================
    // SIZE API LOADING
    // ============================================================

    if (loading) {
        return <InvoiceSkeleton />;
    }

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div
            className="
                flex
                h-screen
                bg-gray-50
                font-sans
                text-[13px]
                overflow-hidden
            "
        >

            <div
                className="
                    flex-1
                    min-h-0
                    bg-white
                    overflow-y-auto
                "
            >

                <div
                    className="
                        px-2
                        py-5
                        max-w-30xl
                        w-full
                    "
                >

                    {/* =================================================
                        SIZE NAVBAR
                    ================================================= */}

                    <NavbarSize />

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div
                            className="
                                mx-2
                                mt-4
                                px-4
                                py-3
                                rounded-md
                                border
                                border-red-200
                                bg-red-50
                                text-sm
                                text-red-600
                            "
                        >
                            {error}
                        </div>
                    )}

                    {/* =================================================
                        SIZE TABLE / EMPTY STATE
                    ================================================= */}

                    {filteredSizes.length > 0 ? (

                        <SizeTable
                            sizes={
                                filteredSizes
                            }
                        />

                    ) : (

                        <div
                            className="
                                min-h-full
                                flex
                                flex-col
                                items-center
                                justify-center
                                gap-3
                                px-4
                            "
                        >

                            {/* EMPTY STATE ICON */}

                            <div
                                className="
                                    relative
                                    w-24
                                    h-24
                                    rounded-full
                                    bg-gray-100
                                    flex
                                    items-center
                                    justify-center
                                    mb-1
                                    flex-shrink-0
                                    mt-30
                                "
                            >

                                <div
                                    className="
                                        text-gray-400
                                        text-4xl
                                    "
                                >
                                    S
                                </div>

                                <div
                                    className="
                                        absolute
                                        bottom-1
                                        right-1
                                        w-7
                                        h-7
                                        rounded-full
                                        bg-blue-600
                                        flex
                                        items-center
                                        justify-center
                                        text-white
                                    "
                                >

                                    <Plus
                                        className="
                                            w-4
                                            h-4
                                        "
                                    />

                                </div>

                            </div>

                            {/* EMPTY STATE TITLE */}

                            <p
                                className="
                                    text-base
                                    font-medium
                                    text-gray-800
                                    text-center
                                "
                            >
                                Every product needs a size
                            </p>

                            {/* EMPTY STATE DESCRIPTION */}

                            <p
                                className="
                                    text-sm
                                    text-gray-500
                                    text-center
                                    max-w-sm
                                "
                            >
                                Create and manage your sizes
                                in one place.
                            </p>

                            {/* ACTION BUTTONS */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2.5
                                    mt-1
                                    flex-wrap
                                    justify-center
                                "
                            >

                                {/* CREATE SIZE */}

                                {canCreateSize && (

                                    <button
                                        type="button"
                                        onClick={
                                            handleCreateSize
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            bg-blue-600
                                            text-white
                                            text-sm
                                            font-medium
                                            px-4
                                            py-2
                                            rounded-md
                                            hover:bg-blue-700
                                            transition-colors
                                            whitespace-nowrap
                                        "
                                    >

                                        <Plus
                                            className="
                                                w-4
                                                h-4
                                            "
                                        />

                                        Create New Size

                                    </button>

                                )}

                                {/* IMPORT */}

                                <button
                                    type="button"
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        bg-white
                                        text-gray-700
                                        text-sm
                                        border
                                        border-gray-300
                                        px-4
                                        py-2
                                        rounded-md
                                        hover:bg-gray-50
                                        transition-colors
                                        whitespace-nowrap
                                    "
                                >

                                    <Download
                                        className="
                                            w-4
                                            h-4
                                        "
                                    />

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