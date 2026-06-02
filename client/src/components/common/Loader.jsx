import { Car } from 'lucide-react';

export default function Loader({ message = 'Finding the best spots...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-hero">
      {/* Animated car icon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center animate-bounce-gentle shadow-sm">
          <Car className="w-10 h-10 text-white" />
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-primary-500/20 animate-ping" />
      </div>

      {/* Loading dots */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      {/* Text */}
      <p className="text-slate-700 text-sm font-medium animate-pulse">
        {message}
      </p>
    </div>
  );
}

export function InlineLoader({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center animate-bounce-gentle shadow-sm mb-4">
        <Car className="w-6 h-6 text-white" />
      </div>
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
  );
}
