import React, { useState, useEffect } from 'react';
import { getAllUsers, toggleBlockUser, updateUserPoints, updateUserRole } from '../../services/adminService';
import { Search, RefreshCw, Car } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      setUsers(res.users || res.data || res);
    } catch (e) {
      console.error(e);
      toast.error('Failed to sync user records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlockToggle = async (userId, name, currentStatus) => {
    const nextStatus = currentStatus === 'blocked' ? 'activate' : 'block';
    if (!window.confirm(`Are you sure you want to ${nextStatus} ${name}?`)) return;
    try {
      await toggleBlockUser(userId);
      toast.success(`User ${name} status updated`);
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast.error('Failed to toggle block status');
    }
  };

  const handleRoleToggle = async (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change role of ${targetUser.name} to ${nextRole}?`)) return;
    try {
      await updateUserRole(targetUser._id, nextRole);
      toast.success(`Role updated to ${nextRole}`);
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update role');
    }
  };

  const handleEditPoints = async (targetUser) => {
    const promptVal = window.prompt(
      `Update loyalty points balance for ${targetUser.name}:`,
      targetUser.points !== undefined ? targetUser.points : 0
    );
    if (promptVal !== null) {
      const pts = parseInt(promptVal, 10);
      if (!isNaN(pts) && pts >= 0) {
        try {
          await updateUserPoints(targetUser._id, pts);
          toast.success(`Loyalty points updated to ${pts}`);
          fetchUsers();
        } catch (e) {
          console.error(e);
          toast.error('Failed to adjust loyalty points');
        }
      } else {
        toast.error('Please enter a valid non-negative number');
      }
    }
  };

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-semibold">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-base text-neutral-900">
            <span>User Directory</span>
          </h3>
          <p className="text-xs text-neutral-500 font-medium">Manage user accounts, adjust loyalty points balance, block accounts, and audit vehicle profiles.</p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          className="p-1.5 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 rounded-md shadow-sm active:scale-95 flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-neutral-50 p-4 border border-neutral-200 rounded-md">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-white border border-neutral-300 rounded-md outline-none focus:border-neutral-900 shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
          <span className="text-xs text-neutral-550">Syncing database records...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 font-semibold text-xs border border-dashed border-neutral-300 rounded-md bg-white">
          No users matching query.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white max-w-full font-semibold">
          <table className="min-w-full divide-y divide-neutral-200 text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[9px] font-bold">
              <tr>
                <th className="px-6 py-3.5">Avatar</th>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Registered Vehicles</th>
                <th className="px-6 py-3.5 text-center">Loyalty Balance</th>
                <th className="px-6 py-3.5 text-center">Role</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f3f4f6&color=1f2937`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-neutral-200 shadow-sm shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-neutral-900">{user.name}</td>
                  <td className="px-6 py-4 text-neutral-500 font-medium">{user.email}</td>
                  <td className="px-6 py-4 text-neutral-600 font-mono text-[11px]">
                    {user.vehicles && user.vehicles.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {user.vehicles.map((v, i) => (
                          <span key={i} className="flex items-center gap-1 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded text-neutral-700 w-fit">
                            <Car className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{v.vehicleNumber} ({v.vehicleType})</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-sans italic">No vehicles</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-extrabold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-250">
                        {user.points || 0} PTS
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEditPoints(user)}
                        className="px-2.5 py-1 text-[9px] text-indigo-700 hover:bg-indigo-50 border border-indigo-200 bg-white rounded shadow-sm font-bold transition-all"
                        title="Adjust balance"
                      >
                        Adjust
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                      user.role === 'admin'
                        ? 'bg-neutral-950 text-white border-neutral-955'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                      user.status === 'blocked'
                        ? 'bg-black text-white border-black font-black'
                        : 'bg-neutral-100 border-neutral-250 text-neutral-700'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleBlockToggle(user._id, user.name, user.status)}
                        className={`px-2.5 py-1 text-[10px] font-bold border rounded shadow-sm transition-all ${
                          user.status === 'blocked'
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-350'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-350'
                        }`}
                      >
                        {user.status === 'blocked' ? 'Unblock' : 'Block User'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleToggle(user)}
                        className="px-2.5 py-1 text-[10px] font-bold border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 rounded shadow-sm transition-all"
                      >
                        Toggle Role
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
