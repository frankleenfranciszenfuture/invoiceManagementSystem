package com.ims.entity;



import com.ims.enums.PartyType;
import com.ims.enums.SalesPersonType;
import com.ims.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_persons")
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class SalesPersonEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =====================================================
    // PARTY CODE
    // =====================================================

    @Column(
            name = "salesPerson_code",
            nullable = false,
            length = 30
    )
    private String salesPersonCode;


    // =====================================================
    // PARTY TYPE
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "salesPerson_type",
            nullable = false,
            length = 30
    )
    private SalesPersonType salesPersonType;

    private String salesPersonName;

    private String email;

    private String mobile;

    // =====================================================
    // STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;


    @OneToMany(mappedBy = "salesPerson")
    private List<InvoiceEntity> invoices = new ArrayList<>();


    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    public void prePersist() {

        if (status == null) {
            status = Status.ACTIVE;
        }
    }

}
