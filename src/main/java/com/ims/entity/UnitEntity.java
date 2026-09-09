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
        name = "units",
        indexes = {
                @Index(
                        name = "idx_unit_branch_name",
                        columnList = "branch_id, unit_name"
                ),
                @Index(
                        name = "idx_unit_branch_short_name",
                        columnList = "branch_id, unit_short_name"
                ),
                @Index(
                        name = "idx_unit_branch_code",
                        columnList = "branch_id, unit_code"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UnitEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "unit_code",
            length = 20
    )
    private String unitCode;

    @Column(
            nullable = false,
            length = 50
    )
    private String unitName;

    @Column(
            name = "unit_short_name",
            nullable = false,
            length = 20
    )
    private String unitShortName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
}