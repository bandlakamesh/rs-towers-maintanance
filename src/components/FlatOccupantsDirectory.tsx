import React, { useState } from 'react';
import { Search, UserCheck, User, Phone, MessageSquare, Edit3, Check, X, Shield } from 'lucide-react';
import type { MonthMaintenanceRecord, FlatReading } from '../types';

interface FlatOccupantsDirectoryProps {
  record: MonthMaintenanceRecord;
  isAdmin: boolean;
  onUpdateReadings: (updatedReadings: FlatReading[]) => void;
}

// Default phone map for RS Towers flats if not set
const DEFAULT_FLAT_PHONES: Record<string, string> = {
  '101': '9963275455', // Bobby
  '102': '9849010200', // Tenant
  '103': '9849010300', // Balaji
  '201': '9849020100', // Naveen Varma
  '202': '9849020200', // Satya Nimmakayala
  '203': '9849020300', // Harshavardhan
  '301': '9849030100', // Yugandhar
  '302': '9849030200', // Kamesh
  '303': '9849030300', // Sharath Babu
  '401': '9849040100', // Arun
  '402': '9849040200', // Ujwala
  '403': '9849040300', // Ravi Shankar
  '501': '9849050100', // Srikanth
  '502': '9849050200', // Prasanna
  '503': '9849050300', // Owner Vacant
};

export const FlatOccupantsDirectory: React.FC<FlatOccupantsDirectoryProps> = ({
  record,
  isAdmin,
  onUpdateReadings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Owner' | 'Tenant' | 'Vacant'>('All');

  // Edit resident modal state
  const [editingFlat, setEditingFlat] = useState<FlatReading | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'Owner' | 'Tenant'>('Owner');
  const [editOccupied, setEditOccupied] = useState(true);
  const [editPhone, setEditPhone] = useState('');

  const allFlats = record.flatReadings.filter((f) => f.flatNo !== 'WM');

  const occupiedFlats = allFlats.filter((f) => f.isOccupied);
  const ownerFlats = occupiedFlats.filter((f) => f.residentType === 'Owner');
  const tenantFlats = occupiedFlats.filter((f) => f.residentType === 'Tenant');
  const vacantFlats = allFlats.filter((f) => !f.isOccupied);

  const filteredFlats = allFlats.filter((f) => {
    const matchesSearch =
      f.flatNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.residentName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'Owner') return f.isOccupied && f.residentType === 'Owner';
    if (filterType === 'Tenant') return f.isOccupied && f.residentType === 'Tenant';
    if (filterType === 'Vacant') return !f.isOccupied;
    return true;
  }).sort((a, b) => {
    const numA = parseInt(a.flatNo.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.flatNo.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

  const handleOpenEdit = (flat: FlatReading) => {
    setEditingFlat(flat);
    setEditName(flat.residentName);
    setEditType(flat.residentType);
    setEditOccupied(flat.isOccupied);
    setEditPhone(DEFAULT_FLAT_PHONES[flat.flatNo] || '9963275455');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlat) return;

    DEFAULT_FLAT_PHONES[editingFlat.flatNo] = editPhone;

    const updated = record.flatReadings.map((f) => {
      if (f.flatNo === editingFlat.flatNo) {
        return {
          ...f,
          residentName: editName,
          residentType: editType,
          isOccupied: editOccupied,
        };
      }
      return f;
    });

    onUpdateReadings(updated);
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
            Official directory of RS Towers Flat Owners, Tenants, and Occupancy details
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
          placeholder="Search by Flat #, Resident Name, Owner or Mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '36px' }}
        />
      </div>

      {/* Grid of Resident Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
        {filteredFlats.map((flat) => {
          const isOwner = flat.residentType === 'Owner';
          const isVacant = !flat.isOccupied;
          const phone = DEFAULT_FLAT_PHONES[flat.flatNo] || '9963275455';

          return (
            <div
              key={flat.flatNo}
              className="app-card"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isVacant ? '1.5px solid #E2E8F0' : isOwner ? '1.5px solid #A7F3D0' : '1.5px solid #C4B5FD',
                background: isVacant ? '#F8FAFC' : isOwner ? '#F0FDF4' : '#F5F3FF',
              }}
            >
              <div>
                {/* Card Header: Flat Number & Occupancy Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: '#1D4ED8',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    padding: '3px 9px',
                    borderRadius: '8px'
                  }}>
                    Flat #{flat.flatNo}
                  </span>

                  {isVacant ? (
                    <span style={{ fontSize: '0.74rem', color: '#64748B', background: '#E2E8F0', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      ⚪ Vacant
                    </span>
                  ) : isOwner ? (
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#047857', background: '#D1FAE5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      👑 Flat Owner
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#6D28D9', background: '#EDE9FE', border: '1px solid #DDD6FE', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      🏠 Tenant
                    </span>
                  )}
                </div>

                {/* Resident Name */}
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={16} color={isOwner ? '#059669' : '#7C3AED'} />
                  <span>{flat.residentName}</span>
                </div>

                {/* Occupancy Info */}
                {!isVacant && (
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '10px', background: 'rgba(255, 255, 255, 0.7)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div><strong>Occupancy:</strong> {isOwner ? 'Self-Occupied Owner' : 'Rented to Tenant'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Phone size={12} color="#0284C7" />
                      <span>Mobile: <strong>{phone}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!isVacant && (
                <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '10px', marginTop: '4px' }}>
                  <a
                    href={`tel:${phone}`}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#0369A1',
                      background: '#E0F2FE',
                      border: '1px solid #BAE6FD',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <Phone size={13} /> Call
                  </a>

                  <a
                    href={`https://wa.me/91${phone}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      background: '#25D366',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </a>

                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEdit(flat)}
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#475569',
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Edit Resident Details"
                    >
                      <Edit3 size={13} />
                    </button>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Edit Resident Modal for Admin */}
      {editingFlat && (
        <div className="modal-overlay" onClick={() => setEditingFlat(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0096C7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={18} /> Edit Flat #{editingFlat.flatNo} Resident Details
              </h3>
              <button
                onClick={() => setEditingFlat(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Resident / Occupant Name:</label>
                <input
                  type="text"
                  className="form-control"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Occupant Type:</label>
                  <select
                    className="form-control"
                    value={editType}
                    onChange={(e: any) => setEditType(e.target.value)}
                  >
                    <option value="Owner">👑 Flat Owner</option>
                    <option value="Tenant">🏠 Tenant</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Mobile Number:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="chkOccupied"
                  checked={editOccupied}
                  onChange={(e) => setEditOccupied(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="chkOccupied" style={{ margin: 0, cursor: 'pointer', fontWeight: 700, color: '#0F172A' }}>
                  Flat is currently Occupied
                </label>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '18px' }}>
                <button type="button" className="app-btn app-btn-secondary" onClick={() => setEditingFlat(null)} style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
                  Cancel
                </button>
                <button type="submit" className="app-btn app-btn-primary" style={{ padding: '7px 16px', fontSize: '0.82rem' }}>
                  <Check size={16} /> Save Resident Details
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
