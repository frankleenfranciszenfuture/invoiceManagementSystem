import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../auth/slice/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../../../assets/assets";
import {
    History,
    Search,
    ChevronDown,
    Plus,
    Bell,
    Settings,
} from "lucide-react";

import toast from "react-hot-toast";
import AppLoader from "../../../common/loader/AppLoader";

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [form, setForm] = useState({ email: "", password: "" });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isCreateAccount, setIsCreateAccount] = useState(false);
    const [signingIn, setSigningIn] = useState(false);

    const { user, loading, error, isAuthenticated } = useSelector(
        (state) => state.auth,
    );

    const [image, setImage] = useState(localStorage.getItem("logoImage") || null);

    useEffect(() => {
        const savedLogo = localStorage.getItem("companyLogo");
        if (savedLogo) {
            setImage(savedLogo);
        }
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = () => {
                setImage(reader.result);
                localStorage.setItem("companyLogo", reader.result);
            };

            reader.readAsDataURL(file);
        }
    };

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
            toast.error(err || "Login failed");
        }
    };


    useEffect(() => {
        if (isAuthenticated) {
            navigate("/home", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const openFilePicker = () => {
        document.getElementById("logo-upload").click();
    };


    if (signingIn) {
        return <AppLoader text="Signing you in..." />;
    }


    return (

        <div
            className="relative min-h-screen bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${assets.bg2})` }}
        >
            <div className="absolute inset-0 bg-blue/30"></div>

            <div className="relative z-10 flex items-center justify-left min-h-screen px-60 py-30">
                {/* Login Card */}

                <div className="absolute top-5 left-[30px] right-[30px] flex items-center justify-between">
                    {/* Left Side */}
                    <Link to="/" className="flex items-center gap-2 no-underline">
                        <img
                            src={assets.zenfutureLogo}
                            alt="zf"
                            className="
          w-10 h-10
          rounded-xl
          bg-gradient-to-br
          from-cyan-600
          to-indigo-500
          flex items-center justify-center
          overflow-hidden
          cursor-pointer"
                        />

                        <span className="text-xs font-bold text-white">
                            ZenFuture Technologies
                        </span>
                    </Link>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 text-sm text-white hover:bg-white/10 px-2 py-1.5 rounded">
                            {user?.orgName}
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <button className="w-8 h-8 rounded bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white">
                            <Plus className="w-4 h-4" />
                        </button>

                        <button className="text-white hover:text-gray-300">
                            <Bell className="w-[18px] h-[18px]" />
                        </button>

                        <button className="text-white hover:text-gray-300">
                            <Settings className="w-[18px] h-[18px]" />
                        </button>

                        <button
                            type="submit"
                            disabled={signingIn}
                            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-60"
                        >
                            {signingIn ? "Signing in..." : "Login"}
                        </button>
                    </div>
                </div>

                <div
                    className="bg-cover bg-center relative overflow-hidden rounded-2xl border border-gray-400 p-10 max-w-lg w-full
shadow-[0_0_20px_rgba(99,102,241,0.5),0_0_40px_rgba(168,85,247,0.4)]"
                >
                    {/* Logo */}
                    <div className="flex justify-center mb-3 ">
                        <div
                            onClick={openFilePicker}
                            className="
          w-25 h-25
          rounded-3xl
          bg-gradient-to-br
          from-cyan-400
          to-indigo-500
          flex items-center justify-center
          overflow-hidden
          cursor-pointer
        
        "
                        >
                            {image ? (
                                <img
                                    src={image}
                                    alt="Logo"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                </svg>
                            )}
                        </div>
                    </div>

                    <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />

                    <h1 className="text-center text-3xl font-bold text-gray-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                        Welcome to ZenFuture
                    </h1>
                    {isCreateAccount ? (
                        <p className="text-center text-sm text-gray-400 mt-2 mb-6">
                            Create Account to continue to Invoice Management
                        </p>
                    ) : (
                        <p className="text-center text-sm text-gray-400 mt-2 mb-6">
                            Login to continue to Invoice Management
                        </p>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                                Email
                            </label>
                            <input
                                type="text"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="admin@gmail.com"
                                className="w-full px-4 py-2.5 text-sm text-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 text-sm text-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-300"
                            />
                        </div>

                        <div className="flex justify-between mb-4">
                            <Link
                                to="/reset-password"
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                Forget password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-60"
                        >
                            {loading
                                ? "Signing in..."
                                : isCreateAccount
                                    ? "Sign Up"
                                    : "Login"}
                        </button>
                    </form>

                    <div className="mt-6 bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                        <p className="font-semibold text-gray-600 mb-1">
                            Default credentials:
                        </p>
                        <p>
                            Admin:{" "}
                            <span className="font-mono text-gray-700">admin / admin@123</span>
                        </p>
                        <p>
                            Agent:{" "}
                            <span className="font-mono text-gray-700">
                                agent1 / agent@123
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
