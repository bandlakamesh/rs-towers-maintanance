import React, { useState } from 'react';
import { Search, Send, Plus, CheckCircle2, AlertCircle, Building, User } from 'lucide-react';
import type { MonthMaintenanceRecord, FlatReading } from '../types';
import { generateWhatsAppFlatBillText, openWhatsAppShareLink } from '../utils/whatsappFormatter';

interface FlatDirectoryProps {
  record: MonthMaintenanceRecord;
  isAdmin: boolean;
  onSelectFlatPayment: (flatNo: string, residentName: string, roundedDue: number) => void;
}

export const FlatDirectory: React.FC<FlatDirectoryProps> = ({
  record,
  isAdmin,
  onSelectFlatPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Received' | 'Pending'>('All');

  const filteredFlats = record.flatReadings
    .filter((f) => f.flatNo !== 'WM')
    .filter((f) => {
      const matchesSearch =
        f.flatNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.residentName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ? true : statusFilter === 'Received' ? f.status === 'Received' : f.status !== 'Received';

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const numA = parseInt(a.flatNo.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.flatNo.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

  const occupiedFlats = record.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied);
  const paidCount = occupiedFlats.filter((f) => f.status === 'Received').length;
  const pendingCount = occupiedFlats.length - paidCount;

  const handleSendWhatsApp = (flat: FlatReading) => {
    const text = generateWhatsAppFlatBillText(flat, record);
    openWhatsAppShareLink(text);
  };

  return (
    <div style={{ marginBottom: '28px' }}>
      
      {/* Header & Filter Chips */}
      <div className="table-header-bar">
        <div className="section-header-title">
          <h2>
            <Building style={{ color: '#0096C7' }} /> RS Towers Directory & Payment Cards
          </h2>
          <p>
            Flat-wise maintenance collection status, payment logs, and WhatsApp bill sender
          </p>
        </div>

        {/* Filter Chips */}
        <div className="chip-group">
          <button
            className={`chip ${statusFilter === 'All' ? 'active' : ''}`}
            onClick={() => setStatusFilter('All')}
          >
            All ({occupiedFlats.length})
          </button>
          <button
            className={`chip ${statusFilter === 'Received' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Received')}
          >
            Paid ({paidCount})
          </button>
          <button
            className={`chip ${statusFilter === 'Pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Pending')}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="search-box-wrapper" style={{ marginBottom: '16px', width: '100%' }}>
        <Search size={16} className="search-icon" style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748B' }} />
        <input
          type="text"
          className="form-control"
          placeholder="Search Flat # or Resident Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '36px' }}
        />
      </div>

      {/* Grid of Flat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
        {filteredFlats.map((flat) => {
          const isFullyPaid = flat.status === 'Received';
          const isVacant = !flat.isOccupied;

          return (
            <div
              key={flat.flatNo}
              className="app-card"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isVacant ? '1px solid #E2E8F0' : isFullyPaid ? '1px solid #A7F3D0' : '1px solid #FECACA',
                background: isVacant ? '#F8FAFC' : isFullyPaid ? '#F0FDF4' : '#FFFFFF',
              }}
            >
              <div>
                {/* Flat Number & Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1D4ED8', background: '#EFF6FF', padding: '2px 8px', borderRadius: '6px' }}>
                    Flat #{flat.flatNo}
                  </span>

                  {isVacant ? (
                    <span style={{ fontSize: '0.72rem', color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '10px' }}>
                      Vacant
                    </span>
                  ) : isFullyPaid ? (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={12} /> Paid
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', background: '#FEF2F2', padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <AlertCircle size={12} /> Pending
                    </span>
                  )}
                </div>

                {/* Resident Name */}
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} color="#0096C7" /> {flat.residentName}
                </div>

                {/* Mini Itemized Breakdown */}
                {!isVacant && (
                  <div style={{ fontSize: '0.76rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '2px', background: '#F8FAFC', padding: '8px', borderRadius: '6px', margin: '8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Water ({flat.consumedUnits} units):</span>
                      <strong>₹{flat.waterCost}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Panchayat Water:</span>
                      <strong>₹{flat.panchayatShare.toFixed(0)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Common Maint:</span>
                      <strong>₹{flat.commonMaintenanceShare.toFixed(0)}</strong>
                    </div>
                  </div>
                )}

                {/* Due Amount */}
                {!isVacant && (
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isFullyPaid ? '#059669' : '#DC2626', marginBottom: '8px' }}>
                    Total Due: ₹{flat.roundedValue.toLocaleString('en-IN')}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!isVacant && (
                <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid #F1F5F9', paddingTop: '10px', marginTop: '6px' }}>
                  {isAdmin && !isFullyPaid && (
                    <button
                      className="app-btn app-btn-secondary"
                      onClick={() => onSelectFlatPayment(flat.flatNo, flat.residentName, flat.roundedValue)}
                      style={{ flex: 1, padding: '5px 8px', fontSize: '0.76rem' }}
                    >
                      <Plus size={13} /> Record
                    </button>
                  )}

                  <button
                    className="app-btn app-btn-whatsapp"
                    onClick={() => handleSendWhatsApp(flat)}
                    style={{ flex: 1, padding: '5px 8px', fontSize: '0.76rem' }}
                  >
                    <Send size={12} /> WhatsApp Bill
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
