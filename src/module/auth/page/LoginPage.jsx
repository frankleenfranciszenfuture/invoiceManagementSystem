import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../auth/slice/authSlice";
import { Link, useNavigate } from "react-router-dom";

import { assets } from "../../../assets/assets";

import toast from "react-hot-toast";
import AppLoader from "../../../common/loader/AppLoader";

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [isCreateAccount, setIsCreateAccount] = useState(false);
    const [signingIn, setSigningIn] = useState(false);

    const {
        user,
        loading,
        error,
        isAuthenticated,
    } = useSelector((state) => state.auth);

    const [image, setImage] = useState(
        localStorage.getItem("logoImage") || null
    );

    // ============================================================
    // COMPANY LOGO
    // ============================================================

    useEffect(() => {
        const savedLogo =
            localStorage.getItem("companyLogo");

        if (savedLogo) {
            setImage(savedLogo);
        }
    }, []);

    // ============================================================
    // LOGIN
    // ============================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSigningIn(true);

        try {

            await dispatch(
                loginUser({
                    email: form.email,
                    password: form.password,
                })
            ).unwrap();

            toast.success("Login successful");

        } catch (err) {

            setSigningIn(false);

            // ----------------------------------------------
            // SAFE ERROR MESSAGE
            // ----------------------------------------------

            const message =
                typeof err === "string"
                    ? err
                    : err?.message ||
                    err?.error ||
                    "Login failed";

            toast.error(message);
        }
    };

    // ============================================================
    // AUTHENTICATED → DASHBOARD
    // ============================================================

    useEffect(() => {

        if (isAuthenticated) {
            navigate("/home", {
                replace: true,
            });
        }

    }, [isAuthenticated, navigate]);

    // ============================================================
    // ERROR MESSAGE
    // ============================================================

    const errorMessage =
        typeof error === "string"
            ? error
            : error?.message ||
            error?.error ||
            null;

    // ============================================================
    // LOGIN LOADER
    // ============================================================

    if (signingIn) {
        return (
            <AppLoader
                text="Signing you in..."
            />
        );
    }

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-100 flex flex-col items-center px-4 py-6">

            {/* ================================================== */}
            {/* BRAND */}
            {/* ================================================== */}

            <Link
                to="/"
                className="flex items-center gap-3 no-underline"
            >
                <img
                    src={assets.zenfutureLogo}
                    alt="ZenFuture"
                    className="w-10 h-10 rounded-xl bg-slate-900 object-cover"
                />

                <div className="leading-tight">

                    <div className="text-base font-semibold text-slate-900">
                        ZenFuture
                    </div>

                    <div className="text-[10px] tracking-[0.2em] text-slate-500 uppercase">
                        Invoice Management
                    </div>

                </div>
            </Link>

            {/* ================================================== */}
            {/* CARD */}
            {/* ================================================== */}

            <div
                className="
                    mt-8
                    w-full
                    max-w-md
                    bg-white/90
                    backdrop-blur
                    rounded-2xl
                    shadow-lg
                    shadow-slate-300/40
                    border
                    border-slate-200
                    p-7
                "
            >

                {/* TITLE */}

                <h1 className="text-2xl font-bold text-slate-900">
                    {isCreateAccount
                        ? "Create your account"
                        : "Welcome back"}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    {isCreateAccount
                        ? "Sign up to your workspace"
                        : "Sign in to your workspace"}
                </p>

                {/* ================================================== */}
                {/* ERROR */}
                {/* ================================================== */}

                {errorMessage && (
                    <div
                        className="
                            mt-4
                            bg-red-50
                            border
                            border-red-200
                            text-red-600
                            text-sm
                            rounded-xl
                            px-4
                            py-3
                        "
                    >
                        {errorMessage}
                    </div>
                )}

                {/* ================================================== */}
                {/* FORM */}
                {/* ================================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-4"
                >

                    {/* EMAIL */}

                    <div>

                        <label
                            htmlFor="email"
                            className="
                                block
                                text-[11px]
                                font-medium
                                tracking-[0.15em]
                                text-slate-500
                                uppercase
                                mb-1.5
                            "
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="text"
                            required
                            value={form.email}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    email: e.target.value,
                                })
                            }
                            placeholder="admin@gmail.com"
                            className="
                                w-full
                                px-4
                                py-3
                                text-sm
                                text-slate-900
                                bg-white
                                border
                                border-slate-200
                                rounded-xl
                                focus:outline-none
                                focus:ring-2
                                focus:ring-indigo-300
                                placeholder-slate-300
                            "
                        />

                    </div>

                    {/* PASSWORD */}

                    <div>

                        <label
                            htmlFor="password"
                            className="
                                block
                                text-[11px]
                                font-medium
                                tracking-[0.15em]
                                text-slate-500
                                uppercase
                                mb-1.5
                            "
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            required
                            value={form.password}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    password: e.target.value,
                                })
                            }
                            placeholder="••••••••"
                            className="
                                w-full
                                px-4
                                py-3
                                text-sm
                                text-slate-900
                                bg-white
                                border
                                border-slate-200
                                rounded-xl
                                focus:outline-none
                                focus:ring-2
                                focus:ring-indigo-300
                                placeholder-slate-300
                            "
                        />

                    </div>

                    {/* FORGOT PASSWORD */}

                    <div className="flex justify-end">

                        <Link
                            to="/reset-password"
                            className="
                                text-xs
                                text-indigo-500
                                hover:text-indigo-600
                                no-underline
                            "
                        >
                            Forgot password?
                        </Link>

                    </div>

                    {/* SUBMIT */}

                    <button
                        type="submit"
                        disabled={loading || signingIn}
                        className="
                            w-full
                            py-3
                            rounded-xl
                            bg-slate-900
                            hover:bg-slate-800
                            text-white
                            text-sm
                            font-semibold
                            transition-colors
                            disabled:opacity-60
                        "
                    >
                        {loading || signingIn
                            ? "Signing in..."
                            : isCreateAccount
                                ? "Sign up"
                                : "Sign in"}
                    </button>

                </form>

                {/* ================================================== */}
                {/* DEMO CREDENTIALS */}
                {/* ================================================== */}

                <div
                    className="
                        mt-5
                        bg-slate-100
                        rounded-xl
                        px-4
                        py-3
                        text-xs
                        text-slate-500
                        leading-relaxed
                    "
                >
                    Demo:{" "}

                    <span className="font-mono text-slate-800">
                        admin / admin@123
                    </span>

                    {" "} (Admin) or{" "}

                    <span className="font-mono text-slate-800">
                        agent1 / agent@123
                    </span>

                    {" "} (Agent)
                </div>

            </div>

            {/* ================================================== */}
            {/* FOOTER */}
            {/* ================================================== */}

            <p className="mt-6 text-sm text-slate-500">

                {isCreateAccount
                    ? "Already have an account? "
                    : "New here? "}

                <button
                    type="button"
                    onClick={() =>
                        setIsCreateAccount(
                            !isCreateAccount
                        )
                    }
                    className="
                        text-indigo-500
                        hover:text-indigo-600
                        bg-transparent
                        border-0
                        cursor-pointer
                        p-0
                    "
                >
                    {isCreateAccount
                        ? "Sign in"
                        : "Request an account"}
                </button>

            </p>

        </div>
    );
};

export default LoginPage;