package com.ims.entity;

import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;


@Entity
@Data
public class ActionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String actionName;
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    private boolean active= true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}


//@Entity
//@Table(
//        name = "actions",
//        uniqueConstraints = {
//                @UniqueConstraint(
//                        name = "uk_action_name",
//                        columnNames = "action_name"
//                )
//        }
//)
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@SuperBuilder
//public class ActionEntity extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(
//            name = "action_name",
//            nullable = false,
//            length = 50
//    )
//    private String actionName;
//
//    @Column(
//            name = "description",
//            length = 255
//    )
//    private String description;
//
//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false)
//    private Status status;
//}