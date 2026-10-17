
import React from "react";
import {
    Users,
    UserRound,
    Mail,
    Phone,
    BriefcaseBusiness,
} from "lucide-react";

const Detail = ({ icon: Icon, value }) => (
    <div className="flex min-w-0 items-start gap-2 text-sm text-slate-500">
        <Icon size={14} className="mt-0.5 shrink-0" />
        <span className="break-words">{value}</span>
    </div>
);

export default function CustomerContactPersonsTab({
    contactPersons = [],
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <Users size={18} className="text-[#088178]" />
                    <h2 className="text-[15px] font-semibold text-slate-700">
                        Contact Persons
                    </h2>
                </div>

                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-[#088178]">
                    {contactPersons.length} contacts
                </span>
            </header>

            {contactPersons.length === 0 ? (
                <div className="px-5 py-14 text-center sm:px-6">
                    <Users size={34} className="mx-auto text-slate-300" />
                    <p className="mt-3 text-sm font-medium text-slate-600">
                        No contact persons added
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Contact persons associated with this customer will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
                    {contactPersons.map((person, index) => {
                        const fullName = [
                            person.salutation,
                            person.firstName,
                            person.lastName,
                        ]
                            .filter(Boolean)
                            .join(" ");

                        const initials =
                            fullName
                                .split(/\s+/)
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part[0].toUpperCase())
                                .join("") || "?";

                        return (
                            <article
                                key={person.id ?? index}
                                className="min-w-0 rounded-xl border border-slate-200 p-4 transition hover:border-[#088178]/40 hover:shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4EBBB4] to-[#088178] font-semibold text-white">
                                        {initials}
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="break-words text-sm font-semibold text-slate-700">
                                            {fullName || "Unnamed contact"}
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {person.designation || "No designation"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                                    {person.email && (
                                        <Detail
                                            icon={Mail}
                                            value={person.email}
                                        />
                                    )}

                                    {(person.mobile || person.phone) && (
                                        <Detail
                                            icon={Phone}
                                            value={person.mobile || person.phone}
                                        />
                                    )}

                                    {person.department && (
                                        <Detail
                                            icon={BriefcaseBusiness}
                                            value={person.department}
                                        />
                                    )}

                                    {!person.email &&
                                        !person.mobile &&
                                        !person.phone &&
                                        !person.department && (
                                            <Detail
                                                icon={UserRound}
                                                value="No additional contact information"
                                            />
                                        )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
