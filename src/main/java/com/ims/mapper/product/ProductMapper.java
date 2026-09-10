package com.ims.mapper.product;

import com.ims.dtos.product.ProductRequest;
import com.ims.dtos.product.ProductResponse;
import com.ims.dtos.sizes.SizeResponse;
import com.ims.dtos.units.UnitResponse;
import com.ims.entity.ProductEntity;
import com.ims.entity.SizeEntity;
import com.ims.entity.UnitEntity;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class
        }
)
public interface ProductMapper {

    // =====================================================
    // REQUEST -> ENTITY
    // =====================================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productCode", ignore = true)
    @Mapping(target = "sku", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "purchasingPrice", source = "purchasingPrice")
    @Mapping(target = "sellingPrice", source = "sellingPrice")
    @Mapping(target = "subCategory", ignore = true)
    @Mapping(target = "tax", ignore = true)
    @Mapping(target = "party", ignore = true)
    @Mapping(target = "sizes", ignore = true)
    @Mapping(target = "units", ignore = true)
    @Mapping(target = "status", ignore = true)
    ProductEntity toEntity(ProductRequest request);


    // =====================================================
// SIZE MAPPING
// =====================================================

    @Mapping(target = "audit", source = ".")
    SizeResponse toSizeResponse(SizeEntity size);


// =====================================================
// UNIT MAPPING
// =====================================================

    @Mapping(target = "audit", source = ".")
    UnitResponse toUnitResponse(UnitEntity unit);

    // =====================================================
    // ENTITY -> RESPONSE
    // =====================================================

    @Mapping(
            target = "subCategoryId",
            source = "subCategory.id"
    )
    @Mapping(
            target = "subCategoryName",
            source = "subCategory.name"
    )
    @Mapping(
            target = "categoryId",
            source = "subCategory.category.id"
    )
    @Mapping(
            target = "categoryName",
            source = "subCategory.category.categoryName"
    )

    // =====================================================
    // TAX MASTER
    // =====================================================

    @Mapping(
            target = "taxId",
            source = "tax.id"
    )
    @Mapping(
            target = "taxName",
            source = "tax.taxName"
    )
    @Mapping(
            target = "taxRate",
            source = "tax.taxRate"
    )

    // =====================================================
    // SIZE + UNIT
    // =====================================================

    @Mapping(
            target = "sizes",
            source = "sizes"
    )
    @Mapping(
            target = "units",
            source = "units"
    )
    @Mapping(target = "imageUrl", source = "imageUrl")
    @Mapping(target = "purchasingPrice", source = "purchasingPrice")
    @Mapping(target = "sellingPrice", source = "sellingPrice")

    // =====================================================
    // AUDIT
    // =====================================================

    @Mapping(
            target = "audit",
            source = "."
    )
    ProductResponse toResponse(ProductEntity product);


    // =====================================================
    // LIST
    // =====================================================

    List<ProductResponse> toResponseList(
            List<ProductEntity> products
    );


    // =====================================================
    // UPDATE
    // =====================================================

    @BeanMapping(
            nullValuePropertyMappingStrategy =
                    NullValuePropertyMappingStrategy.IGNORE
    )
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productCode", ignore = true)
    @Mapping(target = "sku", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "subCategory", ignore = true)
    @Mapping(target = "tax", ignore = true)
    @Mapping(target = "party", ignore = true)
    @Mapping(target = "sizes", ignore = true)
    @Mapping(target = "units", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateEntity(
            ProductRequest request,
            @MappingTarget ProductEntity entity
    );
}