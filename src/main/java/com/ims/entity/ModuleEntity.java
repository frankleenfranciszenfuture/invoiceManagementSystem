package com.ims.entity;

import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "modules",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_module_name",
                        columnNames = "module_name"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ModuleEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "module_name",
            nullable = false,
            length = 100
    )
    private String moduleName;

    @Column(
            name = "description",
            length = 255
    )
    private String description;



    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
}