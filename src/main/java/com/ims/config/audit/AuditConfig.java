package com.ims.config.audit;


import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.core.Ordered;

@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true)
@EnableTransactionManagement(
        order = Ordered.LOWEST_PRECEDENCE - 10
)
public class AuditConfig {
}
