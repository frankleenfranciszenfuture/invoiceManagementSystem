
import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import { Download, Plus } from "lucide-react";

import ProductTable from "./ProductTable";
import NavbarProduct from "../components/bars/nav/NavbarProduct";

import { fetchAllProducts } from "../thunks/productThunks";

import {
    setProductStatus,
    setSelectedProductView,
} from "../slices/productViewSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

export default function ProductDashboard() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();


    // ============================================================
    // PRODUCT STATE
    // ============================================================

    const products = useSelector(
        (state) => state.product?.products || []
    );

    const loading = useSelector(
        (state) => state.product?.loading || false
    );

    const error = useSelector(
        (state) => state.product?.error
    );


    // ============================================================
    // PRODUCT FILTER STATE
    // ============================================================

    const productStatus = useSelector(
        (state) =>
            state.productView?.productStatus || "ALL"
    );


    // ============================================================
    // FETCH PRODUCTS
    // ============================================================

    useEffect(() => {

        console.log("Fetching products...");

        dispatch(fetchAllProducts());

    }, [dispatch]);


    // ============================================================
    // SYNC URL STATUS → REDUX
    // ============================================================

    useEffect(() => {

        const urlStatus =
            searchParams.get("productStatus");

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
            setProductStatus(normalizedStatus)
        );

        const statusLabels = {
            ALL: "All Products",
            ACTIVE: "Active Products",
            INACTIVE: "Inactive Products",
            DRAFT: "Draft Products",
        };

        dispatch(
            setSelectedProductView(
                statusLabels[normalizedStatus]
            )
        );

    }, [searchParams, dispatch]);


    // ============================================================
    // DEBUG
    // ============================================================

    useEffect(() => {

        console.log("================================");
        console.log(
            "PRODUCTS FROM REDUX:",
            products
        );
        console.log(
            "PRODUCT LOADING:",
            loading
        );
        console.log(
            "PRODUCT ERROR:",
            error
        );
        console.log(
            "PRODUCT STATUS:",
            productStatus
        );
        console.log("================================");

    }, [
        products,
        loading,
        error,
        productStatus,
    ]);


    // ============================================================
    // FILTER PRODUCTS BY STATUS
    // ============================================================

    const filteredProducts = useMemo(() => {

        const selectedStatus =
            String(productStatus || "ALL")
                .toUpperCase();

        // ALL PRODUCTS
        if (selectedStatus === "ALL") {
            return products;
        }

        // FILTER
        return products.filter((product) => {

            const backendStatus =
                String(product?.status || "")
                    .toUpperCase();

            console.log(
                "Product:",
                product?.productName,
                "| Backend Status:",
                backendStatus,
                "| Selected Status:",
                selectedStatus
            );

            return backendStatus === selectedStatus;
        });

    }, [
        products,
        productStatus,
    ]);


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

        <div className="min-h-full bg-gray-50 font-sans text-[13px]">

            <div className="w-full bg-white">

                <div className="px-2 py-5 w-full">


                    {/* =================================================
                        PRODUCT NAVBAR
                    ================================================== */}

                    <NavbarProduct />


                    {/* =================================================
                        ERROR
                    ================================================== */}

                    {error && (

                        <div className="mx-2 mt-4 px-4 py-3 rounded-md border border-red-200 bg-red-50 text-sm text-red-600">

                            {error}

                        </div>

                    )}


                    {/* =================================================
                        PRODUCT TABLE
                    ================================================== */}

                    {filteredProducts.length > 0 ? (

                        <ProductTable
                            products={filteredProducts}
                        />

                    ) : (

                        <div className="flex flex-col items-center justify-center py-16">

                            <h2 className="text-lg font-semibold text-gray-800">
                                No products found
                            </h2>

                            <p className="mt-2 text-sm text-gray-500 text-center max-w-md">

                                {productStatus === "ALL"
                                    ? "There are no products to display."
                                    : `There are no ${String(
                                        productStatus
                                    ).toLowerCase()} products.`}

                            </p>


                            <div className="flex items-center gap-3 mt-6">

                                {/* CREATE PRODUCT */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/items/new")
                                    }
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                                >

                                    <Plus size={16} />

                                    Create New Product

                                </button>


                                {/* IMPORT */}

                                <button
                                    type="button"
                                    className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition"
                                >

                                    <Download size={16} />

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
