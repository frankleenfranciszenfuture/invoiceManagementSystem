import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";

import { closeModal } from "../../module/ui/uiSlice";

import AddContactPerson from "../../module/customer/overviewCard/model/AddContactPerson";

import TaxMasterCreate from "../../module/taxMaster/pages/TaxMasterCreate";
import SizeCreate from "../../module/sizes/pages/SizeCreate";
import UnitCreate from "../../module/units/pages/UnitCreate";
import SubCategoryCreate from "../../module/subCategory/pages/SubCategoryCreate";
import CategoryCreate from "../../module/category/pages/CategoryCreate";
import ProductCreate from "../../module/items/pages/ProductCreate"
import InvoiceCreate from "../../module/invoices/pages/InvoiceCreate"
import InvoiceNumberSetting from "../../module/invoices/pages/InvoiceNumberSetting";
import ChangeTemplateModal from "../../module/invoices/overviewCard/template/ChangeTemplateModal";
import RoleCreate from "../../module/role/pages/RoleCreate";
import BankAccountCreate from "../../module/bankAccount/pages/BankAccountCreate";
import CompanyCreate from "../../module/company/pages/CompanyCreate";
import UserCreate from "../../module/users/pages/UserCreate";


export default function Modal() {

    const dispatch = useDispatch();

    const { open, type, data } = useSelector(
        (state) => state.ui.modal
    );


    /* =========================================================
       MODAL MAP
       ========================================================= */

    const modalMap = {

        // CUSTOMER
        addContactPerson: AddContactPerson,

        // TAX MASTER
        addTaxMaster: TaxMasterCreate,
        editTaxMaster: TaxMasterCreate,

        // SIZE
        addSize: SizeCreate,
        editSize: SizeCreate,

        // UNIT
        addUnit: UnitCreate,
        editUnit: UnitCreate,

        // CATEGORY
        addCategory: CategoryCreate,
        editCategory: CategoryCreate,

        // SUB CATEGORY
        addSubCategory: SubCategoryCreate,
        editSubCategory: SubCategoryCreate,

        // TAX MASTER
        addProduct: ProductCreate,
        editProduct: ProductCreate,

        // Invoice
        addInvoice: InvoiceCreate,
        editInvoice: InvoiceCreate,

        // INVOICE NUMBER SETTING
        invoiceNumberSetting: InvoiceNumberSetting,

        // CHANGE INVOICE TEMPLATE
        changeTemplate: ChangeTemplateModal,

        // Role
        addRole: RoleCreate,
        editRole: RoleCreate,

        // User
        addUser: UserCreate,
        editUser: UserCreate,

        // bankAccount
        addBankAccount: BankAccountCreate,
        editBankAccount: BankAccountCreate,

        // company
        addCompany: CompanyCreate,
        editCompany: CompanyCreate,




    };


    const ModalComponent = modalMap[type];


    /* =========================================================
       BODY SCROLL
       IMPORTANT:
       Hook must ALWAYS run.
    ========================================================= */

    useEffect(() => {

        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };

    }, [open]);


    /* =========================================================
       ESC KEY
       IMPORTANT:
       Hook must ALWAYS run.
    ========================================================= */


    useEffect(() => {
        if (!open) {
            return;
        }

        const handleEscape = (event) => {
            if (
                event.key === "Escape"
            ) {
                dispatch(closeModal());
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open, type, dispatch]);


    /* =========================================================
       BACKDROP CLICK
    ========================================================= */

    const handleBackdropClick = (event) => {

        if (event.target === event.currentTarget) {
            dispatch(closeModal());
        }
    };


    /* =========================================================
       AFTER ALL HOOKS
       NOW IT IS SAFE TO RETURN NULL
    ========================================================= */

    if (!open || !type || !ModalComponent) {
        return null;
    }


    const modalSizeClass = {

        addInvoice: "w-[1050px] max-w-[92vw] max-h-[90vh]",
        editInvoice: "w-[1050px] max-w-[92vw] max-h-[90vh]",

        addBankAccount: "w-[950px] max-w-[92vw] max-h-[90vh]",
        editBankAccount: "w-[950px] max-w-[92vw] max-h-[90vh]",

        addProduct: "w-[950px] max-w-[92vw] max-h-[90vh]",
        editProduct: "w-[950px] max-w-[92vw] max-h-[90vh]",

        // Category
        addCategory: "w-[950px] max-w-[92vw] max-h-[90vh]",
        editCategory: "w-[950px] max-w-[92vw] max-h-[90vh]",

        // subCategory
        addSubCategory: "w-[950px] max-w-[92vw] max-h-[90vh]",
        editSubCategory: "w-[950px] max-w-[92vw] max-h-[90vh]",

        addSize: "w-[950px] max-w-[92vw] max-h-[90vh]",
        editSize: "w-[950px] max-w-[92vw] max-h-[90vh]",

        addUnit: "w-[950px] max-w-[92vw] max-h-[90vh]",
        editUnit: "w-[950px] max-w-[92vw] max-h-[90vh]",

        addCompany: "w-[950px] max-w-[92vw] max-h-[90vh]",
        editCompany: "w-[950px] max-w-[92vw] max-h-[90vh]",

        addRole: "w-[950px] max-w-[92vw] max-h-[90vh]",
        editRole: "w-[950px] max-w-[92vw] max-h-[90vh]",


        // USER
        addUser: "w-[950px] max-w-[92vw] max-h-[90vh]",
        editUser: "w-[950px] max-w-[92vw] max-h-[90vh]",

        //TaxMaster
        addTaxMaster: "w-[950px] max-w-[92vw] max-h-[90vh]",
        editTaxMaster: "w-[950px] max-w-[92vw] max-h-[90vh]",

        addRolePermission: "w-[950px] max-w-[92vw] max-h-[90vh]",
        editRolePermission: "w-[950px] max-w-[92vw] max-h-[90vh]",

        addUserPermission: "w-[950px] max-w-[92vw] max-h-[90vh]",
        editUserPermission: "w-[950px] max-w-[92vw] max-h-[90vh]",

        changeTemplate: "w-[950px] max-w-[92vw] max-h-[90vh]",

        addContactPerson: "w-[950px] max-w-[92vw] max-h-[90vh]",
    };
    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <>
            <style>
                {`

                    /* =========================================
                       OVERLAY FADE
                    ========================================= */

                    @keyframes ntmModalOverlayIn {

                        0% {
                            opacity: 0;
                        }

                        100% {
                            opacity: 1;
                        }
                    }


                    /* =========================================
                       MODAL TOP -> CENTER
                    ========================================= */

                    @keyframes ntmModalDropIn {

                        0% {
                            opacity: 0;

                            transform:
                                translate3d(
                                    0,
                                    -100vh,
                                    0
                                )
                                scale(0.94);
                        }

                        45% {
                            opacity: 1;

                            transform:
                                translate3d(
                                    0,
                                    -40px,
                                    0
                                )
                                scale(1.01);
                        }

                        70% {

                            transform:
                                translate3d(
                                    0,
                                    12px,
                                    0
                                )
                                scale(1);
                        }

                        85% {

                            transform:
                                translate3d(
                                    0,
                                    -5px,
                                    0
                                )
                                scale(1);
                        }

                        100% {
                            opacity: 1;

                            transform:
                                translate3d(
                                    0,
                                    0,
                                    0
                                )
                                scale(1);
                        }
                    }


                    /* =========================================
                       OVERLAY
                    ========================================= */

                    .ntm-modal-overlay {

                        animation:
                            ntmModalOverlayIn
                            220ms
                            ease-out
                            forwards;
                    }


                    /* =========================================
                       MODAL
                    ========================================= */

                    .ntm-modal-container {

                        animation:
                            ntmModalDropIn
                            650ms
                            cubic-bezier(
                                0.22,
                                1,
                                0.36,
                                1
                            )
                            forwards;

                        will-change:
                            transform,
                            opacity;
                    }


                    /* =========================================
                       REDUCED MOTION
                    ========================================= */

                    @media (prefers-reduced-motion: reduce) {

                        .ntm-modal-overlay,
                        .ntm-modal-container {

                            animation: none !important;
                        }
                    }

                `}
            </style>


            {/* =================================================
                OVERLAY
            ================================================= */}

            <div
                className="
        ntm-modal-overlay
        fixed
        top-0
        right-0
        bottom-0
        left-[200px]

        z-[99999]

        flex
        items-center
        justify-center

        bg-black/50

        p-4
    "
                onMouseDown={handleBackdropClick}
            >

                {/* =================================================
    MODAL
================================================= */}

                <div
                    className={`
        ntm-modal-container
        relative
        flex
        flex-col
        overflow-hidden
        rounded-xl
        bg-white
        shadow-2xl

        ${modalSizeClass[type] || "w-[900px] max-w-[90vw] max-h-[85vh]"}
    `}
                >



                    {/* =================================================
        CLOSE BUTTON
    ================================================= */}

                    <button
                        type="button"
                        onClick={() => {
                            dispatch(closeModal());
                        }}
                        className="
            absolute
            right-3
            top-3
            z-[100]

            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center

            rounded-full
            bg-white

            text-gray-500
            shadow-md

            transition-all
            duration-200

            hover:bg-gray-100
            hover:text-gray-800

            active:scale-90
        "
                    >
                        <X size={20} />
                    </button>

                    {/* =================================================
        CONTENT
    ================================================= */}

                    <div
                        className={`
            min-h-0
            w-full

            ${type === "addInvoice" ||
                                type === "editInvoice" ||
                                type === "invoiceNumberSetting"
                                ? "flex-1 overflow-y-auto overflow-x-hidden"
                                : ""
                            }
        `}
                    >
                        <ModalComponent data={data} />
                    </div>
                </div>

            </div>
        </>
    );
}