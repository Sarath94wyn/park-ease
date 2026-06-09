import React, { useState, useEffect } from 'react';
import { getAllStaff, addStaff } from '../../services/adminService';
import { Shield, Users, Plus, RefreshCw, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffRolesManager() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add staff form state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('operations_staff');
  const [selectedPermissions, setSelectedPermissions] = useState(['view_bookings']);
  const [adding, setAdding] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await getAllStaff();
      setStaff(res.data || res);
    } catch (e) {
      console.error(e);
      toast.error('Failed to sync staff records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handlePermissionToggle = (perm) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setAdding(true);
      await addStaff({
        email,
        staffRole: role,
        permissions: selectedPermissions
      });
      toast.success('Staff configured');
      setEmail('');
      setSelectedPermissions(['view_bookings']);
      fetchStaff();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update credentials');
    } finally {
      setAdding(false);
    }
  };

  const AVAILABLE_PERMISSIONS = [
    { key: 'manage_lots', label: 'Create/Edit Facilities' },
    { key: 'manage_spaces', label: 'Modify Parking Grid & Sensors' },
    { key: 'view_bookings', label: 'Audit Reservations logs' },
    { key: 'resolve_tickets', label: 'Resolve Support tickets' },
    { key: 'view_reports', label: 'View Revenue & Financial reports' }
  ];

  return (
    <div className="space-y-6 font-semibold">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-base text-neutral-900 flex items-center gap-1.5">
            <span>Access Control & Staff Roles</span>
          </h3>
          <p className="text-xs text-neutral-500 font-medium">Configure administrative system staff profiles, assign operational roles, and set precise access keys.</p>
        </div>

        <button
          type="button"
          onClick={fetchStaff}
          className="p-1.5 border border-neutral-350 bg-white hover:bg-neutral-50 text-neutral-700 rounded-md shadow-sm active:scale-95 flex items-center gap-1.5 text-xs font-bold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff registry listing */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 p-5 rounded-md shadow-sm space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
            <span>Staff Roster</span>
          </h4>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
              <span className="text-xs text-neutral-500">Syncing credentials...</span>
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs font-semibold">No operational staff accounts configured.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-250 text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase text-[9px] tracking-wide font-bold">
                  <tr>
                    <th className="px-4 py-3.5">Staff Profile</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Permissions</th>
                    <th className="px-4 py-3.5 text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-700 bg-white">
                  {staff.map((member) => (
                    <tr key={member._id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f3f4f6&color=1f2937`}
                            alt={member.name}
                            className="w-8 h-8 rounded-full border border-neutral-200 shadow-sm shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-neutral-900">{member.name}</span>
                            <span className="text-[9px] text-neutral-400 font-medium font-sans">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-neutral-350 bg-neutral-50 text-neutral-800">
                          {member.staffRole.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {member.permissions && member.permissions.length > 0 ? (
                            member.permissions.map((perm, idx) => (
                              <span key={idx} className="text-[8px] font-bold uppercase bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded text-neutral-600">
                                {perm.replace('_', ' ')}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] italic text-neutral-400 font-sans">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`Revoke staff credentials for ${member.name}?`)) return;
                            try {
                              await addStaff({ email: member.email, staffRole: 'none' });
                              toast.success('Access keys revoked');
                              fetchStaff();
                            } catch (e) {
                              toast.error('Failed to revoke access');
                            }
                          }}
                          className="px-2.5 py-1.5 text-[9px] bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-700 rounded font-bold transition-all shadow-sm"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Configuration Sidebar Form */}
        <div className="bg-white border border-neutral-200 p-5 rounded-md shadow-sm h-fit space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
            <span>Configure Access Rights</span>
          </h4>

          <form onSubmit={handleAddStaffSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block uppercase tracking-wider text-[10px]">User Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="registered user email..."
                className="w-full px-3.5 py-2 text-xs font-semibold bg-white border border-neutral-300 rounded-md outline-none focus:border-neutral-900 shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block uppercase tracking-wider text-[10px]">Operational Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border border-neutral-300 rounded-md outline-none focus:border-neutral-900 bg-white"
              >
                <option value="parking_manager">Parking Lot Manager</option>
                <option value="operations_staff">Operations Staff</option>
                <option value="security_personnel">Security Personnel</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 block uppercase tracking-wider text-[10px]">Key Permissions</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {AVAILABLE_PERMISSIONS.map((p) => (
                  <label key={p.key} className="flex items-start gap-2.5 p-2 bg-neutral-50 border border-neutral-200 rounded-md cursor-pointer hover:bg-neutral-100 text-[11px] leading-relaxed">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(p.key)}
                      onChange={() => handlePermissionToggle(p.key)}
                      className="mt-0.5"
                    />
                    <span className="text-neutral-700 font-semibold">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs py-2.5 px-4 rounded-md flex items-center justify-center gap-1.5 shadow font-bold transition-all"
            >
              {adding ? (
                <span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Grant Access Keys</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
