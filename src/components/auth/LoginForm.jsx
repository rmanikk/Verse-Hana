import AuthLayout from "./AuthLayout";

function LoginForm() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your VerseHana journey."
    >
      <p className="text-center text-gray-400">
        Login form will go here.
      </p>
    </AuthLayout>
  );
}

export default LoginForm;