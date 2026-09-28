package com.ims.utils.specification;


import com.ims.dtos.invoice.InvoiceSearchRequest;
import com.ims.entity.InvoiceEntity;
import com.ims.enums.InvoiceStatus;
import com.ims.enums.InvoiceType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class InvoiceSpecification {

    private InvoiceSpecification() {
    }


    // =====================================================
    // SEARCH
    // =====================================================

    public static Specification<InvoiceEntity> search(
            InvoiceSearchRequest request
    ) {

        return (root, query, cb) -> {

            List<Predicate> predicates =
                    new ArrayList<>();

            if (request == null) {
                return cb.conjunction();
            }


            // =====================================================
            // INVOICE NUMBER
            // =====================================================

            if (request.getInvoiceNumber() != null &&
                    !request.getInvoiceNumber().isBlank()) {

                predicates.add(
                        cb.like(
                                cb.lower(
                                        root.get("invoiceNumber")
                                ),
                                "%" +
                                        request.getInvoiceNumber()
                                                .toLowerCase()
                                                .trim() +
                                        "%"
                        )
                );
            }


            // =====================================================
            // INVOICE TYPE
            // =====================================================

            if (request.getInvoiceType() != null) {

                predicates.add(
                        cb.equal(
                                root.get("invoiceType"),
                                request.getInvoiceType()
                        )
                );
            }


            // =====================================================
            // STATUS
            // =====================================================

            if (request.getStatus() != null) {

                predicates.add(
                        cb.equal(
                                root.get("status"),
                                request.getStatus()
                        )
                );
            }


            // =====================================================
            // FROM DATE
            // =====================================================

            if (request.getFromDate() != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("invoiceDate"),
                                request.getFromDate()
                        )
                );
            }


            // =====================================================
            // TO DATE
            // =====================================================

            if (request.getToDate() != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("invoiceDate"),
                                request.getToDate()
                        )
                );
            }


            // =====================================================
            // SALE ID
            // =====================================================

            if (request.getSaleId() != null) {

                predicates.add(
                        cb.equal(
                                root.get("sale").get("id"),
                                request.getSaleId()
                        )
                );
            }


            // =====================================================
            // PURCHASE ID
            // =====================================================

            if (request.getPurchaseId() != null) {

                predicates.add(
                        cb.equal(
                                root.get("purchase").get("id"),
                                request.getPurchaseId()
                        )
                );
            }


            // =====================================================
            // STOCK TRANSFER ID
            // =====================================================

            if (request.getStockTransferId() != null) {

                predicates.add(
                        cb.equal(
                                root.get("stockTransfer").get("id"),
                                request.getStockTransferId()
                        )
                );
            }


            // =====================================================
            // MIN GRAND TOTAL
            // =====================================================

            if (request.getMinGrandTotal() != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("grandTotal"),
                                request.getMinGrandTotal()
                        )
                );
            }


            // =====================================================
            // MAX GRAND TOTAL
            // =====================================================

            if (request.getMaxGrandTotal() != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("grandTotal"),
                                request.getMaxGrandTotal()
                        )
                );
            }


            return cb.and(
                    predicates.toArray(
                            new Predicate[0]
                    )
            );
        };
    }


    // =====================================================
    // INVOICE TYPE
    // =====================================================

    public static Specification<InvoiceEntity> hasInvoiceType(
            InvoiceType invoiceType
    ) {

        return (root, query, cb) -> {

            if (invoiceType == null) {
                return cb.conjunction();
            }

            return cb.equal(
                    root.get("invoiceType"),
                    invoiceType
            );
        };
    }


    // =====================================================
    // STATUS
    // =====================================================

    public static Specification<InvoiceEntity> hasStatus(
            InvoiceStatus status
    ) {

        return (root, query, cb) -> {

            if (status == null) {
                return cb.conjunction();
            }

            return cb.equal(
                    root.get("status"),
                    status
            );
        };
    }


    // =====================================================
    // INVOICE DATE BETWEEN
    // =====================================================

    public static Specification<InvoiceEntity> invoiceDateBetween(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        return (root, query, cb) -> {

            if (fromDate != null &&
                    toDate != null) {

                return cb.between(
                        root.get("invoiceDate"),
                        fromDate,
                        toDate
                );
            }

            if (fromDate != null) {

                return cb.greaterThanOrEqualTo(
                        root.get("invoiceDate"),
                        fromDate
                );
            }

            if (toDate != null) {

                return cb.lessThanOrEqualTo(
                        root.get("invoiceDate"),
                        toDate
                );
            }

            return cb.conjunction();
        };
    }


    // =====================================================
    // SALE
    // =====================================================

    public static Specification<InvoiceEntity> hasSale(
            Long saleId
    ) {

        return (root, query, cb) -> {

            if (saleId == null) {
                return cb.conjunction();
            }

            return cb.equal(
                    root.get("sale").get("id"),
                    saleId
            );
        };
    }


    // =====================================================
    // PURCHASE
    // =====================================================

    public static Specification<InvoiceEntity> hasPurchase(
            Long purchaseId
    ) {

        return (root, query, cb) -> {

            if (purchaseId == null) {
                return cb.conjunction();
            }

            return cb.equal(
                    root.get("purchase").get("id"),
                    purchaseId
            );
        };
    }


    // =====================================================
    // PARTY
    // =====================================================

    public static Specification<InvoiceEntity> hasParty(
            Long partyId
    ) {

        return (root, query, cb) -> {

            if (partyId == null) {
                return cb.conjunction();
            }

            return cb.equal(
                    root.get("party").get("id"),
                    partyId
            );
        };
    }


    // =====================================================
    // STOCK TRANSFER
    // =====================================================

    public static Specification<InvoiceEntity> hasStockTransfer(
            Long stockTransferId
    ) {

        return (root, query, cb) -> {

            if (stockTransferId == null) {
                return cb.conjunction();
            }

            return cb.equal(
                    root.get("stockTransfer").get("id"),
                    stockTransferId
            );
        };
    }


    // =====================================================
    // MIN GRAND TOTAL
    // =====================================================

    public static Specification<InvoiceEntity> grandTotalGreaterThanOrEqual(
            BigDecimal amount
    ) {

        return (root, query, cb) -> {

            if (amount == null) {
                return cb.conjunction();
            }

            return cb.greaterThanOrEqualTo(
                    root.get("grandTotal"),
                    amount
            );
        };
    }


    // =====================================================
    // MAX GRAND TOTAL
    // =====================================================

    public static Specification<InvoiceEntity> grandTotalLessThanOrEqual(
            BigDecimal amount
    ) {

        return (root, query, cb) -> {

            if (amount == null) {
                return cb.conjunction();
            }

            return cb.lessThanOrEqualTo(
                    root.get("grandTotal"),
                    amount
            );
        };
    }


    // =====================================================
    // ACTIVE
    // =====================================================

    public static Specification<InvoiceEntity> isActive() {

        return (root, query, cb) ->
                cb.isTrue(
                        root.get("active")
                );
    }

}