
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

import PartyTable from "../pages/partyTable";

import NavbarParty from "../components/NabBarParty";

import {
    fetchAllParties,
} from "../thunks/partyThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import {
    setPartyStatus,
    setSelectedPartyView,
} from "../slices/partyViewSlice";

import {
    openModal,
} from "../../ui/uiSlice";

import InvoiceSkeleton
    from "../../../common/loader/InvoiceSkeleton";


export default function PartyDashboard() {
    const dispatch = useDispatch();

    // ============================================================
    // AUTH STATE
    // ============================================================

    const user = useSelector(
        (state) => state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) => state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) => state.auth?.authChecking === true
    );

    // ============================================================
    // PERMISSION STATE
    // ============================================================

    const permissions = useSelector((state) =>
        Array.isArray(state.menuPermission?.userPermissions)
            ? state.menuPermission.userPermissions
            : []
    );

    const permissionLoading = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoading === true
    );

    const permissionsLoaded = useSelector(
        (state) =>
            state.menuPermission?.userPermissionsLoaded === true
    );

    // ============================================================
    // NORMALIZATION
    // ============================================================

    const normalizeModule = (value) =>
        String(value ?? "").trim().toLowerCase();

    const normalizeAction = (value) =>
        String(value ?? "").trim().toUpperCase();

    // ============================================================
    // USER ROLE
    // ============================================================

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

    // ============================================================
    // PERMISSION HELPER
    // ============================================================

    const hasPermission = (moduleName, actionName) => {
        if (hasFullAccess) {
            return true;
        }

        if (!Array.isArray(permissions)) {
            return false;
        }

        const requestedModule = normalizeModule(moduleName);
        const requestedAction = normalizeAction(actionName);

        return permissions.some((permission) => {
            const permissionModule = normalizeModule(
                permission?.moduleName ||
                permission?.module?.moduleName ||
                permission?.module?.name ||
                ""
            );

            if (permissionModule !== requestedModule) {
                return false;
            }

            if (permission?.active === false) {
                return false;
            }

            if (normalizeAction(permission?.status) === "INACTIVE") {
                return false;
            }

            // --------------------------------------------------------
            // ACTION ARRAY
            // --------------------------------------------------------

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
                        action?.allowed === true ||
                        action?.allowed === "true";

                    if (action?.active === false) {
                        return false;
                    }

                    if (normalizeAction(action?.status) === "INACTIVE") {
                        return false;
                    }

                    return (
                        permissionAction === requestedAction &&
                        allowed
                    );
                });
            }

            // --------------------------------------------------------
            // FLAT ACTION
            // --------------------------------------------------------

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
    };

    // ============================================================
    // PARTY PERMISSIONS
    // ============================================================

    const canViewParty = hasPermission("Parties", "VIEW");

    const canCreateParty = hasPermission("Parties", "CREATE");

    // ============================================================
    // PARTY REDUX STATE
    // ============================================================

    const partiesFromRedux = useSelector(
        (state) => state.party?.parties
    );

    const parties = partiesFromRedux ?? [];

    const loading = useSelector(
        (state) => state.party?.loading ?? false
    );

    const error = useSelector(
        (state) => state.party?.error
    );

    // ============================================================
    // PARTY VIEW STATE
    // ============================================================

    const partyStatus = useSelector(
        (state) => state.partyView?.partyStatus ?? "ALL"
    );

    const search = useSelector(
        (state) => state.partyView?.search ?? ""
    );

    // ============================================================
    // LOAD CURRENT USER PERMISSIONS
    // ============================================================

    useEffect(() => {
        if (authChecking || !isAuthenticated) {
            return;
        }

        // Admins have full access.
        if (hasFullAccess) {
            return;
        }

        if (permissionsLoaded || permissionLoading) {
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

    // ============================================================
    // FETCH PARTIES
    // ============================================================

    useEffect(() => {
        if (authChecking || !isAuthenticated) {
            return;
        }

        // Wait for effective permissions for normal users.
        if (!hasFullAccess) {
            if (!permissionsLoaded || permissionLoading) {
                return;
            }

            if (!canViewParty) {
                return;
            }
        }

        dispatch(fetchAllParties());
    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        canViewParty,
        dispatch,
    ]);

    // ============================================================
    // SYNC URL STATUS TO REDUX
    // Example: /parties?partyStatus=ACTIVE
    // ============================================================

    useEffect(() => {
        const params = new URLSearchParams(
            window.location.search
        );

        const urlStatus = params.get("partyStatus");

        if (!urlStatus) {
            return;
        }

        const normalizedStatus = urlStatus
            .trim()
            .toUpperCase();

        const validStatuses = [
            "ALL",
            "ACTIVE",
            "INACTIVE",
            "DRAFT",
        ];

        if (!validStatuses.includes(normalizedStatus)) {
            return;
        }

        const statusLabels = {
            ALL: "All Parties",
            ACTIVE: "Active Parties",
            INACTIVE: "Inactive Parties",
            DRAFT: "Draft Parties",
        };

        dispatch(setPartyStatus(normalizedStatus));

        dispatch(
            setSelectedPartyView(statusLabels[normalizedStatus])
        );
    }, [dispatch]);

    // ============================================================
    // FILTER PARTIES BY STATUS AND SEARCH
    // ============================================================

    const filteredParties = useMemo(() => {
        const selectedStatus = String(
            partyStatus || "ALL"
        ).toUpperCase();

        const normalizedSearch = String(search || "")
            .trim()
            .toLowerCase();

        return parties.filter((party) => {
            // --------------------------------------------------------
            // STATUS FILTER
            // --------------------------------------------------------

            const backendStatus = String(
                party?.status || ""
            ).toUpperCase();

            if (
                selectedStatus !== "ALL" &&
                backendStatus !== selectedStatus
            ) {
                return false;
            }

            // --------------------------------------------------------
            // SEARCH FILTER
            // --------------------------------------------------------

            if (!normalizedSearch) {
                return true;
            }

            const searchableFields = [
                party?.partyCode,
                party?.partyType,
                party?.companyName,
                party?.contactPerson,
                party?.email,
                party?.mobile,
                party?.alternateMobile,
                party?.gstNumber,
                party?.panNumber,
                party?.status,
            ];

            return searchableFields.some((value) =>
                String(value ?? "")
                    .toLowerCase()
                    .includes(normalizedSearch)
            );
        });
    }, [
        parties,
        partyStatus,
        search,
    ]);

    // ============================================================
    // OPEN CREATE PARTY MODAL
    // ============================================================

    const handleCreateParty = () => {
        if (!isAuthenticated) {
            return;
        }

        if (
            !hasFullAccess &&
            (permissionLoading || !permissionsLoaded)
        ) {
            return;
        }

        if (!canCreateParty) {
            toast.error(
                "You do not have permission to create parties."
            );

            return;
        }

        dispatch(
            openModal({
                type: "addParty",
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
        (permissionLoading || !permissionsLoaded)
    ) {
        return <InvoiceSkeleton />;
    }

    // ============================================================
    // VIEW PERMISSION DENIED
    // ============================================================

    if (!canViewParty) {
        return (
            <div
                className="
          flex
          h-screen
          items-center
          justify-center
          bg-gray-50
          font-sans
        "
            >
                <div className="px-6 text-center">
                    <div
                        className="
              mx-auto
              mb-4
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-red-50
              text-2xl
              font-semibold
              text-red-500
            "
                    >
                        !
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Access Denied
                    </h2>

                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                        You do not have permission to view parties.
                    </p>
                </div>
            </div>
        );
    }

    // ============================================================
    // PARTY LOADING
    // ============================================================

    if (loading && parties.length === 0) {
        return <InvoiceSkeleton />;
    }

    // ============================================================
    // DASHBOARD
    // ============================================================

    return (
        <div
            className="
        flex
        h-screen
        overflow-hidden
        bg-gray-50
        font-sans
        text-[13px]
      "
        >
            <div
                className="
          min-h-0
          flex-1
          overflow-y-auto
          bg-white
        "
            >
                <div className="w-full max-w-30xl px-2 py-5">

                    {/* PARTY NAVBAR */}

                    <NavbarParty />

                    {/* ERROR */}

                    {error && (
                        <div
                            className="
                mx-2
                mt-4
                rounded-md
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-600
              "
                        >
                            {typeof error === "string"
                                ? error
                                : "Failed to load parties."}
                        </div>
                    )}

                    {/* PARTY TABLE / EMPTY STATE */}

                    {filteredParties.length > 0 ? (
                        <PartyTable parties={filteredParties} />
                    ) : (
                        <div
                            className="
                flex
                min-h-full
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
                  mt-30
                  mb-1
                  flex
                  h-24
                  w-24
                  flex-shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                "
                            >
                                <div className="text-4xl text-gray-400">
                                    P
                                </div>

                                <div
                                    className="
                    absolute
                    bottom-1
                    right-1
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-500
                    text-white
                  "
                                >
                                    <Plus className="h-4 w-4" />
                                </div>
                            </div>

                            {/* EMPTY STATE TITLE */}

                            <p className="text-center text-base font-medium text-gray-800">
                                Every relationship starts with a party
                            </p>

                            {/* EMPTY STATE DESCRIPTION */}

                            <p className="max-w-sm text-center text-sm text-gray-500">
                                Create and manage your suppliers and other
                                business parties in one place.
                            </p>

                            {/* ACTION BUTTONS */}

                            <div
                                className="
                  mt-1
                  flex
                  flex-wrap
                  items-center
                  justify-center
                  gap-2.5
                "
                            >
                                {canCreateParty && (
                                    <button
                                        type="button"
                                        onClick={handleCreateParty}
                                        className="
                      flex
                      items-center
                      gap-2
                      whitespace-nowrap
                      rounded-md
                      bg-blue-500
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-white
                      transition-colors
                      hover:bg-blue-600
                    "
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create New Party
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        toast("Party import is not configured yet.");
                                    }}
                                    className="
                    flex
                    items-center
                    gap-2
                    whitespace-nowrap
                    rounded-md
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-2
                    text-sm
                    text-gray-700
                    transition-colors
                    hover:bg-gray-50
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

            {/* GLOBAL MODAL HANDLES addParty */}
        </div>
    );
}