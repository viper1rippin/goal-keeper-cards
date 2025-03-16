
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AnimatedContainer from "@/components/AnimatedContainer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setIsSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for a password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was an error sending the reset link.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-dark p-4">
      <AnimatedContainer animation="scale-in" className="w-full max-w-md">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gradient">Reset password</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          {!isSubmitted ? (
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-500 hover:bg-emerald-600" 
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
                <p className="text-center text-sm text-slate-400">
                  Remember your password?{" "}
                  <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
                    Back to login
                  </Link>
                </p>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4">
              <div className="p-6 text-center">
                <p className="text-slate-200 mb-4">
                  Check your email for a password reset link.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="mt-2 border-emerald-500/20 text-emerald-400 hover:text-emerald-300">
                    Back to login
                  </Button>
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </AnimatedContainer>
    </div>
  );
};

export default ForgotPassword;
