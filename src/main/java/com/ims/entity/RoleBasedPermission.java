package com.ims.entity;

import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


@Entity
@SuperBuilder
@Table(
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"role_id", "module_id", "action_id"}
        )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleBasedPermission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private RoleEntity role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private ModuleEntity module;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_id")
    private ActionEntity action;

    @Column(nullable = false)
    private boolean allowed;

}

