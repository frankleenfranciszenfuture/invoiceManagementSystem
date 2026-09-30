package com.ims.controller.bankAccount;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.bankAccount.BankAccountCreateRequest;
import com.ims.dtos.bankAccount.BankAccountResponse;
import com.ims.dtos.bankAccount.BankAccountSearchRequest;
import com.ims.dtos.bankAccount.BankAccountUpdateRequest;
import com.ims.enums.BankAccountStatus;
import com.ims.enums.BankAccountType;
import com.ims.service.serviceInterface.bankAccount.BankAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bank-accounts")
@RequiredArgsConstructor
public class BankAccountController {

    private final BankAccountService bankAccountService;


    // =====================================================
    // CREATE
    // =====================================================

    @PostMapping
    public ResponseEntity<
            ApiResponse<BankAccountResponse>
            > createBankAccount(

            @Valid
            @RequestBody
            BankAccountCreateRequest request

    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        bankAccountService
                                .createBankAccount(
                                        request
                                )
                );
    }


    // =====================================================
    // GET BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<
            ApiResponse<BankAccountResponse>
            > getBankAccountById(

            @PathVariable
            Long id

    ) {

        return ResponseEntity.ok(
                bankAccountService
                        .getBankAccountById(id)
        );
    }


    // =====================================================
    // GET ALL
    // =====================================================

    @GetMapping
    public ResponseEntity<
            ApiResponse<
                    PageResponse<BankAccountResponse>
                    >
            > getAllBankAccounts(

            @RequestParam(
                    required = false,
                    defaultValue = ""
            )
            String search,

            @RequestParam(
                    required = false
            )
            BankAccountType accountType,

            @RequestParam(
                    required = false
            )
            String accountName,

            @RequestParam(
                    required = false
            )
            String accountCode,

            @RequestParam(
                    required = false
            )
            String currency,

            @RequestParam(
                    required = false
            )
            String accountNumber,

            @RequestParam(
                    required = false
            )
            String bankName,

            @RequestParam(
                    required = false
            )
            String ifsc,

            @RequestParam(
                    required = false
            )
            BankAccountStatus status,

            @RequestParam(
                    required = false
            )
            Boolean primaryAccount,

            @RequestParam(
                    required = false
            )
            Boolean active,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "10"
            )
            int size,

            @RequestParam(
                    defaultValue = "id"
            )
            String sortBy,

            @RequestParam(
                    defaultValue = "desc"
            )
            String sortDirection

    ) {

        BankAccountSearchRequest request =
                new BankAccountSearchRequest();


        request.setSearch(search);

        request.setAccountType(
                accountType
        );

        request.setAccountName(
                accountName
        );

        request.setAccountCode(
                accountCode
        );

        request.setCurrency(
                currency
        );

        request.setAccountNumber(
                accountNumber
        );

        request.setBankName(
                bankName
        );

        request.setIfsc(
                ifsc
        );

        request.setStatus(
                status
        );

        request.setPrimaryAccount(
                primaryAccount
        );

        request.setActive(
                active
        );


        Sort.Direction direction =
                sortDirection.equalsIgnoreCase("asc")
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;


        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                direction,
                                sortBy
                        )
                );


        return ResponseEntity.ok(
                bankAccountService
                        .getAllBankAccounts(
                                request,
                                pageable
                        )
        );
    }


    // =====================================================
    // UPDATE
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<
            ApiResponse<BankAccountResponse>
            > updateBankAccount(

            @PathVariable
            Long id,

            @Valid
            @RequestBody
            BankAccountUpdateRequest request

    ) {

        return ResponseEntity.ok(
                bankAccountService
                        .updateBankAccount(
                                id,
                                request
                        )
        );
    }


    // =====================================================
    // DELETE
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<
            ApiResponse<Void>
            > deleteBankAccount(

            @PathVariable
            Long id

    ) {

        return ResponseEntity.ok(
                bankAccountService
                        .deleteBankAccount(id)
        );
    }
}

