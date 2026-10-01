import React from "react";

import {
    Building2,
    UsersRound,
    SlidersHorizontal,
    Palette,
    Zap,
    FileText,
} from "lucide-react";

export default function CompanyOrganizationSettings() {

    const sections = [
        {
            title: "Organization",
            icon: Building2,
            color: "green",
            items: [
                "Profile",
                "Branding",
                "Custom Domain",
                "Locations",
                "AI Integration",
                "Manage Subscription",
            ],
        },

        {
            title: "Users & Roles",
            icon: UsersRound,
            color: "red",
            items: [
                "Users",
                "Roles",
                "User Preferences",
            ],

            secondary: {
                title: "Taxes & Compliance",
                icon: FileText,
                color: "blue",
                items: [
                    "Taxes",
                    "Direct Taxes",
                    "MSME Settings",
                ],
            },
        },

        {
            title: "Setup & Configurations",
            icon: SlidersHorizontal,
            color: "orange",
            items: [
                "General",
                "Currencies",
                "Payment Terms",
                "Opening Balances",
                "Reminders",
                "Customer Portal",
                "Vendor Portal",
            ],
        },

        {
            title: "Customization",
            icon: Palette,
            color: "orange",
            items: [
                "Transaction Number Series",
                "PDF Templates",
                "Email Notifications",
                "SMS Notifications",
                "Reporting Tags",
                "Web Tabs",
                "Digital Signature",
            ],
        },

        {
            title: "Automation",
            icon: Zap,
            color: "red",
            items: [
                "Workflow Rules",
                "Workflow Actions",
                "Workflow Logs",
                "Schedules",
            ],
        },
    ];

    const colorClasses = {
        green: {
            header: "bg-green-50",
            icon: "text-green-500",
        },

        red: {
            header: "bg-red-50",
            icon: "text-red-500",
        },

        blue: {
            header: "bg-blue-50",
            icon: "text-blue-500",
        },

        orange: {
            header: "bg-orange-50",
            icon: "text-orange-500",
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">

            <div className="w-full rounded-2xl bg-white px-4 py-6 shadow-sm">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-6 px-4">

                    <h1 className="text-lg font-medium text-gray-800">
                        Organization Settings
                    </h1>

                </div>

                {/* =================================================
                    SETTINGS GRID
                ================================================= */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">

                    {sections.map((section) => {

                        const Icon = section.icon;
                        const colors =
                            colorClasses[section.color];

                        return (
                            <div
                                key={section.title}
                                className="
                                    min-h-[375px]
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-white
                                    p-1
                                "
                            >

                                {/* =================================================
                                    SECTION HEADER
                                ================================================= */}

                                <div
                                    className={`
                                        flex
                                        items-center
                                        gap-2
                                        rounded-lg
                                        px-3
                                        py-2.5
                                        text-sm
                                        font-medium
                                        text-gray-700
                                        ${colors.header}
                                    `}
                                >

                                    <Icon
                                        size={17}
                                        className={colors.icon}
                                    />

                                    <span>
                                        {section.title}
                                    </span>

                                </div>

                                {/* =================================================
                                    SECTION ITEMS
                                ================================================= */}

                                <div className="px-2 py-2">

                                    {section.items.map(
                                        (item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                className="
                                                    flex
                                                    w-full
                                                    items-center
                                                    rounded-md
                                                    px-2
                                                    py-2.5
                                                    text-left
                                                    text-sm
                                                    text-gray-700
                                                    transition
                                                    hover:bg-gray-50
                                                    hover:text-gray-900
                                                "
                                            >
                                                {item}
                                            </button>
                                        )
                                    )}

                                </div>

                                {/* =================================================
                                    SECONDARY SECTION
                                ================================================= */}

                                {section.secondary && (
                                    <>

                                        <div className="mt-3 px-1">

                                            <div
                                                className={`
                                                    flex
                                                    items-center
                                                    gap-2
                                                    rounded-lg
                                                    px-3
                                                    py-2.5
                                                    text-sm
                                                    font-medium
                                                    text-gray-700
                                                    ${colorClasses[
                                                        section
                                                            .secondary
                                                            .color
                                                    ].header
                                                    }
                                                `}
                                            >

                                                {React.createElement(
                                                    section
                                                        .secondary
                                                        .icon,
                                                    {
                                                        size: 17,
                                                        className:
                                                            colorClasses[
                                                                section
                                                                    .secondary
                                                                    .color
                                                            ].icon,
                                                    }
                                                )}

                                                <span>
                                                    {
                                                        section
                                                            .secondary
                                                            .title
                                                    }
                                                </span>

                                            </div>

                                        </div>

                                        <div className="px-2 py-2">

                                            {section.secondary.items.map(
                                                (item) => (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        className="
                                                            flex
                                                            w-full
                                                            items-center
                                                            rounded-md
                                                            px-2
                                                            py-2.5
                                                            text-left
                                                            text-sm
                                                            text-gray-700
                                                            transition
                                                            hover:bg-gray-50
                                                            hover:text-gray-900
                                                        "
                                                    >
                                                        {item}
                                                    </button>
                                                )
                                            )}

                                        </div>

                                    </>
                                )}

                            </div>
                        );
                    })}

                </div>

            </div>

        </div>
    );
}