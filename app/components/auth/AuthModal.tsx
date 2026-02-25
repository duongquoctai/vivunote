"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import PinInput from "./PinInput";

const AuthModal = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCompletePin = async (pin: string) => {
    if (!username.trim()) {
      setError("Vui lòng nhập tên người dùng");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        pin,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 w-full max-w-md mx-4 transition-all animate-in fade-in zoom-in duration-300">
        <div className="space-y-6">
          <div className="space-y-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block text-center">
              Mã PIN 6 số
            </label>
            <PinInput onComplete={handleCompletePin} disabled={loading} />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-center animate-pulse">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-8">
            <p>Nếu bạn là người mới, tài khoản sẽ tự động được tạo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
