package com.ims.service.serviceInterface.sizes;

import org.springframework.stereotype.Service;

@Service
public class SizeCodeGeneratorService {

    public String generate(
            Long id,
            String sizeName) {

        String normalizedName =
                sizeName.trim()
                        .replaceAll("\\s+", " ")
                        .toUpperCase();

        String code;

        switch (normalizedName) {

            case "SMALL":
                code = "S";
                break;

            case "MEDIUM":
                code = "M";
                break;

            case "LARGE":
                code = "L";
                break;

            case "EXTRA LARGE":
            case "XL":
                code = "XL";
                break;

            case "DOUBLE EXTRA LARGE":
            case "XXL":
                code = "XXL";
                break;

            default:
                code = normalizedName.length() <= 3
                        ? normalizedName
                        : normalizedName.substring(0, 3);
        }

        return String.format(
                "SZ-%02d-%s",
                id,
                code
        );
    }
}