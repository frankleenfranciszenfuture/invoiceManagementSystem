package com.ims.repository.audit;


import com.ims.entity.AuditLogEntity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository
        extends JpaRepository<AuditLogEntity, Long>,
        JpaSpecificationExecutor<AuditLogEntity> {

    List<AuditLogEntity>
    findByEntityNameAndEntityIdOrderByCreatedAtDesc(
            String entityName,
            String entityId
    );
}
