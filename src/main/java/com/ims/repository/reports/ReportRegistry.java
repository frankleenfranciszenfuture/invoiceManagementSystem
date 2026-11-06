package com.ims.repository.reports;


import com.ims.dtos.reports.ReportDataProvider;
import com.ims.enums.reports.ReportModule;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
@Getter
public class ReportRegistry {

    private final Map<ReportModule, ReportDataProvider> providers =
            new EnumMap<>(ReportModule.class);

    public ReportRegistry(List<ReportDataProvider> providerList) {

        for (ReportDataProvider provider : providerList) {

            ReportDataProvider existing =
                    providers.put(
                            provider.getModule(),
                            provider
                    );

            if (existing != null) {
                throw new IllegalStateException(
                        "Duplicate report provider for module: "
                                + provider.getModule()
                );
            }
        }
    }

    public ReportDataProvider getProvider(ReportModule module) {

        ReportDataProvider provider = providers.get(module);

        if (provider == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Reports are not configured for module: " + module
            );
        }

        return provider;
    }

    public boolean hasProvider(ReportModule module) {
        return providers.containsKey(module);
    }
}
