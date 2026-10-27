import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Building2,
    Edit,
    Eye,
    Mail,
    Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import { fetchAllEmailSignatures, deleteEmailSignature } from "../thunks/emailSignatureThunks";
import { setExistingEmailSignature } from "../slices/emailSignatureSlice";
import Pagination from "../../../common/pagination/table/Pagination";

const normalizeModule = (value) =>
    String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

const normalizeAction = (value) =>
    String(value ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");

const isAllowed = (value) => value === true || value === "true";

const statusStyles = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-700",
    DRAFT: "bg-amber-100 text-amber-700",
};

export default function EmailSignatureTable({ emailSignatures: signatureProp }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const signatureState = useSelector((state) => state.emailSignatures ?? {});
    const { loading = false, error = null, pagination = {} } = signatureState;
    const {
        pageNumber,
        pageSize,
    } = pagination || {};
    const user = useSelector((state) => state.auth?.user);
    const permissions = useSelector((state) =>
        Array.isArray(state.menuPermission?.userPermissions)
            ? state.menuPermission.userPermissions
            : []
    );

    const [deletingId, setDeletingId] = useState(null);

    const userId = user?.id;
    const roleValue =
        user?.roleName ??
        user?.role?.roleName ??
        user?.role?.name ??
        user?.role ??
        user?.authority ??
        "";
    const roleName =
        typeof roleValue === "object"
            ? roleValue?.name ?? roleValue?.roleName ?? ""
            : roleValue;
    const hasFullAccess = ["ADMIN", "SUPER_ADMIN"].includes(
        normalizeAction(roleName)
    );

    const rows = useMemo(() => {
        const supplied = Array.isArray(signatureProp) ? signatureProp : null;
        const reduxRows = Array.isArray(signatureState.emailSignatures)
            ? signatureState.emailSignatures
            : [];
        const source = supplied?.length ? supplied : reduxRows;
        return [...source].sort((a, b) => Number(a?.id ?? 0) - Number(b?.id ?? 0));
    }, [signatureProp, signatureState.emailSignatures]);

    const hasPermission = (moduleName, actionName) => {
        if (hasFullAccess) return true;

        const wantedModule = normalizeModule(moduleName);
        const wantedAction = normalizeAction(actionName);

        return permissions.some((permission) => {
            const module = normalizeModule(
                permission?.moduleName ??
                permission?.module?.moduleName ??
                permission?.module?.name ??
                ""
            );

            if (module !== wantedModule) return false;
            if (
                permission?.active === false ||
                normalizeAction(permission?.status) === "INACTIVE"
            ) {
                return false;
            }

            if (Array.isArray(permission?.actions)) {
                return permission.actions.some((action) => {
                    const actionNameValue =
                        typeof action === "string"
                            ? action
                            : action?.actionName ??
                            action?.action?.actionName ??
                            action?.action?.name ??
                            action?.name ??
                            "";
                    if (normalizeAction(actionNameValue) !== wantedAction) return false;
                    if (
                        typeof action === "object" &&
                        (
                            action?.active === false ||
                            normalizeAction(action?.status) === "INACTIVE"
                        )
                    ) {
                        return false;
                    }

                    // Some APIs return an action string when the action is granted.
                    if (typeof action === "string") return true;
                    return (
                        isAllowed(action?.allowed) ||
                        isAllowed(action?.isAllowed)
                    );
                });
            }

            const directAction = normalizeAction(
                permission?.actionName ??
                permission?.action?.actionName ??
                permission?.action?.name ??
                ""
            );

            return (
                directAction === wantedAction &&
                (
                    isAllowed(permission?.allowed) ||
                    isAllowed(permission?.isAllowed)
                )
            );
        });
    };

    // Keep the module name consistent with EmailSignatureCreateSimple.
    const canView = hasPermission("Email Signatures", "VIEW");
    const canEdit = hasPermission("Email Signatures", "EDIT");
    const canDelete = hasPermission("Email Signatures", "DELETE");

    const refreshSignatures = () => {
        if (!userId) {
            toast.error("Unable to identify the current user.");
            return;
        }
        dispatch(fetchAllEmailSignatures(userId));
    };

    const handleView = (signature) => {
        if (!canView) {
            toast.error("You do not have permission to view email signatures.");
            return;
        }
        dispatch(setExistingEmailSignature(signature));
        navigate(`/settings/emailSignatures/view/${signature.id}`);
    };

    const handleEdit = (signature) => {
        if (!canEdit) {
            toast.error("You do not have permission to edit email signatures.");
            return;
        }
        dispatch(setExistingEmailSignature(signature));
        navigate(`/settings/emailSignatures/edit/${signature.id}`);
    };

    const handleDelete = async (signature) => {
        if (!canDelete) {
            toast.error("You do not have permission to delete email signatures.");
            return;
        }
        if (!userId) {
            toast.error("Unable to identify the current user.");
            return;
        }
        if (!window.confirm(`Delete the "${signature.signatureName || "selected"}" email signature?`)) {
            return;
        }

        setDeletingId(signature.id);
        try {
            await dispatch(
                deleteEmailSignature({ id: signature.id, userId })
            ).unwrap();

            toast.success("Email signature deleted successfully.");
            await dispatch(fetchAllEmailSignatures(userId));
        } catch (requestError) {
            toast.error(
                typeof requestError === "string"
                    ? requestError
                    : requestError?.message ||
                    "Failed to delete email signature."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const initials = (name = "") =>
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "ES";

    const avatarColor = (name = "") => {
        const colors = [
            "bg-pink-100 text-pink-700",
            "bg-green-100 text-green-700",
            "bg-blue-100 text-blue-700",
            "bg-purple-100 text-purple-700",
            "bg-orange-100 text-orange-700",
            "bg-cyan-100 text-cyan-700",
            "bg-indigo-100 text-indigo-700",
        ];
        const hash = String(name).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const currentPage = Number(pagination?.pageNumber ?? pagination?.page ?? 1);
    const totalPages = Number(pagination?.totalPages ?? 1);
    const totalElements = Number(pagination?.totalElements ?? rows.length);

    if (loading && rows.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-12">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#0F4659]" />
                    <p className="text-sm text-gray-500">Loading email signatures...</p>
                </div>
            </div>
        );
    }

    if (error && rows.length === 0) {
        return (
            <div className="rounded-xl border border-red-100 bg-white p-8 text-center">
                <p className="text-sm text-red-600">
                    {typeof error === "string" ? error : error?.message ?? "Failed to load email signatures."}
                </p>
                <button
                    type="button"
                    onClick={refreshSignatures}
                    className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-[#0F4659] hover:bg-gray-50"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                <Mail className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <h3 className="text-base font-semibold text-gray-700">No email signatures found</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Create an email signature to use it in your messages.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                    <thead className="border-b border-gray-200 bg-[#FEFEFD]">
                        <tr>
                            {[
                                "Signature Name",
                                "Signature Content",
                                "User ID",
                                "Default for New Messages",
                                "Default for Replies",
                                "Status",
                                "Actions",
                            ].map((heading) => (
                                <th
                                    key={heading}
                                    className={`whitespace-nowrap px-5 py-3 
                                        text-left text-md font-semibold uppercase 
                                        tracking-wide text-gray-400
                                         ${heading === "Actions" ? "text-right" : ""
                                        }`}
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {rows.map((signature, index) => {
                            const status = String(signature?.status ?? "").toUpperCase();
                            return (
                                <tr
                                    key={signature?.id ?? index}
                                    onClick={() => handleView(signature)}
                                    className="cursor-pointer text-sm transition-colors hover:bg-gray-50"
                                >
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarColor(signature?.signatureName)}`}>
                                                {initials(signature?.signatureName)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-800">
                                                    {signature?.signatureName || "—"}
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    ID: #{signature?.id ?? "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="max-w-[360px] px-5 py-3">
                                        <p
                                            className="max-w-[340px] whitespace-normal break-words text-gray-600"
                                            title={signature?.signatureContent ?? ""}
                                        >
                                            {String(signature?.signatureContent ?? "")
                                                .replace(/<[^>]*>/g, " ")
                                                .replace(/\s+/g, " ")
                                                .trim() || "—"}
                                        </p>
                                    </td>

                                    <td className="px-5 py-3 text-gray-600">
                                        {signature?.userId ?? "—"}
                                    </td>

                                    <td className="px-5 py-3">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${signature?.defaultForNewMessages ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                                            {signature?.defaultForNewMessages ? "Yes" : "No"}
                                        </span>
                                    </td>

                                    <td className="px-5 py-3">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${signature?.defaultForReplies ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                                            {signature?.defaultForReplies ? "Yes" : "No"}
                                        </span>
                                    </td>

                                    <td className="px-5 py-3">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status] ?? "bg-gray-100 text-gray-700"}`}>
                                            {signature?.status || "—"}
                                        </span>
                                    </td>

                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleView(signature);
                                                }}
                                                disabled={!canView}
                                                title={canView ? "View" : "You do not have view permission"}
                                                aria-label={`View ${signature?.signatureName ?? "email signature"}`}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Eye size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleEdit(signature);
                                                }}
                                                disabled={!canEdit}
                                                title={canEdit ? "Edit" : "You do not have edit permission"}
                                                aria-label={`Edit ${signature?.signatureName ?? "email signature"}`}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Edit size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleDelete(signature);
                                                }}
                                                disabled={!canDelete || deletingId === signature?.id}
                                                title={canDelete ? "Delete" : "You do not have delete permission"}
                                                aria-label={`Delete ${signature?.signatureName ?? "email signature"}`}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                {deletingId === signature?.id ? (
                                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <Pagination
                    page={Number(pageNumber) || 0}
                    size={Number(pageSize) || 10}
                    totalElements={Number(totalElements) || 0}
                    totalPages={Number(totalPages) || 0}
                    loading={loading}
                    label="emailSignatures"
                    onPageChange={(nextPage) => {
                        dispatch(
                            fetchAllEmailSignatures({
                                page: nextPage,
                                size: Number(pageSize) || 10,
                            })
                        );
                    }}
                    onPageSizeChange={(nextSize) => {
                        dispatch(
                            fetchAllEmailSignatures({
                                page: 0,
                                size: nextSize,
                            })
                        );
                    }}
                />


            </div>
        </div>
    );
}
