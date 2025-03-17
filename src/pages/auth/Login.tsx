
import { Link } from "react-router-dom";
import { AuthForm, AuthFormValues } from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";
import AnimatedContainer from "@/components/AnimatedContainer";

const Login = () => {
  const { signIn } = useAuth();

  const handleSubmit = async (values: AuthFormValues) => {
    await signIn(values.email, values.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-dark px-4">
      <AnimatedContainer animation="fade-in" className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-lg rounded-xl border border-slate-800/50 p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-gradient">Welcome Back</span>
            </h1>
            <p className="text-slate-400 mt-2">Sign in to access your goals</p>
          </div>

          <AuthForm type="login" onSubmit={handleSubmit} />

          <div className="mt-6 text-center text-sm">
            <Link to="/auth/reset-password" className="text-slate-400 hover:text-emerald">
              Forgot your password?
            </Link>
            <div className="mt-4 text-slate-400">
              Don't have an account?{" "}
              <Link to="/auth/signup" className="text-emerald hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </AnimatedContainer>
    </div>
  );
};

export default Login;
