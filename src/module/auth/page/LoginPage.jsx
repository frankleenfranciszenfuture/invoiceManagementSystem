
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../auth/thunks/authThunks";
import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import AppLoader from "../../../common/loader/AppLoader";

/* ============================================================
   PROJECT PROGRESS ILLUSTRATION
============================================================ */

const ProjectIllustration = () => (
    <svg
        viewBox="0 0 500 330"
        className="w-full max-w-[390px] h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Background shadow */}
        <ellipse
            cx="250"
            cy="295"
            rx="170"
            ry="13"
            fill="#D9DFEC"
        />

        {/* Left checklist */}
        <g>
            <rect x="55" y="42" width="90" height="110" rx="9" fill="white" />

            {[0, 1, 2, 3].map((i) => (
                <g key={i} transform={`translate(66 ${54 + i * 23})`}>
                    <rect width="13" height="13" rx="3" fill="#3553F4" />
                    <path
                        d="M3 6.5L5.5 9L10 4"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <rect x="20" y="3" width="43" height="3" rx="1.5" fill="#C6CDDF" />
                    <rect x="20" y="9" width="30" height="2.5" rx="1.2" fill="#E1E5EF" />
                </g>
            ))}
        </g>

        {/* Main dashboard */}
        <g>
            <rect
                x="155"
                y="105"
                width="195"
                height="145"
                rx="13"
                fill="#252E4C"
            />

            <rect
                x="170"
                y="120"
                width="165"
                height="115"
                rx="7"
                fill="#303B61"
            />

            {/* Dashboard header */}
            <rect x="182" y="133" width="70" height="6" rx="3" fill="#B7C4ED" />
            <rect x="182" y="145" width="48" height="4" rx="2" fill="#7889C0" />

            {/* Pie chart */}
            <circle cx="211" cy="184" r="24" fill="#F4B73F" />
            <path
                d="M211 160 A24 24 0 0 1 235 184 L211 184 Z"
                fill="#3553F4"
            />
            <path
                d="M211 184 L211 160 A24 24 0 0 0 189 198 Z"
                fill="#F08C52"
            />
            <circle cx="211" cy="184" r="10" fill="#303B61" />

            {/* Bar chart */}
            <rect x="250" y="188" width="12" height="32" rx="3" fill="#F5B942" />
            <rect x="269" y="174" width="12" height="46" rx="3" fill="#5478FF" />
            <rect x="288" y="160" width="12" height="60" rx="3" fill="#F5B942" />
            <rect x="307" y="179" width="12" height="41" rx="3" fill="#5478FF" />
        </g>

        {/* Top analytics card */}
        <g>
            <rect x="210" y="20" width="115" height="70" rx="12" fill="white" />
            <rect x="225" y="33" width="84" height="45" rx="7" fill="#EDF1FA" />

            <circle cx="267" cy="55" r="18" fill="#F4B73F" />
            <path
                d="M267 37 A18 18 0 0 1 285 55 L267 55 Z"
                fill="#3553F4"
            />
            <path
                d="M267 55 L267 37 A18 18 0 0 0 249 55 Z"
                fill="#EF8B4D"
            />
        </g>

        {/* Plus icon */}
        <g stroke="#3553F4" strokeWidth="4" strokeLinecap="round">
            <path d="M390 37V59" />
            <path d="M379 48H401" />
        </g>

        {/* Rising graph */}
        <path
            d="M330 118L355 103L378 112L401 83L426 92"
            stroke="#F1B43E"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />

        {/* Floating chart card */}
        <g>
            <rect x="350" y="145" width="62" height="75" rx="9" fill="white" />
            <rect x="363" y="178" width="9" height="25" rx="3" fill="#3553F4" />
            <rect x="378" y="164" width="9" height="39" rx="3" fill="#F5B942" />
            <rect x="393" y="155" width="9" height="48" rx="3" fill="#3553F4" />
        </g>

        {/* Left floating coin */}
        <g transform="rotate(-25 105 222)">
            <rect x="67" y="204" width="65" height="43" rx="10" fill="#3553F4" />
            <ellipse cx="99" cy="204" rx="32" ry="10" fill="#5478FF" />
            <ellipse cx="99" cy="204" rx="17" ry="5" fill="#F6BE48" />
            <path d="M99 195V213" stroke="#F5B942" strokeWidth="3" />
        </g>

        {/* Right floating coin */}
        <g transform="rotate(18 425 236)">
            <rect x="398" y="213" width="55" height="39" rx="8" fill="#3553F4" />
            <ellipse cx="425" cy="213" rx="27" ry="9" fill="#5478FF" />
            <ellipse cx="425" cy="213" rx="14" ry="5" fill="#F5B942" />
        </g>

        {/* Decorative small stars */}
        <circle cx="145" cy="178" r="5" fill="#F5B942" />
        <circle cx="373" cy="65" r="5" fill="#F5B942" />
        <circle cx="155" cy="85" r="4" fill="#3553F4" />

        {/* Hand illustration - simplified */}
        <path
            d="M423 135C414 125 412 112 415 103C418 95 425 96 427 105L430 117L435 101C438 93 446 97 444 106L442 121L450 108C455 102 461 107 456 116L449 132L454 145L437 155L423 135Z"
            fill="#F5B28E"
        />
    </svg>
);

