import { useState } from "react";
import { useNavigate } from "react-router";
import { login, setToken } from "../api";
import { Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      if (!data.token) throw new Error("No token received");
      setToken(data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#090838] to-[#1a1060]">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm"
        >
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0048ff] to-[#090838]">
              <Sparkles className="size-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Lumin Admin</h1>
            <p className="mt-1 text-sm text-white/50">Sign in to manage your app</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-white/70">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-[#0048ff] focus:outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-white/70">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/30" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-12 text-sm text-white placeholder-white/30 focus:border-[#0048ff] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full rounded-lg py-3 text-sm font-semibold text-white transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
