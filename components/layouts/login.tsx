"use client";

import { authenticate } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Eye, EyeOff, Loader2, Lock, ShieldCheck, Terminal, User } from "lucide-react";
import { useState, useTransition } from "react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [nik, setNik] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleNikChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setNik(value);
    }
  };

  async function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await authenticate(formData);
      if (result?.error) {
        setErrorMessage(result.error);
      }
    });
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#f8fafc] overflow-hidden p-0 sm:p-4 md:p-8 dark:bg-slate-950 transition-colors duration-500">
      <Card className="grid w-full max-w-5xl grid-cols-1 overflow-hidden border-none shadow-none sm:shadow-[0_32px_64px_-15px_rgba(0,0,0,0.15)] md:grid-cols-2 min-h-screen sm:min-h-[650px] sm:rounded-3xl">
        
        <div className="flex flex-col justify-center bg-white p-8 sm:p-12 lg:p-20 dark:bg-slate-900">
          <div className="mb-10 animate-in fade-in slide-in-from-left duration-700">
            <div className="mb-3 flex items-center gap-2 text-[#1db495]">
              <div className="p-2 bg-[#1db495]/10 rounded-lg">
                <Terminal className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold tracking-[0.3em] uppercase opacity-80">Log Management</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white lg:text-5xl">
              Log Management
            </h1>
            <p className="mt-3 text-sm text-slate-500 font-medium">
              Login to Watch Log
            </p>
          </div>

          {/* Menampilkan Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold animate-in fade-in zoom-in duration-300">
              {errorMessage}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="space-y-5">
              <div className="grid gap-2.5">
                <Label htmlFor="nik" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Nomor Induk Karyawan (NIK)
                </Label>
                <div className="group relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1db495] transition-colors" />
                  <Input
                    id="nik"
                    name="nik" // Penting untuk Server Action
                    type="text"
                    inputMode="numeric"
                    placeholder="Contoh: 1234567890"
                    value={nik}
                    onChange={handleNikChange}
                    className="h-14 border-none bg-slate-100 pl-12 text-lg font-medium ring-offset-transparent focus-visible:ring-2 focus-visible:ring-[#1db495] dark:bg-slate-800 transition-all rounded-xl"
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] text-slate-400 font-medium italic opacity-70">Only Number</span>
                  <span className={`text-[10px] font-black tracking-widest ${nik.length === 10 ? 'text-[#1db495]' : 'text-slate-300'}`}>
                    {nik.length} / 10
                  </span>
                </div>
              </div>

              <div className="grid gap-2.5">
                <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Password ESS
                </Label>
                <div className="group relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1db495] transition-colors" />
                  <Input
                    id="password"
                    name="password" // Penting untuk Server Action
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-14 border-none bg-slate-100 pl-12 pr-12 text-lg focus-visible:ring-2 focus-visible:ring-[#1db495] dark:bg-slate-800 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1db495] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={nik.length !== 10 || isPending}
              className="group h-14 w-full bg-[#1db495] hover:bg-[#168a73] text-white text-lg font-bold transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(29,180,149,0.5)] active:scale-[0.98] rounded-xl"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Signin
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <a
              href="http://ess1.indomaret.lan/ESS/HomePortal/Login"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-slate-500 hover:text-[#1db495] hover:underline transition-all decoration-2 underline-offset-4"
            >
              Forgot password?
            </a>
          </div>

          <footer className="mt-auto pt-10 hidden sm:block">
            <Separator className="mb-6 opacity-50" />
            <div className="flex items-center justify-center gap-2 text-slate-300">
               <ShieldCheck className="h-3 w-3" />
               <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Created by: Indonesia Code Party</span>
            </div>
          </footer>
        </div>

        <div className="relative hidden flex-col justify-center bg-gradient-to-br from-[#1db495] via-[#24a589] to-[#2d9a82] p-12 text-white md:flex">
          <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:40px_40px]"></div>
          <div className="relative z-10 space-y-8 animate-in zoom-in duration-1000">
            <h2 className="text-5xl font-black leading-[1.1] tracking-tight">
              Control Your <br />
              <span className="text-emerald-200">System Logs.</span>
            </h2>
            <div className="h-2 w-24 rounded-full bg-white shadow-lg"></div>
            <p className="max-w-md text-xl leading-relaxed text-emerald-50/90 font-medium">
              Watch Your Activity inside Your Apps
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}