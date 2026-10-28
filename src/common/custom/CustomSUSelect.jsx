import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    Check,
    ChevronDown,
    Plus,
    Search,
    X,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { openModal } from "../../module/ui/uiSlice";

export default function CustomSUSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select",
    className = "",
    disabled = false,
    width = "w-full",
    size = "md",
    searchable = true,
    searchPlaceholder = "Search...",

    // Reusable Add New configuration
    addNewLabel = "",
    addNewModalType = "",
    addNewData = null,
}) {
    const dispatch = useDispatch();

    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [search, setSearch] = useState("");

    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const searchRef = useRef(null);
    const optionRefs = useRef([]);

    const selectedIndex = options.findIndex(
        (option) => String(option.value) === String(value)
    );

    const selectedOption =
        selectedIndex >= 0 ? options[selectedIndex] : null;

    const isSmall = size === "sm";

    // Filter options using their displayed labels.
    const filteredOptions = options.filter((option) =>
        String(option.label ?? "")
            .toLowerCase()
            .includes(search.trim().toLowerCase())
    );

    const updatePosition = () => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        const openUpward =
            spaceBelow < 200 && spaceAbove > spaceBelow;

        const availableSpace = Math.max(
            100,
            Math.max(spaceBelow, spaceAbove) - 12
        );

        setPosition({
            top: openUpward ? undefined : rect.bottom + 4,
            bottom: openUpward
                ? viewportHeight - rect.top + 4
                : undefined,
            left: rect.left,
            width: rect.width,
            maxHeight: Math.min(300, availableSpace),
        });
    };

    useEffect(() => {
        if (!open) return;

        updatePosition();

        const handleOutsideClick = (event) => {
            if (
                containerRef.current?.contains(event.target) ||
                event.target.closest?.("[data-custom-status-dropdown]")
            ) {
                return;
            }

            setOpen(false);
            setSearch("");
            setActiveIndex(-1);
        };

        const handleScrollOrResize = () => updatePosition();

        document.addEventListener(
            "pointerdown",
            handleOutsideClick,
            true
        );

        window.addEventListener(
            "scroll",
            handleScrollOrResize,
            true
        );

        window.addEventListener("resize", handleScrollOrResize);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsideClick,
                true
            );

            window.removeEventListener(
                "scroll",
                handleScrollOrResize,
                true
            );

            window.removeEventListener(
                "resize",
                handleScrollOrResize
            );
        };
    }, [open]);

    // Focus the search input when the dropdown opens.
    useEffect(() => {
        if (open && searchable) {
            requestAnimationFrame(() => {
                searchRef.current?.focus();
            });
        }
    }, [open, searchable]);

    useEffect(() => {
        if (open && activeIndex >= 0) {
            optionRefs.current[activeIndex]?.scrollIntoView({
                block: "nearest",
            });
        }
    }, [open, activeIndex, search]);

    const closeDropdown = () => {
        setOpen(false);
        setSearch("");
        setActiveIndex(-1);
    };

    const chooseOption = (option) => {
        onChange?.(option.value);
        closeDropdown();
        buttonRef.current?.focus();
    };

    const handleAddNew = () => {
        if (!addNewModalType) return;

        const typedValue = search.trim();

        if (!typedValue) return;

        closeDropdown();

        const fieldName = {
            addSize: "sizeName",
            addUnit: "unitName",
            addTaxMaster: "taxName",
        }[addNewModalType];

        dispatch(
            openModal({
                type: addNewModalType,
                data: {
                    ...(addNewData || {}),
                    ...(fieldName ? { [fieldName]: typedValue } : {}),
                    initialValue: typedValue,
                },
            })
        );
    };

    const handleKeyDown = (event) => {
        if (disabled) return;

        if (event.key === "Escape") {
            event.preventDefault();
            closeDropdown();
            buttonRef.current?.focus();
            return;
        }

        if (event.key === "Tab") {
            closeDropdown();
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();

            if (!open) {
                setSearch("");
                setActiveIndex(0);
                setOpen(true);
            } else {
                setActiveIndex((index) =>
                    Math.min(
                        index + 1,
                        filteredOptions.length - 1
                    )
                );
            }

            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            if (!open) {
                setSearch("");
                setActiveIndex(
                    Math.max(filteredOptions.length - 1, 0)
                );
                setOpen(true);
            } else {
                setActiveIndex((index) =>
                    Math.max(index - 1, 0)
                );
            }

            return;
        }

        if (
            event.key === "Enter" &&
            open &&
            activeIndex >= 0 &&
            filteredOptions[activeIndex]
        ) {
            event.preventDefault();
            chooseOption(filteredOptions[activeIndex]);
        }
    };

    const triggerSize = isSmall
        ? "h-9 px-2.5 text-xs"
        : "h-10 px-3 text-sm";

    const optionSize = isSmall
        ? "px-2.5 py-1.5 text-xs"
        : "px-3 py-2 text-sm";

    return (
        <div
            ref={containerRef}
            className={`relative min-w-0 ${width} ${className}`}
            onKeyDown={handleKeyDown}
        >
            {/* Dropdown trigger */}
            <button
                ref={buttonRef}
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => {
                    if (!open) {
                        setSearch("");
                        setActiveIndex(
                            selectedIndex >= 0 ? selectedIndex : 0
                        );

                        updatePosition();
                        setOpen(true);
                    } else {
                        closeDropdown();
                    }
                }}
                className={`
                    flex w-full min-w-0 items-center justify-between
                    rounded-md border border-gray-300 bg-white
                    text-left text-sm text-[#0F4659]
                    outline-none transition
                    focus:border-[#0F4659]
                    focus:ring-1 focus:ring-[#0F4659]
                    disabled:cursor-not-allowed
                    disabled:bg-gray-100 disabled:opacity-60
                    ${triggerSize}
                `}
            >
                <span className="min-w-0 truncate">
                    {selectedOption?.label ?? placeholder}
                </span>

                <ChevronDown
                    size={isSmall ? 14 : 16}
                    className={`shrink-0 transition-transform ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown portal */}
            {open &&
                position &&
                !disabled &&
                createPortal(
                    <div
                        data-custom-status-dropdown
                        style={{
                            position: "fixed",
                            top: position.top,
                            bottom: position.bottom,
                            left: position.left,
                            width: position.width,
                            maxHeight: position.maxHeight,
                            zIndex: 999999,
                        }}
                        className="
                            flex flex-col overflow-hidden rounded-md
                            border border-gray-200 bg-white shadow-xl
                        "
                    >
                        {/* Search */}
                        {searchable && (
                            <div className="shrink-0 border-b border-gray-100 p-2">
                                <div
                                    className="
                                        flex items-center gap-2 rounded-md
                                        border border-gray-200 bg-gray-50
                                        px-2.5
                                        focus-within:border-[#0F4659]
                                        focus-within:bg-white
                                    "
                                >
                                    <Search
                                        size={14}
                                        className="shrink-0 text-gray-400"
                                    />

                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={search}
                                        placeholder={searchPlaceholder}
                                        onChange={(event) => {
                                            setSearch(event.target.value);
                                            setActiveIndex(0);
                                        }}
                                        onKeyDown={(event) => {
                                            if (
                                                [
                                                    "ArrowDown",
                                                    "ArrowUp",
                                                    "Enter",
                                                    "Escape",
                                                ].includes(event.key)
                                            ) {
                                                handleKeyDown(event);
                                            }
                                        }}
                                        className="
                                            h-8 w-full min-w-0 bg-transparent
                                            text-xs text-gray-700 outline-none
                                            placeholder:text-gray-400
                                        "
                                    />

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch("");
                                                setActiveIndex(0);
                                                searchRef.current?.focus();
                                            }}
                                            className="
                                                shrink-0 text-gray-400
                                                hover:text-gray-700
                                            "
                                            aria-label="Clear search"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Filtered options */}
                        <ul
                            role="listbox"
                            className="min-h-0 flex-1 overflow-y-auto p-1"
                        >
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => {
                                    const selected =
                                        String(option.value) ===
                                        String(value);

                                    const active = index === activeIndex;

                                    return (
                                        <li
                                            key={String(option.value)}
                                            id={`custom-status-option-${index}`}
                                            ref={(element) => {
                                                optionRefs.current[index] =
                                                    element;
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
                                                flex cursor-pointer
                                                items-center justify-between
                                                gap-2 rounded-sm
                                                transition-colors
                                                ${optionSize}
                                                ${active
                                                    ? "bg-[#408DFB] text-white"
                                                    : "text-gray-500 hover:bg-[#408DFB] hover:text-white"
                                                }
                                            `}
                                        >
                                            <span className="truncate">
                                                {option.label}
                                            </span>

                                            {selected && (
                                                <Check
                                                    size={14}
                                                    className="shrink-0"
                                                />
                                            )}
                                        </li>
                                    );
                                })
                            ) : (
                                <li className="p-2">
                                    <div className="py-2 text-center text-xs text-gray-400">
                                        No matching{" "}
                                        {addNewLabel
                                            ? addNewLabel.toLowerCase()
                                            : "options"}{" "}
                                        found
                                    </div>

                                    {addNewModalType && (
                                        <button
                                            type="button"
                                            onMouseDown={(event) =>
                                                event.preventDefault()
                                            }
                                            onClick={handleAddNew}
                                            className="
                                                flex w-full items-center
                                                justify-center gap-2
                                                rounded-md border
                                                border-dashed
                                                border-blue-300 bg-blue-50
                                                px-3 py-2.5 text-sm
                                                font-medium text-blue-600
                                                transition
                                                hover:border-blue-500
                                                hover:bg-blue-100
                                            "
                                        >
                                            <Plus size={15} />
                                            Add New {addNewLabel}
                                        </button>
                                    )}
                                </li>
                            )}
                        </ul>
                    </div>,
                    document.body
                )}
        </div>
    );
}