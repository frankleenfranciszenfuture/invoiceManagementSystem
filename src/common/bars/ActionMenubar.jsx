import { useState, useRef } from "react";
import {
    useFloating,
    offset,
    flip,
    shift,
    autoUpdate,
} from "@floating-ui/react";
import { createPortal } from "react-dom";
import { ChevronDown, Edit, MoreVertical } from "lucide-react";

export default function ActionMenubar({ onEdit }) {
    const [open, setOpen] = useState(false);
    const timer = useRef();

    const openMenu = () => {
        clearTimeout(timer.current);
        setOpen(true);
    };

    const closeMenu = () => {
        timer.current = setTimeout(() => {
            setOpen(false);
        }, 10);
    };

    const { refs, floatingStyles } = useFloating({
        placement: "bottom-end",
        middleware: [offset(4), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    return (
        <>
            <div
                ref={refs.setReference}
                onMouseEnter={openMenu}
                onMouseLeave={closeMenu}
            >
                <button className="p-2 rounded-full bg-blue-500 hover:bg-blue-200 text-gray-100 hover:text-gray-700 cursor-pointer">
                    <ChevronDown size={14} />
                </button>
            </div>

            {open &&
                createPortal(
                    <div
                        ref={refs.setFloating}
                        style={floatingStyles}
                        onMouseEnter={openMenu}
                        onMouseLeave={closeMenu}
                        className="z-[99999]"
                    >
                        <div className="w-32 rounded-md bg-blue-500 shadow-xl overflow-hidden">
                            <button
                                onClick={() => {
                                    onEdit();
                                    setOpen(false);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-white hover:bg-blue-600 cursor-pointer"
                            >
                                <Edit size={16} />
                                Edit
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}