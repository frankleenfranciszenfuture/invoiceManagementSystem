package com.ims.mapper.audit.enitySnapMapper;

import com.ims.entity.PurchaseOrderGoodsReceiptEntity;
import com.ims.entity.PurchaseOrderGoodsReceiptItemEntity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ims.common.audit.AuditSnapshotMapper;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PurchaseOrderGoodsReceiptAuditSnapshotMapper
        implements AuditSnapshotMapper {

    private final ObjectMapper objectMapper;

    @Override
    public boolean supports(String entityName) {
        return "PURCHASE_ORDER_GOODS_RECEIPT"
                .equalsIgnoreCase(entityName);
    }

    @Override
    public Object toSnapshot(Object entity) {

        if (!(entity instanceof PurchaseOrderGoodsReceiptEntity receipt)) {
            throw new IllegalArgumentException(
                    "Invalid entity supplied to Purchase Order Goods Receipt audit mapper."
            );
        }

        ObjectNode snapshot = objectMapper.createObjectNode();

        // Goods Receipt details
        snapshot.put("id", receipt.getId());
        snapshot.put("receiptNo", receipt.getReceiptNo());
        snapshot.put("receiptDate",
                receipt.getReceiptDate() != null
                        ? receipt.getReceiptDate().toString()
                        : null);
        snapshot.put("notes", receipt.getNotes());

        // Purchase Order reference
        if (receipt.getPurchaseOrder() != null) {

            snapshot.put(
                    "purchaseOrderId",
                    receipt.getPurchaseOrder().getId()
            );

            snapshot.put(
                    "purchaseOrderNo",
                    receipt.getPurchaseOrder().getOrderNo()
            );

        } else {
            snapshot.putNull("purchaseOrderId");
            snapshot.putNull("purchaseOrderNo");
        }

        // Warehouse reference
        if (receipt.getWarehouse() != null) {
            snapshot.put(
                    "warehouseId",
                    receipt.getWarehouse().getId()
            );
        } else {
            snapshot.putNull("warehouseId");
        }

        // Receipt items
        ArrayNode itemsArray = snapshot.putArray("items");

        if (receipt.getItems() != null) {

            for (PurchaseOrderGoodsReceiptItemEntity item :
                    receipt.getItems()) {

                ObjectNode itemSnapshot =
                        itemsArray.addObject();

                itemSnapshot.put("id", item.getId());

                if (item.getPurchaseOrderItem() != null) {
                    itemSnapshot.put(
                            "purchaseOrderItemId",
                            item.getPurchaseOrderItem().getId()
                    );
                } else {
                    itemSnapshot.putNull("purchaseOrderItemId");
                }

                itemSnapshot.put(
                        "receivedQuantity",
                        item.getReceivedQuantity() != null
                                ? item.getReceivedQuantity()
                                : null
                );

                itemSnapshot.put(
                        "receivedUnitCost",
                        item.getReceivedUnitCost() != null
                                ? item.getReceivedUnitCost()
                                : null
                );

                itemSnapshot.put(
                        "receivedTotalCost",
                        item.getReceivedTotalCost() != null
                                ? item.getReceivedTotalCost()
                                : null
                );
            }
        }

        return snapshot;
    }
}

