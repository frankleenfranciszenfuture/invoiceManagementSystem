import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Download } from "lucide-react";

import TaxMasterTable from "./TaxMasterTable";
import NavbarTaxMaster from "../components/bars/nav/NavbarTaxMaster";

import { fetchAllTaxMasters } from "../thunks/taxMasterThunks";

import {
    setTaxMasterStatus,
    setSelectedTaxMasterView,
} from "../slices/taxMasterViewSlice";

import { openModal } from "../../../module/ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";
import TaxMasterCreate from "./taxMasterCreate";

export default function TaxMasterDashboard() {

    const dispatch = useDispatch();

    // ============================================================
    // TAX MASTER STATE
    // ============================================================

    // const taxMasters = useSelector(
    //     (state) => state.taxMaster?.taxMasters || []
    // );

    const taxMastersFromRedux = useSelector(
        (state) => state.taxMaster?.taxMasters
    );

    const taxMasters = taxMastersFromRedux ?? [];

    const loading = useSelector(
        (state) => state.taxMaster?.loading || false
    );

    const error = useSelector(
        (state) => state.taxMaster?.error
    );

    // ============================================================
    // TAX MASTER FILTER STATE
    // ============================================================

    const taxMasterStatus = useSelector(
        (state) =>
            state.taxMasterView?.taxMasterStatus || "ALL"
    );

    // ============================================================
    // FETCH TAX MASTERS
    // ============================================================

    useEffect(() => {

        console.log("Fetching tax masters...");

        dispatch(fetchAllTaxMasters());

    }, [dispatch]);

    // ============================================================
    // SYNC URL STATUS → REDUX
    // ============================================================

    /*
     * If your NavbarTaxMaster/sidebar uses:
     *
     * ?taxMasterStatus=ACTIVE
     *
     * then this keeps Redux synchronized with the URL.
     *
     * If you are not using URL filtering for Tax Master,
     * this effect can be removed.
     */

    useEffect(() => {

        const params = new URLSearchParams(
            window.location.search
        );

        const urlStatus =
            params.get("taxMasterStatus");

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

        if (!validStatuses.includes(normalizedStatus)) {
            return;
        }

        dispatch(
            setTaxMasterStatus(normalizedStatus)
        );

        const statusLabels = {
            ALL: "All Tax Masters",
            ACTIVE: "Active Tax Masters",
            INACTIVE: "Inactive Tax Masters",
            DRAFT: "Draft Tax Masters",
        };

        dispatch(
            setSelectedTaxMasterView(
                statusLabels[normalizedStatus]
            )
        );

    }, [dispatch]);

    // ============================================================
    // DEBUG
    // ============================================================

    useEffect(() => {

        console.log("================================");
        console.log(
            "TAX MASTERS FROM REDUX:",
            taxMasters
        );

        console.log(
            "TAX MASTER LOADING:",
            loading
        );

        console.log(
            "TAX MASTER ERROR:",
            error
        );

        console.log(
            "TAX MASTER STATUS:",
            taxMasterStatus
        );

        console.log("================================");

    }, [
        taxMasters,
        loading,
        error,
        taxMasterStatus,
    ]);

    // ============================================================
    // FILTER TAX MASTERS BY STATUS
    // ============================================================

    const filteredTaxMasters = useMemo(() => {

        const selectedStatus =
            String(taxMasterStatus || "ALL")
                .toUpperCase();

        // ========================================================
        // ALL
        // ========================================================

        if (selectedStatus === "ALL") {
            return taxMasters;
        }

        // ========================================================
        // FILTER
        // ========================================================

        return taxMasters.filter((taxMaster) => {

            const backendStatus =
                String(taxMaster?.status || "")
                    .toUpperCase();

            console.log(
                "Tax Master:",
                taxMaster?.taxName,
                "| Backend Status:",
                backendStatus,
                "| Selected Status:",
                selectedStatus
            );

            return backendStatus === selectedStatus;
        });

    }, [
        taxMasters,
        taxMasterStatus,
    ]);

    // ============================================================
    // OPEN CREATE TAX MASTER MODAL
    // ============================================================

    const handleCreateTaxMaster = () => {

        console.log("Opening Add Tax Master modal");

        dispatch(
            openModal({
                type: "addTaxMaster",
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
        <div className="flex h-screen bg-gray-50 font-sans text-[13px] overflow-hidden">

            <div className="flex-1 min-h-0 bg-white overflow-y-auto">

                <div className="px-2 py-5 max-w-30xl w-full">

                    {/* =================================================
                    TAX MASTER NAVBAR
                ================================================= */}

                    <NavbarTaxMaster />

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
                    TAX MASTER TABLE / EMPTY STATE
                ================================================= */}

                    {filteredTaxMasters.length > 0 ? (

                        <TaxMasterTable
                            taxMasters={filteredTaxMasters}
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
                                <div className="text-gray-400 text-4xl">
                                    %
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
                                    <Plus className="w-4 h-4" />
                                </div>
                            </div>

                            <p className="text-base font-medium text-gray-800 text-center">
                                Every setup starts with a taxss
                            </p>

                            <p className="text-sm text-gray-500 text-center max-w-sm">
                                Create and manage your tax masters and GST tax
                                configurations, all in one place.
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

                                {/* CREATE TAX MASTER */}

                                <button
                                    type="button"
                                    onClick={handleCreateTaxMaster}
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
                                    <Plus className="w-4 h-4" />

                                    Create New Tax
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
                                    <Download className="w-4 h-4" />

                                    Import File
                                </button>

                            </div>

                        </div>
                    )}

                </div>

            </div>

            {/* =========================================================
            TAX MASTER CREATE / EDIT MODAL
        ========================================================= */}

            <TaxMasterCreate />

        </div>
    );
}