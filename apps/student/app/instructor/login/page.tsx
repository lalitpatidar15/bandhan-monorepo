"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { centralLoginUrl } from "@/lib/session";

export default function InstructorLogin() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--bhn-bg)] text-[var(--bhn-text)]">
            <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
                <div className="w-full max-w-[460px]">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/Group1.png"
                            alt="Bandhan Instructor Gateway"
                            width={433}
                            height={96}
                            className="h-10 w-auto rounded-lg bg-[var(--bhn-brand-900)] px-3 py-1.5"
                            priority
                        />
                    </div>

                    <div className="bhn-card bhn-card-pad-lg text-center">
                        <h1 className="text-[24px] font-serif font-semibold text-[var(--bhn-text)]">
                            Instructor sign-in has moved
                        </h1>

                        <p className="text-sm leading-6 text-[var(--bhn-text-soft)] mt-3">
                            Sign in through the central Bandhan portal with your instructor account.
                            This panel no longer collects passwords.
                        </p>

                        <a
                            href={centralLoginUrl()}
                            className="bhn-btn bhn-btn-primary bhn-btn-block mt-6 inline-flex items-center justify-center gap-2"
                        >
                            Continue to central sign-in
                            <ArrowRight size={16} />
                        </a>

                        <p className="text-xs text-[var(--bhn-text-muted)] mt-4 leading-5">
                            After signing in, return to the instructor panel to manage courses,
                            learners, analytics and earnings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
