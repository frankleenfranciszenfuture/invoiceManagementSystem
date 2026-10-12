import { useMemo } from "react";
import { useSelector } from "react-redux";

import { checkPermission, hasFullAccess } from "./permissionUtils";

export default function usePermissions() {
  const user = useSelector((state) => state.auth?.user);

  const rolePermissions = useSelector((state) =>
    Array.isArray(state.menuPermission?.rolePermissions)
      ? state.menuPermission.rolePermissions
      : [],
  );

  const userPermissions = useSelector((state) =>
    Array.isArray(state.menuPermission?.userPermissions)
      ? state.menuPermission.userPermissions
      : [],
  );

  const permissionsLoading = useSelector(
    (state) => state.menuPermission?.userPermissionsLoading === true,
  );

  const permissionsLoaded = useSelector(
    (state) => state.menuPermission?.userPermissionsLoaded === true,
  );

  const isAdmin = hasFullAccess(user);

  const can = (moduleName, actionName) => {
    if (isAdmin) {
      return true;
    }

    if (!permissionsLoaded || permissionsLoading) {
      return false;
    }

    return checkPermission({
      user,
      rolePermissions,
      userPermissions,
      moduleName,
      actionName,
    });
  };

  return {
    user,
    isAdmin,
    can,
    permissionsLoading,
    permissionsLoaded,
    canView: (moduleName) => can(moduleName, "VIEW"),
    canCreate: (moduleName) => can(moduleName, "CREATE"),
    canEdit: (moduleName) => can(moduleName, "EDIT"),
    canDelete: (moduleName) => can(moduleName, "DELETE"),
    canApprove: (moduleName) => can(moduleName, "APPROVE"),
    canExport: (moduleName) => can(moduleName, "EXPORT"),
    canImport: (moduleName) => can(moduleName, "IMPORT"),
  };
}
