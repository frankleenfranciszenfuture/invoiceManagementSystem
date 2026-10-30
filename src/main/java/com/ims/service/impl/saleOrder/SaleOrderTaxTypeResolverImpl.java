
package com.ims.service.impl.saleOrder;

import com.ims.entity.PartyAddressEntity;
import com.ims.entity.PartyEntity;
import com.ims.enums.SaleOrderTaxType;
import com.ims.service.serviceInterface.saleOrder.SaleOrderTaxTypeResolver;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class SaleOrderTaxTypeResolverImpl
        implements SaleOrderTaxTypeResolver {

    @Override
    public SaleOrderTaxType resolveTaxType(
            String companyRegisteredState,
            PartyEntity party
    ) {

        if (companyRegisteredState == null
                || companyRegisteredState.isBlank()) {
            throw new IllegalArgumentException(
                    "Company registered state is required"
            );
        }

        if (party == null) {
            throw new IllegalArgumentException(
                    "Customer / Party is required"
            );
        }

        List<PartyAddressEntity> addresses = party.getAddresses();

        if (addresses == null || addresses.isEmpty()) {
            throw new IllegalArgumentException(
                    "Customer / Party address is required for GST calculation"
            );
        }

        PartyAddressEntity defaultAddress = addresses.stream()
                .filter(address ->
                        Boolean.TRUE.equals(address.getDefaultAddress()))
                .findFirst()
                .orElse(null);

        if (defaultAddress == null) {
            throw new IllegalArgumentException(
                    "Please set a default address for the Customer / Party"
            );
        }

        String partyState = defaultAddress.getState();

        if (partyState == null || partyState.isBlank()) {
            throw new IllegalArgumentException(
                    "Customer / Party state is required for GST calculation"
            );
        }

        String companyState = normalize(companyRegisteredState);
        partyState = normalize(partyState);

        return companyState.equals(partyState)
                ? SaleOrderTaxType.CGST_SGST
                : SaleOrderTaxType.IGST;
    }

    private String normalize(String state) {
        return state.trim()
                .replaceAll("\\s+", " ")
                .toUpperCase(Locale.ROOT);
    }
}
