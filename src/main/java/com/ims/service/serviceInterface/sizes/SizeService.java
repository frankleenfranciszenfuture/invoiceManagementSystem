package com.ims.service.serviceInterface.sizes;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.sizes.SizeRequest;
import com.ims.dtos.sizes.SizeResponse;
import com.ims.enums.Status;
import org.springframework.data.domain.Pageable;

public interface SizeService {

    ApiResponse<SizeResponse> create(
            SizeRequest request
    );

    ApiResponse<SizeResponse> update(
            Long id,
            SizeRequest request
    );

    ApiResponse<SizeResponse> getById(
            Long id
    );

    ApiResponse<PageResponse<SizeResponse>> getAll(
            String search,
            Status status,
            Pageable pageable);

    ApiResponse<Void> delete(
            Long id
    );

}