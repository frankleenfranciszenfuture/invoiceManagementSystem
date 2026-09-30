
import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Download } from "lucide-react";

import RoleTable from "./RoleTable";
import NavbarRole from "../components/bars/nav/NavbarRole";

import { fetchAllRoles } from "../thunks/roleThunks";

import {
    setRoleStatus,
    setSelectedRoleView,
} from "../slices/roleViewSlice";

import { openModal } from "../../ui/uiSlice";

import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";
import RoleCreate from "../pages/RoleCreate";

export default function RoleDashboard() {

    const dispatch = useDispatch();

    // ============================================================
    // ROLE STATE
    // ============================================================

    const rolesFromRedux = useSelector(
        (state) => state.role?.roles
    );

    const roles = rolesFromRedux ?? [];

    const loading = useSelector(
        (state) => state.role?.loading || false
    );

    const error = useSelector(
        (state) => state.role?.error
    );

    // ============================================================
    // ROLE FILTER STATE
    // ============================================================

    const roleStatus = useSelector(
        (state) =>
            state.roleView?.roleStatus || "ALL"
    );

    // ============================================================
    // FETCH ROLES
    // ============================================================

    useEffect(() => {

        console.log("Fetching roles...");

        dispatch(fetchAllRoles());

    }, [dispatch]);

    // ============================================================
    // SYNC URL STATUS → REDUX
    // ============================================================

    useEffect(() => {

        const params = new URLSearchParams(
            window.location.search
        );

        const urlStatus =
            params.get("roleStatus");

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
            setRoleStatus(normalizedStatus)
        );

        const statusLabels = {
            ALL: "All Roles",
            ACTIVE: "Active Roles",
            INACTIVE: "Inactive Roles",
            DRAFT: "Draft Roles",
        };

        dispatch(
            setSelectedRoleView(
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
            "ROLES FROM REDUX:",
            roles
        );

        console.log(
            "ROLE LOADING:",
            loading
        );

        console.log(
            "ROLE ERROR:",
            error
        );

        console.log(
            "ROLE STATUS:",
            roleStatus
        );

        console.log("================================");

    }, [
        roles,
        loading,
        error,
        roleStatus,
    ]);

    // ============================================================
    // FILTER ROLES BY STATUS
    // ============================================================

    const filteredRoles = useMemo(() => {

        const selectedStatus =
            String(roleStatus || "ALL")
                .toUpperCase();

        // ========================================================
        // ALL
        // ========================================================

        if (selectedStatus === "ALL") {
            return roles;
        }

        // ========================================================
        // FILTER
        // ========================================================

        return roles.filter((role) => {

            const backendStatus =
                String(role?.status || "")
                    .toUpperCase();

            console.log(
                "Role:",
                role?.roleName,
                "| Backend Status:",
                backendStatus,
                "| Selected Status:",
                selectedStatus
            );

            return backendStatus === selectedStatus;
        });

    }, [
        roles,
        roleStatus,
    ]);

    // ============================================================
    // OPEN CREATE ROLE MODAL
    // ============================================================

    const handleCreateRole = () => {

        console.log("Opening Add Role modal");

        dispatch(
            openModal({
                type: "addRole",
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
        <div className="flex h-screen bg-gray-50 font-sans text-[13px] overflow-hidden">

            <div className="flex-1 min-h-0 bg-white overflow-y-auto">

                <div className="px-2 py-5 max-w-30xl w-full">

                    {/* =================================================
                        ROLE NAVBAR
                    ================================================= */}

                    <NavbarRole />

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
                        ROLE TABLE / EMPTY STATE
                    ================================================= */}

                    {filteredRoles.length > 0 ? (

                        <RoleTable
                            roles={filteredRoles}
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

                                <div className="text-gray-400 text-4xl">
                                    R
                                </div>

                                <div
                                    className="
                                        absolute
                                        bottom-1
                                        right-1
                                        w-7
                                        h-7
                                        rounded-full
                                        bg-blue-600
                                        flex
                                        items-center
                                        justify-center
                                        text-white
                                    "
                                >
                                    <Plus className="w-4 h-4" />
                                </div>

                            </div>

                            {/* =================================================
                                EMPTY STATE TITLE
                            ================================================= */}

                            <p className="text-base font-medium text-gray-800 text-center">
                                Every setup starts with a role
                            </p>

                            {/* =================================================
                                EMPTY STATE DESCRIPTION
                            ================================================= */}

                            <p className="text-sm text-gray-500 text-center max-w-sm">
                                Create and manage your roles in one place.
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

                                {/* CREATE ROLE */}

                                <button
                                    type="button"
                                    onClick={handleCreateRole}
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        bg-blue-600
                                        text-white
                                        text-sm
                                        font-medium
                                        px-4
                                        py-2
                                        rounded-md
                                        hover:bg-blue-700
                                        transition-colors
                                        whitespace-nowrap
                                    "
                                >
                                    <Plus className="w-4 h-4" />

                                    Create New Role
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
                                    <Download className="w-4 h-4" />

                                    Import File
                                </button>

                            </div>

                        </div>
                    )}

                </div>

            </div>

            {/* =========================================================
                ROLE CREATE / EDIT MODAL
            ========================================================= */}

            {/* <RoleCreate /> */}

        </div>
    );
}
