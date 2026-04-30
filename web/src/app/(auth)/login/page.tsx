import LoginForm from "@/src/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="text-text">
      <LoginForm />
      <div className="mx-auto text-center mt-4">
        <p className="text-sm">Don't have an account? <span>Create an Account</span></p>
      </div>
    </div>
  )
}