
import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Download } from "lucide-react";

import UserTable from "./UserTable";
import NavbarUser from "../components/bars/nav/NavbarUser";

import { fetchAllUsers } from "../thunks/userThunks";

import {
    setUserStatus,
    setSelectedUserView,
} from "../slices/userViewSlice";

import { openModal } from "../../ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";
import UserCreate from "../pages/UserCreate";

export default function UserDashboard() {

    const dispatch = useDispatch();

    // ============================================================
    // USER STATE
    // ============================================================

    const usersFromRedux = useSelector(
        (state) => state.user?.users
    );

    const users = usersFromRedux ?? [];

    const loading = useSelector(
        (state) => state.user?.loading || false
    );

    const error = useSelector(
        (state) => state.user?.error
    );

    // ============================================================
    // PAGINATION
    // ============================================================

    const pagination = useSelector(
        (state) =>
            state.user?.pagination || {
                pageNumber: 0,
                pageSize: 10,
                totalElements: 0,
                totalPages: 0,
                last: true,
            }
    );

    // ============================================================
    // USER FILTER STATE
    // ============================================================

    const userStatus = useSelector(
        (state) =>
            state.userView?.userStatus || "ALL"
    );

    const search = useSelector(
        (state) =>
            state.userView?.search || ""
    );

    // ============================================================
    // FETCH USERS
    // ============================================================

    useEffect(() => {

        console.log("Fetching users...");

        dispatch(
            fetchAllUsers({
                page: 0,
                size: 10,
            })
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
            params.get("userStatus");

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
            setUserStatus(normalizedStatus)
        );

        const statusLabels = {
            ALL: "All Users",
            ACTIVE: "Active Users",
            INACTIVE: "Inactive Users",
            DRAFT: "Draft Users",
        };

        dispatch(
            setSelectedUserView(
                statusLabels[normalizedStatus]
            )
        );

    }, [dispatch]);

    // ============================================================
    // DEBUG
    // ============================================================

    useEffect(() => {

        console.log("================================");
        console.log(
            "USERS FROM REDUX:",
            users
        );

        console.log(
            "USER LOADING:",
            loading
        );

        console.log(
            "USER ERROR:",
            error
        );

        console.log(
            "USER STATUS:",
            userStatus
        );

        console.log(
            "USER PAGINATION:",
            pagination
        );

        console.log("================================");

    }, [
        users,
        loading,
        error,
        userStatus,
        pagination,
    ]);

    // ============================================================
    // FILTER USERS BY STATUS + SEARCH
    // ============================================================

    const filteredUsers = useMemo(() => {

        const selectedStatus =
            String(userStatus || "ALL")
                .toUpperCase();

        const normalizedSearch =
            String(search || "")
                .trim()
                .toLowerCase();

        let result = users;

        // ========================================================
        // STATUS FILTER
        // ========================================================

        if (selectedStatus !== "ALL") {

            result = result.filter((user) => {

                const backendStatus =
                    String(user?.status || "")
                        .toUpperCase();

                return backendStatus === selectedStatus;

            });

        }

        // ========================================================
        // SEARCH FILTER
        // ========================================================

        if (normalizedSearch) {

            result = result.filter((user) => {

                const name =
                    String(user?.name || "")
                        .toLowerCase();

                const email =
                    String(user?.email || "")
                        .toLowerCase();

                const userId =
                    String(user?.userId || "")
                        .toLowerCase();

                const role =
                    String(user?.role || "")
                        .toLowerCase();

                return (
                    name.includes(normalizedSearch) ||
                    email.includes(normalizedSearch) ||
                    userId.includes(normalizedSearch) ||
                    role.includes(normalizedSearch)
                );

            });

        }

        return result;

    }, [
        users,
        userStatus,
        search,
    ]);

    // ============================================================
    // OPEN CREATE USER MODAL
    // ============================================================

    const handleCreateUser = () => {

        console.log(
            "Opening Add User modal"
        );

        dispatch(
            openModal({
                type: "addUser",
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
                        USER NAVBAR
                    ================================================= */}

                    <NavbarUser />

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
                        USER TABLE / EMPTY STATE
                    ================================================= */}

                    {filteredUsers.length > 0 ? (

                        <UserTable
                            users={filteredUsers}
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
                                    U
                                </div>

                                <div
                                    className="
                                        absolute
                                        bottom-1
                                        right-1
                                        w-7
                                        h-7
                                        rounded-full
                                        bg-blue-500
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
                                Every setup starts with a user
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
                                Create and manage your users in one place.
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

                                {/* CREATE USER */}

                                <button
                                    type="button"
                                    onClick={handleCreateUser}
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        bg-blue-500
                                        text-white
                                        text-sm
                                        font-medium
                                        px-4
                                        py-2
                                        rounded-md
                                        hover:bg-blue-600
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

                                    Create New User

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
                USER CREATE / EDIT MODAL
            ========================================================= */}

            {/* <UserCreate /> */}

        </div>
    );
}
