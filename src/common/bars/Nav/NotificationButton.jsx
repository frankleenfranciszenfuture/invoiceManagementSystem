import { Bell } from "lucide-react";
import { useDispatch } from "react-redux";
import { toggleNotifications } from "../../../module/ui/uiSlice";

import Tooltip from "../../toolTip/Tooltip";
import NotificationMenu from "../../bars/Nav/NotificationMenu";

export default function NotificationButton() {
    const dispatch = useDispatch();

    return (
        <div className="relative group">
            <button
                onClick={() => dispatch(toggleNotifications())}
                className="w-9 h-9 rounded hover:bg-gray-100 flex items-center justify-center"
            >
                <Bell size={18} />
            </button>

            <Tooltip text="Notifications" />

            <NotificationMenu />
        </div>
    );
}