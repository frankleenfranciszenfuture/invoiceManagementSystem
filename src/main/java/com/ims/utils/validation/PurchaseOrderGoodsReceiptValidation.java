package com.ims.utils.validation;


import com.ims.dtos.purchaseOrder.PurchaseOrderGoodsReceiptItemRequest;
import com.ims.dtos.purchaseOrder.PurchaseOrderGoodsReceiptRequest;
import com.ims.entity.PurchaseOrderEntity;
import com.ims.entity.PurchaseOrderItemEntity;
import com.ims.enums.PurchaseOrderStatus;
import com.ims.repository.PurchaseOrderItemRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseOrderGoodsReceiptValidation {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final PurchaseOrderItemRepository purchaseOrderItemRepository;

    public void validateReceipt(
            PurchaseOrderEntity purchaseOrder,
            PurchaseOrderGoodsReceiptRequest request
    ) {

        if (purchaseOrder == null) {
            throw new IllegalArgumentException("Purchase Order is required.");
        }

        if (request == null) {
            throw new IllegalArgumentException("Goods receipt request is required.");
        }

        validatePurchaseOrderStatus(purchaseOrder.getPurchaseOrderStatus());

        if (request.getReceiptDate() == null) {
            throw new IllegalArgumentException("Receipt date is required.");
        }

        if (request.getReceiptDate().isBefore(purchaseOrder.getOrderDate())) {
            throw new IllegalArgumentException(
                    "Receipt date cannot be before the Purchase Order date."
            );
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one received item is required."
            );
        }

        Map<Long, PurchaseOrderItemEntity> orderItems =
                purchaseOrder.getItems()
                        .stream()
                        .filter(item -> item.getActive())
                        .collect(Collectors.toMap(
                                PurchaseOrderItemEntity::getId,
                                Function.identity()
                        ));

        Set<Long> processedItemIds = new HashSet<>();

        for (PurchaseOrderGoodsReceiptItemRequest receiptItem : request.getItems()) {

            if (receiptItem == null) {
                throw new IllegalArgumentException(
                        "Goods receipt item cannot be empty."
                );
            }

            Long orderItemId = receiptItem.getPurchaseOrderItemId();

            if (orderItemId == null) {
                throw new IllegalArgumentException(
                        "Purchase Order item ID is required."
                );
            }

            if (!processedItemIds.add(orderItemId)) {
                throw new IllegalArgumentException(
                        "Duplicate Purchase Order item found in this receipt."
                );
            }

            PurchaseOrderItemEntity orderItem = orderItems.get(orderItemId);

            if (orderItem == null) {
                throw new IllegalArgumentException(
                        "Purchase Order item does not belong to this Purchase Order."
                );
            }

            validateReceivedQuantity(receiptItem, orderItem);
            validateReceivedUnitCost(receiptItem.getReceivedUnitCost());
        }
    }

    private void validatePurchaseOrderStatus(PurchaseOrderStatus status) {

        if (status != PurchaseOrderStatus.CONFIRMED
                && status != PurchaseOrderStatus.PARTIALLY_RECEIVED) {

            throw new IllegalArgumentException(
                    "Goods can only be received against a confirmed or partially received Purchase Order."
            );
        }
    }

    private void validateReceivedQuantity(
            PurchaseOrderGoodsReceiptItemRequest receiptItem,
            PurchaseOrderItemEntity orderItem
    ) {

        BigDecimal receivedNow = receiptItem.getReceivedQuantity();

        if (receivedNow == null || receivedNow.compareTo(ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Received quantity must be greater than zero."
            );
        }

        BigDecimal alreadyReceived =
                purchaseOrderItemRepository.calculateReceivedQuantity(orderItem.getId());

        if (alreadyReceived == null) {
            alreadyReceived = ZERO;
        }

        BigDecimal pendingQuantity =
                orderItem.getQuantity().subtract(alreadyReceived);

        if (receivedNow.compareTo(pendingQuantity) > 0) {
            throw new IllegalArgumentException(
                    "Received quantity exceeds pending quantity for product: "
                            + orderItem.getProduct().getProductName()
                            + ". Pending quantity: " + pendingQuantity
            );
        }
    }

    private void validateReceivedUnitCost(BigDecimal receivedUnitCost) {

        if (receivedUnitCost != null
                && receivedUnitCost.compareTo(ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Received unit cost cannot be negative."
            );
        }
    }
}
