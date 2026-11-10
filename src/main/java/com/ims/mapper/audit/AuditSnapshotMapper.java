package com.ims.mapper.audit;


public interface AuditSnapshotMapper {

    boolean supports(String entityName);

    Object toSnapshot(Object entity);
}
