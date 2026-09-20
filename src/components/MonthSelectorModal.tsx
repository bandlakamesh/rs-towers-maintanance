import React, { useState } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import type { MonthMaintenanceRecord } from '../types';
import { recalculateMonthRecord } from '../utils/calculator';

interface MonthSelectorModalProps {
  currentRecord: MonthMaintenanceRecord;
  onClose: () => void;
  onCreateMonth: (newMonthRecord: MonthMaintenanceRecord) => void;
}

export const MonthSelectorModal: React.FC<MonthSelectorModalProps> = ({
  currentRecord,
  onClose,
  onCreateMonth,
}) => {
  const [monthTitle, setMonthTitle] = useState('RS Towers SEP 2026 Maintenance');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthTitle) return;

    // Generate month ID from title or timestamp
    const monthId = monthTitle.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase() + '_' + Date.now().toString().slice(-4);

    // Carry forward current readings to new month's previous readings!
    const newFlatReadings = currentRecord.flatReadings.map((f) => ({
      ...f,
      previousReading: f.currentReading,
      currentReading: f.currentReading, // Default same until updated
      consumedUnits: 0,
      paidAmount: 0,
      status: 'Pending' as const,
      notes: '',
    }));

    const newRecord: MonthMaintenanceRecord = {
      monthId,
      monthTitle,
      waterConfig: { ...currentRecord.waterConfig },
      commonExpenses: currentRecord.commonExpenses.map((exp) => ({ ...exp, id: `exp-${Date.now()}-${Math.random()}` })),
      flatReadings: newFlatReadings,
      totalUnitsConsumed: 0,
      netBillableWaterUnits: 1,
      calculatedUnitRate: currentRecord.calculatedUnitRate,
      totalWaterCost: currentRecord.waterConfig.panchayatWaterBill,
      totalCommonMaintenance: currentRecord.totalCommonMaintenance,
      totalGrandCollectionTarget: 0,
      lastUpdated: Date.now(),
    };

    const finalCalculated = recalculateMonthRecord(newRecord);
    onCreateMonth(finalCalculated);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0096C7', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={18} /> Create New Month Calculation
          </h3>
          <button
            onClick={onClose}
            style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Month Title & Year:</label>
            <input
              type="text"
              className="form-control"
              value={monthTitle}
              onChange={(e) => setMonthTitle(e.target.value)}
              placeholder="e.g. RS Towers SEP 2026 Maintenance"
              required
            />
          </div>

          <div style={{ padding: '12px', borderRadius: '10px', background: '#F0F9FF', border: '1px solid #B2D8E5', marginBottom: '16px', fontSize: '0.82rem', color: '#0077B6', lineHeight: 1.4 }}>
            💡 <strong>Automatic Carry-Forward:</strong> The new month will automatically set each flat's previous water reading to the current ending reading from <strong>{currentRecord.monthTitle}</strong>.
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '18px' }}>
            <button type="button" className="app-btn app-btn-secondary" onClick={onClose} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              Cancel
            </button>
            <button type="submit" className="app-btn app-btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
              <Plus size={16} /> Create Month Sheet
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
