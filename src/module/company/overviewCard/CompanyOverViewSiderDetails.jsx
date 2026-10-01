// import React, { useMemo } from "react";

// import {
//     useDispatch,
//     useSelector,
// } from "react-redux";

// import {
//     useNavigate,
//     useParams,
// } from "react-router-dom";

// import {
//     setExsistingCompany,
// } from "../slices/companySlice";

// export default function CompanyOverViewSiderDetails() {

//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const { id } = useParams();

//     /* =========================================================
//        COMPANY STATE
//     ========================================================= */

//     const companies = useSelector(
//         (state) =>
//             state.company?.companies ?? []
//     );

//     const existingCompany = useSelector(
//         (state) =>
//             state.company?.existingCompany
//     );

//     /* =========================================================
//        COMPANY VIEW STATE
//     ========================================================= */

//     const companyStatus = useSelector(
//         (state) =>
//             state.companyView?.companyStatus ?? "ALL"
//     );

//     /* =========================================================
//        STATUS COLORS
//     ========================================================= */

//     const statusColor = {

//         DRAFT:
//             "bg-yellow-100 text-yellow-700",

//         ACTIVE:
//             "bg-green-100 text-green-700",

//         INACTIVE:
//             "bg-red-100 text-red-700",

//         CANCELLED:
//             "bg-red-100 text-red-700",

//         APPROVED:
//             "bg-green-100 text-green-700",

//         REJECTED:
//             "bg-red-100 text-red-700",

//     };

//     /* =========================================================
//        FILTER COMPANIES
//     ========================================================= */

//     const filteredCompanies = useMemo(() => {

//         if (!Array.isArray(companies)) {
//             return [];
//         }

//         const status =
//             companyStatus?.toUpperCase() ||
//             "ALL";

//         if (status === "ALL") {
//             return companies;
//         }

//         return companies.filter(
//             (company) =>
//                 company.status?.toUpperCase() ===
//                 status
//         );

//     }, [
//         companies,
//         companyStatus,
//     ]);

//     /* =========================================================
//        SORT COMPANIES
//     ========================================================= */

//     const sortedCompanies = useMemo(() => {

//         return [
//             ...filteredCompanies,
//         ].sort(
//             (a, b) =>
//                 Number(a.id) -
//                 Number(b.id)
//         );

//     }, [
//         filteredCompanies,
//     ]);

//     /* =========================================================
//        SELECT COMPANY
//     ========================================================= */

//     const handleCompanyClick = (
//         company
//     ) => {

//         if (!company?.id) {
//             return;
//         }

//         dispatch(
//             setExsistingCompany(
//                 company
//             )
//         );

//         navigate(
//             `/companies/view/${company.id}`
//         );
//     };

//     /* =========================================================
//        STATUS LABEL
//     ========================================================= */

//     const getStatusLabel = (
//         status
//     ) => {

//         return status || "DRAFT";

//     };

//     /* =========================================================
//        RENDER
//     ========================================================= */

//     return (

//         <div
//             className="
//                 w-full
//                 border-b
//                 border-gray-200
//                 bg-white
//             "
//         >

//             {sortedCompanies.length > 0 ? (

//                 <div className="w-full">

//                     {sortedCompanies.map(
//                         (company) => {

//                             const isSelected =
//                                 String(id) ===
//                                 String(
//                                     company.id
//                                 ) ||
//                                 String(
//                                     existingCompany?.id
//                                 ) ===
//                                 String(
//                                     company.id
//                                 );

//                             const normalizedStatus =
//                                 company.status
//                                     ?.toUpperCase();

//                             return (

//                                 <div
//                                     key={
//                                         company.id
//                                     }
//                                     onClick={() =>
//                                         handleCompanyClick(
//                                             company
//                                         )
//                                     }
//                                     className={`
//                                         w-full
//                                         cursor-pointer
//                                         border-b
//                                         border-gray-100
//                                         px-4
//                                         py-4
//                                         transition-all

