package com.ims.mapper.audit.enitySnapMapper;


import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.ExpenseAuditSnapshot;
import com.ims.entity.ExpenseEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ExpenseAuditMapper extends AuditSnapshotMapper {

    @Mapping(target = "expenseCategoryId", source = "expenseCategory.id")
    @Mapping(target = "categoryCode", source = "expenseCategory.categoryCode")
    @Mapping(target = "categoryName", source = "expenseCategory.categoryName")

    @Mapping(target = "vendorId", source = "vendor.id")
    @Mapping(target = "vendorName", source = "vendor.companyName")

    @Mapping(target = "currencyId", source = "currency.id")
    @Mapping(target = "currencyCode", source = "currency.currencyCode")
    @Mapping(target = "currencyName", source = "currency.currencyName")
    @Mapping(target = "currencySymbol", source = "currency.symbol")

    @Mapping(target = "taxMasterId", source = "taxMaster.id")
    @Mapping(target = "taxName", source = "taxMaster.taxName")
    ExpenseAuditSnapshot toAuditSnapshot(ExpenseEntity entity);

    @Override
    default boolean supports(String entityName) {
        return "EXPENSE".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof ExpenseEntity expense)) {
            throw new IllegalArgumentException(
                    "Expected ExpenseEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(expense);
    }
}
