
package com.ims.service.serviceInterface.saleOrder;

import com.ims.entity.PartyEntity;
import com.ims.enums.SaleOrderTaxType;

public interface SaleOrderTaxTypeResolver {

    SaleOrderTaxType resolveTaxType(
            String companyRegisteredState,
            PartyEntity party
    );
}
