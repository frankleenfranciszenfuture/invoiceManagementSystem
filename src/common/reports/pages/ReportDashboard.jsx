
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    FileBarChart,
    Users,
    UserRound,
    Package,
    FileText,
    Wallet,
    ShoppingCart,
    ShoppingBag,
    Landmark,
    Warehouse,
    ArrowRight,
    RefreshCw,
    Loader2,
    Search,
    ChartNoAxesCombined,
    X,
    ChevronRight,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    fetchReportModules,
    fetchReportCatalog,
} from "../thunks/reportThunks";

import {
    setSelectedModule,
    setSelectedReportCode,
    selectReportModules,
    selectSelectedReportModule,
    selectReportCatalog,
} from "../slices/reportSlice";

/* =========================================================
   MODULE ICONS
   ========================================================= */

const moduleIcons = {
    CUSTOMER: Users,
    CUSTOMERS: Users,
    PARTY: UserRound,
    PARTIES: UserRound,
    ITEM: Package,
    ITEMS: Package,
    PRODUCT: Package,
    PRODUCTS: Package,
    INVOICE: FileText,
    INVOICES: FileText,
    PAYMENT: Wallet,
    PAYMENTS: Wallet,
    SALE_ORDER: ShoppingCart,
    SALE_ORDERS: ShoppingCart,
    SALES_ORDER: ShoppingCart,
    SALES_ORDERS: ShoppingCart,
    PURCHASE_ORDER: ShoppingBag,
    PURCHASE_ORDERS: ShoppingBag,
    BANK_TRANSACTION: Landmark,
    BANK_TRANSACTIONS: Landmark,
    BANK_ACCOUNT: Landmark,
    BANK_ACCOUNTS: Landmark,
    WAREHOUSE: Warehouse,
    WAREHOUSES: Warehouse,
};

/* =========================================================
   HELPERS
   ========================================================= */

const normalizeModuleKey = (module) =>
    String(module || "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");

const getModuleIcon = (module) => {
    const key = normalizeModuleKey(module);
    return moduleIcons[key] || FileBarChart;
};

