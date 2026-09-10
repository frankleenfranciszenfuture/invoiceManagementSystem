package com.ims.service.impl.product;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.product.ProductRequest;
import com.ims.dtos.product.ProductResponse;
import com.ims.entity.CategoryEntity;
import com.ims.entity.ProductEntity;
import com.ims.entity.SizeEntity;
import com.ims.entity.SubCategoryEntity;
import com.ims.entity.TaxMasterEntity;
import com.ims.entity.UnitEntity;
import com.ims.enums.Status;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;
import com.ims.mapper.product.ProductMapper;
import com.ims.repository.ProductRepository;
import com.ims.service.serviceInterface.fileStorage.FileStorageService;
import com.ims.service.serviceInterface.product.ProductService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.ProductSpecification;
import com.ims.utils.validation.ProductValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static com.ims.utils.apiConstants.ProductConstants.UPDATED;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final BaseEntityUtil baseEntityUtil;
    private final ProductValidation productValidation;
    private final FileStorageService fileStorageService;


    //=====================================================
    // CREATE PRODUCT
    //=====================================================

    @Override
    @Transactional
    public ApiResponse<ProductResponse> createProduct(
            ProductRequest request,
            MultipartFile image) {

        log.info(
                "Creating Product : {}",
                request.getProductName()
        );

        // =====================================================
        // 1. VALIDATE REQUEST
        // =====================================================

        productValidation.validateCreate(request);

        // =====================================================
        // 2. VALIDATE DUPLICATE PRODUCT NAME
        // =====================================================

        productValidation.validateDuplicateName(
                request.getProductName()
        );

        // =====================================================
        // 3. VALIDATE SUB CATEGORY
        // =====================================================

        SubCategoryEntity subCategory =
                productValidation.validateSubCategory(
                        request.getSubCategoryId()
                );

        // =====================================================
        // 4. GET CATEGORY
        // =====================================================

        CategoryEntity category =
                subCategory.getCategory();

        if (category == null) {

            throw new ValidationException(
                    "Sub Category is not linked to a category."
            );
        }

        // =====================================================
        // 5. VALIDATE CATEGORY + SUB CATEGORY
        // =====================================================

        productValidation.validateSubCategoryCategory(
                category,
                subCategory
        );

        // =====================================================
        // 6. VALIDATE TAX
        // =====================================================

        TaxMasterEntity tax =
                productValidation.validateTax(
                        request.getTaxId()
                );

        // =====================================================
        // 7. MAP PRODUCT
        // =====================================================

        ProductEntity product =
                productMapper.toEntity(request);

        product.setSubCategory(
                subCategory
        );

        product.setTax(
                tax
        );

        product.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : Status.ACTIVE
        );

        // =====================================================
        // 8. PREPARE AUDIT
        // =====================================================

        baseEntityUtil.prepareForCreate(
                product
        );

        // =====================================================
        // 9. SAVE FIRST
        //    Required to generate ID
        // =====================================================

        ProductEntity saved =
                productRepository.save(product);

        // =====================================================
        // 10. GENERATE PRODUCT CODE AUTOMATICALLY
        // =====================================================

        saved.setProductCode(
                generateProductCode(
                        saved.getId()
                )
        );

        // =====================================================
        // 11. GENERATE SKU AUTOMATICALLY
        // =====================================================

        saved.setSku(
                generateSku(
                        category,
                        subCategory,
                        saved.getId()
                )
        );

        // =====================================================
        // 12. ADD SIZES
        // =====================================================

        addSizes(
                saved,
                request
        );

        // =====================================================
        // 13. ADD UNITS
        // =====================================================

        addUnits(
                saved,
                request
        );

        // =====================================================
        // 14. IMAGE
        // =====================================================

        uploadImage(
                saved,
                image
        );

        // =====================================================
        // 15. FINAL SAVE
        // =====================================================

        ProductEntity created =
                productRepository.save(
                        saved
                );

        // =====================================================
        // 16. RESPONSE
        // =====================================================

        ProductResponse response =
                mapProductResponse(
                        created
                );

        return ApiResponse.success(
                response,
                "Product created successfully."
        );
    }


    //=====================================================
    // UPDATE PRODUCT
    //=====================================================

    @Override
    @Transactional
    public ApiResponse<ProductResponse> updateProduct(
            Long id,
            ProductRequest request,
            MultipartFile image) {

        log.info(
                "Updating Product : {}",
                id
        );

        // =====================================================
        // 1. VALIDATE PRODUCT
        // =====================================================

        ProductEntity product =
                productValidation.validateProduct(
                        id
                );

        // =====================================================
        // 2. VALIDATE REQUEST
        // =====================================================

        productValidation.validateUpdate(
                request
        );

        // =====================================================
        // 3. VALIDATE DUPLICATE NAME
        // =====================================================

        productValidation.validateDuplicateName(
                id,
                request.getProductName()
        );

        // =====================================================
        // 4. VALIDATE SUB CATEGORY
        // =====================================================

        SubCategoryEntity subCategory =
                productValidation.validateSubCategory(
                        request.getSubCategoryId()
                );

        // =====================================================
        // 5. GET CATEGORY
        // =====================================================

        CategoryEntity category =
                subCategory.getCategory();

        if (category == null) {

            throw new ValidationException(
                    "Sub Category is not linked to a category."
            );
        }

        // =====================================================
        // 6. VALIDATE CATEGORY + SUB CATEGORY
        // =====================================================

        productValidation.validateSubCategoryCategory(
                category,
                subCategory
        );

        // =====================================================
        // 7. VALIDATE TAX
        // =====================================================

        TaxMasterEntity tax =
                productValidation.validateTax(
                        request.getTaxId()
                );

        // =====================================================
        // 8. CHECK WHETHER SKU MUST BE REGENERATED
        // =====================================================

        boolean skuRequired =
                product.getSubCategory() == null
                        || product.getSubCategory().getId() == null
                        || !product.getSubCategory()
                        .getId()
                        .equals(
                                subCategory.getId()
                        );

        // =====================================================
        // 9. UPDATE BASIC FIELDS
        // =====================================================

        productMapper.updateEntity(
                request,
                product
        );

        product.setSubCategory(
                subCategory
        );

        product.setTax(
                tax
        );

        // =====================================================
        // 10. REGENERATE SKU
        // =====================================================

        if (skuRequired) {

            product.setSku(
                    generateSku(
                            category,
                            subCategory,
                            product.getId()
                    )
            );
        }

        // =====================================================
        // 11. UPDATE SIZES
        // =====================================================

        updateSizes(
                product,
                request
        );

        // =====================================================
        // 12. UPDATE UNITS
        // =====================================================

        updateUnits(
                product,
                request
        );

        // =====================================================
        // 13. IMAGE
        // =====================================================

        uploadImage(
                product,
                image
        );

        // =====================================================
        // 14. AUDIT
        // =====================================================

        baseEntityUtil.prepareForUpdate(
                product
        );

        // =====================================================
        // 15. SAVE
        // =====================================================

        ProductEntity updated =
                productRepository.save(
                        product
                );

        // =====================================================
        // 16. RESPONSE
        // =====================================================

        ProductResponse response =
                mapProductResponse(
                        updated
                );

        return ApiResponse.success(
                response,
                UPDATED
        );
    }
