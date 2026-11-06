package com.ims.dtos.party.reports;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartyContactReportResponse {

    private Long id;

    private String partyCode;

    private String partyType;

    private String companyName;

    private String contactPerson;

    private String email;

    private String mobile;

    private String alternateMobile;

    private String gstNumber;

    private String panNumber;

    private String website;
}