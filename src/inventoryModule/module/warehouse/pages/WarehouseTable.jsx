
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    Edit,
    Trash2,
    Landmark,
    Eye,
    MapPin,
    Phone,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchAllWarehouse,
    deleteWarehouse,
} from "../thunks/warehouseThunks";

import {
    setExistingWarehouse,
} from "../slices/warehouseSlice";

import Pagination from "../../../../common/pagination/table/Pagination";

export default function WarehouseTable({ warehouses }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        warehouses: reduxWarehouses = [],
        loading,
        error,
        pagination = {},
    } = useSelector((state) => state.warehouse || {});

    const {
        pageNumber = 0,
        pageSize = 20,
        totalPages = 0,
        totalElements = 0,
    } = pagination;

    const currentWarehouses = Array.isArray(warehouses)
        ? warehouses
        : reduxWarehouses;

    /* =====================================================
       AUTH STATE
    ===================================================== */

    const user = useSelector(
        (state) => state.auth?.user
    );

    const permissions = useSelector(
        (state) => state.menuPermission?.userPermissions || []
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

    const normalizedRole = String(roleName).trim().toUpperCase();

    const hasFullAccess =
        normalizedRole === "SUPER_ADMIN" ||
        normalizedRole === "ADMIN";

    /* =====================================================
       PERMISSION CHECK
    ===================================================== */

    const hasPermission = (moduleName, actionName) => {
        if (hasFullAccess) return true;

        if (!Array.isArray(permissions)) return false;

        const requestedModule = String(moduleName).trim().toLowerCase();
        const requestedAction = String(actionName).trim().toUpperCase();

        return permissions.some((permission) => {
            const permissionModule = String(
                permission?.moduleName ||
                permission?.module?.moduleName ||
                permission?.module?.name ||
                ""
            ).trim().toLowerCase();

            if (permissionModule !== requestedModule) return false;

            if (permission?.active === false) return false;

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
                    ).trim().toUpperCase();

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
            ).trim().toUpperCase();

            const allowed =
                permission?.allowed === true ||
                permission?.allowed === "true";

            return (
                permissionAction === requestedAction &&
                allowed
            );
        });
    };

    const canViewWarehouse = hasPermission("Warehouses", "VIEW");
    const canEditWarehouse = hasPermission("Warehouses", "EDIT");
    const canDeleteWarehouse = hasPermission("Warehouses", "DELETE");

    /* =====================================================
       DELETE WAREHOUSE
    ===================================================== */

    const handleDelete = async (id) => {
        if (!canDeleteWarehouse) {
            toast.error("You do not have permission to delete Warehouse.");
            return;
        }

        if (!window.confirm("Delete this Warehouse?")) return;

        try {
            await dispatch(deleteWarehouse(id)).unwrap();

            toast.success("Warehouse deleted successfully");

            dispatch(
                fetchAllWarehouse({
                    page: pageNumber,
                    size: pageSize,
                })
            );
        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message || "Failed to delete Warehouse"
            );
        }
    };

    /* =====================================================
       VIEW WAREHOUSE
    ===================================================== */

    const handleView = (warehouse) => {
        if (!canViewWarehouse) {
            toast.error("You do not have permission to view Warehouses.");
            return;
        }

        dispatch(setExistingWarehouse(warehouse));

        navigate(`/settings/warehouses/view/${warehouse.id}`);
    };

    /* =====================================================
       EDIT WAREHOUSE
    ===================================================== */

    const handleEdit = (warehouse) => {
        if (!canEditWarehouse) {
            toast.error("You do not have permission to edit Warehouse.");
            return;
        }

        dispatch(setExistingWarehouse(warehouse));

        navigate(`/inventory/warehouses/edit/${warehouse.id}`);
    };

    /* =====================================================
       INITIALS
    ===================================================== */

    const initials = (name = "") => {
        return (
            name
                .split(" ")
                .filter(Boolean)
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "WH"
        );
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
        const index =
            name.split("").reduce(
                (acc, char) => acc + char.charCodeAt(0),
                0
            ) % avatarColors.length;

        return avatarColors[index];
    };

    /* =====================================================
       STATUS COLORS
    ===================================================== */

    const statusColor = {
        ACTIVE: "bg-green-100 text-green-700",
        INACTIVE: "bg-gray-100 text-gray-700",
        DRAFT: "bg-yellow-100 text-yellow-700",
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentWarehouses.length) {
        return (
            <div className="flex items-center justify-center py-10">
                <p className="text-gray-500">Loading warehouses...</p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentWarehouses.length) {
        return (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!currentWarehouses.length) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                <Landmark className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                <p className="text-gray-500">
                    No warehouses found.
                </p>
            </div>
        );
    }

    /* =====================================================
       TABLE
    ===================================================== */

    return (
        <div className="overflow-x-auto overflow-y-visible rounded-xl border border-gray-200 bg-white">
            <table className="w-full">
                <thead className="border-b border-gray-300 bg-[#FAF9F7]/20">
                    <tr>
                        {[
                            "Warehouse",
                            "Contact Person",
                            "Phone",
                            "Location",
                            "Status",
                            "Actions",
                        ].map((header) => (
                            <th
                                key={header}
                                className={`
                                    px-5 py-3 text-md font-medium
                                    uppercase text-gray-400
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

                <tbody>
                    {[...currentWarehouses]
                        .sort((a, b) => (a.id || 0) - (b.id || 0))
                        .map((warehouse, index) => (
                            <tr
                                key={warehouse.id || index}
                                className="
                                    cursor-pointer border-b border-gray-100
                                    text-xs transition-colors hover:bg-gray-50
                                "
                            >
                                {/* WAREHOUSE */}

                                <td className="overflow-hidden px-3 py-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div
                                            className={`
                                                flex h-9 w-9 min-w-[36px]
                                                items-center justify-center
                                                rounded-full text-sm font-bold
                                                ${getAvatarColor(warehouse.warehouseName)}
                                            `}
                                        >
                                            {initials(warehouse.warehouseName)}
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className="truncate font-medium text-gray-800"
                                                title={warehouse.warehouseName || ""}
                                            >
                                                {warehouse.warehouseName || "—"}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {warehouse.warehouseCode || "—"}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* CONTACT PERSON */}

                                <td className="px-3 py-3">
                                    <p className="font-medium text-gray-700">
                                        {warehouse.contactPerson || "—"}
                                    </p>

                                    <p
                                        className="truncate text-xs text-gray-500"
                                        title={warehouse.email || ""}
                                    >
                                        {warehouse.email || "—"}
                                    </p>
                                </td>

                                {/* PHONE */}

                                <td className="px-3 py-3">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Phone size={13} className="text-gray-400" />
                                        {warehouse.phone || "—"}
                                    </div>
                                </td>

                                {/* LOCATION */}

                                <td className="px-3 py-3">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <MapPin size={14} className="shrink-0 text-gray-400" />

                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {warehouse.city || "—"}
                                            </p>

                                            <p className="truncate text-xs text-gray-500">
                                                {warehouse.state || ""}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* STATUS */}

                                <td className="px-3 py-3">
                                    <span
                                        className={`
                                            inline-block rounded-full px-2 py-1
                                            text-xs font-medium
                                            ${statusColor[
                                            String(warehouse.status || "").toUpperCase()
                                            ] || "bg-gray-100 text-gray-700"}
                                        `}
                                    >
                                        {warehouse.status || "—"}
                                    </span>
                                </td>

                                {/* ACTIONS */}

                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* VIEW */}

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleView(warehouse);
                                            }}
                                            title="View"
                                            className="
                                                flex h-8 w-8 items-center justify-center
                                                rounded-lg bg-blue-50 text-blue-600
                                                transition hover:bg-blue-100 hover:text-blue-700
                                            "
                                        >
                                            <Eye size={16} />
                                        </button>

                                        {/* EDIT */}

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(warehouse);
                                            }}
                                            title="Edit"
                                            className="
                                                flex h-8 w-8 items-center justify-center
                                                rounded-lg bg-amber-50 text-amber-600
                                                transition hover:bg-amber-100 hover:text-amber-700
                                            "
                                        >
                                            <Edit size={16} />
                                        </button>

                                        {/* DELETE */}

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(warehouse.id);
                                            }}
                                            title="Delete"
                                            className="
                                                flex h-8 w-8 items-center justify-center
                                                rounded-lg bg-red-50 text-red-600
                                                transition hover:bg-red-100 hover:text-red-700
                                            "
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

            {/* PAGINATION */}

            <Pagination
                page={Number(pageNumber) || 0}
                size={Number(pageSize) || 20}
                totalElements={Number(totalElements) || 0}
                totalPages={Number(totalPages) || 0}
                loading={loading}
                label="warehouses"
                onPageChange={(nextPage) => {
                    dispatch(
                        fetchAllWarehouse({
                            page: nextPage,
                            size: Number(pageSize) || 20,
                        })
                    );
                }}
                onPageSizeChange={(nextSize) => {
                    dispatch(
                        fetchAllWarehouse({
                            page: 0,
                            size: nextSize,
                        })
                    );
                }}
            />
        </div>
    );
}
