
import React, {
    useEffect,
    useMemo,
} from "react";

import {
    useSelector,
    useDispatch,
} from "react-redux";

import {
    useSearchParams,
} from "react-router-dom";

import {
    Download,
    Plus,
} from "lucide-react";

import toast from "react-hot-toast";

import CompanyTable
    from "./CompanyTable";

import NavbarCompany
    from "../components/bars/nav/NavbarCompany";

import {
    fetchAllCompanies,
} from "../thunks/companyThunks";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import {
    setCompanyStatus,
    setSelectedCompanyView,
} from "../slices/companyViewSlice";

import {
    openModal,
} from "../../ui/uiSlice";

import InvoiceSkeleton
    from "../../../common/loader/InvoiceSkeleton";


// ============================================================
// COMPANY DASHBOARD
// ============================================================

export default function CompanyDashboard() {

    const dispatch = useDispatch();

    const [searchParams] =
        useSearchParams();


    // ============================================================
    // AUTH STATE
    // ============================================================

    const user = useSelector(
        (state) =>
            state.auth?.user
    );

    const isAuthenticated = useSelector(
        (state) =>
            state.auth?.isAuthenticated === true
    );

    const authChecking = useSelector(
        (state) =>
            state.auth?.authChecking === true
    );


    // ============================================================
    // PERMISSION STATE
    // ============================================================

    const permissions = useSelector(
        (state) =>
            state.menuPermission?.userPermissions || []
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
    // PERMISSION CHECK
    // ============================================================

    const hasPermission = (
        moduleName,
        actionName
    ) => {

        // --------------------------------------------------------
        // SUPER ADMIN / ADMIN
        // --------------------------------------------------------

        if (hasFullAccess) {
            return true;
        }

        // --------------------------------------------------------
        // PERMISSION ARRAY
        // --------------------------------------------------------

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


        // --------------------------------------------------------
        // SUPPORT BOTH:
        //
        // 1. Flat permission:
        //
        // {
        //     moduleName: "Companies",
        //     actionName: "CREATE",
        //     allowed: true
        // }
        //
        // 2. Grouped permission:
        //
        // {
        //     moduleName: "Companies",
        //     actions: [
        //         {
        //             actionName: "CREATE",
        //             allowed: true
        //         }
        //     ]
        // }
        // --------------------------------------------------------

        return permissions.some(
            (permission) => {

                // ==================================================
                // MODULE
                // ==================================================

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


                // ==================================================
                // ACTIVE STATUS
                // ==================================================

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


                // ==================================================
                // GROUPED ACTIONS
                // ==================================================

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


                // ==================================================
                // FLAT ACTION
                // ==================================================

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
    // COMPANY PERMISSIONS
    // ============================================================

    const canViewCompany =
        hasPermission(
            "Company Detail",
            "VIEW"
        );

    const canCreateCompany =
        hasPermission(
            "Company Detail",
            "CREATE"
        );


    // ============================================================
    // COMPANY STATE
    // ============================================================

    const companies = useSelector(
        (state) =>
            state.company?.companies || []
    );

    const loading = useSelector(
        (state) =>
            state.company?.loading || false
    );

    const error = useSelector(
        (state) =>
            state.company?.error
    );


    // ============================================================
    // COMPANY FILTER STATE
    // ============================================================

    const companyStatus = useSelector(
        (state) =>
            state.companyView?.companyStatus ||
            "ALL"
    );


    // ============================================================
    // LOAD CURRENT USER PERMISSIONS
    //
    // NOTE:
    //
    // Ideally this should happen in AuthSlice/bootstrap.
    // This fallback ensures CompanyDashboard can still
    // initialize permissions if AuthSlice has not done so.
    // ============================================================

    useEffect(() => {

        // --------------------------------------------------------
        // AUTH STILL CHECKING
        // --------------------------------------------------------

        if (authChecking) {
            return;
        }


        // --------------------------------------------------------
        // NOT AUTHENTICATED
        // --------------------------------------------------------

        if (!isAuthenticated) {
            return;
        }


        // --------------------------------------------------------
        // ADMIN / SUPER ADMIN
        //
        // No permission request required.
        // --------------------------------------------------------

        if (hasFullAccess) {
            return;
        }


        // --------------------------------------------------------
        // ALREADY LOADED
        // --------------------------------------------------------

        if (permissionsLoaded) {
            return;
        }


        // --------------------------------------------------------
        // CURRENTLY LOADING
        // --------------------------------------------------------

        if (permissionLoading) {
            return;
        }


        // --------------------------------------------------------
        // LOAD CURRENT USER EFFECTIVE PERMISSIONS
        // --------------------------------------------------------

        dispatch(
            getUserPermission()
        );

    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);


    // ============================================================
    // FETCH COMPANIES
    // ============================================================

    useEffect(() => {

        // --------------------------------------------------------
        // AUTH CHECKING
        // --------------------------------------------------------

        if (authChecking) {
            return;
        }


        // --------------------------------------------------------
        // NOT AUTHENTICATED
        // --------------------------------------------------------

        if (!isAuthenticated) {
            return;
        }


        // --------------------------------------------------------
        // STAFF / OTHER ROLE
        //
        // Wait until permissions are loaded.
        // --------------------------------------------------------

        if (!hasFullAccess) {

            if (!permissionsLoaded) {
                return;
            }

            if (permissionLoading) {
                return;
            }


            // ----------------------------------------------------
            // NO VIEW PERMISSION
            // ----------------------------------------------------

            if (!canViewCompany) {
                return;
            }
        }


        // --------------------------------------------------------
        // FETCH COMPANIES
        // --------------------------------------------------------

        dispatch(
            fetchAllCompanies()
        );

    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        canViewCompany,
        dispatch,
    ]);


    // ============================================================
    // SYNC URL STATUS → REDUX
    // ============================================================

    useEffect(() => {

        const urlStatus =
            searchParams.get(
                "companyStatus"
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
            setCompanyStatus(
                normalizedStatus
            )
        );


        const statusLabels = {

            ALL:
                "All Companies",

            ACTIVE:
                "Active Companies",

            INACTIVE:
                "Inactive Companies",

            DRAFT:
                "Draft Companies",

        };


        dispatch(
            setSelectedCompanyView(
                statusLabels[
                normalizedStatus
                ]
            )
        );

    }, [
        searchParams,
        dispatch,
    ]);


    // ============================================================
    // FILTER COMPANIES BY STATUS
    // ============================================================

    const filteredCompanies = useMemo(() => {

        const selectedStatus =
            String(
                companyStatus || "ALL"
            ).toUpperCase();


        if (
            selectedStatus === "ALL"
        ) {

            return companies;

        }


        return companies.filter(
            (company) => {

                const backendStatus =
                    String(
                        company?.status || ""
                    ).toUpperCase();


                return (
                    backendStatus ===
                    selectedStatus
                );

            }
        );

    }, [
        companies,
        companyStatus,
    ]);


    // ============================================================
    // CREATE COMPANY MODAL
    // ============================================================

    const handleCreateCompany = () => {

        // --------------------------------------------------------
        // CREATE PERMISSION
        // --------------------------------------------------------

        if (!canCreateCompany) {

            toast.error(
                "You do not have permission to create companies."
            );

            return;
        }


        // --------------------------------------------------------
        // OPEN MODAL
        // --------------------------------------------------------

        dispatch(
            openModal({
                type: "addCompany",
                data: null,
            })
        );

    };


    // ============================================================
    // AUTH CHECKING
    // ============================================================

    if (authChecking) {

        return (
            <InvoiceSkeleton />
        );

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

        return (
            <InvoiceSkeleton />
        );

    }


    // ============================================================
    // VIEW PERMISSION DENIED
    // ============================================================

    if (!canViewCompany) {

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

                <div
                    className="
                        text-center
                        px-6
                    "
                >

                    <div
                        className="
                            mx-auto
                            mb-4
                            w-16
                            h-16
                            rounded-full
                            bg-red-50
                            flex
                            items-center
                            justify-center
                            text-red-500
                            text-2xl
                            font-semibold
                        "
                    >
                        !
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
                            max-w-sm
                        "
                    >
                        You do not have permission
                        to view companies.
                    </p>

                </div>

            </div>
        );

    }


    // ============================================================
    // COMPANY LOADING
    // ============================================================

    if (loading) {

        return (
            <InvoiceSkeleton />
        );

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

            {/* =====================================================
                SINGLE PAGE SCROLLER
            ===================================================== */}

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
                        w-full
                    "
                >

                    {/* =================================================
                        COMPANY NAVBAR
                    ================================================= */}

                    <NavbarCompany />


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
                        COMPANY TABLE
                    ================================================= */}

                    {filteredCompanies.length > 0 ? (

                        <CompanyTable
                            companies={
                                filteredCompanies
                            }
                        />

                    ) : (

                        <div
                            className="
                                flex
                                flex-col
                                items-center
                                justify-center
                                py-16
                            "
                        >

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    text-gray-800
                                "
                            >
                                No companies found
                            </h2>


                            <p
                                className="
                                    mt-2
                                    text-sm
                                    text-gray-500
                                    text-center
                                    max-w-md
                                "
                            >

                                {companyStatus === "ALL"
                                    ? "There are no companies to display."
                                    : `There are no ${String(
                                        companyStatus
                                    ).toLowerCase()
                                    } companies.`}

                            </p>


                            {/* =================================================
                                ACTION BUTTONS
                            ================================================= */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    mt-6
                                "
                            >

                                {/* =================================================
                                    CREATE COMPANY
                                ================================================= */}

                                {canCreateCompany && (

                                    <button
                                        type="button"
                                        onClick={
                                            handleCreateCompany
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            bg-blue-500
                                            text-white
                                            px-4
                                            py-2
                                            rounded-md
                                            hover:bg-blue-600
                                            transition
                                        "
                                    >

                                        <Plus
                                            size={16}
                                        />

                                        Create New Company

                                    </button>

                                )}


                                {/* =================================================
                                    IMPORT
                                ================================================= */}

                                <button
                                    type="button"
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        border
                                        border-gray-300
                                        px-4
                                        py-2
                                        rounded-md
                                        hover:bg-gray-50
                                        transition
                                    "
                                >

                                    <Download
                                        size={16}
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