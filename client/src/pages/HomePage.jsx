import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, Navigation, ShieldCheck, Heart, Bot, Compass, ArrowRight, ShieldAlert } from 'lucide-react';
import LocationSearch from '../components/map/LocationSearch';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_CENTER } from '../utils/constants';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearchSelect = (coords, name) => {
    // Navigate to explore page with search lat,lng query params
    navigate(`/explore?lat=${coords[1]}&lng=${coords[0]}&name=${encodeURIComponent(name)}`);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/explore');
    } else {
      navigate('/login');
    }
  };

  const FEATURES = [
    {
      title: "Real-time Availability",
      desc: "Live vacancy indicators showing available slots prior to booking. Colored map pins keep you informed.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7 select-none">
          <path
            fill="#EA4335"
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          />
          <path
            fill="#34A853"
            d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
          />
        </svg>
      )
    },
    {
      title: "Google Auth Security",
      desc: "Instant single-tap login utilizing official verified Google Identity credentials. Highly secure authentication.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7 select-none">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )
    },
    {
      title: "Intent-based Chatbot",
      desc: "Quick conversational bot searching available nearby spots and providing instant navigation assistance.",
      icon: (
        <svg viewBox="0 0 24 24" className="w-7 h-7 select-none" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M9 13h.01" />
          <path d="M15 13h.01" />
          <path d="M9 17h6" />
        </svg>
      )
    }
  ];

  const STEPS = [
    {
      step: "01",
      title: "Locate Nearest Lot",
      desc: "Search by landmark, town, or grant geolocation access to immediately visualize nearby multi-level parking plazas."
    },
    {
      step: "02",
      title: "Select Free Slot",
      desc: "Pick standard, EV chargers, or handicap slots from our interactive digital floor grid models."
    },
    {
      step: "03",
      title: "One-Click Booking",
      desc: "Input check-in intervals, authorize mock sandboxed cards, and fetch digital QR tickets instantly."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 bg-mobility-pattern text-slate-900 relative overflow-hidden select-none">
      {/* Decorative gradient blur background highlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-8 z-10 min-h-[85vh]">
        <div className="space-y-4 animate-slide-up">
          <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest bg-gradient-to-r from-primary-500 to-cyan-400 px-4 py-1.5 rounded-full border border-primary-500/20 text-cyan-300 shadow-sm">
            Find Your Parking Slot Instantly
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Seamless Parking Search <br />
            <span className="text-gradient">Real-time availability</span>
          </h1>
          
          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Eliminate parking stress. Locate multi-level parking lots, inspect slots, authorize sandboxed payments, and unlock gates using automated digital QR tickets.
          </p>
        </div>

        {/* Home search overlay bar */}
        <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-slate-200 p-4 rounded-3xl shadow-sm animate-fade-in relative z-20">
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-2 text-left px-1">
            Search nearby facilities
          </span>
          <LocationSearch onSelect={handleSearchSelect} />
        </div>

        {/* Call to action rows */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 z-10">
          <button
            type="button"
            onClick={handleGetStarted}
            className="btn-primary text-sm px-7 py-3.5 rounded-2xl"
          >
            <span>Browse Map Explorer</span>
            <Compass className="w-4.5 h-4.5" />
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/explore')}
            className="btn-outline text-sm px-7 py-3.5 rounded-2xl"
          >
            <span>View Pricing Rates</span>
            <ArrowRight className="w-4.5 h-4.5 text-primary-700" />
          </button>
        </div>

        {/* Real-time statistics counters */}
        <div className="grid grid-cols-3 gap-6 sm:gap-12 pt-8 w-full max-w-2xl text-center select-none border-t border-slate-200">
          <div>
            <span className="text-xl sm:text-3xl font-black text-slate-900 block mb-0.5">500+</span>
            <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Active Spots</span>
          </div>
          <div className="border-x border-slate-200">
            <span className="text-xl sm:text-3xl font-black text-slate-900 block mb-0.5">10+</span>
            <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Indian Cities</span>
          </div>
          <div>
            <span className="text-xl sm:text-3xl font-black text-slate-900 block mb-0.5">1,000+</span>
            <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Happy Users</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-50/50 border-y border-slate-200 py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] text-primary-700 uppercase font-extrabold tracking-widest block">Premium features</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Smart Parking Capabilities</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">Explore features engineered to make urban commutes simple and stress-free.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="glass-card-dark p-6 border border-slate-200 hover:border-primary-500/20 hover:shadow-neon/5 transition-all duration-300 space-y-4"
              >
                <div className="w-12 h-12 bg-slate-100/40 border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="font-extrabold text-base tracking-wide">{feature.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Step Workflow Guide */}
      <section className="py-16 px-6 max-w-7xl mx-auto relative z-10 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] text-cyan-600 uppercase font-extrabold tracking-widest block">How it works</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Three Simple Steps to Park</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">Park and retrieve your vehicle in under three taps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={i} className="relative space-y-3 p-5 rounded-2xl bg-slate-100/10 border border-slate-200/40 hover:border-slate-800 transition-colors">
              <span className="text-4xl font-black text-primary-500/10 absolute top-4 right-4 select-none">{step.step}</span>
              <h3 className="font-extrabold text-base tracking-wide">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action (Premium Black Gradient Accent) */}
      <section className="gradient-primary py-16 px-6 text-center border-t border-black relative overflow-hidden z-10 text-white">
        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-110 pointer-events-none"></div>
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl font-black tracking-tight">Ready to Find Your Spot?</h2>
          <p className="text-slate-350 text-xs sm:text-sm font-semibold leading-relaxed">
            Create an account today, find the most affordable multi-level parking lot plazas in Kochi, Kozhikode or Bangalore, and secure your digital slot reservation instantly.
          </p>
          <button
            type="button"
            onClick={handleGetStarted}
            className="btn-outline bg-white border-white text-black hover:bg-slate-100 text-xs px-8 py-3.5 rounded-2xl mt-4"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
