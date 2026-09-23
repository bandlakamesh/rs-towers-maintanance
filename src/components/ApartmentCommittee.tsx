import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, Camera, Phone, Mail, User, ExternalLink, X } from 'lucide-react';
import type { CommitteeMember, UserRole, FlatReading, FlatDirectoryEntry } from '../types';
import { maskPhoneNumber } from '../utils/whatsappFormatter';
import { DEFAULT_FLAT_OWNERS, DEFAULT_FLAT_TENANTS } from './FlatOccupantsDirectory';

interface ApartmentCommitteeProps {
  committeeMembers: CommitteeMember[];
  flatReadings?: FlatReading[];
  flatDirectory?: Record<string, FlatDirectoryEntry>;
  userRole: UserRole;
  isAdmin: boolean;
  onAddMember: (member: CommitteeMember) => void;
  onUpdateMember: (member: CommitteeMember) => void;
  onDeleteMember: (id: string) => void;
  treasurerUpiId?: string;
  treasurerPhone?: string;
  treasurerName?: string;
  onOpenAdminModal?: () => void;
}

const RESIDENT_ROSTER: Record<string, { name: string; phone: string; email: string }> = {
  '101': { name: 'Bobby', phone: '9963275455', email: 'bobby.flat101@rstowers.org' },
  '102': { name: 'Suresh', phone: '9849010201', email: 'suresh.flat102@rstowers.org' },
  '103': { name: 'Balaji', phone: '9849010300', email: 'balaji.flat103@rstowers.org' },
  '201': { name: 'Naveen Varma', phone: '9849020100', email: 'naveen.varma@rstowers.org' },
  '202': { name: 'Subba Rao', phone: '9849020201', email: 'subbarao.flat202@rstowers.org' },
  '203': { name: 'Harshavardhan', phone: '9849020300', email: 'harsha.flat203@rstowers.org' },
  '301': { name: 'Yugandhar', phone: '9849030100', email: 'yugandhar.flat301@rstowers.org' },
  '302': { name: 'Kamesh Bandla', phone: '9849030200', email: 'kamesh.bandla@rstowers.org' },
  '303': { name: 'Sharath Babu', phone: '9849030300', email: 'sharath.flat303@rstowers.org' },
  '401': { name: 'Arun', phone: '9849040100', email: 'arun.flat401@rstowers.org' },
  '402': { name: 'Ramesh', phone: '9849040201', email: 'ramesh.flat402@rstowers.org' },
  '403': { name: 'Ravi Shankar', phone: '9849040300', email: 'ravishankar.flat403@rstowers.org' },
  '501': { name: 'Srikanth', phone: '9849050100', email: 'srikanth.flat501@rstowers.org' },
  '502': { name: 'Prasanna', phone: '9849050200', email: 'prasanna.flat502@rstowers.org' },
  '503': { name: 'Venkateswara Rao', phone: '9849050300', email: 'venkatesh.flat503@rstowers.org' },
};

