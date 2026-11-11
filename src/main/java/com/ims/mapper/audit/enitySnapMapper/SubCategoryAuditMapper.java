package com.ims.mapper.audit.enitySnapMapper;


import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.SubCategoryAuditSnapshot;
import com.ims.entity.SubCategoryEntity;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SubCategoryAuditMapper extends AuditSnapshotMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryCode", source = "category.categoryCode")
    @Mapping(target = "categoryName", source = "category.categoryName")
    SubCategoryAuditSnapshot toAuditSnapshot(SubCategoryEntity entity);

    @Override
    default boolean supports(String entityName) {
        return "SUB_CATEGORY".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof SubCategoryEntity subCategory)) {
            throw new IllegalArgumentException(
                    "Expected SubCategoryEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(subCategory);
    }
}

