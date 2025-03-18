
import { Link } from "react-router-dom";
import { AuthCard } from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import AnimatedContainer from "@/components/AnimatedContainer";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-apple-dark">
      <AnimatedContainer className="w-full max-w-md mb-6">
        <h1 className="text-4xl font-bold tracking-tight text-center mb-2">
          <span className="text-gradient">Loyde</span>
        </h1>
        <p className="text-slate-400 text-center">Set, track, and accomplish your goals</p>
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in" className="w-full max-w-md">
        <AuthCard 
          title="Sign in to your account" 
          description="Enter your email and password to access your goals"
          footer={
            <div className="text-center w-full">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary underline underline-offset-4 hover:text-primary/90">
                  Sign up
                </Link>
              </p>
            </div>
          }
        >
          <LoginForm />
        </AuthCard>
      </AnimatedContainer>
      
      <AnimatedContainer animation="fade-in-delayed" className="mt-8">
        <Button variant="ghost" asChild>
          <Link to="/">
            Continue as guest
          </Link>
        </Button>
      </AnimatedContainer>
    </div>
  );
}
