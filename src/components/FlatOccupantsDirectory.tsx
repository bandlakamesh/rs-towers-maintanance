import React, { useState } from 'react';
import { Search, UserCheck, Phone, MessageSquare, Edit3, Check, X, Shield, Crown, Home } from 'lucide-react';
import type { MonthMaintenanceRecord, FlatReading, UserRole, FlatDirectoryEntry } from '../types';

interface FlatOccupantsDirectoryProps {
  record: MonthMaintenanceRecord;
  flatDirectory?: Record<string, FlatDirectoryEntry>;
  isAdmin: boolean;
  userRole?: UserRole;
  onUpdateReadings: (updatedReadings: FlatReading[]) => void;
  onUpdateDirectory?: (updatedReadings: FlatReading[]) => void;
  onOpenAdminModal?: () => void;
}

export const maskPhoneNumber = (phone: string): string => {
  if (!phone) return '98490****00';
  const clean = phone.replace(/\D/g, '');
  if (clean.length >= 10) {
    return `${clean.substring(0, 5)}****${clean.substring(clean.length - 2)}`;
  }
  return `${phone.substring(0, 3)}****${phone.substring(phone.length - 2)}`;
};

// Known Rented Flats list in RS Towers
const RENTED_FLATS = ['102', '202', '402'];

// Default fallback data for RS Towers flat owners & tenants
export const DEFAULT_FLAT_OWNERS: Record<string, { name: string; phone: string }> = {
  '101': { name: 'Bobby', phone: '9963275455' },
  '102': { name: 'Suresh', phone: '9849010201' },
  '103': { name: 'Balaji', phone: '9849010300' },
  '201': { name: 'Naveen Varma', phone: '9849020100' },
  '202': { name: 'Subba Rao', phone: '9849020201' },
  '203': { name: 'Harshavardhan', phone: '9849020300' },
  '301': { name: 'Yugandhar', phone: '9849030100' },
  '302': { name: 'Kamesh', phone: '9849030200' },
  '303': { name: 'Sharath Babu', phone: '9849030300' },
  '401': { name: 'Arun', phone: '9849040100' },
  '402': { name: 'Ramesh', phone: '9849040201' },
  '403': { name: 'Ravi Shankar', phone: '9849040300' },
  '501': { name: 'Srikanth', phone: '9849050100' },
  '502': { name: 'Prasanna', phone: '9849050200' },
  '503': { name: 'Venkateswara Rao', phone: '9849050300' },
};

export const DEFAULT_FLAT_TENANTS: Record<string, { name: string; phone: string }> = {
  '102': { name: 'Venkat (Tenant)', phone: '9849010200' },
  '202': { name: 'Satya Nimmakayala', phone: '9849020200' },
  '402': { name: 'Ujwala', phone: '9849040200' },
};

