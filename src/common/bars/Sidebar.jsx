import React from 'react'
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from 'react';
import { resetCustomerForm, resetSelectedCustomer, resetDirty } from '../../module/customer/slices/customerSlices';
import UnsavedChangesDialog from '../dialogue/UnsavedChangesDialog';
import {
    toggleSidebar, showLeaveDialog,
} from "../../module/ui/uiSlice";

import {
    Sparkles,
    ChevronRight,
    ChevronDown, //
    LayoutDashboard,
    Users,
    FileText,
    FolderKanban,
    Truck,
    Wallet,
    Plus,
    TrendingUp,
    Menu,
    X,
    Package,
} from "lucide-react";

const NAV = [

    {
        label: "Dashboard",
        icon: Package,
        to: "/dashboard"
        // no children → no chevron ✅ correct, matches your reference
    },
    {
        label: "Customers",
        icon: Users,
        to: "/customers",
        addTo: "/customers/new",
        queryKey: "status",
        dropdown: true, // ← add this
        children: [
            { label: "All", status: "ALL" },
            { label: "Active", status: "ACTIVE" },
            { label: "Inactive", status: "INACTIVE" },
            { label: "Draft", status: "DRAFT" },
        ],
    },
    {
        label: "Items",
        icon: Package,
        to: "/items",
        addTo: "/items/new",
        basePath: "/items",
        dropdown: true,
        children: [
            { label: "Products", to: "/items" },
            { label: "Categories", to: "/categories" },
            { label: "Sub Categories", to: "/subCategoires" },
            { label: "Brands", to: "/brands" },
            { label: "Sizes", to: "/sizes" },
            { label: "Units", to: "/units" },
            { label: "Taxes", to: "/taxes" },
        ],
    },

    {
        label: "Invoices",
        icon: FileText,
        to: "/invoices",
        addTo: "/invoices/new",
        dropdown: true, // ← add this
        children: [
            { label: "All", status: "ALL" },
            { label: "Active", status: "ACTIVE" },
            { label: "Inactive", status: "INACTIVE" },
            { label: "Draft", status: "DRAFT" },
        ],
    },


    {
        label: "Payments",
        icon: Wallet,
        to: "/payments",
        addTo: "/payments/new",
        dropdown: true, // ← add this
        children: [
            { label: "All", status: "ALL" },
            { label: "Active", status: "ACTIVE" },
            { label: "Inactive", status: "INACTIVE" },
            { label: "Draft", status: "DRAFT" },
        ],
    },

];


