import React, { useEffect } from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useParams } from "react-router-dom";

import {
    fetchAllRoles,
    fetchRoleById,
} from "../../role/thunks/roleThunks";

import RoleOverviewTabTopbar
    from "../overViewCard/RoleOverviewTabTopbar";

import RoleOverViewTabsTopbardown
    from "../overViewCard/RoleOverViewTabsTopbardown";
import RoleProfileOverview from "../pages/RoleProfileOverview";

export default function RoleOverViewCardDashboard() {

    const { id } = useParams();

    const dispatch = useDispatch();

    /* =========================================================
       ROLE LIST
    ========================================================= */

    const roles = useSelector(
        (state) =>
            state.role?.roles ?? []
    );

    /* =========================================================
       FETCH ROLES
    ========================================================= */

    useEffect(() => {

        if (!id) {
            return;
        }

        if (roles.length === 0) {

            dispatch(
                fetchAllRoles()
            );

        }

        dispatch(
            fetchRoleById(id)
        );

    }, [
        id,
        dispatch,
        roles.length,
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
                ROLE CONTENT
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
                    ROLE TOP BAR
                ================================================= */}

                <div
                    className="
                        w-full
                        shrink-0
                    "
                >

                    {/* <RoleOverviewTabTopbar /> */}

                </div>

                {/* =================================================
                    ROLE OVERVIEW CONTENT
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

                    <RoleProfileOverview />

                </div>

            </div>

        </div>

    );

}