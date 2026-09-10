package com.ims.service.impl.party;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.dtos.party.PartyBankAccountRequest;
import com.ims.dtos.party.PartyRequest;
import com.ims.dtos.party.PartyResponse;
import com.ims.entity.PartyAddressEntity;
import com.ims.entity.PartyBankAccountEntity;
import com.ims.entity.PartyEntity;
import com.ims.enums.PartyType;
import com.ims.enums.Status;
import com.ims.exception.DuplicateResourceException;
import com.ims.mapper.party.PartyBankAccountMapper;
import com.ims.mapper.party.PartyMapper;
import com.ims.repository.PartyRepository;
import com.ims.service.serviceInterface.party.PartyService;
import com.ims.utils.base.BaseEntityUtil;
import com.ims.utils.specification.PartySpecification;
import com.ims.utils.validation.PartyValidation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class PartyServiceImpl implements PartyService {

    private final PartyRepository partyRepository;

    private final PartyMapper partyMapper;

    private final PartyValidation partyValidation;

    private final BaseEntityUtil baseEntityUtil;

    private final PartyBankAccountMapper partyBankAccountMapper;


    //=====================================================
    // CREATE PARTY
    //=====================================================

    @Override
    public ApiResponse<PartyResponse> createParty(
            PartyRequest request) {

        // Validate request and duplicate fields
        partyValidation.validateCreate(
                request
        );


        PartyEntity party =
                partyMapper.toEntity(
                        request
                );


        party.setContactPerson(
                emptyToNull(
                        request.getContactPerson()
                )
        );

        party.setAlternateMobile(
                emptyToNull(
                        request.getAlternateMobile()
                )
        );

        party.setGstNumber(
                emptyToNull(
                        request.getGstNumber()
                )
        );

        party.setPanNumber(
                emptyToNull(
                        request.getPanNumber()
                )
        );

        party.setWebsite(
                emptyToNull(
                        request.getWebsite()
                )
        );

        party.setPaymentTerms(
                emptyToNull(
                        request.getPaymentTerms()
                )
        );


        //=================================================
        // PARTY CODE
        //=================================================

        if (request.getPartyCode() == null ||
                request.getPartyCode().isBlank()) {

            party.setPartyCode(
                    generatePartyNumber(
                            request.getPartyType()
                    )
            );

        } else {

            party.setPartyCode(
                    request.getPartyCode().trim()
            );
        }


        //=================================================
        // STATUS
        //=================================================

        if (request.getStatus() != null) {

            party.setStatus(
                    request.getStatus()
            );

        } else {

            party.setStatus(
                    Status.ACTIVE
            );
        }


        //=================================================
        // ADDRESSES
        //=================================================

        mapAddresses(
                party,
                request
        );


        //=================================================
        // BANK ACCOUNTS
        //=================================================

        mapBankAccounts(
                party,
                request
        );


        handlePrimaryBankAccount(
                party
        );


        //=================================================
        // AUDIT
        //=================================================

        baseEntityUtil.prepareForCreate(
                party
        );


        PartyEntity saved =
                partyRepository.save(
                        party
                );


        return ApiResponse.success(
                partyMapper.toResponse(
                        saved
                ),
                "Party created successfully."
        );
    }


    //=====================================================
    // UPDATE PARTY
    //=====================================================

    @Override
    public ApiResponse<PartyResponse> updateParty(
            Long id,
            PartyRequest request) {


        //=================================================
        // VALIDATION
        //=================================================

        partyValidation.validateUpdate(
                id,
                request
        );


        PartyEntity party =
                partyValidation.validateParty(
                        id
                );


        //=================================================
        // UPDATE PARTY DETAILS
        //=================================================

        partyMapper.updateEntity(
                request,
                party
        );


        party.setContactPerson(
                emptyToNull(
                        request.getContactPerson()
                )
        );

        party.setAlternateMobile(
                emptyToNull(
                        request.getAlternateMobile()
                )
        );

        party.setGstNumber(
                emptyToNull(
                        request.getGstNumber()
                )
        );

        party.setPanNumber(
                emptyToNull(
                        request.getPanNumber()
                )
        );

        party.setWebsite(
                emptyToNull(
                        request.getWebsite()
                )
        );

        party.setPaymentTerms(
                emptyToNull(
                        request.getPaymentTerms()
                )
        );


        //=================================================
        // ADDRESSES
        //=================================================

        mapAddresses(
                party,
                request
        );


        //=================================================
        // BANK ACCOUNTS
        //=================================================

        mapBankAccounts(
                party,
                request
        );


        handlePrimaryBankAccount(
                party
        );


        //=================================================
        // AUDIT
        //=================================================

        baseEntityUtil.prepareForUpdate(
                party
        );


        PartyEntity saved =
                partyRepository.save(
                        party
                );


        return ApiResponse.success(
                partyMapper.toResponse(
                        saved
                ),
                "Party updated successfully."
        );
    }


    //=====================================================
    // GET BY ID
    //=====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PartyResponse> getPartyById(
            Long id) {


        PartyEntity party =
                partyValidation.validateParty(
                        id
                );


        return ApiResponse.success(
                partyMapper.toResponse(
                        party
                ),
                "Party fetched successfully."
        );
    }


    //=====================================================
    // GET ALL
    //=====================================================

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<PartyResponse>> getAllParties(
            String search,
            PartyType partyType,
            Status status,
            Pageable pageable) {


        //=================================================
        // BUILD SPECIFICATION
        //=================================================

        Specification<PartyEntity> specification =
                PartySpecification.isActive()
                        .and(
                                PartySpecification.search(
                                        search
                                )
                        )
                        .and(
                                PartySpecification.hasPartyType(
                                        partyType
                                )
                        )
                        .and(
                                PartySpecification.hasStatus(
                                        status
                                )
                        );


        //=================================================
        // FETCH
        //=================================================

        Page<PartyEntity> parties =
                partyRepository.findAll(
                        specification,
                        pageable
                );


        return ApiResponse.success(
                toPageResponse(
                        parties
                ),
                "Parties fetched successfully."
        );
    }


    //=====================================================
    // DELETE PARTY
    //=====================================================

    @Override
    @Transactional
    public ApiResponse<Void> deleteParty(
            Long id) {


        PartyEntity party =
                partyValidation.validateParty(
                        id
                );


        //=================================================
        // SOFT DELETE
        //=================================================

        party.setActive(
                false
        );


        baseEntityUtil.prepareForUpdate(
                party
        );


        partyRepository.save(
                party
        );


        return ApiResponse.success(
                null,
                "Party deleted successfully."
        );
    }


    //=====================================================
    // PARTY NUMBER GENERATION
    //=====================================================

    @Override
    public String generatePartyNumber(
            PartyType partyType) {


        String prefix =
                switch (partyType) {

                    case SUPPLIER -> "SUP";

                    case CUSTOMER -> "CUS";

                    case BOTH -> "BTH";

                    case MANUFACTURER -> "MFG";

                    case TRANSPORTER -> "TRN";

                    case BROKER -> "BRK";
                };


        String codePrefix =
                prefix
                        + "-"
                        + LocalDate.now().getYear()
                        + "-";


        Optional<PartyEntity> latest =
                partyRepository
                        .findTopByPartyCodeStartingWithOrderByIdDesc(
                                codePrefix
                        );


        int nextNumber = 1;


        if (latest.isPresent()) {

            String lastPartyCode =
                    latest.get()
                            .getPartyCode();


            String sequence =
                    lastPartyCode.substring(
                            codePrefix.length()
                    );


            nextNumber =
                    Integer.parseInt(
                            sequence
                    ) + 1;
        }


        return codePrefix
                + String.format(
                "%06d",
                nextNumber
        );
    }


    //=====================================================
    // ADDRESS MAPPING
    //=====================================================

    private void mapAddresses(
            PartyEntity party,
            PartyRequest request) {


        party.getAddresses()
                .clear();


        if (request.getAddresses() == null) {
            return;
        }


        List<PartyAddressEntity> addresses =
                partyMapper.toAddressEntityList(
                        request.getAddresses()
                );


        addresses.forEach(address -> {

            address.setParty(
                    party
            );


            baseEntityUtil.prepareForCreate(
                    address
            );


            party.getAddresses()
                    .add(address);
        });
    }


    //=====================================================
    // BANK ACCOUNT MAPPING
    //=====================================================

    private void mapBankAccounts(
            PartyEntity party,
            PartyRequest request) {


        //=================================================
        // REMOVE EXISTING ACCOUNTS
        //=================================================

        party.getBankAccounts()
                .clear();


        if (request.getBankAccounts() == null ||
                request.getBankAccounts().isEmpty()) {

            return;
        }


        //=================================================
        // CHECK DUPLICATE ACCOUNT NUMBERS
        //=================================================

        Set<String> accountNumbers =
                new HashSet<>();


        for (PartyBankAccountRequest account :
                request.getBankAccounts()) {


            if (account.getAccountNumber() != null &&
                    !account.getAccountNumber().isBlank()) {


                String accountNumber =
                        account.getAccountNumber()
                                .trim();


                if (!accountNumbers.add(
                        accountNumber
                )) {

                    throw new DuplicateResourceException(
                            "Duplicate bank account number in request: "
                                    + accountNumber
                    );
                }
            }
        }


        //=================================================
        // MAP ACCOUNTS
        //=================================================

        List<PartyBankAccountEntity> accounts =
                partyBankAccountMapper.toEntityList(
                        request.getBankAccounts()
                );


        //=================================================
        // ONLY ONE PRIMARY ACCOUNT
        //=================================================

        long primaryCount =
                accounts.stream()
                        .filter(account ->
                                Boolean.TRUE.equals(
                                        account.getPrimaryAccount()
                                )
                        )
                        .count();


        if (primaryCount > 1) {

            throw new DuplicateResourceException(
                    "Only one primary bank account allowed"
            );
        }


        //=================================================
        // SET ACCOUNT DETAILS
        //=================================================

        accounts.forEach(account -> {

            account.setParty(
                    party
            );


            account.setStatus(
                    Status.ACTIVE
            );


            baseEntityUtil.prepareForCreate(
                    account
            );


            party.getBankAccounts()
                    .add(account);
        });
    }


    //=====================================================
    // PRIMARY BANK ACCOUNT
    //=====================================================

    private void handlePrimaryBankAccount(
            PartyEntity party) {


        if (party.getBankAccounts()
                .isEmpty()) {

            return;
        }


        boolean exists =
                party.getBankAccounts()
                        .stream()
                        .anyMatch(
                                PartyBankAccountEntity
                                        ::getPrimaryAccount
                        );


        if (!exists) {

            party.getBankAccounts()
                    .get(0)
                    .setPrimaryAccount(
                            true
                    );
        }
    }


    //=====================================================
    // EMPTY STRING -> NULL
    //=====================================================

    private String emptyToNull(
            String value) {

        return value == null ||
                value.isBlank()
                ? null
                : value.trim();
    }


    //=====================================================
    // PAGE RESPONSE
    //=====================================================

    private PageResponse<PartyResponse> toPageResponse(
            Page<PartyEntity> page) {


        return PageResponse
                .<PartyResponse>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(
                                        partyMapper::toResponse
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