
import React, {
    useCallback,
    useMemo,
} from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import {
    useNavigate,
} from "react-router-dom";

import {
    Eye,
    Users,
    Edit,
    Trash2,
    ShieldCheck,
    CheckCircle,
    XCircle,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchAllUsers,
    deleteUser,
} from "../thunks/userThunks";

import {
    setExsistingUser,
} from "../slices/userSlice";

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

const USER_STATUS_COLORS = {
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
            .toUpperCase() || "US"
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

const getUserStatus = (user) => {

    if (user?.status) {
        return String(user.status).trim().toUpperCase();
    }

    if (user?.audit?.active === false) {
        return "INACTIVE";
    }

    if (user?.audit?.active === true) {
        return "ACTIVE";
    }

    return "—";
};

const getVerificationStatus = (user) => {
    return user?.accountVerified === true;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function UserTable({
    users,
}) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        users: reduxUsers = EMPTY_ARRAY,
        loading = false,
        actionLoading = false,
        error = null,
    } = useSelector((state) => state.user || {});

    const currentUsers = Array.isArray(users)
        ? users
        : reduxUsers;

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    const permissions = useSelector(
        (state) => {
            const value = state.menuPermission?.userPermissions;

            return Array.isArray(value)
                ? value
                : EMPTY_ARRAY;
        }
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

            if (hasFullAccess) {
                return true;
            }

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

                /* ACTION ARRAY */

                if (Array.isArray(permission?.actions)) {

                    return permission.actions.some((action) => {

                        if (typeof action === "string") {
                            return (
                                action.trim().toUpperCase() ===
                                requestedAction
                            );
                        }

                        const permissionAction = String(
                            action?.actionName ||
                            action?.action?.actionName ||
                            action?.action?.name ||
                            action?.name ||
                            ""
                        )
                            .trim()
                            .toUpperCase();

                        const allowed =
                            action?.allowed === true ||
                            action?.allowed === "true";

                        if (action?.active === false) {
                            return false;
                        }

                        if (
                            String(action?.status || "").toUpperCase() ===
                            "INACTIVE"
                        ) {
                            return false;
                        }

                        return (
                            permissionAction === requestedAction &&
                            allowed
                        );
                    });
                }

                /* DIRECT / FLAT ACTION */

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
        [
            hasFullAccess,
            permissions,
        ]
    );

    const canViewUser = hasPermission("Users", "VIEW");
    const canEditUser = hasPermission("Users", "EDIT");
    const canDeleteUser = hasPermission("Users", "DELETE");

    /* =====================================================
       REFRESH USERS
    ===================================================== */

    const refreshUsers = useCallback(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    /* =====================================================
       VIEW USER
    ===================================================== */

    const handleView = (selectedUser) => {

        if (!canViewUser) {
            toast.error(
                "You do not have permission to view Users."
            );
            return;
        }

        dispatch(setExsistingUser(selectedUser));

        navigate(`/settings/users/view/${selectedUser.id}`);
    };

    /* =====================================================
       EDIT USER
    ===================================================== */

    const handleEdit = (selectedUser) => {

        if (!canEditUser) {
            toast.error(
                "You do not have permission to edit Users."
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
        dispatch(setExsistingUser(selectedUser));

        navigate(`/settings/users/edit/${selectedUser.id}`);
    };

    /* =====================================================
       DELETE USER
    ===================================================== */

    const handleDelete = async (selectedUser) => {

        if (!canDeleteUser) {
            toast.error(
                "You do not have permission to delete Users."
            );
            return;
        }

        const isSystemUser =
            String(selectedUser?.role || "")
                .trim()
                .toUpperCase() === "SUPER_ADMIN";

        if (isSystemUser) {
            toast.error(
                "The SUPER_ADMIN user cannot be deleted."
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedUser.name || selectedUser.userId}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await dispatch(
                deleteUser(selectedUser.id)
            ).unwrap();

            toast.success("User deleted successfully.");

            refreshUsers();

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : "Failed to delete user."
            );
        }
    };

    /* =====================================================
       SORTING
    ===================================================== */

    const sortedUsers = useMemo(
        () => [...currentUsers],
        [currentUsers]
    );

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentUsers.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-sm text-gray-500">
                    Loading users...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentUsers.length) {
        return (
            <div className="
                rounded-xl border border-red-200
                bg-white p-8 text-center
            ">
                <p className="text-sm text-red-500">
                    {typeof error === "string"
                        ? error
                        : "Failed to fetch users"}
                </p>

                <button
                    type="button"
                    onClick={refreshUsers}
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

    if (!currentUsers.length) {
        return (
            <div className="
                rounded-2xl border border-gray-200
                bg-white p-8 text-center
            ">
                <Users className="
                    mx-auto mb-3 h-10 w-10 text-gray-300
                " />

                <p className="text-sm text-gray-500">
                    No users found.
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
                            "User",
                            "Email Address",
                            "Role",
                            "Verification",
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
                    {sortedUsers.map((selectedUser) => {

                        const userStatus =
                            getUserStatus(selectedUser);

                        const name =
                            selectedUser?.name || "—";

                        const email =
                            selectedUser?.email || "—";

                        const role =
                            selectedUser?.roleName ||
                            selectedUser?.role?.roleName ||
                            selectedUser?.role?.name ||
                            selectedUser?.role ||
                            "—";

                        const userId =
                            selectedUser?.userId || selectedUser?.id;

                        const isSystemUser =
                            String(role)
                                .trim()
                                .toUpperCase() === "SUPER_ADMIN";

                        const isVerified =
                            getVerificationStatus(selectedUser);

                        return (
                            <tr
                                key={selectedUser.id}
                                className="
                                    border-b border-gray-100
                                    text-xs transition-colors
                                    hover:bg-gray-50
                                "
                            >

                                {/* USER */}

                                <td className="px-3 py-3">
                                    <div className="
                                        flex min-w-0 items-center gap-2
                                    ">
                                        <div
                                            className={`
                                                flex h-9 w-9 min-w-[36px]
                                                items-center justify-center
                                                rounded-full text-sm font-bold
                                                ${getAvatarColor(name)}
                                            `}
                                        >
                                            {getInitials(name)}
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
                                                    title={name}
                                                >
                                                    {name}
                                                </p>

                                                {isSystemUser && (
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
                                                ID: {userId || "—"}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* EMAIL */}

                                <td className="px-3 py-3">
                                    <p
                                        className="
                                            max-w-[250px] truncate
                                            text-gray-600
                                        "
                                        title={email}
                                    >
                                        {email}
                                    </p>
                                </td>

                                {/* ROLE */}

                                <td className="px-3 py-3">
                                    <span className="
                                        inline-flex items-center gap-1.5
                                        whitespace-nowrap rounded-md
                                        bg-blue-50 px-2.5 py-1
                                        text-xs font-medium text-blue-700
                                    ">
                                        <ShieldCheck size={13} />
                                        {role}
                                    </span>
                                </td>

                                {/* VERIFICATION */}

                                <td className="px-3 py-3">
                                    {isVerified ? (
                                        <span className="
                                            inline-flex items-center gap-1.5
                                            whitespace-nowrap rounded-full
                                            bg-green-50 px-2.5 py-1
                                            text-xs font-medium text-green-700
                                        ">
                                            <CheckCircle size={13} />
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="
                                            inline-flex items-center gap-1.5
                                            whitespace-nowrap rounded-full
                                            bg-orange-50 px-2.5 py-1
                                            text-xs font-medium text-orange-700
                                        ">
                                            <XCircle size={13} />
                                            Not Verified
                                        </span>
                                    )}
                                </td>

                                {/* STATUS */}

                                <td className="px-3 py-3">
                                    <span
                                        className={`
                                            inline-block whitespace-nowrap
                                            rounded-full px-2.5 py-1
                                            text-xs font-medium
                                            ${USER_STATUS_COLORS[userStatus] ||
                                            "bg-gray-100 text-gray-700"}
                                        `}
                                    >
                                        {userStatus}
                                    </span>
                                </td>

                                {/* ACTIONS */}

                                <td className="px-4 py-3">
                                    <div className="
                                        flex items-center justify-end gap-2
                                    ">

                                        {canViewUser && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleView(selectedUser)
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

                                        {canEditUser && (
                                            <button
                                                type="button"
                                                disabled={
                                                    actionLoading ||
                                                    isSystemUser
                                                }
                                                onClick={() =>
                                                    handleEdit(selectedUser)
                                                }
                                                title={
                                                    isSystemUser
                                                        ? "System user cannot be edited"
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

                                        {canDeleteUser && (
                                            <button
                                                type="button"
                                                disabled={
                                                    actionLoading ||
                                                    isSystemUser
                                                }
                                                onClick={() =>
                                                    handleDelete(selectedUser)
                                                }
                                                title={
                                                    isSystemUser
                                                        ? "System user cannot be deleted"
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
