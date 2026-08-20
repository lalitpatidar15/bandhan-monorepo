"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface AuthCardProps {
  tab: "login" | "signup";
  onTabChange: (tab: "login" | "signup") => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  subtitle?: string;
  showGoogleButton?: boolean;
}

export function AuthCard({
  tab,
  onTabChange,
  onSubmit,
  isLoading = false,
  subtitle = "Welcome back",
  showGoogleButton = true,
}: AuthCardProps) {
  return (
    <Card className="p-12 rounded-4xl border-none shadow-lg max-w-lg">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#2D1F16] mb-2">Job Seeker</h1>
        <p className="text-[#6B5C52]">{subtitle}</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 mb-4 border-b border-[#E8D7CB]">
        <Button
          variant={tab === "login" ? "primary" : "ghost"}
          onClick={() => onTabChange("login")}
          className="font-medium"
        >
          Login
        </Button>
        <Button
          variant={tab === "signup" ? "primary" : "ghost"}
          onClick={() => onTabChange("signup")}
          className="font-medium"
        >
          Sign Up
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        {tab === "signup" && (
          <Input
            label="Full Name"
            placeholder="Full Name"
            className="border border-[#E8D7CB] rounded-lg"
          />
        )}

        <Input
          label="Email"
          type="email"
          placeholder="Email"
          className="border border-[#E8D7CB] rounded-lg"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Password"
          className="border border-[#E8D7CB] rounded-lg"
        />

        {tab === "login" && (
          <div className="text-right">
            <Link href="/jobposter/forgot-password" className="text-[#6B3E2B] hover:underline text-sm">
              Forgot password?
            </Link>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#6B3E2B] hover:bg-[#5A342C] text-white py-3 rounded-lg font-medium"
        >
          {isLoading ? "Loading..." : tab === "login" ? "Login" : "Sign Up"}
        </Button>
      </form>

      {showGoogleButton && (
        <>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#E8D7CB]"></div>
            <span className="text-[#9B8B7E] text-sm">Or continue with</span>
            <div className="flex-1 h-px bg-[#E8D7CB]"></div>
          </div>

          <button type="button" className="w-full border border-[#E8D7CB] rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-[#FAF7F4] transition">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z"
                fill="#4285F4"
              />
              <path
                d="M18 12.5H12v2.5h3.5c-.3 1.5-1.5 2.5-3.5 2.5-2.2 0-4-1.8-4-4s1.8-4 4-4c1 0 2 .4 2.7 1.1l2-2C14.5 5.5 13.3 5 12 5c-3.9 0-7 3.1-7 7s3.1 7 7 7c3.5 0 6.5-2.5 7-6v-1.5z"
                fill="#fff"
              />
            </svg>
            Google
          </button>
        </>
      )}

      {tab === "signup" && (
        <p className="text-center text-sm text-[#9B8B7E] mt-6">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => onTabChange("login")}
            className="text-[#6B3E2B] font-medium hover:underline"
          >
            Login
          </button>
        </p>
      )}
    </Card>
  );
}
