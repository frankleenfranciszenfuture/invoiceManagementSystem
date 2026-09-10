package com.ims.entity;


import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "sub_category",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_sub_category_code",
                        columnNames = "sub_category_code"
                )
        },
        indexes = {
                @Index(
                        name = "idx_sub_category_category",
                        columnList = "category_id"
                ),
                @Index(
                        name = "idx_sub_category_name",
                        columnList = "name"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubCategoryEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // SUB CATEGORY CODE
    // =====================================================

    @Column(
            name = "sub_category_code",
            nullable = false,
            length = 30
    )
    private String subCategoryCode;


    // =====================================================
    // NAME
    // =====================================================

    @Column(
            nullable = false,
            length = 150
    )
    private String name;


    // =====================================================
    // DESCRIPTION
    // =====================================================

    @Column(
            length = 500
    )
    private String description;


    // =====================================================
    // CATEGORY
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "category_id",
            nullable = false
    )
    private CategoryEntity category;


    // =====================================================
    // DISPLAY ORDER
    // =====================================================

    @Column(name = "display_order")
    private Integer displayOrder;


    // =====================================================
    // STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.ACTIVE;


    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    public void prePersist() {

        if (status == null) {
            status = Status.ACTIVE;
        }
    }
}