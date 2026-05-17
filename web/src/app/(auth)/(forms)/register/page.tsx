import RegisterForm from "@/src/features/auth/components/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
      <div className="text-text">
        <RegisterForm />
        <div className="mx-auto text-center mt-4">
          <p className="text-sm">
            Already have an account?{" "}
            <Link className="text-primary hover:underline" href="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
  )
}
