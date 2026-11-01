package com.ims.dtos.expenses;

import com.ims.dtos.common.BaseResponse;
import com.ims.enums.ExpenseCategoryStatus;
import com.ims.enums.ExpenseType;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ExpenseCategoryResponseDTO extends BaseResponse {

    private Long id;
    private String categoryCode;
    private String categoryName;
    private String description;
    private ExpenseType expenseType;
    private ExpenseCategoryStatus status;
}
