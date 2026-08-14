package com.ims.common;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

@Component
public class SpringContext implements ApplicationContextAware {

    private static ApplicationContext context;

    public static <T> T getBean(Class<T> clazz) {

        if (context == null) {
            return null;
        }

        try {
            return context.getBean(clazz);
        } catch (BeansException ex) {
            return null;
        }
    }

    public static boolean isInitialized() {
        return context != null;
    }

    @Override
    public void setApplicationContext(@NonNull ApplicationContext applicationContext)
            throws BeansException {
        SpringContext.context = applicationContext;
    }
}
