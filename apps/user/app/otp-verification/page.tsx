'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyOtpMutation, useSendOtpMutation } from '@/store/api/authApi';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AuthLayout from '@/components/Auth/Authlayout';

export default function OtpVerificationPage() {
  const router = useRouter();
  const params = useSearchParams();
  const mobile = params.get('mobile') || '';
  const purpose = params.get('purpose') || 'signup';
  const email = params.get('email') || '';

  const [otp, setOtp] = useState('');
  const [verify, { isLoading, error }] = useVerifyOtpMutation();
  const [resend] = useSendOtpMutation();
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    try {
      await verify({
        mobile: mobile || undefined,
        email: email || undefined,
        otp,
        purpose,
      }).unwrap();
      setSuccess(true);
      setTimeout(() => {
        if (purpose === 'reset') router.replace('/login?verified=1');
        else router.replace('/location');
      }, 800);
    } catch {
      /* error shown below */
    }
  };

  const resendOtp = () => {
    resend({
      mobile: mobile || undefined,
      email: email || undefined,
      purpose,
    });
  };

  return (
    <AuthLayout image="/login.png" position="right" title="Verify it's you" logo="/Group1.png">
      <div className="w-full max-w-sm">
        <h2 className="text-xl font-bold text-[#1C1A16]">OTP Verification</h2>
        <p className="mt-1 text-sm text-gray-500">
          We sent a code to {mobile || email || 'your number'}.
        </p>

        <div className="mt-5 space-y-3">
          <Input
            label="Enter OTP"
            placeholder="6-digit code"
            value={otp}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
          />
          {error && (
            <p className="text-xs text-red-500">Invalid or expired OTP. Please try again.</p>
          )}
          <Button variant="primary" fullWidth onClick={submit} loading={isLoading}>
            Verify OTP
          </Button>
          <button onClick={resendOtp} className="w-full text-center text-xs text-[#924C2B] hover:underline">
            Resend OTP
          </button>
          {success && <p className="text-center text-sm text-green-600">Verified successfully!</p>}
        </div>
      </div>
    </AuthLayout>
  );
}
