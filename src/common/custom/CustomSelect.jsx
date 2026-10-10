import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function CustomSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select an option",
    className = "",
    disabled = false,
}) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const containerRef = useRef(null);
    const optionRefs = useRef([]);

    const selectedIndex = options.findIndex(
        (option) => option.value === value
    );

    const selectedOption =
        selectedIndex >= 0 ? options[selectedIndex] : null;

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

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
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
        if (disabled) return;

        if (event.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();

            if (!open) {
                setOpen(true);
                setActiveIndex(
                    selectedIndex >= 0 ? selectedIndex : 0
                );
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
                setActiveIndex((index) =>
                    Math.max(index - 1, 0)
                );
            }
        }

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            if (!open) {
                event.preventDefault();
                setOpen(true);
                setActiveIndex(
                    selectedIndex >= 0 ? selectedIndex : 0
                );
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
            className={`relative w-full ${className}`}
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
          flex h-10 w-full items-center justify-between
          rounded-md border border-gray-300 bg-white
          px-3 text-left text-sm text-[#0F4659]
          outline-none transition
          focus:border-[#0F4659]
          focus:ring-1 focus:ring-[#0F4659]
          disabled:cursor-not-allowed
          disabled:bg-gray-100 disabled:opacity-60
        `}
            >
                <span className={!selectedOption ? "text-gray-400" : ""}>
                    {selectedOption?.label ?? placeholder}
                </span>

                <ChevronDown
                    size={16}
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
            absolute left-0 right-0 top-full z-[100]
            mt-1 max-h-60 overflow-y-auto
            rounded-md border border-gray-200
            bg-white p-1 shadow-lg
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
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => chooseOption(option)}
                                className={`
                  flex cursor-pointer items-center
                  justify-between rounded-sm px-3 py-2
                  text-sm transition-colors
                  ${active
                                        ? "bg-[#0F4659] text-white"
                                        : "text-[#0F4659] hover:bg-[#0F4659] hover:text-white"
                                    }
                `}
                            >
                                <span>{option.label}</span>

                                {selected && <Check size={16} />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}