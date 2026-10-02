import React, { useState } from 'react';
import { Table, Send, CheckCircle2, AlertCircle, Edit2, AlertTriangle, Bell, CreditCard, Lock, Droplets } from 'lucide-react';
import type { MonthMaintenanceRecord, FlatReading, UserRole, FlatDirectoryEntry } from '../types';
import { generateWhatsAppFlatBillText, generateWhatsAppOverdueReminderText, openWhatsAppShareLink } from '../utils/whatsappFormatter';

interface MaintenanceTableProps {
  record: MonthMaintenanceRecord;
  isAdmin: boolean;
  userRole?: UserRole;
  currentAdminFlat?: string;
  dueDateDay?: number;
  onUpdateReadings: (updatedReadings: FlatReading[]) => void;
  onSelectFlatPayment?: (flatNo: string) => void;
  flatDirectory?: Record<string, FlatDirectoryEntry>;
  treasurerUpiId?: string;
  treasurerPhone?: string;
  treasurerName?: string;
  onOpenAdminModal?: () => void;
}

export const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
  record,
  isAdmin,
  userRole = 'PublicResident',
  currentAdminFlat,
  dueDateDay = 10,
  onUpdateReadings,
  onSelectFlatPayment,
  flatDirectory,
  treasurerUpiId = '9963275455@upi',
  treasurerPhone = '9963275455',
  treasurerName = 'Bobby (Flat 101 - Maintenance Lead)',
  onOpenAdminModal,
}) => {
  const [editingFlatNo, setEditingFlatNo] = useState<string | null>(null);
  const [tempCurr, setTempCurr] = useState<number>(0);
  const [tempNotes, setTempNotes] = useState<string>('');

  const todayDate = new Date().getDate();
  const isPastDueDate = todayDate > dueDateDay;
  const isRootOrLead = userRole === 'RootAdmin' || userRole === 'MaintenanceLead';
  const isPrivilegedAdmin = userRole === 'RootAdmin' || userRole === 'MaintenanceLead' || userRole === 'CoAdmin';

  const getEffectiveFlat = (flat: FlatReading): FlatReading => {
    const dirEntry = flatDirectory?.[flat.flatNo];
    if (!dirEntry) return flat;
    return {
      ...flat,
      residentName: dirEntry.residentName || dirEntry.ownerName || flat.residentName,
      residentType: dirEntry.residentType || flat.residentType,
      ownerName: dirEntry.ownerName || flat.ownerName,
      ownerPhone: dirEntry.ownerPhone || flat.ownerPhone,
      tenantPhone: dirEntry.tenantPhone || flat.tenantPhone,
      isOccupied: dirEntry.isOccupied !== undefined ? dirEntry.isOccupied : flat.isOccupied,
    };
  };

  const handleStartEdit = (flat: FlatReading) => {
    setEditingFlatNo(flat.flatNo);
    setTempCurr(flat.currentReading);
    setTempNotes(flat.notes || '');
  };

  const handleSaveEdit = (flatNo: string) => {
    if (!window.confirm(`⚠️ Confirm Meter Reading Update for Flat #${flatNo}:\n\nSet Current Reading to ${tempCurr}?`)) {
      return;
    }
    const updated = record.flatReadings.map((f) => {
      if (f.flatNo === flatNo) {
        return {
          ...f,
          previousReading: f.previousReading,
          currentReading: Number(tempCurr),
          notes: tempNotes,
        };
      }
      return f;
    });
    onUpdateReadings(updated);
    setEditingFlatNo(null);
  };

  const handleSendFlatWhatsApp = (flat: FlatReading) => {
    const eff = getEffectiveFlat(flat);
    const text = generateWhatsAppFlatBillText(eff, record);
    openWhatsAppShareLink(text);
  };

  const handleSendOverdueWhatsApp = (flat: FlatReading) => {
    const text = generateWhatsAppOverdueReminderText(flat, record, dueDateDay, treasurerUpiId, treasurerName);
    openWhatsAppShareLink(text);
  };


  const occupiedCount = record.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied).length;
  const pendingFlats = record.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied && f.status !== 'Received');
  const totalPendingAmount = pendingFlats.reduce((sum, f) => sum + (f.roundedValue - f.paidAmount), 0);
  const wmReading = record.flatReadings.find((f) => f.flatNo === 'WM');
  const wmUnits = wmReading ? wmReading.consumedUnits : 8;

  return (
    <div style={{ marginBottom: '28px' }}>

      {/* 10th of Month Overdue Alert Banner - Privileged Admins Only */}
      {isPrivilegedAdmin && pendingFlats.length > 0 && (
        <div style={{
          background: isPastDueDate ? 'linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)' : 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          border: isPastDueDate ? '2px solid #FCA5A5' : '2px solid #FDE68A',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: isPastDueDate ? '0 4px 14px rgba(220, 38, 38, 0.12)' : '0 4px 14px rgba(217, 119, 6, 0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: isPastDueDate ? '#FEE2E2' : '#FEF3C7',
              border: isPastDueDate ? '1px solid #FCA5A5' : '1px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertTriangle size={22} color={isPastDueDate ? '#DC2626' : '#D97706'} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: isPastDueDate ? '#991B1B' : '#92400E', margin: '0 0 2px 0' }}>
                {isPastDueDate ? `🚨 OVERDUE NOTICE: Past ${dueDateDay}th Payment Deadline!` : `⏳ Maintenance Payment Tracker (Due by ${dueDateDay}th)`}
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: isPastDueDate ? '#7F1D1D' : '#78350F' }}>
                <strong>{pendingFlats.length} Flats Pending</strong> • Total Uncollected: <strong style={{ fontSize: '0.92rem' }}>₹{totalPendingAmount.toLocaleString('en-IN')}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (pendingFlats.length > 0) {
                handleSendOverdueWhatsApp(pendingFlats[0]);
              }
            }}
            className="app-btn app-btn-whatsapp"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <Bell size={15} /> Send Overdue WhatsApp Reminder
          </button>
        </div>
      )}

      {/* Table Header Bar */}
      <div className="table-header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
        <div className="section-header-title">
          <h2>
            <Table style={{ color: '#0096C7', flexShrink: 0 }} /> {record.monthTitle}
          </h2>
          <p>
            Water Meter Readings, Consumed Units & Per-Flat Bill Breakdown ({occupiedCount} Occupied Flats • Watchman Meter: {wmUnits} units)
          </p>
        </div>

        {/* Integrated Treasurer UPI Pill - Privileged Admins Only */}
        {isPrivilegedAdmin && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ECFDF5',
            border: '1.5px solid #A7F3D0',
            borderRadius: '10px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            color: '#065F46',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.08)',
          }}>
            <CreditCard size={15} color="#059669" />
            <span title={`Recipient: ${treasurerName} (Ph: ${treasurerPhone})`}>
              Payee UPI: <strong style={{ color: '#0F172A', fontFamily: 'monospace', fontSize: '0.88rem' }}>{treasurerUpiId}</strong> ({treasurerName})
            </span>
            {isRootOrLead && (
              <button
                onClick={onOpenAdminModal}
                style={{
                  background: '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginLeft: '4px',
                }}
                title="Edit Treasurer UPI ID & Phone Number"
              >
                ✏️ Edit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop Table Container (>= 768px screens) */}
      <div className="desktop-table-view app-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem', tableLayout: 'auto' }}>
          <thead>
            <tr style={{ background: '#F0F9FF', borderBottom: '2px solid #B2D8E5', color: '#0077B6', fontFamily: 'var(--font-title)', userSelect: 'none' }}>
              <th style={{ padding: '8px 6px', whiteSpace: 'nowrap' }}>Flat</th>
              <th style={{ padding: '8px 6px', whiteSpace: 'nowrap' }}>Resident</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', whiteSpace: 'nowrap' }}>Prev</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', whiteSpace: 'nowrap' }}>Curr</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', whiteSpace: 'nowrap' }}>Units</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>Water</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>Panchayat</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>Common</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>Exact Total</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>Due Amount</th>
              <th style={{ padding: '8px 6px', whiteSpace: 'nowrap' }}>Notes</th>
              <th className="no-print" style={{ padding: '8px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {record.flatReadings.map((f) => {
              const effFlat = getEffectiveFlat(f);
              const isWM = f.flatNo === 'WM';
              const isEditing = editingFlatNo === f.flatNo;
              const isPaid = f.status === 'Received';
              const isVacant = !effFlat.isOccupied && !isWM;
              const isUserFlat = currentAdminFlat === f.flatNo;
              const canPayThisFlat = isAdmin && (isRootOrLead || isUserFlat);

              return (
                <tr
                  key={f.flatNo}
                  style={{
                    borderBottom: '1px solid #F1F5F9',
                    borderLeft: isUserFlat && isAdmin ? '4px solid #0284C7' : 'none',
                    background: isWM ? '#FFFBEB' : isUserFlat && isAdmin ? '#F0F9FF' : isVacant ? '#F8FAFC' : isPaid ? '#F0FDF4' : isPastDueDate ? '#FEF2F2' : '#FFFFFF',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {/* Flat Number */}
                  <td style={{ padding: '6px 6px', whiteSpace: 'nowrap', fontWeight: 800 }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 5px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      color: isWM ? '#B45309' : isUserFlat && isAdmin ? '#0284C7' : '#1D4ED8',
                      background: isWM ? '#FEF3C7' : isUserFlat && isAdmin ? '#E0F2FE' : '#EFF6FF',
                      border: isWM ? '1px solid #FDE68A' : isUserFlat && isAdmin ? '1.5px solid #7DD3FC' : '1px solid #BFDBFE',
                      fontWeight: isUserFlat && isAdmin ? 900 : 800,
                    }}>
                      {isWM ? '⚙️ WM' : isUserFlat && isAdmin ? `⭐ #${f.flatNo}` : `Flat #${f.flatNo}`}
                    </span>
                  </td>

                  {/* Resident Name with Inline Status Badge */}
                  <td style={{ padding: '6px 6px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap' }}>
                      <span>{effFlat.residentName}</span>
                      {effFlat.residentType === 'Tenant' && (
                        <span style={{ fontSize: '0.66rem', color: '#64748B', background: '#F1F5F9', padding: '1px 4px', borderRadius: '4px' }}>
                          Tenant
                        </span>
                      )}
                      
                      {!isWM && effFlat.isOccupied && (
                        isPaid ? (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '1px 5px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <CheckCircle2 size={10} /> Paid
                          </span>
                        ) : isPastDueDate ? (
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#B91C1C', background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '1px 5px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <AlertTriangle size={10} /> OVERDUE
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#D97706', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '1px 5px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <AlertCircle size={10} /> Pending
                          </span>
                        )
                      )}
                    </div>
                  </td>

                  {/* Previous Reading (Locked & Derived from Last Month) */}
                  <td style={{ padding: '6px 6px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {isEditing ? (
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '3px 7px', borderRadius: '4px' }} title="Previous reading is auto-derived from last month ending reading and cannot be edited.">
                        <Lock size={11} color="#94A3B8" /> {f.previousReading}
                      </span>
                    ) : (
                      <span style={{ fontWeight: 600, color: '#334155' }}>{f.previousReading}</span>
                    )}
                  </td>

                  {/* Current Reading (Editable in Edit Mode) */}
                  <td style={{ padding: '6px 6px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: '70px', padding: '3px 6px', textAlign: 'center', fontSize: '0.84rem', fontWeight: 800, color: '#0096C7', borderColor: '#0096C7' }}
                        value={tempCurr}
                        onChange={(e) => setTempCurr(Number(e.target.value))}
                        autoFocus
                      />
                    ) : (
                      <span style={{ fontWeight: 700, color: '#0096C7' }}>{f.currentReading}</span>
                    )}
                  </td>

                  {/* Consumed Units */}
                  <td style={{ padding: '6px 6px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 800, color: isWM ? '#D97706' : '#059669', background: isWM ? '#FEF3C7' : '#ECFDF5', padding: '1px 6px', borderRadius: '6px' }}>
                      {f.consumedUnits}
                    </span>
                  </td>

                  {/* Water Cost */}
                  <td style={{ padding: '6px 6px', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600, color: '#0F172A' }}>
                    ₹{f.waterCost.toLocaleString('en-IN')}
                  </td>

                  {/* Panchayat Water Share */}
                  <td style={{ padding: '6px 6px', textAlign: 'right', whiteSpace: 'nowrap', color: '#475569' }}>
                    ₹{f.panchayatShare.toFixed(2)}
                  </td>

                  {/* Common Maintenance Share */}
                  <td style={{ padding: '6px 6px', textAlign: 'right', whiteSpace: 'nowrap', color: '#475569' }}>
                    ₹{f.commonMaintenanceShare.toFixed(2)}
                  </td>

                  {/* Exact Total Value */}
                  <td style={{ padding: '6px 6px', textAlign: 'right', whiteSpace: 'nowrap', color: '#64748B', fontSize: '0.76rem' }}>
                    ₹{f.totalValue.toFixed(2)}
                  </td>

                  {/* Rounded Due Value */}
                  <td style={{ padding: '6px 6px', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 800, color: isWM ? '#64748B' : '#0F172A', fontSize: '0.86rem' }}>
                    ₹{f.roundedValue.toLocaleString('en-IN')}
                  </td>

                  {/* Resident Notes */}
                  <td style={{ padding: '6px 6px', whiteSpace: 'nowrap', fontSize: '0.76rem', color: '#DC2626', fontWeight: 600 }}>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        style={{ padding: '3px 5px', fontSize: '0.76rem' }}
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Notes..."
                      />
                    ) : (
                      f.notes || '-'
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="no-print" style={{ padding: '6px 6px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                      {!isWM && f.isOccupied && canPayThisFlat && (
                        <button
                          onClick={() => onSelectFlatPayment && onSelectFlatPayment(f.flatNo)}
                          style={{
                            background: isPaid ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                          }}
                          title={`Pay maintenance dues via UPI for Flat #${f.flatNo}`}
                        >
                          <CreditCard size={13} /> {isPaid ? 'Paid' : '💳 Pay'}
                        </button>
                      )}

                      {!canPayThisFlat && (
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>-</span>
                      )}

                      {isAdmin && (
                        <>
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveEdit(f.flatNo)}
                              style={{ background: '#059669', color: '#FFF', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Save
                            </button>
                          ) : (
                            isRootOrLead && (
                              <button
                                onClick={() => handleStartEdit(f)}
                                style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', padding: '4px' }}
                                title="Edit Meter Readings"
                              >
                                <Edit2 size={14} />
                              </button>
                            )
                          )}

                          {isPrivilegedAdmin && !isWM && f.isOccupied && (
                            <>
                              <button
                                onClick={() => handleSendFlatWhatsApp(f)}
                                style={{ background: 'none', border: 'none', color: '#25D366', cursor: 'pointer', padding: '4px' }}
                                title="Send WhatsApp Bill"
                              >
                                <Send size={14} />
                              </button>

                              {!isPaid && (
                                <button
                                  onClick={() => handleSendOverdueWhatsApp(f)}
                                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                  title="Send 10th Overdue WhatsApp Reminder"
                                >
                                  <Bell size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer Totals */}
          <tfoot>
            <tr style={{ background: '#F8FAFC', borderTop: '2px solid #CBD5E1', fontWeight: 800, color: '#0F172A' }}>
              <td colSpan={4} style={{ padding: '12px 14px' }}>
                Building Summary & Totals:
              </td>
              <td style={{ padding: '12px 14px', textAlign: 'center', color: '#059669' }}>
                {record.totalUnitsConsumed} Units
              </td>
              <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0F172A' }}>
                ₹{record.flatReadings.reduce((sum, f) => sum + f.waterCost, 0).toLocaleString('en-IN')}
              </td>
              <td style={{ padding: '12px 14px', textAlign: 'right', color: '#475569' }}>
                ₹{record.waterConfig.panchayatWaterBill.toLocaleString('en-IN')}
              </td>
              <td style={{ padding: '12px 14px', textAlign: 'right', color: '#475569' }}>
                ₹{record.totalCommonMaintenance.toLocaleString('en-IN')}
              </td>
              <td style={{ padding: '12px 14px', textAlign: 'right', color: '#64748B' }}>
                -
              </td>
              <td style={{ padding: '12px 14px', textAlign: 'right', color: '#1D4ED8', fontSize: '1.05rem' }}>
                ₹{record.totalGrandCollectionTarget.toLocaleString('en-IN')}
              </td>
              <td colSpan={2} style={{ padding: '12px 14px', textAlign: 'right', color: '#059669' }}>
                Rounded Target Total
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Flat Cards View (< 768px screens like Pixel 9) */}
      <div className="mobile-table-cards-view">
        {record.flatReadings.map((f) => {
          const effFlat = getEffectiveFlat(f);
          const isWM = f.flatNo === 'WM';
          const isEditing = editingFlatNo === f.flatNo;
          const isPaid = f.status === 'Received';
          const isVacant = !effFlat.isOccupied && !isWM;
          const isUserFlat = currentAdminFlat === f.flatNo;
          const canPayThisFlat = isAdmin && (isRootOrLead || isUserFlat);

          return (
            <div
              key={f.flatNo}
              className="app-card"
              style={{
                padding: '14px',
                borderRadius: '16px',
                border: isUserFlat && isAdmin ? '2px solid #0284C7' : isWM ? '1.5px solid #FDE68A' : isPaid ? '1.5px solid #A7F3D0' : isPastDueDate ? '1.5px solid #FCA5A5' : '1.5px solid #CBD5E1',
                background: isWM ? '#FFFBEB' : isUserFlat && isAdmin ? '#F0F9FF' : isVacant ? '#F8FAFC' : isPaid ? '#F0FDF4' : isPastDueDate ? '#FEF2F2' : '#FFFFFF',
              }}
            >
              {/* Header: Flat Badge + Resident Name + Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'nowrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                  <span style={{
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    color: isWM ? '#B45309' : isUserFlat && isAdmin ? '#0284C7' : '#1D4ED8',
                    background: isWM ? '#FEF3C7' : isUserFlat && isAdmin ? '#E0F2FE' : '#EFF6FF',
                    border: isWM ? '1px solid #FDE68A' : isUserFlat && isAdmin ? '1.5px solid #7DD3FC' : '1px solid #BFDBFE',
                    whiteSpace: 'nowrap',
                  }}>
                    {isWM ? '⚙️ WM' : isUserFlat && isAdmin ? `⭐ #${f.flatNo}` : `Flat #${f.flatNo}`}
                  </span>
                  <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                    {effFlat.residentName}
                  </span>
                  {effFlat.residentType === 'Tenant' && (
                    <span style={{ fontSize: '0.64rem', color: '#64748B', background: '#F1F5F9', padding: '1px 4px', borderRadius: '4px' }}>
                      Tenant
                    </span>
                  )}
                </div>

                {!isWM && effFlat.isOccupied && (
                  isPaid ? (
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 7px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={12} /> Paid
                    </span>
                  ) : isPastDueDate ? (
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#B91C1C', background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '2px 7px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <AlertTriangle size={12} /> OVERDUE
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#D97706', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '2px 7px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <AlertCircle size={12} /> Pending
                    </span>
                  )
                )}
              </div>

              {/* Meter Readings Card Section */}
              <div style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                padding: '10px 12px',
                marginBottom: '10px',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Droplets size={13} color="#0096C7" /> Water Readings
                  </span>
                  <span style={{
                    fontWeight: 900,
                    fontSize: '0.78rem',
                    color: isWM ? '#B45309' : '#059669',
                    background: isWM ? '#FEF3C7' : '#ECFDF5',
                    border: isWM ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}>
                    {isEditing ? Math.max(0, tempCurr - f.previousReading) : f.consumedUnits} Units Consumed
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {/* Previous Reading Box (Un-editable & Derived from Last Month) */}
                  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>
                      <Lock size={10} color="#94A3B8" /> Prev (Last Month)
                    </span>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#475569', marginTop: '2px' }}>
                      {f.previousReading}
                    </div>
                  </div>

                  {/* Current Reading Box (Editable when in Edit mode) */}
                  <div style={{
                    background: isEditing ? '#FFFBEB' : '#FFFFFF',
                    border: isEditing ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '6px 8px',
                  }}>
                    <span style={{ fontSize: '0.68rem', color: isEditing ? '#D97706' : '#0077B6', fontWeight: 800, display: 'block' }}>
                      Current Reading {isEditing ? '✏️' : ''}
                    </span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={tempCurr}
                        onChange={(e) => setTempCurr(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '3px 6px',
                          fontSize: '0.94rem',
                          fontWeight: 800,
                          color: '#0F172A',
                          border: '1px solid #F59E0B',
                          borderRadius: '4px',
                          background: '#FFFFFF',
                          boxSizing: 'border-box',
                          marginTop: '2px',
                        }}
                        autoFocus
                      />
                    ) : (
                      <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0096C7', marginTop: '2px' }}>
                        {f.currentReading}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Cost Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px', fontSize: '0.8rem' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px 8px', borderRadius: '8px' }}>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>Water Cost</span>
                  <strong style={{ color: '#0F172A' }}>₹{f.waterCost.toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px 8px', borderRadius: '8px' }}>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>Panchayat Water</span>
                  <strong style={{ color: '#475569' }}>₹{f.panchayatShare.toFixed(2)}</strong>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px 8px', borderRadius: '8px' }}>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>Common Maint.</span>
                  <strong style={{ color: '#475569' }}>₹{f.commonMaintenanceShare.toFixed(2)}</strong>
                </div>

                <div style={{ background: isPaid ? '#ECFDF5' : '#EFF6FF', border: isPaid ? '1px solid #A7F3D0' : '1px solid #BFDBFE', padding: '6px 8px', borderRadius: '8px' }}>
                  <span style={{ color: isPaid ? '#047857' : '#1D4ED8', display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>Total Due</span>
                  <strong style={{ color: isPaid ? '#059669' : '#1D4ED8', fontSize: '0.94rem' }}>₹{f.roundedValue.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Notes */}
              {(f.notes || isEditing) && (
                <div style={{ fontSize: '0.78rem', marginBottom: '8px' }}>
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control"
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Notes..."
                      style={{ padding: '4px 6px', fontSize: '0.78rem' }}
                    />
                  ) : (
                    <span style={{ color: '#DC2626', fontWeight: 600, fontStyle: 'italic' }}>Notes: {f.notes}</span>
                  )}
                </div>
              )}

              {/* Mobile Card Action Buttons */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
                {!isWM && f.isOccupied && canPayThisFlat && (
                  <button
                    onClick={() => onSelectFlatPayment && onSelectFlatPayment(f.flatNo)}
                    style={{
                      background: isPaid ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CreditCard size={13} /> {isPaid ? 'Paid' : '💳 Pay Dues'}
                  </button>
                )}

                {isAdmin && (
                  <>
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveEdit(f.flatNo)}
                        style={{ background: '#059669', color: '#FFF', border: 'none', borderRadius: '4px', padding: '5px 10px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Save
                      </button>
                    ) : (
                      isRootOrLead && (
                        <button
                          onClick={() => handleStartEdit(f)}
                          style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', borderRadius: '6px', padding: '4px 8px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                      )
                    )}

                    {isPrivilegedAdmin && !isWM && f.isOccupied && (
                      <>
                        <button
                          onClick={() => handleSendFlatWhatsApp(f)}
                          style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', borderRadius: '6px', padding: '4px 8px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Send size={13} /> Bill
                        </button>

                        {!isPaid && (
                          <button
                            onClick={() => handleSendOverdueWhatsApp(f)}
                            style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#EF4444', borderRadius: '6px', padding: '4px 8px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            <Bell size={13} /> Overdue
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Mobile Building Totals Summary Card */}
        <div className="app-card" style={{ background: '#F8FAFC', border: '1.5px solid #CBD5E1', padding: '14px', borderRadius: '16px', marginTop: '6px' }}>
          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem', marginBottom: '10px' }}>
            📊 Building Summary & Totals:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
            <div style={{ background: '#FFFFFF', padding: '6px 8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>Total Units Consumed</span>
              <strong style={{ color: '#059669' }}>{record.totalUnitsConsumed} Units</strong>
            </div>
            <div style={{ background: '#FFFFFF', padding: '6px 8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>Water Expense</span>
              <strong style={{ color: '#0F172A' }}>₹{record.flatReadings.reduce((sum, f) => sum + f.waterCost, 0).toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ background: '#FFFFFF', padding: '6px 8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>Panchayat Bill</span>
              <strong style={{ color: '#475569' }}>₹{record.waterConfig.panchayatWaterBill.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ background: '#FFFFFF', padding: '6px 8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.7rem' }}>Common Maintenance</span>
              <strong style={{ color: '#475569' }}>₹{record.totalCommonMaintenance.toLocaleString('en-IN')}</strong>
            </div>
          </div>
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>Grand Collection Target:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1D4ED8' }}>₹{record.totalGrandCollectionTarget.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

