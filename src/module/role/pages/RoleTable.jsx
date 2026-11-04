
import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    Eye,
    ShieldCheck,
    Edit,
    Trash2,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchAllRoles,
    deleteRole,
} from "../thunks/roleThunks";

import {
    setExsistingRole,
} from "../slices/roleSlice";

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_ARRAY = [];

const AVATAR_COLORS = [
    "bg-pink-500 text-white",
    "bg-green-500 text-white",
    "bg-blue-500 text-white",
    "bg-purple-500 text-white",
    "bg-orange-500 text-white",
    "bg-cyan-500 text-white",
    "bg-indigo-500 text-white",
];

const ROLE_STATUS_COLORS = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-700",
    DRAFT: "bg-orange-100 text-orange-700",
};

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (value = "") => {
    return (
        String(value)
            .split(/[\s_-]+/)
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "RL"
    );
};

const getAvatarColor = (value = "") => {
    const index = String(value)
        .split("")
        .reduce(
            (acc, char) => acc + char.charCodeAt(0),
            0
        ) % AVATAR_COLORS.length;

    return AVATAR_COLORS[index];
};

const getRoleStatus = (role) => {
    if (role?.status) {
        return String(role.status).toUpperCase();
    }

    if (role?.audit?.active === false) {
        return "INACTIVE";
    }

    if (role?.audit?.active === true) {
        return "ACTIVE";
    }

    return "—";
};

/* =========================================================
   COMPONENT
========================================================= */

