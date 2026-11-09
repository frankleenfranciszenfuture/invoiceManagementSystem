
import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus, Search } from "lucide-react";

const SearchableCreateSelect = ({
    value,
    onChange,
    options = [],
    placeholder = "Search or select",
    searchPlaceholder = "Search...",
    addLabel = "Add",
    onAdd,
    disabled = false,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const wrapperRef = useRef(null);

    const selectedOption = options.find(
        (item) => String(item.value) === String(value)
    );

    const searchText = search.trim().toLowerCase();

    const filteredOptions = options.filter((item) =>
        String(item.label || "")
            .toLowerCase()
            .includes(searchText)
    );

    const exactMatch = options.some(
        (item) =>
            String(item.label || "").trim().toLowerCase() === searchText
    );

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const handleSelect = (option) => {
        onChange(String(option.value));
        setOpen(false);
        setSearch("");
    };

    const handleAdd = () => {
        const name = search.trim();

        if (!name || !onAdd) return;

        onAdd(name);

        setOpen(false);
        setSearch("");
    };

    return (
        <div ref={wrapperRef} className="relative w-full">

            {/* SELECT BUTTON */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((previous) => !previous)}
                className="
                    flex h-10 w-full items-center justify-between
                    rounded-lg border border-gray-200 bg-white
                    px-3 text-left text-sm text-gray-700
                    outline-none transition
                    hover:border-gray-300
                    focus:border-[#408DFB]
                    disabled:cursor-not-allowed disabled:bg-gray-100
                "
            >
                <span className={selectedOption ? "text-gray-700" : "text-gray-400"}>
                    {selectedOption?.label || placeholder}
                </span>

                <ChevronDown
                    size={16}
                    className="shrink-0 text-gray-400"
                />
            </button>

            {/* DROPDOWN */}
            {open && !disabled && (
                <div className="
                    absolute left-0 right-0 top-full z-50 mt-1
                    overflow-hidden rounded-lg border border-gray-200
                    bg-white shadow-lg
                ">

                    {/* SEARCH */}
                    <div className="border-b border-gray-100 p-2">
                        <div className="
                            flex items-center gap-2 rounded-md
                            border border-gray-200 px-2.5
                            focus-within:border-[#408DFB]
                        ">
                            <Search size={15} className="text-gray-400" />

                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="
                                    h-9 w-full bg-transparent
                                    text-sm text-gray-700 outline-none
                                    placeholder:text-gray-400
                                "
                            />
                        </div>
                    </div>

                    {/* OPTIONS */}
                    <div className="max-h-48 overflow-y-auto p-1">

                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className="
                                        flex w-full items-center justify-between
                                        rounded-md px-3 py-2.5 text-left
                                        text-sm text-gray-700
                                        hover:bg-blue-50 hover:text-[#408DFB]
                                    "
                                >
                                    <span>{option.label}</span>

                                    {String(value) === String(option.value) && (
                                        <Check
                                            size={16}
                                            className="text-[#408DFB]"
                                        />
                                    )}
                                </button>
                            ))
                        ) : searchText ? (
                            <p className="px-3 py-3 text-center text-xs text-gray-400">
                                No matching records found
                            </p>
                        ) : (
                            <p className="px-3 py-3 text-center text-xs text-gray-400">
                                No records available
                            </p>
                        )}

                        {/* ADD NEW */}
                        {searchText && !exactMatch && onAdd && (
                            <button
                                type="button"
                                onClick={handleAdd}
                                className="
                                    mt-1 flex w-full items-center gap-2
                                    rounded-md border-t border-gray-100
                                    px-3 py-3 text-left text-sm
                                    font-medium text-[#408DFB]
                                    transition hover:bg-blue-50
                                "
                            >
                                <Plus size={16} />

                                <span>
                                    {addLabel} "{search.trim()}"
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableCreateSelect;
