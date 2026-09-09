import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getCustomerById } from "../thunks/customerThunks";

import CustomerOverViewSiderTopbar from "../overviewCard/CustomerOverViewSiderTopbar";
import CustomerOverViewSiderDetails from "../overviewCard/CustomerOverViewSiderDetails";
import CustomerOverviewTabTopbar from "../overviewCard/CustomerOverviewTabTopbar";
import CustomerOverViewTabsTopbardown from "../overviewCard/CustomerOverViewTabsTopbardown";

export default function CustomerOverViewDashboard() {
    const { id } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        if (id) {
            dispatch(getCustomerById(id));
        }
    }, [id, dispatch]);

    return (
        <div className="h-screen flex flex-col bg-gray-100">

            {/* Single Topbar */}
            {/* <CustomerOverViewSiderTopbar /> */}

            {/* Everything below is ONE VIEW */}
            <div className="flex flex-1 min-h-0">

                {/* Customer Details */}
                <div className="w-[387px] shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
                    <CustomerOverViewSiderTopbar />
                    <CustomerOverViewSiderDetails />
                </div>

                {/* Customer Overview */}
                <div className="flex-1 min-w-0 flex flex-col">

                    {/* Customer Overview Header */}
                    <CustomerOverviewTabTopbar />

                    {/* Tabs + Content */}
                    <div className="flex-1 overflow-y-auto">
                        <CustomerOverViewTabsTopbardown />
                    </div>

                </div>

            </div>
        </div>
    );
}