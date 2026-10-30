
import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Check,
    ChevronDown,
    Search,
    X,
} from "lucide-react";

export default function CustomISelect({
    options = [],
    value,
    onChange,
    placeholder = "Select an option",
    className = "",
    disabled = false,

    width = "w-full",
    size = "md",
}) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState("");

    const containerRef = useRef(null);
    const searchRef = useRef(null);
    const optionRefs = useRef([]);

    const isSmall = size === "sm";
    const isLarge = size === "lg";

    const iconSize = isSmall ? 14 : isLarge ? 20 : 16;

    // Normalize values to avoid string/number comparison issues.
    const selectedIndex = options.findIndex(
        (option) => String(option.value) === String(value ?? "")
    );

    const selectedOption =
        selectedIndex >= 0 ? options[selectedIndex] : null;

    // Search options by label or value.
    const filteredOptions = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) return options;

        return options.filter((option) => {
            const label = String(option.label ?? "").toLowerCase();
            const optionValue = String(option.value ?? "").toLowerCase();

            return (
                label.includes(search) ||
                optionValue.includes(search)
            );
        });
    }, [options, searchTerm]);

    // Close dropdown when clicking outside.
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setOpen(false);
                setActiveIndex(-1);
                setSearchTerm("");
            }
        };

        document.addEventListener(
            "pointerdown",
            handleOutsideClick,
            true
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsideClick,
                true
            );
        };
    }, []);

    // Focus search input when dropdown opens.
    useEffect(() => {
        if (open) {
            searchRef.current?.focus();
        }
    }, [open]);

    // Scroll active option into view.
    useEffect(() => {
        if (open && activeIndex >= 0) {
            optionRefs.current[activeIndex]?.scrollIntoView({
                block: "nearest",
            });
        }
    }, [open, activeIndex]);

    const closeDropdown = () => {
        setOpen(false);
        setActiveIndex(-1);
        setSearchTerm("");
    };

    const openDropdown = () => {
        if (disabled) return;

        setSearchTerm("");
        setOpen(true);

        const currentIndex = options.findIndex(
            (option) =>
                String(option.value) === String(value ?? "")
        );

        setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
    };

    const chooseOption = (option) => {
        onChange?.(option.value);
        closeDropdown();
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setActiveIndex(0);
    };

    // Keyboard navigation.
    const handleKeyDown = (event) => {
        if (disabled) return;

        // Allow spaces when typing in search.
        if (
            event.target === searchRef.current &&
            event.key === " "
        ) {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closeDropdown();
            return;
        }

        if (event.key === "Tab") {
            closeDropdown();
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();

            if (!open) {
                openDropdown();
                return;
            }

            setActiveIndex((previous) =>
                Math.min(
                    previous + 1,
                    filteredOptions.length - 1
                )
            );
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            if (!open) {
                openDropdown();
                return;
            }

            setActiveIndex((previous) =>
                Math.max(previous - 1, 0)
            );
        }

        if (event.key === "Enter" && open) {
            event.preventDefault();

            if (activeIndex >= 0 && filteredOptions[activeIndex]) {
                chooseOption(filteredOptions[activeIndex]);
            }
        }

        if (
            event.key === " " &&
            event.target !== searchRef.current &&
            !open
        ) {
            event.preventDefault();
            openDropdown();
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative ${width} min-w-0 ${className}`}
            onKeyDown={handleKeyDown}
        >
            {/* SELECT BUTTON */}
            <button
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => {
                    if (open) {
                        closeDropdown();
                    } else {
                        openDropdown();
                    }
                }}
                className="
                    flex w-full items-center justify-between gap-3
                    rounded-md border border-gray-300 bg-white
                    p-2 py-2 text-left text-sm text-gray-500
                    outline-none transition
                    focus:border-[#0095FD]
                    focus:ring-1 focus:ring-[#0095FD]
                    disabled:cursor-not-allowed
                    disabled:bg-gray-100 disabled:opacity-60
                "
            >
                <span className="min-w-0 truncate">
                    {selectedOption?.label ?? placeholder}
                </span>

                <ChevronDown
                    size={iconSize}
                    className={`shrink-0 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {/* DROPDOWN */}
            {open && !disabled && (
                <div
                    className="
                        absolute left-0 top-full z-[100]
                        mt-1 w-full overflow-hidden
                        rounded-md border border-gray-200
                        bg-white shadow-lg
                    "
                >
                    {/* SEARCH INPUT */}
                    <div className="border-b border-gray-100 p-2">
                        <div className="
                            flex items-center gap-2
                            rounded-md border border-gray-200
                            bg-gray-50 px-3
                            focus-within:border-[#0095FD]
                            focus-within:ring-1
                            focus-within:ring-[#0095FD]
                        ">
                            <Search
                                size={15}
                                className="shrink-0 text-gray-400"
                            />

                            <input
                                ref={searchRef}
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search..."
                                autoComplete="off"
                                className="
                                    h-9 w-full min-w-0
                                    bg-transparent text-sm
                                    text-gray-600 outline-none
                                    placeholder:text-gray-400
                                "
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setActiveIndex(0);
                                        searchRef.current?.focus();
                                    }}
                                    className="shrink-0 text-gray-400 hover:text-gray-600"
                                    title="Clear search"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* OPTIONS */}
                    <ul
                        role="listbox"
                        className="
                            max-h-60 overflow-y-auto
                            space-y-1 p-2
                        "
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => {
                                const selected =
                                    String(option.value) ===
                                    String(value ?? "");

                                const active = index === activeIndex;

                                return (
                                    <li
                                        key={option.value}
                                        id={`custom-option-${index}`}
                                        ref={(element) => {
                                            optionRefs.current[index] = element;
                                        }}
                                        role="option"
                                        aria-selected={selected}
                                        onMouseEnter={() =>
                                            setActiveIndex(index)
                                        }
                                        onMouseDown={(event) =>
                                            event.preventDefault()
                                        }
                                        onClick={() =>
                                            chooseOption(option)
                                        }
                                        className={`
                                            flex w-full cursor-pointer
                                            items-center justify-between
                                            gap-2 rounded-sm px-3 py-2
                                            text-sm transition-colors

                                            ${
                                                active
                                                    ? "bg-[#0095FD] text-white"
                                                    : "text-gray-500 hover:bg-[#0095FD] hover:text-white"
                                            }
                                        `}
                                    >
                                        <span className="min-w-0 truncate">
                                            {option.label}
                                        </span>

                                        {selected && (
                                            <Check
                                                size={iconSize}
                                                className="shrink-0"
                                            />
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <li className="
                                px-3 py-5 text-center
                                text-sm text-gray-400
                            ">
                                No matching options found.
                            </li>
                        )}
                    </ul>

                    {/* OPTION COUNT */}
                    {filteredOptions.length > 0 && (
                        <div className="
                            border-t border-gray-100
                            px-3 py-2 text-xs text-gray-400
                        ">
                            {filteredOptions.length} option(s) found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
