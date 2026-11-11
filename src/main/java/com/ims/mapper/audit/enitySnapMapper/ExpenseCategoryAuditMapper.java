package com.ims.mapper.audit.enitySnapMapper;



import com.ims.common.audit.AuditSnapshotMapper;
import com.ims.dtos.audit.enityAuditSnapShot.ExpenseCategoryAuditSnapshot;
import com.ims.entity.ExpenseCategoryEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ExpenseCategoryAuditMapper extends AuditSnapshotMapper {

    ExpenseCategoryAuditSnapshot toAuditSnapshot(
            ExpenseCategoryEntity entity
    );

    @Override
    default boolean supports(String entityName) {
        return "EXPENSE_CATEGORY".equalsIgnoreCase(entityName);
    }

    @Override
    default Object toSnapshot(Object entity) {

        if (!(entity instanceof ExpenseCategoryEntity expenseCategory)) {
            throw new IllegalArgumentException(
                    "Expected ExpenseCategoryEntity but received: "
                            + (entity == null
                            ? "null"
                            : entity.getClass().getName())
            );
        }

        return toAuditSnapshot(expenseCategory);
    }
}
