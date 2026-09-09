package com.ims.entity;

import com.ims.enums.Status;
import com.ims.enums.TaxType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tax_master")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TaxMasterEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String taxName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaxType taxType;

    // Total GST rate
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRate;

    // CGST rate
    @Column(precision = 5, scale = 2)
    private BigDecimal cgstRate;

    // SGST rate
    @Column(precision = 5, scale = 2)
    private BigDecimal sgstRate;

    // IGST rate
    @Column(precision = 5, scale = 2)
    private BigDecimal igstRate;

    private String description;

    @Column(nullable = false)
    private Boolean active = true;

    private Status status;

}