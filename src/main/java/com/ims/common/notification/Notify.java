
package com.ims.common.notification;

import com.ims.enums.notification.NotificationAction;
import com.ims.enums.notification.NotificationModule;
import com.ims.enums.notification.NotificationPriority;
import com.ims.enums.notification.NotificationType;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Notify {

    NotificationModule module();

    NotificationAction action();

    String title();

    String message();

    String entityName();

    String entityId();

    String actionUrl() default "";

    NotificationType notificationType()
            default NotificationType.INFO;

    NotificationPriority priority()
            default NotificationPriority.NORMAL;

    // SpEL expression returning a user ID, collection of IDs, or array.
    String recipientUserIds() default "";

    // Permission lookup configuration.
    String permissionModule() default "";

    String permissionAction() default "VIEW";
}
