"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      username: username.trim().toLowerCase(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid username or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-elevation-3">
            <span className="text-3xl font-bold text-primary-500 font-heading">F</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-heading">Funsol CMS</h1>
          <p className="mt-1 text-primary-200 text-sm">Enterprise Content Management Portal</p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl bg-white p-8 shadow-elevation-4">
          <h2 className="mb-6 text-center text-xl font-bold text-gray-900 font-heading">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-semibold text-gray-700">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full h-11 text-base">
              Sign In
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-primary-300">
          &copy; {new Date().getFullYear()} Funsol. All rights reserved.
        </p>
      </div>
    </div>
  );
}
