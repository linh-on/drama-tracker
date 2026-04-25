"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/auth/resend-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend");
        return;
      }

      setResendSuccess(true);
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center mb-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4a5a5] to-[#c8a2c8] flex items-center justify-center mb-4 shadow-md">
          <span className="text-white text-2xl">📧</span>
        </div>
        <h1 className="text-2xl tracking-tight">Check Your Email</h1>
        <p className="text-gray-400 text-sm mt-1 text-center">
          We sent a 6-digit code to
          <br />
          <span className="text-gray-600 font-medium">{email}</span>
        </p>
      </div>

      {success ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-2xl mb-2">✅</p>
          <p className="text-gray-600">Email verified!</p>
          <p className="text-gray-400 text-sm mt-1">
            You can now sign in. Redirecting to login...
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center tracking-[0.5em] text-lg focus:outline-none focus:border-[#d4a5a5] transition-colors"
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter the 6-digit code from your email
            </p>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          {resendSuccess && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-500 text-sm text-center"
            >
              ✅ New code sent! Check your email.
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || pin.length !== 6}
            className="w-full py-3 bg-[#d4a5a5] text-white rounded-xl hover:bg-[#c89595] transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-[#d4a5a5] hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e6e8] to-[#e8d5f0] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md"
      >
        <Suspense
          fallback={<p className="text-center text-gray-400">Loading...</p>}
        >
          <VerifyForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
