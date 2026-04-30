import RegisterForm from "@/src/features/auth/components/register-form";

export default function RegisterPage() {
  return (
      <div className="text-text">
        <RegisterForm />
        <div className="mx-auto text-center mt-4">
          <p className="text-sm">Already have an account? <span>Login</span></p>
        </div>
      </div>
  )
}