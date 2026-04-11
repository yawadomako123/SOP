"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Lock, AtSign, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: username,
          password,
        }),
      });

      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
      
      <div className="w-full max-w-[440px] relative z-10 animate-in">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-primary to-indigo-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center justify-center w-20 h-20 bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent" />
              <ShoppingCart className="w-10 h-10 text-primary relative z-10" />
            </div>
          </div>
          <h1 className="mt-8 mb-2 font-display text-4xl lg:text-5xl font-extrabold tracking-tight bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            SOP Platform
          </h1>
          <p className="text-muted-foreground font-medium tracking-wide border-b border-border/50 pb-2">
            Secure Management Access
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass shadow-2xl border-white/20 dark:border-white/10 backdrop-blur-2xl">
          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-2xl font-bold">Authentication</CardTitle>
            <CardDescription className="text-sm font-medium">
              Enter your credentials to access the terminal
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Email Address
                </Label>
                <div className="relative group">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="username"
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="name@company.com"
                    className="pl-10 h-12 bg-background/50 border-border/50 rounded-xl focus:bg-background transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Security Key
                  </Label>
                  <a href="#" className="text-xs text-primary font-bold hover:underline">Forgot?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-12 bg-background/50 border-border/50 rounded-xl focus:bg-background transition-all"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
                  <div className="size-2 bg-destructive rounded-full" />
                  <p className="text-xs font-semibold text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl text-md font-bold group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Access Terminal <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3" /> Encrypted Connection
          </div>
          <div className="w-1 h-1 bg-border rounded-full" />
          <div>System v4.0.2</div>
        </div>
      </div>
    </div>
  );
}
