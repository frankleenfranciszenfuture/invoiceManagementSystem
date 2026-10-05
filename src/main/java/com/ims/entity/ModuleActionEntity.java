package com.ims.entity;

import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "module_actions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_module_action",
                        columnNames = {
                                "module_id",
                                "action_id"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleActionEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "module_id",
            nullable = false
    )
    private ModuleEntity module;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "action_id",
            nullable = false
    )
    private ActionEntity action;

    /*
     * Denormalized names are optional.
     * Keep them only if your existing implementation
     * needs them for faster display/querying.
     */
    @Column(name = "module_name", length = 100)
    private String moduleName;

    @Column(name = "action_name", length = 50)
    private String actionName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
}