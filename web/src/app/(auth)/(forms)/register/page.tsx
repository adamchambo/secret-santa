import RegisterForm from "@/src/features/auth/components/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
      <div>
        <RegisterForm />
        <div className="mx-auto mt-6 border-t border-border pt-5 text-center">
          <p className="text-sm text-text-muted">
            Already have an account?{" "}
            <Link className="font-bold text-primary hover:underline" href="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
  )
}
