
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

    const products = useSelector(
        (state) => state.product?.products ?? []
    );

    useEffect(() => {
        if (!id) return;

        if (products.length === 0) {
            dispatch(fetchAllProducts());
        }

        dispatch(fetchProductById(id));
    }, [id, dispatch, products.length]);

    return (
        <div className="mt-3 h-[calc(100vh-16px)] min-h-0 overflow-hidden bg-gray-100 p-2">

            {/* SINGLE PARENT CONTAINER */}
            <div className="
                flex
                h-full
                min-h-0
                min-w-0
                overflow-hidden
                rounded-lg
                border
                border-gray-200
                bg-white
                shadow-sm
            ">

                {/* LEFT SIDEBAR */}
                <aside className="
                    flex
                    w-[260px]
                    min-w-[220px]
                    shrink-0
                    flex-col
                    overflow-y-auto
                    border-r
                    border-gray-200
                    bg-white
                ">
                    <ProductOverViewSiderTopbar />

                    <ProductOverViewSiderDetails />
                </aside>

                {/* RIGHT CONTENT */}
                <main className="
                    flex
                    min-h-0
                    min-w-0
                    flex-1
                    flex-col
                    overflow-hidden
                    bg-gray-50
                ">
                    {/* TOP BAR */}
                    <div className="shrink-0 border-b border-gray-200 bg-white">
                        {/* <ProductOverviewTabTopbar /> */}
                    </div>

                    {/* DETAILS CONTENT */}
                    <div className="
                        min-h-0
                        min-w-0
                        flex-1
                        
                    ">
                        <ProductViewDetails />
                    </div>
                </main>

            </div>
        </div>
    );
}
