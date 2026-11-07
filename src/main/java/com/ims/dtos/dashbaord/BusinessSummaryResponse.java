package com.ims.dtos.dashbaord;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BusinessSummaryResponse {

    private Long totalCustomers;

    private Long totalParties;

    private Long totalInvoices;

    private Long totalProducts;

    private Long totalWarehouses;

    private Long totalPendingApprovals;
}

