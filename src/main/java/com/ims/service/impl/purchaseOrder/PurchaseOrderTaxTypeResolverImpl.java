
package com.ims.service.impl.purchaseOrder;

import com.ims.entity.AddressEntity;
import com.ims.entity.CustomerEntity;
import com.ims.entity.PartyAddressEntity;
import com.ims.entity.PartyEntity;
import com.ims.enums.PurchaseOrderTaxType;
import com.ims.exception.BadRequestException;
import com.ims.service.serviceInterface.purchaseOrder.PurchaseOrderTaxTypeResolver;

import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class PurchaseOrderTaxTypeResolverImpl
        implements PurchaseOrderTaxTypeResolver {

    @Override
    public PurchaseOrderTaxType resolveTaxType(
            String companyRegisteredState,
            CustomerEntity customer,
            PartyEntity party
    ) {

        String companyState = normalize(companyRegisteredState);

        if (companyState == null) {
            throw new BadRequestException(
                    "Company registered state is not configured."
            );
        }

        String supplierState;

        // PARTY or BOTH: Party is treated as the supplier.
        if (party != null) {
            supplierState = getPartyState(party);
        }
        // CUSTOMER: Customer is treated as the supplier.
        else if (customer != null) {
            supplierState = getCustomerState(customer);
        }
        else {
            throw new BadRequestException(
                    "Purchase Order supplier is required for GST calculation."
            );
        }

        if (supplierState == null) {
            throw new BadRequestException(
                    "Supplier state is missing. Please configure the supplier address."
            );
        }

        return companyState.equals(supplierState)
                ? PurchaseOrderTaxType.CGST_SGST
                : PurchaseOrderTaxType.IGST;
    }

    /**
     * Resolve customer state.
     * Billing address takes priority.
     * Shipping address is used as fallback.
     */
    private String getCustomerState(CustomerEntity customer) {

        AddressEntity billingAddress = customer.getBillingAddress();

        if (billingAddress != null) {
            String state = normalize(billingAddress.getState());

            if (state != null) {
                return state;
            }
        }

        AddressEntity shippingAddress = customer.getShippingAddress();

        if (shippingAddress != null) {
            String state = normalize(shippingAddress.getState());

            if (state != null) {
                return state;
            }
        }

        throw new BadRequestException(
                "Customer billing/shipping address state is required for GST calculation."
        );
    }

    /**
     * Resolve party state using its default address.
     */
    private String getPartyState(PartyEntity party) {

        if (party.getAddresses() == null || party.getAddresses().isEmpty()) {
            throw new BadRequestException(
                    "Party address is required for GST calculation."
            );
        }

        PartyAddressEntity defaultAddress = party.getAddresses()
                .stream()
                .filter(address ->
                        Boolean.TRUE.equals(address.getDefaultAddress())
                )
                .findFirst()
                .orElseThrow(() -> new BadRequestException(
                        "Party default address is not configured."
                ));

        String state = normalize(defaultAddress.getState());

        if (state == null) {
            throw new BadRequestException(
                    "Party default address state is required for GST calculation."
            );
        }

        return state;
    }

    /**
     * Normalize state names before comparison.
     */
    private String normalize(String state) {

        if (state == null || state.isBlank()) {
            return null;
        }

        return state.trim()
                .replaceAll("\\s+", " ")
                .toUpperCase(Locale.ROOT);
    }
}
