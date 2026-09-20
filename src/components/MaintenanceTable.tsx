import React, { useState } from 'react';
import { Table, Send, CheckCircle2, AlertCircle, Edit2, AlertTriangle, Bell, CreditCard } from 'lucide-react';
import type { MonthMaintenanceRecord, FlatReading, UserRole } from '../types';
import { generateWhatsAppFlatBillText, generateWhatsAppOverdueReminderText, openWhatsAppShareLink } from '../utils/whatsappFormatter';

interface MaintenanceTableProps {
  record: MonthMaintenanceRecord;
  isAdmin: boolean;
  userRole?: UserRole;
  currentAdminFlat?: string;
  dueDateDay?: number;
  onUpdateReadings: (updatedReadings: FlatReading[]) => void;
  onSelectFlatPayment?: (flatNo: string) => void;
}

export const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
  record,
  isAdmin,
  userRole = 'PublicResident',
  currentAdminFlat,
  dueDateDay = 10,
  onUpdateReadings,
  onSelectFlatPayment,
}) => {
  const [editingFlatNo, setEditingFlatNo] = useState<string | null>(null);
  const [tempPrev, setTempPrev] = useState<number>(0);
  const [tempCurr, setTempCurr] = useState<number>(0);
  const [tempNotes, setTempNotes] = useState<string>('');

  const todayDate = new Date().getDate();
  const isPastDueDate = todayDate > dueDateDay;
  const isRootOrLead = userRole === 'RootAdmin' || userRole === 'MaintenanceLead';

  const handleStartEdit = (flat: FlatReading) => {
    setEditingFlatNo(flat.flatNo);
    setTempPrev(flat.previousReading);
    setTempCurr(flat.currentReading);
    setTempNotes(flat.notes || '');
  };

  const handleSaveEdit = (flatNo: string) => {
    const updated = record.flatReadings.map((f) => {
      if (f.flatNo === flatNo) {
        return {
          ...f,
          previousReading: Number(tempPrev),
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
    const text = generateWhatsAppFlatBillText(flat, record);
    openWhatsAppShareLink(text);
  };

  const handleSendOverdueWhatsApp = (flat: FlatReading) => {
    const text = generateWhatsAppOverdueReminderText(flat, record, dueDateDay);
    openWhatsAppShareLink(text);
  };

  const occupiedCount = record.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied).length;
  const pendingFlats = record.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied && f.status !== 'Received');
  const totalPendingAmount = pendingFlats.reduce((sum, f) => sum + (f.roundedValue - f.paidAmount), 0);
  const wmReading = record.flatReadings.find((f) => f.flatNo === 'WM');
  const wmUnits = wmReading ? wmReading.consumedUnits : 8;

  return (
    <div style={{ marginBottom: '28px' }}>

      {/* 10th of Month Overdue Alert Banner */}
      {pendingFlats.length > 0 && (
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
      <div className="table-header-bar">
        <div className="section-header-title">
          <h2>
            <Table style={{ color: '#0096C7', flexShrink: 0 }} /> {record.monthTitle}
          </h2>
          <p>
            Water Meter Readings, Consumed Units & Per-Flat Bill Breakdown ({occupiedCount} Occupied Flats • Watchman Meter: {wmUnits} units)
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="app-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem', minWidth: '920px' }}>
          <thead>
            <tr style={{ background: '#F0F9FF', borderBottom: '2px solid #B2D8E5', color: '#0077B6', fontFamily: 'var(--font-title)', userSelect: 'none' }}>
              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap', minWidth: '90px' }}>Flat #</th>
              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap', minWidth: '150px' }}>Resident</th>
              <th style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '95px' }}>Prev Read</th>
              <th style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '95px' }}>Curr Read</th>
              <th style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '90px' }}>Units</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '100px' }}>Water Cost</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '110px' }}>Panchayat Bill</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '120px' }}>Common Maint</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '105px' }}>Total Value</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '110px' }}>Rounded Due</th>
              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap', minWidth: '150px' }}>Resident Notes</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '130px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {record.flatReadings.map((f) => {
              const isWM = f.flatNo === 'WM';
              const isEditing = editingFlatNo === f.flatNo;
              const isPaid = f.status === 'Received';
              const isVacant = !f.isOccupied && !isWM;
              const isUserFlat = currentAdminFlat === f.flatNo;
              const canPayThisFlat = isAdmin && (isRootOrLead || isUserFlat);

              return (
                <tr
                  key={f.flatNo}
                  style={{
                    borderBottom: '1px solid #F1F5F9',
                    background: isWM ? '#FFFBEB' : isVacant ? '#F8FAFC' : isPaid ? '#F0FDF4' : isPastDueDate ? '#FEF2F2' : '#FFFFFF',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {/* Flat Number */}
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', fontWeight: 800 }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      color: isWM ? '#B45309' : '#1D4ED8',
                      background: isWM ? '#FEF3C7' : '#EFF6FF',
                      border: isWM ? '1px solid #FDE68A' : '1px solid #BFDBFE',
                    }}>
                      {isWM ? '⚙️ Watchman' : `Flat #${f.flatNo}`}
                    </span>
                  </td>

                  {/* Resident Name with Inline Status Badge */}
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                      <span>{f.residentName}</span>
                      {f.residentType === 'Tenant' && (
                        <span style={{ fontSize: '0.68rem', color: '#64748B', background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>
                          Tenant
                        </span>
                      )}
                      
                      {!isWM && f.isOccupied && (
                        isPaid ? (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 7px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle2 size={11} /> Paid
                          </span>
                        ) : isPastDueDate ? (
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#B91C1C', background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '2px 7px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <AlertTriangle size={11} /> OVERDUE (10th)
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D97706', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '2px 7px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <AlertCircle size={11} /> Pending
                          </span>
                        )
                      )}
                    </div>
                  </td>

                  {/* Previous Reading */}
                  <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: '75px', padding: '4px 6px', textAlign: 'center', fontSize: '0.84rem' }}
                        value={tempPrev}
                        onChange={(e) => setTempPrev(Number(e.target.value))}
                      />
                    ) : (
                      <span style={{ fontWeight: 600, color: '#334155' }}>{f.previousReading}</span>
                    )}
                  </td>

                  {/* Current Reading */}
                  <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: '75px', padding: '4px 6px', textAlign: 'center', fontSize: '0.84rem' }}
                        value={tempCurr}
                        onChange={(e) => setTempCurr(Number(e.target.value))}
                      />
                    ) : (
                      <span style={{ fontWeight: 700, color: '#0096C7' }}>{f.currentReading}</span>
                    )}
                  </td>

                  {/* Consumed Units */}
                  <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 800, color: isWM ? '#D97706' : '#059669', background: isWM ? '#FEF3C7' : '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                      {f.consumedUnits}
                    </span>
                  </td>

                  {/* Water Cost */}
                  <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600, color: '#0F172A' }}>
                    ₹{f.waterCost.toLocaleString('en-IN')}
                  </td>

                  {/* Panchayat Water Share */}
                  <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap', color: '#475569' }}>
                    ₹{f.panchayatShare.toFixed(2)}
                  </td>

                  {/* Common Maintenance Share */}
                  <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap', color: '#475569' }}>
                    ₹{f.commonMaintenanceShare.toFixed(2)}
                  </td>

                  {/* Exact Total Value */}
                  <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap', color: '#64748B', fontSize: '0.82rem' }}>
                    ₹{f.totalValue.toFixed(2)}
                  </td>

                  {/* Rounded Due Value */}
                  <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 800, color: isWM ? '#64748B' : '#0F172A', fontSize: '0.94rem' }}>
                    ₹{f.roundedValue.toLocaleString('en-IN')}
                  </td>

                  {/* Resident Notes */}
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', fontSize: '0.78rem', color: '#DC2626', fontWeight: 600 }}>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        style={{ padding: '4px 6px', fontSize: '0.78rem' }}
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Notes (e.g. 2000 pending)"
                      />
                    ) : (
                      f.notes || '-'
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
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

                          {!isWM && f.isOccupied && (
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

    </div>
  );
};

