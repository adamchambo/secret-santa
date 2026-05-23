import LoginForm from "@/src/features/auth/components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      <LoginForm />
      <div className="mx-auto mt-6 border-t border-border pt-5 text-center">
        <p className="text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link className="font-bold text-primary hover:underline" href="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
