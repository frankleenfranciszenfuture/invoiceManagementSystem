package com.ims.service.serviceInterface.units;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.units.UnitRequest;
import com.ims.dtos.units.UnitResponse;
import com.ims.enums.Status;
import org.springframework.data.domain.Pageable;

public interface UnitService {


    ApiResponse<UnitResponse> create(
            UnitRequest request
    );


    ApiResponse<UnitResponse> update(
            Long id,
            UnitRequest request
    );


    ApiResponse<UnitResponse> getById(
            Long id
    );


    ApiResponse<PageResponse<UnitResponse>> getAll(
            String search,
            Status status,
            Pageable pageable);


    ApiResponse<Void> delete(
            Long id
    );

}