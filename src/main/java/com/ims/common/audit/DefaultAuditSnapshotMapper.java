
package com.ims.common.audit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DefaultAuditSnapshotMapper implements AuditSnapshotMapper {

    private final ObjectMapper objectMapper;

    private static final Set<String> SENSITIVE_FIELDS = Set.of(
            "password",
            "confirmpassword",
            "token",
            "accesstoken",
            "refreshtoken",
            "secret",
            "authorization",
            "otp",
            "verifyotp",
            "resetotp",
            "pin"
    );

    @Override
    public boolean supports(String entityName) {
        // This mapper is used only as a fallback.
        // Dedicated module mappers must be selected first.
        return false;
    }

    @Override
    public Object toSnapshot(Object entity) {

        if (entity == null) {
            return null;
        }

        JsonNode snapshot = objectMapper.valueToTree(entity);

        removeSensitiveFields(snapshot);

        return snapshot;
    }

    private void removeSensitiveFields(JsonNode node) {

        if (node == null) {
            return;
        }

        if (node.isObject()) {

            ObjectNode objectNode = (ObjectNode) node;

            Iterator<String> fields = objectNode.fieldNames();

            List<String> names = new ArrayList<>();

            fields.forEachRemaining(names::add);

            for (String field : names) {

                if (SENSITIVE_FIELDS.contains(
                        field.toLowerCase()
                )) {

                    objectNode.remove(field);

                } else {

                    removeSensitiveFields(
                            objectNode.get(field)
                    );
                }
            }

        } else if (node.isArray()) {

            node.forEach(this::removeSensitiveFields);
        }
    }
}
