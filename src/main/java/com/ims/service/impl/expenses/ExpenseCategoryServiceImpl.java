package com.ims.service.impl.expenses;

import com.ims.common.ApiResponse;
import com.ims.common.PageResponse;
import com.ims.common.audit.Auditable;
import com.ims.dtos.expenses.ExpenseCategoryRequestDTO;
import com.ims.dtos.expenses.ExpenseCategoryResponseDTO;
import com.ims.entity.ExpenseCategoryEntity;
import com.ims.enums.ExpenseCategoryStatus;
import com.ims.enums.ExpenseType;

import com.ims.enums.audit.AuditAction;
import com.ims.mapper.expenses.ExpenseCategoryMapper;
import com.ims.repository.ExpenseCategoryRepository;
import com.ims.repository.ExpenseRepository;

import com.ims.exception.BadRequestException;

import com.ims.service.serviceInterface.expenses.ExpenseCategoryService;
import com.ims.utils.specification.ExpenseCategorySpecification;
import com.ims.utils.validation.ExpenseCategoryValidation;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseCategoryServiceImpl implements ExpenseCategoryService {

    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final ExpenseRepository expenseRepository;

    private final ExpenseCategoryMapper expenseCategoryMapper;
    private final ExpenseCategoryValidation expenseCategoryValidation;

    // ---------------------------------------------------------
    // CREATE
    // ---------------------------------------------------------

    @Override
    @Auditable(
            action = AuditAction.CREATE,
            entity = "EXPENSE_CATEGORY",
            description = "Expense category created"
    )
    public ApiResponse<ExpenseCategoryResponseDTO> create(
            ExpenseCategoryRequestDTO dto
    ) {

        expenseCategoryValidation.validateCreate(dto);

        ExpenseCategoryEntity entity = expenseCategoryMapper.toEntity(dto);

        entity.setCategoryCode(generateCategoryCode());
        entity.setStatus(
                dto.getStatus() != null
                        ? dto.getStatus()
                        : ExpenseCategoryStatus.ACTIVE
        );

        entity.setActive(true);

        ExpenseCategoryEntity saved =
                expenseCategoryRepository.save(entity);

        return ApiResponse.success(
                expenseCategoryMapper.toResponseDTO(saved),
                "Expense category created successfully"
        );
    }

    // ---------------------------------------------------------
    // UPDATE
    // ---------------------------------------------------------

    @Override
    @Auditable(
            action = AuditAction.UPDATE,
            entity = "EXPENSE_CATEGORY",
            recordId = "#p0",
            description = "Expense category updated"
    )
    public ApiResponse<ExpenseCategoryResponseDTO> update(
            Long id,
            ExpenseCategoryRequestDTO dto
    ) {

        expenseCategoryValidation.validateUpdate(id, dto);

        ExpenseCategoryEntity entity = getCategory(id);

        expenseCategoryMapper.updateEntity(dto, entity);

        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }

        ExpenseCategoryEntity updated =
                expenseCategoryRepository.save(entity);

        return ApiResponse.success(
                expenseCategoryMapper.toResponseDTO(updated),
                "Expense category updated successfully"
        );
    }

    // ---------------------------------------------------------
    // GET BY ID
    // ---------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<ExpenseCategoryResponseDTO> getById(Long id) {

        ExpenseCategoryEntity entity = getCategory(id);

        return ApiResponse.success(
                expenseCategoryMapper.toResponseDTO(entity),
                "Expense category fetched successfully"
        );
    }

    // ---------------------------------------------------------
    // GET ALL
    // ---------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<ExpenseCategoryResponseDTO>> getAll(
            String search,
            ExpenseType expenseType,
            ExpenseCategoryStatus status,
            Pageable pageable
    ) {

        Specification<ExpenseCategoryEntity> specification =
                ExpenseCategorySpecification.search(
                        search,
                        expenseType,
                        status
                );

        Page<ExpenseCategoryEntity> page =
                expenseCategoryRepository.findAll(
                        specification,
                        pageable
                );

        PageResponse<ExpenseCategoryResponseDTO> pageResponse =
                PageResponse.<ExpenseCategoryResponseDTO>builder()
                        .content(
                                page.getContent()
                                        .stream()
                                        .map(expenseCategoryMapper::toResponseDTO)
                                        .toList()
                        )
                        .pageNumber(page.getNumber())
                        .pageSize(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .last(page.isLast())
                        .build();

        return ApiResponse.success(
                pageResponse,
                "Expense categories fetched successfully"
        );
    }

    // ---------------------------------------------------------
    // DELETE
    // ---------------------------------------------------------

    @Override
    @Auditable(
            action = AuditAction.DELETE,
            entity = "EXPENSE_CATEGORY",
            recordId = "#p0",
            description = "Expense category deleted"
    )
    public ApiResponse<Void> delete(Long id) {

        ExpenseCategoryEntity entity = getCategory(id);

        boolean categoryUsed =
                expenseRepository.existsByExpenseCategoryId(id);

        if (categoryUsed) {
            throw new BadRequestException(
                    "Cannot delete this category because it is already used in expenses"
            );
        }

        entity.setActive(false);

        expenseCategoryRepository.save(entity);

        return ApiResponse.success(
                null,
                "Expense category deleted successfully"
        );
    }

    // ---------------------------------------------------------
    // HELPER METHODS
    // ---------------------------------------------------------

    private ExpenseCategoryEntity getCategory(Long id) {

        return expenseCategoryRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new BadRequestException(
                                "Expense category not found with id: " + id
                        )
                );
    }

    private String generateCategoryCode() {

        return "EXPCAT-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
    }
}
