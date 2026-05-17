import LoginForm from "@/src/features/auth/components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="text-text">
      <LoginForm />
      <div className="mx-auto text-center mt-4">
        <p className="text-sm">
          Don&apos;t have an account?{" "}
          <Link className="text-primary hover:underline" href="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
