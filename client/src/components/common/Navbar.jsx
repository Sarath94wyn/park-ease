import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Car, Menu, X, User, LogOut, LayoutDashboard, Shield, ChevronDown, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? 'text-cyan-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-cyan-400 after:rounded-full'
        : 'text-slate-600 hover:text-primary-600'
    }`;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || true
            ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group select-none">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-950">
                Park<span className="text-gradient">Ease</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/" className={navLinkClass} end>Home</NavLink>
              <NavLink to="/explore" className={navLinkClass}>Explore</NavLink>
              {isAuthenticated && (
                <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
              )}
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass}>
                  <span className="flex items-center gap-1 font-bold">
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </span>
                </NavLink>
              )}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Active loyalty points badge */}
              {isAuthenticated && user && (
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-700 font-extrabold text-xs px-3 py-1.5 rounded-full select-none shadow-sm animate-pulse-slow">
                  <Award className="w-4 h-4 fill-amber-500/20 text-amber-500" />
                  <span>⭐ {user.points || 0} PTS</span>
                </div>
              )}

              {isAuthenticated ? (
                <div className="relative animate-fade-in" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors duration-200"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border-2 border-primary-400/50 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-sm text-slate-900 font-medium max-w-[120px] truncate">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown in Light Glass style */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-sm py-2 animate-slide-down">
                      <div className="px-4 py-2 border-b border-slate-200">
                        <p className="text-sm font-extrabold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-600 font-medium truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-600" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-700 font-bold hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-450" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary text-sm px-5 py-2.5"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-slate-200 shadow-sm animate-slide-up flex flex-col justify-between">
            <div className="p-6 pt-20 flex flex-col gap-2.5">
              {isAuthenticated && user && (
                <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 animate-fade-in">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-slate-200/80" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-655 truncate">{user.email}</p>
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mt-0.5">⭐ {user.points || 0} Points</span>
                  </div>
                </div>
              )}

              <NavLink
                to="/"
                end
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    isActive ? 'bg-primary-500/10 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/explore"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    isActive ? 'bg-primary-500/10 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                Explore Map
              </NavLink>
              {isAuthenticated && (
                <NavLink
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                      isActive ? 'bg-primary-500/10 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  Dashboard
                </NavLink>
              )}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                      isActive ? 'bg-primary-500/10 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  Admin Portal
                </NavLink>
              )}

              <div className="mt-4 pt-4 border-t border-slate-200">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-450 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-450" />
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full btn-primary text-center text-sm rounded-xl py-3 shadow"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
