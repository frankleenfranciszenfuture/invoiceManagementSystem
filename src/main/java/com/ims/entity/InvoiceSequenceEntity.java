package com.ims.entity;



import com.ims.enums.InvoiceType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "invoice_sequences",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_invoice_branch_type",
                        columnNames = {
                                "branch_id",
                                "invoice_type"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InvoiceSequenceEntity extends BaseEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


//    //=====================================================
//    // BRANCH
//    //=====================================================
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(
//            name = "branch_id",
//            nullable = false
//    )
//    private BranchEntity branch;


    //=====================================================
    // INVOICE TYPE
    //=====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            name = "invoice_type",
            nullable = false,
            length = 30
    )
    private InvoiceType invoiceType;


    //=====================================================
    // CURRENT SEQUENCE
    //=====================================================

    @Column(
            name = "current_number",
            nullable = false
    )
    @Builder.Default
    private Long currentNumber = 0L;

}