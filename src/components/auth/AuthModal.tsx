import React, { useState } from 'react';
import { signInWithGoogle, loginUser, registerUser, logoutUser, User } from '../../lib/firebase';
import { LogIn, LogOut, UserPlus, Mail, Lock, User as UserIcon, Shield, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      setSuccessMsg(`Berhasil masuk sebagai ${user.displayName || user.email}`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await loginUser(email, password);
        setSuccessMsg(`Berhasil masuk sebagai ${user.email}`);
        setTimeout(() => onClose(), 1000);
      } else {
        if (!displayName.trim()) {
          setErrorMsg('Nama lengkap wajib diisi');
          setLoading(false);
          return;
        }
        const user = await registerUser(email, password, displayName);
        setSuccessMsg(`Akun berhasil dibuat! Selamat datang ${displayName}`);
        setTimeout(() => onClose(), 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setSuccessMsg('Berhasil keluar dari Firebase Auth.');
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 p-6 text-white text-center space-y-2 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white text-sm font-bold p-1 rounded-lg"
          >
            ✕
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            <Shield size={14} /> Firebase Authentication
          </div>
          <h3 className="text-xl font-extrabold">Autentikasi LMS Bahasa Arab</h3>
          <p className="text-xs text-slate-300">
            {currentUser ? 'Kelola Sesi Akun Firebase Terhubung' : 'Masuk atau Daftar Akun Firebase'}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          
          {/* Notification Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* If already authenticated */}
          {currentUser ? (
            <div className="space-y-4 text-center py-2">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-16 h-16 rounded-full mx-auto border-2 border-emerald-500 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-bold text-xl">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{currentUser.displayName || 'Pengguna LMS'}</h4>
                  <p className="text-xs text-slate-600 font-mono">{currentUser.email}</p>
                  <p className="text-[10px] text-emerald-700 font-bold mt-1">UID: {currentUser.uid.substring(0, 12)}...</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Keluar (Sign Out)
              </button>
            </div>
          ) : (
            <>
              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 bg-white border-2 border-slate-200 hover:border-emerald-500 text-slate-700 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Masuk Dengan Google Account
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase text-slate-400 font-extrabold tracking-wider">Atau Email</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                    <div className="relative">
                      <UserIcon size={16} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Ahmad Dahlan"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@sekolah.sch.id"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi (Password)</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 Karakter"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? 'Memproses...' : mode === 'login' ? 'Masuk Sesi Firebase' : 'Daftar Akun Firebase Baru'}
                </button>
              </form>

              {/* Mode Switcher */}
              <div className="text-center pt-2 text-xs text-slate-500">
                {mode === 'login' ? (
                  <span>
                    Belum punya akun?{' '}
                    <button
                      onClick={() => setMode('register')}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Daftar Sekarang
                    </button>
                  </span>
                ) : (
                  <span>
                    Sudah memiliki akun?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Masuk Ke Akun
                    </button>
                  </span>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
