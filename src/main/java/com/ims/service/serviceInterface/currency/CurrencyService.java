package com.ims.service.serviceInterface.currency;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.currency.CurrencyRequestDTO;
import com.ims.dtos.currency.CurrencyResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CurrencyService {

    ApiResponse<CurrencyResponseDTO> create(CurrencyRequestDTO dto);

    ApiResponse<CurrencyResponseDTO> update(Long id, CurrencyRequestDTO dto);

    ApiResponse<CurrencyResponseDTO> getById(Long id);

    ApiResponse<PageResponse<CurrencyResponseDTO>>   getAll(
            String search,
            Boolean active,
            Pageable pageable
    );

    ApiResponse<Void> delete(Long id);
}