/* ============================================================
   LOGIN PAGE
============================================================ */

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [signingIn, setSigningIn] = useState(false);

    const { loading, error } = useSelector((state) => state.auth);

    /* ========================================================
       REMEMBERED LOGIN ID
    ======================================================== */

    useEffect(() => {
        try {
            const savedId = localStorage.getItem("rememberedLoginId");

            if (savedId) {
                setForm((prev) => ({
                    ...prev,
                    email: savedId,
                }));

                setRemember(true);
            }
        } catch {
            // Storage unavailable
        }
    }, []);

    /* ========================================================
       LOGIN
    ======================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (signingIn) return;

        setSigningIn(true);

        try {
            const result = await dispatch(
                loginUser({
                    email: form.email.trim(),
                    password: form.password,
                })
            ).unwrap();

            console.log("LOGIN SUCCESS:", result);

            try {
                if (remember) {
                    localStorage.setItem(
                        "rememberedLoginId",
                        form.email.trim()
                    );
                } else {
                    localStorage.removeItem("rememberedLoginId");
                }
            } catch {
                // Storage unavailable
            }

            toast.success("Login successful");

            navigate("/home", { replace: true });

        } catch (err) {
            console.error("LOGIN ERROR:", err);

            const message =
                typeof err === "string"
                    ? err
                    : err?.message ||
                    err?.error ||
                    err?.data?.message ||
                    "Login failed";

            toast.error(message);

            setSigningIn(false);
        }
    };

    /* ========================================================
       ERROR MESSAGE
    ======================================================== */

    const errorMessage =
        typeof error === "string"
            ? error
            : error?.message || error?.error || null;

    /* ========================================================
       LOADER
    ======================================================== */

    if (signingIn) {
        return <AppLoader text="Signing you in..." />;
    }

    /* ========================================================
       UI
    ======================================================== */

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#C9D8FF] flex items-center justify-center px-4 py-8">

            {/* ==================================================
                BACKGROUND
            ================================================== */}

            <div className="absolute top-0 left-0 w-full h-[50%] bg-[#354DEB]" />

            <div className="absolute bottom-0 left-0 w-full h-[50%] bg-[#C9D8FF]" />

            {/* ==================================================
                MAIN LOGIN CARD
            ================================================== */}

            <div className="
                relative z-10
                w-full
                max-w-[920px]
                min-h-[460px]
                bg-white
                rounded-[26px]
                overflow-hidden
                shadow-[0_25px_60px_rgba(38,55,110,0.18)]
                grid
                grid-cols-1
                md:grid-cols-2
            ">

                {/* ==================================================
                    LEFT SIDE - LOGIN FORM
                ================================================== */}

                <div className="
                    bg-white
                    flex
                    flex-col
                    justify-center
                    px-7
                    sm:px-12
                    md:px-14
                    py-10
                ">

                    <div className="w-full max-w-[340px] mx-auto">

                        {/* TITLE */}

                        <div className="text-center mb-8">

                            <h1 className="
                                text-3xl
                                font-bold
                                text-gray-900
                                tracking-tight
                            ">
                                Welcome to Login
                            </h1>
                            <span className="text-gray-500">Invoice Management System</span>
                        </div>

                        {/* ERROR */}

                        {errorMessage && (
                            <div className="
                                mb-4
                                px-3
                                py-2.5
                                bg-red-50
                                border border-red-200
                                text-red-600
                                text-xs
                                rounded-lg
                            ">
                                {errorMessage}
                            </div>
                        )}

                        {/* FORM */}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >

                            {/* USERNAME */}

                            <div>

                                <label
                                    htmlFor="email"
                                    className="
                                        block
                                        text-[11px]
                                        font-medium
                                        text-gray-500
                                        mb-1.5
                                    "
                                >
                                    Username or email
                                </label>

                                <input
                                    id="email"
                                    type="text"
                                    required
                                    autoComplete="username"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="Enter your username"
                                    className="
                                        w-full
                                        h-11
                                        px-4
                                        rounded-md
                                        bg-[#EEF0F5]
                                        border border-transparent
                                        text-sm
                                        text-gray-800
                                        placeholder:text-gray-400
                                        outline-none
                                        transition-all
                                        focus:bg-white
                                        focus:border-[#4056F4]
                                        focus:ring-2
                                        focus:ring-blue-100
                                    "
                                />

                            </div>

                            {/* PASSWORD */}

                            <div>

                                <div className="flex items-center justify-between mb-1.5">

                                    <label
                                        htmlFor="password"
                                        className="
                                            text-[11px]
                                            font-medium
                                            text-gray-500
                                        "
                                    >
                                        Password
                                    </label>

                                    <Link
                                        to="/reset-password"
                                        className="
                                            text-[10px]
                                            font-semibold
                                            text-[#4056F4]
                                            hover:text-blue-700
                                            no-underline
                                        "
                                    >
                                        Forgot password?
                                    </Link>

                                </div>

                                <div className="relative">

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoComplete="current-password"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                password: e.target.value,
                                            })
                                        }
                                        placeholder="Enter your password"
                                        className="
                                            w-full
                                            h-11
                                            px-4
                                            pr-12
                                            rounded-md
                                            bg-[#EEF0F5]
                                            border border-transparent
                                            text-sm
                                            text-gray-800
                                            placeholder:text-gray-400
                                            outline-none
                                            transition-all
                                            focus:bg-white
                                            focus:border-[#4056F4]
                                            focus:ring-2
                                            focus:ring-blue-100
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                        className="
                                            absolute
                                            right-3
                                            top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                            hover:text-[#4056F4]
                                            bg-transparent
                                            border-0
                                            cursor-pointer
                                        "
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <svg
                                                width="17"
                                                height="17"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M3 3l18 18" />
                                                <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                                                <path d="M9.9 5.2A11 11 0 0112 5c5 0 9 4 10 7-0.4 1.2-1.3 2.5-2.5 3.5" />
                                                <path d="M6.2 6.2C3.8 7.5 2.4 9.5 2 12c1 3 5 7 10 7 1 0 2-.2 2.9-.5" />
                                            </svg>
                                        ) : (
                                            <svg
                                                width="17"
                                                height="17"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>

                                </div>

                            </div>

                            {/* REMEMBER ME */}

                            <div className="
                                flex
                                items-center
                                justify-between
                                pt-1
                            ">

                                <label className="
                                    flex
                                    items-center
                                    gap-2
                                    text-[11px]
                                    text-gray-500
                                    cursor-pointer
                                    select-none
                                ">

                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) =>
                                            setRemember(e.target.checked)
                                        }
                                        className="
                                            w-3.5
                                            h-3.5
                                            accent-[#4056F4]
                                            cursor-pointer
                                        "
                                    />

                                    Remember me

                                </label>

                            </div>

                            {/* LOGIN BUTTON */}

                            <button
                                type="submit"
                                disabled={loading || signingIn}
                                className="
                                    w-full
                                    h-11
                                    mt-2
                                    rounded-md
                                    bg-[#354DEB]
                                    hover:bg-[#263ED0]
                                    text-white
                                    text-sm
                                    font-semibold
                                    shadow-sm
                                    transition-all
                                    duration-200
                                    active:scale-[0.98]
                                    disabled:opacity-60
                                    disabled:cursor-not-allowed
                                "
                            >
                                {loading || signingIn
                                    ? "Logging in..."
                                    : "Login"}
                            </button>

                        </form>

                        {/* SIGN UP */}



                    </div>

                </div>

                {/* ==================================================
                    RIGHT SIDE - PROJECT ILLUSTRATION
                ================================================== */}

                <div className="
                    bg-[#EEF0F7]
                    flex
                    flex-col
                    items-center
                    justify-center
                    px-6
                    py-10
                    md:px-8
                    relative
                    overflow-hidden
                ">

                    {/* DECORATIVE BACKGROUND */}

                    <div className="
                        absolute
                        top-[-80px]
                        right-[-70px]
                        w-52
                        h-52
                        rounded-full
                        bg-blue-100/60
                        blur-3xl
                    " />

                    <div className="
                        absolute
                        bottom-[-80px]
                        left-[-70px]
                        w-52
                        h-52
                        rounded-full
                        bg-indigo-100/70
                        blur-3xl
                    " />

                    {/* ILLUSTRATION */}

                    <div className="relative z-10 w-full flex justify-center">

                        <ProjectIllustration />

                    </div>

                    {/* CONTENT */}

                    <div className="
                        relative
                        z-10
                        text-center
                        max-w-[310px]
                        mt-2
                    ">

                        <h2 className="
                            text-xl
                            font-semibold
                            text-gray-900
                            tracking-tight
                        ">
                            Check Your Project Progress
                        </h2>

                        <p className="
                            mt-3
                            text-[11px]
                            leading-[1.8]
                            text-gray-500
                        ">
                            Manage your invoices, track your business
                            performance, and monitor your financial
                            progress with ease.
                        </p>

                    </div>

                    {/* SLIDER INDICATORS */}

                    <div className="
                        relative
                        z-10
                        flex
                        items-center
                        justify-center
                        gap-1.5
                        mt-7
                    ">

                        <span className="
                            w-9
                            h-[3px]
                            rounded-full
                            bg-[#354DEB]
                        " />

                        <span className="
                            w-6
                            h-[3px]
                            rounded-full
                            bg-blue-300
                        " />

                        <span className="
                            w-6
                            h-[3px]
                            rounded-full
                            bg-blue-300
                        " />

                    </div>

                </div>

            </div>

        </div>
    );
};

export default LoginPage;