//                                         ${isSelected
//                                             ? `
//                                                     border-l-4
//                                                     border-l-blue-600
//                                                     bg-blue-50
//                                                   `
//                                             : `
//                                                     hover:bg-gray-50
//                                                   `
//                                         }
//                                     `}
//                                 >

//                                     {/* =================================================
//                                         COMPANY ROW
//                                     ================================================= */}

//                                     <div
//                                         className="
//                                             flex
//                                             items-start
//                                             justify-between
//                                         "
//                                     >

//                                         {/* =================================================
//                                             LEFT SIDE
//                                         ================================================= */}

//                                         <div
//                                             className="
//                                                 flex
//                                                 gap-3
//                                             "
//                                         >

//                                             {/* Checkbox */}

//                                             <input
//                                                 type="checkbox"
//                                                 onClick={(
//                                                     event
//                                                 ) =>
//                                                     event.stopPropagation()
//                                                 }
//                                                 className="
//                                                     mt-1
//                                                 "
//                                             />

//                                             {/* Company Information */}

//                                             <div
//                                                 className="
//                                                     min-w-0
//                                                 "
//                                             >

//                                                 <h3
//                                                     className="
//                                                         font-semibold
//                                                         text-gray-800
//                                                     "
//                                                 >
//                                                     {
//                                                         company.companyName ||
//                                                         "Unnamed Company"
//                                                     }
//                                                 </h3>

//                                                 <p
//                                                     className="
//                                                         text-sm
//                                                         text-gray-500
//                                                     "
//                                                 >
//                                                     #
//                                                     {
//                                                         company.id
//                                                     }
//                                                 </p>

//                                                 {company.companyCode && (

//                                                     <p
//                                                         className="
//                                                             mt-1
//                                                             text-xs
//                                                             text-gray-400
//                                                         "
//                                                     >
//                                                         Code:{" "}
//                                                         {
//                                                             company.companyCode
//                                                         }
//                                                     </p>

//                                                 )}

//                                                 {/* Status */}

//                                                 <span
//                                                     className={`
//                                                         mt-2
//                                                         inline-flex
//                                                         items-center
//                                                         rounded-md
//                                                         px-2
//                                                         py-1
//                                                         text-xs
//                                                         font-medium

//                                                         ${statusColor[
//                                                         normalizedStatus
//                                                         ] ||
//                                                         "bg-gray-100 text-gray-700"
//                                                         }
//                                                     `}
//                                                 >
//                                                     {
//                                                         getStatusLabel(
//                                                             company.status
//                                                         )
//                                                     }
//                                                 </span>

//                                             </div>

//                                         </div>

//                                         {/* =================================================
//                                             RIGHT SIDE
//                                         ================================================= */}

//                                         <div
//                                             className="
//                                                 ml-3
//                                                 shrink-0
//                                                 text-right
//                                             "
//                                         >

//                                             <p
//                                                 className="
//                                                     font-semibold
//                                                     text-gray-800
//                                                 "
//                                             >
//                                                 {
//                                                     company.currency ||
//                                                     "INR"
//                                                 }
//                                             </p>

//                                             {company.gstNumber && (

//                                                 <p
//                                                     className="
//                                                         mt-1
//                                                         text-xs
//                                                         text-gray-400
//                                                     "
//                                                 >
//                                                     {
//                                                         company.gstNumber
//                                                     }
//                                                 </p>

//                                             )}

//                                         </div>

//                                     </div>

//                                 </div>

//                             );

//                         }
//                     )}

//                 </div>

//             ) : (

//                 /* =====================================================
//                    EMPTY STATE
//                 ===================================================== */

//                 <div
//                     className="
//                         flex
//                         min-h-[200px]
//                         items-center
//                         justify-center
//                         text-gray-500
//                     "
//                 >
//                     No companies found.
//                 </div>

//             )}

//         </div>

//     );
// }