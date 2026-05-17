import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="text-center text-text">
      <h1 className="mb-3 text-2xl font-bold">Reset password</h1>
      <p className="mx-auto mb-6 max-w-sm text-sm leading-6 text-text-muted">
        Password reset is not wired up yet.
      </p>
      <Link className="text-sm text-primary hover:underline" href="/login">
        Back to login
      </Link>
    </div>
  );
}
