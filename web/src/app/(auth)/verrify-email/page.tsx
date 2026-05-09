export default function VerifyEmailPage() {
  return (
    <div className="text-text">
      <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
      <p className="mb-4">A verification link has been sent to your email address. Please check your inbox and click the link to verify your account.</p>
      <p>If you haven&apos;t received the email, please check your spam folder or <span className="text-primary cursor-pointer">resend the verification email</span>.</p>
    </div>
  )
}