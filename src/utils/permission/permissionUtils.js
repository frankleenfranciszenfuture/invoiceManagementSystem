import { useMemo } from "react";

export const normalizeModule = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const normalizeAction = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

export const getRoleName = (user) => {
  const role =
    user?.roleName ??
    user?.role?.roleName ??
    user?.role?.name ??
    user?.role ??
    user?.authority ??
    "";

  return typeof role === "string" ? role.trim().toUpperCase() : "";
};

export const hasFullAccess = (user) => {
  const roleName = getRoleName(user);

  return roleName === "ADMIN" || roleName === "SUPER_ADMIN";
};

const isActive = (item) =>
  item?.active !== false && normalizeAction(item?.status) !== "INACTIVE";

const isAllowed = (item) => item?.allowed === true || item?.allowed === "true";

const getModuleName = (permission) =>
  permission?.moduleName ??
  permission?.module?.moduleName ??
  permission?.module?.name ??
  "";

const getActionName = (permission) =>
  permission?.actionName ??
  permission?.action?.actionName ??
  permission?.action?.name ??
  permission?.name ??
  "";

const matchesPermission = (permission, moduleName, actionName) => {
  if (!isActive(permission)) {
    return false;
  }

  if (
    normalizeModule(getModuleName(permission)) !== normalizeModule(moduleName)
  ) {
    return false;
  }

  if (Array.isArray(permission?.actions)) {
    return permission.actions.some((action) => {
      if (typeof action === "string") {
        return normalizeAction(action) === normalizeAction(actionName);
      }

      return (
        isActive(action) &&
        normalizeAction(
          action?.actionName ??
            action?.action?.actionName ??
            action?.action?.name ??
            action?.name ??
            "",
        ) === normalizeAction(actionName) &&
        isAllowed(action)
      );
    });
  }

  return (
    normalizeAction(getActionName(permission)) ===
      normalizeAction(actionName) && isAllowed(permission)
  );
};

/**
 * User-specific permission takes precedence over role permission.
 * An explicit user denial overrides a role-level grant.
 */
export const checkPermission = ({
  user,
  rolePermissions = [],
  userPermissions = [],
  moduleName,
  actionName,
}) => {
  if (hasFullAccess(user)) {
    return true;
  }

  const userPermission = userPermissions.find(
    (permission) =>
      isActive(permission) &&
      normalizeModule(getModuleName(permission)) ===
        normalizeModule(moduleName) &&
      (normalizeAction(getActionName(permission)) ===
        normalizeAction(actionName) ||
        permission?.actions?.some(
          (action) =>
            typeof action !== "string" &&
            normalizeAction(
              action?.actionName ??
                action?.action?.actionName ??
                action?.action?.name ??
                action?.name ??
                "",
            ) === normalizeAction(actionName),
        )),
  );

  if (userPermission) {
    if (Array.isArray(userPermission.actions)) {
      const actionPermission = userPermission.actions.find(
        (action) =>
          typeof action !== "string" &&
          normalizeAction(
            action?.actionName ??
              action?.action?.actionName ??
              action?.action?.name ??
              action?.name ??
              "",
          ) === normalizeAction(actionName),
      );

      if (actionPermission) {
        return isActive(actionPermission) && isAllowed(actionPermission);
      }
    } else {
      return isAllowed(userPermission);
    }
  }

  return rolePermissions.some((permission) =>
    matchesPermission(permission, moduleName, actionName),
  );
};
