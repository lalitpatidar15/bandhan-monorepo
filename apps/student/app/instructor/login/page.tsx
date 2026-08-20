"use client";

import { Suspense, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useInstructorLoginMutation, useInstructorRegisterMutation } from "@/app/redux/instructor-services/authApi";
import { setAcademySession } from "@/lib/session";

function InstructorAuthContent() {
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState("login");
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [registerData, setRegisterData] = useState({ fullName: "", email: "", password: "" });

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tabParam = searchParams?.get("tab");
        if (tabParam === "register" || tabParam === "login") {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const [instructorLogin, { isLoading: loginLoading, isError: loginError }] = useInstructorLoginMutation();
    const [instructorRegister, { isLoading: registerLoading, isError: registerError }] = useInstructorRegisterMutation();

    const handleLogin = async () => {
        try {
            if (!loginData.email || !loginData.password) {
                alert("Please fill in all fields");
                return;
            }

            const response: any = await instructorLogin(loginData).unwrap();

            if (response.success && response.token) {
                const role = response.role === "student" ? "student" : "instructor";
                setAcademySession(response.token, role);
                localStorage.setItem(role === "instructor" ? "instructor" : "user", JSON.stringify(response.instructor || response.user));
                const next = searchParams.get("next");
                router.replace(next && next.startsWith(role === "instructor" ? "/instructor/" : "/student/") && !next.startsWith("//") ? next : role === "instructor" ? "/instructor/dashboard" : "/student/courses");
                return;
            }

            throw new Error("Login response did not include an authentication token");
        } catch (error: any) {
            console.error("Login error:", error);
            alert(error?.data?.message || error?.message || "Login failed. Please try again.");
        }
    };

    const handleRegister = async () => {
        try {
            if (!registerData.fullName || !registerData.email || !registerData.password) {
                alert("Please fill in all fields");
                return;
            }

            const { password } = registerData;
            if (password.length < 8) {
                alert("Password must be at least 8 characters.");
                return;
            }
            if (!/[A-Z]/.test(password)) {
                alert("Password must contain at least 1 uppercase letter.");
                return;
            }
            if (!/[a-z]/.test(password)) {
                alert("Password must contain at least 1 lowercase letter.");
                return;
            }
            if (!/\d/.test(password)) {
                alert("Password must contain at least 1 number.");
                return;
            }

            const response: any = await instructorRegister(registerData).unwrap();

            if (response.success && response.token && response.instructor) {
                setAcademySession(response.token, "instructor");
                localStorage.setItem("instructor", JSON.stringify(response.instructor));
                router.replace("/instructor/profile");
                return;
            }

            throw new Error("Registration response did not include an authentication token");
        } catch (error: any) {
            console.error("Register error:", error);
            alert(error?.data?.message || error?.message || "Registration failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bhn-bg)] text-[var(--bhn-text)]">

            {/* MAIN SECTION */}
            <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">

                <div className="w-full max-w-[440px]">

                    {/* LOGO */}
                    <div className="flex justify-center mb-6">
                        <span className="bhn-logo">
                            <span className="bhn-logo-mark">B</span>
                            <span>
                                <span className="bhn-logo-text">Bandhan</span>
                                <span className="bhn-logo-text-sub">Instructor Gateway</span>
                            </span>
                        </span>
                    </div>

                    <div className="bhn-card bhn-card-pad-lg">

                        {/* TABS */}
                        <div className="bhn-tabs border-b border-[var(--bhn-border)] mb-6 text-sm">

                            <button
                                onClick={() => setActiveTab("login")}
                                className={`bhn-tab bhn-tab-line flex-1 justify-center ${activeTab === "login" ? "bhn-tab-active" : ""}`}
                            >
                                Login
                            </button>

                            <button
                                onClick={() => setActiveTab("register")}
                                className={`bhn-tab bhn-tab-line flex-1 justify-center ${activeTab === "register" ? "bhn-tab-active" : ""}`}
                            >
                                Register
                            </button>

                        </div>

                        {/* LOGIN FORM */}
                        {activeTab === "login" && (
                            <div className="space-y-5">

                                <div className="bhn-field">
                                    <label className="bhn-field-label">Email Address</label>

                                    <input
                                        type="email"
                                        placeholder="instructor@bandhan.edu"
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                        className="bhn-input"
                                    />
                                </div>

                                <div className="bhn-field">

                                    <div className="flex justify-between items-center">
                                        <label className="bhn-field-label">Password</label>

                                        <span
                                            onClick={() => alert("Password reset link will be sent to your registered email.")}
                                            className="text-[var(--bhn-brand-700)] text-xs cursor-pointer hover:underline"
                                        >
                                            Forgot password?
                                        </span>
                                    </div>

                                    <div className="relative bhn-field">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="********"
                                            value={loginData.password}
                                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            className="bhn-input"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--bhn-text-muted)] hover:text-[var(--bhn-brand-700)]"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogin}
                                    disabled={loginLoading}
                                    className="bhn-btn bhn-btn-primary bhn-btn-block"
                                >
                                    {loginLoading ? "Logging in..." : "Continue"}
                                </button>

                                {loginError && (
                                    <p className="text-[var(--bhn-error-600)] text-sm">
                                        Login failed. Please check your credentials.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* REGISTER FORM */}
                        {activeTab === "register" && (
                            <div className="space-y-5">

                                <div className="bhn-field">
                                    <label className="bhn-field-label">Full Name</label>

                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={registerData.fullName}
                                        onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                                        className="bhn-input"
                                    />
                                </div>

                                <div className="bhn-field">
                                    <label className="bhn-field-label">Email Address</label>

                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                        className="bhn-input"
                                    />
                                </div>

                                <div className="bhn-field">
                                    <label className="bhn-field-label">Password</label>

                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="********"
                                            value={registerData.password}
                                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                            className="bhn-input pr-12"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--bhn-text-muted)] hover:text-[var(--bhn-brand-700)]"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleRegister}
                                    disabled={registerLoading}
                                    className="bhn-btn bhn-btn-primary bhn-btn-block"
                                >
                                    {registerLoading ? "Creating Account..." : "Create Account"}
                                </button>

                                {registerError && (
                                    <p className="text-[var(--bhn-error-600)] text-sm">
                                        Registration failed. Please try again.
                                    </p>
                                )}

                            </div>
                        )}

                        {/* COMMON PART */}
                        <div className="mt-6">

                            <div className="flex items-center gap-3 text-xs text-[var(--bhn-text-soft)]">
                                <div className="flex-1 h-[1px] bg-[var(--bhn-border)]" />

                                OR USE

                                <div className="flex-1 h-[1px] bg-[var(--bhn-border)]" />
                            </div>

                            <button
                                onClick={() => alert("Google Sign-In will be available soon.")}
                                className="bhn-btn bhn-btn-secondary bhn-btn-block mt-4">

                                <img
                                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                                    className="w-5 h-5"
                                    alt="google"
                                />

                                Continue with Google

                            </button>

                            <p className="text-center text-sm text-[var(--bhn-text-muted)] mt-4 leading-6">
                                Want to become an instructor?{" "}
                                <span
                                    onClick={() => setActiveTab("register")}
                                    className="text-[var(--bhn-brand-700)] cursor-pointer font-medium hover:underline"
                                >
                                    Join Now
                                </span>
                            </p>

                        </div>

                    </div>

                    {/* FOOTER */}
                    <div className="mt-8 text-center text-sm text-[var(--bhn-text-muted)]">

                        <span onClick={() => window.open("https://bandhan.com/privacy", "_blank")} className="cursor-pointer hover:text-[var(--bhn-text)]">
                            Privacy Policy
                        </span>

                        <span className="mx-3">•</span>

                        <span onClick={() => window.open("https://bandhan.com/terms", "_blank")} className="cursor-pointer hover:text-[var(--bhn-text)]">
                            Terms of Service
                        </span>

                        <span className="mx-3">•</span>

                        <span onClick={() => window.open("mailto:support@bandhan.com", "_blank")} className="cursor-pointer hover:text-[var(--bhn-text)]">
                            Contact
                        </span>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default function InstructorAuth() {
    return <Suspense fallback={<div className="min-h-screen bg-[var(--bhn-bg)]" />}><InstructorAuthContent /></Suspense>;
}
