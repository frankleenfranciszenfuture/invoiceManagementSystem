import usePermissions from "./usePermissions";

export default function PermissionGuard({
    module,
    action = "VIEW",
    children,
    fallback = null,
}) {
    const { can, permissionsLoaded, permissionsLoading } =
        usePermissions();

    if (permissionsLoading || !permissionsLoaded) {
        return null;
    }

    return can(module, action)
        ? children
        : fallback;
}