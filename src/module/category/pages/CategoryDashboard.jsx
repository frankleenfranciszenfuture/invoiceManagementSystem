import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Download } from "lucide-react";

import CategoryTable from "./CategoryTable";
import NavbarCategory from "../components/bars/nav/NavbarCategory";

import {
    fetchAllCategories,
} from "../thunks/categoryThunks";

import {
    setCategoryStatus,
    setSelectedCategoryView,
} from "../slices/categorySlice";

import { openModal } from "../../ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";
// import CategoryCreate from "../pages/CategoryCreate";

export default function CategoryDashboard() {

    const dispatch = useDispatch();

    // ============================================================
    // CATEGORY STATE
    // ============================================================

    const categoriesFromRedux = useSelector(
        (state) => state.category?.categories
    );

    const categories =
        categoriesFromRedux ?? [];

    const loading = useSelector(
        (state) =>
            state.category?.loading || false
    );

    const error = useSelector(
        (state) =>
            state.category?.error
    );

    // ============================================================
    // CATEGORY FILTER STATE
    // ============================================================

    const categoryStatus = useSelector(
        (state) =>
            state.categoryView?.categoryStatus ||
            "ALL"
    );

    // ============================================================
    // FETCH CATEGORIES
    // ============================================================

    useEffect(() => {

        console.log(
            "Fetching categories..."
        );

        dispatch(
            fetchAllCategories()
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
            params.get("categoryStatus");

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
            setCategoryStatus(
                normalizedStatus
            )
        );

        const statusLabels = {
            ALL: "All Categories",
            ACTIVE: "Active Categories",
            INACTIVE: "Inactive Categories",
            DRAFT: "Draft Categories",
        };

        dispatch(
            setSelectedCategoryView(
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
            "CATEGORIES FROM REDUX:",
            categories
        );

        console.log(
            "CATEGORY LOADING:",
            loading
        );

        console.log(
            "CATEGORY ERROR:",
            error
        );

        console.log(
            "CATEGORY STATUS:",
            categoryStatus
        );

        console.log(
            "================================"
        );

    }, [
        categories,
        loading,
        error,
        categoryStatus,
    ]);

    // ============================================================
    // FILTER CATEGORIES BY STATUS
    // ============================================================

    const filteredCategories = useMemo(() => {

        const selectedStatus =
            String(
                categoryStatus || "ALL"
            ).toUpperCase();

        // ========================================================
        // ALL
        // ========================================================

        if (
            selectedStatus === "ALL"
        ) {
            return categories;
        }

        // ========================================================
        // FILTER
        // ========================================================

        return categories.filter(
            (category) => {

                const backendStatus =
                    String(
                        category?.status || ""
                    ).toUpperCase();

                console.log(
                    "Category:",
                    category?.categoryName,
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
        categories,
        categoryStatus,
    ]);

    // ============================================================
    // OPEN CREATE CATEGORY MODAL
    // ============================================================

    const handleCreateCategory = () => {

        console.log(
            "Opening Add Category modal"
        );

        dispatch(
            openModal({
                type: "addCategory",
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
                        CATEGORY NAVBAR
                    ================================================= */}

                    <NavbarCategory />

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
                        CATEGORY TABLE / EMPTY STATE
                    ================================================= */}

                    {filteredCategories.length > 0 ? (

                        <CategoryTable
                            categories={
                                filteredCategories
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
                                    C
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
                                Every product starts with a category
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
                                Create and manage your categories
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

                                {/* CREATE CATEGORY */}

                                <button
                                    type="button"
                                    onClick={
                                        handleCreateCategory
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

                                    Create New Category

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
                CATEGORY CREATE / EDIT MODAL
            ========================================================= */}

            {/* <CategoryCreate /> */}

        </div>
    );
}