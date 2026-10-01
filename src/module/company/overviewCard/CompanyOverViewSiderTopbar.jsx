// import React, {
//     useEffect,
//     useRef,
//     useState,
// } from "react";

// import {
//     useDispatch,
//     useSelector,
// } from "react-redux";

// import { useNavigate } from "react-router-dom";

// import {
//     ChevronDown,
//     Plus,
// } from "lucide-react";

// import {
//     setSelectedCompanyView,
//     setCompanyStatus,
// } from "../slices/companyViewSlice";

// import {
//     setExsistingCompany,
// } from "../slices/companySlice";

// import { openModal } from "../../ui/uiSlice";

// export default function CompanyOverViewSiderTopbar() {

//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const [dropdownOpen, setDropdownOpen] =
//         useState(false);

//     const dropdownRef = useRef(null);

//     /* =========================================================
//        COMPANY VIEW STATE
//     ========================================================= */

//     const selectedCompanyView = useSelector(
//         (state) =>
//             state.companyView?.selectedCompanyView ??
//             "All Companies"
//     );

//     const views = useSelector(
//         (state) =>
//             state.companyView?.views ?? []
//     );

//     /* =========================================================
//        CLOSE DROPDOWN WHEN CLICKING OUTSIDE
//     ========================================================= */

//     useEffect(() => {

//         const handleClickOutside = (event) => {

//             if (
//                 dropdownRef.current &&
//                 !dropdownRef.current.contains(
//                     event.target
//                 )
//             ) {
//                 setDropdownOpen(false);
//             }

//         };

//         document.addEventListener(
//             "mousedown",
//             handleClickOutside
//         );

//         return () => {

//             document.removeEventListener(
//                 "mousedown",
//                 handleClickOutside
//             );

//         };

//     }, []);

//     /* =========================================================
//        CHANGE COMPANY VIEW
//     ========================================================= */

//     const handleViewChange = (view) => {

//         if (!view) {
//             return;
//         }

//         dispatch(
//             setSelectedCompanyView(
//                 view.label
//             )
//         );

//         dispatch(
//             setCompanyStatus(
//                 view.value
//             )
//         );

//         setDropdownOpen(false);

//     };

//     /* =========================================================
//        CREATE NEW COMPANY
//     ========================================================= */

//     const handleNewCompany = () => {

//         setDropdownOpen(false);

//         dispatch(
//             setExsistingCompany(null)
//         );

//         dispatch(
//             openModal({
//                 type: "addCompany",
//                 data: null,
//             })
//         );

//     };

//     /* =========================================================
//        RENDER
//     ========================================================= */

//     return (

//         <div
//             className="
//                 flex
//                 items-center
//                 justify-between
//                 border-b
//                 border-gray-200
//                 bg-white
//                 px-2
//                 py-3
//             "
//         >

//             {/* =====================================================
//                 LEFT - COMPANY VIEW DROPDOWN
//             ===================================================== */}

//             <div
//                 ref={dropdownRef}
//                 className="relative"
//             >

//                 <button
//                     type="button"
//                     onClick={() =>
//                         setDropdownOpen(
//                             (previous) =>
//                                 !previous
//                         )
//                     }
//                     className="
//                         flex
//                         cursor-pointer
//                         select-none
//                         items-center
//                         gap-1
//                         rounded-md
//                         bg-blue-500
//                         px-3
//                         py-1.5
//                         hover:bg-blue-400
//                     "
//                 >

//                     <h2
//                         className="
//                             text-sm
//                             font-medium
//                             text-white
//                         "
//                     >
//                         {
//                             selectedCompanyView
//                         }
//                     </h2>

//                     <ChevronDown
//                         size={13}
//                         className={`
//                             text-white
//                             transition-transform

//                             ${dropdownOpen
//                                 ? "rotate-180"
//                                 : ""
//                             }
//                         `}
//                     />

//                 </button>

//                 {/* =================================================
//                     DROPDOWN
//                 ================================================= */}

//                 {dropdownOpen && (

//                     <div
//                         className="
//                             absolute
//                             left-0
//                             top-9
//                             z-50
//                             w-60
//                             overflow-hidden
//                             rounded-md
//                             border
//                             border-gray-200
//                             bg-white
//                             shadow-lg
//                         "
//                     >

//                         <div
//                             className="
//                                 max-h-72
//                                 overflow-y-auto
//                             "
//                         >

//                             {views.map(
//                                 (view) => (

//                                     <button
//                                         key={
//                                             view.value
//                                         }
//                                         type="button"
//                                         onClick={() =>
//                                             handleViewChange(
//                                                 view
//                                             )
//                                         }
//                                         className={`
//                                             w-full
//                                             border-b
//                                             border-gray-100
//                                             px-4
//                                             py-2.5
//                                             text-left
//                                             text-sm
//                                             transition-colors

//                                             ${selectedCompanyView ===
//                                                 view.label
//                                                 ? "bg-blue-500 text-white"
//                                                 : "text-gray-700 hover:bg-blue-500 hover:text-white"
//                                             }
//                                         `}
//                                     >
//                                         {
//                                             view.label
//                                         }
//                                     </button>

//                                 )
//                             )}

//                         </div>

//                         {/* =================================================
//                             NEW COMPANY
//                         ================================================= */}

//                         <button
//                             type="button"
//                             onClick={
//                                 handleNewCompany
//                             }
//                             className="
//                                 w-full
//                                 border-t
//                                 border-gray-200
//                                 px-4
//                                 py-2.5
//                                 text-left
//                                 text-sm
//                                 font-medium
//                                 text-blue-600
//                                 hover:bg-gray-50
//                             "
//                         >
//                             + New Company
//                         </button>

//                     </div>

//                 )}

//             </div>

//             {/* =====================================================
//                 RIGHT - NEW BUTTON
//             ===================================================== */}

//             <div
//                 className="
//                     flex
//                     items-center
//                     gap-2
//                 "
//             >

//                 <button
//                     type="button"
//                     onClick={
//                         handleNewCompany
//                     }
//                     className="
//                         flex
//                         items-center
//                         gap-1
//                         rounded-md
//                         bg-blue-500
//                         px-3
//                         py-2
//                         text-sm
//                         font-medium
//                         text-white
//                         shadow-sm
//                         hover:bg-blue-400
//                     "
//                 >

//                     <Plus size={13} />

//                     New

//                 </button>

//             </div>

//         </div>

//     );
// }