//=====================================================
// ADD SIZES
//=====================================================

    private void addSizes(
            ProductEntity product,
            ProductRequest request) {

        if (request.getSizeIds() == null
                || request.getSizeIds().isEmpty()) {

            return;
        }

        for (Long sizeId : request.getSizeIds()) {

            SizeEntity size =
                    productValidation.validateSize(
                            sizeId
                    );

            size.setProduct(
                    product
            );

            size.setStatus(
                    Status.ACTIVE
            );

            product.getSizes().add(
                    size
            );
        }
    }

//=====================================================
// UPDATE SIZES
//=====================================================

    private void updateSizes(
            ProductEntity product,
            ProductRequest request) {

        if (request.getSizeIds() == null) {
            return;
        }

        Set<Long> requestedSizeIds =
                new HashSet<>(
                        request.getSizeIds()
                );

        Set<SizeEntity> existingSizes =
                product.getSizes();

        // =====================================================
        // ADD / REACTIVATE
        // =====================================================

        for (Long sizeId : requestedSizeIds) {

            Optional<SizeEntity> existing =
                    existingSizes.stream()
                            .filter(size ->
                                    size.getId() != null
                                            && size.getId().equals(sizeId)
                            )
                            .findFirst();

            if (existing.isPresent()) {

                SizeEntity size =
                        existing.get();

                size.setProduct(
                        product
                );

                size.setStatus(
                        Status.ACTIVE
                );

                baseEntityUtil.prepareForUpdate(
                        size
                );

            } else {

                SizeEntity size =
                        productValidation.validateSize(
                                sizeId
                        );

                size.setProduct(
                        product
                );

                size.setStatus(
                        Status.ACTIVE
                );

                baseEntityUtil.prepareForUpdate(
                        size
                );

                existingSizes.add(
                        size
                );
            }
        }

        // =====================================================
        // DEACTIVATE REMOVED SIZES
        // =====================================================

        for (SizeEntity size : existingSizes) {

            if (size.getId() == null) {
                continue;
            }

            if (!requestedSizeIds.contains(
                    size.getId()
            )) {

                size.setStatus(
                        Status.INACTIVE
                );

                baseEntityUtil.prepareForUpdate(
                        size
                );
            }
        }
    }

