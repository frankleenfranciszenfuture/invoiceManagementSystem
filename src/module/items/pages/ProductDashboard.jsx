
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

import ProductTable from "./ProductTable";

import NavbarProduct
    from "../components/bars/nav/NavbarProduct";

import {
    fetchAllProducts,
} from "../thunks/productThunks";

import {
    setProductStatus,
    setSelectedProductView,
} from "../slices/productViewSlice";

import {
    openModal,
} from "../../ui/uiSlice";

import InvoiceSkeleton
    from "../../../common/loader/InvoiceSkeleton";

export default function ProductDashboard() {

    const dispatch = useDispatch();

    const [searchParams] =
        useSearchParams();

    // ============================================================
    // PRODUCT STATE
    // ============================================================

    const products = useSelector(
        (state) =>
            state.product?.products || []
    );

    const loading = useSelector(
        (state) =>
            state.product?.loading || false
    );

    const error = useSelector(
        (state) =>
            state.product?.error
    );

    // ============================================================
    // PRODUCT FILTER STATE
    // ============================================================

    const productStatus = useSelector(
        (state) =>
            state.productView?.productStatus ||
            "ALL"
    );

    // ============================================================
    // FETCH PRODUCTS
    // ============================================================

    useEffect(() => {

        dispatch(
            fetchAllProducts()
        );

    }, [dispatch]);

    // ============================================================
    // SYNC URL STATUS → REDUX
    // ============================================================

    useEffect(() => {

        const urlStatus =
            searchParams.get(
                "productStatus"
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
            setProductStatus(
                normalizedStatus
            )
        );

        const statusLabels = {

            ALL:
                "All Products",

            ACTIVE:
                "Active Products",

            INACTIVE:
                "Inactive Products",

            DRAFT:
                "Draft Products",

        };

        dispatch(
            setSelectedProductView(
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
    // FILTER PRODUCTS BY STATUS
    // ============================================================

    const filteredProducts = useMemo(() => {

        const selectedStatus =
            String(
                productStatus || "ALL"
            ).toUpperCase();

        if (
            selectedStatus === "ALL"
        ) {
            return products;
        }

        return products.filter(
            (product) => {

                const backendStatus =
                    String(
                        product?.status || ""
                    ).toUpperCase();

                return (
                    backendStatus ===
                    selectedStatus
                );

            }
        );

    }, [
        products,
        productStatus,
    ]);

    // ============================================================
    // CREATE PRODUCT MODAL
    // ============================================================

    const handleCreateProduct = () => {

        dispatch(
            openModal({
                type: "addProduct",
                data: null,
            })
        );

    };

    // ============================================================
    // LOADING
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
                        PRODUCT NAVBAR
                    ================================================= */}

                    <NavbarProduct />

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
                        PRODUCT TABLE
                    ================================================= */}

                    {filteredProducts.length > 0 ? (

                        <ProductTable
                            products={
                                filteredProducts
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
                                No products found
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

                                {productStatus === "ALL"
                                    ? "There are no products to display."
                                    : `There are no ${String(
                                        productStatus
                                    ).toLowerCase()} products.`}

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

                                {/* CREATE PRODUCT */}

                                <button
                                    type="button"
                                    onClick={
                                        handleCreateProduct
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

                                    Create New Product

                                </button>

                                {/* IMPORT */}

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
