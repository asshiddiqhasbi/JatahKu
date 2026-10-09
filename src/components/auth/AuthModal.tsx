import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        if (data.session) {
          setSuccessMsg('Akun berhasil dibuat dan langsung masuk!');
          setTimeout(() => {
            onClose();
            onAuthSuccess?.();
          }, 800);
        } else {
          setSuccessMsg('Pendaftaran berhasil! Silakan periksa email kamu jika ada verifikasi, lalu masuk.');
          setIsRegister(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        setSuccessMsg('Berhasil masuk! Menyinkronkan data...');
        setTimeout(() => {
          onClose();
          onAuthSuccess?.();
        }, 600);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat autentikasi.';
      if (message.includes('Invalid login credentials')) {
        setErrorMsg('Email atau kata sandi tidak cocok.');
      } else if (message.includes('User already registered')) {
        setErrorMsg('Email ini sudah terdaftar. Silakan pilih tab Masuk.');
      } else if (message.includes('Password should be at least')) {
        setErrorMsg('Kata sandi minimal harus 6 karakter.');
      } else {
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = (registerMode: boolean) => {
    setIsRegister(registerMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? 'Daftar Akun Cloud' : 'Masuk ke Akun Cloud'}
      subtitle="Sinkronkan catatan keuanganmu otomatis antara HP dan laptop"
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Toggle Mode: Masuk vs Daftar */}
        <div className="grid grid-cols-2 p-1 bg-[#F4F1EA] dark:bg-[#1C1A18] rounded-xl border border-[#EDE9E1] dark:border-[#2C2925]">
          <button
            type="button"
            onClick={() => handleSwitchMode(false)}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              !isRegister
                ? 'bg-white dark:bg-[#282622] text-stone-900 dark:text-[#F2EFE9] shadow-2xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-850 dark:hover:text-stone-200'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode(true)}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              isRegister
                ? 'bg-white dark:bg-[#282622] text-[#2D6A4F] dark:text-[#42B07E] shadow-2xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-850 dark:hover:text-stone-200'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-tight">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-tight">{successMsg}</p>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-[#F2EFE9] placeholder-stone-400 focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-[#F2EFE9] placeholder-stone-400 focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E] transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Memproses...' : isRegister ? 'Buat Akun JatahKu' : 'Masuk Sekarang'}</span>
            </button>
          </div>
        </form>

        <p className="text-[11px] text-center text-stone-400 dark:text-stone-500 leading-normal pt-1">
          Data kamu dienkripsi dan hanya bisa diakses oleh akun milikmu melalui Row Level Security (RLS).
        </p>
      </div>
    </Modal>
  );
};