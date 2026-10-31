
import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function CustomSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select an option",
    className = "",
    disabled = false,

    // Default settings for every module
    width = "w-full",
    size = "md",
}) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const containerRef = useRef(null);
    const optionRefs = useRef([]);

    const isSmall = size === "sm";
    const isLarge = size === "lg";

    const selectedIndex = options.findIndex(
        (option) => option.value === value
    );

    const selectedOption =
        selectedIndex >= 0 ? options[selectedIndex] : null;

    // const triggerSize = isSmall
    //     ? "h-9 px-6 text-xs "
    //     : isLarge
    //         ? "h-12 px-4 text-base"
    //         : "h-10 px-3 text-sm";

    // const optionSize = isSmall
    //     ? "px-2.5 py-1 text-xs"
    //     : isLarge
    //         ? "px-4 py-3 text-base"
    //         : "px-3 py-2 text-sm";

    const iconSize = isSmall ? 14 : isLarge ? 20 : 16;

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setOpen(false);
                setActiveIndex(-1);
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

    useEffect(() => {
        if (open && activeIndex >= 0) {
            optionRefs.current[activeIndex]?.scrollIntoView({
                block: "nearest",
            });
        }
    }, [open, activeIndex]);

    const chooseOption = (option) => {
        onChange?.(option.value);
        setOpen(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (event) => {
        if (disabled || options.length === 0) return;

        if (event.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();

            if (!open) {
                setOpen(true);
                setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
            } else {
                setActiveIndex((index) =>
                    Math.min(index + 1, options.length - 1)
                );
            }
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            if (!open) {
                setOpen(true);
                setActiveIndex(
                    selectedIndex >= 0
                        ? selectedIndex
                        : options.length - 1
                );
            } else {
                setActiveIndex((index) => Math.max(index - 1, 0));
            }
        }

        if (event.key === "Enter" || event.key === " ") {
            if (!open) {
                event.preventDefault();
                setOpen(true);
                setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
            } else if (activeIndex >= 0) {
                event.preventDefault();
                chooseOption(options[activeIndex]);
            }
        }

        if (event.key === "Tab") {
            setOpen(false);
            setActiveIndex(-1);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative ${width} min-w-0 ${className}`}
            onKeyDown={handleKeyDown}
        >
            <button
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => {
                    setOpen((previous) => !previous);
                    setActiveIndex(
                        selectedIndex >= 0 ? selectedIndex : 0
                    );
                }}
                className={`
                    flex w-full items-center justify-between gap-3 p-2 py-2
                    rounded-md border border-gray-100 bg-white
                    text-left text-gray-500 text-sm
                    outline-none transition
                    focus:border-[#0095FD]
                    focus:ring-1 focus:ring-[#0095FD]
                    disabled:cursor-not-allowed
                    disabled:bg-gray-100 disabled:opacity-60
                    
                `}
            >
                <span className="min-w-0 truncate">
                    {selectedOption?.label ?? placeholder}
                </span>

                <ChevronDown
                    size={iconSize}
                    className={`shrink-0 transition-transform ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && !disabled && (
                <ul
                    role="listbox"
                    aria-activedescendant={
                        activeIndex >= 0
                            ? `custom-option-${activeIndex}`
                            : undefined
                    }
                    className="
                            absolute left-0 top-full z-[100] mt-1
                            max-h-60 w-full overflow-y-auto
                            rounded-sm border border-gray-200
                            bg-white p-3 shadow-lg 
                            space-y-1
                        "
                >
                    {options.map((option, index) => {
                        const selected = option.value === value;
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
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseDown={(event) =>
                                    event.preventDefault()
                                }
                                onClick={() => chooseOption(option)}
                                className={`
                                     flex w-full cursor-pointer items-center justify-between
                                    gap-2 rounded-sm px-3 py-2 text-sm transition-colors
                                  
                                    ${active
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
                    })}
                </ul>
            )}
        </div>
    );
}