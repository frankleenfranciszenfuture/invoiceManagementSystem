import { Settings } from "lucide-react";
import { useDispatch } from "react-redux";
import { toggleSettings } from "../../../module/ui/uiSlice";

import Tooltip from "../../toolTip/Tooltip";
import SettingsMenu from "../../bars/Nav/SettingsMenu";

export default function SettingsButton() {
    const dispatch = useDispatch();

    return (
        <div className="relative group">
            <button
                onClick={() => dispatch(toggleSettings())}
                className="w-9 h-9 rounded hover:bg-gray-100 flex items-center justify-center"
            >
                <Settings size={18} />
            </button>

            <Tooltip text="Settings" />

            <SettingsMenu />
        </div>
    );
}