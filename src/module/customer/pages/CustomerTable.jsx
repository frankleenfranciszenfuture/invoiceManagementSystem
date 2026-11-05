
import React, { useCallback, useMemo } from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    Eye,
    Users,
    Wallet,
    Mail,
    Phone,
    Edit,
    Trash2,
    Badge,
    FileUser,
    ReceiptIndianRupee,
    Coins,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchAllCustomers,
    removeCustomer,
} from "../thunks/customerThunks";

import {
    setSelectedCustomer,
} from "../slices/customerSlices";

import Pagination from "../../../common/pagination/table/Pagination";
import ToolTipText from "../../../common/toolTip/ToolTipText";

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

const CUSTOMER_STATUS_COLORS = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-700",
};

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (value = "") => {
    return (
        String(value)
            .split(/[\s-]+/)
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "CU"
    );
};

const getAvatarColor = (value = "") => {
    const index = String(value)
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        % AVATAR_COLORS.length;

    return AVATAR_COLORS[index];
};

const formatAmount = (amount, currencyCode = "INR") => {
    const value = Number(amount ?? 0);

    return `${currencyCode ? `${currencyCode} ` : ""}${value.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
};

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getPrimaryAddress = (customer) => {
    return customer?.billingAddress ||
        customer?.shippingAddress ||
        {};
};

/* =========================================================
   COMPONENT
========================================================= */

export default function CustomerTable({
    customers,
    fetchParams = {},
}) {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const {
        customers: reduxCustomers = EMPTY_ARRAY,
        loading = false,
        actionLoading = false,
        error = null,
        page: pageNumber = 0,
        pageSize = 10,
        totalPages = 0,
        totalElements = 0,
    } = useSelector((state) => state.customer || {});



    const currentCustomers = Array.isArray(customers)
        ? customers
        : reduxCustomers;

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

            if (!Array.isArray(permissions)) return false;

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

    const canViewCustomer = hasPermission(
        "Customers",
        "VIEW"
    );

    const canEditCustomer = hasPermission(
        "Customers",
        "EDIT"
    );

    const canDeleteCustomer = hasPermission(
        "Customers",
        "DELETE"
    );

    /* =====================================================
       FETCH PARAMS
    ===================================================== */

    const getFetchParams = useCallback(
        (page, size) => ({
            ...fetchParams,
            page,
            size,
        }),
        [fetchParams]
    );

    const refreshCustomers = useCallback(
        (page = pageNumber, size = pageSize) => {

            dispatch(
                fetchAllCustomers(
                    getFetchParams(page, size)
                )
            );

        },
        [
            dispatch,
            getFetchParams,
            pageNumber,
            pageSize,
        ]
    );

    /* =====================================================
       VIEW CUSTOMER
    ===================================================== */

    const handleView = (customer) => {

        if (!canViewCustomer) {
            toast.error(
                "You do not have permission to view Customers."
            );
            return;
        }

        dispatch(setSelectedCustomer(customer));

        navigate(`/customers/view/${customer.id}`);
    };

    /* =====================================================
       EDIT CUSTOMER
    ===================================================== */

    const handleEdit = (customer) => {

        if (!canEditCustomer) {
            toast.error(
                "You do not have permission to edit Customers."
            );
            return;
        }

        dispatch(setSelectedCustomer(customer));

        navigate(`/customers/edit/${customer.id}`);
    };

    /* =====================================================
       DELETE CUSTOMER
    ===================================================== */

    const handleDelete = async (customer) => {

        if (!canDeleteCustomer) {
            toast.error(
                "You do not have permission to delete Customers."
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${customer.customerName}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await dispatch(
                removeCustomer(customer.id)
            ).unwrap();

            toast.success("Customer deleted successfully.");

            refreshCustomers();

        } catch (error) {

            toast.error(
                typeof error === "string"
                    ? error
                    : "Failed to delete customer."
            );

        }
    };

    /* =====================================================
       SORTING
    ===================================================== */

    const sortedCustomers = useMemo(
        () => [...currentCustomers],
        [currentCustomers]
    );

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !currentCustomers.length) {

        return (
            <div className="
                flex items-center justify-center py-10
            ">
                <p className="text-sm text-gray-500">
                    Loading customers...
                </p>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !currentCustomers.length) {

        return (
            <div className="
                rounded-xl border border-red-200
                bg-white p-8 text-center
            ">

                <p className="text-sm text-red-500">
                    {typeof error === "string"
                        ? error
                        : "Failed to fetch customers"
                    }
                </p>

                <button
                    type="button"
                    onClick={() => refreshCustomers()}
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

    if (!currentCustomers.length) {

        return (
            <div className="
                rounded-2xl border border-gray-200
                bg-white p-8 text-center
            ">

                <Users className="
                    mx-auto mb-3 h-10 w-10 text-gray-300
                " />

                <p className="text-sm text-gray-500">
                    No customers found.
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
                            "Customer",
                            "Contact",
                            "BusinessType",
                            "Currency",
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

                    {sortedCustomers.map((customer) => {

                        const customerStatus = String(
                            customer.status || ""
                        ).toUpperCase();

                        const address = getPrimaryAddress(customer);

                        const customerName =
                            customer.displayName ||
                            customer.companyName ||
                            [
                                customer.salutation,
                                customer.firstName,
                                customer.lastName,
                            ].filter(Boolean).join(" ") ||
                            "—";

                        const contactName = [
                            customer.firstName,
                            customer.lastName,
                        ].filter(Boolean).join(" ") || "—";

                        const phone =
                            customer.mobile
                                ? `${customer.mobileCode || ""} ${customer.mobile}`.trim()
                                : customer.workPhone
                                    ? `${customer.workPhoneCode || ""} ${customer.workPhone}`.trim()
                                    : "—";

                        const location = [
                            address.city,
                            address.state,
                        ].filter(Boolean).join(", ");

                        const currencyCode = customer.currency || "INR";

                        return (

                            <tr
                                key={customer.id}
                                className="
                                    border-b border-gray-100
                                    text-xs transition-colors
                                    hover:bg-gray-50
                                "
                            >

                                {/* CUSTOMER */}

                                <td className="px-3 py-3">

                                    <div className="
                                        flex min-w-0 items-center gap-2
                                    ">

                                        <div
                                            className={`
        flex h-9 w-9 min-w-[36px] items-center
        justify-center rounded-full text-sm font-bold
        ${getAvatarColor(customerName)}
    `}
                                        >
                                            {getInitials(customerName)}
                                        </div>

                                        <div className="min-w-0">
                                            <p
                                                className="truncate font-medium text-gray-800"
                                                title={customerName}
                                            >
                                                {customerName}
                                            </p>

                                            <p className="mt-0.5 text-xs text-gray-500">
                                                Customer ID: {customer.id}
                                            </p>
                                        </div>

                                    </div>

                                </td>

                                {/* CONTACT */}

                                <td className="px-3 py-3">

                                    <div className="min-w-0 space-y-1">
                                        <p className="max-w-[180px] truncate font-medium text-gray-700">
                                            {contactName}
                                        </p>

                                        {customer.email && (
                                            <p className="flex max-w-[180px] items-center gap-1 truncate text-xs text-gray-400">
                                                <Mail size={12} className="shrink-0" />
                                                <span className="truncate">{customer.email}</span>
                                            </p>
                                        )}

                                        {phone !== "—" && (
                                            <p className="flex items-center gap-1 whitespace-nowrap text-xs text-gray-400">
                                                <Phone size={12} />
                                                {phone}
                                            </p>
                                        )}

                                        {location && (
                                            <p className="max-w-[180px] truncate text-xs text-gray-400">
                                                {location}
                                            </p>
                                        )}
                                    </div>

                                </td>

                                {/* BUSSINESTYPE */}

                                <td className="px-3 py-3">

                                    <div className="
                                        flex items-center gap-2
                                        whitespace-nowrap
                                    ">

                                        <FileUser
                                            size={14}
                                            className="text-gray-400"
                                        />

                                        <span className="
                                            font-medium text-gray-700
                                        ">
                                            {customer.customerType}
                                        </span>

                                    </div>

                                </td>

                                {/* OUTSTANDING CREDIT */}

                                <td className="px-3 py-3">

                                    <div className="
                                        flex items-center gap-2
                                        whitespace-nowrap
                                    ">
                                        <Coins
                                            size={14}
                                            className="text-gray-400"
                                        />

                                        <span className="font-medium text-gray-700">
                                            {customer.currency || "INR"}
                                        </span>

                                    </div>
                                </td>

                                {/* STATUS */}

                                <td className="px-3 py-3">

                                    <span
                                        className={`
                                            inline-block whitespace-nowrap
                                            rounded-full px-2.5 py-1
                                            text-xs font-medium
                                            ${CUSTOMER_STATUS_COLORS[customerStatus] ||
                                            "bg-gray-100 text-gray-700"}
                                        `}
                                    >
                                        {customer.status || "—"}
                                    </span>

                                </td>

                                {/* ACTIONS */}

                                <td className="px-4 py-3">

                                    <div className="
                                        relative flex items-center justify-end gap-2
                                    ">

                                        {canViewCustomer && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleView(customer)
                                                }
                                                className="
                                                    group relative
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-blue-50
                                                    text-blue-600 transition
                                                    hover:bg-blue-100
                                                    hover:text-blue-700
                                                "
                                            >

                                                <Eye size={16} />

                                                <ToolTipText
                                                    text="View"
                                                    position="bottom"
                                                />

                                            </button>

                                        )}

                                        {canEditCustomer && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(customer)
                                                }
                                                className="
                                                    group relative flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-green-50
                                                    text-green-600 transition
                                                    hover:bg-green-100
                                                    hover:text-green-700
                                                "
                                            >

                                                <Edit size={16} />

                                                <ToolTipText
                                                    text="Edit"
                                                    position="bottom"
                                                />

                                            </button>

                                        )}

                                        {canDeleteCustomer && (

                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() =>
                                                    handleDelete(customer)
                                                }
                                                className="
                                                    group relative
                                                    flex h-8 w-8
                                                    items-center justify-center
                                                    rounded-lg bg-red-50
                                                    text-red-600 transition
                                                    hover:bg-red-100
                                                    hover:text-red-700
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                "
                                            >

                                                <Trash2 size={16} />

                                                <ToolTipText
                                                    text="Delete"
                                                    position="bottom"
                                                />

                                            </button>

                                        )}

                                    </div>

                                </td>

                            </tr>

                        );

                    })}

                </tbody>

            </table>

            {/* PAGINATION */}

            <Pagination
                page={Number(pageNumber) || 0}
                size={Number(pageSize) || 20}
                totalElements={Number(totalElements) || 0}
                totalPages={Number(totalPages) || 0}
                loading={loading}
                label="customers"
                onPageChange={(nextPage) => {
                    refreshCustomers(
                        nextPage,
                        Number(pageSize) || 20
                    );
                }}
                onPageSizeChange={(nextSize) => {
                    refreshCustomers(0, nextSize);
                }}
            />

        </div>
    );
}