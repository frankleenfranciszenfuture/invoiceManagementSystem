
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
    Landmark,
} from "lucide-react";

import toast from "react-hot-toast";

import BankAccountTable
    from "./BankAccountTable";

import NavbarBankAccount
    from "../components/bars/nav/NavbarBankAccount";

import {
    fetchAllBankAccounts,
} from "../thunks/bankAccountThunks";

import {
    setBankAccountStatus,
    setSelectedBankAccountView,
} from "../slices/bankAccountViewSlice";

import {
    clearError,
} from "../slices/bankAccountSlice";

import {
    openModal,
} from "../../ui/uiSlice";

import {
    getUserPermission,
} from "../../menuPermission/thunks/menuPermissionThunks";

import InvoiceSkeleton
    from "../../../common/loader/InvoiceSkeleton";


export default function BankAccountDashboard() {

    const dispatch = useDispatch();


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
            Array.isArray(
                state.menuPermission
                    ?.userPermissions
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
    // NORMALIZE HELPERS
    // ============================================================

    const normalizeModule = (
        value
    ) =>
        String(value ?? "")
            .trim()
            .toLowerCase();


    const normalizeAction = (
        value
    ) =>
        String(value ?? "")
            .trim()
            .toUpperCase();


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
        normalizeAction(
            roleName
        );


    const isSuperAdmin =
        normalizedRole ===
        "SUPER_ADMIN";


    const isAdmin =
        normalizedRole ===
        "ADMIN";


    const hasFullAccess =
        isSuperAdmin ||
        isAdmin;


    // ============================================================
    // HAS PERMISSION
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
            normalizeModule(
                moduleName
            );


        const requestedAction =
            normalizeAction(
                actionName
            );


        // --------------------------------------------------------
        // FIND PERMISSION
        // --------------------------------------------------------

        return permissions.some(
            (permission) => {

                // ==================================================
                // MODULE
                // ==================================================

                const permissionModule =
                    normalizeModule(
                        permission?.moduleName ||
                        permission?.module?.moduleName ||
                        permission?.module?.name ||
                        ""
                    );


                if (
                    permissionModule !==
                    requestedModule
                ) {
                    return false;
                }


                // ==================================================
                // MODULE ACTIVE STATUS
                // ==================================================

                if (
                    permission?.active === false
                ) {
                    return false;
                }


                if (
                    normalizeAction(
                        permission?.status
                    ) ===
                    "INACTIVE"
                ) {
                    return false;
                }


                // ==================================================
                // ACTION ARRAY
                // ==================================================

                if (
                    Array.isArray(
                        permission?.actions
                    )
                ) {

                    return permission.actions.some(
                        (action) => {

                            // --------------------------------------
                            // STRING ACTION
                            // --------------------------------------

                            if (
                                typeof action ===
                                "string"
                            ) {

                                return (
                                    normalizeAction(
                                        action
                                    ) ===
                                    requestedAction
                                );

                            }


                            // --------------------------------------
                            // OBJECT ACTION
                            // --------------------------------------

                            const permissionAction =
                                normalizeAction(
                                    action?.actionName ||
                                    action?.action?.actionName ||
                                    action?.action?.name ||
                                    action?.name ||
                                    ""
                                );


                            const allowed =
                                action?.allowed === true ||
                                action?.allowed === "true";


                            // --------------------------------------
                            // ACTION ACTIVE STATUS
                            // --------------------------------------

                            if (
                                action?.active === false
                            ) {
                                return false;
                            }


                            if (
                                normalizeAction(
                                    action?.status
                                ) ===
                                "INACTIVE"
                            ) {
                                return false;
                            }


                            return (
                                permissionAction ===
                                requestedAction &&
                                allowed
                            );

                        }
                    );

                }


                // ==================================================
                // DIRECT / FLAT ACTION
                // ==================================================

                const permissionAction =
                    normalizeAction(
                        permission?.actionName ||
                        permission?.action?.actionName ||
                        permission?.action?.name ||
                        ""
                    );


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
    // BANK ACCOUNT PERMISSIONS
    // ============================================================

    const canViewBankAccount =
        hasPermission(
            "BankAccounts",
            "VIEW"
        );


    const canCreateBankAccount =
        hasPermission(
            "BankAccounts",
            "CREATE"
        );


    // ============================================================
    // BANK ACCOUNT STATE
    // ============================================================

    const bankAccountsFromRedux =
        useSelector(
            (state) =>
                state.bankAccount?.bankAccounts
        );


    const bankAccounts =
        bankAccountsFromRedux ?? [];


    const loading =
        useSelector(
            (state) =>
                state.bankAccount?.loading ||
                false
        );


    const error =
        useSelector(
            (state) =>
                state.bankAccount?.error
        );


    // ============================================================
    // BANK ACCOUNT FILTER STATE
    // ============================================================

    const bankAccountStatus =
        useSelector(
            (state) =>
                state.bankAccountView
                    ?.bankAccountStatus ||
                "ALL"
        );


    // ============================================================
    // LOAD CURRENT USER PERMISSIONS
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
    // FETCH BANK ACCOUNTS
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

            if (!canViewBankAccount) {
                return;
            }

        }


        // --------------------------------------------------------
        // FETCH BANK ACCOUNTS
        // --------------------------------------------------------

        dispatch(
            fetchAllBankAccounts()
        );

    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        canViewBankAccount,
        dispatch,
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
                "bankAccountStatus"
            );


        if (!urlStatus) {
            return;
        }


        const normalizedStatus =
            String(
                urlStatus
            ).toUpperCase();


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
            setBankAccountStatus(
                normalizedStatus
            )
        );


        const statusLabels = {

            ALL:
                "All Bank Accounts",

            ACTIVE:
                "Active Bank Accounts",

            INACTIVE:
                "Inactive Bank Accounts",

            DRAFT:
                "Draft Bank Accounts",

        };


        dispatch(
            setSelectedBankAccountView(
                statusLabels[
                normalizedStatus
                ]
            )
        );

    }, [
        dispatch,
    ]);


    // ============================================================
    // DEBUG
    // ============================================================

    useEffect(() => {

        console.log(
            "================================"
        );

        console.log(
            "BANK ACCOUNT USER:",
            user
        );

        console.log(
            "BANK ACCOUNT ROLE:",
            normalizedRole
        );

        console.log(
            "BANK ACCOUNT FULL ACCESS:",
            hasFullAccess
        );

        console.log(
            "BANK ACCOUNT PERMISSIONS LOADING:",
            permissionLoading
        );

        console.log(
            "BANK ACCOUNT PERMISSIONS LOADED:",
            permissionsLoaded
        );

        console.log(
            "BANK ACCOUNT PERMISSIONS:",
            permissions
        );

        console.log(
            "BANK ACCOUNT VIEW PERMISSION:",
            canViewBankAccount
        );

        console.log(
            "BANK ACCOUNT CREATE PERMISSION:",
            canCreateBankAccount
        );

        console.log(
            "BANK ACCOUNTS FROM REDUX:",
            bankAccounts
        );

        console.log(
            "BANK ACCOUNT LOADING:",
            loading
        );

        console.log(
            "BANK ACCOUNT ERROR:",
            error
        );

        console.log(
            "BANK ACCOUNT STATUS:",
            bankAccountStatus
        );

        console.log(
            "================================"
        );

    }, [
        user,
        normalizedRole,
        hasFullAccess,
        permissionLoading,
        permissionsLoaded,
        permissions,
        canViewBankAccount,
        canCreateBankAccount,
        bankAccounts,
        loading,
        error,
        bankAccountStatus,
    ]);


    // ============================================================
    // CLEAR ERROR
    // ============================================================

    useEffect(() => {

        if (!error) {
            return;
        }


        const timer =
            setTimeout(() => {

                dispatch(
                    clearError()
                );

            }, 2000);


        return () =>
            clearTimeout(timer);

    }, [
        error,
        dispatch,
    ]);


    // ============================================================
    // FILTER BANK ACCOUNTS BY STATUS
    // ============================================================

    const filteredBankAccounts =
        useMemo(() => {

            const selectedStatus =
                String(
                    bankAccountStatus ||
                    "ALL"
                ).toUpperCase();


            // ====================================================
            // ALL
            // ====================================================

            if (
                selectedStatus ===
                "ALL"
            ) {
                return bankAccounts;
            }


            // ====================================================
            // FILTER
            // ====================================================

            return bankAccounts.filter(
                (bankAccount) => {

                    const backendStatus =
                        String(
                            bankAccount?.status ||
                            ""
                        ).toUpperCase();


                    return (
                        backendStatus ===
                        selectedStatus
                    );

                }
            );

        }, [
            bankAccounts,
            bankAccountStatus,
        ]);


    // ============================================================
    // OPEN CREATE BANK ACCOUNT MODAL
    // ============================================================

    const handleCreateBankAccount =
        () => {

            // ----------------------------------------------------
            // AUTH CHECK
            // ----------------------------------------------------

            if (!isAuthenticated) {
                return;
            }


            // ----------------------------------------------------
            // PERMISSION LOADING
            // ----------------------------------------------------

            if (
                !hasFullAccess &&
                (
                    permissionLoading ||
                    !permissionsLoaded
                )
            ) {

                return;
            }


            // ----------------------------------------------------
            // CREATE PERMISSION
            // ----------------------------------------------------

            if (!canCreateBankAccount) {

                toast.error(
                    "You do not have permission to create bank accounts."
                );

                return;
            }


            // ----------------------------------------------------
            // OPEN MODAL
            // ----------------------------------------------------

            dispatch(
                openModal({
                    type:
                        "addBankAccount",
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

    if (!canViewBankAccount) {

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
                        to view bank accounts.
                    </p>

                </div>

            </div>
        );

    }


    // ============================================================
    // BANK ACCOUNT LOADING
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
                        BANK ACCOUNT NAVBAR
                    ================================================= */}

                    <NavbarBankAccount />


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
                        BANK ACCOUNT TABLE / EMPTY STATE
                    ================================================= */}

                    {filteredBankAccounts.length > 0 ? (

                        <BankAccountTable
                            bankAccounts={
                                filteredBankAccounts
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

                            {/* =================================================
                                EMPTY STATE ICON
                            ================================================= */}

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
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >

                                    <Landmark
                                        size={42}
                                        strokeWidth={1.7}
                                    />

                                </div>


                                <div
                                    className="
                                        absolute
                                        bottom-1
                                        right-1
                                        w-7
                                        h-7
                                        rounded-full
                                        bg-blue-500
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


                            {/* =================================================
                                EMPTY STATE TITLE
                            ================================================= */}

                            <p
                                className="
                                    text-base
                                    font-medium
                                    text-gray-800
                                    text-center
                                "
                            >
                                Every setup starts with a bank account
                            </p>


                            {/* =================================================
                                EMPTY STATE DESCRIPTION
                            ================================================= */}

                            <p
                                className="
                                    text-sm
                                    text-gray-500
                                    text-center
                                    max-w-sm
                                "
                            >
                                Create and manage your bank accounts
                                in one place.
                            </p>


                            {/* =================================================
                                ACTION BUTTONS
                            ================================================= */}

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

                                {/* =================================================
                                    CREATE BANK ACCOUNT
                                ================================================= */}

                                {canCreateBankAccount && (

                                    <button
                                        type="button"
                                        onClick={
                                            handleCreateBankAccount
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            bg-blue-500
                                            text-white
                                            text-sm
                                            font-medium
                                            px-4
                                            py-2
                                            rounded-md
                                            hover:bg-blue-600
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

                                        Create New Bank Account

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


            {/* =========================================================
                BANK ACCOUNT CREATE / EDIT MODAL
            ========================================================= */}

            {/*
                Global Modal handles BankAccountCreate.
            */}

        </div>
    );

}
