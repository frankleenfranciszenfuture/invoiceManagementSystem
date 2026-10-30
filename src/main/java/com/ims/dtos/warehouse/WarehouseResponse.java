package com.ims.dtos.warehouse;


import com.ims.dtos.common.AuditResponse;
import com.ims.dtos.common.BaseResponse;
import com.ims.enums.Status;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
public class WarehouseResponse extends BaseResponse {

    private Long id;

//    private Long branchId;
//    private String branchName;

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

    private AuditResponse audit;
}
