import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../auth/thunks/authThunks";
import { Link, useNavigate } from "react-router-dom";

import { assets } from "../../../assets/assets";

import toast from "react-hot-toast";
import AppLoader from "../../../common/loader/AppLoader";

/*
 * ASSETS NEEDED (add to ../../../assets/assets):
 *   assets.companyLogo -> optional company logo (shown in the round badge)
 */

// ------------------------------------------------------------
// Invoice-management background (pure SVG, no image asset needed)
// ------------------------------------------------------------
const InvoiceCard = ({ x, y, r = 0, s = 1, total = "12,450" }) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
        <rect width="240" height="310" rx="14" fill="#fff" fillOpacity="0.10" stroke="#bfdbfe" strokeOpacity="0.35" />
        <rect x="20" y="22" width="70" height="10" rx="3" fill="#93c5fd" fillOpacity="0.8" />
        <text x="20" y="60" fontSize="18" fontWeight="700" fill="#e0f2fe" fillOpacity="0.9">INVOICE</text>
        <text x="20" y="78" fontSize="9" fill="#bfdbfe" fillOpacity="0.8">No. INV-2026-0142</text>
        <rect x="20" y="96" width="200" height="1" fill="#bfdbfe" fillOpacity="0.35" />
        {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(20 ${112 + i * 34})`}>
                <rect width="90" height="7" rx="3" fill="#bfdbfe" fillOpacity="0.55" />
                <rect y="14" width="60" height="5" rx="2" fill="#bfdbfe" fillOpacity="0.3" />
                <rect x="150" width="50" height="7" rx="3" fill="#bfdbfe" fillOpacity="0.55" />
            </g>
        ))}
        <rect x="20" y="256" width="200" height="1" fill="#bfdbfe" fillOpacity="0.35" />
        <text x="20" y="284" fontSize="11" fill="#bfdbfe" fillOpacity="0.9">Total</text>
        <text x="220" y="285" fontSize="16" fontWeight="700" textAnchor="end" fill="#e0f2fe">{`₹ ${total}`}</text>
    </g>
);

const InvoiceBackground = () => (
    <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
    >
        <defs>
            <linearGradient id="invBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#0b1f5c" />
                <stop offset="0.55" stopColor="#1e40af" />
                <stop offset="1" stopColor="#0a1236" />
            </linearGradient>
            <radialGradient id="invGlow" cx="0.5" cy="0.5" r="0.6">
                <stop offset="0" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
            <pattern id="invGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M48 0H0V48" fill="none" stroke="#93c5fd" strokeOpacity="0.08" />
            </pattern>
        </defs>

        <rect width="1440" height="900" fill="url(#invBg)" />
        <rect width="1440" height="900" fill="url(#invGrid)" />
        <ellipse cx="720" cy="450" rx="620" ry="420" fill="url(#invGlow)" />

        {/* invoices */}
        <InvoiceCard x={90} y={90} r={-8} s={1.05} total="12,450" />
        <InvoiceCard x={40} y={500} r={6} s={0.85} total="4,980" />
        <InvoiceCard x={1110} y={70} r={7} s={0.95} total="27,300" />
        <InvoiceCard x={1130} y={480} r={-6} s={1} total="8,120" />

        {/* percent / tax badge */}
        <g transform="translate(980 60) rotate(8)">
            <rect width="64" height="64" rx="16" fill="#38bdf8" fillOpacity="0.85" />
            <text x="32" y="43" fontSize="32" fontWeight="700" textAnchor="middle" fill="#fff">%</text>
        </g>

        {/* paid check */}
        <g transform="translate(330 700)">
            <circle r="34" fill="#22c55e" fillOpacity="0.8" />
            <path d="M-14 0l9 10 19-20" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* coins */}
        <g transform="translate(250 840)" fill="#60a5fa" fillOpacity="0.55" stroke="#dbeafe" strokeOpacity="0.5">
            <ellipse rx="52" ry="14" />
            <ellipse cx="6" cy="-12" rx="52" ry="14" />
            <ellipse cx="0" cy="-24" rx="52" ry="14" />
        </g>

        {/* bar chart */}
        <g transform="translate(1000 760)" fill="#bfdbfe" fillOpacity="0.4">
            <rect x="0" y="-40" width="22" height="40" rx="4" />
            <rect x="34" y="-70" width="22" height="70" rx="4" />
            <rect x="68" y="-55" width="22" height="55" rx="4" />
            <rect x="102" y="-100" width="22" height="100" rx="4" fillOpacity="0.65" />
        </g>
    </svg>
);

const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="8" r="4.5" />
        <path d="M3.5 21c0-4.6 3.8-7.5 8.5-7.5s8.5 2.9 8.5 7.5z" />
    </svg>
);

const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7 10V7a5 5 0 0 1 10 0v3h1.5A1.5 1.5 0 0 1 20 11.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20.5v-9A1.5 1.5 0 0 1 5.5 10zm2 0h6V7a3 3 0 0 0-6 0z" />
    </svg>
);

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

    const [image, setImage] = useState(
        localStorage.getItem("logoImage") || null
    );

    // ============================================================
    // COMPANY LOGO + REMEMBERED ID
    // ============================================================

    useEffect(() => {
        const savedLogo = localStorage.getItem("companyLogo");

        if (savedLogo) {
            setImage(savedLogo);
        }

        try {
            const savedId = localStorage.getItem("rememberedLoginId");

            if (savedId) {
                setForm((prev) => ({ ...prev, email: savedId }));
                setRemember(true);
            }
        } catch {
            /* storage unavailable */
        }
    }, []);

    // ============================================================
    // LOGIN
    // ============================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (signingIn) {
            return;
        }

        setSigningIn(true);

        try {
            // Wait until loginUser is fully fulfilled so Redux auth
            // state is updated before navigating.
            const result = await dispatch(
                loginUser({
                    email: form.email.trim(),
                    password: form.password,
                })
            ).unwrap();

            console.log("LOGIN SUCCESS:", result);

            try {
                if (remember) {
                    localStorage.setItem("rememberedLoginId", form.email.trim());
                } else {
                    localStorage.removeItem("rememberedLoginId");
                }
            } catch {
                /* storage unavailable */
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

            // Only stop the loader when login fails.
            setSigningIn(false);
        }
    };

    // ============================================================
    // ERROR MESSAGE
    // ============================================================

    const errorMessage =
        typeof error === "string"
            ? error
            : error?.message || error?.error || null;

    // ============================================================
    // LOGIN LOADER
    // ============================================================

    if (signingIn) {
        return <AppLoader text="Signing you in..." />;
    }

    // ============================================================
    // UI
    // ============================================================

    const logoSrc = image || assets.companyLogo;

    const fieldRow =
        "flex items-center gap-3 bg-blue-100 rounded-lg px-4 " +
        "focus-within:ring-2 focus-within:ring-blue-400 transition";

    const inputClass =
        "flex-1 min-w-0 py-3 text-sm text-gray-500 bg-transparent" +
        "placeholder-slate-400 focus:outline-none";

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-blue-500">

            {/* ================================================== */}
            {/* INVOICE MANAGEMENT BACKGROUND */}
            {/* ================================================== */}

            {/* <InvoiceBackground /> */}

            <div className="absolute inset-0 bg-blue-950/30" />

            {/* ================================================== */}
            {/* CARD */}
            {/* ================================================== */}

            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">

                <div className="relative w-full max-w-4xl md:min-h-[500px] rounded-2xl overflow-hidden bg-white shadow-2xl shadow-blue-950/50">

                    {/* ---------- DECORATIVE SHAPES (desktop) ---------- */}

                    {/* big blue panel with rounded bulge */}
                    <div className="hidden md:block absolute inset-y-0 left-0 w-[58%] bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 rounded-r-[20%]" />

                    {/* bottom-left quarter circle */}
                    <div className="hidden md:block absolute -left-20 -bottom-24 w-64 h-64 rounded-full bg-blue-500/70" />

                    {/* sphere */}
                    <div className="hidden md:block absolute left-[26%] -bottom-6 w-44 h-44 rounded-full bg-gradient-to-br from-sky-400 via-blue-600 to-blue-700 shadow-xl shadow-blue-900/40" />

                    {/* bottom-right quarter circle */}

                    {/* ---------- MOBILE HEADER ---------- */}

                    <div className="md:hidden bg-gradient-to-br from-blue-500 to-blue-800 text-white px-6 py-6">
                        <p className="text-xl font-extrabold tracking-[0.15em]">WELCOME</p>
                        <p className="mt-1 text-xs font-semibold tracking-wider">INVOICE MANAGEMENT</p>
                    </div>

                    {/* ---------- WELCOME TEXT (desktop) ---------- */}

                    <div className="hidden md:block absolute left-[9%] top-[20%] w-[34%] text-white">

                        {logoSrc && (
                            <img
                                src={logoSrc}
                                alt="Company logo"
                                className="h-10 mb-5 object-contain"
                            />
                        )}

                        <h1 className="text-6xl font-extrabold tracking-[0.12em]">
                            WELCOME
                        </h1>

                        <p className="mt-5 text-2xl font-semiBold ">
                            INVOICE MANAGEMENT
                        </p>

                        <p className="mt-4 text-[11px] leading-relaxed text-blue-100">
                            Process or receive invoices, check the data for
                            accuracy, and complete the invoice processing
                            process.
                        </p>
                    </div>

                    {/* ---------- FORM ---------- */}

                    <div className="relative z-10 md:w-[42%] md:ml-auto px-8 sm:px-10 py-10 md:py-12">

                        <h1 className="text-4xl font-bold tracking-wide text-blue-500">
                            Sign in
                        </h1>

                        <p className="mt-2 text-[11px] text-slate-500">
                            Enter your details to access your workspace.
                        </p>

                        {/* ERROR */}

                        {errorMessage && (
                            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-6 space-y-3">

                            {/* ID / EMAIL */}

                            <div className={fieldRow}>
                                <span className="text-slate-800"><UserIcon /></span>

                                <label htmlFor="email" className="sr-only">
                                    User name
                                </label>

                                <input
                                    id="email"
                                    type="text"
                                    required
                                    autoComplete="username"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                    placeholder="User Name"
                                    className={inputClass}
                                />
                            </div>

                            {/* PASSWORD */}

                            <div className={fieldRow}>
                                <span className="text-slate-800"><LockIcon /></span>

                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({ ...form, password: e.target.value })
                                    }
                                    placeholder="Password"
                                    className={inputClass}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="text-[10px] font-bold tracking-wider text-slate-700 hover:text-blue-700 bg-transparent border-0 cursor-pointer p-0"
                                >
                                    {showPassword ? "HIDE" : "SHOW"}
                                </button>
                            </div>

                            {/* REMEMBER + FORGOT */}

                            <div className="flex items-center justify-between text-[11px] text-slate-500">

                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        className="h-3.5 w-3.5 accent-blue-800"
                                    />
                                    Remember me
                                </label>

                                <Link
                                    to="/reset-password"
                                    className="font-semibold text-blue-800 hover:text-blue-950 no-underline"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* SIGN IN */}

                            <button
                                type="submit"
                                disabled={loading || signingIn}
                                className="
                                    w-full py-3 rounded-md
                                    bg-blue-500 hover:bg-blue-600
                                    text-white text-sm font-semibold
                                    transition-colors disabled:opacity-60
                                "
                            >
                                {loading || signingIn ? "Signing in..." : "Sign in"}
                            </button>

                            {/* OR */}

                            <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                <span className="flex-1 h-px bg-slate-300" />
                                or
                                <span className="flex-1 h-px bg-slate-300" />
                            </div>

                            {/* SIGN IN WITH OTHER */}

                            <button
                                type="button"
                                onClick={() =>
                                    toast("Other sign-in options are not set up yet")
                                }
                                className="
                                    w-full py-3 rounded-md
                                    border-2 border-slate-700 bg-white
                                    text-slate-800 text-sm font-semibold
                                    hover:bg-slate-50 transition-colors
                                "
                            >
                                Sign in with other
                            </button>
                        </form>

                        {/* SIGN UP */}

                        <p className="mt-5 text-center text-[11px] text-slate-500">
                            Don't have an account?{" "}
                            {/* Change "/register" to your sign-up / request-account route */}
                            <Link
                                to="/register"
                                className="font-semibold text-blue-800 hover:text-blue-950 no-underline"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;




// import { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { loginUser } from "../../auth/thunks/authThunks";
// import { Link, useNavigate } from "react-router-dom";

// import { assets } from "../../../assets/assets";

// import toast from "react-hot-toast";
// import AppLoader from "../../../common/loader/AppLoader";




// const LoginPage = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const [form, setForm] = useState({
//         email: "",
//         password: "",
//     });

//     const [isCreateAccount, setIsCreateAccount] = useState(false);
//     const [signingIn, setSigningIn] = useState(false);

//     const {
//         loading,
//         error,
//     } = useSelector((state) => state.auth);

//     const [image, setImage] = useState(
//         localStorage.getItem("logoImage") || null
//     );

//     // ============================================================
//     // COMPANY LOGO
//     // ============================================================

//     useEffect(() => {
//         const savedLogo =
//             localStorage.getItem("companyLogo");

//         if (savedLogo) {
//             setImage(savedLogo);
//         }
//     }, []);

//     // ============================================================
//     // LOGIN
//     // ============================================================

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (signingIn) {
//             return;
//         }

//         setSigningIn(true);

//         try {
//             /*
//              * IMPORTANT:
//              *
//              * Wait until loginUser is completely fulfilled.
//              *
//              * This guarantees:
//              *
//              * login API
//              *     ↓
//              * authSlice fulfilled
//              *     ↓
//              * auth.user updated
//              *     ↓
//              * isAuthenticated = true
//              *     ↓
//              * navigate
//              */
//             const result = await dispatch(
//                 loginUser({
//                     email: form.email.trim(),
//                     password: form.password,
//                 })
//             ).unwrap();

//             console.log(
//                 "LOGIN SUCCESS:",
//                 result
//             );

//             /*
//              * At this point Redux authentication state has
//              * already been updated.
//              */
//             toast.success("Login successful");

//             navigate("/home", {
//                 replace: true,
//             });

//         } catch (err) {

//             console.error(
//                 "LOGIN ERROR:",
//                 err
//             );

//             const message =
//                 typeof err === "string"
//                     ? err
//                     : err?.message ||
//                     err?.error ||
//                     err?.data?.message ||
//                     "Login failed";

//             toast.error(message);

//             /*
//              * Only stop the loader when login fails.
//              */
//             setSigningIn(false);
//         }
//     };

//     // ============================================================
//     // ERROR MESSAGE
//     // ============================================================

//     const errorMessage =
//         typeof error === "string"
//             ? error
//             : error?.message ||
//             error?.error ||
//             null;

//     // ============================================================
//     // LOGIN LOADER
//     // ============================================================

//     if (signingIn) {
//         return (
//             <AppLoader
//                 text="Signing you in..."
//             />
//         );
//     }

//     const InvoiceBackground = () => (
//         <svg
//             className="absolute inset-0 w-full h-full opacity-20"
//             viewBox="0 0 1440 900"
//             preserveAspectRatio="xMidYMid slice"
//             aria-hidden="true"
//         >
//             <defs>
//                 <linearGradient id="invBg" x1="0" y1="0" x2="1" y2="1">
//                     <stop offset="0" stopColor="#0b1f5c" />
//                     <stop offset="0.55" stopColor="#1e40af" />
//                     <stop offset="1" stopColor="#0a1236" />
//                 </linearGradient>
//                 <radialGradient id="invGlow" cx="0.5" cy="0.5" r="0.6">
//                     <stop offset="0" stopColor="#38bdf8" stopOpacity="0.35" />
//                     <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
//                 </radialGradient>
//                 <pattern id="invGrid" width="48" height="48" patternUnits="userSpaceOnUse">
//                     <path d="M48 0H0V48" fill="none" stroke="#93c5fd" strokeOpacity="0.08" />
//                 </pattern>
//             </defs>

//             <rect width="1440" height="900" fill="url(#invBg)" />
//             <rect width="1440" height="900" fill="url(#invGrid)" />
//             <ellipse cx="720" cy="450" rx="620" ry="420" fill="url(#invGlow)" />

//             {/* invoices */}
//             <InvoiceCard x={90} y={90} r={-8} s={1.05} total="12,450" />
//             <InvoiceCard x={40} y={500} r={6} s={0.85} total="4,980" />
//             <InvoiceCard x={1110} y={70} r={7} s={0.95} total="27,300" />
//             <InvoiceCard x={1130} y={480} r={-6} s={1} total="8,120" />

//             {/* percent / tax badge */}
//             <g transform="translate(980 60) rotate(8)">
//                 <rect width="64" height="64" rx="16" fill="#38bdf8" fillOpacity="0.85" />
//                 <text x="32" y="43" fontSize="32" fontWeight="700" textAnchor="middle" fill="#fff">%</text>
//             </g>

//             {/* paid check */}
//             <g transform="translate(330 700)">
//                 <circle r="34" fill="#22c55e" fillOpacity="0.8" />
//                 <path d="M-14 0l9 10 19-20" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
//             </g>

//             {/* coins */}
//             <g transform="translate(250 840)" fill="#60a5fa" fillOpacity="0.55" stroke="#dbeafe" strokeOpacity="0.5">
//                 <ellipse rx="52" ry="14" />
//                 <ellipse cx="6" cy="-12" rx="52" ry="14" />
//                 <ellipse cx="0" cy="-24" rx="52" ry="14" />
//             </g>

//             {/* bar chart */}
//             <g transform="translate(1000 760)" fill="#bfdbfe" fillOpacity="0.4">
//                 <rect x="0" y="-40" width="22" height="40" rx="4" />
//                 <rect x="34" y="-70" width="22" height="70" rx="4" />
//                 <rect x="68" y="-55" width="22" height="55" rx="4" />
//                 <rect x="102" y="-100" width="22" height="100" rx="4" fillOpacity="0.65" />
//             </g>
//         </svg>
//     );

//     const InvoiceCard = ({ x, y, r = 0, s = 1, total = "12,450" }) => (
//         <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
//             <rect width="240" height="310" rx="14" fill="#fff" fillOpacity="0.10" stroke="#bfdbfe" strokeOpacity="0.35" />
//             <rect x="20" y="22" width="70" height="10" rx="3" fill="#93c5fd" fillOpacity="0.8" />
//             <text x="20" y="60" fontSize="18" fontWeight="700" fill="#e0f2fe" fillOpacity="0.9">INVOICE</text>
//             <text x="20" y="78" fontSize="9" fill="#bfdbfe" fillOpacity="0.8">No. INV-2026-0142</text>
//             <rect x="20" y="96" width="200" height="1" fill="#bfdbfe" fillOpacity="0.35" />
//             {[0, 1, 2, 3].map((i) => (
//                 <g key={i} transform={`translate(20 ${112 + i * 34})`}>
//                     <rect width="90" height="7" rx="3" fill="#bfdbfe" fillOpacity="0.55" />
//                     <rect y="14" width="60" height="5" rx="2" fill="#bfdbfe" fillOpacity="0.3" />
//                     <rect x="150" width="50" height="7" rx="3" fill="#bfdbfe" fillOpacity="0.55" />
//                 </g>
//             ))}
//             <rect x="20" y="256" width="200" height="1" fill="#bfdbfe" fillOpacity="0.35" />
//             <text x="20" y="284" fontSize="11" fill="#bfdbfe" fillOpacity="0.9">Total</text>
//             <text x="220" y="285" fontSize="16" fontWeight="700" textAnchor="end" fill="#e0f2fe">{`₹ ${total}`}</text>
//         </g>
//     );

//     // ============================================================
//     // UI
//     // ============================================================

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-900 to-indigo-100 flex flex-col items-center px-4 py-6">

//             <InvoiceBackground />
//             {/* ================================================== */}
//             {/* BRAND */}
//             {/* ================================================== */}

//             <Link
//                 to="/"
//                 className="flex items-center gap-3 no-underline"
//             >
//                 <img
//                     src={assets.zenfutureLogo}
//                     alt="ZenFuture"
//                     className="w-10 h-10 rounded-xl bg-slate-900 object-cover"
//                 />

//                 <div className="leading-tight">

//                     <div className="text-base font-semibold text-slate-900">
//                         ZenFuture
//                     </div>

//                     <div className="text-[10px] tracking-[0.2em] text-slate-500 uppercase">
//                         Invoice Management
//                     </div>

//                 </div>
//             </Link>

//             {/* ================================================== */}
//             {/* CARD */}
//             {/* ================================================== */}

//             <div
//                 className="
//                     mt-8
//                     w-full
//                     max-w-md
//                     bg-white/90
//                     backdrop-blur
//                     rounded-2xl
//                     shadow-lg
//                     shadow-slate-300/40
//                     border
//                     border-slate-200
//                     p-7
//                 "
//             >

//                 {/* TITLE */}

//                 <h1 className="text-2xl font-bold text-slate-900">
//                     {isCreateAccount
//                         ? "Create your account"
//                         : "Welcome back"}
//                 </h1>

//                 <p className="mt-1 text-sm text-slate-500">
//                     {isCreateAccount
//                         ? "Sign up to your workspace"
//                         : "Sign in to your workspace"}
//                 </p>

//                 {/* ================================================== */}
//                 {/* ERROR */}
//                 {/* ================================================== */}

//                 {errorMessage && (
//                     <div
//                         className="
//                             mt-4
//                             bg-red-50
//                             border
//                             border-red-200
//                             text-red-600
//                             text-sm
//                             rounded-xl
//                             px-4
//                             py-3
//                         "
//                     >
//                         {errorMessage}
//                     </div>
//                 )}

//                 {/* ================================================== */}
//                 {/* FORM */}
//                 {/* ================================================== */}

//                 <form
//                     onSubmit={handleSubmit}
//                     className="mt-6 space-y-4"
//                 >

//                     {/* EMAIL */}

//                     <div>

//                         <label
//                             htmlFor="email"
//                             className="
//                                 block
//                                 text-[11px]
//                                 font-medium
//                                 tracking-[0.15em]
//                                 text-slate-500
//                                 uppercase
//                                 mb-1.5
//                             "
//                         >
//                             Email
//                         </label>

//                         <input
//                             id="email"
//                             type="text"
//                             required
//                             value={form.email}
//                             onChange={(e) =>
//                                 setForm({
//                                     ...form,
//                                     email: e.target.value,
//                                 })
//                             }
//                             placeholder="admin@gmail.com"
//                             className="
//                                 w-full
//                                 px-4
//                                 py-3
//                                 text-sm
//                                 text-slate-900
//                                 bg-white
//                                 border
//                                 border-slate-200
//                                 rounded-xl
//                                 focus:outline-none
//                                 focus:ring-2
//                                 focus:ring-indigo-300
//                                 placeholder-slate-300
//                             "
//                         />

//                     </div>

//                     {/* PASSWORD */}

//                     <div>

//                         <label
//                             htmlFor="password"
//                             className="
//                                 block
//                                 text-[11px]
//                                 font-medium
//                                 tracking-[0.15em]
//                                 text-slate-500
//                                 uppercase
//                                 mb-1.5
//                             "
//                         >
//                             Password
//                         </label>

//                         <input
//                             id="password"
//                             type="password"
//                             required
//                             value={form.password}
//                             onChange={(e) =>
//                                 setForm({
//                                     ...form,
//                                     password: e.target.value,
//                                 })
//                             }
//                             placeholder="••••••••"
//                             className="
//                                 w-full
//                                 px-4
//                                 py-3
//                                 text-sm
//                                 text-slate-900
//                                 bg-white
//                                 border
//                                 border-slate-200
//                                 rounded-xl
//                                 focus:outline-none
//                                 focus:ring-2
//                                 focus:ring-indigo-300
//                                 placeholder-slate-300
//                             "
//                         />

//                     </div>

//                     {/* FORGOT PASSWORD */}

//                     <div className="flex justify-end">

//                         <Link
//                             to="/reset-password"
//                             className="
//                                 text-xs
//                                 text-indigo-500
//                                 hover:text-indigo-600
//                                 no-underline
//                             "
//                         >
//                             Forgot password?
//                         </Link>

//                     </div>

//                     {/* SUBMIT */}

//                     <button
//                         type="submit"
//                         disabled={loading || signingIn}
//                         className="
//                             w-full
//                             py-3
//                             rounded-xl
//                             bg-slate-900
//                             hover:bg-slate-800
//                             text-white
//                             text-sm
//                             font-semibold
//                             transition-colors
//                             disabled:opacity-60
//                         "
//                     >
//                         {loading || signingIn
//                             ? "Signing in..."
//                             : isCreateAccount
//                                 ? "Sign up"
//                                 : "Sign in"}
//                     </button>

//                 </form>

//                 {/* ================================================== */}
//                 {/* DEMO CREDENTIALS */}
//                 {/* ================================================== */}

//                 <div
//                     className="
//                         mt-5
//                         bg-slate-100
//                         rounded-xl
//                         px-4
//                         py-3
//                         text-xs
//                         text-slate-500
//                         leading-relaxed
//                     "
//                 >
//                     Demo:{" "}

//                     <span className="font-mono text-slate-800">
//                         admin / admin@123
//                     </span>

//                     {" "} (Admin) or{" "}

//                     <span className="font-mono text-slate-800">
//                         agent1 / agent@123
//                     </span>

//                     {" "} (Agent)
//                 </div>

//             </div>

//             {/* ================================================== */}
//             {/* FOOTER */}
//             {/* ================================================== */}

//             <p className="mt-6 text-sm text-slate-500">

//                 {isCreateAccount
//                     ? "Already have an account? "
//                     : "New here? "}

//                 <button
//                     type="button"
//                     onClick={() =>
//                         setIsCreateAccount(
//                             !isCreateAccount
//                         )
//                     }
//                     className="
//                         text-indigo-500
//                         hover:text-indigo-600
//                         bg-transparent
//                         border-0
//                         cursor-pointer
//                         p-0
//                     "
//                 >
//                     {isCreateAccount
//                         ? "Sign in"
//                         : "Request an account"}
//                 </button>

//             </p>

//         </div>
//     );
// };

// export default LoginPage;