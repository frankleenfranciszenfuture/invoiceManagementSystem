package com.ims.mapper.audit.enitySnapMapper;



import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.ProductAuditSnapshot;
import com.ims.entity.ProductEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductAuditMapper extends AuditSnapshotMapper {

    @Mapping(target = "subCategoryId", source = "subCategory.id")
    @Mapping(target = "subCategoryName", source = "subCategory.name")

    @Mapping(target = "categoryId", source = "subCategory.category.id")
    @Mapping(target = "categoryName", source = "subCategory.category.categoryName")

    @Mapping(target = "partyId", source = "party.id")
    @Mapping(target = "partyName", source = "party.companyName")

    @Mapping(target = "taxId", source = "tax.id")
    @Mapping(target = "taxName", source = "tax.taxName")
    ProductAuditSnapshot toAuditSnapshot(ProductEntity entity);

    @Override
    default boolean supports(String entityName) {
        return "PRODUCT".equalsIgnoreCase(entityName)
                || "PRODUCTS".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (entity instanceof ProductEntity product) {
            return toAuditSnapshot(product);
        }

        return null;
    }
}
