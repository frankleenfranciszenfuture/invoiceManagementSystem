package com.ims.dtos.audit.enityAuditSnapShot;



import com.ims.enums.ExpenseCategoryStatus;
import com.ims.enums.ExpenseType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseCategoryAuditSnapshot {

    private Long id;

    private String categoryCode;

    private String categoryName;

    private String description;

    private ExpenseType expenseType;

    private ExpenseCategoryStatus status;

    private Boolean active;
}