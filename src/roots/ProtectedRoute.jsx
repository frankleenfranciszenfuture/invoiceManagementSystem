import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    const {
        isAuthenticated,
        authChecking,
    } = useSelector((state) => state.auth);

    // Wait for backend authentication check
    if (authChecking) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="text-sm text-gray-500">
                    Checking authentication...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return children;
};

export default ProtectedRoute;