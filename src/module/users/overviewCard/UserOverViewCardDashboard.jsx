import React, { useEffect } from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useParams } from "react-router-dom";

import {
    fetchAllUsers,
    fetchUserById,
} from "../thunks/userThunks";

import UserOverviewTabTopbar
    from "../overViewCard/UserOverviewTabTopbar";

import UserOverViewTabsTopbardown
    from "../overViewCard/UserOverViewTabsTopbardown";

export default function UserOverViewCardDashboard() {

    const { id } = useParams();

    const dispatch = useDispatch();

    /* =========================================================
       USER LIST
    ========================================================= */

    const users = useSelector(
        (state) =>
            state.user?.users ?? []
    );

    /* =========================================================
       FETCH USERS
    ========================================================= */

    useEffect(() => {

        if (!id) {
            return;
        }

        if (users.length === 0) {

            dispatch(
                fetchAllUsers()
            );

        }

        dispatch(
            fetchUserById(id)
        );

    }, [
        id,
        dispatch,
        users.length,
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
                USER CONTENT
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
                    USER TOP BAR
                ================================================= */}

                <div
                    className="
                        w-full
                        shrink-0
                    "
                >

                    <UserOverviewTabTopbar />

                </div>

                {/* =================================================
                    USER OVERVIEW CONTENT
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

                    <UserOverViewTabsTopbardown />

                </div>

            </div>

        </div>

    );

}