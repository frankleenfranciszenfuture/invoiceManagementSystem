package com.ims.service.serviceInterface.cashAccount;


import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.cashAccount.CashAccountRequestDTO;
import com.ims.dtos.cashAccount.CashAccountResponseDTO;
import org.springframework.data.domain.Pageable;

public interface CashAccountService {

    ApiResponse<CashAccountResponseDTO> create(
            CashAccountRequestDTO request
    );

    ApiResponse<CashAccountResponseDTO> getById(Long id);

    ApiResponse<PageResponse<CashAccountResponseDTO>> getAll(
            String search,
            String status,
            Pageable pageable
    );

    ApiResponse<CashAccountResponseDTO> update(
            Long id,
            CashAccountRequestDTO request
    );

    ApiResponse<Void> delete(Long id);
}