export default function Siderbar() {
    const dispatch = useDispatch();
    const open = useSelector((s) => s.ui.sidebarOpen);
    console.log("sidebarOpen =", open);

    const [openMenu, setOpenMenu] = React.useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    // UnSavedChnagesDialog
    const isDirty = useSelector(state => state.customers.isDirty);

    const leaveDialog = useSelector((state) => state.ui.leaveDialog);

    const isActiveRoute = (path) =>
        location.pathname === path || location.pathname.startsWith(path);


    const handleMenuClick = (item) => {
        navigate(item.to);

        if (item.children) {
            setOpenMenu(openMenu === item.label ? null : item.label);
        }
    };

    return (
        <>
            {/* overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/30 z-20 lg:hidden"
                    onClick={() => dispatch(toggleSidebar())}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 h-full z-30 bg-[#080c39] border-r border-white/10
          flex flex-col transition-all duration-300
          ${open ? "w-60" : "w-16 overflow-visible"}
        `}
            >
                {/* LOGO */}
                <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <TrendingUp size={16} className="text-white" />
                    </div>

                    {open && (
                        <span className="text-sm font-semibold text-gray-200">
                            InvoicePro
                        </span>
                    )}
                </div>

                {/* GETTING STARTED */}
                <div className="px-3 mt-3">
                    <div className="rounded-xl bg-white/5 hover:bg-white/10 transition">
                        <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <span className="flex items-center gap-2 text-sm text-white min-w-0 flex-1">
                                <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />

                                <span className="truncate whitespace-nowrap">
                                    Getting Started
                                </span>
                            </span>

                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </button>

                        <div className="px-3 pb-3">
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-[15%] bg-blue-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* NAV */}
                <nav className="flex-1 py-3 space-y-1 px-2">
                    {NAV.map((item) => {
                        const Icon = item.icon;
                        const active = item.to && isActiveRoute(item.to);

                        return (
                            <div
                                key={item.label}
                                className="relative group flex flex-col"
                            >
                                <div className="flex items-stretch justify-between rounded-md overflow-visible">

                                    {/* MAIN MENU */}
                                    {item.children ? (
                                        <button
                                            onClick={() => handleMenuClick(item)}
                                            className={`
            relative flex items-center gap-3
            px-3 py-2 flex-1
            text-gray-300
            hover:bg-white/10
            hover:text-white
        `}
                                        >
                                            {/* chevron on the left */}
                                            {open && (
                                                <ChevronDown
                                                    size={16}
                                                    className={`transition-transform duration-200 ${openMenu === item.label ? "rotate-180" : ""
                                                        }`}
                                                />
                                            )}

                                            <Icon size={18} />

                                            {open && (
                                                <span className="whitespace-nowrap">
                                                    {item.label}
                                                </span>
                                            )}


                                        </button>

                                    ) : (
                                        <NavLink
                                            to={item.to}
                                            onClick={(e) => {
                                                if (item.children) {
                                                    e.preventDefault();
                                                    setOpenMenu(openMenu === item.label ? null : item.label);
                                                }
                                            }}
                                            className={({ isActive }) =>
                                                `
                                relative flex items-center gap-2
                                px-3 py-2 flex-1
                                transition
                                ${isActive
                                                    ? "bg-blue-500 text-white"
                                                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                                                }
    `
                                            }
                                        >
                                            {/* always reserve the slot, but only show chevron if item has children */}
                                            {open && (
                                                <span className="w-5 flex justify-center flex-shrink-0 text-gray-500">
                                                    {item.children && <ChevronDown size={14} />}
                                                </span>
                                            )}

                                            <Icon size={18} className="flex-shrink-0" />

                                            {open && (
                                                <span className="whitespace-nowrap">
                                                    {item.label}
                                                </span>
                                            )}
                                        </NavLink>
                                    )}

                                    {/* ADD BUTTON */}
                                    {open && item.addTo && (
                                        <button
                                            onClick={() => {
                                                if (isDirty) {
                                                    dispatch(showLeaveDialog(item.addTo));
                                                } else {
                                                    navigate(item.addTo);
                                                }
                                            }}
                                            className="
                            w-8
                            flex items-center justify-center
                            border-l border-white/10
                            opacity-0
                            group-hover:opacity-100
                            hover:bg-white/10
                        "
                                        >
                                            <Plus size={16} />
                                        </button>
                                    )}

                                    {/* COLLAPSED TOOLTIP */}
                                    {!open && (
                                        <div
                                            className="
                            absolute
                            left-[72px]
                            top-1/2
                            -translate-y-1/2

                            z-[9999]

                            px-4
                            py-2.5

                            min-w-max
    
                            bg-blue-600
                            text-white
                            text-sm
                            font-semibold

                            rounded-lg

                            shadow-lg

                            opacity-0
                            invisible

                            group-hover:opacity-100
                            group-hover:visible

                            transition-opacity
                            duration-150

                            pointer-events-none

                            before:content-['']
                            before:absolute
                            before:left-[-8px]
                            before:top-1/2
                            before:-translate-y-1/2

                            before:border-t-[8px]
                            before:border-b-[8px]
                            before:border-t-transparent
                            before:border-b-transparent
                            before:border-r-[8px]
                            before:border-r-blue-600
                        "
                                        >
                                            {item.label}
                                        </div>
                                    )}
                                </div>

                                {/* CHILDREN */}
                                {/* CHILDREN */}
                                {item.children && openMenu === item.label && (
                                    <div className="mt-1 flex flex-col">
                                        {item.children.map((child) => {
                                            // Menu items that have their own route
                                            if (child.to) {
                                                const childActive =
                                                    location.pathname === child.to ||
                                                    location.pathname.startsWith(`${child.to}/`);

                                                return (
                                                    <NavLink
                                                        key={`${item.label}-${child.label}`}
                                                        to={child.to}
                                                        className={`
                            text-sm py-2 px-3 ml-6 rounded-md transition
                            ${childActive
                                                                ? "bg-white/10 text-white font-medium"
                                                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                            }
                        `}
                                                        style={{ paddingLeft: "2.75rem" }}
                                                    >
                                                        {child.label}
                                                    </NavLink>
                                                );
                                            }

                                            // Status-filter menu items
                                            const search = new URLSearchParams(location.search);

                                            const childActive =
                                                location.pathname === item.basePath &&
                                                search.get(item.queryKey) === child.status;

                                            return (
                                                <NavLink
                                                    key={`${item.label}-${child.status}`}
                                                    to={`${item.basePath}?${item.queryKey}=${child.status}`}
                                                    className={`
                        text-sm py-2 px-3 ml-6 rounded-md transition
                        ${childActive
                                                            ? "bg-white/10 text-white font-medium"
                                                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                        }
                    `}
                                                    style={{ paddingLeft: "2.75rem" }}
                                                >
                                                    {child.label}
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* BOTTOM TOGGLE */}
                <div className="p-2 border-t border-white/10">
                    <button
                        onClick={() => dispatch(toggleSidebar())}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                       text-gray-400 hover:bg-white/5 transition"
                    >
                        {open ? <X size={16} /> : <Menu size={16} />}
                        {open && <span className="text-xs">Collapse</span>}
                    </button>
                </div>
            </aside >
        </>

    );
}