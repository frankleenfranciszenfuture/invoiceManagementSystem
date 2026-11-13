package com.ims.service.serviceInterface.purchaseOrder;

import com.ims.entity.CustomerEntity;
import com.ims.entity.PartyEntity;
import com.ims.enums.PurchaseOrderTaxType;

public interface PurchaseOrderTaxTypeResolver {

    PurchaseOrderTaxType resolveTaxType(
            String companyRegisteredState,
            CustomerEntity customer,
            PartyEntity party
    );
}