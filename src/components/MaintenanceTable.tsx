import React, { useState } from 'react';
import { Table, Send, CheckCircle2, AlertCircle, Edit2, AlertTriangle, Bell } from 'lucide-react';
import type { MonthMaintenanceRecord, FlatReading } from '../types';
import { generateWhatsAppFlatBillText, generateWhatsAppOverdueReminderText, openWhatsAppShareLink } from '../utils/whatsappFormatter';

interface MaintenanceTableProps {
  record: MonthMaintenanceRecord;
  isAdmin: boolean;
  dueDateDay?: number;
  onUpdateReadings: (updatedReadings: FlatReading[]) => void;
}

export const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
  record,
  isAdmin,
  dueDateDay = 10,
  onUpdateReadings,
}) => {
  const [editingFlatNo, setEditingFlatNo] = useState<string | null>(null);
  const [tempPrev, setTempPrev] = useState<number>(0);
  const [tempCurr, setTempCurr] = useState<number>(0);
  const [tempNotes, setTempNotes] = useState<string>('');

  const todayDate = new Date().getDate();
  const isPastDueDate = todayDate > dueDateDay;

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
        <div className={`mb-4 p-4 rounded-2xl border backdrop-blur-md shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
          isPastDueDate
            ? 'bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 border-red-500/50 text-red-200'
            : 'bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-amber-500/40 text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isPastDueDate ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                {isPastDueDate ? `🚨 OVERDUE NOTICE: Past ${dueDateDay}th Deadline!` : `⏳ Maintenance Payment Tracker (Due by ${dueDateDay}th)`}
              </h4>
              <p className="text-xs opacity-90 mt-0.5">
                <strong>{pendingFlats.length} Flats Pending</strong> • Total Uncollected: <strong className="text-amber-300 font-bold">₹{totalPendingAmount.toLocaleString('en-IN')}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (pendingFlats.length > 0) {
                  handleSendOverdueWhatsApp(pendingFlats[0]);
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Send Overdue WhatsApp Reminder
            </button>
          </div>
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
              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap', minWidth: '120px' }}>Resident</th>
              <th style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '95px' }}>Prev Read</th>
              <th style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '95px' }}>Curr Read</th>
              <th style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '90px' }}>Units</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '100px' }}>Water Cost</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '110px' }}>Panchayat Bill</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '120px' }}>Common Maint</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '105px' }}>Total Value</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '110px' }}>Rounded Due</th>
              <th style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '110px' }}>Status</th>
              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap', minWidth: '150px' }}>Resident Notes</th>
              {isAdmin && <th style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '120px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {record.flatReadings.map((f) => {
              const isWM = f.flatNo === 'WM';
              const isEditing = editingFlatNo === f.flatNo;
              const isPaid = f.status === 'Received';
              const isVacant = !f.isOccupied && !isWM;

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

                  {/* Resident Name */}
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
                    {f.residentName} {f.residentType === 'Tenant' && <span style={{ fontSize: '0.7rem', color: '#64748B', background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>Tenant</span>}
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

                  {/* Status Badge */}
                  <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {isWM || isVacant ? (
                      <span style={{ fontSize: '0.72rem', color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '10px' }}>
                        N/A
                      </span>
                    ) : isPaid ? (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={11} /> Paid
                      </span>
                    ) : isPastDueDate ? (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#B91C1C', background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <AlertTriangle size={11} /> OVERDUE (10th)
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D97706', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <AlertCircle size={11} /> Pending
                      </span>
                    )}
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
                  {isAdmin && (
                    <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(f.flatNo)}
                            style={{ background: '#059669', color: '#FFF', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(f)}
                            style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', padding: '4px' }}
                            title="Edit Meter Readings"
                          >
                            <Edit2 size={14} />
                          </button>
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
                      </div>
                    </td>
                  )}
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
              <td colSpan={isAdmin ? 3 : 2} style={{ padding: '12px 14px', textAlign: 'right', color: '#059669' }}>
                Rounded Target Total
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
};

