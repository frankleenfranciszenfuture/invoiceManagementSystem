export default function Tooltip({ text }) {
    return (
        <div
            className="
                absolute
                left-1/2
                top-11
                -translate-x-1/2
                whitespace-nowrap
                rounded-md
                bg-gray-900
                px-3
                py-1.5
                text-xs
                text-white
                opacity-0
                invisible
                transition-all
                duration-200
                group-hover:opacity-100
                group-hover:visible
                z-50
            "
        >
            {text}

            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900" />
        </div>
    );
}