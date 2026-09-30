import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Plus,
    Download,
    Landmark,
} from "lucide-react";

import BankAccountTable from "./BankAccountTable";
import NavbarBankAccount from "../components/bars/nav/NavbarBankAccount";

import {
    fetchAllBankAccounts,
} from "../thunks/bankAccountThunks";

import {
    setBankAccountStatus,
    setSelectedBankAccountView,
} from "../slices/bankAccountViewSlice";

import { openModal } from "../../ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";
import BankAccountCreate from "../pages/BankAccountCreate";

export default function BankAccountDashboard() {

    const dispatch = useDispatch();

    // ============================================================
    // BANK ACCOUNT STATE
    // ============================================================

    const bankAccountsFromRedux = useSelector(
        (state) => state.bankAccount?.bankAccounts
    );

    const bankAccounts =
        bankAccountsFromRedux ?? [];

    const loading = useSelector(
        (state) =>
            state.bankAccount?.loading || false
    );

    const error = useSelector(
        (state) =>
            state.bankAccount?.error
    );

    // ============================================================
    // BANK ACCOUNT FILTER STATE
    // ============================================================

    const bankAccountStatus = useSelector(
        (state) =>
            state.bankAccountView?.bankAccountStatus ||
            "ALL"
    );

    // ============================================================
    // FETCH BANK ACCOUNTS
    // ============================================================

    useEffect(() => {

        console.log(
            "Fetching bank accounts..."
        );

        dispatch(
            fetchAllBankAccounts()
        );

    }, [dispatch]);

    // ============================================================
    // SYNC URL STATUS → REDUX
    // ============================================================

    useEffect(() => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const urlStatus =
            params.get("bankAccountStatus");

        if (!urlStatus) {
            return;
        }

        const normalizedStatus =
            String(urlStatus).toUpperCase();

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

    }, [dispatch]);

    // ============================================================
    // DEBUG
    // ============================================================

    useEffect(() => {

        console.log(
            "================================"
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
        bankAccounts,
        loading,
        error,
        bankAccountStatus,
    ]);

    // ============================================================
    // FILTER BANK ACCOUNTS BY STATUS
    // ============================================================

    const filteredBankAccounts = useMemo(() => {

        const selectedStatus =
            String(
                bankAccountStatus || "ALL"
            ).toUpperCase();

        // ========================================================
        // ALL
        // ========================================================

        if (selectedStatus === "ALL") {
            return bankAccounts;
        }

        // ========================================================
        // FILTER
        // ========================================================

        return bankAccounts.filter(
            (bankAccount) => {

                const backendStatus =
                    String(
                        bankAccount?.status || ""
                    ).toUpperCase();

                console.log(
                    "Bank Account:",
                    bankAccount?.accountName,
                    "| Backend Status:",
                    backendStatus,
                    "| Selected Status:",
                    selectedStatus
                );

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

    const handleCreateBankAccount = () => {

        console.log(
            "Opening Add Bank Account modal"
        );

        dispatch(
            openModal({
                type: "addBankAccount",
            })
        );

    };

    // ============================================================
    // LOADING
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

                                {/* CREATE BANK ACCOUNT */}

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

            {/* =========================================================
                BANK ACCOUNT CREATE / EDIT MODAL
            ========================================================= */}

            {/* 
                Keep this commented if your global Modal component
                already renders BankAccountCreate.

                <BankAccountCreate />
            */}

        </div>
    );
}