const formatModuleName = (value) => {
    if (!value) return "Reports";

    return String(value)
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getReportName = (report) =>
    report?.name || formatModuleName(report?.code);

const getReportDescription = (report) =>
    report?.description ||
    "View and analyze report information.";

/* =========================================================
   REPORT DASHBOARD
   ========================================================= */

export default function ReportDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* =====================================================
       REDUX STATE
       ===================================================== */

    const modules = useSelector(selectReportModules) || [];

    const selectedModule = useSelector(
        selectSelectedReportModule
    );

    const catalog = useSelector(selectReportCatalog);

    const {
        modulesLoading = false,
        catalogLoading = false,
        error = null,
    } = useSelector((state) => state.reports || {});

    /* =====================================================
       LOCAL STATE
       ===================================================== */

    const [searchTerm, setSearchTerm] = useState("");
    const [isReportModalOpen, setIsReportModalOpen] =
        useState(false);

    /* =====================================================
       INITIAL FETCH
       ===================================================== */

    useEffect(() => {
        dispatch(fetchReportModules());
    }, [dispatch]);

    /* =====================================================
       SEARCH MODULES
       ===================================================== */

    const filteredModules = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) return modules;

        return modules.filter((item) => {
            const name =
                item.moduleName ||
                item.module ||
                "";

            return String(name)
                .toLowerCase()
                .includes(keyword);
        });
    }, [modules, searchTerm]);

    /* =====================================================
       SELECT MODULE AND OPEN MODAL
       ===================================================== */

    const handleModuleSelect = (module) => {
        if (!module) return;

        dispatch(setSelectedModule(module));

        setIsReportModalOpen(true);

        dispatch(fetchReportCatalog(module));
    };

    /* =====================================================
       CLOSE MODAL
       ===================================================== */

    const handleCloseModal = () => {
        setIsReportModalOpen(false);
    };

    /* =====================================================
       OPEN REPORT
       ===================================================== */

    const handleOpenReport = (report) => {
        if (!selectedModule || !report?.code) {
            toast.error("Please select a report first.");
            return;
        }

        dispatch(setSelectedReportCode(report.code));

        setIsReportModalOpen(false);

        const modulePath = String(selectedModule)
            .toLowerCase()
            .replace(/_/g, "-");

        navigate(`/reports/${modulePath}`);
    };

    /* =====================================================
       REFRESH
       ===================================================== */

    const handleRefresh = () => {
        dispatch(fetchReportModules());

        if (selectedModule && isReportModalOpen) {
            dispatch(fetchReportCatalog(selectedModule));
        }
    };

    /* =====================================================
       SELECTED MODULE DATA
       ===================================================== */

    const selectedModuleData = useMemo(
        () =>
            modules.find(
                (item) => item.module === selectedModule
            ),
        [modules, selectedModule]
    );

    const selectedModuleName =
        catalog?.module === selectedModule
            ? catalog?.moduleName ||
            selectedModuleData?.moduleName ||
            formatModuleName(selectedModule)
            : selectedModuleData?.moduleName ||
            formatModuleName(selectedModule);

    const reports =
        catalog?.module === selectedModule
            ? catalog?.reports || []
            : [];

    /* =====================================================
       RENDER
       ===================================================== */

    return (
        <div className="min-h-full space-y-6 bg-slate-50 p-4 sm:p-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div className="flex items-center gap-2">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <ChartNoAxesCombined size={21} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-800">
                            Reports
                        </h1>

                        <p className="mt-0.5 text-sm text-slate-500">
                            View, analyze and export your business reports.
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={modulesLoading || catalogLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={15}
                        className={
                            modulesLoading || catalogLoading
                                ? "animate-spin"
                                : ""
                        }
                    />
                    Refresh
                </button>

            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                {/* AVAILABLE MODULES */}

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Available Modules
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-slate-800">
                                {modules.length}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileBarChart size={22} />
                        </div>
                    </div>
                </div>

                {/* AVAILABLE REPORTS */}

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Available Reports
                            </p>

                            <h2 className="mt-2 text-2xl font-bold text-slate-800">
                                {reports.length}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FileText size={22} />
                        </div>
                    </div>
                </div>

                {/* SELECTED MODULE */}

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-500">
                                Selected Module
                            </p>

                            <h2 className="mt-2 truncate text-lg font-bold text-slate-800">
                                {selectedModule
                                    ? selectedModuleName
                                    : "None"}
                            </h2>
                        </div>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <ChartNoAxesCombined size={22} />
                        </div>
                    </div>
                </div>

            </div>

            {/* =================================================
                MODULE SECTION
            ================================================= */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                    <div>
                        <h2 className="text-base font-bold text-slate-800">
                            Report Modules
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Select a module to explore its available reports.
                        </p>
                    </div>

                    {/* SEARCH */}

                    <div className="relative w-full sm:w-64">

                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search modules..."
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />

                    </div>

                </div>

                {/* MODULE LOADING */}

                {modulesLoading && modules.length === 0 ? (

                    <div className="flex min-h-40 items-center justify-center">
                        <Loader2
                            size={27}
                            className="animate-spin text-blue-600"
                        />
                    </div>

                ) : filteredModules.length === 0 ? (

                    <div className="flex min-h-40 flex-col items-center justify-center text-center">
                        <FileBarChart
                            size={30}
                            className="mb-3 text-slate-300"
                        />

                        <p className="text-sm font-medium text-slate-600">
                            No report modules found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Try another search term.
                        </p>
                    </div>

                ) : (

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

                        {filteredModules.map((item) => {
                            const moduleKey = item.module;
                            const Icon = getModuleIcon(moduleKey);

                            const isSelected =
                                selectedModule === moduleKey;

                            return (
                                <button
                                    key={moduleKey}
                                    type="button"
                                    onClick={() =>
                                        handleModuleSelect(moduleKey)
                                    }
                                    className={`group rounded-xl border p-4 text-left transition duration-200 ${isSelected
                                        ? "border-blue-400 bg-blue-50/70 shadow-sm"
                                        : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                                        }`}
                                >

                                    <div className="flex items-center justify-between">

                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${isSelected
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                                                }`}
                                        >
                                            <Icon size={21} />
                                        </div>

                                        <ArrowRight
                                            size={17}
                                            className={`transition ${isSelected
                                                ? "translate-x-1 text-blue-600"
                                                : "text-slate-300 group-hover:translate-x-1 group-hover:text-blue-600"
                                                }`}
                                        />

                                    </div>

                                    <h3 className="mt-4 text-sm font-bold text-slate-800">
                                        {item.moduleName ||
                                            formatModuleName(moduleKey)}
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {item.reportCount ?? 0} available reports
                                    </p>

                                    <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600">
                                        View Reports
                                        <ChevronRight size={14} />
                                    </p>

                                </button>
                            );
                        })}

                    </div>

                )}

            </section>

            {/* =================================================
                REPORT CATALOG MODAL
            ================================================= */}

            {isReportModalOpen && (

                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px] sm:p-5"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseModal();
                        }
                    }}
                >

                    <div className="flex max-h-[90vh] w-[780px] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">

                            <div className="flex min-w-0 items-center gap-3">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                    {React.createElement(
                                        getModuleIcon(selectedModule),
                                        { size: 22 }
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <h2 className="truncate text-lg font-bold text-slate-800">
                                        {selectedModuleName} Reports
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Select a report to continue.
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                title="Close"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* MODAL CONTENT */}

                        <div className="min-h-48 flex-1 overflow-y-auto p-5 sm:p-6">

                            {catalogLoading ? (

                                <div className="flex min-h-48 flex-col items-center justify-center">
                                    <Loader2
                                        size={30}
                                        className="animate-spin text-blue-600"
                                    />

                                    <p className="mt-3 text-sm text-slate-500">
                                        Loading available reports...
                                    </p>
                                </div>

                            ) : reports.length === 0 ? (

                                <div className="flex min-h-48 flex-col items-center justify-center text-center">
                                    <FileText
                                        size={34}
                                        className="mb-3 text-slate-300"
                                    />

                                    <p className="text-sm font-semibold text-slate-600">
                                        No reports available
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        This module does not have any reports configured.
                                    </p>
                                </div>

                            ) : (

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                    {reports.map((report) => (

                                        <div
                                            key={report.code}
                                            className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
                                        >

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                    <FileText size={19} />
                                                </div>

                                                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                                    {report.type || "REPORT"}
                                                </span>

                                            </div>

                                            <h3 className="mt-4 text-sm font-bold text-slate-800">
                                                {getReportName(report)}
                                            </h3>

                                            <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">
                                                {getReportDescription(report)}
                                            </p>

                                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                                                <span className="text-xs text-slate-400">
                                                    {report.columns?.length || 0} columns
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleOpenReport(report)
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                                >
                                                    Open Report
                                                    <ArrowRight size={14} />
                                                </button>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                        {/* MODAL FOOTER */}

                        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 sm:px-6">

                            <span className="text-xs text-slate-500">
                                {reports.length} available reports
                            </span>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

        </div>
    );
}
