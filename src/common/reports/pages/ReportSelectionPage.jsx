
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Users,
    FileText,
    ArrowRight,
    FileSearch,
    Folder,
    Tags,
    Ruler,
    Package,
    Receipt,
    Building2,
    Wallet,
    Landmark,
    ShoppingCart,
    Warehouse,
    UserRound,
    Layers,
    Calculator,
    Banknote,
    X,
    Loader2,
    FileBarChart,
} from "lucide-react";

import {
    reportModules,
    getReportsByModule,
} from "../config/reportModuleConfig";

const moduleIcons = {
    CUSTOMER: Users,
    PARTY: Building2,
    CATEGORY: Folder,
    SUBCATEGORY: Layers,
    SIZE: Ruler,
    UNIT: Package,
    ITEM: Tags,
    TAX_MASTER: Calculator,
    BANK_ACCOUNT: Landmark,
    BANK_TRANSACTION: Banknote,
    CASH_ACCOUNT: Wallet,
    CASH_TRANSACTION: Receipt,
    INVOICE: FileText,
    SALES_ORDER: ShoppingCart,
    SALES_PERSON: UserRound,
    PURCHASE_ORDER: ShoppingCart,
    PARTY_CLEARANCE: Receipt,
    WAREHOUSE: Warehouse,
};

export default function ReportSelectionPage() {
    const navigate = useNavigate();

    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedReport, setSelectedReport] = useState("");

    const [modalOpen, setModalOpen] = useState(false);

    const reports = selectedModule
        ? getReportsByModule(selectedModule.code)
        : [];

    const selectedModuleName = selectedModule?.name || "";

    /* =====================================================
       OPEN MODULE REPORT MODAL
    ===================================================== */

    const handleModuleSelect = (module) => {
        setSelectedModule(module);
        setSelectedReport("");
        setModalOpen(true);
    };

    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedReport("");
    };

    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    useEffect(() => {
        if (!modalOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                handleCloseModal();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [modalOpen]);

    /* =====================================================
       CONFIGURE REPORT
    ===================================================== */

    const handleContinue = () => {
        if (!selectedModule || !selectedReport) return;

        setModalOpen(false);

        navigate(
            `/reports/register/${selectedModule.code}/${selectedReport}`
        );
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="space-y-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div>
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <FileBarChart size={21} />
                    </div>

                    <div>
                        <h1 className="text-xl font-semibold text-gray-800">
                            Create Report
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Select a module to explore and configure its reports.
                        </p>
                    </div>
                </div>
            </div>

            {/* =================================================
                MODULE SELECTION
            ================================================= */}

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="mb-5">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Select Module
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                        Choose the module for which you want to generate a report.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                    {reportModules.map((module) => {
                        const Icon =
                            moduleIcons[module.code] || FileSearch;

                        const reportCount =
                            getReportsByModule(module.code).length;

                        return (
                            <button
                                key={module.code}
                                type="button"
                                onClick={() => handleModuleSelect(module)}
                                className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-sm"
                            >
                                <div className="rounded-lg bg-blue-50 p-3 transition group-hover:bg-blue-100">
                                    <Icon className="h-5 w-5 text-blue-600" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {module.name}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {reportCount > 0
                                            ? `${reportCount} Reports`
                                            : "Coming soon"}
                                    </p>
                                </div>

                                <ArrowRight
                                    size={17}
                                    className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                                />
                            </button>
                        );
                    })}

                </div>
            </section>

            {/* =================================================
                REPORT SELECTION MODAL
            ================================================= */}

            {modalOpen && selectedModule && (

                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseModal();
                        }
                    }}
                >

                    <div
                        className="flex h-full max-h-[500px] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="report-selection-title"
                    >

                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    {React.createElement(
                                        moduleIcons[selectedModule.code] || FileSearch,
                                        { size: 21 }
                                    )}
                                </div>

                                <div>
                                    <h2
                                        id="report-selection-title"
                                        className="text-base font-bold text-gray-800"
                                    >
                                        {selectedModuleName} Reports
                                    </h2>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Select a report to continue configuration.
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* MODAL BODY */}

                        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">

                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700">
                                        Available Reports
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {reports.length} reports available
                                    </p>
                                </div>

                                {selectedReport && (
                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                                        1 Selected
                                    </span>
                                )}
                            </div>

                            {reports.length > 0 ? (

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                                    {reports.map((report) => {
                                        const isSelected =
                                            selectedReport === report.code;

                                        return (
                                            <button
                                                key={report.code}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedReport(report.code)
                                                }
                                                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${isSelected
                                                    ? "border-blue-500 bg-blue-50 shadow-sm"
                                                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                                                    }`}
                                            >

                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isSelected
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-blue-50 text-blue-600"
                                                        }`}
                                                >
                                                    <FileText size={19} />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {report.name}
                                                        </p>

                                                        {isSelected && (
                                                            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                                        )}
                                                    </div>

                                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                                        {report.description ||
                                                            "View and analyze report information."}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        {report.type && (
                                                            <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase text-gray-500">
                                                                {report.type}
                                                            </span>
                                                        )}

                                                        <span className="text-[10px] text-gray-400">
                                                            {report.columns?.length || 0} columns
                                                        </span>
                                                    </div>
                                                </div>

                                            </button>
                                        );
                                    })}

                                </div>

                            ) : (

                                <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 text-center">
                                    <FileSearch className="h-9 w-9 text-gray-400" />

                                    <p className="mt-3 text-sm font-semibold text-gray-700">
                                        No reports available
                                    </p>

                                    <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                                        Report definitions for this module have not been configured yet.
                                    </p>
                                </div>

                            )}

                        </div>

                        {/* MODAL FOOTER */}

                        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50
                         px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                            <p className="text-xs text-gray-500">
                                {selectedReport
                                    ? "Your report is ready to configure."
                                    : "Select a report to continue."}
                            </p>

                            <div className="flex items-center justify-end gap-2">

                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="rounded-lg border border-gray-200 bg-white 
                                    px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleContinue}
                                    disabled={!selectedReport}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <FileSearch size={16} />
                                    Configure Report
                                    <ArrowRight size={16} />
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}
