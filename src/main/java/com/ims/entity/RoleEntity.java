package com.ims.entity;

import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder

@Table(
        name = "user_roles",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "role_name"
                        }
                )
        }
)
@Entity

public class RoleEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roleName;

    private String description;

    @Enumerated(EnumType.STRING)
    private Status status;

}
