import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  ShieldCheck,
  FileText,
  Cloud,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validasi pendaftaran
    if (isRegister) {
      if (!fullName.trim()) {
        setErrorMsg('Silakan masukkan nama lengkap atau nama panggilan kamu.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Kata sandi minimal harus 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi tidak cocok. Mohon periksa kembali.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          setSuccessMsg('Akun berhasil dibuat! Mengalihkan ke dashboard...');
          setTimeout(() => {
            onClose();
            onAuthSuccess?.();
          }, 800);
        } else {
          setSuccessMsg('Pendaftaran berhasil! Silakan periksa email kamu untuk konfirmasi, lalu masuk.');
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
        setErrorMsg('Email atau kata sandi tidak cocok. Silakan periksa kembali.');
      } else if (message.includes('User already registered')) {
        setErrorMsg('Email ini sudah terdaftar. Silakan pindah ke tab Masuk Akun.');
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

  const isPasswordMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? 'Buat Akun JatahKu' : 'Masuk ke Akun Cloud'}
      subtitle={
        isRegister
          ? 'Daftar untuk mengunci data keuangan pribadimu dan sinkronkan ke HP'
          : 'Akses catatan keuangan yang tersinkron otomatis antar perangkat'
      }
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Segmented Mode Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#F4F1EA] dark:bg-[#1E1C19] rounded-xl border border-[#E7E3DA] dark:border-[#332F2B]">
          <button
            type="button"
            onClick={() => handleSwitchMode(false)}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              !isRegister
                ? 'bg-white dark:bg-[#2B2824] text-stone-900 dark:text-[#F2EFE9] shadow-2xs font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode(true)}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              isRegister
                ? 'bg-white dark:bg-[#2B2824] text-[#2D6A4F] dark:text-[#42B07E] shadow-2xs font-bold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
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
          {/* Kolom Nama Khusus Form Pendaftaran */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Nama Mahasiswa / Panggilan
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hasbi Nur"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-[#F2EFE9] placeholder-stone-400 focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E] transition-colors"
                />
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                Nama ini otomatis tercantum pada kop laporan resmi PDF & Excel.
              </p>
            </div>
          )}

          {/* Kolom Email */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
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

          {/* Kolom Kata Sandi */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border border-[#E7E3DA] dark:border-[#38342F] rounded-xl text-xs sm:text-sm text-stone-900 dark:text-[#F2EFE9] placeholder-stone-400 focus:outline-none focus:border-[#2D6A4F] dark:focus:border-[#42B07E] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Kolom Konfirmasi Kata Sandi Khusus Form Pendaftaran */}
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Ketik ulang kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-9 pr-10 py-2 bg-[#FAF8F5] dark:bg-[#1C1A18] border rounded-xl text-xs sm:text-sm text-stone-900 dark:text-[#F2EFE9] placeholder-stone-400 focus:outline-none transition-colors ${
                    isPasswordMismatch
                      ? 'border-rose-400 focus:border-rose-500'
                      : isPasswordMatch
                      ? 'border-emerald-500 focus:border-emerald-600'
                      : 'border-[#E7E3DA] dark:border-[#38342F] focus:border-[#2D6A4F] dark:focus:border-[#42B07E]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  title={showConfirmPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isPasswordMismatch && (
                <p className="text-[11px] text-rose-500 mt-1">Kata sandi belum cocok.</p>
              )}
              {isPasswordMatch && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Kata sandi cocok.</p>
              )}
            </div>
          )}

          {/* Kotak Manfaat Pendaftaran (Stripe-Style Utilitarian Box) */}
          {isRegister && (
            <div className="p-3 rounded-xl bg-[#F6F3EC] dark:bg-[#1E1C19] border border-[#ECE7DC] dark:border-[#332F2B] space-y-2 mt-2">
              <p className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                Keuntungan akun JatahKu:
              </p>
              <div className="space-y-1.5 text-[11px] text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-2">
                  <Cloud className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E] shrink-0" />
                  <span>Sinkronisasi otomatis antara HP dan laptop</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E] shrink-0" />
                  <span>Kop nama mahasiswa otomatis pada lembar laporan resmi</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#42B07E] shrink-0" />
                  <span>Data terenkripsi aman dengan Row Level Security</span>
                </div>
              </div>
            </div>
          )}

          {/* Tombol Eksekusi Form */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || (isRegister && isPasswordMismatch)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2D6A4F] hover:bg-[#23563F] active:scale-98 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {loading
                  ? 'Memproses...'
                  : isRegister
                  ? 'Buat Akun & Mulai Sinkron'
                  : 'Masuk ke Akun'}
              </span>
            </button>
          </div>
        </form>

        {/* Footer Text */}
        <p className="text-[11px] text-center text-stone-400 dark:text-stone-500 leading-normal pt-1">
          {isRegister
            ? 'Dengan mendaftar, akunmu tersambung ke database pribadi Supabase.'
            : 'Belum punya akun? Klik tab "Daftar Baru" di atas untuk membuat akun gratis.'}
        </p>
      </div>
    </Modal>
  );
};