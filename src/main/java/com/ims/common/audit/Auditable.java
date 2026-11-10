package com.ims.common.audit;

import com.ims.enums.audit.AuditAction;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Auditable {

    AuditAction action();

    String entity();

    String recordId() default "";

    String description() default "";
}