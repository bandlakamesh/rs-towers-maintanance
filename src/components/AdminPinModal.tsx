import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, X, KeyRound, Check, Crown, UserCheck, UserX } from 'lucide-react';
import type { FlatReading } from '../types';

interface AdminPinModalProps {
  onClose: () => void;
  isAdmin: boolean;
  onAdminLoginSuccess: (flatNo: string) => void;
  onAdminLogout: () => void;
  flatsList?: FlatReading[];
  adminFlats?: string[];
  rootFlat?: string;
  onToggleFlatAdmin?: (flatNo: string) => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  onClose,
  isAdmin,
  onAdminLoginSuccess,
  onAdminLogout,
  flatsList = [],
  adminFlats = ['302'],
  rootFlat = '302',
  onToggleFlatAdmin,
}) => {
  const [selectedFlat, setSelectedFlat] = useState<string>('302');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [adminTab, setAdminTab] = useState<'overview' | 'manage_rights' | 'change_pin'>('overview');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');

  const getStoredPin = (): string => {
    return localStorage.getItem('rs_towers_maint_pin') || '2026';
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const storedPin = getStoredPin();

    if (pinInput.trim() !== storedPin) {
      setErrorMsg('❌ Incorrect Security PIN. Access denied.');
      return;
    }

    const isRoot = selectedFlat === rootFlat;
    const hasAdminRights = adminFlats.includes(selectedFlat) || isRoot;

    if (!hasAdminRights) {
      setErrorMsg(`❌ Flat #${selectedFlat} has not been granted Admin access by Root User (Flat 302 - Kamesh).`);
      return;
    }

    onAdminLoginSuccess(selectedFlat);
    setPinInput('');
    setErrorMsg('');
    onClose();
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const storedPin = getStoredPin();

    if (currentPinInput.trim() !== storedPin) {
      setErrorMsg('❌ Current Security PIN is incorrect.');
      return;
    }

    if (!newPinInput || newPinInput.trim().length < 4) {
      setErrorMsg('❌ New Security PIN must be at least 4 digits.');
      return;
    }

    localStorage.setItem('rs_towers_maint_pin', newPinInput.trim());
    setSuccessMsg('✅ Admin Security PIN updated successfully!');
    setCurrentPinInput('');
    setNewPinInput('');
    setAdminTab('overview');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: isAdmin ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #0096C7 0%, #0077B6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 150, 199, 0.3)',
              flexShrink: 0
            }}>
              {isAdmin ? <Unlock size={20} /> : <Lock size={20} />}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isAdmin ? '🔓 Admin Mode Active' : '🔑 Admin Authentication'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isAdmin ? 'Manage flat permissions or lock session' : 'PIN required for flat owner identity'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', fontSize: '0.82rem', fontWeight: 600, marginBottom: '14px', wordBreak: 'break-word' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontSize: '0.82rem', fontWeight: 600, marginBottom: '14px', wordBreak: 'break-word' }}>
            {successMsg}
          </div>
        )}

        {/* State 1: Locked */}
        {!isAdmin && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.84rem', color: '#334155', marginBottom: '6px', display: 'block' }}>
                1. Select Flat Number:
              </label>
              <select
                className="form-control"
                value={selectedFlat}
                onChange={(e) => setSelectedFlat(e.target.value)}
                style={{ fontSize: '0.92rem', padding: '10px' }}
              >
                {flatsList.filter((f) => f.flatNo !== 'WM').map((f) => {
                  const isRoot = f.flatNo === rootFlat;
                  const hasAdmin = adminFlats.includes(f.flatNo) || isRoot;

                  return (
                    <option key={f.flatNo} value={f.flatNo}>
                      Flat #{f.flatNo} - {f.residentName} {isRoot ? '👑 (Root Admin)' : hasAdmin ? '⭐ (Admin)' : '👤 (Resident/Tenant)'}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.84rem', color: '#334155', marginBottom: '6px', display: 'block' }}>
                2. Enter Security PIN:
              </label>
              <input
                type="password"
                className="form-control"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Security PIN (Default: 2026)"
                autoFocus
                required
                style={{ fontSize: '1.05rem', letterSpacing: '4px', textAlign: 'center', padding: '10px' }}
              />
              <p style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '6px', lineHeight: 1.4 }}>
                🔐 <strong>Authentication Rule:</strong> Valid Security PIN (Default: <code>2026</code>) and granted Admin access required to unlock editing.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button type="button" className="app-btn app-btn-secondary" onClick={onClose} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                Cancel
              </button>
              <button type="submit" className="app-btn app-btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                <ShieldCheck size={16} /> Authenticate & Unlock
              </button>
            </div>
          </form>
        )}

        {/* State 2: Unlocked */}
        {isAdmin && (
          <div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <button
                type="button"
                className={`chip ${adminTab === 'overview' ? 'active' : ''}`}
                onClick={() => setAdminTab('overview')}
                style={{ fontSize: '0.76rem', padding: '6px 12px' }}
              >
                <ShieldCheck size={13} /> Overview
              </button>

              <button
                type="button"
                className={`chip ${adminTab === 'manage_rights' ? 'active' : ''}`}
                onClick={() => setAdminTab('manage_rights')}
                style={{ fontSize: '0.76rem', padding: '6px 12px', background: adminTab === 'manage_rights' ? '#FEF3C7' : undefined, color: adminTab === 'manage_rights' ? '#B45309' : undefined, borderColor: adminTab === 'manage_rights' ? '#FDE68A' : undefined }}
              >
                <Crown size={13} color="#D97706" /> Manage Flat Access
              </button>

              <button
                type="button"
                className={`chip ${adminTab === 'change_pin' ? 'active' : ''}`}
                onClick={() => setAdminTab('change_pin')}
                style={{ fontSize: '0.76rem', padding: '6px 12px' }}
              >
                <KeyRound size={13} /> Change PIN
              </button>
            </div>

            {adminTab === 'overview' && (
              <div>
                <div style={{ padding: '12px', borderRadius: '10px', background: '#F0F9FF', border: '1px solid #B2D8E5', marginBottom: '16px', fontSize: '0.82rem', color: '#0077B6', lineHeight: 1.4 }}>
                  ✓ <strong>Admin Session Active:</strong> You can edit water readings, common expenses, log maintenance payments, and send WhatsApp bills.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    className="app-btn app-btn-secondary"
                    onClick={() => setAdminTab('manage_rights')}
                    style={{ width: '100%', justifyContent: 'center', background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', padding: '10px 14px', fontSize: '0.82rem', whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.3 }}
                  >
                    <Crown size={16} style={{ flexShrink: 0 }} /> 👑 Manage Flat Admin Permissions (Root User Kamesh)
                  </button>

                  <button
                    type="button"
                    className="app-btn"
                    onClick={() => {
                      onAdminLogout();
                      onClose();
                    }}
                    style={{ width: '100%', justifyContent: 'center', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '10px 14px', fontSize: '0.82rem' }}
                  >
                    <Lock size={16} /> Lock / Logout Admin
                  </button>
                </div>
              </div>
            )}

            {adminTab === 'manage_rights' && (
              <div>
                <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: '12px', fontSize: '0.78rem', color: '#92400E', lineHeight: 1.4 }}>
                  👑 <strong>Root Controls (Flat 302 - Kamesh):</strong> Grant or revoke Admin editing rights for each flat owner.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '2px' }}>
                  {flatsList.filter((f) => f.flatNo !== 'WM').map((flat) => {
                    const isRoot = flat.flatNo === rootFlat;
                    const hasAdmin = adminFlats.includes(flat.flatNo) || isRoot;

                    return (
                      <div
                        key={flat.flatNo}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: isRoot ? '1px solid #FCD34D' : hasAdmin ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                          background: isRoot ? '#FEF3C7' : hasAdmin ? '#F0FDF4' : '#FFFFFF',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1D4ED8', background: '#EFF6FF', padding: '2px 6px', borderRadius: '5px', flexShrink: 0 }}>
                            #{flat.flatNo}
                          </span>
                          <div style={{ minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {flat.residentName}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {isRoot ? '👑 Root Super Admin' : hasAdmin ? '⭐ Co-Admin' : '👤 Resident/Tenant'}
                            </div>
                          </div>
                        </div>

                        <div style={{ flexShrink: 0 }}>
                          {isRoot ? (
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#B45309', background: '#FDE68A', padding: '3px 7px', borderRadius: '5px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Crown size={11} /> Root
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onToggleFlatAdmin?.(flat.flatNo)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '5px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                border: hasAdmin ? '1px solid #FECACA' : '1px solid #A7F3D0',
                                background: hasAdmin ? '#FEF2F2' : '#ECFDF5',
                                color: hasAdmin ? '#DC2626' : '#059669',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              {hasAdmin ? (
                                <>
                                  <UserX size={12} /> Revoke
                                </>
                              ) : (
                                <>
                                  <UserCheck size={12} /> Grant
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {adminTab === 'change_pin' && (
              <form onSubmit={handleChangePinSubmit}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Current Security PIN:</label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value)}
                    required
                    placeholder="Enter Current Security PIN"
                    style={{ fontSize: '0.92rem', padding: '9px 12px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>New Admin PIN:</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    required
                    placeholder="Enter New Security PIN (min 4 chars)"
                    style={{ fontSize: '0.92rem', padding: '9px 12px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="button" className="app-btn app-btn-secondary" onClick={() => setAdminTab('overview')} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="app-btn app-btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                    <Check size={16} /> Save New PIN
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
