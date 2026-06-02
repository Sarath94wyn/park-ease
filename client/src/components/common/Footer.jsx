import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Globe, Share2, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                Park<span className="text-gradient">Ease</span>
              </span>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed">
              Find and book parking spots in seconds. Smart, real-time parking made easy for every journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-slate-600 text-sm hover:text-primary-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-slate-600 text-sm hover:text-primary-600 transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-600 text-sm hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 text-sm hover:text-primary-600 transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-slate-600 text-sm">
                <Mail className="w-4 h-4 text-primary-700 flex-shrink-0" />
                support@parkease.in
              </li>
              <li className="flex items-center gap-2 text-slate-600 text-sm">
                <Phone className="w-4 h-4 text-primary-700 flex-shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-2 text-slate-600 text-sm">
                <MapPin className="w-4 h-4 text-primary-700 flex-shrink-0 mt-0.5" />
                Kochi, Kerala, India
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4">Follow Us</h3>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-primary-600 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all duration-300"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-primary-600 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all duration-300"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-primary-600 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} ParkEase. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-600 text-sm hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="text-slate-600 text-sm hover:text-slate-900 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
