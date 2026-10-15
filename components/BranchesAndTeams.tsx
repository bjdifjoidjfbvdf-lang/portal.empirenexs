'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/storeContext';
import { BRANCHES } from '@/lib/initialData';
import { BranchId, UserRole } from '@/types';
import {
  Users,
  Shield,
  Building,
  Mail,
  MapPin,
  Youtube,
  Film,
  Award,
  CheckCircle,
  Plus,
  Phone,
  AtSign,
  User,
  Lock,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

export const BranchesAndTeams: React.FC = () => {
  const {
    channels,
    availableUsers,
    setCurrentUser,
    currentUser,
    pendingUsers,
    approveUser,
    rejectUser,
    directCreateUser,
  } = useApp();

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newUserBranch, setNewUserBranch] = useState<BranchId>('bahawalpur');
  const [newUserRole, setNewUserRole] = useState<UserRole>('TEAM_MEMBER');
  const [newUserDesignation, setNewUserDesignation] = useState('Senior Video Editor');
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  const handleCreateDirectUser = (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);

    if (!newUserName.trim() || !newUserUsername.trim() || !newUserEmail.trim() || !newUserPass.trim()) {
      setModalFeedback('Full Name, Username, Gmail, and Password are required.');
      return;
    }

    const res = directCreateUser({
      name: newUserName.trim(),
      username: newUserUsername.trim(),
      email: newUserEmail.trim(),
      password: newUserPass,
      phone: newUserPhone.trim(),
      address: newUserAddress.trim(),
      branchId: newUserBranch,
      role: newUserRole,
      designation: newUserDesignation,
    });

    if (res.success) {
      alert(res.message);
      setIsAddUserModalOpen(false);
      // Reset
      setNewUserName('');
      setNewUserUsername('');
      setNewUserEmail('');
      setNewUserPass('');
      setNewUserPhone('');
      setNewUserAddress('');
    } else {
      setModalFeedback(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
              <Building className="w-6 h-6 text-emerald-400" />
              Branches &amp; Team Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              3 Hubs Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Founder &amp; CEO: <strong>Waqas Gill</strong> (HQ Musafirkhana) • Co-Founders: <strong>Saim Chaudhry</strong> (Bahawalpur), <strong>Zainab Akhtar</strong> (Rahim Yar Khan).
          </p>
        </div>

        {currentUser.role === 'SUPER_ADMIN' && (
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Direct Team Member</span>
          </button>
        )}
      </div>

      {/* Leadership Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Waqas Gill */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1120] border border-emerald-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Waqas Gill"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400"
            />
            <div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Founder &amp; CEO
              </span>
              <h2 className="text-base font-bold text-white mt-1">Waqas Gill</h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> Musafirkhana (HQ)
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Access:</span>
              <span className="text-emerald-400 font-bold">Master Super Admin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Visible Channels:</span>
              <span className="text-white font-bold">{channels.length} (All)</span>
            </div>
          </div>

          <div className="w-full mt-3 py-1.5 rounded-lg text-xs font-bold text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Executive Founder &amp; CEO
          </div>
        </div>

        {/* Saim Chaudhry */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1120] border border-blue-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
              alt="Saim Chaudhry"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-400"
            />
            <div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Co-Founder
              </span>
              <h2 className="text-base font-bold text-white mt-1">Saim Chaudhry</h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-400" /> Bahawalpur Branch
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">System Role:</span>
              <span className="text-blue-400 font-bold">Branch Head</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Branch Channels:</span>
              <span className="text-white font-bold">
                {channels.filter((c) => c.branchId === 'bahawalpur').length} Channels
              </span>
            </div>
          </div>

          <div className="w-full mt-3 py-1.5 rounded-lg text-xs font-bold text-center bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Head of Bahawalpur Branch
          </div>
        </div>

        {/* Zainab Akhtar */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1120] border border-purple-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
              alt="Zainab Akhtar"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-400"
            />
            <div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Co-Founder
              </span>
              <h2 className="text-base font-bold text-white mt-1">Zainab Akhtar</h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-purple-400" /> Rahim Yar Khan
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">System Role:</span>
              <span className="text-purple-400 font-bold">Branch Head</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Branch Channels:</span>
              <span className="text-white font-bold">
                {channels.filter((c) => c.branchId === 'rahim-yar-khan').length} Channels
              </span>
            </div>
          </div>

          <div className="w-full mt-3 py-1.5 rounded-lg text-xs font-bold text-center bg-purple-500/10 text-purple-400 border border-purple-500/30">
            Head of Rahim Yar Khan Branch
          </div>
        </div>
      </div>

      {/* Pending User Approvals Section */}
      {pendingUsers.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Pending Account Approvals ({pendingUsers.length})
              </h2>
              <p className="text-xs text-amber-200/80">
                These users have completed Gmail verification. Access to the ERP is restricted until approved by Founder &amp; CEO (Waqas Gill).
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Founder Action Required
            </span>
          </div>

          <div className="space-y-3">
            {pendingUsers.map((pending) => (
              <div
                key={pending.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={pending.avatar}
                    alt={pending.name}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-400/40 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-white text-sm">{pending.name}</p>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        @{pending.username}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {pending.designation}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-300">
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pending.email}</span>
                      </p>
                      {pending.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{pending.phone}</span>
                        </p>
                      )}
                      {pending.address && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{pending.address}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>Branch: <strong className="text-white">{pending.branchId.toUpperCase()}</strong></span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => rejectUser(pending.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => {
                      approveUser(pending.id);
                      alert(`Account for ${pending.name} (@${pending.username}) has been approved successfully!`);
                    }}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-md shadow-emerald-500/20 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve Access
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Production Team Members Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          Active Team Members &amp; Operators ({availableUsers.length})
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Each team member is allotted channels according to their branch and role. Regular members are isolated to their own channels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableUsers.map((user) => (
            <div
              key={user.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-3 hover:border-slate-700 transition"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-700"
              />
              <div className="flex-1 truncate text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-100 truncate">{user.name}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {user.branchId.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 truncate">{user.designation}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">@{user.username || user.email.split('@')[0]}</p>
                {user.phone && <p className="text-[9px] text-slate-500">{user.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              Direct Add Team Member
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Members added via this form are activated immediately (no approval queue required).
            </p>

            {modalFeedback && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs">
                {modalFeedback}
              </div>
            )}

            <form onSubmit={handleCreateDirectUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Mubashir Hassan"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="mubashir"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Gmail Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="mubashir@empirenexs.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Login Password</label>
                <input
                  type="password"
                  required
                  value={newUserPass}
                  onChange={(e) => setNewUserPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">WhatsApp / Phone</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City / Address</label>
                  <input
                    type="text"
                    value={newUserAddress}
                    onChange={(e) => setNewUserAddress(e.target.value)}
                    placeholder="Bahawalpur"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Branch</label>
                  <select
                    value={newUserBranch}
                    onChange={(e) => setNewUserBranch(e.target.value as BranchId)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="bahawalpur">Bahawalpur</option>
                    <option value="rahim-yar-khan">Rahim Yar Khan</option>
                    <option value="musafirkhana">Musafirkhana (HQ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={newUserDesignation}
                    onChange={(e) => setNewUserDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition"
                >
                  Add Active User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
