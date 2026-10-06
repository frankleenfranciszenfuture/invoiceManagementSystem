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


//@Entity
//@Table(
//        name = "role_based_permissions",
//        uniqueConstraints = {
//                @UniqueConstraint(
//                        name = "uk_role_module_action",
//                        columnNames = {
//                                "role_id",
//                                "module_id",
//                                "action_id"
//                        }
//                )
//        }
//)
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class RoleBasedPermission extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(
//            name = "role_id",
//            nullable = false
//    )
//    private RoleEntity role;
//
//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(
//            name = "module_id",
//            nullable = false
//    )
//    private ModuleEntity module;
//
//    @ManyToOne(fetch = FetchType.LAZY, optional = false)
//    @JoinColumn(
//            name = "action_id",
//            nullable = false
//    )
//    private ActionEntity action;
//
//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false)
//    private Status status;
//
//    @Column(
//            name = "allowed",
//            nullable = false
//    )
//    private Boolean allowed = true;
//}