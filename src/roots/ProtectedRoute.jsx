import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    const {
        isAuthenticated,
        authChecking,
    } = useSelector((state) => state.auth);

    /*
     * ============================================================
     * WAIT FOR AUTHENTICATION CHECK
     * ============================================================
     *
     * When the application is opened directly on a protected
     * route, checkAuthentication() runs from AppContent.
     *
     * Until that request finishes, do not redirect to login.
     */

    if (authChecking) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="text-sm text-gray-500">
                    Checking authentication...
                </div>
            </div>
        );
    }

    /*
     * ============================================================
     * NOT AUTHENTICATED
     * ============================================================
     */

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location,
                }}
            />
        );
    }

    /*
     * ============================================================
     * AUTHENTICATED
     * ============================================================
     */

    return children;
};

export default ProtectedRoute;