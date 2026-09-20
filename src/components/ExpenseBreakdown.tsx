import React, { useState } from 'react';
import { Droplets, Zap, Plus, Trash2, Edit2, Check, Calculator } from 'lucide-react';
import type { MonthMaintenanceRecord, CommonExpenseItem, WaterCalculationConfig } from '../types';

interface ExpenseBreakdownProps {
  record: MonthMaintenanceRecord;
  isAdmin: boolean;
  onUpdateWaterConfig: (config: WaterCalculationConfig) => void;
  onUpdateCommonExpenses: (expenses: CommonExpenseItem[]) => void;
}

export const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({
  record,
  isAdmin,
  onUpdateWaterConfig,
  onUpdateCommonExpenses,
}) => {
  const [isEditingWater, setIsEditingWater] = useState(false);
  const [panchayatBill, setPanchayatBill] = useState(record.waterConfig.panchayatWaterBill);
  const [tankerCount, setTankerCount] = useState(record.waterConfig.municipalTankerCount);
  const [tankerRate, setTankerRate] = useState(record.waterConfig.municipalTankerRate);
  const [useAutoRate, setUseAutoRate] = useState(!record.waterConfig.manualUnitRate);
  const [manualRate, setManualRate] = useState(record.waterConfig.manualUnitRate || record.calculatedUnitRate || 105);

  // Common expense form state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpName, setNewExpName] = useState('');
  const [newExpAmount, setNewExpAmount] = useState(1000);

  // Common expense item edit state
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editExpName, setEditExpName] = useState('');
  const [editExpAmount, setEditExpAmount] = useState(0);

  // Dynamic live auto-calculated unit rate computation
  const liveTankersTotal = Number(tankerCount) * Number(tankerRate);
  const liveNetUnits = Math.max(1, record.netBillableWaterUnits || 137);
  const liveAutoUnitRate = Math.round(liveTankersTotal / liveNetUnits) || 105;

  const handleSaveWaterConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWaterConfig({
      ...record.waterConfig,
      panchayatWaterBill: Number(panchayatBill),
      municipalTankerCount: Number(tankerCount),
      municipalTankerRate: Number(tankerRate),
      manualUnitRate: useAutoRate ? 0 : Number(manualRate),
    });
    setIsEditingWater(false);
  };

  const handleAddCommonExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpName || newExpAmount <= 0) return;

    const newItem: CommonExpenseItem = {
      id: `exp-${Date.now()}`,
      name: newExpName,
      amount: Number(newExpAmount),
      category: 'Utilities',
    };

    onUpdateCommonExpenses([...record.commonExpenses, newItem]);
    setNewExpName('');
    setNewExpAmount(1000);
    setIsAddExpenseOpen(false);
  };

  const handleStartEditExpense = (item: CommonExpenseItem) => {
    setEditingExpId(item.id);
    setEditExpName(item.name);
    setEditExpAmount(item.amount);
  };

  const handleSaveEditExpense = (id: string) => {
    if (!editExpName.trim() || editExpAmount <= 0) return;

    const updated = record.commonExpenses.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          name: editExpName,
          amount: Number(editExpAmount),
        };
      }
      return item;
    });

    onUpdateCommonExpenses(updated);
    setEditingExpId(null);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = record.commonExpenses.filter((item) => item.id !== id);
    onUpdateCommonExpenses(updated);
  };

  const occupiedCount = record.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied).length;
  const commonPerFlat = record.totalCommonMaintenance / (occupiedCount || 1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '32px' }}>
      
      {/* Card 1: Water Tanker & Unit Rate Calculation */}
      <div className="app-card" style={{ border: '1px solid #FCD34D', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#78350F', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Droplets size={18} color="#D97706" /> Water Supply & Unit Rate Calculation
          </h3>
          {isAdmin && !isEditingWater && (
            <button
              onClick={() => setIsEditingWater(true)}
              style={{ background: '#FDE68A', color: '#92400E', border: '1px solid #FCD34D', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <Edit2 size={12} /> Edit Water Bills
            </button>
          )}
        </div>

        {isEditingWater ? (
          <form onSubmit={handleSaveWaterConfig}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div className="form-group">
                <label>Panchayat Water Bill (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={panchayatBill}
                  onChange={(e) => setPanchayatBill(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Municipal Tankers Count</label>
                <input
                  type="number"
                  className="form-control"
                  value={tankerCount}
                  onChange={(e) => setTankerCount(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rate Per Tanker (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={tankerRate}
                  onChange={(e) => setTankerRate(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Water Unit Rate Mode</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    id="chkAutoRate"
                    checked={useAutoRate}
                    onChange={(e) => setUseAutoRate(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="chkAutoRate" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#78350F', cursor: 'pointer', margin: 0 }}>
                    Auto-Calculate Unit Rate
                  </label>
                </div>
              </div>
            </div>

            {/* Auto Rate Live Preview / Manual Box */}
            <div style={{ background: '#FDE68A', padding: '10px 12px', borderRadius: '10px', border: '1px solid #FCD34D', marginBottom: '12px', fontSize: '0.82rem' }}>
              {useAutoRate ? (
                <div>
                  <div style={{ fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calculator size={14} /> Auto-Calculated Unit Rate: <span style={{ fontSize: '1rem', color: '#B45309' }}>₹{liveAutoUnitRate} / Unit</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#B45309', marginTop: '2px' }}>
                    Formula: (Tanker Cost ₹{liveTankersTotal.toLocaleString('en-IN')}) ÷ {liveNetUnits} Billable Units = <strong>₹{liveAutoUnitRate}/unit</strong>
                  </div>
                </div>
              ) : (
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#78350F' }}>Manual Custom Unit Rate (₹/unit):</label>
                  <input
                    type="number"
                    className="form-control"
                    value={manualRate}
                    onChange={(e) => setManualRate(Number(e.target.value))}
                    required
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="app-btn app-btn-secondary" onClick={() => setIsEditingWater(false)} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                Cancel
              </button>
              <button type="submit" className="app-btn app-btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                <Check size={14} /> Save Water Config
              </button>
            </div>
          </form>
        ) : (
          <div>
            {/* Highlighted Yellow Box Formula matching Excel */}
            <div style={{ padding: '14px', borderRadius: '12px', background: '#FDE68A', border: '1px solid #FCD34D', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#78350F', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calculator size={16} color="#B45309" /> Auto-Calculated Water Unit Rate:
              </div>
              <div style={{ fontSize: '0.82rem', color: '#92400E', lineHeight: 1.5 }}>
                Total Tankers Cost = <strong>₹{(record.waterConfig.municipalTankerCount * record.waterConfig.municipalTankerRate).toLocaleString('en-IN')}</strong> ({record.waterConfig.municipalTankerCount} tankers × ₹{record.waterConfig.municipalTankerRate})<br />
                Net Water Units = <strong>{record.totalUnitsConsumed} - 8 (watchman) = {record.netBillableWaterUnits} units</strong><br />
                Unit Rate = <strong>₹{(record.waterConfig.municipalTankerCount * record.waterConfig.municipalTankerRate).toLocaleString('en-IN')} ÷ {record.netBillableWaterUnits}</strong> = <strong style={{ fontSize: '1.05rem', color: '#B45309' }}>₹{record.calculatedUnitRate} / Unit</strong>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px', color: '#78350F' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #FDE68A', paddingBottom: '4px' }}>
                <span>🚰 Panchayat Water Bill Total:</span>
                <strong>₹{record.waterConfig.panchayatWaterBill.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #FDE68A', paddingBottom: '4px' }}>
                <span>🚛 Municipal Tankers Total:</span>
                <strong>₹{(record.waterConfig.municipalTankerCount * record.waterConfig.municipalTankerRate).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.92rem', color: '#92400E', paddingTop: '4px' }}>
                <span>Total Water Expense:</span>
                <span>₹{record.totalWaterCost.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card 2: Building Common Maintenance Expenses */}
      <div className="app-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={18} color="#0096C7" /> Common Building Maintenance Expenses
          </h3>
          {isAdmin && (
            <button
              onClick={() => setIsAddExpenseOpen(!isAddExpenseOpen)}
              style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              <Plus size={12} /> Add Item
            </button>
          )}
        </div>

        {/* Add Common Expense Form */}
        {isAddExpenseOpen && (
          <form onSubmit={handleAddCommonExpense} style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', marginBottom: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Expense Item Name"
                  value={newExpName}
                  onChange={(e) => setNewExpName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount (₹)"
                  value={newExpAmount}
                  onChange={(e) => setNewExpAmount(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button type="button" className="app-btn app-btn-secondary" onClick={() => setIsAddExpenseOpen(false)} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                Cancel
              </button>
              <button type="submit" className="app-btn app-btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                Save Expense
              </button>
            </div>
          </form>
        )}

        {/* Itemized Common Expense List with Edit & Delete Option */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px', maxHeight: '240px', overflowY: 'auto' }}>
          {record.commonExpenses.map((item) => {
            const isEditingThis = editingExpId === item.id;

            return isEditingThis ? (
              <div
                key={item.id}
                style={{
                  background: '#EFF6FF',
                  border: '1.5px solid #BFDBFE',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <input
                  type="text"
                  className="form-control"
                  value={editExpName}
                  onChange={(e) => setEditExpName(e.target.value)}
                  style={{ flex: 1, padding: '4px 8px', fontSize: '0.82rem' }}
                  placeholder="Item Name"
                />
                <input
                  type="number"
                  className="form-control"
                  value={editExpAmount}
                  onChange={(e) => setEditExpAmount(Number(e.target.value))}
                  style={{ width: '90px', padding: '4px 8px', fontSize: '0.82rem' }}
                  placeholder="Amount (₹)"
                />
                <button
                  onClick={() => handleSaveEditExpense(item.id)}
                  style={{ background: '#059669', color: '#FFF', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingExpId(null)}
                  style={{ background: '#E2E8F0', color: '#475569', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                  fontSize: '0.84rem',
                }}
              >
                <span style={{ fontWeight: 600, color: '#334155' }}>{item.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: '#0F172A' }}>₹{item.amount.toLocaleString('en-IN')}</strong>
                  {isAdmin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        onClick={() => handleStartEditExpense(item)}
                        style={{ background: 'none', border: 'none', color: '#0284C7', cursor: 'pointer', padding: '2px' }}
                        title="Edit expense item name or amount"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(item.id)}
                        style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '2px' }}
                        title="Delete expense item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Totals */}
        <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: '10px', fontSize: '0.86rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0F172A', fontSize: '1rem', marginBottom: '4px' }}>
            <span>Total Common Maintenance:</span>
            <span style={{ color: '#0077B6' }}>₹{record.totalCommonMaintenance.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.78rem' }}>
            <span>Per Flat Share ({occupiedCount} Occupied Flats):</span>
            <strong style={{ color: '#059669' }}>₹{commonPerFlat.toFixed(2)} / Flat</strong>
          </div>
        </div>
      </div>

    </div>
  );
};

