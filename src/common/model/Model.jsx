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
                event.key === "Escape" &&
                type === "invoiceNumberSetting"
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
                    inset-0

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
        overflow-hidden
        rounded-xl
        bg-white
        shadow-2xl

        flex
        flex-col

        ${type === "addInvoice" ||
                            type === "editInvoice"
                            ? `
            w-[1100px]
            max-w-[98vw]
            h-[92vh]
            max-h-[92vh]
        `
                            : `
            w-[950px]
            max-w-[95vw]
            max-h-[90vh]
        `
                        }
    `}
                    onMouseDown={(event) => {
                        event.stopPropagation();
                    }}
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
                        className={
                            type === "addInvoice" ||
                                type === "editInvoice" ||
                                type === "invoiceNumberSetting"
                                ? "flex-1 min-h-0 overflow-y-auto"
                                : ""
                        }
                    >
                        <ModalComponent data={data} />
                    </div>

                </div>

            </div>
        </>
    );
}