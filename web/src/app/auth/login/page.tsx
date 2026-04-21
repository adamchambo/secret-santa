import LoginForm from "@/src/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <div>
        <p>Don't have an account? <span>Create an Account</span></p>
      </div>
    </>
  )
}