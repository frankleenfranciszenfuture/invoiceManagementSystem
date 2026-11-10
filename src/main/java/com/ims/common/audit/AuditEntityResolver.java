package com.ims.common.audit;


public interface AuditEntityResolver {

    Object findEntity(
            String entityName,
            String entityId
    );
}

