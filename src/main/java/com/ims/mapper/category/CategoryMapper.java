package com.ims.mapper.category;

import com.ims.dtos.category.CategoryRequest;
import com.ims.dtos.category.CategoryResponse;
import com.ims.dtos.subCategory.SubCategoryResponse;
import com.ims.entity.CategoryEntity;
import com.ims.entity.SubCategoryEntity;
import com.ims.mapper.audit.AuditMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = AuditMapper.class,
        builder = @org.mapstruct.Builder(disableBuilder = true)
)
public interface CategoryMapper {

    CategoryEntity toEntity(CategoryRequest request);

    //    @Mapping(target = "branchId", source = "branch.id")
//    @Mapping(target = "branchName", source = "branch.branchName")
    @Mapping(target = "audit", source = ".")
    CategoryResponse toResponse(CategoryEntity entity);

    List<CategoryResponse> toResponse(List<CategoryEntity> entities);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryCode", source = "category.categoryCode")
    @Mapping(target = "categoryName", source = "category.categoryName")
    SubCategoryResponse toSubCategoryResponse(SubCategoryEntity entity);

    List<SubCategoryResponse> toSubCategoryResponse(List<SubCategoryEntity> entities);

    void updateEntity(CategoryRequest request,
                      @MappingTarget CategoryEntity entity);
}