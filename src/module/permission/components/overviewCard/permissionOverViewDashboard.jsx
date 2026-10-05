
import React, { useEffect } from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useParams } from "react-router-dom";

import {
    fetchAllCompanies,
    fetchCompanyById,
} from "../../company/thunks/companyThunks";

import CompanyOverviewTabTopbar
    from "../overviewCard/CompanyOverviewTabTopbar";



export default function permissionOverViewDashboard() {

    const { id } = useParams();

    const dispatch = useDispatch();

    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div
            className="
                flex
                h-screen
                w-full
                min-w-0
                flex-col
                bg-gray-100
            "
        >

            {/* =================================================
                COMPANY CONTENT
            ================================================= */}

            <div
                className="
                    flex
                    min-h-0
                    w-full
                    min-w-0
                    flex-1
                    flex-col
                "
            >

                {/* =================================================
                    COMPANY TOP BAR
                ================================================= */}

                <div
                    className="
                        w-full
                        shrink-0
                    "
                >
                    {/* <CompanyOverviewTabTopbar /> */}
                </div>

                {/* =================================================
                    COMPANY OVERVIEW CONTENT
                ================================================= */}

                <div
                    className="
                        min-h-0
                        w-full
                        min-w-0
                        flex-1
                        overflow-y-auto
                        overflow-x-hidden
                    "
                >

                    {/* <CompanyOverViewTabsTopbardown /> */}

                </div>

            </div>

        </div>
    );
}
