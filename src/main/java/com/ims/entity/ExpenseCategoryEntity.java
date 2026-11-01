package com.ims.entity;


import com.ims.entity.BaseEntity;
import com.ims.enums.ExpenseCategoryStatus;
import com.ims.enums.ExpenseType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "expense_categories",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_expense_category_code",
                        columnNames = "category_code"
                ),
                @UniqueConstraint(
                        name = "uk_expense_category_name",
                        columnNames = "category_name"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ExpenseCategoryEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_code", nullable = false, length = 30)
    private String categoryCode;

    @Column(name = "category_name", nullable = false, length = 100)
    private String categoryName;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "expense_type", nullable = false, length = 20)
    private ExpenseType expenseType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ExpenseCategoryStatus status = ExpenseCategoryStatus.ACTIVE;
}