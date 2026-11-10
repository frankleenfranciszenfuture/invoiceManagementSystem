package com.ims.common.audit;


public interface AuditSnapshotMapper {

    boolean supports(String entityName);

    Object toSnapshot(Object entity);
}

