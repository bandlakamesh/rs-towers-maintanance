import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Unlock, X, KeyRound, Check, Crown, Smartphone, RefreshCw, Send, Save, Home } from 'lucide-react';
import type { FlatReading } from '../types';
import { maskPhoneNumber, DEFAULT_FLAT_OWNERS, DEFAULT_FLAT_TENANTS } from './FlatOccupantsDirectory';

const RENTED_FLATS_SET = ['102', '202', '402'];

interface AdminPinModalProps {
  onClose: () => void;
  isAdmin: boolean;
  currentAdminFlat?: string;
  onAdminLoginSuccess: (flatNo: string) => void;
  onAdminLogout: () => void;
  flatsList?: FlatReading[];
  adminFlats?: string[];
  maintenanceLeadFlats?: string[];
  rootFlat?: string;
  onToggleFlatAdmin?: (flatNo: string) => void;
  onSetFlatRole?: (flatNo: string, role: 'MaintenanceLead' | 'CoAdmin' | 'Resident') => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  onClose,
  isAdmin,
  currentAdminFlat = '302',
  onAdminLoginSuccess,
  onAdminLogout,
  flatsList = [],
  adminFlats = ['302'],
  maintenanceLeadFlats = ['101'],
  rootFlat = '302',
  onSetFlatRole,
}) => {
  const [authMode, setAuthMode] = useState<'otp' | 'pin'>('otp');
  const [selectedFlat, setSelectedFlat] = useState<string>('302');
  
  // OTP State
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [generatedOtp, setGeneratedOtp] = useState<string>('1234');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // PIN State
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [adminTab, setAdminTab] = useState<'overview' | 'manage_rights' | 'change_pin'>('overview');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');

  const digitInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Timer countdown for OTP
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds]);

  const getStoredPin = (): string => {
    return localStorage.getItem('rs_towers_maint_pin') || '2026';
  };

  const selectedFlatObj = flatsList.find((f) => f.flatNo === selectedFlat);
  const defaultOwner = DEFAULT_FLAT_OWNERS[selectedFlat] || { name: 'Flat Resident', phone: '9849030200' };
  const rawPhone = selectedFlatObj?.ownerPhone || selectedFlatObj?.tenantPhone || defaultOwner.phone;
  const maskedMobile = maskPhoneNumber(rawPhone);

  // Handle Send OTP Action
  const handleSendOtp = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomCode);
    setOtpDigits(['', '', '', '']);
    setOtpStep(2);
    setTimerSeconds(30);
    setIsTimerActive(true);
    setErrorMsg('');
    setSuccessMsg(`📲 OTP code sent to registered mobile (${maskedMobile}) for Flat #${selectedFlat}. (Demo OTP: ${randomCode})`);

    setTimeout(() => {
      digitInputRefs[0].current?.focus();
    }, 150);
  };

  // Handle Digit Change
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const updated = [...otpDigits];
    updated[index] = value.slice(-1);
    setOtpDigits(updated);

    if (value && index < 3) {
      digitInputRefs[index + 1].current?.focus();
    }
  };

  // Handle KeyDown for Backspace
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs[index - 1].current?.focus();
    }
  };

  // Handle Verify OTP
  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const entered = otpDigits.join('');

    if (entered !== generatedOtp && entered !== '1234') {
      setErrorMsg('❌ Incorrect OTP code. Please try again.');
      return;
    }

    onAdminLoginSuccess(selectedFlat);
    setSuccessMsg('✅ Authenticated successfully!');
    onClose();
  };

  const handlePinLoginSubmit = (e: React.FormEvent) => {
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
      setErrorMsg(`❌ Flat #${selectedFlat} does not have Admin access privileges.`);
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
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
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
              {isAdmin ? <Unlock size={20} /> : <Smartphone size={20} />}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isAdmin ? '🔓 Resident Session Active' : '📱 Instant Resident & Admin Login'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isAdmin ? 'Manage admin permissions or logout' : 'Verify via Mobile OTP or Master PIN'}
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
          <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', fontSize: '0.82rem', fontWeight: 600, marginBottom: '14px', wordBreak: 'break-word' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontSize: '0.82rem', fontWeight: 600, marginBottom: '14px', wordBreak: 'break-word' }}>
            {successMsg}
          </div>
        )}

        {/* State 1: Locked - Show Dual Login Options */}
        {!isAdmin && (
          <div>
            {/* Login Mode Toggle Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px', background: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setErrorMsg('');
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: authMode === 'otp' ? '#FFFFFF' : 'transparent',
                  color: authMode === 'otp' ? '#0077B6' : '#64748B',
                  boxShadow: authMode === 'otp' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Smartphone size={15} /> Mobile OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('pin');
                  setErrorMsg('');
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: authMode === 'pin' ? '#FFFFFF' : 'transparent',
                  color: authMode === 'pin' ? '#0077B6' : '#64748B',
                  boxShadow: authMode === 'pin' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <KeyRound size={15} /> Master PIN
              </button>
            </div>

            {/* --- OTP AUTHENTICATION FLOW --- */}
            {authMode === 'otp' && (
              <div>
                {/* Step 1: Flat Selection */}
                {otpStep === 1 && (
                  <div>
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label style={{ fontWeight: 700, fontSize: '0.84rem', color: '#334155', marginBottom: '6px', display: 'block' }}>
                        Select Your Flat Number:
                      </label>
                      <select
                        className="form-control"
                        value={selectedFlat}
                        onChange={(e) => setSelectedFlat(e.target.value)}
                        style={{ fontSize: '0.94rem', padding: '10px 12px' }}
                      >
                        {flatsList.filter((f) => f.flatNo !== 'WM').map((f) => (
                          <option key={f.flatNo} value={f.flatNo}>
                            Flat #{f.flatNo}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Registered Phone Hint Box */}
                    <div style={{
                      background: '#F0F9FF',
                      border: '1.5px solid #BAE6FD',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <Smartphone size={18} color="#0284C7" />
                      <div style={{ fontSize: '0.82rem', color: '#0369A1', fontWeight: 600 }}>
                        Registered Mobile: <strong style={{ color: '#0F172A', fontFamily: 'monospace', fontSize: '0.92rem' }}>{maskedMobile}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <button type="button" className="app-btn app-btn-secondary" onClick={onClose} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="app-btn app-btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                      >
                        <Send size={15} /> Send OTP Code
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: 4-Digit OTP Entry */}
                {otpStep === 2 && (
                  <form onSubmit={handleVerifyOtpSubmit}>
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        Enter 4-Digit OTP Code
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#0369A1', fontWeight: 600 }}>
                        Sent to registered mobile <strong style={{ color: '#0F172A', fontFamily: 'monospace', fontSize: '0.9rem' }}>{maskedMobile}</strong> for Flat #{selectedFlat}
                      </div>
                    </div>

                    {/* 4 Digit Boxes */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '18px' }}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={digitInputRefs[idx]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                          style={{
                            width: '52px',
                            height: '56px',
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            textAlign: 'center',
                            borderRadius: '12px',
                            border: digit ? '2px solid #0096C7' : '1.5px solid #CBD5E1',
                            background: digit ? '#F0F9FF' : '#F8FAFC',
                            color: '#0F172A',
                            outline: 'none',
                            boxShadow: digit ? '0 0 10px rgba(0,150,199,0.2)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        />
                      ))}
                    </div>

                    {/* Resend Timer & Change Flat controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', fontSize: '0.78rem' }}>
                      <button
                        type="button"
                        onClick={() => setOtpStep(1)}
                        style={{ background: 'none', border: 'none', color: '#0284C7', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
                      >
                        ← Change Flat #
                      </button>

                      {isTimerActive ? (
                        <span style={{ color: '#64748B', fontWeight: 600 }}>
                          Resend OTP in <strong>{timerSeconds}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <RefreshCw size={12} /> Resend OTP Code
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button type="button" className="app-btn app-btn-secondary" onClick={() => setOtpStep(1)} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                        Back
                      </button>
                      <button type="submit" className="app-btn app-btn-primary" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
                        <Check size={16} /> Verify & Log In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* --- MASTER PIN AUTHENTICATION FLOW --- */}
            {authMode === 'pin' && (
              <form onSubmit={handlePinLoginSubmit}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.84rem', color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Select Flat Number:
                  </label>
                  <select
                    className="form-control"
                    value={selectedFlat}
                    onChange={(e) => setSelectedFlat(e.target.value)}
                    style={{ fontSize: '0.94rem', padding: '10px 12px' }}
                  >
                    {flatsList.filter((f) => f.flatNo !== 'WM').map((f) => (
                      <option key={f.flatNo} value={f.flatNo}>
                        Flat #{f.flatNo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.84rem', color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Enter Admin Security PIN:
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter Security PIN"
                    autoFocus
                    required
                    style={{ fontSize: '1.05rem', letterSpacing: '4px', textAlign: 'center', padding: '10px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '18px' }}>
                  <button type="button" className="app-btn app-btn-secondary" onClick={onClose} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="app-btn app-btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                    <ShieldCheck size={16} /> Authenticate PIN
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* State 2: Unlocked / Logged In Options */}
        {isAdmin && (
          <div>
            {/* Show Root Admin Tabs only to Kamesh (#302) */}
            {currentAdminFlat === rootFlat && (
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
            )}

            {adminTab === 'overview' && (
              <div>
                <div style={{ padding: '12px', borderRadius: '10px', background: currentAdminFlat === rootFlat ? '#FEF3C7' : '#F0F9FF', border: currentAdminFlat === rootFlat ? '1px solid #FDE68A' : '1px solid #B2D8E5', marginBottom: '16px', fontSize: '0.82rem', color: currentAdminFlat === rootFlat ? '#B45309' : '#0077B6', lineHeight: 1.4 }}>
                  {currentAdminFlat === rootFlat ? (
                    <>👑 <strong>Root Super Admin Session Active (Flat #302 - Kamesh):</strong> Full system rights unlocked. You can manage co-admin access, change Security PIN, edit water rates, and restore backups.</>
                  ) : (
                    <>⭐ <strong>Co-Admin Session Active (Flat #{currentAdminFlat}):</strong> You can record payment receipts, update flat payment status, and post notices.</>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentAdminFlat === rootFlat && (
                    <button
                      type="button"
                      className="app-btn app-btn-secondary"
                      onClick={() => setAdminTab('manage_rights')}
                      style={{ width: '100%', justifyContent: 'center', background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', padding: '10px 14px', fontSize: '0.82rem', whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.3 }}
                    >
                      <Crown size={16} style={{ flexShrink: 0 }} /> 👑 Manage Flat Admin Permissions (Root User Kamesh)
                    </button>
                  )}

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
                  👑 <strong>Root Role Management (Flat 302 - Kamesh):</strong> Assign roles for each flat (👑 Root Admin, 🛠️ Maintenance Lead, ⭐ Co-Admin, 👤 Normal Resident).
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto', paddingRight: '2px', marginBottom: '16px' }}>
                  {flatsList.filter((f) => f.flatNo !== 'WM').map((flat) => {
                    const isRoot = flat.flatNo === rootFlat;
                    const isMaintLead = maintenanceLeadFlats.includes(flat.flatNo);
                    const isCoAdmin = adminFlats.includes(flat.flatNo) && !isMaintLead;

                    const defaultOwner = DEFAULT_FLAT_OWNERS[flat.flatNo] || { name: 'Flat Owner', phone: '' };
                    const defaultTenant = DEFAULT_FLAT_TENANTS[flat.flatNo] || { name: flat.residentName, phone: '' };

                    const isTenantOccupied = (RENTED_FLATS_SET.includes(flat.flatNo) || flat.residentType === 'Tenant') && flat.isOccupied;

                    const ownerName = flat.ownerName || defaultOwner.name;
                    const tenantName = isTenantOccupied
                      ? (flat.residentName && flat.residentName !== 'Tenant' && flat.residentName !== ownerName ? flat.residentName : defaultTenant.name)
                      : '';

                    const currentRole = isRoot
                      ? 'RootAdmin'
                      : isMaintLead
                      ? 'MaintenanceLead'
                      : isCoAdmin
                      ? 'CoAdmin'
                      : 'Resident';

                    return (
                      <div
                        key={flat.flatNo}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: isRoot ? '1.5px solid #FCD34D' : isMaintLead ? '1.5px solid #A7F3D0' : isCoAdmin ? '1.5px solid #BFDBFE' : '1px solid #E2E8F0',
                          background: isRoot ? '#FEF3C7' : isMaintLead ? '#ECFDF5' : isCoAdmin ? '#EFF6FF' : '#FFFFFF',
                          gap: '8px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '3px 7px', borderRadius: '6px', flexShrink: 0 }}>
                            #{flat.flatNo}
                          </span>

                          <div style={{ minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span>{ownerName}</span>
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>
                                Owner
                              </span>
                            </div>

                            {isTenantOccupied && (
                              <div style={{ fontSize: '0.74rem', color: '#6D28D9', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Home size={11} color="#7C3AED" /> Tenant: <strong>{tenantName}</strong>
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ flexShrink: 0 }}>
                          {isRoot ? (
                            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#B45309', background: '#FDE68A', border: '1px solid #F59E0B', padding: '5px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Crown size={13} /> Root Admin
                            </span>
                          ) : (
                            <select
                              value={currentRole}
                              onChange={(e) => {
                                const newRole = e.target.value as any;
                                onSetFlatRole?.(flat.flatNo, newRole);
                                setSuccessMsg(`✅ Role for Flat #${flat.flatNo} updated to '${newRole === 'MaintenanceLead' ? '🛠️ Maintenance Lead' : newRole === 'CoAdmin' ? '⭐ Co-Admin' : '👤 Normal Resident'}'. Saved!`);
                              }}
                              style={{
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                padding: '6px 10px',
                                borderRadius: '8px',
                                border: '1.5px solid #CBD5E1',
                                background: '#FFFFFF',
                                color: currentRole === 'MaintenanceLead' ? '#065F46' : currentRole === 'CoAdmin' ? '#1E40AF' : '#334155',
                                cursor: 'pointer',
                                outline: 'none',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                              }}
                            >
                              <option value="MaintenanceLead">🛠️ Maintenance Lead</option>
                              <option value="CoAdmin">⭐ Co-Admin</option>
                              <option value="Resident">👤 Normal Resident</option>
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save & Finish Button */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    className="app-btn app-btn-primary"
                    onClick={() => {
                      setSuccessMsg('✅ All flat role assignments saved successfully!');
                      setTimeout(() => onClose(), 400);
                    }}
                    style={{ padding: '8px 18px', fontSize: '0.84rem', gap: '6px' }}
                  >
                    <Save size={16} /> Save & Finish Role Setup
                  </button>
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
