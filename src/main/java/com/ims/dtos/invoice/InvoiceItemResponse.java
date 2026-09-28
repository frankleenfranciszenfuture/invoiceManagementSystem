package com.ims.dtos.invoice;


import com.ims.dtos.common.BaseResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InvoiceItemResponse extends BaseResponse {

    // =====================================================
    // ID
    // =====================================================

    private Long id;


    // =====================================================
    // PRODUCT
    // =====================================================

    private Long productId;

    private String productName;


    private String hsnCode;

    // =====================================================
    // DESCRIPTION
    // =====================================================

    private String description;


    // =====================================================
    // UNIT
    // =====================================================

    private Long unitId;

    private String unitName;


    // =====================================================
    // SIZE
    // =====================================================

    private Long sizeId;

    private String sizeName;


    // =====================================================
    // QUANTITY
    // =====================================================

    private BigDecimal quantity;


    // =====================================================
    // UNIT PRICE
    // =====================================================

    private BigDecimal unitPrice;


    // =====================================================
    // AMOUNTS
    // =====================================================

    private BigDecimal grossAmount;

    private BigDecimal discountAmount;

    private BigDecimal taxableAmount;


    // =====================================================
    // TAX
    // =====================================================

    private Long taxMasterId;

    private String taxName;

    private BigDecimal taxPercentage;


    // =====================================================
    // GST PERCENTAGES
    // =====================================================

    private BigDecimal cgstPercentage;

    private BigDecimal sgstPercentage;

    private BigDecimal igstPercentage;


    // =====================================================
    // GST AMOUNTS
    // =====================================================

    private BigDecimal cgstAmount;

    private BigDecimal sgstAmount;

    private BigDecimal igstAmount;

    private BigDecimal taxAmount;


    // =====================================================
    // TOTAL
    // =====================================================

    private BigDecimal totalAmount;
}
