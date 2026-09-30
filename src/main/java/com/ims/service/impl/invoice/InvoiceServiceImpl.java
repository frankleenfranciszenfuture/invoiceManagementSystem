package com.ims.service.impl.invoice;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.invoice.InvoiceCreateRequest;
import com.ims.dtos.invoice.InvoiceItemRequest;
import com.ims.dtos.invoice.InvoiceResponse;
import com.ims.dtos.invoice.InvoiceSearchRequest;
import com.ims.dtos.invoice.InvoiceUpdateRequest;
import com.ims.entity.CustomerEntity;
import com.ims.entity.InvoiceEntity;
import com.ims.entity.InvoiceItemEntity;
import com.ims.entity.ProductEntity;
import com.ims.entity.SizeEntity;
import com.ims.entity.TaxMasterEntity;
import com.ims.entity.UnitEntity;
import com.ims.enums.InvoiceStatus;
import com.ims.exception.BadRequestException;
import com.ims.exception.ResourceNotFoundException;
import com.ims.exception.ValidationException;
import com.ims.mapper.invoice.InvoiceMapper;
import com.ims.repository.CustomerRepository;
import com.ims.repository.InvoiceRepository;
import com.ims.repository.ProductRepository;
import com.ims.repository.SizeRepository;
import com.ims.repository.TaxMasterRepository;
import com.ims.repository.UnitRepository;
import com.ims.service.serviceInterface.invoice.InvoiceNumberService;
import com.ims.service.serviceInterface.invoice.InvoiceService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.InvoiceSpecification;
import com.ims.utils.validation.InvoiceValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;

    private final CustomerRepository customerRepository;

    private final ProductRepository productRepository;

    private final UnitRepository unitRepository;

    private final SizeRepository sizeRepository;

    private final TaxMasterRepository taxMasterRepository;

    private final InvoiceMapper invoiceMapper;

    private final InvoiceValidation invoiceValidation;

    private final InvoiceNumberService invoiceNumberService;

    private final BaseEntityUtil baseEntityUtil;


    // =====================================================
    // CREATE INVOICE
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<InvoiceResponse> createInvoice(
            InvoiceCreateRequest request
    ) {

        log.info("Creating Invoice");


        // =====================================================
        // 1. VALIDATE REQUEST
        // =====================================================

        invoiceValidation.validateCreate(
                request
        );


        // =====================================================
        // 2. FIND CUSTOMER
        // =====================================================

        CustomerEntity customer =
                customerRepository.findById(
                        request.getCustomerId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found with id: "
                                        + request.getCustomerId()
                        )
                );


        // =====================================================
        // 3. INVOICE NUMBER
        // =====================================================

        String invoiceNumber =
                getInvoiceNumber(
                        request.getInvoiceNumber()
                );


        // =====================================================
        // 4. BUILD INVOICE
        // =====================================================

        InvoiceEntity invoice =
                InvoiceEntity.builder()
                        .invoiceNumber(invoiceNumber)
                        .invoiceType(
                                request.getInvoiceType()
                        )
                        .customer(customer)
                        .invoiceDate(
                                request.getInvoiceDate() != null
                                        ? request.getInvoiceDate()
                                        : LocalDate.now()
                        )
                        .dueDate(
                                request.getDueDate()
                        )
                        .shippingAmount(
                                zeroIfNull(
                                        request.getShippingAmount()
                                )
                        )
                        .notes(
                                request.getNotes()
                        )
                        .termsAndConditions(
                                request.getTermsAndConditions()
                        )
                        .status(
                                request.getInvoiceStatus() != null
                                        ? request.getInvoiceStatus()
                                        : InvoiceStatus.DRAFT
                        )
                        .active(true)
                        .build();


        // =====================================================
        // 5. ADD ITEMS
        // =====================================================

        if (request.getInvoiceItems() != null &&
                !request.getInvoiceItems().isEmpty()) {

            for (InvoiceItemRequest itemRequest :
                    request.getInvoiceItems()) {

                InvoiceItemEntity item =
                        createInvoiceItem(
                                itemRequest
                        );


                // Parent invoice
                item.setInvoice(invoice);


                // Item audit
                baseEntityUtil.prepareForCreate(item);


                // Add item
                invoice.getInvoiceItems().add(item);
            }
        }


        // =====================================================
        // 6. CALCULATE TOTALS
        // =====================================================

        calculateInvoiceTotals(invoice);


        // =====================================================
        // 7. AUDIT
        // =====================================================

        baseEntityUtil.prepareForCreate(invoice);


        // =====================================================
        // 8. SAVE
        // =====================================================

        InvoiceEntity savedInvoice =
                invoiceRepository.save(invoice);


        // =====================================================
        // 9. RESPONSE
        // =====================================================

        InvoiceResponse response =
                invoiceMapper.toResponse(
                        savedInvoice
                );


        log.info(
                "Invoice {} created successfully.",
                savedInvoice.getInvoiceNumber()
        );


        return ApiResponse.success(
                response,
                "Invoice created successfully."
        );
    }


    // =====================================================
    // GET BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<InvoiceResponse> getInvoiceById(
            Long id
    ) {

        log.info(
                "Fetching Invoice : {}",
                id
        );


        InvoiceEntity invoice =
                invoiceRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invoice not found with id: "
                                                + id
                                )
                        );


        // =====================================================
        // CHECK ACTIVE
        // =====================================================

        if (!Boolean.TRUE.equals(
                invoice.getActive()
        )) {

            throw new ResourceNotFoundException(
                    "Invoice not found."
            );
        }


        // =====================================================
        // RESPONSE
        // =====================================================

        InvoiceResponse response =
                invoiceMapper.toResponse(invoice);


        return ApiResponse.success(
                response,
                "Invoice fetched successfully."
        );
    }


    // =====================================================
    // GET ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<InvoiceResponse>> getAllInvoices(
            InvoiceSearchRequest request,
            Pageable pageable
    ) {

        // =====================================================
        // 1. BASE SPECIFICATION
        // =====================================================

        Specification<InvoiceEntity> specification =
                Specification.unrestricted();


        // =====================================================
        // 2. ACTIVE INVOICES ONLY
        // =====================================================

        specification =
                specification.and(
                        InvoiceSpecification.isActive()
                );


        // =====================================================
        // 3. SEARCH
        // =====================================================

        specification =
                specification.and(
                        InvoiceSpecification.search(
                                request
                        )
                );


        // =====================================================
        // 4. FETCH
        // =====================================================

        Page<InvoiceEntity> invoices =
                invoiceRepository.findAll(
                        specification,
                        pageable
                );


        // =====================================================
        // 5. RESPONSE
        // =====================================================

        return ApiResponse.success(
                toPageResponse(invoices),
                "Invoices fetched successfully."
        );
    }


    // =====================================================
    // UPDATE
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<InvoiceResponse> updateInvoice(
            Long id,
            InvoiceUpdateRequest request
    ) {

        log.info(
                "Updating Invoice : {}",
                id
        );


        // =====================================================
        // 1. VALIDATE REQUEST
        // =====================================================

        invoiceValidation.validateUpdate(
                request
        );


        // =====================================================
        // 2. FIND INVOICE
        // =====================================================

        InvoiceEntity invoice =
                invoiceRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invoice not found with id: "
                                                + id
                                )
                        );


        // =====================================================
        // 3. CHECK ACTIVE
        // =====================================================

        if (!Boolean.TRUE.equals(
                invoice.getActive()
        )) {

            throw new ValidationException(
                    "Cannot update an inactive invoice."
            );
        }


        // =====================================================
        // 4. FIND CUSTOMER
        // =====================================================

        CustomerEntity customer =
                customerRepository.findById(
                        request.getCustomerId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Customer not found with id: "
                                        + request.getCustomerId()
                        )
                );


        // =====================================================
        // 5. UPDATE BASIC DETAILS
        // =====================================================

        invoice.setInvoiceType(
                request.getInvoiceType()
        );

        invoice.setCustomer(customer);

        invoice.setInvoiceDate(
                request.getInvoiceDate()
        );

        invoice.setDueDate(
                request.getDueDate()
        );

        invoice.setShippingAmount(
                zeroIfNull(
                        request.getShippingAmount()
                )
        );

        invoice.setNotes(
                request.getNotes()
        );

        invoice.setTermsAndConditions(
                request.getTermsAndConditions()
        );


        // =====================================================
        // 6. UPDATE STATUS
        // =====================================================

        if (request.getInvoiceStatus() != null) {

            invoice.setStatus(
                    request.getInvoiceStatus()
            );
        }


        // =====================================================
        // 7. REMOVE OLD ITEMS
        // =====================================================

        invoice.getInvoiceItems().clear();


        // =====================================================
        // 8. ADD NEW ITEMS
        // =====================================================

        if (request.getInvoiceItems() != null) {

            for (InvoiceItemRequest itemRequest :
                    request.getInvoiceItems()) {

                InvoiceItemEntity item =
                        createInvoiceItem(
                                itemRequest
                        );


                item.setInvoice(invoice);


                baseEntityUtil.prepareForCreate(item);


                invoice.getInvoiceItems().add(item);
            }
        }


        // =====================================================
        // 9. RECALCULATE TOTALS
        // =====================================================

        calculateInvoiceTotals(invoice);


        // =====================================================
        // 10. AUDIT
        // =====================================================

        baseEntityUtil.prepareForUpdate(invoice);


        // =====================================================
        // 11. SAVE
        // =====================================================

        InvoiceEntity savedInvoice =
                invoiceRepository.save(invoice);


        // =====================================================
        // 12. RESPONSE
        // =====================================================

        InvoiceResponse response =
                invoiceMapper.toResponse(
                        savedInvoice
                );


        return ApiResponse.success(
                response,
                "Invoice updated successfully."
        );
    }


    // =====================================================
    // CANCEL
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<InvoiceResponse> cancelInvoice(
            Long id
    ) {

        log.info(
                "Cancelling Invoice : {}",
                id
        );


        InvoiceEntity invoice =
                invoiceRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invoice not found with id: "
                                                + id
                                )
                        );


        // =====================================================
        // CHECK ACTIVE
        // =====================================================

        if (!Boolean.TRUE.equals(
                invoice.getActive()
        )) {

            throw new ValidationException(
                    "Invoice is already inactive."
            );
        }


        // =====================================================
        // CHECK STATUS
        // =====================================================

        if (invoice.getStatus() ==
                InvoiceStatus.CANCELLED) {

            throw new BadRequestException(
                    "Invoice is already cancelled."
            );
        }


        // =====================================================
        // CANCEL
        // =====================================================

        invoice.setStatus(
                InvoiceStatus.CANCELLED
        );


        // =====================================================
        // AUDIT
        // =====================================================

        baseEntityUtil.prepareForUpdate(invoice);


        // =====================================================
        // SAVE
        // =====================================================

        InvoiceEntity savedInvoice =
                invoiceRepository.save(invoice);


        // =====================================================
        // RESPONSE
        // =====================================================

        InvoiceResponse response =
                invoiceMapper.toResponse(savedInvoice);


        return ApiResponse.success(
                response,
                "Invoice cancelled successfully."
        );
    }


    // =====================================================
    // DELETE / DEACTIVATE
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<Void> deleteInvoice(
            Long id
    ) {

        log.info(
                "Deleting Invoice : {}",
                id
        );


        InvoiceEntity invoice =
                invoiceRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invoice not found with id: "
                                                + id
                                )
                        );


        if (!Boolean.TRUE.equals(
                invoice.getActive()
        )) {

            throw new ValidationException(
                    "Invoice is already inactive."
            );
        }


        invoice.setActive(false);

        invoice.setStatus(
                InvoiceStatus.CANCELLED
        );


        baseEntityUtil.prepareForUpdate(invoice);


        invoiceRepository.save(invoice);


        log.info(
                "Invoice {} marked as CANCELLED and inactive.",
                invoice.getInvoiceNumber()
        );


        return ApiResponse.success(
                null,
                "Invoice cancelled successfully."
        );
    }


    // =====================================================
    // CREATE INVOICE ITEM
    // =====================================================

    private InvoiceItemEntity createInvoiceItem(
            InvoiceItemRequest request
    ) {

        if (request == null) {

            throw new BadRequestException(
                    "Invoice item is required."
            );
        }


        // =====================================================
        // PRODUCT
        // =====================================================

        ProductEntity product =
                productRepository.findById(
                        request.getProductId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: "
                                        + request.getProductId()
                        )
                );


        // =====================================================
        // UNIT
        // =====================================================

        UnitEntity unit = null;

        if (request.getUnitId() != null) {

            unit =
                    unitRepository.findById(
                            request.getUnitId()
                    ).orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Product unit not found with id: "
                                            + request.getUnitId()
                            )
                    );
        }


        // =====================================================
        // SIZE
        // =====================================================

        SizeEntity size = null;

        if (request.getSizeId() != null) {

            size =
                    sizeRepository.findById(
                            request.getSizeId()
                    ).orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Product size not found with id: "
                                            + request.getSizeId()
                            )
                    );
        }


        // =====================================================
        // TAX
        // =====================================================

        TaxMasterEntity taxMaster = null;

        if (request.getTaxMasterId() != null) {

            taxMaster =
                    taxMasterRepository.findById(
                            request.getTaxMasterId()
                    ).orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Tax master not found with id: "
                                            + request.getTaxMasterId()
                            )
                    );
        }


        // =====================================================
        // BASIC VALUES
        // =====================================================

        BigDecimal quantity =
                zeroIfNull(
                        request.getQuantity()
                );

        BigDecimal unitPrice =
                zeroIfNull(
                        request.getUnitPrice()
                );

        BigDecimal discountAmount =
                zeroIfNull(
                        request.getDiscountAmount()
                );


        // =====================================================
        // GROSS
        // =====================================================

        BigDecimal grossAmount =
                quantity
                        .multiply(unitPrice)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );


        // =====================================================
        // TAXABLE
        // =====================================================

        BigDecimal taxableAmount =
                grossAmount
                        .subtract(discountAmount)
                        .max(BigDecimal.ZERO)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );


        // =====================================================
        // TAX RATES
        // =====================================================

        BigDecimal taxPercentage =
                getTaxPercentage(taxMaster);


        BigDecimal cgstPercentage =
                taxMaster != null &&
                        taxMaster.getCgstRate() != null
                        ? taxMaster.getCgstRate()
                        : taxPercentage.divide(
                        BigDecimal.valueOf(2),
                        2,
                        RoundingMode.HALF_UP
                );


        BigDecimal sgstPercentage =
                taxMaster != null &&
                        taxMaster.getSgstRate() != null
                        ? taxMaster.getSgstRate()
                        : taxPercentage.divide(
                        BigDecimal.valueOf(2),
                        2,
                        RoundingMode.HALF_UP
                );


        BigDecimal igstPercentage =
                taxMaster != null &&
                        taxMaster.getIgstRate() != null
                        ? taxMaster.getIgstRate()
                        : BigDecimal.ZERO;


        // =====================================================
        // TAX AMOUNTS
        // =====================================================

        BigDecimal cgstAmount =
                calculatePercentage(
                        taxableAmount,
                        cgstPercentage
                );


        BigDecimal sgstAmount =
                calculatePercentage(
                        taxableAmount,
                        sgstPercentage
                );


        BigDecimal igstAmount =
                calculatePercentage(
                        taxableAmount,
                        igstPercentage
                );


        // =====================================================
        // TOTAL TAX
        // =====================================================

        BigDecimal taxAmount =
                cgstAmount
                        .add(sgstAmount)
                        .add(igstAmount)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );


        // =====================================================
        // TOTAL
        // =====================================================

        BigDecimal totalAmount =
                taxableAmount
                        .add(taxAmount)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );


        // =====================================================
        // BUILD
        // =====================================================

        return InvoiceItemEntity.builder()

                .product(product)

                .description(
                        request.getDescription()
                )

                .unit(unit)

                .size(size)

                .quantity(quantity)

                .unitPrice(unitPrice)

                .grossAmount(grossAmount)

                .discountAmount(discountAmount)

                .taxableAmount(taxableAmount)

                .taxMaster(taxMaster)

                .taxPercentage(taxPercentage)

                .cgstPercentage(cgstPercentage)

                .sgstPercentage(sgstPercentage)

                .igstPercentage(igstPercentage)

                .cgstAmount(cgstAmount)

                .sgstAmount(sgstAmount)

                .igstAmount(igstAmount)

                .taxAmount(taxAmount)

                .totalAmount(totalAmount)

                .build();
    }


    // =====================================================
    // CALCULATE TOTALS
    // =====================================================

    private void calculateInvoiceTotals(
            InvoiceEntity invoice
    ) {

        BigDecimal subtotal =
                BigDecimal.ZERO;

        BigDecimal discountAmount =
                BigDecimal.ZERO;

        BigDecimal taxAmount =
                BigDecimal.ZERO;


        for (InvoiceItemEntity item :
                invoice.getInvoiceItems()) {

            subtotal =
                    subtotal.add(
                            zeroIfNull(
                                    item.getGrossAmount()
                            )
                    );

            discountAmount =
                    discountAmount.add(
                            zeroIfNull(
                                    item.getDiscountAmount()
                            )
                    );

            taxAmount =
                    taxAmount.add(
                            zeroIfNull(
                                    item.getTaxAmount()
                            )
                    );
        }


        subtotal =
                subtotal.setScale(
                        2,
                        RoundingMode.HALF_UP
                );


        discountAmount =
                discountAmount.setScale(
                        2,
                        RoundingMode.HALF_UP
                );


        taxAmount =
                taxAmount.setScale(
                        2,
                        RoundingMode.HALF_UP
                );


        BigDecimal shippingAmount =
                zeroIfNull(
                        invoice.getShippingAmount()
                );


        BigDecimal grandTotal =
                subtotal
                        .subtract(discountAmount)
                        .add(taxAmount)
                        .add(shippingAmount)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );


        invoice.setSubtotal(subtotal);

        invoice.setDiscountAmount(
                discountAmount
        );

        invoice.setTaxAmount(
                taxAmount
        );

        invoice.setShippingAmount(
                shippingAmount
        );

        invoice.setGrandTotal(
                grandTotal
        );
    }


    // =====================================================
    // TAX RATE
    // =====================================================

    private BigDecimal getTaxPercentage(
            TaxMasterEntity taxMaster
    ) {

        if (taxMaster == null) {
            return BigDecimal.ZERO;
        }


        return taxMaster.getTaxRate() != null
                ? taxMaster.getTaxRate()
                : BigDecimal.ZERO;
    }


    // =====================================================
    // CALCULATE PERCENTAGE
    // =====================================================

    private BigDecimal calculatePercentage(
            BigDecimal amount,
            BigDecimal percentage
    ) {

        if (amount == null ||
                percentage == null) {

            return BigDecimal.ZERO;
        }


        if (amount.signum() == 0 ||
                percentage.signum() == 0) {

            return BigDecimal.ZERO;
        }


        return amount
                .multiply(percentage)
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP
                );
    }


    // =====================================================
    // NULL TO ZERO
    // =====================================================

    private BigDecimal zeroIfNull(
            BigDecimal value
    ) {

        return value != null
                ? value
                : BigDecimal.ZERO;
    }


    // =====================================================
    // INVOICE NUMBER
    // =====================================================

    private String getInvoiceNumber(
            String requestedInvoiceNumber
    ) {

        if (requestedInvoiceNumber != null &&
                !requestedInvoiceNumber.isBlank()) {

            return requestedInvoiceNumber.trim();
        }


        return invoiceNumberService.generateInvoiceNumber();
    }


    // =====================================================
    // PAGE RESPONSE
    // =====================================================

    private PageResponse<InvoiceResponse> toPageResponse(
            Page<InvoiceEntity> invoices
    ) {

        List<InvoiceResponse> content =
                invoices.getContent()
                        .stream()
                        .map(invoice ->
                                invoiceMapper.toResponse(invoice)
                        )
                        .toList();


        return PageResponse
                .<InvoiceResponse>builder()
                .content(content)
                .pageNumber(
                        invoices.getNumber()
                )
                .pageSize(
                        invoices.getSize()
                )
                .totalElements(
                        invoices.getTotalElements()
                )
                .totalPages(
                        invoices.getTotalPages()
                )
                .last(
                        invoices.isLast()
                )
                .build();
    }
}