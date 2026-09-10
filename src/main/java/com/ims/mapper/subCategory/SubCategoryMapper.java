package com.ims.mapper.subCategory;

import com.ims.dtos.subCategory.CreateSubCategoryRequest;
import com.ims.dtos.subCategory.SubCategoryDropdownResponse;
import com.ims.dtos.subCategory.SubCategoryResponse;
import com.ims.dtos.subCategory.UpdateSubCategoryRequest;
import com.ims.entity.SubCategoryEntity;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring",
        uses = AuditMapper.class)
public interface SubCategoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "subCategoryCode", ignore = true)
    @Mapping(target = "category", ignore = true)
    SubCategoryEntity toEntity(CreateSubCategoryRequest request);

    @BeanMapping(
            nullValuePropertyMappingStrategy =
                    NullValuePropertyMappingStrategy.IGNORE
    )
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "subCategoryCode", ignore = true)
    @Mapping(target = "category", ignore = true)
    void updateEntity(
            UpdateSubCategoryRequest request,
            @MappingTarget SubCategoryEntity entity
    );

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryCode", source = "category.categoryCode")
    @Mapping(target = "categoryName", source = "category.categoryName")
    @Mapping(target = "audit", source = ".")
    SubCategoryResponse toResponse(SubCategoryEntity entity);

    // List Mapping
    List<SubCategoryResponse> toResponse(List<SubCategoryEntity> entities);

    @Mapping(source = "subCategoryCode", target = "code")
    @Mapping(source = "name", target = "label")
    SubCategoryDropdownResponse toDropdown(SubCategoryEntity entity);

    List<SubCategoryDropdownResponse> toDropdown(List<SubCategoryEntity> entities);
}
