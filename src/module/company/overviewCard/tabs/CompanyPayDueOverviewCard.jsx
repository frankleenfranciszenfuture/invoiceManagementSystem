
import React, { useState } from "react";

import {
    useSelector,
} from "react-redux";

import {
    getCompanyLogoUrl,
    getCompanySignatureUrl,
} from "../../../../api/utils/imageUtils";

import {
    ChevronDown,
    Building2,
} from "lucide-react";

export default function CompanyPayDueOverviewCard() {

    const [
        showImageDetails,
        setShowImageDetails,
    ] = useState(false);

    /* =========================================================
       COMPANY
    ========================================================= */

    const company = useSelector(
        (state) =>
            state.company?.company
    );

    const existingCompany = useSelector(
        (state) =>
            state.company?.existingCompany
    );

    const currentCompany =
        existingCompany || company;

    /* =========================================================
       IMAGE URL
    ========================================================= */

    const logoUrl = getCompanyLogoUrl(
        currentCompany?.logo
    );

    const signatureUrl = getCompanySignatureUrl(
        currentCompany?.signature
    );
    /* =========================================================
       COMPANY INITIALS
    ========================================================= */

    const initials = (
        companyName
    ) =>
        companyName
            ?.split(" ")
            .filter(Boolean)
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase() || "CO";

    /* =========================================================
       COMPANY AVATAR COLORS
    ========================================================= */

    const avatarColors = [
        "bg-pink-500 text-white",
        "bg-green-500 text-white",
        "bg-blue-500 text-white",
        "bg-purple-500 text-white",
        "bg-orange-500 text-white",
        "bg-cyan-500 text-white",
        "bg-indigo-500 text-white",
    ];

    const getAvatarColor = (
        name = ""
    ) => {

        const index =
            name
                .split("")
                .reduce(
                    (
                        acc,
                        char
                    ) =>
                        acc +
                        char.charCodeAt(0),
                    0
                ) %
            avatarColors.length;

        return avatarColors[index];
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div
            className="
                w-full
                min-w-0
                overflow-hidden
                rounded-md
                border
                border-gray-200
                bg-white
            "
        >

            {/* =================================================
                IMAGE HEADER
            ================================================= */}

            <div
                className="
                    w-full
                    border-b
                    border-gray-200
                    px-5
                "
            >

                <button
                    type="button"
                    onClick={() =>
                        setShowImageDetails(
                            (prev) =>
                                !prev
                        )
                    }
                    className="
                        flex
                        w-full
                        cursor-pointer
                        items-center
                        gap-1
                        py-3
                        text-left
                        text-sm
                        font-semibold
                        uppercase
                        text-gray-600
                        transition-colors
                        hover:text-gray-800
                    "
                >

                    <span>
                        Company Logo
                    </span>

                    <ChevronDown
                        size={14}
                        className={`
                            transition-transform
                            duration-200
                            ${showImageDetails
                                ? "rotate-180"
                                : ""
                            }
                        `}
                    />

                </button>

            </div>

            {/* =================================================
                IMAGE CONTENT
            ================================================= */}

            {!showImageDetails && (

                <div
                    className="
                        w-full
                        border-b
                        border-gray-200
                        px-5
                        py-4
                    "
                >

                    <div
                        className="
                            flex
                            w-full
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-gray-200
                            bg-gray-50
                            p-4
                        "
                    >

                        {/* =================================================
                            COMPANY IMAGE
                        ================================================= */}

                        {logoUrl ? (

                            <div
                                className="
                                    h-48
                                    w-48
                                    shrink-0
                                    overflow-hidden
                                    rounded-lg
                                    border
                                    border-gray-200
                                    bg-white
                                "
                            >

                                <img
                                    src={logoUrl}
                                    alt={
                                        currentCompany?.companyName ||
                                        "Company"
                                    }
                                    className="
                                        h-full
                                        w-full
                                        object-cover
                                    "
                                    onError={(
                                        event
                                    ) => {

                                        event.currentTarget.style.display =
                                            "none";

                                    }}
                                />

                            </div>

                        ) : (

                            /* =================================================
                               COMPANY FALLBACK AVATAR
                            ================================================= */

                            <div
                                className={`
                                    flex
                                    h-48
                                    w-48
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-4xl
                                    font-bold
                                    ${getAvatarColor(
                                    currentCompany?.companyName
                                )}
                                `}
                            >

                                {currentCompany?.companyName ? (

                                    initials(
                                        currentCompany.companyName
                                    )

                                ) : (

                                    <Building2
                                        className="
                                            h-12
                                            w-12
                                            text-white
                                        "
                                    />

                                )}

                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}
