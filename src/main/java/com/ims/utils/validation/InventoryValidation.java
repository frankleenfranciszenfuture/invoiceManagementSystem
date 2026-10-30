package com.ims.utils.validation;


import com.ims.entity.InventoryStockEntity;
import com.ims.entity.ProductEntity;
import com.ims.entity.WarehouseEntity;
import com.ims.entity.UnitEntity;
import com.ims.entity.SizeEntity;

import com.ims.exception.ResourceNotFoundException;

import com.ims.repository.InventoryStockRepository;
import com.ims.repository.ProductRepository;
import com.ims.repository.WarehouseRepository;
import com.ims.repository.UnitRepository;
import com.ims.repository.SizeRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InventoryValidation {

    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final UnitRepository unitRepository;
    private final SizeRepository sizeRepository;
    private final InventoryStockRepository inventoryStockRepository;

    public ProductEntity validateProduct(Long productId) {

        return productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with ID: " + productId
                        )
                );
    }

    public WarehouseEntity validateWarehouse(Long warehouseId) {

        return warehouseRepository.findById(warehouseId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Warehouse not found with ID: " + warehouseId
                        )
                );
    }

    public UnitEntity validateUnit(Long unitId) {

        return unitRepository.findById(unitId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Unit not found with ID: " + unitId
                        )
                );
    }

    public SizeEntity validateSize(Long sizeId) {

        if (sizeId == null) {
            return null;
        }

        return sizeRepository.findById(sizeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Size not found with ID: " + sizeId
                        )
                );
    }

    public InventoryStockEntity validateStock(Long stockId) {

        return inventoryStockRepository.findById(stockId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Inventory stock not found with ID: " + stockId
                        )
                );
    }
}