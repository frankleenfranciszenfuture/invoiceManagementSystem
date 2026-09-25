import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Download } from "lucide-react";

import SubCategoryTable from "./SubCategoryTable";
import NavbarSubCategory from "../components/bars/nav/NavbarSubCategory";

import {
    fetchAllSubCategories,
} from "../thunks/subCategoryThunks";

import {
    setSubCategoryStatus,
    setSelectedSubCategoryView,
} from "../slices/subCategorySlice";

import { openModal } from "../../ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";
import SubCategoryCreate from "../pages/SubCategoryCreate";

export default function SubCategoryDashboard() {

    const dispatch = useDispatch();

    // ============================================================
    // SUB CATEGORY STATE
    // ============================================================

    const subCategoriesFromRedux = useSelector(
        (state) => state.subCategory?.subCategories
    );

    const subCategories =
        subCategoriesFromRedux ?? [];

    const loading = useSelector(
        (state) =>
            state.subCategory?.loading || false
    );

    const error = useSelector(
        (state) =>
            state.subCategory?.error
    );

    // ============================================================
    // SUB CATEGORY FILTER STATE
    // ============================================================

    const subCategoryStatus = useSelector(
        (state) =>
            state.subCategoryView?.subCategoryStatus ||
            "ALL"
    );

    // ============================================================
    // FETCH SUB CATEGORIES
    // ============================================================

    useEffect(() => {

        console.log(
            "Fetching sub categories..."
        );

        dispatch(
            fetchAllSubCategories()
        );

    }, [dispatch]);

    // ============================================================
    // SYNC URL STATUS → REDUX
    // ============================================================

    useEffect(() => {

        const params = new URLSearchParams(
            window.location.search
        );

        const urlStatus =
            params.get("subCategoryStatus");

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
            setSubCategoryStatus(
                normalizedStatus
            )
        );

        const statusLabels = {
            ALL: "All Sub Categories",
            ACTIVE: "Active Sub Categories",
            INACTIVE: "Inactive Sub Categories",
            DRAFT: "Draft Sub Categories",
        };

        dispatch(
            setSelectedSubCategoryView(
                statusLabels[normalizedStatus]
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
            "SUB CATEGORIES FROM REDUX:",
            subCategories
        );

        console.log(
            "SUB CATEGORY LOADING:",
            loading
        );

        console.log(
            "SUB CATEGORY ERROR:",
            error
        );

        console.log(
            "SUB CATEGORY STATUS:",
            subCategoryStatus
        );

        console.log(
            "================================"
        );

    }, [
        subCategories,
        loading,
        error,
        subCategoryStatus,
    ]);

    // ============================================================
    // FILTER SUB CATEGORIES BY STATUS
    // ============================================================

    const filteredSubCategories = useMemo(() => {

        const selectedStatus =
            String(
                subCategoryStatus || "ALL"
            ).toUpperCase();

        // ========================================================
        // ALL
        // ========================================================

        if (
            selectedStatus === "ALL"
        ) {
            return subCategories;
        }

        // ========================================================
        // FILTER
        // ========================================================

        return subCategories.filter(
            (subCategory) => {

                const backendStatus =
                    String(
                        subCategory?.status || ""
                    ).toUpperCase();

                console.log(
                    "Sub Category:",
                    subCategory?.name,
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
        subCategories,
        subCategoryStatus,
    ]);

    // ============================================================
    // OPEN CREATE SUB CATEGORY MODAL
    // ============================================================

    const handleCreateSubCategory = () => {

        console.log(
            "Opening Add Sub Category modal"
        );

        dispatch(
            openModal({
                type: "addSubCategory",
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
                        SUB CATEGORY NAVBAR
                    ================================================= */}

                    <NavbarSubCategory />

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
                        SUB CATEGORY TABLE / EMPTY STATE
                    ================================================= */}

                    {filteredSubCategories.length > 0 ? (

                        <SubCategoryTable
                            subCategories={
                                filteredSubCategories
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
                                Every category starts with a sub category
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
                                Create and manage your sub categories
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

                                {/* CREATE SUB CATEGORY */}

                                <button
                                    type="button"
                                    onClick={
                                        handleCreateSubCategory
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

                                    Create New Sub Category

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
                SUB CATEGORY CREATE / EDIT MODAL
            ========================================================= */}

            {/* <SubCategoryCreate /> */}

        </div>
    );
}