
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const MODAL_MESSAGES = {
    addRole: "Create Role",
    editRole: "Edit Role",

    addSize: "Create Size",
    editSize: "Edit Size",

    addUnit: "Create Unit",
    editUnit: "Edit Unit",

    addCategory: "Create Category",
    editCategory: "Edit Category",

    addSubCategory: "Create Sub Category",
    editSubCategory: "Edit Sub Category",

    addTaxMaster: "Create Tax Master",
    editTaxMaster: "Edit Tax Master",

    addCustomer: "Create Customer",
    editCustomer: "Edit Customer",

    addProduct: "Create Product",
    editProduct: "Edit Product",

    createInvoice: "Create Invoice",
    editInvoice: "Edit Invoice",
};

export default function GlobalModalToast() {
    const modal = useSelector((state) => state.ui?.modal);

    const previousOpenRef = useRef(false);
    const previousTypeRef = useRef(null);

    useEffect(() => {
        const isOpen = modal?.open === true;
        const modalType = modal?.type;

        /*
         * Show toast only when:
         * 1. Modal changes from closed -> open
         * OR
         * 2. A different modal type is opened
         */
        if (
            isOpen &&
            (
                !previousOpenRef.current ||
                previousTypeRef.current !== modalType
            )
        ) {
            const message =
                MODAL_MESSAGES[modalType] ||
                "Form opened";

            toast(message, {
                id: `modal-${modalType}`,
                duration: 2000,
            });
        }

        previousOpenRef.current = isOpen;
        previousTypeRef.current = isOpen ? modalType : null;
    }, [modal?.open, modal?.type]);

    return null;
}