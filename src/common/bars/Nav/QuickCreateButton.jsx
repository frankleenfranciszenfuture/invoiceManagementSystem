import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
    closeQuickCreate,
    toggleQuickCreate,
} from "../../../module/ui/uiSlice";

import { Plus } from "lucide-react";
import Tooltip from "../../toolTip/Tooltip";

import QuickCreateMenu from "../../bars/Nav/QuickCreateMenu";

export default function QuickCreateButton() {
    const dispatch = useDispatch();
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (wrapperRef.current?.contains(e.target)) return;

            dispatch(closeQuickCreate());
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, [dispatch]);

    return (
        <div ref={wrapperRef} className="relative group">
            <button
                onClick={() => dispatch(toggleQuickCreate())}
                className="w-9 h-9 rounded bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white"
            >
                <Plus size={16} />
            </button>

            <Tooltip text="Quick Create" />
            <QuickCreateMenu />
        </div>
    );
}