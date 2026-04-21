import RegisterForm from "@/src/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <>
      <RegisterForm />
      <div>
        <p>Don't have an account? <span>Create an Account</span></p>
      </div>
    </>
  )
}