export default function RoleTable({
    roles,
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        roles: reduxRoles = EMPTY_ARRAY,
        loading = false,
        actionLoading = false,
        error = null,
    } = useSelector((state) => state.role || {});

    const currentRoles = Array.isArray(roles)
        ? roles
        : reduxRoles;

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    const permissions = useSelector(
        (state) =>
            state.menuPermission?.userPermissions || EMPTY_ARRAY
    );

    /* =====================================================
       ROLE
    ===================================================== */

    const roleName =
        user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";

    const normalizedRole = String(roleName)
        .trim()
        .toUpperCase();

    const hasFullAccess =
        normalizedRole === "SUPER_ADMIN" ||
        normalizedRole === "ADMIN";

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = useCallback(
        (moduleName, actionName) => {
            if (hasFullAccess) return true;

            if (!Array.isArray(permissions)) {
                return false;
            }

            const requestedModule = String(moduleName)
                .trim()
                .toLowerCase();

            const requestedAction = String(actionName)
                .trim()
                .toUpperCase();

            return permissions.some((permission) => {
                const permissionModule = String(
                    permission?.moduleName ||
                    permission?.module?.moduleName ||
                    permission?.module?.name ||
                    ""
                )
                    .trim()
                    .toLowerCase();

                if (permissionModule !== requestedModule) {
                    return false;
                }

                if (permission?.active === false) {
                    return false;
                }

                if (
                    String(permission?.status || "").toUpperCase() ===
                    "INACTIVE"
                ) {
                    return false;
                }

                if (Array.isArray(permission?.actions)) {
                    return permission.actions.some((action) => {
                        const permissionAction = String(
                            action?.actionName ||
                            action?.action?.actionName ||
                            action?.action?.name ||
                            ""
                        )
                            .trim()
                            .toUpperCase();

                        const allowed =
                            action?.allowed === true ||
                            action?.allowed === "true";

                        return (
                            permissionAction === requestedAction &&
                            allowed
                        );
                    });
                }

                const permissionAction = String(
                    permission?.actionName ||
                    permission?.action?.actionName ||
                    permission?.action?.name ||
                    ""
                )
                    .trim()
                    .toUpperCase();

                const allowed =
                    permission?.allowed === true ||
                    permission?.allowed === "true";

                return (
                    permissionAction === requestedAction &&
                    allowed
                );
            });
        },
        [hasFullAccess, permissions]
    );

    const canViewRole = hasPermission("Roles", "VIEW");
    const canEditRole = hasPermission("Roles", "EDIT");
    const canDeleteRole = hasPermission("Roles", "DELETE");

    /* =====================================================
       REFRESH ROLES
    ===================================================== */

    const refreshRoles = useCallback(() => {
        dispatch(fetchAllRoles());
    }, [dispatch]);

    /* =====================================================
       VIEW ROLE
    ===================================================== */

    const handleView = (role) => {
        if (!canViewRole) {
            toast.error(
                "You do not have permission to view Roles."
            );
            return;
        }

        dispatch(setExsistingRole(role));

        navigate(`/settings/roles/view/${role.id}`);
    };

    /* =====================================================
       EDIT ROLE
    ===================================================== */

    const handleEdit = (role) => {
        if (!canEditRole) {
            toast.error(
                "You do not have permission to edit Roles."
            );
            return;
        }

        const isSystemUser =
            String(selectedUser?.role || "")
                .trim()
                .toUpperCase() === "SUPER_ADMIN";

        if (isSystemUser) {
            toast.error(
                "The SUPER_ADMIN user cannot be edited."
            );
            return;
        }

        dispatch(setExsistingRole(role));

        navigate(`/settings/roles/edit/${role.id}`);
    };

    /* =====================================================
       DELETE ROLE
    ===================================================== */

    const handleDelete = async (role) => {
        if (!canDeleteRole) {
            toast.error(
                "You do not have permission to delete Roles."
            );
            return;
        }

        if (
            String(role.roleName).trim().toUpperCase() ===
            "SUPER_ADMIN"
        ) {
            toast.error(
                "The SUPER_ADMIN role cannot be deleted."
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${role.roleName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await dispatch(
                deleteRole(role.id)
            ).unwrap();

            toast.success("Role deleted successfully.");

            refreshRoles();
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : "Failed to delete role."
            );
        }
    };

    /* =====================================================
       SORTING
    ===================================================== */

    const sortedRoles = useMemo(
        () => [...currentRoles],
        [currentRoles]
    );

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentRoles.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-sm text-gray-500">
                    Loading roles...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentRoles.length) {
        return (
            <div className="
                rounded-xl border border-red-200
                bg-white p-8 text-center
            ">
                <p className="text-sm text-red-500">
                    {typeof error === "string"
                        ? error
                        : "Failed to fetch roles"}
                </p>

                <button
                    type="button"
                    onClick={refreshRoles}
                    className="
                        mt-3 rounded-lg bg-blue-600
                        px-4 py-2 text-sm text-white
                        transition hover:bg-blue-700
                    "
                >
                    Retry
                </button>
            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentRoles.length) {
        return (
            <div className="
                rounded-2xl border border-gray-200
                bg-white p-8 text-center
            ">
                <ShieldCheck className="
                    mx-auto mb-3 h-10 w-10 text-gray-300
                " />

                <p className="text-sm text-gray-500">
                    No roles found.
                </p>
            </div>
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    return (
        <div className="
            overflow-x-auto overflow-y-visible
            rounded-xl border border-gray-200 bg-white
        ">
            <table className="w-full">

                {/* TABLE HEADER */}

                <thead className="
                    border-b border-gray-300
                    bg-[#FAF9F7]/20
                ">
                    <tr>
                        {[
                            "Role",
                            "Description",
                            "Status",
                            "Actions",
                        ].map((header) => (
                            <th
                                key={header}
                                className={`
                                    whitespace-nowrap px-5 py-3
                                    text-left text-xs font-medium
                                    uppercase text-gray-400
                                    ${header === "Actions"
                                        ? "text-right"
                                        : ""
                                    }
                                `}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* TABLE BODY */}

                <tbody>
                    {sortedRoles.map((role) => {
                        const roleStatus = getRoleStatus(role);

                        const roleName =
                            role.roleName || "—";

                        const description =
                            role.description || "—";

                        const isSystemRole =
                            String(roleName)
                                .trim()
                                .toUpperCase() === "SUPER_ADMIN";

                        return (
                            <tr
                                key={role.id}
                                className="
                                    border-b border-gray-100
                                    text-xs transition-colors
                                    hover:bg-gray-50
                                "
                            >

                                {/* ROLE */}

                                <td className="px-3 py-3">
                                    <div className="
                                        flex min-w-0 items-center gap-2
                                    ">
                                        <div
                                            className={`
                                                flex h-9 w-9 min-w-[36px]
                                                items-center justify-center
                                                rounded-full text-sm font-bold
                                                ${getAvatarColor(roleName)}
                                            `}
                                        >
                                            {getInitials(roleName)}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="
                                                flex items-center gap-2
                                            ">
                                                <p
                                                    className="
                                                        truncate font-medium
                                                        text-gray-800
                                                    "
                                                    title={roleName}
                                                >
                                                    {roleName}
                                                </p>

                                                {isSystemRole && (
                                                    <span className="
                                                        whitespace-nowrap
                                                        rounded-full
                                                        bg-purple-100
                                                        px-2 py-0.5
                                                        text-[10px]
                                                        font-medium
                                                        text-purple-700
                                                    ">
                                                        System
                                                    </span>
                                                )}
                                            </div>

                                            <p className="
                                                mt-0.5 text-xs text-gray-500
                                            ">
                                                ID: {role.id}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* DESCRIPTION */}

                                <td className="px-3 py-3">
                                    <p
                                        className="
                                            max-w-[350px] truncate
                                            text-gray-600
                                        "
                                        title={description}
                                    >
                                        {description}
                                    </p>
                                </td>

                                {/* STATUS */}

                                <td className="px-3 py-3">
                                    <span
                                        className={`
                                            inline-block whitespace-nowrap
                                            rounded-full px-2.5 py-1
                                            text-xs font-medium
                                            ${ROLE_STATUS_COLORS[roleStatus] ||
                                            "bg-gray-100 text-gray-700"}
                                        `}
                                    >
                                        {roleStatus}
                                    </span>
                                </td>

                                {/* ACTIONS */}

                                <td className="px-4 py-3">
                                    <div className="
                                        flex items-center justify-end gap-2
                                    ">

                                        {canViewRole && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleView(role)
                                                }
                                                title="View"
                                                className="
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-blue-50
                                                    text-blue-600 transition
                                                    hover:bg-blue-100
                                                    hover:text-blue-700
                                                "
                                            >
                                                <Eye size={16} />
                                            </button>
                                        )}

                                        {canEditRole && (
                                            <button
                                                type="button"
                                                disabled={
                                                    actionLoading ||
                                                    isSystemRole
                                                }
                                                onClick={() =>
                                                    handleEdit(role)
                                                }
                                                title={
                                                    isSystemRole
                                                        ? "System role cannot be edited"
                                                        : "Delete"
                                                }
                                                className="
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-green-50
                                                    text-green-600 transition
                                                    hover:bg-green-100
                                                    hover:text-green-700
                                                     disabled:cursor-not-allowed
                                                    disabled:opacity-40
                                                "
                                            >
                                                <Edit size={16} />
                                            </button>
                                        )}

                                        {canDeleteRole && (
                                            <button
                                                type="button"
                                                disabled={
                                                    actionLoading ||
                                                    isSystemRole
                                                }
                                                onClick={() =>
                                                    handleDelete(role)
                                                }
                                                title={
                                                    isSystemRole
                                                        ? "System role cannot be deleted"
                                                        : "Delete"
                                                }
                                                className="
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-red-50
                                                    text-red-600 transition
                                                    hover:bg-red-100
                                                    hover:text-red-700
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-40
                                                "
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}

                                    </div>
                                </td>

                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
