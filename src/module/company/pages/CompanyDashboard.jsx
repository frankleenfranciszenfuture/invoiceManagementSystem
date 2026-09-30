import React, {
    useEffect,
    useMemo,
} from "react";

import {
    useSelector,
    useDispatch,
} from "react-redux";

import {
    useSearchParams,
} from "react-router-dom";

import {
    Download,
    Plus,
} from "lucide-react";

import CompanyTable
    from "./CompanyTable";

import NavbarCompany
    from "../components/bars/nav/NavbarCompany";

import {
    fetchAllCompanies,
} from "../thunks/companyThunks";

import {
    setCompanyStatus,
    setSelectedCompanyView,
} from "../slices/companyViewSlice";

import {
    openModal,
} from "../../ui/uiSlice";

import InvoiceSkeleton
    from "../../../common/loader/InvoiceSkeleton";


export default function CompanyDashboard() {

    const dispatch = useDispatch();

    const [searchParams] =
        useSearchParams();


    // ============================================================
    // COMPANY STATE
    // ============================================================

    const companies = useSelector(
        (state) =>
            state.company?.companies || []
    );

    const loading = useSelector(
        (state) =>
            state.company?.loading || false
    );

    const error = useSelector(
        (state) =>
            state.company?.error
    );


    // ============================================================
    // COMPANY FILTER STATE
    // ============================================================

    const companyStatus = useSelector(
        (state) =>
            state.companyView?.companyStatus ||
            "ALL"
    );


    // ============================================================
    // FETCH COMPANIES
    // ============================================================

    useEffect(() => {

        dispatch(
            fetchAllCompanies()
        );

    }, [dispatch]);


    // ============================================================
    // SYNC URL STATUS → REDUX
    // ============================================================

    useEffect(() => {

        const urlStatus =
            searchParams.get(
                "companyStatus"
            );

        if (!urlStatus) {
            return;
        }

        const normalizedStatus =
            String(urlStatus)
                .toUpperCase();

        const validStatuses = [
            "ALL",
            "ACTIVE",
            "INACTIVE",
            "DRAFT",
        ];

        if (
            !validStatuses.includes(
                normalizedStatus
            )
        ) {
            return;
        }

        dispatch(
            setCompanyStatus(
                normalizedStatus
            )
        );


        const statusLabels = {

            ALL:
                "All Companies",

            ACTIVE:
                "Active Companies",

            INACTIVE:
                "Inactive Companies",

            DRAFT:
                "Draft Companies",

        };


        dispatch(
            setSelectedCompanyView(
                statusLabels[
                normalizedStatus
                ]
            )
        );

    }, [
        searchParams,
        dispatch,
    ]);


    // ============================================================
    // FILTER COMPANIES BY STATUS
    // ============================================================

    const filteredCompanies = useMemo(() => {

        const selectedStatus =
            String(
                companyStatus || "ALL"
            ).toUpperCase();


        if (
            selectedStatus === "ALL"
        ) {

            return companies;

        }


        return companies.filter(
            (company) => {

                const backendStatus =
                    String(
                        company?.status || ""
                    ).toUpperCase();


                return (
                    backendStatus ===
                    selectedStatus
                );

            }
        );

    }, [
        companies,
        companyStatus,
    ]);


    // ============================================================
    // CREATE COMPANY MODAL
    // ============================================================

    const handleCreateCompany = () => {

        dispatch(
            openModal({
                type: "addCompany",
                data: null,
            })
        );

    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <InvoiceSkeleton />
        );

    }


    // ============================================================
    // PAGE
    // ============================================================

    return (

        <div
            className="
                flex
                h-screen
                bg-gray-50
                font-sans
                text-[13px]
                overflow-hidden
            "
        >

            {/* =====================================================
                SINGLE PAGE SCROLLER
            ===================================================== */}

            <div
                className="
                    flex-1
                    min-h-0
                    bg-white
                    overflow-y-auto
                "
            >

                <div
                    className="
                        px-2
                        py-5
                        w-full
                    "
                >

                    {/* =================================================
                        COMPANY NAVBAR
                    ================================================= */}

                    <NavbarCompany />


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (

                        <div
                            className="
                                mx-2
                                mt-4
                                px-4
                                py-3
                                rounded-md
                                border
                                border-red-200
                                bg-red-50
                                text-sm
                                text-red-600
                            "
                        >
                            {error}
                        </div>

                    )}


                    {/* =================================================
                        COMPANY TABLE
                    ================================================= */}

                    {filteredCompanies.length > 0 ? (

                        <CompanyTable
                            companies={
                                filteredCompanies
                            }
                        />

                    ) : (

                        <div
                            className="
                                flex
                                flex-col
                                items-center
                                justify-center
                                py-16
                            "
                        >

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    text-gray-800
                                "
                            >
                                No companies found
                            </h2>


                            <p
                                className="
                                    mt-2
                                    text-sm
                                    text-gray-500
                                    text-center
                                    max-w-md
                                "
                            >

                                {companyStatus === "ALL"
                                    ? "There are no companies to display."
                                    : `There are no ${String(
                                        companyStatus
                                    ).toLowerCase()} companies.`}

                            </p>


                            {/* =================================================
                                ACTION BUTTONS
                            ================================================= */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    mt-6
                                "
                            >

                                {/* =================================================
                                    CREATE COMPANY
                                ================================================= */}

                                <button
                                    type="button"
                                    onClick={
                                        handleCreateCompany
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        bg-blue-500
                                        text-white
                                        px-4
                                        py-2
                                        rounded-md
                                        hover:bg-blue-600
                                        transition
                                    "
                                >

                                    <Plus
                                        size={16}
                                    />

                                    Create New Company

                                </button>


                                {/* =================================================
                                    IMPORT
                                ================================================= */}

                                <button
                                    type="button"
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        border
                                        border-gray-300
                                        px-4
                                        py-2
                                        rounded-md
                                        hover:bg-gray-50
                                        transition
                                    "
                                >

                                    <Download
                                        size={16}
                                    />

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