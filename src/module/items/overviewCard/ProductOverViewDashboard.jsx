import React, { useEffect } from "react";
import {
    useDispatch,
    useSelector,
} from "react-redux";
import { useParams } from "react-router-dom";

import {
    fetchAllProducts,
    fetchProductById,
} from "../../items/thunks/productThunks";

import ProductOverViewSiderTopbar from "../overviewCard/ProductOverViewSiderTopbar";
import ProductOverViewSiderDetails from "../overviewCard/ProductOverViewSiderDetails";
import ProductOverviewTabTopbar from "../overviewCard/ProductOverviewTabTopbar";
import ProductOverViewTabsTopbardown from "../overviewCard/ProductOverViewTabsTopbardown";
import CustomerProfileOverview from "../../customer/pages/Customerprofileoverview";
import ProductViewDetails from "../pages/Productviewdetails";

export default function ProductOverViewDashboard() {
    const { id } = useParams();
    const dispatch = useDispatch();

    /* =========================================================
       PRODUCT LIST
       ========================================================= */

    const products = useSelector(
        (state) => state.product?.products ?? []
    );

    /* =========================================================
       FETCH PRODUCTS
       ========================================================= */

    useEffect(() => {
        if (!id) {
            return;
        }

        // Load product list for left sidebar
        if (products.length === 0) {
            dispatch(fetchAllProducts());
        }

        // Load currently selected product
        dispatch(fetchProductById(id));
    }, [id, dispatch, products.length]);

    /* =========================================================
       RENDER
       ========================================================= */

    return (
        <div className="flex h-screen flex-col bg-gray-100 mt-3">

            <div className="flex min-h-0 flex-1 rounded-lg">

                {/* =================================================
                    LEFT SIDEBAR
                ================================================= */}

                <div className="flex w-[387px] shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white">

                    <ProductOverViewSiderTopbar />

                    <ProductOverViewSiderDetails />

                </div>

                {/* =================================================
                    RIGHT CONTENT
                ================================================= */}

                <div className="flex min-w-0 flex-1 flex-col">

                    <ProductOverviewTabTopbar />

                    <div className="min-h-0 flex-1 overflow-y-auto">

                        {/* <ProductOverViewTabsTopbardown /> */}
                        <ProductViewDetails />

                    </div>

                </div>

            </div>

        </div>
    );
}