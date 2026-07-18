"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Logo from "./Logo";
import Icons8Icon from "./Icons8Icon";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Auth state
  const [user, setUser] = useState<any | null>(null);
  const [scansRemaining, setScansRemaining] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();

    const openAuthHandler = () => {
      setAuthMode("login");
      setAuthModalOpen(true);
    };
    window.addEventListener("openAuthModal", openAuthHandler);

    // Also close mobile menu on route change
    setMobileMenuOpen(false);

    return () => {
      window.removeEventListener("openAuthModal", openAuthHandler);
    };
  }, [pathname]);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("atsrank_token");
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await axios.get(`${apiUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setScansRemaining(response.data.scans_remaining);
    } catch (err) {
      console.error("Session expired or invalid token", err);
      localStorage.removeItem("atsrank_token");
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("atsrank_token");
    setUser(null);
    setScansRemaining(null);
    setMobileMenuOpen(false);
    window.dispatchEvent(new Event("userLoggedOut")); // To tell page.tsx to clear file/results if needed
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const url = authMode === "login" 
      ? `${apiUrl}/api/auth/login` 
      : `${apiUrl}/api/auth/register`;

    try {
      const response = await axios.post(url, { email, password });
      const { access_token, scans_remaining } = response.data;
      localStorage.setItem("atsrank_token", access_token);
      
      setUser({ email });
      setScansRemaining(scans_remaining);
      setAuthModalOpen(false);
      setEmail("");
      setPassword("");
      setMobileMenuOpen(false);
    } catch (err: any) {
      setAuthError(err.response?.data?.detail || "Authentication failed. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGithubLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.location.href = `${apiUrl}/api/auth/github/login`;
  };

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.location.href = `${apiUrl}/api/auth/google/login`;
  };

  return (
    <>
      <header className="bg-white/90 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-6 text-sm font-medium text-slate-600">
              <Link 
                href="/features" 
                className={`transition-colors ${pathname === '/features' ? 'text-blue-600' : 'hover:text-blue-600'}`}
              >
                Features
              </Link>
            </nav>
            <div className="h-4 w-[1px] bg-slate-200" />
            
            {pathname === '/features' ? (
              <Link 
                href="/"
                className="text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 animate-pulse"
              >
                Analyze Now
              </Link>
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logged In</span>
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-[150px]">{user.email}</span>
                </div>
                {scansRemaining !== null && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {scansRemaining} scans left
                  </span>
                )}
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-650 transition-colors hover:bg-slate-50 rounded-lg"
                  title="Logout"
                >
                  <Icons8Icon name="logout" size={18} />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={() => { setAuthMode("login"); setAuthModalOpen(true); }}
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-1.5 transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthMode("register"); setAuthModalOpen(true); }}
                  className="text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icons8Icon name={mobileMenuOpen ? "close" : "menu"} size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-slate-200 bg-white overflow-hidden absolute w-full z-30 shadow-lg"
          >
            <div className="flex flex-col p-4 space-y-4">
              <Link 
                href="/features" 
                className={`text-base font-medium py-2 ${pathname === '/features' ? 'text-blue-600' : 'text-slate-600'}`}
              >
                Features
              </Link>
              <div className="h-[1px] w-full bg-slate-100" />
              
              {pathname === '/features' ? (
                <Link 
                  href="/"
                  className="text-center w-full text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 rounded-xl transition-all"
                >
                  Analyze Now
                </Link>
              ) : user ? (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logged In As</span>
                      <span className="text-sm font-semibold text-slate-800">{user.email}</span>
                    </div>
                    {scansRemaining !== null && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {scansRemaining} scans left
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-center text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 py-3 rounded-xl transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => { setAuthMode("login"); setAuthModalOpen(true); }}
                    className="w-full text-center text-base font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 py-3 rounded-xl transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => { setAuthMode("register"); setAuthModalOpen(true); }}
                    className="w-full text-center text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-xl transition-all"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModalOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setAuthModalOpen(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Icons8Icon name="close" size={18} />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                  {authMode === "login" ? "Welcome back" : "Create your account"}
                </h3>
                <p className="text-slate-500 text-xs md:text-sm mt-1">
                  {authMode === "login" ? "Sign in to scan and evaluate resumes" : "Get 3 free scans when you sign up today"}
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex gap-2">
                  <Icons8Icon name="warning" size={18} className="shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-slate-400">
                      <Icons8Icon name="mail" size={18} />
                    </div>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-10 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-slate-400">
                      <Icons8Icon name="lock" size={18} />
                    </div>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-10 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={authLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl mt-6 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : authMode === "login" ? "Sign In" : "Create Account"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <div className="h-[1px] w-full bg-slate-100"></div>
                <span className="shrink-0 text-xs text-slate-400 font-medium uppercase">Or continue with</span>
                <div className="h-[1px] w-full bg-slate-100"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleGithubLogin}
                  className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] text-sm"
                >
                  <Icons8Icon name="github" size={18} />
                  GitHub
                </button>
                <button 
                  onClick={handleGoogleLogin}
                  className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] text-sm"
                >
                  <Icons8Icon name="google" size={18} />
                  Google
                </button>
              </div>

              <div className="text-center mt-6 text-sm text-slate-500">
                {authMode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button 
                      onClick={() => setAuthMode("register")}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button 
                      onClick={() => setAuthMode("login")}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
