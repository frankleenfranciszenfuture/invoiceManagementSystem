import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Download, Plus } from "lucide-react";
import toast from "react-hot-toast";

import EmailSignatureTable from "./EmailSignatureTable";
import NavbarEmailSignature from "../components/bars/nav/NavbarEmailSignature";
import { fetchAllEmailSignatures } from "../thunks/emailSignatureThunks";
import { getUserPermission } from "../../menuPermission/thunks/menuPermissionThunks";
import {
    setEmailSignatureStatus,
    setSelectedEmailSignatureView,
} from "../slices/emailSignatureViewSlice";
import { openModal } from "../../ui/uiSlice";
import InvoiceSkeleton from "../../../common/loader/InvoiceSkeleton";

const normalizeAction = (value) =>
    String(value ?? "").trim().toUpperCase().replace(/[\\s-]+/g, "_");

const normalizeModule = (value) =>
    String(value ?? "").trim().toLowerCase().replace(/\\s+/g, " ");

const isAllowed = (value) => value === true || value === "true";

export default function EmailSignatureDashboard() {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    // Auth state
    const authState = useSelector((state) => state.auth || {});
    const user = authState.user;
    const isAuthenticated = authState.isAuthenticated === true;
    const authChecking = Boolean(authState.authChecking ?? authState.loading);

    // Permission state
    const permissionState = useSelector((state) => state.menuPermission || {});
    const permissions = Array.isArray(permissionState.userPermissions)
        ? permissionState.userPermissions
        : [];
    const permissionLoading = Boolean(
        permissionState.userPermissionsLoading ?? permissionState.loading
    );
    const permissionsLoaded =
        permissionState.userPermissionsLoaded === true ||
        permissionState.permissionsLoaded === true ||
        permissionState.loaded === true ||
        permissionState.userPermissions != null;

    // Role
    const role = user?.roleName ||
        user?.role?.roleName ||
        user?.role?.name ||
        user?.role ||
        user?.authority ||
        "";
    const normalizedRole = normalizeAction(
        typeof role === "object" ? role?.name || role?.roleName : role
    );
    const hasFullAccess = ["ADMIN", "SUPER_ADMIN"].includes(normalizedRole);

    // Permission checking supports both grouped and flat permission payloads.
    const hasPermission = (moduleName, actionName) => {
        if (hasFullAccess) return true;

        const requestedModule = normalizeModule(moduleName);
        const requestedAction = normalizeAction(actionName);

        return permissions.some((permission) => {
            const module = normalizeModule(
                permission?.moduleName ||
                permission?.module?.moduleName ||
                permission?.module?.name
            );
            if (module !== requestedModule) return false;

            if (
                permission?.active === false ||
                normalizeAction(permission?.status) === "INACTIVE"
            ) return false;

            const actions = Array.isArray(permission?.actions)
                ? permission.actions
                : null;

            if (actions) {
                return actions.some((action) => {
                    const name = normalizeAction(
                        typeof action === "string"
                            ? action
                            : action?.actionName ||
                            action?.action?.actionName ||
                            action?.action?.name ||
                            action?.name
                    );
                    if (name !== requestedAction) return false;

                    if (typeof action === "string") return true;

                    return (
                        action?.active !== false &&
                        normalizeAction(action?.status) !== "INACTIVE" &&
                        (
                            isAllowed(action?.allowed) ||
                            isAllowed(action?.isAllowed)
                        )
                    );
                });
            }

            const directAction = normalizeAction(
                permission?.actionName ||
                permission?.action?.actionName ||
                permission?.action?.name
            );
            return (
                directAction === requestedAction &&
                (
                    isAllowed(permission?.allowed) ||
                    isAllowed(permission?.isAllowed)
                )
            );
        });
    };

    const canViewEmailSignature = hasPermission("Email Signatures", "VIEW") ||
        hasPermission("Email Signature", "VIEW");
    const canCreateEmailSignature = hasPermission("Email Signatures", "CREATE") ||
        hasPermission("Email Signature", "CREATE");

    // Email signature state
    const emailSignaturesState = useSelector(
        (state) => state.emailSignatures || {}
    );
    const emailSignatures = Array.isArray(emailSignaturesState.emailSignatures)
        ? emailSignaturesState.emailSignatures
        : [];
    const loading = Boolean(emailSignaturesState.loading);
    const error = emailSignaturesState.error;

    // Status filter
    const emailSignatureStatus = useSelector(
        (state) => state.emailSignatureView?.emailSignatureStatus || "ALL"
    );

    // Load permissions for non-admin users.
    useEffect(() => {
        if (
            authChecking ||
            !isAuthenticated ||
            hasFullAccess ||
            permissionsLoaded ||
            permissionLoading
        ) return;

        dispatch(getUserPermission());
    }, [
        authChecking,
        isAuthenticated,
        hasFullAccess,
        permissionsLoaded,
        permissionLoading,
        dispatch,
    ]);

    // Fetch signatures only when the user is allowed to view them.
    useEffect(() => {
        if (authChecking || !isAuthenticated) return;
        if (!user?.id) return;

        if (!hasFullAccess) {
            if (permissionLoading || !permissionsLoaded || !canViewEmailSignature) {
                return;
            }
        }

        dispatch(fetchAllEmailSignatures(user.id));
    }, [
        authChecking,
        isAuthenticated,
        user?.id,
        hasFullAccess,
        permissionLoading,
        permissionsLoaded,
        canViewEmailSignature,
        dispatch,
    ]);

    // Sync URL filter to Redux.
    useEffect(() => {
        const urlStatus = searchParams.get("emailSignatureStatus");
        if (!urlStatus) return;

        const normalizedStatus = urlStatus.trim().toUpperCase();
        const validStatuses = ["ALL", "ACTIVE", "INACTIVE", "DRAFT"];
        if (!validStatuses.includes(normalizedStatus)) return;

        dispatch(setEmailSignatureStatus(normalizedStatus));

        const statusLabels = {
            ALL: "All Email Signatures",
            ACTIVE: "Active Email Signatures",
            INACTIVE: "Inactive Email Signatures",
            DRAFT: "Draft Email Signatures",
        };

        dispatch(setSelectedEmailSignatureView(statusLabels[normalizedStatus]));
    }, [searchParams, dispatch]);

    const filteredEmailSignatures = useMemo(() => {
        const selectedStatus = String(emailSignatureStatus || "ALL").toUpperCase();
        if (selectedStatus === "ALL") return emailSignatures;

        return emailSignatures.filter(
            (signature) =>
                String(signature?.status || "").toUpperCase() === selectedStatus
        );
    }, [emailSignatures, emailSignatureStatus]);

    const handleCreateEmailSignature = () => {
        if (!canCreateEmailSignature) {
            toast.error("You do not have permission to create email signatures.");
            return;
        }

        dispatch(openModal({ type: "addEmailSignature", data: null }));
    };

    if (authChecking) return <InvoiceSkeleton />;

    if (!isAuthenticated) return null;

    if (!hasFullAccess && (permissionLoading || !permissionsLoaded)) {
        return <InvoiceSkeleton />;
    }

    if (!canViewEmailSignature) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 font-sans">
                <div className="px-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-semibold text-red-500">
                        !
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Access Denied</h2>
                    <p className="mt-1 max-w-sm text-sm text-gray-500">
                        You do not have permission to view email signatures.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) return <InvoiceSkeleton />;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-[13px]">
            <div className="min-h-0 flex-1 overflow-y-auto bg-white">
                <div className="w-full px-2 py-5">
                    <NavbarEmailSignature />

                    {error && (
                        <div className="mx-2 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            <div className="flex items-center justify-between gap-3">
                                <span>{typeof error === "string" ? error : error?.message || "Failed to load email signatures."}</span>
                                <button
                                    type="button"
                                    onClick={() => dispatch(fetchAllEmailSignatures(user.id))}
                                    className="shrink-0 font-medium underline"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {filteredEmailSignatures.length > 0 ? (
                        <EmailSignatureTable emailSignatures={filteredEmailSignatures} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16">
                            <h2 className="text-lg font-semibold text-gray-800">
                                No email signatures found
                            </h2>
                            <p className="mt-2 max-w-md text-center text-sm text-gray-500">
                                {emailSignatureStatus === "ALL"
                                    ? "There are no email signatures to display."
                                    : `There are no ${String(emailSignatureStatus).toLowerCase()} email signatures.`}
                            </p>

                            <div className="mt-6 flex items-center gap-3">
                                {canCreateEmailSignature && (
                                    <button
                                        type="button"
                                        onClick={handleCreateEmailSignature}
                                        className="flex items-center gap-2 rounded-md bg-[#0F4659] px-4 py-2 text-white transition hover:bg-[#0F4659]/90"
                                    >
                                        <Plus size={16} />
                                        Create New Email Signature
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => toast("Import is not implemented yet.")}
                                    className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 transition hover:bg-gray-50"
                                >
                                    <Download size={16} />
                                    Import File
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
