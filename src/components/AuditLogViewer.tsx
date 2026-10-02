import React, { useState } from 'react';
import type { AuditLogEntry } from '../types';
import { History, Trash2, Search, Clock } from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
  onClearLogs?: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs, onClearLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.flatNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userRole.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'ALL') return matchesSearch;
    return matchesSearch && log.actionType === filterType;
  });

  const getActionBadge = (actionType: AuditLogEntry['actionType']) => {
    switch (actionType) {
      case 'EDIT_READING':
        return { label: 'Meter Reading', bg: '#EFF6FF', border: '#BFDBFE', color: '#1D4ED8' };
      case 'PAYMENT_RECORDED':
        return { label: 'Payment Record', bg: '#ECFDF5', border: '#A7F3D0', color: '#047857' };
      case 'CREATE_MONTH':
        return { label: 'Month Created', bg: '#FEF3C7', border: '#FDE68A', color: '#B45309' };
      case 'DELETE_MONTH':
        return { label: 'Month Deleted', bg: '#FEF2F2', border: '#FCA5A5', color: '#DC2626' };
      case 'AMC_TASK':
        return { label: 'AMC Asset', bg: '#E0F7FA', border: '#48CAE4', color: '#0077B6' };
      case 'NOTICE':
        return { label: 'Notice Board', bg: '#F3E8FF', border: '#D8B4FE', color: '#7E22CE' };
      case 'VENDOR':
        return { label: 'Vendor Directory', bg: '#F0F9FF', border: '#BAE6FD', color: '#0369A1' };
      case 'TREASURER':
        return { label: 'Treasurer Settings', bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46' };
      case 'PIN_CHANGE':
        return { label: 'PIN Security', bg: '#FFFBEB', border: '#FCD34D', color: '#D97706' };
      default:
        return { label: actionType, bg: '#F1F5F9', border: '#CBD5E1', color: '#475569' };
    }
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      
      {/* Header Banner */}
      <div className="app-card" style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
        color: '#FFFFFF',
        marginBottom: '20px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        borderColor: '#6366F1',
        boxShadow: '0 8px 24px rgba(49, 46, 129, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <History size={26} color="#A5B4FC" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📜 System Activity Audit Log <span style={{ fontSize: '0.72rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>Root Admin Exclusive</span>
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#C7D2FE' }}>
              Real-time immutable action tracking of all edits, payment updates, PIN changes & configuration updates across all flats.
            </p>
          </div>
        </div>

        {onClearLogs && logs.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('🚨 Root Admin Safeguard: Are you sure you want to CLEAR ALL historical audit activity logs?')) {
                onClearLogs();
              }
            }}
            className="app-btn"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#FCA5A5',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              fontWeight: 700,
              fontSize: '0.8rem',
              padding: '8px 14px',
            }}
          >
            <Trash2 size={15} /> Clear Log History
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="app-card" style={{ padding: '14px 18px', marginBottom: '18px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs by flat #, user role, or details..."
              style={{ paddingLeft: '36px', fontSize: '0.84rem' }}
            />
          </div>

          {/* Filter Chips */}
          <div className="chip-group" style={{ margin: 0, padding: 0 }}>
            <button className={`chip ${filterType === 'ALL' ? 'active' : ''}`} onClick={() => setFilterType('ALL')} style={{ padding: '6px 12px', fontSize: '0.76rem' }}>
              All ({logs.length})
            </button>
            <button className={`chip ${filterType === 'EDIT_READING' ? 'active' : ''}`} onClick={() => setFilterType('EDIT_READING')} style={{ padding: '6px 12px', fontSize: '0.76rem' }}>
              Readings
            </button>
            <button className={`chip ${filterType === 'PAYMENT_RECORDED' ? 'active' : ''}`} onClick={() => setFilterType('PAYMENT_RECORDED')} style={{ padding: '6px 12px', fontSize: '0.76rem' }}>
              Payments
            </button>
            <button className={`chip ${filterType === 'AMC_TASK' ? 'active' : ''}`} onClick={() => setFilterType('AMC_TASK')} style={{ padding: '6px 12px', fontSize: '0.76rem' }}>
              AMC Tasks
            </button>
            <button className={`chip ${filterType === 'NOTICE' ? 'active' : ''}`} onClick={() => setFilterType('NOTICE')} style={{ padding: '6px 12px', fontSize: '0.76rem' }}>
              Notices
            </button>
            <button className={`chip ${filterType === 'PIN_CHANGE' ? 'active' : ''}`} onClick={() => setFilterType('PIN_CHANGE')} style={{ padding: '6px 12px', fontSize: '0.76rem' }}>
              PIN & Security
            </button>
          </div>

        </div>
      </div>

      {/* Audit Logs List / Table */}
      {filteredLogs.length === 0 ? (
        <div className="app-card" style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
          <History size={40} color="#94A3B8" style={{ marginBottom: '10px' }} />
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>No Action Audit Logs Found</h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem' }}>All user edits, payment updates, and PIN changes will be recorded here automatically.</p>
        </div>
      ) : (
        <div className="app-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontWeight: 800 }}>
                  <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Date & Time</th>
                  <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>User / Flat</th>
                  <th style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>Action Category</th>
                  <th style={{ padding: '10px 14px' }}>Activity Description & Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const badge = getActionBadge(log.actionType);

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}>
                      
                      {/* Timestamp */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: '#64748B', fontWeight: 600, fontSize: '0.76rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} color="#94A3B8" /> {log.timestamp}
                        </span>
                      </td>

                      {/* User & Flat Badge */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            padding: '2px 7px',
                            borderRadius: '6px',
                            background: log.flatNo === '302' ? '#FEF3C7' : log.flatNo === '101' ? '#ECFDF5' : '#EFF6FF',
                            color: log.flatNo === '302' ? '#B45309' : log.flatNo === '101' ? '#065F46' : '#1D4ED8',
                            border: log.flatNo === '302' ? '1px solid #FDE68A' : log.flatNo === '101' ? '1px solid #A7F3D0' : '1px solid #BFDBFE',
                          }}>
                            {log.flatNo === '302' ? '👑 Flat #302' : log.flatNo === '101' ? '🛠️ Flat #101' : `Flat #${log.flatNo}`}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                            ({log.userRole})
                          </span>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.color,
                        }}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Activity Details */}
                      <td style={{ padding: '10px 14px', color: '#0F172A', fontWeight: 600, fontSize: '0.82rem', lineHeight: 1.4 }}>
                        {log.description}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
