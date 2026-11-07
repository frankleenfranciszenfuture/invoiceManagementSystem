package com.ims.dtos.dashbaord;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerGrowthResponse {

    private String month;

    private Integer year;

    private Long customers;
}

