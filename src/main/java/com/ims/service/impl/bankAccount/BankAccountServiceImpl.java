package com.ims.service.impl.bankAccount;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.bankAccount.BankAccountCreateRequest;
import com.ims.dtos.bankAccount.BankAccountResponse;
import com.ims.dtos.bankAccount.BankAccountSearchRequest;
import com.ims.dtos.bankAccount.BankAccountUpdateRequest;
import com.ims.entity.BankAccount;
import com.ims.mapper.bankAccount.BankAccountMapper;
import com.ims.repository.BankAccountRepository;
import com.ims.service.serviceInterface.bankAccount.BankAccountService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.BankAccountSpecification;
import com.ims.utils.validation.BankAccountValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class BankAccountServiceImpl
        implements BankAccountService {

    private final BankAccountRepository bankAccountRepository;

    private final BankAccountMapper bankAccountMapper;

    private final BankAccountValidation bankAccountValidation;

    private final BaseEntityUtil baseEntityUtil;


    // =====================================================
    // CREATE BANK ACCOUNT
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<BankAccountResponse> createBankAccount(
            BankAccountCreateRequest request
    ) {

        log.info(
                "Creating Bank Account : {}",
                request.getAccountName()
        );

        // =================================================
        // 1. VALIDATE REQUEST
        // =================================================

        bankAccountValidation.validateCreate(
                request
        );

        // =================================================
        // 2. CREATE ENTITY
        // =================================================

        BankAccount bankAccount =
                new BankAccount();

        // =================================================
        // 3. ACCOUNT DETAILS
        // =================================================

        bankAccount.setAccountType(
                request.getAccountType()
        );

        bankAccount.setAccountName(
                request.getAccountName()
        );

        bankAccount.setAccountCode(
                request.getAccountCode()
        );

        bankAccount.setCurrency(
                request.getCurrency()
        );

        bankAccount.setAccountNumber(
                request.getAccountNumber()
        );

        // =================================================
        // 4. BANK DETAILS
        // =================================================

        bankAccount.setBankName(
                request.getBankName()
        );

        bankAccount.setIfsc(
                request.getIfsc()
        );

        // =================================================
        // 5. USERS
        // =================================================

        bankAccount.setUserIds(
                request.getUserIds()
        );

        // =================================================
        // 6. DESCRIPTION
        // =================================================

        bankAccount.setDescription(
                request.getDescription()
        );

        // =================================================
        // 7. PRIMARY ACCOUNT
        // =================================================

        bankAccount.setPrimaryAccount(
                request.getPrimaryAccount()
        );

        // =================================================
        // 8. STATUS
        // =================================================

        bankAccount.setStatus(
                request.getStatus()
        );

        bankAccount.setActive(
                true
        );

        // =================================================
        // 9. AUDIT
        // =================================================

        baseEntityUtil.prepareForCreate(
                bankAccount
        );

        // =================================================
        // 10. SAVE
        // =================================================

        BankAccount savedBankAccount =
                bankAccountRepository.save(
                        bankAccount
                );

        // =================================================
        // 11. RESPONSE
        // =================================================

        BankAccountResponse response =
                bankAccountMapper.toResponse(
                        savedBankAccount
                );

        return ApiResponse.success(
                response,
                "Bank account created successfully."
        );
    }


    // =====================================================
    // GET BANK ACCOUNT BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<BankAccountResponse> getBankAccountById(
            Long id
    ) {

        BankAccount bankAccount =
                bankAccountRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Bank account not found."
                                )
                        );

        if (!Boolean.TRUE.equals(
                bankAccount.getActive()
        )) {

            throw new RuntimeException(
                    "Bank account is inactive."
            );
        }

        return ApiResponse.success(
                mapBankAccountResponse(
                        bankAccount
                ),
                "Bank account fetched successfully."
        );
    }


    // =====================================================
    // GET ALL BANK ACCOUNTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<
            PageResponse<BankAccountResponse>
            > getAllBankAccounts(
            BankAccountSearchRequest request,
            Pageable pageable
    ) {

        Specification<BankAccount> specification =
                BankAccountSpecification.filter(
                        request
                );

        Page<BankAccount> bankAccounts =
                bankAccountRepository.findAll(
                        specification,
                        pageable
                );

        return ApiResponse.success(
                toPageResponse(
                        bankAccounts
                ),
                "Bank accounts fetched successfully."
        );
    }


    // =====================================================
    // UPDATE BANK ACCOUNT
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<BankAccountResponse> updateBankAccount(
            Long id,
            BankAccountUpdateRequest request
    ) {

        log.info(
                "Updating Bank Account : {}",
                id
        );

        // =================================================
        // 1. VALIDATE BANK ACCOUNT
        // =================================================

        BankAccount bankAccount =
                bankAccountRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Bank account not found."
                                )
                        );

        if (!Boolean.TRUE.equals(
                bankAccount.getActive()
        )) {

            throw new RuntimeException(
                    "Bank account is inactive."
            );
        }

        // =================================================
        // 2. VALIDATE REQUEST
        // =================================================

        bankAccountValidation.validateUpdate(
                id,
                request
        );

        // =================================================
        // 3. ACCOUNT DETAILS
        // =================================================

        if (request.getAccountType() != null) {

            bankAccount.setAccountType(
                    request.getAccountType()
            );
        }

        if (request.getAccountName() != null) {

            bankAccount.setAccountName(
                    request.getAccountName()
            );
        }

        if (request.getAccountCode() != null) {

            bankAccount.setAccountCode(
                    request.getAccountCode()
            );
        }

        if (request.getCurrency() != null) {

            bankAccount.setCurrency(
                    request.getCurrency()
            );
        }

        if (request.getAccountNumber() != null) {

            bankAccount.setAccountNumber(
                    request.getAccountNumber()
            );
        }

        // =================================================
        // 4. BANK DETAILS
        // =================================================

        if (request.getBankName() != null) {

            bankAccount.setBankName(
                    request.getBankName()
            );
        }

        if (request.getIfsc() != null) {

            bankAccount.setIfsc(
                    request.getIfsc()
            );
        }

        // =================================================
        // 5. USERS
        // =================================================

        if (request.getUserIds() != null) {

            bankAccount.setUserIds(
                    request.getUserIds()
            );
        }

        // =================================================
        // 6. DESCRIPTION
        // =================================================

        if (request.getDescription() != null) {

            bankAccount.setDescription(
                    request.getDescription()
            );
        }

        // =================================================
        // 7. PRIMARY ACCOUNT
        // =================================================

        if (request.getPrimaryAccount() != null) {

            bankAccount.setPrimaryAccount(
                    request.getPrimaryAccount()
            );
        }

        // =================================================
        // 8. STATUS
        // =================================================

        if (request.getStatus() != null) {

            bankAccount.setStatus(
                    request.getStatus()
            );
        }

        // =================================================
        // 9. ACTIVE
        // =================================================

        if (request.getActive() != null) {

            bankAccount.setActive(
                    request.getActive()
            );
        }

        // =================================================
        // 10. AUDIT
        // =================================================

        baseEntityUtil.prepareForUpdate(
                bankAccount
        );

        // =================================================
        // 11. SAVE
        // =================================================

        BankAccount updatedBankAccount =
                bankAccountRepository.save(
                        bankAccount
                );

        // =================================================
        // 12. RESPONSE
        // =================================================

        BankAccountResponse response =
                mapBankAccountResponse(
                        updatedBankAccount
                );

        return ApiResponse.success(
                response,
                "Bank account updated successfully."
        );
    }


    // =====================================================
    // DELETE BANK ACCOUNT
    // =====================================================

    @Override
    @Transactional
    public ApiResponse<Void> deleteBankAccount(
            Long id
    ) {

        log.info(
                "Deleting Bank Account : {}",
                id
        );

        BankAccount bankAccount =
                bankAccountRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Bank account not found."
                                )
                        );

        // =================================================
        // SOFT DELETE
        // =================================================

        bankAccount.setActive(
                false
        );

        // =================================================
        // REMOVE PRIMARY FLAG
        // =================================================

        bankAccount.setPrimaryAccount(
                false
        );

        // =================================================
        // AUDIT
        // =================================================

        baseEntityUtil.prepareForUpdate(
                bankAccount
        );

        // =================================================
        // SAVE
        // =================================================

        bankAccountRepository.save(
                bankAccount
        );

        return ApiResponse.success(
                null,
                "Bank account deleted successfully."
        );
    }


    // =====================================================
    // MAP RESPONSE
    // =====================================================

    private BankAccountResponse mapBankAccountResponse(
            BankAccount bankAccount
    ) {

        return bankAccountMapper.toResponse(
                bankAccount
        );
    }


    // =====================================================
    // PAGE RESPONSE
    // =====================================================

    private PageResponse<BankAccountResponse> toPageResponse(
            Page<BankAccount> page
    ) {

        return PageResponse
                .<BankAccountResponse>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(
                                        this::mapBankAccountResponse
                                )
                                .toList()
                )
                .pageNumber(
                        page.getNumber()
                )
                .pageSize(
                        page.getSize()
                )
                .totalElements(
                        page.getTotalElements()
                )
                .totalPages(
                        page.getTotalPages()
                )
                .last(
                        page.isLast()
                )
                .build();
    }
}
