import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";

import { closeModal } from "../../module/ui/uiSlice";

import CreateCustomer from "../../module/customer/pages/CustomerCreateModal";
import AddContactPerson from "../../module/customer/overviewCard/model/AddContactPerson";

import TaxMasterCreate from "../../module/taxMaster/pages/TaxMasterCreate";
import SizeCreate from "../../module/sizes/pages/SizeCreate";
import UnitCreate from "../../module/units/pages/UnitCreate";
import SubCategoryCreate from "../../module/subCategory/pages/SubCategoryCreate";
import CategoryCreate from "../../module/category/pages/CategoryCreate";
import ProductCreate from "../../module/items/pages/ProductCreate"
import InvoiceCreate from "../../module/invoices/pages/InvoiceCreate"
import InvoiceNumberSetting from "../../module/invoices/pages/InvoiceNumberSetting";
import ChangeTemplateModal from "../../module/invoices/overview/template/ChangeTemplateModal";
import RoleCreate from "../../module/role/pages/RoleCreate";
import BankAccountCreate from "../../module/bankAccount/pages/BankAccountCreate";
import CompanyCreate from "../../module/company/pages/CompanyCreate";
import UserCreate from "../../module/users/pages/UserCreate";
import EmailSignatureCreate from "../../module/emailSignature/pages/EmailSignatureCreate";
import CurrencyModel from "../../module/currency/pages/CurrencyModel";
import SalesPersonCreateModel from "../../module/salesPerson/pages/SalesPersonCreateModel";
import { addGoodsReceiptItem } from "../../inventoryModule/module/purchaseOrder/slices/purchaseOrderSlice";
import CreateGoodsReceiptModel from "../../inventoryModule/module/purchaseOrder/pages/CreateGoodsReceiptModel";
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
        addCustomer: CreateCustomer,
        editCustomer: CreateCustomer,
        addContactPerson: AddContactPerson,

        //CURRENCY
        addCurrency: CurrencyModel,
        editCurrency: CurrencyModel,

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


        //EmailSignature

        addEmailSignature: EmailSignatureCreate,
        editEmailSignature: EmailSignatureCreate,


        //salesPerson
        addSalesPerson: SalesPersonCreateModel,
        editSalesPerson: SalesPersonCreateModel,


        //purchaseOrderGoodsReceipt
        createGoodsReceipt: CreateGoodsReceiptModel,
        editGoodsReceipt: CreateGoodsReceiptModel
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

        addCustomer: "w-[1050px] max-w-[92vw] h-[90vh] max-h-[90vh]",
        editCustomer: "w-[1050px] max-w-[92vw] h-[90vh] max-h-[90vh]",

        //Currency
        addCurrency: "w-[950px] max-w-[92vw] max-h-[85vh]",
        editCurrency: "w-[950px] max-w-[92vw] max-h-[85vh]",

        // Invoice
        addInvoice: "w-[1050px] max-w-[92vw] h-[90vh] max-h-[90vh]",
        editInvoice: "w-[1050px] max-w-[92vw] h-[90vh] max-h-[90vh]",

        // Email Signature
        addEmailSignature: "w-[850px] max-w-[92vw] max-h-[85vh]",
        editEmailSignature: "w-[850px] max-w-[92vw] max-h-[85vh]",


        // Product
        addProduct: "w-[800px] max-w-[92vw] max-h-[82vh]",
        editProduct: "w-[800px] max-w-[92vw] max-h-[82vh]",

        // Category
        addCategory: "w-[760px] max-w-[92vw] max-h-[80vh]",
        editCategory: "w-[760px] max-w-[92vw] max-h-[80vh]",

        // Subcategory
        addSubCategory: "w-[760px] max-w-[92vw] max-h-[80vh]",
        editSubCategory: "w-[760px] max-w-[92vw] max-h-[80vh]",

        // Size
        addSize: "w-[650px] max-w-[92vw] max-h-[75vh]",
        editSize: "w-[650px] max-w-[92vw] max-h-[75vh]",

        // Unit
        addUnit: "w-[650px] max-w-[92vw] max-h-[75vh]",
        editUnit: "w-[650px] max-w-[92vw] max-h-[75vh]",

        // Tax
        addTaxMaster: "w-[700px] max-w-[92vw] max-h-[78vh]",
        editTaxMaster: "w-[700px] max-w-[92vw] max-h-[78vh]",

        // Bank Account
        addBankAccount: "w-[950px] max-w-[92vw] max-h-[82vh]",
        editBankAccount: "w-[950px] max-w-[92vw] max-h-[82vh]",

        // Company
        addCompany: "w-[800px] max-w-[92vw] max-h-[82vh]",
        editCompany: "w-[800px] max-w-[92vw] max-h-[82vh]",

        // SalesPerson
        addSalesPerson: "w-[800px] max-w-[92vw] max-h-[82vh]",
        editSalesPerson: "w-[800px] max-w-[92vw] max-h-[82vh]",

        // Role
        addRole: "w-[760px] max-w-[92vw] max-h-[80vh]",
        editRole: "w-[760px] max-w-[92vw] max-h-[80vh]",

        // User
        addUser: "w-[800px] max-w-[92vw] max-h-[82vh]",
        editUser: "w-[800px] max-w-[92vw] max-h-[82vh]",

        //PurchaseOrderGoodsReceipt
        createGoodsReceipt: "w-[900px] max-w-[92vw] max-h-[82vh]",
        editGoodsReceipt: "w-[900px] max-w-[92vw] max-h-[82vh]",

        // Permissions
        addRolePermission: "w-[800px] max-w-[92vw] max-h-[82vh]",
        editRolePermission: "w-[800px] max-w-[92vw] max-h-[82vh]",
        addUserPermission: "w-[800px] max-w-[92vw] max-h-[82vh]",
        editUserPermission: "w-[800px] max-w-[92vw] max-h-[82vh]",

        // Other
        invoiceNumberSetting: "w-[650px] max-w-[92vw] max-h-[75vh]",
        changeTemplate: "w-[800px] max-w-[92vw] max-h-[82vh]",
        addContactPerson: "w-[650px] max-w-[92vw] max-h-[75vh]",
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
        left-[5px]

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
        min-w-0
        flex-col
        overflow-hidden
        rounded-md
        bg-white
        shadow-2xl
        left-20
        top-2
        max-h-[calc(100vh-2rem)]

        ${modalSizeClass[type] || "w-[700px] max-w-[80vw] max-h-[75vh]"}
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
            right-5
            top-3
            z-[100]

            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center

            rounded-md
            bg-red-400

            text-gray-100
            shadow-md

            transition-all
            duration-200

            hover:bg-red-500
            hover:text-gray-100

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
        flex-1
        overflow-y-auto
        overflow-x-hidden

        ${type === "addInvoice" ||
                                type === "editInvoice" ||
                                type === "invoiceNumberSetting" ||
                                type === "addEmailSignature" ||
                                type === "editEmailSignature"
                                ? "overscroll-contain"
                                : ""
                            }
    `}
                    >
                        <ModalComponent data={data} />

                    </div>
                </div>

            </div >
        </>
    );
}