package com.ims.entity;



import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "categories",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_category_code",
                        columnNames = "category_code"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CategoryEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    //=====================================================
    // CATEGORY CODE
    //=====================================================

    @Column(
            name = "category_code",
            nullable = false,
            length = 20
    )
    private String categoryCode;


    //=====================================================
    // CATEGORY NAME
    //=====================================================

    @Column(
            name = "category_name",
            nullable = false,
            length = 100
    )
    private String categoryName;


    //=====================================================
    // DESCRIPTION
    //=====================================================

    @Column(length = 500)
    private String description;


    //=====================================================
    // SUB CATEGORIES
    //=====================================================

    @OneToMany(
            mappedBy = "category",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<SubCategoryEntity> subCategories =
            new ArrayList<>();


    //=====================================================
    // STATUS
    //=====================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
}