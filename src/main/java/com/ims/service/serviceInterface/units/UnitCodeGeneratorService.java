package com.ims.service.serviceInterface.units;

import org.springframework.stereotype.Service;

@Service
public class UnitCodeGeneratorService {

    public String generate(
            Long id,
            String unitName) {

        String normalizedName =
                unitName.trim()
                        .replaceAll("\\s+", " ")
                        .toUpperCase();

        String code;

        switch (normalizedName) {

            case "PIECE":
            case "PCS":
            case "PIECES":
                code = "PCS";
                break;

            case "METER":
            case "METRE":
            case "MTR":
                code = "MTR";
                break;

            case "KILOGRAM":
            case "KG":
                code = "KG";
                break;

            case "GRAM":
            case "GM":
                code = "GM";
                break;

            case "BOX":
            case "BOXES":
                code = "BOX";
                break;

            case "DOZEN":
            case "DOZ":
                code = "DOZ";
                break;

            case "ROLL":
            case "ROLLS":
                code = "ROL";
                break;

            default:
                code = normalizedName.length() <= 3
                        ? normalizedName
                        : normalizedName.substring(0, 3);
        }

        return String.format(
                "UNT-%02d-%s",
                id,
                code
        );
    }
}
