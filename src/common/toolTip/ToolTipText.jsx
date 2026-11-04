
import React from "react";

const ToolTipText = ({ text, position = "top" }) => {
    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };

    const arrowClasses = {
        top: "top-full left-1/2 -translate-x-1/2 -mt-1",
        bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1",
        left: "left-full top-1/2 -translate-y-1/2 -ml-1",
        right: "right-full top-1/2 -translate-y-1/2 -mr-1",
    };

    return (
        <span
            className={`
                pointer-events-none
                absolute ${positionClasses[position]}
                z-[9999]
                whitespace-nowrap
                rounded-md
                bg-gray-900
                px-2.5 py-1.5
                text-[11px] font-medium text-white
                shadow-lg
                opacity-0 invisible
                group-hover:opacity-100
                group-hover:visible
                transition-all duration-150
            `}
        >
            {text}

            <span
                className={`
                    absolute
                    ${arrowClasses[position]}
                    h-2 w-2
                    rotate-45
                    bg-gray-900
                `}
            />
        </span>
    );
};

export default ToolTipText;
