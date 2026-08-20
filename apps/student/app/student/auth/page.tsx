"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import Input from "@/components/form/Input";
import PasswordInput from "@/components/form/PasswordInput";
import Button from "@/components/common/Button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useLoginMutation, useRegisterMutation } from "@/app/redux/services/authApi";
import { setAcademySession } from "@/lib/session";

export default function AuthPage() {
    const [tab, setTab] = useState<"login" | "signup">("login");
    const [showPassword, setShowPassword] = useState(false);
    
    // Login state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [login, { isLoading: loginLoading }] = useLoginMutation();
    
    // Signup state
    const [fullName, setFullName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupError, setSignupError] = useState("");
    const [signupSuccess, setSignupSuccess] = useState("");
    const [register, { isLoading: signupLoading }] = useRegisterMutation();
    
    const router = useRouter();

    const handleLogin = async () => {
        setLoginError("");

        if (!email || !password) {
            const msg = "Please enter email and password.";
            setLoginError(msg);
            toast.error(msg);
            return;
        }

        try {
            const result: any = await login({ email, password }).unwrap();
            
            const token = result?.token;
            const student = result?.student || result?.user;
            const role = result?.role === "instructor" ? "instructor" : "student";
            
            if (!token || !student) {
                const msg = "The server did not return a valid student session.";
                setLoginError(msg);
                toast.error(msg);
                return;
            }

            setAcademySession(token, role);
            toast.success("Login successful!");
            
            if (student) {
                localStorage.setItem("user", JSON.stringify(student));
                
                const studentId = student?._id || student?.id || student?.studentId;
                if (studentId) {
                    localStorage.setItem("studentId", studentId);
                }
            }

            const next = new URLSearchParams(window.location.search).get("next");
            router.replace(next?.startsWith(role === "instructor" ? "/instructor/" : "/student/") ? next : role === "instructor" ? "/instructor/dashboard" : "/student/courses");
        } catch (err: any) {
            let errorMsg = "Login failed. Please try again.";
            
            if (err?.data?.message) {
                errorMsg = err.data.message;
            } else if (err?.data?.error) {
                errorMsg = err.data.error;
            } else if (err?.message) {
                errorMsg = err.message;
            } else if (err?.error) {
                errorMsg = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
            } else if (err?.statusText === 'Fetch error') {
                errorMsg = "Network error: Unable to connect to server. Make sure the backend is running.";
            } else if (Object.keys(err || {}).length === 0) {
                errorMsg = "Network error: No response from server. Please check your connection and try again.";
            }
            
            setLoginError(errorMsg);
            toast.error(errorMsg);
        }
    };

    const handleSignup = async () => {
        setSignupError("");
        setSignupSuccess("");

        if (!fullName || !signupEmail || !signupPassword) {
            const msg = "Please fill in all fields.";
            setSignupError(msg);
            toast.error(msg);
            return;
        }

        if (signupPassword.length < 8) {
            const msg = "Password must be at least 8 characters.";
            setSignupError(msg);
            toast.error(msg);
            return;
        }
        if (!/[A-Z]/.test(signupPassword)) {
            const msg = "Password must contain at least 1 uppercase letter.";
            setSignupError(msg);
            toast.error(msg);
            return;
        }
        if (!/[a-z]/.test(signupPassword)) {
            const msg = "Password must contain at least 1 lowercase letter.";
            setSignupError(msg);
            toast.error(msg);
            return;
        }
        if (!/\d/.test(signupPassword)) {
            const msg = "Password must contain at least 1 number.";
            setSignupError(msg);
            toast.error(msg);
            return;
        }

        try {
            await register({ 
                fullName, 
                email: signupEmail, 
                password: signupPassword 
            }).unwrap();
            toast.success("Account created successfully! Please log in.");
            setSignupSuccess("Account created successfully! Please log in.");
            setTimeout(() => {
                setTab("login");
                setEmail(signupEmail);
                setPassword("");
                setFullName("");
                setSignupEmail("");
                setSignupPassword("");
                setSignupSuccess("");
            }, 2000);
        } catch (err: any) {
            console.error("Signup error details:", err);
            
            let errorMsg = "Registration failed. Please try again.";
            
            if (err?.data?.message) {
                errorMsg = err.data.message;
            } else if (err?.data?.error) {
                errorMsg = err.data.error;
            } else if (err?.message) {
                errorMsg = err.message;
            } else if (err?.error) {
                errorMsg = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
            } else if (err?.statusText === 'Fetch error') {
                errorMsg = "Network error: Unable to connect to server. Make sure the backend is running.";
            } else if (Object.keys(err || {}).length === 0) {
                errorMsg = "Network error: No response from server. Please check your connection and try again.";
            }
            
            setSignupError(errorMsg);
            toast.error(errorMsg);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bhn-bg)] text-[var(--bhn-text)]">

            {/* MAIN */}
            <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">

                <div className="w-full max-w-[440px]">

                    {/* LOGO */}
                    <div className="flex justify-center mb-6">
                        <Image src="/Group1.png" alt="Bandhan Learning Academy" width={433} height={96} className="h-10 w-auto brightness-0" priority />
                    </div>

                    <div className="bhn-card bhn-card-pad-lg">

                        {/* Tabs */}
                        <div className="bhn-tabs border-b border-[var(--bhn-border)] mb-6">

                            <button
                                onClick={() => setTab("login")}
                                className={`bhn-tab bhn-tab-line flex-1 justify-center ${tab === "login" ? "bhn-tab-active" : ""}`}
                            >
                                SIGN IN
                            </button>

                            <button
                                onClick={() => setTab("signup")}
                                className={`bhn-tab bhn-tab-line flex-1 justify-center ${tab === "signup" ? "bhn-tab-active" : ""}`}
                            >
                                SIGN UP
                            </button>

                        </div>

                        {/* LOGIN */}
                        {tab === "login" && (
                            <div className="flex flex-col gap-5">

                                <Input
                                    label="Email Address"
                                    placeholder="annie@example.com"
                                    value={email}
                                    onChange={setEmail}
                                />

                                <PasswordInput
                                    label="Password"
                                    placeholder="********"
                                    value={password}
                                    onChange={setPassword}
                                />

                                {loginError ? (
                                    <p className="text-sm text-[var(--bhn-error-600)] text-center">
                                        {loginError}
                                    </p>
                                ) : null}

                                <Button
                                    onClick={handleLogin}
                                    disabled={loginLoading}
                                    className="w-full"
                                >
                                    {loginLoading ? "Signing in..." : "Continue"}
                                </Button>

                                {/* Divider */}
                                <div className="flex items-center gap-2 text-sm text-[var(--bhn-text-soft)]">

                                    <div className="flex-1 h-px bg-[var(--bhn-border)]" />

                                    OR

                                    <div className="flex-1 h-px bg-[var(--bhn-border)]" />

                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => alert("Google Sign-In will be available soon.")}
                                    className="h-12 w-full"
                                >
                                    <FcGoogle size={20} />

                                    Continue with Google
                                </Button>

                                <p className="text-sm text-center text-[var(--bhn-text-muted)]">

                                    Don’t have an account?{" "}

                                    <span
                                        onClick={() => setTab("signup")}
                                        className="text-[var(--bhn-brand-700)] cursor-pointer font-medium"
                                    >
                                        Sign up
                                    </span>

                                </p>

                                <p className="text-sm text-center -mt-3">
                                    Want to teach on Bandhan?{" "}
                                    <a href="/instructor/login" className="text-[var(--bhn-brand-700)] font-semibold hover:underline">
                                        Become an Instructor
                                    </a>
                                </p>

                            </div>
                        )}

                        {/* SIGNUP */}
                        {tab === "signup" && (
                            <div className="space-y-5">

                                <Input
                                    label="Full Name"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={setFullName}
                                />

                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={signupEmail}
                                    onChange={setSignupEmail}
                                />

                                <PasswordInput
                                    label="Password"
                                    placeholder="********"
                                    value={signupPassword}
                                    onChange={setSignupPassword}
                                />

                                {signupError ? (
                                    <p className="text-sm text-[var(--bhn-error-600)] text-center">
                                        {signupError}
                                    </p>
                                ) : null}

                                {signupSuccess ? (
                                    <p className="text-sm text-[var(--bhn-success-600)] text-center">
                                        {signupSuccess}
                                    </p>
                                ) : null}

                                <Button
                                    onClick={handleSignup}
                                    disabled={signupLoading}
                                    className="w-full"
                                >
                                    {signupLoading ? "Creating Account..." : "Create Account"}
                                </Button>

                                <p className="text-sm text-center text-[var(--bhn-text-muted)]">
                                    Already have an account?{" "}

                                    <span
                                        onClick={() => setTab("login")}
                                        className="text-[var(--bhn-brand-700)] cursor-pointer font-medium"
                                    >
                                        Sign in
                                    </span>

                                </p>

                            </div>
                        )}

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
