package com.ims.entity;

import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "sizes",
        indexes = {
                @Index(
                        name = "idx_size_name",
                        columnList = "size_name"
                ),
                @Index(
                        name = "idx_size_short_name",
                        columnList = "size_short_name"
                ),
                @Index(
                        name = "idx_size_code",
                        columnList = "size_code"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SizeEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "size_code",
            length = 20
    )
    private String sizeCode;

    @Column(
            name = "size_name",
            nullable = false,
            length = 50
    )
    private String sizeName;

    @Column(
            name = "size_short_name",
            nullable = false,
            length = 20
    )
    private String sizeShortName;

    @Column(
            length = 255
    )
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "display_order")
    private Integer displayOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "product_id"
    )
    private ProductEntity product;
}