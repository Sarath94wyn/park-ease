import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Car, Mail, Lock, User, Sparkles, Navigation, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, register, googleLogin, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (credentialResponse.credential) {
        await googleLogin(credentialResponse.credential);
        navigate('/dashboard');
      } else {
        toast.error('Google login did not return valid credentials');
      }
    } catch (err) {
      // Errors handled by AuthContext toast
    }
  };

  // Active form tab: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState('signin');
  
  // Input fields state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast.error('Please enter email and password');
      return;
    }
    try {
      await login(signInEmail, signInPassword);
      navigate('/dashboard');
    } catch (err) {
      // errors handled by AuthContext toasts
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword) {
      toast.error('All inputs are required');
      return;
    }
    if (signUpPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await register(signUpName, signUpEmail, signUpPassword);
      navigate('/dashboard');
    } catch (err) {
      // errors handled by AuthContext toasts
    }
  };

  const BENEFITS = [
    {
      title: "Premium Glassmorphism",
      desc: "An incredible deep-space layout with translucent panels and cyan highlights.",
      icon: <Sparkles className="w-5 h-5 text-cyan-600" />
    },
    {
      title: "Loyalty Points credit",
      desc: "Earn 10 points automatically upon signup and redeem for vouchers.",
      icon: <ShieldCheck className="w-5 h-5 text-amber-700" />
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row select-none relative overflow-hidden pt-1">
      {/* Absolute background blur decorations */}
      <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Pane 1: Brand details (Hidden on mobile) */}
      <div className="hidden md:flex flex-col justify-between w-1/2 gradient-primary p-12 border-r border-black z-10 relative text-white">
        {/* Logo */}
        <div className="flex items-center gap-2.5 z-10 select-none">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Car className="w-5 h-5 text-black" />
          </div>
          <span className="font-black text-xl tracking-tight text-white">
            Park<span className="text-cyan-400">Ease</span>
          </span>
        </div>

        {/* Brand highlights */}
        <div className="space-y-8 z-10 my-auto animate-slide-up">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-black bg-white/10 border border-white/20 text-cyan-300 px-2.5 py-1 rounded-full w-fit">
              Loyalty rewards catalog
            </span>
            <h2 className="text-4xl font-black leading-tight tracking-tight mt-2 text-white">
              Smarter parking slots <br />
              booked with gold points
            </h2>
            <p className="text-slate-300 text-sm max-w-sm font-semibold leading-relaxed">
              Register now to collect loyalty milestones and unlock discount coupon checks.
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:border-white/20 transition-all duration-300 flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                  {b.icon}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-sm text-white">{b.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
          © 2026 ParkEase capstone Project.
        </span>
      </div>

      {/* Pane 2: Typing Credentials Form Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 bg-mobility-pattern z-10 min-h-screen relative">
        <div className="max-w-md w-full space-y-6">
          {/* Mobile brand header (hidden on desktop) */}
          <div className="text-center space-y-2 select-none">
            <div className="flex md:hidden items-center justify-center gap-2 mb-4">
              <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-sm">
                <Car className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-black text-lg tracking-tight text-slate-900">
                Park<span className="text-cyan-600">Ease</span>
              </span>
            </div>

            <h3 className="text-2xl font-black tracking-tight text-slate-900">Secure Account access</h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed px-4">
              Enter your credentials to book slots and manage active dashboard reservations.
            </p>
          </div>

          {/* Glowing Glass Tab Panel */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-10 space-y-6 relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 to-cyan-500/5 pointer-events-none"></div>

            {/* Tabs selection switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 select-none relative z-10">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl uppercase tracking-wider transition-all duration-300 ${
                  activeTab === 'signin'
                    ? 'bg-black text-white shadow font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Sign In
              </button>
              
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl uppercase tracking-wider transition-all duration-300 ${
                  activeTab === 'signup'
                    ? 'bg-black text-white shadow font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Sign Up
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2 relative z-10">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-cyan-400 rounded-full animate-spin"></div>
                <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Syncing credentials...</span>
              </div>
            ) : activeTab === 'signin' ? (
              // Sign In credential typing form
              <form onSubmit={handleSignIn} className="space-y-5 animate-slide-up relative z-10">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 tracking-wide block px-1">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="e.g. user@parkinglot.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        className="input-field pl-11 pr-4 py-3 bg-slate-100/40 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-450 font-medium focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none transition-all duration-300 w-full"
                      />
                      <Mail className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 tracking-wide block px-1">Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="input-field pl-11 pr-4 py-3 bg-slate-100/40 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-450 font-medium focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none transition-all duration-300 w-full"
                      />
                      <Lock className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>



                <button
                  type="submit"
                  className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 mt-2"
                >
                  <span>Authorize Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              // Sign Up credential typing form
              <form onSubmit={handleSignUp} className="space-y-5 animate-slide-up relative z-10">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 tracking-wide block px-1">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarath S"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        className="input-field pl-11 pr-4 py-3 bg-slate-100/40 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-450 font-medium focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none transition-all duration-300 w-full"
                      />
                      <User className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 tracking-wide block px-1">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        placeholder="e.g. sarath@mail.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="input-field pl-11 pr-4 py-3 bg-slate-100/40 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-450 font-medium focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none transition-all duration-300 w-full"
                      />
                      <Mail className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 tracking-wide block px-1">Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="input-field pl-11 pr-4 py-3 bg-slate-100/40 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-450 font-medium focus:border-black focus:ring-4 focus:ring-black/5 focus:outline-none transition-all duration-300 w-full"
                      />
                      <Lock className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-700 font-semibold text-center flex items-center justify-center gap-2 animate-pulse-slow">
                  <span>🎁</span>
                  <span>Sign up bonus: <strong>10 Loyalty Points</strong> automatically credited!</span>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 mt-2"
                >
                  <span>Register & Earn 10 PTS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4 select-none">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="absolute bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">or continue with</span>
            </div>

            {/* Google Authentication Button */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={(credentialResponse) => handleGoogleSuccess(credentialResponse)}
                onError={() => {
                  toast.error('Google Sign-In failed');
                }}
                useOneTap
                theme="outline"
                size="large"
                width="100%"
                shape="pill"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
