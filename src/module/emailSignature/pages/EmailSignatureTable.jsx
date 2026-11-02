
import React from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    deleteEmailSignature,
    fetchAllEmailSignatures,
} from "../thunks/emailSignatureThunks";

import {
    setExistingEmailSignature,
} from "../slices/emailSignatureSlice";

import {
    Edit,
    Trash2,
    Mail,
    Eye,
    Hash,
    User,
    Star,
    Reply,
} from "lucide-react";

import toast from "react-hot-toast";

import Pagination from "../../../common/pagination/table/Pagination";

export default function EmailSignatureTable({
    emailSignatures = [],
}) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        loading,
        error,
        pagination = {},
    } = useSelector((state) => state.emailSignatures || {});

    const {
        pageNumber = 0,
        pageSize = 10,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

    const currentEmailSignatures = emailSignatures || [];

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    const userId = user?.id;

    /* =====================================================
       PERMISSION STATE
    ===================================================== */

    const permissions = useSelector(
        (state) =>
            state.menuPermission?.userPermissions || []
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

    const isSuperAdmin =
        normalizedRole === "SUPER_ADMIN";

    const isAdmin =
        normalizedRole === "ADMIN";

    const hasFullAccess =
        isSuperAdmin || isAdmin;

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = (
        moduleName,
        actionName
    ) => {

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
                String(permission?.status || "")
                    .trim()
                    .toUpperCase() === "INACTIVE"
            ) {
                return false;
            }

            /* GROUPED ACTIONS */

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
                        String(action?.status || "")
                            .trim()
                            .toUpperCase() === "INACTIVE"
                    ) {
                        return false;
                    }

                    return (
                        permissionAction === requestedAction &&
                        allowed
                    );

                });
            }

            /* FLAT ACTION */

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

    };

    /* =====================================================
       EMAIL SIGNATURE PERMISSIONS
    ===================================================== */

    const canViewEmailSignature = hasPermission(
        "Email Signatures",
        "VIEW"
    );

    const canEditEmailSignature = hasPermission(
        "Email Signatures",
        "EDIT"
    );

    const canDeleteEmailSignature = hasPermission(
        "Email Signatures",
        "DELETE"
    );

    /* =====================================================
       FETCH EMAIL SIGNATURES
    ===================================================== */

    const reloadEmailSignatures = (
        page = Number(pageNumber) || 0,
        size = Number(pageSize) || 10
    ) => {

        if (!userId) {
            return;
        }

        dispatch(
            fetchAllEmailSignatures(userId)
        );

    };

    /* =====================================================
       DELETE EMAIL SIGNATURE
    ===================================================== */

    const handleDelete = async (id) => {

        if (!canDeleteEmailSignature) {

            toast.error(
                "You do not have permission to delete email signatures."
            );

            return;
        }

        if (!userId) {
            toast.error("User information not found.");
            return;
        }

        if (
            !window.confirm(
                "Delete this email signature?"
            )
        ) {
            return;
        }

        try {

            await dispatch(
                deleteEmailSignature({
                    id,
                    userId,
                })
            ).unwrap();

            toast.success(
                "Email signature deleted successfully"
            );

            reloadEmailSignatures();

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    "Failed to delete email signature"
            );

        }

    };

    /* =====================================================
       VIEW EMAIL SIGNATURE
    ===================================================== */

    const handleView = (signature) => {

        if (!canViewEmailSignature) {

            toast.error(
                "You do not have permission to view email signatures."
            );

            return;
        }

        try {

            dispatch(
                setExistingEmailSignature(signature)
            );

            navigate(
                `/settings/emailSignatures/view/${signature.id} `
            );

        } catch (error) {

            toast.error(
                "Failed to open email signature"
            );

        }

    };

    /* =====================================================
       EDIT EMAIL SIGNATURE
    ===================================================== */

    const handleEdit = (signature) => {

        if (!canEditEmailSignature) {

            toast.error(
                "You do not have permission to edit email signatures."
            );

            return;
        }

        try {

            dispatch(
                setExistingEmailSignature(signature)
            );

            navigate(
                `/settings/emailSignatures/edit/${signature.id} `
            );

        } catch (error) {

            toast.error(
                "Failed to open email signature"
            );

        }

    };

    /* =====================================================
       SIGNATURE INITIALS
    ===================================================== */

    const initials = (signatureName) => {

        if (!signatureName) {
            return "ES";
        }

        return signatureName
            .split(" ")
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "ES";

    };

    /* =====================================================
       STATUS COLORS
    ===================================================== */

    const statusColor = {

        ACTIVE:
            "bg-green-100 text-green-700",

        INACTIVE:
            "bg-gray-100 text-gray-700",

        DRAFT:
            "bg-yellow-100 text-yellow-700",

    };

    /* =====================================================
       AVATAR COLORS
    ===================================================== */

    const avatarColors = [

        "bg-pink-500 text-white",
        "bg-green-500 text-white",
        "bg-blue-500 text-white",
        "bg-purple-500 text-white",
        "bg-orange-500 text-white",
        "bg-cyan-500 text-white",
        "bg-indigo-500 text-white",

    ];

    const getAvatarColor = (name = "") => {

        const index = name
            .split("")
            .reduce(
                (acc, char) =>
                    acc + char.charCodeAt(0),
                0
            ) % avatarColors.length;

        return avatarColors[index];

    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="flex items-center justify-center py-10">

                <p className="text-gray-500">
                    Loading email signatures...
                </p>

            </div>

        );

    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div
                className="
                    rounded-xl border border-red-200
                    bg-white p-8 text-center
                "
            >

                <p className="text-red-500">
                    {error}
                </p>

            </div>

        );

    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentEmailSignatures.length) {

        return (

            <div
                className="
                    rounded-2xl border border-gray-200
                    bg-white p-8 text-center
                "
            >

                <Mail
                    className="
                        mx-auto mb-3 h-10 w-10
                        text-gray-300
                    "
                />

                <p className="text-gray-500">
                    No email signatures found.
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

            <div className="overflow-x-auto overflow-y-visible">

                <table className="w-full">

                    {/* TABLE HEADER */}

                    <thead className="
                        border-b border-gray-300
                        bg-[#FAF9F7]/20
                    ">

                        <tr>

                            {[
                                "Signature",
                                "User ID",
                                "Default for New",
                                "Default for Replies",
                                "Status",
                                "Actions",
                            ].map((header) => (

                                <th
                                    key={header}
                                    className={`
px - 5 py - 3
text - md font - medium
                                        uppercase text - gray - 400
                                        ${header === "Actions"
                                            ? "text-right"
                                            : "text-left"
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

                        {[...currentEmailSignatures]
                            .sort(
                                (a, b) =>
                                    (a.id || 0) - (b.id || 0)
                            )
                            .map((signature, index) => (

                                <tr
                                    key={signature.id || index}
                                    className="
                                        cursor-pointer border-b
                                        border-gray-100 text-xs
                                        transition-colors hover:bg-gray-50
                                    "
                                >

                                    {/* SIGNATURE */}

                                    <td className="overflow-hidden px-2 py-3">

                                        <div className="
                                            flex min-w-0 items-center gap-2
                                        ">

                                            <div className={`
                                                flex h - 9 min - w - [36px]
w - 9 items - center justify - center
rounded - full text - sm font - bold
                                                ${getAvatarColor(
                                                signature.signatureName
                                            )
                                                }
`}>

                                                {initials(signature.signatureName)}

                                            </div>

                                            <div className="min-w-0">

                                                <p
                                                    className="
                                                        truncate font-medium
                                                        text-gray-800
                                                    "
                                                    title={signature.signatureName || ""}
                                                >
                                                    {signature.signatureName || "—"}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    ID: #{signature.id}
                                                </p>

                                            </div>

                                        </div>

                                    </td>

                                    {/* USER ID */}

                                    <td className="overflow-hidden px-2 py-3">

                                        <div className="
                                            flex items-center gap-1.5
                                        ">

                                            <User
                                                size={13}
                                                className="text-gray-400"
                                            />

                                            <p className="
                                                font-medium text-gray-700
                                            ">
                                                {signature.userId ?? "—"}
                                            </p>

                                        </div>

                                    </td>

                                    {/* DEFAULT FOR NEW MESSAGES */}

                                    <td className="overflow-hidden px-2 py-3">

                                        <div className="
                                            flex items-center gap-1.5
                                        ">

                                            <Star
                                                size={14}
                                                className={
                                                    signature.defaultForNewMessages
                                                        ? "text-green-500"
                                                        : "text-gray-400"
                                                }
                                            />

                                            <span className={`
inline - block rounded - full
px - 2 py - 1 text - xs font - medium
                                                ${signature.defaultForNewMessages
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }
`}>
                                                {signature.defaultForNewMessages
                                                    ? "Default"
                                                    : "No"
                                                }
                                            </span>

                                        </div>

                                    </td>

                                    {/* DEFAULT FOR REPLIES */}

                                    <td className="overflow-hidden px-2 py-3">

                                        <div className="
                                            flex items-center gap-1.5
                                        ">

                                            <Reply
                                                size={14}
                                                className={
                                                    signature.defaultForReplies
                                                        ? "text-green-500"
                                                        : "text-gray-400"
                                                }
                                            />

                                            <span className={`
inline - block rounded - full
px - 2 py - 1 text - xs font - medium
                                                ${signature.defaultForReplies
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }
`}>
                                                {signature.defaultForReplies
                                                    ? "Default"
                                                    : "No"
                                                }
                                            </span>

                                        </div>

                                    </td>

                                    {/* STATUS */}

                                    <td className="overflow-hidden px-2 py-3">

                                        <span className={`
inline - block rounded - full
px - 2 py - 1 text - xs font - medium
                                            ${statusColor[
                                            String(
                                                signature.status || ""
                                            ).toUpperCase()
                                            ] ||
                                            "bg-gray-100 text-gray-700"
                                            }
`}>
                                            {signature.status || "—"}
                                        </span>

                                    </td>

                                    {/* ACTIONS */}

                                    <td className="px-4 py-3">

                                        <div className="
                                            flex items-center justify-end gap-2
                                        ">

                                            {/* VIEW */}

                                            {canViewEmailSignature && (

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleView(signature);
                                                    }}
                                                    title="View"
                                                    className="
                                                        flex h-8 w-8 items-center
                                                        justify-center rounded-lg
                                                        bg-blue-50 text-blue-600
                                                        transition hover:bg-blue-100
                                                        hover:text-blue-700
                                                    "
                                                >
                                                    <Eye size={16} />
                                                </button>

                                            )}

                                            {/* EDIT */}

                                            {canEditEmailSignature && (

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(signature);
                                                    }}
                                                    title="Edit"
                                                    className="
                                                        flex h-8 w-8 items-center
                                                        justify-center rounded-lg
                                                        bg-amber-50 text-amber-600
                                                        transition hover:bg-amber-100
                                                        hover:text-amber-700
                                                    "
                                                >
                                                    <Edit size={16} />
                                                </button>

                                            )}

                                            {/* DELETE */}

                                            {canDeleteEmailSignature && (

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(signature.id);
                                                    }}
                                                    title="Delete"
                                                    className="
                                                        flex h-8 w-8 items-center
                                                        justify-center rounded-lg
                                                        bg-red-50 text-red-600
                                                        transition hover:bg-red-100
                                                        hover:text-red-700
                                                    "
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            )}

                                        </div>

                                    </td>

                                </tr>

                            ))}

                    </tbody>

                </table>

                {/* PAGINATION */}

                <Pagination
                    page={Number(pageNumber) || 0}
                    size={Number(pageSize) || 10}
                    totalElements={Number(totalElements) || 0}
                    totalPages={Number(totalPages) || 0}
                    loading={loading}
                    label="email signatures"
                    onPageChange={() => {
                        reloadEmailSignatures();
                    }}
                    onPageSizeChange={() => {
                        reloadEmailSignatures(0);
                    }}
                />

            </div>

        </div>

    );

}
