
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { closeModal } from "../../module/ui/uiSlice";
import { X } from "lucide-react";

import AddContactPerson from "../../module/customer/overviewCard/model/AddContactPerson";

import TaxMasterCreate from "../../module/taxMaster/pages/taxMasterCreate";
import SizeCreate from "../../module/sizes/pages/SizeCreate";
import UnitCreate from "../../module/units/pages/UnitCreate";


export default function Modal() {

    const dispatch = useDispatch();

    const { type, data } = useSelector(
        (s) => s.ui.modal
    );

    if (!type) return null;

    /* =========================================================
       MODAL MAP
    ========================================================= */

    const modalMap = {

        // =====================================================
        // CUSTOMER
        // =====================================================

        addContactPerson:
            AddContactPerson,

        // =====================================================
        // TAX MASTER
        // =====================================================

        addTaxMaster:
            TaxMasterCreate,

        editTaxMaster:
            TaxMasterCreate,

        // =====================================================
        // SIZE
        // =====================================================

        addSize:
            SizeCreate,

        editSize:
            SizeCreate,


        // =====================================================
        // SIZE
        // =====================================================

        addUnit:
            UnitCreate,

        editUnit:
            UnitCreate,
    };

    /* =========================================================
       GET MODAL COMPONENT
    ========================================================= */

    const ModalComponent =
        modalMap[type];

    /* =========================================================
       RENDER
    ========================================================= */

    return ModalComponent
        ? <ModalComponent data={data} />
        : null;
}