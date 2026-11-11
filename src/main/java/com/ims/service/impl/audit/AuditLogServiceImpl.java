package com.ims.service.impl.audit;



import com.ims.common.PageResponse;
import com.ims.common.PageUtil;
import org.springframework.transaction.annotation.Propagation;

import com.ims.dtos.audit.AuditLogCreateRequest;
import com.ims.dtos.audit.AuditLogResponse;
import com.ims.dtos.audit.AuditLogSearchRequest;

import com.ims.entity.AuditLogEntity;

import com.ims.exception.ResourceNotFoundException;

import com.ims.mapper.audit.AuditLogMapper;


import com.ims.repository.audit.AuditLogRepository;
import com.ims.service.serviceInterface.audit.AuditLogService;
import jakarta.persistence.criteria.Predicate;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    private final AuditLogMapper auditLogMapper;

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of(
                    "id",
                    "createdAt",
                    "entityName",
                    "action",
                    "performedBy"
            );

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createAuditLog(AuditLogCreateRequest request) {

        AuditLogEntity entity = AuditLogEntity.builder()
                .entityName(request.getEntityName())
                .entityId(request.getEntityId())
                .action(request.getAction())
                .description(request.getDescription())
                .oldValue(request.getOldValue())
                .newValue(request.getNewValue())
                .performedBy(request.getPerformedBy())
                .performedByName(request.getPerformedByName())
                .performedByType(request.getPerformedByType())
                .ipAddress(request.getIpAddress())
                .moduleName(request.getModuleName())
                .build();

        auditLogRepository.saveAndFlush(entity);
    }

    @Override
    public PageResponse<AuditLogResponse> getAllAuditLogs(
            AuditLogSearchRequest request) {

        int page = Math.max(
                request.getPage() == null ? 0 : request.getPage(),
                0
        );

        int size = Math.max(
                request.getSize() == null ? 10 : request.getSize(),
                1
        );

        size = Math.min(size, 100);

        String sortBy = ALLOWED_SORT_FIELDS.contains(
                request.getSortBy()
        ) ? request.getSortBy() : "createdAt";

        Sort.Direction direction =
                "ASC".equalsIgnoreCase(request.getSortDirection())
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(direction, sortBy)
        );

        Specification<AuditLogEntity> specification =
                buildSpecification(request);

        Page<AuditLogResponse> result =
                auditLogRepository.findAll(
                        specification,
                        pageable
                ).map(auditLogMapper::toResponse);

        return PageUtil.convert(result);
    }

    private Specification<AuditLogEntity> buildSpecification(
            AuditLogSearchRequest request) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (request.getEntityName() != null
                    && !request.getEntityName().isBlank()) {

                predicates.add(
                        cb.equal(
                                cb.upper(root.get("entityName")),
                                request.getEntityName().trim().toUpperCase()
                        )
                );
            }

            if (request.getEntityId() != null
                    && !request.getEntityId().isBlank()) {

                predicates.add(
                        cb.equal(
                                root.get("entityId"),
                                request.getEntityId()
                        )
                );
            }

            if (request.getAction() != null) {

                predicates.add(
                        cb.equal(
                                root.get("action"),
                                request.getAction()
                        )
                );
            }

            if (request.getPerformedBy() != null) {

                predicates.add(
                        cb.equal(
                                root.get("performedBy"),
                                request.getPerformedBy()
                        )
                );
            }

            if (request.getPerformedByType() != null
                    && !request.getPerformedByType().isBlank()) {

                predicates.add(
                        cb.equal(
                                cb.upper(root.get("performedByType")),
                                request.getPerformedByType().trim().toUpperCase()
                        )
                );
            }

            if (request.getFromDate() != null) {

                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("createdAt"),
                                request.getFromDate()
                        )
                );
            }

            if (request.getToDate() != null) {

                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("createdAt"),
                                request.getToDate()
                        )
                );
            }

            if (request.getKeyword() != null
                    && !request.getKeyword().isBlank()) {

                String keyword =
                        "%" + request.getKeyword().trim().toLowerCase() + "%";

                predicates.add(
                        cb.or(
                                cb.like(
                                        cb.lower(root.get("description")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("entityName")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("performedByName")),
                                        keyword
                                ),
                                cb.like(
                                        cb.lower(root.get("entityId")),
                                        keyword
                                )
                        )
                );
            }

            return cb.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }

    @Override
    public AuditLogResponse getAuditLogById(Long id) {

        AuditLogEntity entity =
                auditLogRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Audit log not found."
                                )
                        );

        return auditLogMapper.toResponse(entity);
    }

    @Override
    public PageResponse<AuditLogResponse> getEntityHistory(
            String entityName,
            String entityId,
            Integer page,
            Integer size) {

        AuditLogSearchRequest request =
                AuditLogSearchRequest.builder()
                        .entityName(entityName)
                        .entityId(entityId)
                        .page(page)
                        .size(size)
                        .sortBy("createdAt")
                        .sortDirection("DESC")
                        .build();

        return getAllAuditLogs(request);
    }
}

