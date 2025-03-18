
import { Link } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import SignUpForm from "@/components/auth/SignUpForm";
import AnimatedContainer from "@/components/AnimatedContainer";

export default function SignUp() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-apple-dark">
      <AnimatedContainer className="w-full max-w-md mb-6">
        <h1 className="text-4xl font-bold tracking-tight text-center mb-2">
          <span className="text-gradient">John's App</span>
        </h1>
        <p className="text-slate-400 text-center">Set, track, and accomplish your goals</p>
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" className="w-full max-w-md">
        <AuthCard 
          title="Create an account" 
          description="Enter your details below to create your account"
          footer={
            <div className="text-center w-full">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary underline underline-offset-4 hover:text-primary/90">
                  Sign in
                </Link>
              </p>
            </div>
          }
        >
          <SignUpForm />
        </AuthCard>
      </AnimatedContainer>
    </div>
  );
}
