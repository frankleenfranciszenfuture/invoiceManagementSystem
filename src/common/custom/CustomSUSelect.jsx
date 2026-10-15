import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export default function CustomSUSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select",
    className = "",
    disabled = false,
    width = "w-full",
    size = "md",
}) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState(null);
    const [activeIndex, setActiveIndex] = useState(-1);

    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const optionRefs = useRef([]);

    const selectedIndex = options.findIndex(
        (option) => String(option.value) === String(value)
    );

    const selectedOption =
        selectedIndex >= 0 ? options[selectedIndex] : null;

    const isSmall = size === "sm";

    const updatePosition = () => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        const maxHeight = Math.min(
            240,
            Math.max(100, Math.max(spaceBelow, spaceAbove) - 12)
        );

        // Open upward only when there isn't enough room below.
        const openUpward = spaceBelow < 200 && spaceAbove > spaceBelow;

        setPosition({
            top: openUpward ? undefined : rect.bottom + 4,
            bottom: openUpward ? viewportHeight - rect.top + 4 : undefined,
            left: rect.left,
            width: rect.width,
            maxHeight,
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
            setActiveIndex(-1);
        };

        const handleScrollOrResize = () => updatePosition();

        document.addEventListener("pointerdown", handleOutsideClick, true);
        window.addEventListener("scroll", handleScrollOrResize, true);
        window.addEventListener("resize", handleScrollOrResize);

        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick, true);
            window.removeEventListener("scroll", handleScrollOrResize, true);
            window.removeEventListener("resize", handleScrollOrResize);
        };
    }, [open]);

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
        } else if (event.key === "ArrowDown") {
            event.preventDefault();

            if (!open) {
                setOpen(true);
                setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
            } else {
                setActiveIndex((index) =>
                    Math.min(index + 1, options.length - 1)
                );
            }
        } else if (event.key === "ArrowUp") {
            event.preventDefault();

            if (!open) {
                setOpen(true);
                setActiveIndex(
                    selectedIndex >= 0 ? selectedIndex : options.length - 1
                );
            } else {
                setActiveIndex((index) => Math.max(index - 1, 0));
            }
        } else if (event.key === "Enter" || event.key === " ") {
            if (!open) {
                event.preventDefault();
                setOpen(true);
                setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
            } else if (activeIndex >= 0) {
                event.preventDefault();
                chooseOption(options[activeIndex]);
            }
        } else if (event.key === "Tab") {
            setOpen(false);
            setActiveIndex(-1);
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
            <button
                ref={buttonRef}
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => {
                    if (!open) {
                        updatePosition();
                        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
                    }

                    setOpen((previous) => !previous);
                }}
                className={`
          flex h-10 w-[120px] items-center justify-between
          rounded-md border border-gray-300 bg-white
          px-3 text-left text-sm text-[#0F4659]
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

            {open &&
                position &&
                !disabled &&
                createPortal(
                    <ul
                        data-custom-status-dropdown
                        role="listbox"
                        aria-activedescendant={
                            activeIndex >= 0
                                ? `custom-status-option-${activeIndex}`
                                : undefined
                        }
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
              overflow-y-auto rounded-md border border-gray-200
              bg-white p-1 shadow-xl
            "
                    >
                        {options.map((option, index) => {
                            const selected =
                                String(option.value) === String(value);
                            const active = index === activeIndex;

                            return (
                                <li
                                    key={String(option.value)}
                                    id={`custom-status-option-${index}`}
                                    ref={(element) => {
                                        optionRefs.current[index] = element;
                                    }}
                                    role="option"
                                    aria-selected={selected}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => chooseOption(option)}
                                    className={`
                    flex cursor-pointer items-center justify-between
                    gap-2 rounded-sm transition-colors
                    ${optionSize}
                    ${active
                                            ? "bg-[#1A2444] text-white"
                                            : "text-[#0F4659] hover:bg-[#0F4659] hover:text-white"
                                        }
                  `}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {selected && <Check size={14} className="shrink-0" />}
                                </li>
                            );
                        })}
                    </ul>,
                    document.body
                )}
        </div>
    );
}