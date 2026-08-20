"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import AuthLayout from "@/components/Auth/Authlayout";
import { useSendOtpMutation, useVerifyOtpMutation, useResetPasswordMutation } from "@/store/api/authApi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Image from "next/image";

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null) return fallback;
  const payload = error as { data?: { message?: unknown } };
  return typeof payload.data?.message === "string" ? payload.data.message : fallback;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [sendOtp, { isLoading: sending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  const handleSendOtp = async () => {
    setError(null);
    if (!email.trim()) { setError("Enter your email"); return; }
    try {
      await sendOtp({ email: email.trim(), purpose: "password-reset" }).unwrap();
      setStep(2);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to send OTP"));
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    const code = otp.join("");
    if (code.length !== 6) { setError("Enter the 6-digit OTP"); return; }
    try {
      const result = await verifyOtp({ email: email.trim(), otp: code, purpose: "password-reset" }).unwrap();
      if (result.resetToken) setResetToken(result.resetToken);
      setStep(3);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Invalid OTP"));
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    if (!newPassword || newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    try {
      await resetPassword({ email: email.trim(), otp: otp.join(""), newPassword, resetToken }).unwrap();
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to reset password"));
    }
  };

  return (
    <AuthLayout image="/login.png" position="right" title="Reset your password" logo="/Group1.png">
      <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-md mx-auto flex flex-col gap-3">
        <Image src="/Group1.png" alt="Bandhan Events Hub" width={433} height={96} className="w-56 h-14 mx-auto object-contain brightness-0" priority />

        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold">Forgot Password</h1>
          <p className="text-gray-500 text-sm">
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Create a new password"}
          </p>
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="Enter your email" />
            </div>
            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            <Button onClick={handleSendOtp} disabled={sending} className="w-full py-2 bg-[#7A3F23] text-white rounded-md hover:opacity-90 transition disabled:opacity-70">
              {sending ? "Sending..." : "Send OTP"}
            </Button>
          </>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border border-[#D0D5DD] rounded-lg focus:border-[#7A3F23] focus:outline-none"
                />
              ))}
            </div>
            {error && <p className="text-sm text-red-600 font-medium text-center">{error}</p>}
            <Button onClick={handleVerifyOtp} disabled={verifying} className="w-full py-2 bg-[#7A3F23] text-white rounded-md hover:opacity-90 transition disabled:opacity-70">
              {verifying ? "Verifying..." : "Verify OTP"}
            </Button>
            <p className="text-sm text-center">
              <button type="button" onClick={handleSendOtp} className="text-[#7A3F23] hover:underline">Resend OTP</button>
            </p>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full h-[48px] rounded-lg border border-[#D0D5DD] px-4 pr-10 text-sm focus:border-[#7A3F23] focus:outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                  {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full h-[48px] rounded-lg border border-[#D0D5DD] px-4 text-sm focus:border-[#7A3F23] focus:outline-none" />
            </div>
            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            {success && <p className="text-sm text-green-600 font-medium">Password reset successfully! Redirecting...</p>}
            <Button onClick={handleResetPassword} disabled={resetting || success} className="w-full py-2 bg-[#7A3F23] text-white rounded-md hover:opacity-90 transition disabled:opacity-70">
              {resetting ? "Resetting..." : success ? "Done!" : "Reset Password"}
            </Button>
          </>
        )}

        <p className="text-sm text-center">
          Remember your password?{" "}
          <span className="text-[#7A3F23] cursor-pointer hover:underline" onClick={() => router.push("/login")}>Sign in</span>
        </p>
      </form>
    </AuthLayout>
  );
}
