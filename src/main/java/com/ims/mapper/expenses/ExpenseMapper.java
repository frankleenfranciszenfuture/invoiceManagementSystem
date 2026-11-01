
package com.ims.mapper.expenses;

import com.ims.dtos.expenses.ExpenseRequestDTO;
import com.ims.dtos.expenses.ExpenseResponseDTO;
import com.ims.entity.ExpenseEntity;
import com.ims.mapper.audit.AuditMapper;

import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        uses = {
                AuditMapper.class
        }
)
public interface ExpenseMapper {

    // =====================================================
    // REQUEST DTO -> ENTITY
    // =====================================================

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "expenseNo", ignore = true)

    // Relationships resolved in service
    @Mapping(target = "expenseCategory", ignore = true)
    @Mapping(target = "vendor", ignore = true)
    @Mapping(target = "currency", ignore = true)
    @Mapping(target = "taxMaster", ignore = true)

    // Exchange rate calculated in service
    @Mapping(target = "exchangeRate", ignore = true)

    // Calculated selected-currency amounts
    @Mapping(target = "taxableAmount", ignore = true)
    @Mapping(target = "cgstAmount", ignore = true)
    @Mapping(target = "sgstAmount", ignore = true)
    @Mapping(target = "igstAmount", ignore = true)
    @Mapping(target = "totalTaxAmount", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)

    // Calculated base INR amounts
    @Mapping(target = "baseAmount", ignore = true)
    @Mapping(target = "baseDiscountAmount", ignore = true)
    @Mapping(target = "baseTaxableAmount", ignore = true)
    @Mapping(target = "baseCgstAmount", ignore = true)
    @Mapping(target = "baseSgstAmount", ignore = true)
    @Mapping(target = "baseIgstAmount", ignore = true)
    @Mapping(target = "baseTotalTaxAmount", ignore = true)
    @Mapping(target = "baseTotalAmount", ignore = true)

    // Payment fields
    @Mapping(target = "paidAmount", ignore = true)
    @Mapping(target = "dueAmount", ignore = true)

    // Status fields
    @Mapping(target = "expenseStatus", ignore = true)
    @Mapping(target = "paymentStatus", ignore = true)

    // Approval and rejection
    @Mapping(target = "approvedBy", ignore = true)
    @Mapping(target = "approvedAt", ignore = true)
    @Mapping(target = "rejectedBy", ignore = true)
    @Mapping(target = "rejectedAt", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)

    // BaseEntity audit fields
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)

    ExpenseEntity toEntity(ExpenseRequestDTO dto);


    // =====================================================
    // ENTITY -> RESPONSE DTO
    // =====================================================

    // Expense category
    @Mapping(target = "expenseCategoryId", source = "expenseCategory.id")
    @Mapping(target = "categoryCode", source = "expenseCategory.categoryCode")
    @Mapping(target = "categoryName", source = "expenseCategory.categoryName")

    // Vendor
    @Mapping(target = "vendorId", source = "vendor.id")
    @Mapping(target = "vendorName", source = "vendor.companyName")

    // Currency
    @Mapping(target = "currencyId", source = "currency.id")
    @Mapping(target = "currencyCode", source = "currency.currencyCode")
    @Mapping(target = "currencyName", source = "currency.currencyName")
    @Mapping(target = "currencySymbol", source = "currency.symbol")

    // Tax master
    @Mapping(target = "taxMasterId", source = "taxMaster.id")
    @Mapping(target = "taxName", source = "taxMaster.taxName")

    // Audit
    @Mapping(target = "audit", source = ".")

    ExpenseResponseDTO toResponseDTO(ExpenseEntity entity);


    // =====================================================
    // UPDATE ENTITY
    // =====================================================

    @BeanMapping(
            nullValuePropertyMappingStrategy =
                    NullValuePropertyMappingStrategy.IGNORE
    )

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "expenseNo", ignore = true)

    // Relationships resolved in service
    @Mapping(target = "expenseCategory", ignore = true)
    @Mapping(target = "vendor", ignore = true)
    @Mapping(target = "currency", ignore = true)
    @Mapping(target = "taxMaster", ignore = true)

    // Exchange rate calculated in service
    @Mapping(target = "exchangeRate", ignore = true)

    // Calculated selected-currency amounts
    @Mapping(target = "taxableAmount", ignore = true)
    @Mapping(target = "cgstAmount", ignore = true)
    @Mapping(target = "sgstAmount", ignore = true)
    @Mapping(target = "igstAmount", ignore = true)
    @Mapping(target = "totalTaxAmount", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)

    // Calculated base INR amounts
    @Mapping(target = "baseAmount", ignore = true)
    @Mapping(target = "baseDiscountAmount", ignore = true)
    @Mapping(target = "baseTaxableAmount", ignore = true)
    @Mapping(target = "baseCgstAmount", ignore = true)
    @Mapping(target = "baseSgstAmount", ignore = true)
    @Mapping(target = "baseIgstAmount", ignore = true)
    @Mapping(target = "baseTotalTaxAmount", ignore = true)
    @Mapping(target = "baseTotalAmount", ignore = true)

    // Payment fields
    @Mapping(target = "paidAmount", ignore = true)
    @Mapping(target = "dueAmount", ignore = true)

    // Status fields
    @Mapping(target = "expenseStatus", ignore = true)
    @Mapping(target = "paymentStatus", ignore = true)

    // Approval and rejection
    @Mapping(target = "approvedBy", ignore = true)
    @Mapping(target = "approvedAt", ignore = true)
    @Mapping(target = "rejectedBy", ignore = true)
    @Mapping(target = "rejectedAt", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)

    // BaseEntity audit fields
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)

    void updateEntity(
            ExpenseRequestDTO dto,
            @MappingTarget ExpenseEntity entity
    );
}
