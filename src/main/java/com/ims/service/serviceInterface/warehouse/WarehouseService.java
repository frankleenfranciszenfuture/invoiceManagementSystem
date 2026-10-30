package com.ims.service.serviceInterface.warehouse;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.warehouse.WarehouseRequest;
import com.ims.dtos.warehouse.WarehouseResponse;
import com.ims.enums.Status;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WarehouseService {

    ApiResponse<WarehouseResponse> create(WarehouseRequest dto);

    ApiResponse<WarehouseResponse> update(
            Long id,
            WarehouseRequest dto
    );

    ApiResponse<WarehouseResponse> getById(
            Long id
    );

    ApiResponse<PageResponse<WarehouseResponse>> getAll(
            String search,
            Status status,
            Boolean active,
            Pageable pageable) ;

//    ApiResponse<List<WarehouseResponse>> getWarehouseByStatus(
//            Status status
//    );

    ApiResponse<Void> delete(
            Long id
    );
}