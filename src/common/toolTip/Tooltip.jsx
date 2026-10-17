export default function Tooltip({ text, position = "top" }) {
    const positionClasses = {
        top: "top-full left-1/2 -translate-x-1/2 mt-2",
        bottom: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };

    const arrowClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 -mb-1",
        bottom: "top-full left-1/2 -translate-x-1/2 -mt-1",
        left: "left-full top-1/2 -translate-y-1/2 -ml-1",
        right: "right-full top-1/2 -translate-y-1/2 -mr-1",
    };

    return (
        <span
            role="tooltip"
            className={`
                pointer-events-none
                absolute
                ${positionClasses[position] || positionClasses.top}
                z-[9999]
                invisible
                whitespace-nowrap
                rounded-md
                bg-gray-900
                px-3
                py-1.5
                text-xs
                font-medium
                text-white
                opacity-0
                shadow-lg
                transition-all
                duration-200
                group-hover:visible
                group-hover:opacity-100
                group-focus-visible:visible
                group-focus-visible:opacity-100
            `}
        >
            {text}

            <span
                className={`
                    absolute
                    ${arrowClasses[position] || arrowClasses.top}
                    h-2
                    w-2
                    rotate-45
                    bg-gray-900
                `}
            />
        </span>
    );
}