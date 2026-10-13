import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
    closeSettingsMenu,
} from "../../../module/ui/uiSlice";

export default function SettingsMenu() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const settingsOpen = useSelector(
        (state) => state.ui.settingsOpen
    );

    useEffect(() => {
        if (!settingsOpen) {
            return;
        }

        // Normal page navigation
        navigate("/settings");

        // Close the settings menu state
        dispatch(closeSettingsMenu());
    }, [settingsOpen, navigate, dispatch]);

    // This is NOT a modal.
    // It does not render anything.
    return null;
}