//=====================================================
// ADD UNITS
//=====================================================

    private void addUnits(
            ProductEntity product,
            ProductRequest request) {

        if (request.getUnitIds() == null
                || request.getUnitIds().isEmpty()) {

            return;
        }

        for (Long unitId : request.getUnitIds()) {

            UnitEntity unit =
                    productValidation.validateUnit(
                            unitId
                    );

            unit.setProduct(
                    product
            );

            unit.setStatus(
                    Status.ACTIVE
            );

            product.getUnits().add(
                    unit
            );
        }
    }

//=====================================================
// UPDATE UNITS
//=====================================================

    private void updateUnits(
            ProductEntity product,
            ProductRequest request) {

        Set<Long> requestedUnitIds =
                request.getUnitIds() != null
                        ? new HashSet<>(
                        request.getUnitIds()
                )
                        : Collections.emptySet();

        Set<UnitEntity> existingUnits =
                product.getUnits();

        // =====================================================
        // ADD / REACTIVATE
        // =====================================================

        for (Long unitId : requestedUnitIds) {

            Optional<UnitEntity> existing =
                    existingUnits.stream()
                            .filter(unit ->
                                    unit.getId() != null
                                            && unit.getId().equals(unitId)
                            )
                            .findFirst();

            if (existing.isPresent()) {

                UnitEntity unit =
                        existing.get();

                unit.setProduct(
                        product
                );

                unit.setStatus(
                        Status.ACTIVE
                );

                baseEntityUtil.prepareForUpdate(
                        unit
                );

            } else {

                UnitEntity unit =
                        productValidation.validateUnit(
                                unitId
                        );

                unit.setProduct(
                        product
                );

                unit.setStatus(
                        Status.ACTIVE
                );

                baseEntityUtil.prepareForUpdate(
                        unit
                );

                existingUnits.add(
                        unit
                );
            }
        }

        // =====================================================
        // DEACTIVATE REMOVED UNITS
        // =====================================================

        for (UnitEntity unit : existingUnits) {

            if (unit.getId() == null) {
                continue;
            }

            if (!requestedUnitIds.contains(
                    unit.getId()
            )) {

                unit.setStatus(
                        Status.INACTIVE
                );

                baseEntityUtil.prepareForUpdate(
                        unit
                );
            }
        }
    }


    //=====================================================
    // IMAGE UPLOAD
    //=====================================================

    private void uploadImage(
            ProductEntity product,
            MultipartFile image) {

        if (image == null || image.isEmpty()) {
            log.warn("No product image received.");
            return;
        }

        log.info(
                "Product image received: name={}, size={}, contentType={}",
                image.getOriginalFilename(),
                image.getSize(),
                image.getContentType()
        );

        productValidation.validateImage(image);

        if (product.getImageUrl() != null
                && !product.getImageUrl().isBlank()) {

            fileStorageService.delete(
                    product.getImageUrl()
            );
        }

        String uploadedImagePath =
                fileStorageService.upload(
                        image,
                        "products"
                );

        log.info(
                "Product image uploaded successfully. path={}",
                uploadedImagePath
        );

        product.setImageUrl(
                uploadedImagePath
        );

        log.info(
                "Product imageUrl after upload={}",
                product.getImageUrl()
        );
    }


    //=====================================================
    // PRODUCT CODE GENERATION
    //
    // Example:
    // PRD-000001
    //=====================================================

    private String generateProductCode(
            Long productId) {

        return String.format(
                "PRD-%06d",
                productId
        );
    }


    //=====================================================
    // SKU GENERATION
    //
    // Example:
    // COT-SIL-000001
    //=====================================================

    public String generateSku(
            CategoryEntity category,
            SubCategoryEntity subCategory,
            Long number) {

        String categoryPrefix =
                createPrefix(
                        category.getCategoryName()
                );

        String subCategoryPrefix =
                createPrefix(
                        subCategory.getName()
                );

        return categoryPrefix
                + "-"
                + subCategoryPrefix
                + "-"
                + String.format(
                "%06d",
                number
        );
    }


    //=====================================================
    // PREFIX GENERATOR
    //=====================================================

    private String createPrefix(
            String value) {

        if (value == null
                || value.isBlank()) {

            return "XXX";
        }

        String cleaned =
                value.replaceAll(
                                "[^A-Za-z]",
                                ""
                        )
                        .toUpperCase();

        if (cleaned.length() >= 3) {

            return cleaned.substring(
                    0,
                    3
            );
        }

        return String.format(
                "%-3s",
                cleaned
        ).replace(
                ' ',
                'X'
        );
    }


    //=====================================================
    // GET ALL PRODUCTS
    //=====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<ProductResponse>> getAllProducts(
            String search,
            Status status,
            Pageable pageable) {

        Specification<ProductEntity> specification =
                Specification.allOf(
                        ProductSpecification.isActive(),
                        ProductSpecification.containsKeyword(
                                search
                        )
                );

        if (status != null) {

            specification =
                    specification.and(
                            ProductSpecification.hasStatus(
                                    status
                            )
                    );
        }

        Page<ProductEntity> products =
                productRepository.findAll(
                        specification,
                        pageable
                );

        return ApiResponse.success(
                toPageResponse(
                        products
                ),
                "Products fetched successfully."
        );
    }


    //=====================================================
    // GET PRODUCT BY ID
    //=====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ProductResponse> getProductById(
            Long id) {

        ProductEntity product =
                productValidation.validateProduct(
                        id
                );

        return ApiResponse.success(
                mapProductResponse(
                        product
                ),
                "Product fetched successfully."
        );
    }


    //=====================================================
    // DELETE PRODUCT
    //=====================================================

    @Override
    @Transactional
    public ApiResponse<Void> deleteProduct(
            Long productId) {

        log.info(
                "Deleting product. productId={}",
                productId
        );

        ProductEntity product =
                productRepository
                        .findByIdAndActiveTrue(
                                productId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found with ID: "
                                                + productId
                                )
                        );

        product.setActive(
                false
        );

        product.setStatus(
                Status.INACTIVE
        );

        baseEntityUtil.prepareForUpdate(
                product
        );

        productRepository.save(
                product
        );

        return ApiResponse.success(
                null,
                "Product deleted successfully."
        );
    }


    //=====================================================
    // REACTIVATE PRODUCT
    //=====================================================

    @Override
    @Transactional
    public ApiResponse<ProductResponse> reactivateProduct(
            Long productId) {

        ProductEntity product =
                productRepository
                        .findByIdAndActiveFalse(
                                productId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Inactive product not found with ID: "
                                                + productId
                                ));

        boolean duplicateName =
                productRepository
                        .existsByProductNameIgnoreCaseAndActiveTrue(
                                product.getProductName()
                        );

        if (duplicateName) {

            throw new ValidationException(
                    "Cannot reactivate product. "
                            + "An active product with the same name already exists."
            );
        }

        product.setActive(
                true
        );

        product.setStatus(
                Status.ACTIVE
        );

        baseEntityUtil.prepareForUpdate(
                product
        );

        ProductEntity reactivated =
                productRepository.save(
                        product
                );

        return ApiResponse.success(
                mapProductResponse(
                        reactivated
                ),
                "Product reactivated successfully."
        );
    }


    //=====================================================
    // SEARCH PRODUCTS
    //=====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Page<ProductResponse>> searchProducts(
            String keyword,
            Pageable pageable) {

        Specification<ProductEntity> specification =
                Specification.allOf(
                        ProductSpecification.isActive(),
                        ProductSpecification.containsKeyword(
                                keyword
                        ),
                        ProductSpecification.hasStatus(
                                Status.ACTIVE
                        )
                );

        Page<ProductEntity> products =
                productRepository.findAll(
                        specification,
                        pageable
                );

        return ApiResponse.success(
                products.map(
                        this::mapProductResponse
                ),
                "Products searched successfully."
        );
    }


    //=====================================================
    // GET PRODUCTS BY STATUS
    //=====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<Page<ProductResponse>> getProductsByStatus(
            Status status,
            Pageable pageable) {

        if (status == null) {

            throw new ValidationException(
                    "Status is required."
            );
        }

        Specification<ProductEntity> specification =
                ProductSpecification.hasStatus(
                        status
                );

        Page<ProductEntity> products =
                productRepository.findAll(
                        specification,
                        pageable
                );

        return ApiResponse.success(
                products.map(
                        this::mapProductResponse
                ),
                "Products fetched successfully."
        );
    }


    //=====================================================
    // MAP RESPONSE
    //=====================================================

    private ProductResponse mapProductResponse(
            ProductEntity product) {

        ProductResponse response =
                productMapper.toResponse(
                        product
                );

        String imagePath =
                response.getImageUrl();

        if (imagePath != null
                && !imagePath.isBlank()) {

            response.setImageUrl(
                    fileStorageService.getFileUrl(
                            imagePath
                    )
            );
        }

        return response;
    }


    //=====================================================
    // PAGE RESPONSE
    //=====================================================

    private PageResponse<ProductResponse> toPageResponse(
            Page<ProductEntity> page) {

        return PageResponse.<ProductResponse>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(
                                        this::mapProductResponse
                                )
                                .toList()
                )
                .pageNumber(
                        page.getNumber()
                )
                .pageSize(
                        page.getSize()
                )
                .totalElements(
                        page.getTotalElements()
                )
                .totalPages(
                        page.getTotalPages()
                )
                .last(
                        page.isLast()
                )
                .build();
    }
}