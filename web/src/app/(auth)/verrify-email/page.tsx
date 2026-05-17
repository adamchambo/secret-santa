"use client";

import useEmailVerfication from "@/src/features/auth/hooks/use-verify-email";

export default function VerifyEmailPage() {
  useEmailVerfication();

  return (
    <div className="flex min-h-72 flex-col items-center justify-center text-center text-text">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
        ✉
      </div>
      <h1 className="mb-3 text-2xl font-bold">Verify your email</h1>
      <p className="mb-4 max-w-sm text-sm leading-6 text-text-muted">
        A verification link has been sent to your email address. Check your inbox and click the link to finish setting up your account.
      </p>
      <p className="max-w-sm text-sm text-text-muted">
        If it has not arrived, check your spam folder or{" "}
        <span className="text-primary cursor-pointer">resend the verification email</span>.
      </p>
    </div>
  )
}
