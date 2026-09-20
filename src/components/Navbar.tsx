import React, { useRef } from 'react';
import { Share2, Download, Upload, Printer, Lock, Unlock, Calendar, Plus } from 'lucide-react';
import type { AppState } from '../types';
import { exportAppStateJSON, importAppStateJSON } from '../utils/storage';
import { generateWhatsAppMonthlySummary, openWhatsAppShareLink } from '../utils/whatsappFormatter';

interface NavbarProps {
  state: AppState;
  onStateUpdate: (newState: AppState) => void;
  onGoHome?: () => void;
  isAdmin: boolean;
  currentAdminFlat?: string;
  onOpenAdminModal: () => void;
  onOpenNewMonthModal: () => void;
  onSelectMonth: (monthId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  onStateUpdate,
  onGoHome,
  isAdmin,
  currentAdminFlat,
  onOpenAdminModal,
  onOpenNewMonthModal,
  onSelectMonth,
}) => {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const activeRecord = state.months[state.activeMonthId];

  const handleExport = () => {
    exportAppStateJSON(state);
  };

  const handleJSONFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importAppStateJSON(file);
        onStateUpdate(imported);
      } catch (err) {
        console.error('Error restoring backup:', err);
      }
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleShareSummaryWhatsApp = () => {
    if (activeRecord) {
      const text = generateWhatsAppMonthlySummary(activeRecord);
      openWhatsAppShareLink(text);
    }
  };

  const loggedInFlat = currentAdminFlat || '302';
  const monthIds = Object.keys(state.months);

  return (
    <header className="navbar-container" style={{
      background: 'linear-gradient(135deg, #0E5A73 0%, #137A9A 50%, #189AB4 100%)',
      borderBottom: '2px solid #48CAE4',
      boxShadow: '0 4px 20px rgba(14, 90, 115, 0.25)',
      marginBottom: 0,
      padding: '10px 18px',
      position: 'sticky',
      top: 0,
      zIndex: 900,
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Brand Logo & Title */}
        <div
          onClick={onGoHome}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: onGoHome ? 'pointer' : 'default', userSelect: 'none' }}
          title="Go to Maintenance Dashboard"
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            border: '2px solid #FDBA74',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
            fontSize: '1.3rem',
            flexShrink: 0,
          }}>
            🏢
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 style={{ fontSize: '1.2rem', margin: 0, letterSpacing: '-0.3px', fontWeight: 800, color: '#FFFFFF' }}>
                RS Towers <span style={{ color: '#FFD166' }}>Maintenance</span>
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#E0F2FE' }}>
              Monthly Water Reading & Building Expenses Calculator
            </p>
          </div>
        </div>

        {/* Month Selector Dropdown & Actions */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          {/* Active Month Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '10px', padding: '4px 10px' }}>
            <Calendar size={15} color="#FFD166" />
            <select
              value={state.activeMonthId}
              onChange={(e) => onSelectMonth(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {monthIds.map((id) => (
                <option key={id} value={id} style={{ color: '#0F172A', background: '#FFFFFF' }}>
                  {state.months[id]?.monthTitle || id}
                </option>
              ))}
            </select>

            {isAdmin && (
              <button
                onClick={onOpenNewMonthModal}
                style={{
                  background: '#FFD166',
                  color: '#0E5A73',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  marginLeft: '4px',
                }}
                title="Create New Month Calculation"
              >
                <Plus size={13} /> New Month
              </button>
            )}
          </div>

          {/* Share WhatsApp */}
          <button className="app-btn app-btn-whatsapp" onClick={handleShareSummaryWhatsApp} style={{ padding: '7px 12px', fontSize: '0.8rem' }}>
            <Share2 size={15} /> <span>Share</span>
          </button>

          {/* Print PDF */}
          <button className="app-btn" onClick={handlePrintPDF} style={{ background: 'linear-gradient(135deg, #00B4D8 0%, #0096C7 100%)', color: '#FFF', padding: '7px 12px', fontSize: '0.8rem' }}>
            <Printer size={15} /> <span>Print PDF</span>
          </button>

          {/* Admin Unlock / Active Button */}
          <button
            className="app-btn"
            onClick={onOpenAdminModal}
            style={{
              background: isAdmin ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'rgba(255, 255, 255, 0.15)',
              border: isAdmin ? '1px solid #34D399' : '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              padding: '7px 12px',
              fontSize: '0.8rem',
            }}
            title={isAdmin ? "Admin Active (Click to Manage)" : "Unlock Admin Mode"}
          >
            {isAdmin ? <Unlock size={15} /> : <Lock size={15} />}
            <span>{isAdmin ? (loggedInFlat === '302' ? '👑 Flat #302 (Kamesh)' : `⭐ Flat #${loggedInFlat}`) : 'Admin Unlock'}</span>
          </button>

          {/* Backup / Restore - Admin Only */}
          {isAdmin && (
            <>
              <button className="app-btn" onClick={handleExport} style={{ padding: '7px 10px', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#FFFFFF' }} title="Download JSON Backup">
                <Download size={15} />
              </button>

              <button className="app-btn" onClick={() => jsonInputRef.current?.click()} style={{ padding: '7px 10px', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#FFFFFF' }} title="Restore Backup">
                <Upload size={15} />
              </button>

              <input
                type="file"
                ref={jsonInputRef}
                onChange={handleJSONFileChange}
                accept=".json"
                style={{ display: 'none' }}
              />
            </>
          )}

        </div>

      </div>
    </header>
  );
};