export const FlatOccupantsDirectory: React.FC<FlatOccupantsDirectoryProps> = ({
  record,
  flatDirectory,
  isAdmin,
  userRole = 'PublicResident',
  onUpdateReadings,
  onUpdateDirectory,
  onOpenAdminModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Owner' | 'Tenant' | 'Vacant'>('All');

  // Edit resident modal state
  const [editingFlat, setEditingFlat] = useState<FlatReading | null>(null);
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerPhone, setEditOwnerPhone] = useState('');
  const [editResidentName, setEditResidentName] = useState('');
  const [editTenantPhone, setEditTenantPhone] = useState('');
  const [editType, setEditType] = useState<'Owner' | 'Tenant'>('Owner');
  const [editOccupied, setEditOccupied] = useState(true);

  const isPublic = userRole === 'PublicResident';

  const allFlats = record.flatReadings.filter((f) => f.flatNo !== 'WM');

  const occupiedFlats = allFlats.filter((f) => f.isOccupied);
  const ownerFlats = occupiedFlats.filter((f) => f.residentType === 'Owner' && !RENTED_FLATS.includes(f.flatNo));
  const tenantFlats = occupiedFlats.filter((f) => f.residentType === 'Tenant' || RENTED_FLATS.includes(f.flatNo));
  const vacantFlats = allFlats.filter((f) => !f.isOccupied);

  const filteredFlats = allFlats.filter((f) => {
    const dirEntry = flatDirectory?.[f.flatNo];
    const isTenant = RENTED_FLATS.includes(f.flatNo) || (dirEntry?.residentType || f.residentType) === 'Tenant';
    const ownerData = DEFAULT_FLAT_OWNERS[f.flatNo] || { name: 'Flat Owner', phone: '9963275455' };
    const tenantData = DEFAULT_FLAT_TENANTS[f.flatNo] || { name: f.residentName, phone: '9849010200' };

    const ownerName = f.ownerName || dirEntry?.ownerName || ownerData.name;
    const ownerPhone = f.ownerPhone || dirEntry?.ownerPhone || ownerData.phone;
    const residentName = f.residentName || dirEntry?.residentName || (isTenant ? tenantData.name : ownerName);
    const tenantPhone = f.tenantPhone || dirEntry?.tenantPhone || tenantData.phone;

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      f.flatNo.toLowerCase().includes(term) ||
      residentName.toLowerCase().includes(term) ||
      ownerName.toLowerCase().includes(term) ||
      ownerPhone.includes(term) ||
      tenantPhone.includes(term);

    if (!matchesSearch) return false;

    if (filterType === 'Owner') return f.isOccupied && !isTenant;
    if (filterType === 'Tenant') return f.isOccupied && isTenant;
    if (filterType === 'Vacant') return !f.isOccupied;
    return true;
  }).sort((a, b) => {
    const numA = parseInt(a.flatNo.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.flatNo.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

  const handleOpenEdit = (flat: FlatReading) => {
    const dirEntry = flatDirectory?.[flat.flatNo];
    const isTenant = RENTED_FLATS.includes(flat.flatNo) || (dirEntry?.residentType || flat.residentType) === 'Tenant';
    const ownerData = DEFAULT_FLAT_OWNERS[flat.flatNo] || { name: 'Flat Owner', phone: '9963275455' };
    const tenantData = DEFAULT_FLAT_TENANTS[flat.flatNo] || { name: flat.residentName, phone: '9849010200' };

    setEditingFlat(flat);
    setEditOwnerName(flat.ownerName || dirEntry?.ownerName || ownerData.name);
    setEditOwnerPhone(flat.ownerPhone || dirEntry?.ownerPhone || ownerData.phone);
    setEditResidentName(flat.residentName || dirEntry?.residentName || (isTenant ? tenantData.name : ownerData.name));
    setEditTenantPhone(flat.tenantPhone || dirEntry?.tenantPhone || tenantData.phone);
    setEditType(isTenant ? 'Tenant' : 'Owner');
    setEditOccupied(flat.isOccupied);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlat) return;

    const updated = record.flatReadings.map((f) => {
      if (f.flatNo === editingFlat.flatNo) {
        return {
          ...f,
          ownerName: editOwnerName,
          ownerPhone: editOwnerPhone,
          residentName: editType === 'Owner' ? editOwnerName : editResidentName,
          tenantPhone: editTenantPhone,
          residentType: editType,
          isOccupied: editOccupied,
        };
      }
      return f;
    });

    if (onUpdateDirectory) {
      onUpdateDirectory(updated);
    } else {
      onUpdateReadings(updated);
    }
    setEditingFlat(null);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      
      {/* Section Title Bar */}
      <div className="table-header-bar">
        <div className="section-header-title">
          <h2>
            <UserCheck style={{ color: '#0096C7' }} /> Flat Occupants & Resident Directory
          </h2>
          <p>
            Official directory showing Real Flat Owners & Current Tenant details side-by-side
          </p>
        </div>

        {/* Filter Chips */}
        <div className="chip-group">
          <button
            className={`chip ${filterType === 'All' ? 'active' : ''}`}
            onClick={() => setFilterType('All')}
          >
            All Flats ({allFlats.length})
          </button>
          <button
            className={`chip ${filterType === 'Owner' ? 'active' : ''}`}
            onClick={() => setFilterType('Owner')}
          >
            👑 Owners ({ownerFlats.length})
          </button>
          <button
            className={`chip ${filterType === 'Tenant' ? 'active' : ''}`}
            onClick={() => setFilterType('Tenant')}
          >
            🏠 Tenants ({tenantFlats.length})
          </button>
          <button
            className={`chip ${filterType === 'Vacant' ? 'active' : ''}`}
            onClick={() => setFilterType('Vacant')}
          >
            ⚪ Vacant ({vacantFlats.length})
          </button>
        </div>
      </div>

      {/* PII Privacy Safeguard Banner for Public Readers */}
      {isPublic && (
        <div style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          border: '1.5px solid #BFDBFE',
          borderRadius: '14px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(29, 78, 216, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#3B82F6',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Shield size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '0.86rem', color: '#1E40AF', display: 'block' }}>
                🔒 PII Privacy Shield Active (Public Read-Only Mode)
              </strong>
              <span style={{ fontSize: '0.76rem', color: '#1E3A8A' }}>
                Resident phone numbers are masked for public security when sharing in group chats. Unlock Admin mode to view full contacts.
              </span>
            </div>
          </div>
          {onOpenAdminModal && (
            <button
              onClick={onOpenAdminModal}
              className="app-btn app-btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            >
              <Shield size={14} /> Unlock Contacts
            </button>
          )}
        </div>
      )}

      {/* Roster KPI Summary Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div className="app-card" style={{ padding: '14px', borderLeft: '4px solid #10B981', background: '#F0FDF4' }}>
          <span style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Occupied Flats</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065F46' }}>
            {occupiedFlats.length} / {allFlats.length} <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>({Math.round((occupiedFlats.length / allFlats.length) * 100)}%)</span>
          </div>
        </div>

        <div className="app-card" style={{ padding: '14px', borderLeft: '4px solid #0284C7', background: '#F0F9FF' }}>
          <span style={{ fontSize: '0.76rem', color: '#0369A1', fontWeight: 700, textTransform: 'uppercase' }}>Flat Owners Residing</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#075985' }}>
            {ownerFlats.length} Flats
          </div>
        </div>

        <div className="app-card" style={{ padding: '14px', borderLeft: '4px solid #8B5CF6', background: '#F5F3FF' }}>
          <span style={{ fontSize: '0.76rem', color: '#6D28D9', fontWeight: 700, textTransform: 'uppercase' }}>Tenant Occupied</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#5B21B6' }}>
            {tenantFlats.length} Flats
          </div>
        </div>

        <div className="app-card" style={{ padding: '14px', borderLeft: '4px solid #64748B', background: '#F8FAFC' }}>
          <span style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Vacant Flats</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#334155' }}>
            {vacantFlats.length} Flat
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748B' }} />
        <input
          type="text"
          className="form-control"
          placeholder="Search by Flat #, Owner Name, Tenant Name, or Mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '36px' }}
        />
      </div>

      {/* Grid of Resident Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', alignItems: 'stretch' }}>
        {filteredFlats.map((flat) => {
          const dirEntry = flatDirectory?.[flat.flatNo];
          const isTenantOccupied = (RENTED_FLATS.includes(flat.flatNo) || (dirEntry?.residentType || flat.residentType) === 'Tenant') && flat.isOccupied;
          const isOwnerOccupied = !isTenantOccupied && flat.isOccupied;
          const isVacant = !flat.isOccupied;

          const defaultOwner = DEFAULT_FLAT_OWNERS[flat.flatNo] || { name: 'Flat Owner', phone: '9963275455' };
          const defaultTenant = DEFAULT_FLAT_TENANTS[flat.flatNo] || { name: flat.residentName, phone: '9849010200' };

          const rawOwnerPhone = flat.ownerPhone || dirEntry?.ownerPhone || defaultOwner.phone;
          const rawTenantPhone = flat.tenantPhone || dirEntry?.tenantPhone || defaultTenant.phone;

          const ownerName = flat.ownerName || dirEntry?.ownerName || defaultOwner.name;
          const ownerPhone = isPublic ? maskPhoneNumber(rawOwnerPhone) : rawOwnerPhone;

          const tenantName = isTenantOccupied
            ? (flat.residentName || dirEntry?.residentName || defaultTenant.name)
            : defaultTenant.name;
          const tenantPhone = isPublic ? maskPhoneNumber(rawTenantPhone) : rawTenantPhone;

          return (
            <div
              key={flat.flatNo}
              className="app-card"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isVacant ? '1.5px solid #E2E8F0' : isTenantOccupied ? '1.5px solid #C4B5FD' : '1.5px solid #A7F3D0',
                background: isVacant ? '#F8FAFC' : isTenantOccupied ? '#F5F3FF' : '#F0FDF4',
                height: '100%',
              }}
            >
              <div>
                {/* Card Header: Flat Number & Badge (No text wrap!) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '6px', flexWrap: 'nowrap' }}>
                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: '#1D4ED8',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    padding: '3px 9px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    Flat #{flat.flatNo}
                  </span>

                  {isVacant ? (
                    <span style={{ fontSize: '0.74rem', color: '#64748B', background: '#E2E8F0', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      ⚪ Vacant
                    </span>
                  ) : isOwnerOccupied ? (
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#047857', background: '#D1FAE5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      👑 Owner Occupied
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#6D28D9', background: '#EDE9FE', border: '1px solid #DDD6FE', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      🏠 Rented to Tenant
                    </span>
                  )}
                </div>

                {/* --- RENTED FLAT VIEW (Show BOTH Owner & Tenant details) --- */}
                {isTenantOccupied && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Real Flat Owner Box */}
                    <div style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #FDE68A',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)'
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Crown size={12} color="#D97706" /> Real Flat Owner
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', marginBottom: '3px' }}>
                        {ownerName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        <Phone size={12} color="#D97706" />
                        <span>Owner Mobile: <strong>{ownerPhone}</strong></span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a
                          href={isPublic ? '#' : `tel:${rawOwnerPhone}`}
                          onClick={(e) => {
                            if (isPublic) {
                              e.preventDefault();
                              onOpenAdminModal?.();
                            }
                          }}
                          className="app-btn app-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', flex: 1, justifyContent: 'center' }}
                        >
                          <Phone size={11} /> {isPublic ? 'Unlock Contact' : 'Call Owner'}
                        </a>
                        <a
                          href={isPublic ? '#' : `https://wa.me/91${rawOwnerPhone}`}
                          target={isPublic ? '_self' : '_blank'}
                          rel="noreferrer"
                          onClick={(e) => {
                            if (isPublic) {
                              e.preventDefault();
                              onOpenAdminModal?.();
                            }
                          }}
                          className="app-btn app-btn-whatsapp"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', flex: 1, justifyContent: 'center' }}
                        >
                          <MessageSquare size={11} /> WhatsApp
                        </a>
                      </div>
                    </div>

                    {/* Current Tenant Box */}
                    <div style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #DDD6FE',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      boxShadow: '0 2px 8px rgba(109, 40, 217, 0.08)'
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Home size={12} color="#7C3AED" /> Current Tenant (Occupant)
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A', marginBottom: '3px' }}>
                        {tenantName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        <Phone size={12} color="#7C3AED" />
                        <span>Tenant Mobile: <strong>{tenantPhone}</strong></span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a
                          href={isPublic ? '#' : `tel:${rawTenantPhone}`}
                          onClick={(e) => {
                            if (isPublic) {
                              e.preventDefault();
                              onOpenAdminModal?.();
                            }
                          }}
                          className="app-btn app-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', flex: 1, justifyContent: 'center' }}
                        >
                          <Phone size={11} /> {isPublic ? 'Unlock Contact' : 'Call Tenant'}
                        </a>
                        <a
                          href={isPublic ? '#' : `https://wa.me/91${rawTenantPhone}`}
                          target={isPublic ? '_self' : '_blank'}
                          rel="noreferrer"
                          onClick={(e) => {
                            if (isPublic) {
                              e.preventDefault();
                              onOpenAdminModal?.();
                            }
                          }}
                          className="app-btn app-btn-whatsapp"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', flex: 1, justifyContent: 'center' }}
                        >
                          <MessageSquare size={11} /> WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- SELF-OCCUPIED OWNER VIEW --- */}
                {isOwnerOccupied && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #A7F3D0',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)'
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Crown size={13} color="#059669" /> Flat Owner & Resident
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                        {ownerName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                        <Phone size={12} color="#0284C7" />
                        <span>Mobile: <strong>{ownerPhone}</strong></span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a
                          href={isPublic ? '#' : `tel:${rawOwnerPhone}`}
                          onClick={(e) => {
                            if (isPublic) {
                              e.preventDefault();
                              onOpenAdminModal?.();
                            }
                          }}
                          className="app-btn app-btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.76rem', flex: 1, justifyContent: 'center' }}
                        >
                          <Phone size={12} /> {isPublic ? 'Unlock Contact' : 'Call Owner'}
                        </a>
                        <a
                          href={isPublic ? '#' : `https://wa.me/91${rawOwnerPhone}`}
                          target={isPublic ? '_self' : '_blank'}
                          rel="noreferrer"
                          onClick={(e) => {
                            if (isPublic) {
                              e.preventDefault();
                              onOpenAdminModal?.();
                            }
                          }}
                          className="app-btn app-btn-whatsapp"
                          style={{ padding: '5px 10px', fontSize: '0.76rem', flex: 1, justifyContent: 'center' }}
                        >
                          <MessageSquare size={12} /> WhatsApp
                        </a>
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid #A7F3D0',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      fontSize: '0.76rem',
                      color: '#065F46',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Home size={12} color="#059669" /> Occupancy: <strong>Self-Occupied Owner</strong>
                    </div>
                  </div>
                )}

                {/* --- VACANT FLAT VIEW --- */}
                {isVacant && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 2px 6px rgba(100, 116, 139, 0.08)'
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Crown size={13} color="#64748B" /> Flat Owner
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                        {ownerName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                        <Phone size={12} color="#0284C7" />
                        <span>Mobile: <strong>{ownerPhone}</strong></span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a href={`tel:${ownerPhone}`} className="app-btn app-btn-secondary" style={{ padding: '5px 10px', fontSize: '0.76rem', flex: 1, justifyContent: 'center' }}>
                          <Phone size={12} /> Call Owner
                        </a>
                        <a href={`https://wa.me/91${ownerPhone}`} target="_blank" rel="noreferrer" className="app-btn app-btn-whatsapp" style={{ padding: '5px 10px', fontSize: '0.76rem', flex: 1, justifyContent: 'center' }}>
                          <MessageSquare size={12} /> WhatsApp
                        </a>
                      </div>
                    </div>

                    <div style={{
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      fontSize: '0.76rem',
                      color: '#475569',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      ⚪ Flat Status: <strong>Currently Vacant</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Edit Button Footer */}
              {isAdmin && (
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '10px', marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleOpenEdit(flat)}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#475569',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                    title="Edit Owner & Tenant Details"
                  >
                    <Edit3 size={13} /> Edit Details
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Edit Resident & Owner Modal for Admin */}
      {editingFlat && (
        <div
          className="modal-overlay"
          onClick={() => setEditingFlat(null)}
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
              maxWidth: '520px',
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
                padding: '18px 22px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38BDF8',
                    flexShrink: 0,
                  }}
                >
                  <Shield size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC' }}>
                    Edit Flat #{editingFlat.flatNo} Details
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                    Real Owner & Occupant Roster Info
                  </span>
                </div>
              </div>

              <button
                onClick={() => setEditingFlat(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px', overflowY: 'auto', flex: 1 }}>
              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Real Owner Section */}
                <div
                  style={{
                    background: '#FEF3C7',
                    border: '1.5px solid #FDE68A',
                    padding: '14px',
                    borderRadius: '14px',
                  }}
                >
                  <h4
                    style={{
                      margin: '0 0 10px 0',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: '#92400E',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Crown size={16} color="#D97706" /> Real Flat Owner Information
                  </h4>
                  
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#78350F', display: 'block', marginBottom: '4px' }}>
                      Flat Owner Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editOwnerName}
                      onChange={(e) => setEditOwnerName(e.target.value)}
                      placeholder="e.g. Ramesh"
                      required
                      style={{ background: '#FFFFFF', border: '1.5px solid #FCD34D', padding: '9px 12px', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#78350F', display: 'block', marginBottom: '4px' }}>
                      Owner Mobile Number *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editOwnerPhone}
                      onChange={(e) => setEditOwnerPhone(e.target.value)}
                      placeholder="e.g. 9849040201"
                      required
                      style={{ background: '#FFFFFF', border: '1.5px solid #FCD34D', padding: '9px 12px', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                {/* Occupant Settings */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                    Occupancy Status *
                  </label>
                  <select
                    className="form-control"
                    value={editType}
                    onChange={(e: any) => setEditType(e.target.value)}
                    style={{ padding: '9px 12px', fontSize: '0.88rem', background: '#F8FAFC', border: '1.5px solid #CBD5E1' }}
                  >
                    <option value="Owner">👑 Self-Occupied Owner</option>
                    <option value="Tenant">🏠 Rented to Tenant</option>
                  </select>
                </div>

                {/* Tenant Section if Rented */}
                {editType === 'Tenant' && (
                  <div
                    style={{
                      background: '#F5F3FF',
                      border: '1.5px solid #DDD6FE',
                      padding: '14px',
                      borderRadius: '14px',
                    }}
                  >
                    <h4
                      style={{
                        margin: '0 0 10px 0',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        color: '#5B21B6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Home size={16} color="#7C3AED" /> Current Tenant (Occupant) Details
                    </h4>

                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6D28D9', display: 'block', marginBottom: '4px' }}>
                        Tenant Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={editResidentName}
                        onChange={(e) => setEditResidentName(e.target.value)}
                        placeholder="e.g. Ujwala"
                        required
                        style={{ background: '#FFFFFF', border: '1.5px solid #C4B5FD', padding: '9px 12px', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6D28D9', display: 'block', marginBottom: '4px' }}>
                        Tenant Mobile Number *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={editTenantPhone}
                        onChange={(e) => setEditTenantPhone(e.target.value)}
                        placeholder="e.g. 9849040200"
                        required
                        style={{ background: '#FFFFFF', border: '1.5px solid #C4B5FD', padding: '9px 12px', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#F8FAFC',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <input
                    type="checkbox"
                    id="chkOccupied"
                    checked={editOccupied}
                    onChange={(e) => setEditOccupied(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="chkOccupied" style={{ margin: 0, cursor: 'pointer', fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                    Flat is currently Occupied
                  </label>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end',
                    marginTop: '8px',
                    paddingTop: '14px',
                    borderTop: '1px solid #E2E8F0',
                  }}
                >
                  <button
                    type="button"
                    className="app-btn app-btn-secondary"
                    onClick={() => setEditingFlat(null)}
                    style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="app-btn app-btn-primary"
                    style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                  >
                    <Check size={16} /> Save Details
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
