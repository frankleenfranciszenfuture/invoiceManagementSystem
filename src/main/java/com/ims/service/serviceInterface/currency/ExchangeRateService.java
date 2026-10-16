package com.ims.service.serviceInterface.currency;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.exchange.ExchangeRateRequestDTO;
import com.ims.dtos.exchange.ExchangeRateResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface ExchangeRateService {

    ApiResponse<ExchangeRateResponseDTO> create(ExchangeRateRequestDTO dto);

    ApiResponse<ExchangeRateResponseDTO> update(
            Long id,
            ExchangeRateRequestDTO dto
    );

    ApiResponse<ExchangeRateResponseDTO> getById(Long id);

    ApiResponse<PageResponse<ExchangeRateResponseDTO>> getAll(
            String fromCurrencyCode,
            String toCurrencyCode,
            LocalDate fromDate,
            LocalDate toDate,
            Boolean active,
            Pageable pageable
    );

    ApiResponse<ExchangeRateResponseDTO> getRate(
            Long fromCurrencyId,
            Long toCurrencyId,
            LocalDate date);

    ApiResponse<Void> delete(Long id);
}
