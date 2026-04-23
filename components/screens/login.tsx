"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AtSign, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
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
    <div className="min-h-screen flex dark bg-[#0a0a0f]">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-12">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#12100a] to-[#1a1408]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(201,168,76,0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(201,168,76,0.07)_0%,transparent_50%)]" />

        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Corner ornament */}
        <div className="absolute top-8 right-8 w-32 h-32 border border-primary/20 rounded-full" />
        <div className="absolute top-12 right-12 w-20 h-20 border border-primary/10 rounded-full" />
        <div className="absolute bottom-24 left-8 w-48 h-48 border border-primary/10 rounded-full" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
              <Sparkles className="size-5 text-primary" />
            </div>
            <span className="text-primary font-bold text-sm uppercase tracking-[0.3em]">Evan&apos;s Couture</span>
          </div>
        </div>

        {/* Centre content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="mb-4">
            <div className="gold-divider mb-8 w-16" />
            <h1 className="text-5xl xl:text-6xl font-display font-extrabold leading-[1.1] text-[#f0ece4]">
              Crafted for<br />
              <span className="shimmer-text">Excellence.</span>
            </h1>
            <p className="mt-6 text-[#6b6250] text-base leading-relaxed max-w-xs">
              Manage your boutique operations with precision. Point of sale, inventory, and reporting — all in one place.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-8">
            {['Inventory Control', 'Live Sales', 'Staff Reports', 'Paystack Payments'].map(f => (
              <span key={f} className="px-3 py-1.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <div className="gold-divider mb-6" />
          <p className="text-[#3a3020] text-xs uppercase tracking-[0.25em] font-semibold">
            Secure · Reliable · Premium
          </p>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,168,76,0.06)_0%,transparent_70%)]" />

        <div className="relative z-10 w-full max-w-[420px] animate-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Sparkles className="size-5 text-primary" />
            </div>
            <span className="text-primary font-bold uppercase tracking-[0.25em] text-sm">Evan&apos;s Couture</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-[#f0ece4] text-3xl font-display font-bold mb-2">Welcome back</h2>
            <p className="text-[#6b6250] text-sm">Sign in to access your terminal</p>
          </div>

          {/* Card */}
          <div className="bg-[#13131e] border border-[#252535] rounded-2xl p-8 shadow-xl">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-[#6b6250]">
                  Email Address
                </Label>
                <div className="relative group">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a4030] group-focus-within:text-primary transition-colors" />
                  <Input
                    id="username"
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="name@evanscouture.com"
                    className="pl-10 h-12 bg-[#0a0a0f] border-[#252535] rounded-xl text-[#f0ece4] placeholder:text-[#3a3028] focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-[#6b6250]">
                    Password
                  </Label>
                  <a href="#" className="text-xs text-primary/70 hover:text-primary font-semibold transition-colors">
                    Forgot?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a4030] group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-12 bg-[#0a0a0f] border-[#252535] rounded-xl text-[#f0ece4] placeholder:text-[#3a3028] focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
                  <div className="size-2 bg-destructive rounded-full shrink-0" />
                  <p className="text-xs font-semibold text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-all group mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Access Terminal
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-[10px] uppercase tracking-[0.25em] font-bold text-[#2a2018]">
            Evan&apos;s Couture POS · Secure Session
          </p>
        </div>
      </div>
    </div>
  );
}
