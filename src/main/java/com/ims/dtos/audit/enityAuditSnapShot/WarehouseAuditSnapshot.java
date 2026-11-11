package com.ims.dtos.audit.enityAuditSnapShot;



import com.ims.enums.Status;
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
public class WarehouseAuditSnapshot {

    private Long id;

    private String warehouseCode;

    private String warehouseName;

    private String contactPerson;

    private String phone;

    private String email;

    private String address;

    private String city;

    private String state;

    private String pincode;

    private Status status;

    private Boolean active;
}
