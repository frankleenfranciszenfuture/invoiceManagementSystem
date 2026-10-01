
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

import CompanyOverViewTabsTopbardown
    from "../overviewCard/CompanyOverViewTabsTopbardown";

export default function CompanyOverViewDashboard() {

    const { id } = useParams();

    const dispatch = useDispatch();

    /* =========================================================
       COMPANY LIST
    ========================================================= */

    const companies = useSelector(
        (state) =>
            state.company?.companies ?? []
    );

    /* =========================================================
       FETCH COMPANIES
    ========================================================= */

    useEffect(() => {

        if (!id) {
            return;
        }

        if (companies.length === 0) {
            dispatch(
                fetchAllCompanies()
            );
        }

        dispatch(
            fetchCompanyById(id)
        );

    }, [
        id,
        dispatch,
        companies.length,
    ]);

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
                    <CompanyOverviewTabTopbar />
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

                    <CompanyOverViewTabsTopbardown />

                </div>

            </div>

        </div>
    );
}
