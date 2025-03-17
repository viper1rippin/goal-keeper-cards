
import { Link } from "react-router-dom";
import { AuthForm, AuthFormValues } from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";
import AnimatedContainer from "@/components/AnimatedContainer";

const ResetPassword = () => {
  const { resetPassword } = useAuth();

  const handleSubmit = async (values: AuthFormValues) => {
    await resetPassword(values.email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-dark px-4">
      <AnimatedContainer animation="fade-in" className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-lg rounded-xl border border-slate-800/50 p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-gradient">Reset Password</span>
            </h1>
            <p className="text-slate-400 mt-2">Enter your email to reset your password</p>
          </div>

          <AuthForm type="reset" onSubmit={handleSubmit} />

          <div className="mt-6 text-center text-sm">
            <Link to="/auth/login" className="text-emerald hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default ResetPassword;