export const ApartmentCommittee: React.FC<ApartmentCommitteeProps> = ({
  committeeMembers,
  flatReadings = [],
  flatDirectory,
  userRole,
  isAdmin,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  treasurerUpiId = '9963275455@upi',
  treasurerPhone = '9963275455',
  treasurerName = 'Bobby (Flat 101 - Maintenance Lead)',
  onOpenAdminModal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState<CommitteeMember['designation']>('Executive Member');
  const [flatNo, setFlatNo] = useState('101');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [termPeriod, setTermPeriod] = useState('2025 - 2027');
  const [photoUrl, setPhotoUrl] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [selectedRosterKey, setSelectedRosterKey] = useState<string>('101');

  const canEdit = userRole === 'RootAdmin' || userRole === 'MaintenanceLead';
  const isPublicViewer = !isAdmin;

  const getRosterMemberInfo = (flatNum: string) => {
    const dirEntry = flatDirectory?.[flatNum];
    const flatItem = flatReadings?.find((f) => f.flatNo === flatNum);
    const defaultOwner = DEFAULT_FLAT_OWNERS[flatNum];
    const defaultTenant = DEFAULT_FLAT_TENANTS[flatNum];

    const resolvedName =
      dirEntry?.ownerName ||
      dirEntry?.residentName ||
      flatItem?.ownerName ||
      flatItem?.residentName ||
      defaultOwner?.name ||
      defaultTenant?.name ||
      RESIDENT_ROSTER[flatNum]?.name ||
      `Flat #${flatNum}`;

    const resolvedPhone =
      dirEntry?.ownerPhone ||
      dirEntry?.tenantPhone ||
      flatItem?.ownerPhone ||
      flatItem?.tenantPhone ||
      defaultOwner?.phone ||
      defaultTenant?.phone ||
      RESIDENT_ROSTER[flatNum]?.phone ||
      '';

    const email = RESIDENT_ROSTER[flatNum]?.email || `resident.flat${flatNum}@rstowers.org`;

    return { name: resolvedName, phone: resolvedPhone, email };
  };

  const flatOptions =
    flatReadings && flatReadings.length > 0
      ? flatReadings.filter((f) => f.flatNo !== 'WM').map((f) => f.flatNo)
      : Object.keys(RESIDENT_ROSTER);

  const handleSelectRosterMember = (key: string) => {
    setSelectedRosterKey(key);
    if (key && key !== 'CUSTOM') {
      const info = getRosterMemberInfo(key);
      setName(info.name);
      setFlatNo(key);
      setPhone(info.phone);
      setEmail(info.email);
    }
  };

  const handleOpenAdd = () => {
    setEditingMember(null);
    const defaultFlat = flatOptions[0] || '101';
    const info = getRosterMemberInfo(defaultFlat);
    setSelectedRosterKey(defaultFlat);
    setName(info.name);
    setDesignation('Executive Member');
    setFlatNo(defaultFlat);
    setPhone(info.phone);
    setEmail(info.email);
    setTermPeriod('2025 - 2027');
    setPhotoUrl('');
    setResponsibilitiesText('Building Operations & Resident Support');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: CommitteeMember) => {
    setEditingMember(m);
    const info = getRosterMemberInfo(m.flatNo);
    setName(info.name || m.name);
    setDesignation(m.designation);
    setFlatNo(m.flatNo);
    setPhone(info.phone || m.phone);
    setEmail(m.email || info.email);
    setTermPeriod(m.termPeriod || '2025 - 2027');
    setPhotoUrl(m.photoUrl || '');
    setResponsibilitiesText(m.responsibilities ? m.responsibilities.join('\n') : '');
    setSelectedRosterKey(m.flatNo);
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('⚠️ Image file size should be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please fill in Member Name and Phone Number.');
      return;
    }

    const responsibilities = responsibilitiesText
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (editingMember) {
      onUpdateMember({
        ...editingMember,
        name,
        designation,
        flatNo,
        phone,
        email,
        termPeriod,
        photoUrl,
        responsibilities,
      });
    } else {
      onAddMember({
        id: `cm-${Date.now()}`,
        name,
        designation,
        flatNo,
        phone,
        email,
        termPeriod,
        photoUrl,
        responsibilities,
      });
    }

    setIsModalOpen(false);
  };

  const getDesignationBadge = (desig: CommitteeMember['designation']) => {
    switch (desig) {
      case 'President & Super Admin':
        return { label: '👑 President & Root Admin', bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', text: '#92400E', border: '#F59E0B' };
      case 'Maintenance Lead & Treasurer':
        return { label: '🛠️ Maintenance Lead & Treasurer', bg: 'linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)', text: '#065F46', border: '#10B981' };
      case 'Vice President':
        return { label: '⭐ Vice President', bg: 'linear-gradient(135deg, #EFF6FF 0%, #BFDBFE 100%)', text: '#1E40AF', border: '#3B82F6' };
      case 'General Secretary':
        return { label: '📜 General Secretary', bg: 'linear-gradient(135deg, #F5F3FF 0%, #DDD6FE 100%)', text: '#5B21B6', border: '#8B5CF6' };
      case 'Security & Facility Lead':
        return { label: '🛡️ Security & Facility Lead', bg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', text: '#9A3412', border: '#F97316' };
      default:
        return { label: `🏅 ${desig}`, bg: '#F1F5F9', text: '#334155', border: '#CBD5E1' };
    }
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      
      {/* Header Banner */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          padding: '24px',
          borderRadius: '20px',
          marginBottom: '24px',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ background: '#38BDF822', border: '1px solid #38BDF844', borderRadius: '10px', padding: '6px' }}>
              <Shield size={24} color="#38BDF8" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#F8FAFC' }}>
              🏛️ R.S. Towers Executive Management Committee
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94A3B8' }}>
            Official Elected Association Office Bearers • Term Period (2025 - 2027)
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAdd}
            className="app-btn app-btn-primary"
            style={{ padding: '10px 18px', fontSize: '0.88rem', gap: '8px' }}
          >
            <Plus size={18} /> Add Committee Member
          </button>
        )}
      </div>

      {/* Grid of Committee Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {committeeMembers.map((member) => {
          const badge = getDesignationBadge(member.designation);
          const info = getRosterMemberInfo(member.flatNo);
          const resolvedName = info.name || member.name;
          const resolvedPhone = info.phone || member.phone;

          const displayPhone = isPublicViewer ? maskPhoneNumber(resolvedPhone) : resolvedPhone;
          const isTreasurerRole = member.designation === 'Maintenance Lead & Treasurer' || member.designation.includes('Treasurer') || member.designation.includes('Maintenance Lead');

          const displayResponsibilities = (isTreasurerRole && (!member.responsibilities || member.responsibilities.length === 0 || (member.responsibilities.length === 1 && member.responsibilities[0].includes('Building Operations'))))
            ? [
                'Monthly Dues Collection & Payment Verification',
                'Water Tanker Audits & Municipal Water Share Accounting',
                'Building Electricity, Lift AMC & Common Expenses',
                'Apartment Maintenance Fund & Bank Account Management',
              ]
            : member.responsibilities;

          return (
            <div
              key={member.id}
              className="app-card hover-lift"
              style={{
                borderRadius: '18px',
                border: isTreasurerRole ? '2px solid #A7F3D0' : '1px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#FFFFFF',
                boxShadow: isTreasurerRole ? '0 6px 18px rgba(5, 150, 105, 0.08)' : '0 4px 14px rgba(0,0,0,0.04)',
                position: 'relative',
              }}
            >
              <div>
                {/* Top Row: Photo Avatar & Designation Badge */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
                  {/* Avatar Container */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={resolvedName}
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `3px solid ${badge.border}`,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '50%',
                          background: badge.bg,
                          border: `3px solid ${badge.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: badge.text,
                          fontWeight: 800,
                          fontSize: '1.4rem',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                        }}
                      >
                        {resolvedName.charAt(0)}
                      </div>
                    )}

                    {canEdit && (
                      <button
                        onClick={() => handleOpenEdit(member)}
                        style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-2px',
                          background: '#0F172A',
                          color: '#FFF',
                          border: '2px solid #FFF',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        title="Upload/Change Profile Photo"
                      >
                        <Camera size={12} />
                      </button>
                    )}
                  </div>

                  {/* Name & Designation Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: badge.text,
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        padding: '3px 8px',
                        borderRadius: '12px',
                        display: 'inline-block',
                        marginBottom: '6px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      {badge.label}
                    </span>
                    <h3 style={{ margin: '0 0 2px 0', fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                      {resolvedName}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#64748B', fontWeight: 600 }}>
                      <span style={{ color: '#0284C7', background: '#E0F2FE', padding: '1px 6px', borderRadius: '4px', fontSize: '0.78rem' }}>
                        Flat #{member.flatNo}
                      </span>
                      <span>•</span>
                      <span>{member.termPeriod}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '10px 12px', marginBottom: '14px', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#334155', fontWeight: 600, marginBottom: (member.email || info.email) ? '6px' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="#0284C7" />
                      <span>{displayPhone}</span>
                    </div>
                    <a
                      href={`https://wa.me/91${resolvedPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#059669', fontWeight: 700, textDecoration: 'none', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      WhatsApp <ExternalLink size={11} />
                    </a>
                  </div>
                  {(member.email || info.email) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.8rem' }}>
                      <Mail size={13} color="#64748B" />
                      <span>{member.email || info.email}</span>
                    </div>
                  )}
                </div>

                {/* Dedicated Official Payment UPI Box for Treasurer / Maintenance Lead */}
                {isTreasurerRole && (
                  <div style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)', border: '1.5px solid #A7F3D0', borderRadius: '12px', padding: '10px 12px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>💳 Official Maintenance Payment UPI</span>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={onOpenAdminModal}
                          style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 800, textDecoration: 'underline' }}
                        >
                          ✏️ Edit UPI
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <code style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A', background: '#FFFFFF', padding: '2px 8px', borderRadius: '6px', border: '1px solid #6EE7B7' }}>
                        {treasurerUpiId || '9963275455@upi'}
                      </code>
                      <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 600 }}>
                        • Recipient: <strong>{treasurerName}</strong> (Mobile: {treasurerPhone})
                      </span>
                    </div>
                  </div>
                )}

                {/* Key Responsibilities */}
                {displayResponsibilities && displayResponsibilities.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Key Responsibilities
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
                      {displayResponsibilities.map((resp, idx) => (
                        <li key={idx} style={{ marginBottom: '3px' }}>
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons for Admins */}
              {canEdit && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    onClick={() => handleOpenEdit(member)}
                    className="app-btn app-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  {userRole === 'RootAdmin' && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove ${resolvedName} from Executive Committee?`)) {
                          onDeleteMember(member.id);
                        }
                      }}
                      style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Add / Edit Committee Member */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999,
          }}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4)',
              border: '1px solid #CBD5E1',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
              zIndex: 10000,
            }}
          >
            {/* Modal Header Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                padding: '20px 24px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38BDF8',
                    flexShrink: 0,
                  }}
                >
                  <Shield size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC' }}>
                    {editingMember ? '✏️ Edit Committee Member' : '➕ Add Committee Member'}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    R.S. Towers Management Roster
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Photo Upload Section */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: '#F8FAFC',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    border: '1.5px dashed #CBD5E1',
                  }}
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Preview"
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #0284C7',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: '#E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748B',
                      }}
                    >
                      <User size={32} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        color: '#0F172A',
                        marginBottom: '4px',
                      }}
                    >
                      Profile Photo / Avatar
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ fontSize: '0.8rem', color: '#334155', width: '100%' }}
                    />
                    <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                      Max size: 2MB (JPG, PNG, WebP)
                    </span>
                  </div>
                </div>

                {/* Name & Flat No */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <select
                      className="form-control"
                      value={selectedRosterKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'CUSTOM') {
                          setSelectedRosterKey('CUSTOM');
                        } else {
                          handleSelectRosterMember(val);
                        }
                      }}
                      style={{ padding: '10px 14px', fontSize: '0.88rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1', marginBottom: selectedRosterKey === 'CUSTOM' ? '6px' : 0 }}
                    >
                      {flatOptions.map((fNum) => {
                        const info = getRosterMemberInfo(fNum);
                        return (
                          <option key={fNum} value={fNum}>
                            {info.name} (Flat #{fNum})
                          </option>
                        );
                      })}
                      <option value="CUSTOM">✏️ Custom / Other Name...</option>
                    </select>

                    {selectedRosterKey === 'CUSTOM' && (
                      <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter full name"
                        required
                        style={{ padding: '8px 12px', fontSize: '0.86rem', marginTop: '6px' }}
                      />
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                      Flat # *
                    </label>
                    <select
                      className="form-control"
                      value={flatNo}
                      onChange={(e) => handleSelectRosterMember(e.target.value)}
                      style={{ padding: '10px 14px', fontSize: '0.88rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}
                    >
                      {flatOptions.map((fNum) => (
                        <option key={fNum} value={fNum}>
                          Flat #{fNum}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Designation & Term */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                      Designation / Role *
                    </label>
                    <select
                      className="form-control"
                      value={designation}
                      onChange={(e) => {
                        const newDesig = e.target.value as any;
                        setDesignation(newDesig);
                        if (newDesig === 'Maintenance Lead & Treasurer') {
                          setResponsibilitiesText(
                            'Monthly Dues Collection & Payment Verification\nWater Tanker Audits & Municipal Water Share Accounting\nBuilding Electricity, Lift AMC & Common Expenses\nApartment Maintenance Fund & Bank Account Management'
                          );
                        }
                      }}
                      style={{ padding: '10px 14px', fontSize: '0.88rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}
                    >
                      <option value="President & Super Admin">👑 President & Super Admin</option>
                      <option value="Maintenance Lead & Treasurer">🛠️ Maintenance Lead & Treasurer</option>
                      <option value="Vice President">⭐ Vice President</option>
                      <option value="General Secretary">📜 General Secretary</option>
                      <option value="Joint Secretary">✍️ Joint Secretary</option>
                      <option value="Security & Facility Lead">🛡️ Security & Facility Lead</option>
                      <option value="Executive Member">🏅 Executive Member</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                      Term Period
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={termPeriod}
                      onChange={(e) => setTermPeriod(e.target.value)}
                      placeholder="e.g. 2025 - 2027"
                      style={{ padding: '10px 14px', fontSize: '0.9rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9849030200"
                      required
                      style={{ padding: '10px 14px', fontSize: '0.9rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@rstowers.org"
                      style={{ padding: '10px 14px', fontSize: '0.9rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}
                    />
                  </div>
                </div>

                {/* Responsibilities */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                    Key Responsibilities (One per line)
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={responsibilitiesText}
                    onChange={(e) => setResponsibilitiesText(e.target.value)}
                    placeholder="e.g. Monthly Dues Collection&#10;Water Tanker Management"
                    style={{ padding: '10px 14px', fontSize: '0.88rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}
                  />
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    marginTop: '10px',
                    paddingTop: '16px',
                    borderTop: '1px solid #E2E8F0',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="app-btn app-btn-secondary"
                    style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="app-btn app-btn-primary"
                    style={{ padding: '10px 22px', fontSize: '0.88rem' }}
                  >
                    Save Committee Member
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
