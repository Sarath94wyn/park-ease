import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../services/userService';
import { User, Phone, Mail, Award, Edit3, ShieldAlert, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileCard() {
  const { user, checkAuth } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateProfile({ name, phone });
      toast.success('Profile updated successfully!');
      await checkAuth();
      setEditing(false);
    } catch (e) {
      console.error('Profile update failed:', e);
      toast.error('Update failed. Try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="glass-card max-w-xl mx-auto p-6 text-slate-900 border border-slate-200/80 shadow-2xl relative overflow-hidden space-y-6">
      {/* Background decoration blur */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Profile Header info */}
      <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-slate-700/30 pb-6 text-center sm:text-left">
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full border-4 border-primary-500/30 shadow-xl object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-slate-300 bg-slate-100 flex items-center justify-center shadow-xl">
              <User className="w-10 h-10 text-slate-600" />
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-5.5 h-5.5 bg-emerald-500 border-4 border-slate-200 rounded-full"></span>
        </div>

        <div className="space-y-1 select-none">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-xl font-black tracking-tight text-slate-950">{user.name}</h3>
            {user.role === 'admin' && (
              <span className="text-[9px] uppercase font-black bg-indigo-500/20 border border-indigo-500/35 text-indigo-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Award className="w-2.5 h-2.5" />
                <span>Admin</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 font-semibold">{user.email}</p>
        </div>
      </div>

      {/* Account Info Form */}
      {editing ? (
        <form onSubmit={handleUpdate} className="space-y-4 animate-slide-up">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field pl-10"
                />
                <User className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field pl-10"
                />
                <Phone className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="w-1/3 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex-1 btn-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      ) : (
        // Read-only Details View
        <div className="space-y-5 animate-slide-up">
          <div className="space-y-3.5 bg-slate-100/50 p-4.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 uppercase text-[10px] tracking-wider">Account Role</span>
              <span className="text-slate-800 capitalize font-bold">{user.role}</span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold border-t border-slate-200 pt-3">
              <span className="text-slate-600 uppercase text-[10px] tracking-wider">Registration Email</span>
              <span className="text-slate-800 font-bold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user.email}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold border-t border-slate-200 pt-3">
              <span className="text-slate-600 uppercase text-[10px] tracking-wider">Phone Link</span>
              <span className="text-slate-800 font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-600" />
                <span>{user.phone || 'No phone linked'}</span>
              </span>
            </div>
          </div>

          {/* Action Row */}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-full py-3 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Edit3 className="w-4 h-4 text-primary-700" />
            <span>Update Account Profile</span>
          </button>
        </div>
      )}
    </div>
  );
}
