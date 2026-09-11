
import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Download } from "lucide-react";

import SizeTable from "./SizeTable";
import NavbarSize from "../components/bars/nav/NavbarSize";

import { fetchAllSizes } from "../thunks/sizeThunks";

import {
    setSizeStatus,
    setSelectedSizeView,
} from "../slices/sizeSlice";

import { openModal } from "../../ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";
import SizeCreate from "../pages/SizeCreate";

export default function SizeDashboard() {

    const dispatch = useDispatch();

    // ============================================================
    // SIZE STATE
    // ============================================================

    const sizesFromRedux = useSelector(
        (state) => state.size?.sizes
    );

    const sizes = sizesFromRedux ?? [];

    const loading = useSelector(
        (state) => state.size?.loading || false
    );

    const error = useSelector(
        (state) => state.size?.error
    );

    // ============================================================
    // SIZE FILTER STATE
    // ============================================================

    const sizeStatus = useSelector(
        (state) =>
            state.sizeView?.sizeStatus || "ALL"
    );

    // ============================================================
    // FETCH SIZES
    // ============================================================

    useEffect(() => {

        console.log("Fetching sizes...");

        dispatch(fetchAllSizes());

    }, [dispatch]);

    // ============================================================
    // SYNC URL STATUS → REDUX
    // ============================================================

    useEffect(() => {

        const params = new URLSearchParams(
            window.location.search
        );

        const urlStatus =
            params.get("sizeStatus");

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
            setSizeStatus(normalizedStatus)
        );

        const statusLabels = {
            ALL: "All Sizes",
            ACTIVE: "Active Sizes",
            INACTIVE: "Inactive Sizes",
            DRAFT: "Draft Sizes",
        };

        dispatch(
            setSelectedSizeView(
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
            "SIZES FROM REDUX:",
            sizes
        );

        console.log(
            "SIZE LOADING:",
            loading
        );

        console.log(
            "SIZE ERROR:",
            error
        );

        console.log(
            "SIZE STATUS:",
            sizeStatus
        );

        console.log("================================");

    }, [
        sizes,
        loading,
        error,
        sizeStatus,
    ]);

    // ============================================================
    // FILTER SIZES BY STATUS
    // ============================================================

    const filteredSizes = useMemo(() => {

        const selectedStatus =
            String(sizeStatus || "ALL")
                .toUpperCase();

        // ========================================================
        // ALL
        // ========================================================

        if (selectedStatus === "ALL") {
            return sizes;
        }

        // ========================================================
        // FILTER
        // ========================================================

        return sizes.filter((size) => {

            const backendStatus =
                String(size?.status || "")
                    .toUpperCase();

            console.log(
                "Size:",
                size?.sizeName,
                "| Backend Status:",
                backendStatus,
                "| Selected Status:",
                selectedStatus
            );

            return backendStatus === selectedStatus;
        });

    }, [
        sizes,
        sizeStatus,
    ]);

    // ============================================================
    // OPEN CREATE SIZE MODAL
    // ============================================================

    const handleCreateSize = () => {

        console.log("Opening Add Size modal");

        dispatch(
            openModal({
                type: "addSize",
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
                            sizes={filteredSizes}
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
                                    A
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
                                Every setup starts with a size
                            </p>

                            {/* =================================================
                            EMPTY STATE DESCRIPTION
                            ================================================= */}

                            <p className="text-sm text-gray-500 text-center max-w-sm">
                                Create and manage your sizes in one place.
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

                                {/* CREATE SIZE */}

                                <button
                                    type="button"
                                    onClick={handleCreateSize}
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

                                    Create New Size
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
            SIZE CREATE / EDIT MODAL
            ========================================================= */}

            <SizeCreate />

        </div>
    );
}