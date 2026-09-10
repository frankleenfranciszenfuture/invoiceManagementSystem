package com.ims.utils.validation;

import com.ims.dtos.product.ProductRequest;
import com.ims.entity.CategoryEntity;
import com.ims.entity.ProductEntity;
import com.ims.entity.SizeEntity;
import com.ims.entity.SubCategoryEntity;
import com.ims.entity.TaxMasterEntity;
import com.ims.exception.BadRequestException;
import com.ims.exception.DuplicateResourceException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;
import com.ims.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class ProductValidation {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final SizeRepository sizeRepository;
    private final UnitRepository unitRepository;
    private final TaxMasterRepository taxMasterRepository;


    // =====================================================
    // CREATE VALIDATION
    // =====================================================

    public void validateCreate(
            ProductRequest request
    ) {

        if (request == null) {
            throw new BadRequestException(
                    "Product is required."
            );
        }

        if (request.getSubCategoryId() == null) {
            throw new BadRequestException(
                    "Sub Category is required."
            );
        }

        if (request.getProductName() == null
                || request.getProductName().isBlank()) {

            throw new BadRequestException(
                    "Product name is required."
            );
        }

        if (request.getSellingPrice() == null
                || request.getSellingPrice().signum() <= 0) {

            throw new BadRequestException(
                    "Selling price must be greater than zero."
            );
        }

        if (request.getPurchasingPrice() == null
                || request.getPurchasingPrice().signum() <= 0) {

            throw new BadRequestException(
                    "Purchasing price must be greater than zero."
            );
        }

        if (request.getStatus() == null) {
            throw new BadRequestException(
                    "Status is required."
            );
        }
    }


    // =====================================================
    // UPDATE VALIDATION
    // =====================================================

    public void validateUpdate(
            ProductRequest request
    ) {

        if (request == null) {
            throw new BadRequestException(
                    "Product is required."
            );
        }

        if (request.getSubCategoryId() == null) {
            throw new BadRequestException(
                    "Sub Category is required."
            );
        }

        if (request.getProductName() == null
                || request.getProductName().isBlank()) {

            throw new BadRequestException(
                    "Product name is required."
            );
        }

        if (request.getSellingPrice() == null
                || request.getSellingPrice().signum() <= 0) {

            throw new BadRequestException(
                    "Selling price must be greater than zero."
            );
        }

        if (request.getPurchasingPrice() == null
                || request.getPurchasingPrice().signum() <= 0) {

            throw new BadRequestException(
                    "Purchasing price must be greater than zero."
            );
        }

        if (request.getStatus() == null) {
            throw new BadRequestException(
                    "Status is required."
            );
        }
    }


    // =====================================================
    // PRODUCT
    // =====================================================

    public ProductEntity validateProduct(
            Long id
    ) {

        if (id == null) {
            throw new BadRequestException(
                    "Product ID is required."
            );
        }

        return productRepository
                .findProductDetailsById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found."
                        )
                );
    }


    // =====================================================
    // CATEGORY
    // =====================================================

    public CategoryEntity validateCategory(
            Long categoryId
    ) {

        if (categoryId == null) {
            throw new BadRequestException(
                    "Category is required."
            );
        }

        return categoryRepository
                .findByIdAndActiveTrue(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found."
                        )
                );
    }


    // =====================================================
    // SUB CATEGORY
    // =====================================================

    public SubCategoryEntity validateSubCategory(
            Long subCategoryId
    ) {

        if (subCategoryId == null) {
            throw new BadRequestException(
                    "Sub Category is required."
            );
        }

        return subCategoryRepository
                .findByIdAndActiveTrue(subCategoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sub category not found."
                        )
                );
    }


    // =====================================================
    // CATEGORY - SUB CATEGORY
    // =====================================================

    public void validateSubCategoryCategory(
            CategoryEntity category,
            SubCategoryEntity subCategory
    ) {

        if (category == null) {
            throw new BadRequestException(
                    "Category is required."
            );
        }

        if (subCategory == null) {
            throw new BadRequestException(
                    "Sub Category is required."
            );
        }

        if (subCategory.getCategory() == null
                || subCategory.getCategory().getId() == null) {

            throw new BadRequestException(
                    "Sub Category is not linked to a category."
            );
        }

        if (!subCategory
                .getCategory()
                .getId()
                .equals(category.getId())) {

            throw new BadRequestException(
                    "Sub Category does not belong to selected Category."
            );
        }
    }


    // =====================================================
    // DUPLICATE PRODUCT NAME - CREATE
    // =====================================================

    public void validateDuplicateName(
            String productName
    ) {

        if (productName == null
                || productName.isBlank()) {

            return;
        }

        productName = productName.trim();

        if (productRepository
                .existsByProductNameIgnoreCaseAndActiveTrue(
                        productName
                )) {

            throw new DuplicateResourceException(
                    "Product name already exists."
            );
        }
    }


    // =====================================================
    // DUPLICATE PRODUCT NAME - UPDATE
    // =====================================================

    public void validateDuplicateName(
            Long id,
            String productName
    ) {

        if (productName == null
                || productName.isBlank()) {

            return;
        }

        if (id == null) {
            throw new BadRequestException(
                    "Product ID is required."
            );
        }

        productName = productName.trim();

        if (productRepository
                .existsByProductNameIgnoreCaseAndIdNotAndActiveTrue(
                        productName,
                        id
                )) {

            throw new DuplicateResourceException(
                    "Product name already exists."
            );
        }
    }


    // =====================================================
    // DUPLICATE PRODUCT CODE - CREATE
    // =====================================================

    public void validateDuplicateCode(
            String productCode
    ) {

        if (productCode == null
                || productCode.isBlank()) {

            return;
        }

        productCode = productCode.trim();

        if (productRepository
                .existsByProductCodeIgnoreCaseAndActiveTrue(
                        productCode
                )) {

            throw new DuplicateResourceException(
                    "Product code already exists."
            );
        }
    }


    // =====================================================
    // DUPLICATE PRODUCT CODE - UPDATE
    // =====================================================

    public void validateDuplicateCode(
            Long id,
            String productCode
    ) {

        if (productCode == null
                || productCode.isBlank()) {

            return;
        }

        if (id == null) {
            throw new BadRequestException(
                    "Product ID is required."
            );
        }

        productCode = productCode.trim();

        if (productRepository
                .existsByProductCodeIgnoreCaseAndIdNotAndActiveTrue(
                        productCode,
                        id
                )) {

            throw new DuplicateResourceException(
                    "Product code already exists."
            );
        }
    }


    // =====================================================
    // DUPLICATE SKU - CREATE
    // =====================================================

    public void validateDuplicateSku(
            String sku
    ) {

        if (sku == null
                || sku.isBlank()) {

            return;
        }

        sku = sku.trim();

        if (productRepository
                .existsBySkuIgnoreCaseAndActiveTrue(
                        sku
                )) {

            throw new DuplicateResourceException(
                    "SKU already exists."
            );
        }
    }


    // =====================================================
    // DUPLICATE SKU - UPDATE
    // =====================================================

    public void validateDuplicateSku(
            Long id,
            String sku
    ) {

        if (sku == null
                || sku.isBlank()) {

            return;
        }

        if (id == null) {
            throw new BadRequestException(
                    "Product ID is required."
            );
        }

        sku = sku.trim();

        if (productRepository
                .existsBySkuIgnoreCaseAndIdNotAndActiveTrue(
                        sku,
                        id
                )) {

            throw new DuplicateResourceException(
                    "SKU already exists."
            );
        }
    }


    // =====================================================
    // IMAGE
    // =====================================================

    public void validateImage(MultipartFile image) {

        if (image == null || image.isEmpty()) {
            return;
        }

        String contentType = image.getContentType();
        String originalFilename = image.getOriginalFilename();

        String extension = "";

        if (originalFilename != null
                && originalFilename.contains(".")) {

            extension =
                    originalFilename
                            .substring(
                                    originalFilename.lastIndexOf(".") + 1
                            )
                            .toLowerCase();
        }

        Set<String> allowedExtensions = Set.of(
                "jpg",
                "jpeg",
                "png",
                "webp"
        );

        Set<String> allowedContentTypes = Set.of(
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp"
        );

        boolean validContentType =
                contentType != null
                        && allowedContentTypes.contains(
                        contentType.toLowerCase()
                );

        boolean validExtension =
                allowedExtensions.contains(
                        extension
                );

        if (!validContentType && !validExtension) {

            throw new ValidationException(
                    "Only JPG, JPEG, PNG and WEBP images are allowed."
            );
        }
    }

    // =====================================================
    // TAX
    // =====================================================

    public TaxMasterEntity validateTax(
            Long taxId
    ) {

        if (taxId == null) {

            throw new ValidationException(
                    "Tax is required."
            );
        }

        return taxMasterRepository
                .findByIdAndActiveTrue(taxId)
                .orElseThrow(() ->
                        new ValidationException(
                                "Active tax not found with id: "
                                        + taxId
                        )
                );
    }


    // =====================================================
    // SIZE
    // =====================================================

    public SizeEntity validateSize(
            Long sizeId
    ) {

        if (sizeId == null) {

            throw new ValidationException(
                    "Size ID is required."
            );
        }

        return sizeRepository
                .findByIdAndActiveTrue(sizeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Active size not found."
                        )
                );
    }


    // =====================================================
    // UNIT
    // =====================================================

    public com.ims.entity.UnitEntity validateUnit(
            Long unitId
    ) {

        if (unitId == null) {

            throw new ValidationException(
                    "Unit ID is required."
            );
        }

        return unitRepository
                .findByIdAndActiveTrue(unitId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Active unit not found."
                        )
                );
    }
}