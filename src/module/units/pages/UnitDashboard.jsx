
import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Download } from "lucide-react";

import UnitTable from "../pages/UnitTable";
import NavbarUnit from "../components/bars/nav/NavbarUnits";

import { fetchAllUnits } from "../thunks/unitThunks";

import {
    setUnitStatus,
    setSelectedUnitView,
} from "../slices/unitViewSlice";

import { openModal } from "../../ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";
import UnitCreate from "../pages/UnitCreate";

export default function UnitDashboard() {

    const dispatch = useDispatch();

    // ============================================================
    // UNIT STATE
    // ============================================================

    const unitsFromRedux = useSelector(
        (state) => state.unit?.units
    );

    const units = unitsFromRedux ?? [];

    const loading = useSelector(
        (state) => state.unit?.loading || false
    );

    const error = useSelector(
        (state) => state.unit?.error
    );

    // ============================================================
    // UNIT FILTER STATE
    // ============================================================

    const unitStatus = useSelector(
        (state) =>
            state.unitView?.unitStatus || "ALL"
    );

    // ============================================================
    // FETCH UNITS
    // ============================================================

    useEffect(() => {

        console.log("Fetching units...");

        dispatch(fetchAllUnits());

    }, [dispatch]);

    // ============================================================
    // SYNC URL STATUS → REDUX
    // ============================================================

    useEffect(() => {

        const params = new URLSearchParams(
            window.location.search
        );

        const urlStatus =
            params.get("unitStatus");

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
            setUnitStatus(normalizedStatus)
        );

        const statusLabels = {
            ALL: "All Units",
            ACTIVE: "Active Units",
            INACTIVE: "Inactive Units",
            DRAFT: "Draft Units",
        };

        dispatch(
            setSelectedUnitView(
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
            "UNITS FROM REDUX:",
            units
        );

        console.log(
            "UNIT LOADING:",
            loading
        );

        console.log(
            "UNIT ERROR:",
            error
        );

        console.log(
            "UNIT STATUS:",
            unitStatus
        );

        console.log("================================");

    }, [
        units,
        loading,
        error,
        unitStatus,
    ]);

    // ============================================================
    // FILTER UNITS BY STATUS
    // ============================================================

    const filteredUnits = useMemo(() => {

        const selectedStatus =
            String(unitStatus || "ALL")
                .toUpperCase();

        // ========================================================
        // ALL
        // ========================================================

        if (selectedStatus === "ALL") {
            return units;
        }

        // ========================================================
        // FILTER
        // ========================================================

        return units.filter((unit) => {

            const backendStatus =
                String(unit?.status || "")
                    .toUpperCase();

            console.log(
                "Unit:",
                unit?.unitName,
                "| Backend Status:",
                backendStatus,
                "| Selected Status:",
                selectedStatus
            );

            return backendStatus === selectedStatus;
        });

    }, [
        units,
        unitStatus,
    ]);

    // ============================================================
    // OPEN CREATE UNIT MODAL
    // ============================================================

    const handleCreateUnit = () => {

        console.log("Opening Add Unit modal");

        dispatch(
            openModal({
                type: "addUnit",
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
                    UNIT NAVBAR
                    ================================================= */}

                    <NavbarUnit />

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
                    UNIT TABLE / EMPTY STATE
                    ================================================= */}

                    {filteredUnits.length > 0 ? (

                        <UnitTable
                            units={filteredUnits}
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

                                <div className="text-gray-400 text-4xl">
                                    U
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

                            {/* =================================================
                            EMPTY STATE TITLE
                            ================================================= */}

                            <p className="text-base font-medium text-gray-800 text-center">
                                Every setup starts with a unit
                            </p>

                            {/* =================================================
                            EMPTY STATE DESCRIPTION
                            ================================================= */}

                            <p className="text-sm text-gray-500 text-center max-w-sm">
                                Create and manage your units in one place.
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

                                {/* CREATE UNIT */}

                                <button
                                    type="button"
                                    onClick={handleCreateUnit}
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

                                    Create New Unit
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
            UNIT CREATE / EDIT MODAL
            ========================================================= */}

            <UnitCreate />

        </div>
    );
}