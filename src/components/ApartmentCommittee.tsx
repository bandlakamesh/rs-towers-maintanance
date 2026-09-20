import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, Camera, Phone, Mail, User, ExternalLink } from 'lucide-react';
import type { CommitteeMember, UserRole } from '../types';
import { maskPhoneNumber } from '../utils/whatsappFormatter';

interface ApartmentCommitteeProps {
  committeeMembers: CommitteeMember[];
  userRole: UserRole;
  isAdmin: boolean;
  onAddMember: (member: CommitteeMember) => void;
  onUpdateMember: (member: CommitteeMember) => void;
  onDeleteMember: (id: string) => void;
}

export const ApartmentCommittee: React.FC<ApartmentCommitteeProps> = ({
  committeeMembers,
  userRole,
  isAdmin,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
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

  const canEdit = userRole === 'RootAdmin' || userRole === 'MaintenanceLead';
  const isPublicViewer = !isAdmin;

  const handleOpenAdd = () => {
    setEditingMember(null);
    setName('');
    setDesignation('Executive Member');
    setFlatNo('101');
    setPhone('9849000000');
    setEmail('');
    setTermPeriod('2025 - 2027');
    setPhotoUrl('');
    setResponsibilitiesText('Building Operations & Resident Support');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: CommitteeMember) => {
    setEditingMember(m);
    setName(m.name);
    setDesignation(m.designation);
    setFlatNo(m.flatNo);
    setPhone(m.phone);
    setEmail(m.email || '');
    setTermPeriod(m.termPeriod || '2025 - 2027');
    setPhotoUrl(m.photoUrl || '');
    setResponsibilitiesText(m.responsibilities ? m.responsibilities.join('\n') : '');
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
          const displayPhone = isPublicViewer ? maskPhoneNumber(member.phone) : member.phone;

          return (
            <div
              key={member.id}
              className="app-card hover-lift"
              style={{
                borderRadius: '18px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
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
                        alt={member.name}
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
                        {member.name.charAt(0)}
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
                      {member.name}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#334155', fontWeight: 600, marginBottom: member.email ? '6px' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} color="#0284C7" />
                      <span>{displayPhone}</span>
                    </div>
                    <a
                      href={`https://wa.me/91${member.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#059669', fontWeight: 700, textDecoration: 'none', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      WhatsApp <ExternalLink size={11} />
                    </a>
                  </div>
                  {member.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.8rem' }}>
                      <Mail size={13} color="#64748B" />
                      <span>{member.email}</span>
                    </div>
                  )}
                </div>

                {/* Key Responsibilities */}
                {member.responsibilities && member.responsibilities.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      Key Responsibilities
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
                      {member.responsibilities.map((resp, idx) => (
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
                        if (confirm(`Are you sure you want to remove ${member.name} from Executive Committee?`)) {
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
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>{editingMember ? '✏️ Edit Committee Member' : '➕ Add Committee Member'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">&times;</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
              
              {/* Photo Upload Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                {photoUrl ? (
                  <img src={photoUrl} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                    <User size={28} />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Profile Photo / Avatar
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ fontSize: '0.8rem' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '2px' }}>
                    Max size: 2MB (JPG, PNG, WebP)
                  </span>
                </div>
              </div>

              {/* Name & Flat No */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kamesh Bandla"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Flat # *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={flatNo}
                    onChange={(e) => setFlatNo(e.target.value)}
                    placeholder="e.g. 302"
                    required
                  />
                </div>
              </div>

              {/* Designation & Term */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Designation / Role *</label>
                  <select
                    className="form-control"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value as any)}
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
                  <label className="form-label">Term Period</label>
                  <input
                    type="text"
                    className="form-control"
                    value={termPeriod}
                    onChange={(e) => setTermPeriod(e.target.value)}
                    placeholder="e.g. 2025 - 2027"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9849030200"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email (Optional)</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@rstowers.org"
                  />
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <label className="form-label">Key Responsibilities (One per line)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={responsibilitiesText}
                  onChange={(e) => setResponsibilitiesText(e.target.value)}
                  placeholder="e.g. Monthly Dues Collection&#10;Water Tanker Management"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="app-btn app-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                >
                  Save Committee Member
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
