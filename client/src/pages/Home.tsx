import { useUser, useLogin, useRegister } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight } from "lucide-react";

// Schemas for forms
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 chars"),
  password: z.string().min(6, "Password must be at least 6 chars"),
  role: z.enum(["user", "admin"]).default("user"),
});

export default function Home() {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);

  if (isLoading) return null;
  
  if (user) {
    if (user.role === 'admin') setLocation("/admin/dashboard");
    else setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        {/* Left Side: Branding */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="font-display font-bold text-5xl text-slate-900 leading-tight">
            Join the <span className="text-primary">Schools Division</span> Workforce
          </h1>
          <p className="text-lg text-slate-600 max-w-md leading-relaxed">
            The modern, streamlined application tracking system for educational professionals. Apply for positions, track your status, and grow your career.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Transparent
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Efficient
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              Merit-based
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-slate-500 mt-1">
              {isLogin ? "Enter your credentials to access your account." : "Start your application journey today."}
            </p>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? "Register now" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const login = useLogin();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => login.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} className="h-11 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} className="h-11 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={login.isPending}
          className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all mt-2"
        >
          {login.isPending ? "Signing in..." : "Sign In"}
          {!login.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </form>
    </Form>
  );
}

function RegisterForm() {
  const register = useRegister();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", role: "user" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => register.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Choose a username" {...field} className="h-11 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Create a password" {...field} className="h-11 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Role selection hidden or explicit - for demo we allow selecting */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role (For Demo Purpose)</FormLabel>
              <FormControl>
                <select {...field} className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm">
                  <option value="user">Applicant</option>
                  <option value="admin">Secretariat/Admin</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={register.isPending}
          className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all mt-2"
        >
          {register.isPending ? "Creating account..." : "Create Account"}
          {!register.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </form>
    </Form>
  );
}
