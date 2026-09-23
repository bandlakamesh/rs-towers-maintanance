import React, { useRef } from 'react';
import { Share2, Download, Upload, Printer, Lock, Unlock } from 'lucide-react';
import type { AppState, UserRole } from '../types';
import { exportAppStateJSON, importAppStateJSON } from '../utils/storage';
import { generateWhatsAppMonthlySummary, openWhatsAppShareLink } from '../utils/whatsappFormatter';

interface NavbarProps {
  state: AppState;
  onStateUpdate: (newState: AppState) => void;
  onGoHome?: () => void;
  isAdmin: boolean;
  userRole?: UserRole;
  currentAdminFlat?: string;
  onOpenAdminModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  onStateUpdate,
  onGoHome,
  isAdmin,
  userRole = 'PublicResident',
  currentAdminFlat,
  onOpenAdminModal,
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
  const residentName = state.flatDirectory?.[loggedInFlat]?.residentName || state.flatDirectory?.[loggedInFlat]?.ownerName;
  const flatDisplay = residentName ? `#${loggedInFlat} (${residentName})` : `#${loggedInFlat}`;

  let roleBtnLabel = '🔑 Member Login';
  let roleBtnBg = 'rgba(255, 255, 255, 0.15)';
  let roleBtnBorder = '1px solid rgba(255, 255, 255, 0.3)';

  if (isAdmin) {
    if (userRole === 'RootAdmin') {
      roleBtnLabel = `👑 Flat ${flatDisplay} • Root`;
      roleBtnBg = 'linear-gradient(135deg, #D97706 0%, #B45309 100%)';
      roleBtnBorder = '1px solid #FDE68A';
    } else if (userRole === 'MaintenanceLead') {
      roleBtnLabel = `🛠️ Flat ${flatDisplay} • Lead`;
      roleBtnBg = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
      roleBtnBorder = '1px solid #A7F3D0';
    } else if (userRole === 'CoAdmin') {
      roleBtnLabel = `⭐ Flat ${flatDisplay} • Co-Admin`;
      roleBtnBg = 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';
      roleBtnBorder = '1px solid #BFDBFE';
    } else {
      roleBtnLabel = `👤 Flat ${flatDisplay}`;
      roleBtnBg = 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)';
      roleBtnBorder = '1px solid #BAE6FD';
    }
  }

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
      <div className="navbar-inner">
        
        {/* Brand Logo & Title */}
        <div
          className="navbar-brand"
          onClick={onGoHome}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: onGoHome ? 'pointer' : 'default', userSelect: 'none' }}
          title="Go to Maintenance Dashboard"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            border: '2px solid #FDBA74',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
            fontSize: '1.2rem',
            flexShrink: 0,
          }}>
            🏢
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 className="navbar-brand-title" style={{ fontSize: '1.2rem', margin: 0, letterSpacing: '-0.3px', fontWeight: 800, color: '#FFFFFF' }}>
                RS Towers <span style={{ color: '#FFD166' }}>Maintenance</span>
              </h1>
            </div>
            <p className="navbar-brand-sub" style={{ margin: 0, fontSize: '0.72rem', color: '#E0F2FE' }}>
              Monthly Water Reading & Building Expenses Calculator
            </p>
          </div>
        </div>

        {/* Navbar Action Buttons */}
        <div className="navbar-actions-group no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          {/* Share WhatsApp - ADMIN ONLY */}
          {isAdmin && (
            <button className="app-btn app-btn-whatsapp" onClick={handleShareSummaryWhatsApp} style={{ padding: '7px 12px', fontSize: '0.8rem' }}>
              <Share2 size={15} /> <span>Share</span>
            </button>
          )}

          {/* Print PDF - ADMIN ONLY */}
          {isAdmin && (
            <button className="app-btn" onClick={handlePrintPDF} style={{ background: 'linear-gradient(135deg, #00B4D8 0%, #0096C7 100%)', color: '#FFF', padding: '7px 12px', fontSize: '0.8rem' }}>
              <Printer size={15} /> <span>Print PDF</span>
            </button>
          )}

          {/* Member Login / Active Role Button */}
          <button
            className="app-btn"
            onClick={onOpenAdminModal}
            style={{
              background: roleBtnBg,
              border: roleBtnBorder,
              color: '#FFFFFF',
              padding: '7px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
            title={isAdmin ? `Logged in as ${roleBtnLabel} (Click to manage or switch)` : "Member & Admin Login"}
          >
            {isAdmin ? <Unlock size={15} /> : <Lock size={15} />}
            <span>{roleBtnLabel}</span>
          </button>

          {/* Backup / Restore - ROOT SUPER ADMIN ONLY */}
          {userRole === 'RootAdmin' && (
            <>
              <button className="app-btn" onClick={handleExport} style={{ padding: '7px 10px', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.18)', border: '1px solid rgba(255, 255, 255, 0.35)', color: '#FFFFFF' }} title="Download JSON Database Backup (Root Admin Only)">
                <Download size={15} />
              </button>

              <button className="app-btn" onClick={() => jsonInputRef.current?.click()} style={{ padding: '7px 10px', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.18)', border: '1px solid rgba(255, 255, 255, 0.35)', color: '#FFFFFF' }} title="Restore JSON Database Backup (Root Admin Only)">
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
