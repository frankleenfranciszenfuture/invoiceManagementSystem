package com.ims.entity;

import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String moduleName;

    private String description;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

//@Entity
//@Table(
//        name = "modules",
//        uniqueConstraints = {
//                @UniqueConstraint(
//                        name = "uk_module_name",
//                        columnNames = "module_name"
//                )
//        }
//)
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@SuperBuilder
//public class ModuleEntity extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(
//            name = "module_name",
//            nullable = false,
//            length = 100
//    )
//    private String moduleName;
//
//    @Column(
//            name = "description",
//            length = 255
//    )
//    private String description;
//
//
//
//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false)
//    private Status status;
//}