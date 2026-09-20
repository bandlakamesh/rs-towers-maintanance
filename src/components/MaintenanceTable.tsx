import React, { useState } from 'react';
import { Table, Send, CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';
import type { MonthMaintenanceRecord, FlatReading } from '../types';
import { generateWhatsAppFlatBillText, openWhatsAppShareLink } from '../utils/whatsappFormatter';

interface MaintenanceTableProps {
  record: MonthMaintenanceRecord;
  isAdmin: boolean;
  onUpdateReadings: (updatedReadings: FlatReading[]) => void;
}

export const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
  record,
  isAdmin,
  onUpdateReadings,
}) => {
  const [editingFlatNo, setEditingFlatNo] = useState<string | null>(null);
  const [tempPrev, setTempPrev] = useState<number>(0);
  const [tempCurr, setTempCurr] = useState<number>(0);
  const [tempNotes, setTempNotes] = useState<string>('');

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

  const occupiedCount = record.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied).length;
  const wmReading = record.flatReadings.find((f) => f.flatNo === 'WM');
  const wmUnits = wmReading ? wmReading.consumedUnits : 8;

  return (
    <div style={{ marginBottom: '28px' }}>
      
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
              <th style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '100px' }}>Status</th>
              <th style={{ padding: '12px 14px', whiteSpace: 'nowrap', minWidth: '150px' }}>Resident Notes</th>
              {isAdmin && <th style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '100px' }}>Actions</th>}
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
                    background: isWM ? '#FFFBEB' : isVacant ? '#F8FAFC' : isPaid ? '#F0FDF4' : '#FFFFFF',
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
                    ) : (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
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
                          <button
                            onClick={() => handleSendFlatWhatsApp(f)}
                            style={{ background: 'none', border: 'none', color: '#25D366', cursor: 'pointer', padding: '4px' }}
                            title="Send WhatsApp Bill"
                          >
                            <Send size={14} />
                          </button>
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
