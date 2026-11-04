
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function useLeaveConfirmation() {
    const navigate = useNavigate();

    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const confirmLeave = useCallback((action) => {
        setPendingAction(() => action);
        setShowLeaveConfirmation(true);
    }, []);

    const handleStay = useCallback(() => {
        setShowLeaveConfirmation(false);
        setPendingAction(null);
    }, []);

    const handleLeave = useCallback(() => {
        const action = pendingAction;

        setShowLeaveConfirmation(false);
        setPendingAction(null);

        action?.();
    }, [pendingAction]);

    const leaveTo = useCallback((path) => {
        confirmLeave(() => navigate(path));
    }, [confirmLeave, navigate]);

    return {
        showLeaveConfirmation,
        confirmLeave,
        handleStay,
        handleLeave,
        leaveTo,
    };
}
