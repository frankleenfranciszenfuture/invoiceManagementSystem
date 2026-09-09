import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";

import { toggleProfileMenu } from "../../../module/ui/uiSlice";

import Tooltip from "../../toolTip/Tooltip";
import ProfileMenu from "../../bars/Nav/ProfileMenu";

export default function ProfileButton() {
    const dispatch = useDispatch();

    const buttonRef = useRef(null);

    const user = useSelector((state) => state.auth.user);

    const initials = (name) =>
        name
            ?.split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "??";

    return (
        <div className="relative group">
            <button
                ref={buttonRef}
                onClick={() => dispatch(toggleProfileMenu())}
                className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center text-sm font-medium"
            >
                {initials(user?.name)}
            </button>

            <Tooltip text="Profile" />

            <ProfileMenu buttonRef={buttonRef} />
        </div>
    );
}