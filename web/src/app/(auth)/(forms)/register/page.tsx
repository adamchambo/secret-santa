import RegisterForm from "@/src/features/auth/components/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
      <div>
        <RegisterForm />
        <div className="mx-auto mt-4 border-t border-border pt-4 text-center sm:mt-6 sm:pt-5">
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
