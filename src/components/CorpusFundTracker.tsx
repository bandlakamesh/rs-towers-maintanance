import React, { useState } from 'react';
import type { CorpusFundConfig, CorpusExpenseLog, MonthMaintenanceRecord, FlatCorpusOverride } from '../types';
import { Landmark, Plus, Trash2, Calendar, FileText, CheckCircle2, Edit2, Settings, Pencil } from 'lucide-react';

interface CorpusFundTrackerProps {
  corpusConfig: CorpusFundConfig;
  activeRecord: MonthMaintenanceRecord;
  isAdmin: boolean;
  onUpdateCorpusConfig: (updatedConfig: CorpusFundConfig) => void;
}

export const CorpusFundTracker: React.FC<CorpusFundTrackerProps> = ({
  corpusConfig,
  activeRecord,
  isAdmin,
  onUpdateCorpusConfig,
}) => {
  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editMonthlyRate, setEditMonthlyRate] = useState<number>(corpusConfig.monthlyRatePerFlat || 200);
  const [editPastMonths, setEditPastMonths] = useState<number>(corpusConfig.pastMonthsCollected || 12);
  const [editBaseline, setEditBaseline] = useState<number>(corpusConfig.baselineTotalCollected || 33600);

  // Expense Modal State (for both Add & Edit)
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(2000);
  const [category, setCategory] = useState<CorpusExpenseLog['category']>('Lift Overhaul');
  const [approvedBy, setApprovedBy] = useState('Bobby (Flat 101 - Maintenance Lead)');
  const [notes, setNotes] = useState('');

  // Per-Flat Status Edit Modal State
  const [showFlatModal, setShowFlatModal] = useState(false);
  const [editingFlatNo, setEditingFlatNo] = useState<string | null>(null);
  const [flatMonthsPaid, setFlatMonthsPaid] = useState<number>(12);
  const [flatCustomAmount, setFlatCustomAmount] = useState<number>(2400);
  const [flatNotes, setFlatNotes] = useState<string>('');

  const occupiedFlats = activeRecord.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied);
  const occupiedCount = occupiedFlats.length; // 14 flats

  const monthlyRate = corpusConfig.monthlyRatePerFlat || 200;
  const pastMonths = corpusConfig.pastMonthsCollected || 12;
  const flatOverrides = corpusConfig.flatOverrides || {};

  // Compute calculated baseline total collected across all flats
  const defaultTotalPerFlat = monthlyRate * pastMonths;
  const computedCollectedTotal = occupiedFlats.reduce((sum, flat) => {
    const override = flatOverrides[flat.flatNo];
    if (override?.customPaidAmount !== undefined) {
      return sum + override.customPaidAmount;
    }
    if (override?.monthsPaid !== undefined) {
      return sum + (monthlyRate * override.monthsPaid);
    }
    return sum + defaultTotalPerFlat;
  }, 0);

  const baselineCollected = corpusConfig.baselineTotalCollected !== undefined
    ? corpusConfig.baselineTotalCollected
    : computedCollectedTotal;

  const totalSpent = (corpusConfig.corpusExpenses || []).reduce((sum, exp) => sum + exp.amount, 0);
  const netCorpusBalance = baselineCollected - totalSpent;

  // --- Handlers ---

  // Save Settings (Rate, Months, Baseline)
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: CorpusFundConfig = {
      ...corpusConfig,
      monthlyRatePerFlat: Number(editMonthlyRate),
      pastMonthsCollected: Number(editPastMonths),
      baselineTotalCollected: Number(editBaseline),
    };
    onUpdateCorpusConfig(updatedConfig);
    setShowSettingsModal(false);
  };

  // Open Add Expense Modal
  const handleOpenAddExpense = () => {
    setEditingExpenseId(null);
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setTitle('');
    setAmount(2000);
    setCategory('Lift Overhaul');
    setApprovedBy('Bobby (Flat 101 - Maintenance Lead)');
    setNotes('');
    setShowExpenseModal(true);
  };

  // Open Edit Expense Modal
  const handleOpenEditExpense = (expense: CorpusExpenseLog) => {
    setEditingExpenseId(expense.id);
    setExpenseDate(expense.date || new Date().toISOString().split('T')[0]);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setApprovedBy(expense.approvedBy || '');
    setNotes(expense.notes || '');
    setShowExpenseModal(true);
  };

  // Save Expense (Add or Edit)
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    let updatedExpenses: CorpusExpenseLog[] = [...(corpusConfig.corpusExpenses || [])];

    if (editingExpenseId) {
      // Edit existing expense
      updatedExpenses = updatedExpenses.map((exp) => {
        if (exp.id === editingExpenseId) {
          return {
            ...exp,
            date: expenseDate,
            title,
            amount: Number(amount),
            category,
            approvedBy,
            notes,
          };
        }
        return exp;
      });
    } else {
      // Add new expense
      const newExpense: CorpusExpenseLog = {
        id: 'cexp-' + Date.now(),
        date: expenseDate,
        title,
        amount: Number(amount),
        category,
        approvedBy,
        notes,
      };
      updatedExpenses = [newExpense, ...updatedExpenses];
    }

    const updatedConfig: CorpusFundConfig = {
      ...corpusConfig,
      corpusExpenses: updatedExpenses,
    };

    onUpdateCorpusConfig(updatedConfig);
    setShowExpenseModal(false);
  };

  // Delete Expense
  const handleDeleteExpense = (expenseId: string) => {
    if (!window.confirm('Are you sure you want to delete this corpus expense entry?')) return;
    const updatedConfig: CorpusFundConfig = {
      ...corpusConfig,
      corpusExpenses: (corpusConfig.corpusExpenses || []).filter((e) => e.id !== expenseId),
    };
    onUpdateCorpusConfig(updatedConfig);
  };

  // Open Flat Corpus Edit Modal
  const handleOpenEditFlat = (flatNo: string) => {
    const override = flatOverrides[flatNo];
    setEditingFlatNo(flatNo);
    const mPaid = override?.monthsPaid !== undefined ? override.monthsPaid : pastMonths;
    setFlatMonthsPaid(mPaid);
    setFlatCustomAmount(override?.customPaidAmount !== undefined ? override.customPaidAmount : mPaid * monthlyRate);
    setFlatNotes(override?.notes || '');
    setShowFlatModal(true);
  };

  // Save Flat Corpus Override
  const handleSaveFlatOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlatNo) return;

    const updatedFlatOverrides: Record<string, FlatCorpusOverride> = {
      ...flatOverrides,
      [editingFlatNo]: {
        monthsPaid: Number(flatMonthsPaid),
        customPaidAmount: Number(flatCustomAmount),
        notes: flatNotes,
      },
    };

    const updatedConfig: CorpusFundConfig = {
      ...corpusConfig,
      flatOverrides: updatedFlatOverrides,
    };

    onUpdateCorpusConfig(updatedConfig);
    setShowFlatModal(false);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      
      {/* Banner */}
      <div className="app-card" style={{
        background: 'linear-gradient(135deg, #0E5A73 0%, #137A9A 100%)',
        color: '#FFFFFF',
        marginBottom: '20px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        borderColor: '#48CAE4',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Landmark size={24} color="#FFD166" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Apartment Corpus Fund Tracker
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#E0F2FE' }}>
              Dedicated Reserve Pool ({occupiedCount} Flats • ₹{monthlyRate}/Month • Past {pastMonths} Months Collection Status)
            </p>
          </div>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setEditMonthlyRate(monthlyRate);
                setEditPastMonths(pastMonths);
                setEditBaseline(baselineCollected);
                setShowSettingsModal(true);
              }}
              className="app-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                fontWeight: 700,
              }}
              title="Edit Corpus Fund Settings (Monthly Rate, Collection Period, Baseline Total)"
            >
              <Settings size={16} /> Edit Settings
            </button>

            <button
              onClick={handleOpenAddExpense}
              className="app-btn"
              style={{
                background: '#FFD166',
                color: '#0E5A73',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Plus size={16} /> Log Corpus Expenditure
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Card 1: Total Collected */}
        <div className="app-card" style={{ background: '#FFFFFF', borderLeft: '5px solid #0096C7', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Corpus Collected
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditMonthlyRate(monthlyRate);
                  setEditPastMonths(pastMonths);
                  setEditBaseline(baselineCollected);
                  setShowSettingsModal(true);
                }}
                style={{ background: 'none', border: 'none', color: '#0096C7', cursor: 'pointer', padding: 0 }}
                title="Edit Total Collected Amount"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
            ₹{baselineCollected.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '2px', fontWeight: 600 }}>
            {occupiedCount} Flats × ₹{monthlyRate} × {pastMonths} Months
          </div>
        </div>

        {/* Card 2: Total Spent */}
        <div className="app-card" style={{ background: '#FFFFFF', borderLeft: '5px solid #DC2626' }}>
          <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Corpus Spent
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
            Major Repairs & Maintenance ({corpusConfig.corpusExpenses?.length || 0} Logged Items)
          </div>
        </div>

        {/* Card 3: Net Balance */}
        <div className="app-card" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', border: '2px solid #A7F3D0' }}>
          <div style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
            Net Available Corpus
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            ₹{netCorpusBalance.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#065F46', marginTop: '2px', fontWeight: 700 }}>
            Available Reserve Fund
          </div>
        </div>

      </div>

      {/* Flat-by-Flat 12-Month Corpus Status Grid */}
      <div className="app-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#059669" /> Flat Corpus Contribution Breakdown (₹{monthlyRate}/Month per Flat)
          </h3>
          {isAdmin && (
            <span style={{ fontSize: '0.76rem', color: '#64748B', fontStyle: 'italic' }}>
              💡 Click "✏️" on any flat to update custom payment status or months paid
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {occupiedFlats.map((flat) => {
            const override = flatOverrides[flat.flatNo];
            const mPaid = override?.monthsPaid !== undefined ? override.monthsPaid : pastMonths;
            const flatTotalPaid = override?.customPaidAmount !== undefined ? override.customPaidAmount : mPaid * monthlyRate;

            return (
              <div
                key={flat.flatNo}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#1D4ED8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Flat #{flat.flatNo}
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenEditFlat(flat.flatNo)}
                        style={{ background: 'none', border: 'none', color: '#0096C7', cursor: 'pointer', padding: '2px' }}
                        title={`Edit corpus payment status for Flat #${flat.flatNo}`}
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                    {flat.residentName}
                  </div>
                  {override?.notes && (
                    <div style={{ fontSize: '0.7rem', color: '#0284C7', fontStyle: 'italic', marginTop: '2px' }}>
                      {override.notes}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669' }}>
                    ₹{flatTotalPaid.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '0.68rem', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', padding: '1px 6px', borderRadius: '6px', fontWeight: 700 }}>
                    {mPaid} Months Paid
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corpus Expenditures History Table */}
      <div className="app-card" style={{ padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#0096C7" /> Corpus Expenditure & Major Work Log
          </h3>
          {isAdmin && (
            <button
              onClick={handleOpenAddExpense}
              className="app-btn app-btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Plus size={14} /> Add Expenditure
            </button>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: '#F0F9FF', borderBottom: '2px solid #B2D8E5', color: '#0077B6', fontFamily: 'var(--font-title)' }}>
              <th style={{ padding: '12px 16px' }}>Date</th>
              <th style={{ padding: '12px 16px' }}>Expense Details</th>
              <th style={{ padding: '12px 16px' }}>Category</th>
              <th style={{ padding: '12px 16px' }}>Approved By</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount Spent</th>
              {isAdmin && <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {(corpusConfig.corpusExpenses || []).map((exp) => (
              <tr key={exp.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontWeight: 600, color: '#475569' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} color="#0096C7" /> {exp.date}
                  </span>
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A' }}>{exp.title}</div>
                  {exp.notes && <div style={{ fontSize: '0.78rem', color: '#64748B', fontStyle: 'italic' }}>{exp.notes}</div>}
                </td>

                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '0.74rem', background: '#E0F7FA', border: '1px solid #48CAE4', color: '#0077B6', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {exp.category}
                  </span>
                </td>

                <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.82rem' }}>
                  {exp.approvedBy}
                </td>

                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#DC2626', fontSize: '0.95rem' }}>
                  ₹{exp.amount.toLocaleString('en-IN')}
                </td>

                {isAdmin && (
                  <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEditExpense(exp)}
                        style={{ background: 'none', border: 'none', color: '#0096C7', cursor: 'pointer', padding: '4px' }}
                        title="Edit Expense Entry"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                        title="Delete Expense Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {(corpusConfig.corpusExpenses || []).length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                  No corpus fund expenditure items logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Corpus Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0096C7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} /> Edit Corpus Fund Configuration
            </h3>

            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label>Monthly Contribution Rate per Flat (₹):</label>
                <input
                  type="number"
                  className="form-control"
                  value={editMonthlyRate}
                  onChange={(e) => setEditMonthlyRate(Number(e.target.value))}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Number of Months Collected to Date:</label>
                <input
                  type="number"
                  className="form-control"
                  value={editPastMonths}
                  onChange={(e) => setEditPastMonths(Number(e.target.value))}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Baseline Corpus Collected Target (₹):</label>
                <input
                  type="number"
                  className="form-control"
                  value={editBaseline}
                  onChange={(e) => setEditBaseline(Number(e.target.value))}
                  min="0"
                  required
                />
                <small style={{ color: '#64748B', display: 'block', marginTop: '4px' }}>
                  Calculated default: ₹{(occupiedCount * editMonthlyRate * editPastMonths).toLocaleString('en-IN')} ({occupiedCount} flats × ₹{editMonthlyRate} × {editPastMonths} months)
                </small>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setShowSettingsModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add / Edit Corpus Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0096C7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {editingExpenseId ? <Edit2 size={20} /> : <Plus size={20} />}
              {editingExpenseId ? 'Edit Corpus Fund Expenditure' : 'Log Corpus Fund Expenditure'}
            </h3>

            <form onSubmit={handleSaveExpense}>
              <div className="form-group">
                <label>Expense Work Title:</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Major Lift Overhaul & Wire Rope Replacement"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Amount Spent (₹):</label>
                  <input
                    type="number"
                    className="form-control"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Work Category:</label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                  >
                    <option value="Lift Overhaul">Lift Overhaul</option>
                    <option value="Building Painting">Building Painting</option>
                    <option value="Waterproof/Sump">Waterproof/Sump</option>
                    <option value="Motor/Electrical">Motor/Electrical</option>
                    <option value="Festival/Event">Festival/Event</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Date of Expense:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Approved / Managed By:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    placeholder="e.g. Bobby (Flat 101)"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes / Work Receipt Info:</label>
                <textarea
                  className="form-control"
                  style={{ height: '70px', resize: 'vertical' }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Receipt voucher details, technician notes..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setShowExpenseModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                >
                  {editingExpenseId ? 'Update Expense' : 'Log Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Flat Corpus Override Modal */}
      {showFlatModal && editingFlatNo && (
        <div className="modal-overlay" onClick={() => setShowFlatModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0096C7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pencil size={20} /> Update Corpus Details for Flat #{editingFlatNo}
            </h3>

            <form onSubmit={handleSaveFlatOverride}>
              <div className="form-group">
                <label>Months Paid Count:</label>
                <input
                  type="number"
                  className="form-control"
                  value={flatMonthsPaid}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setFlatMonthsPaid(m);
                    setFlatCustomAmount(m * monthlyRate);
                  }}
                  min="0"
                  max="48"
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Corpus Amount Paid (₹):</label>
                <input
                  type="number"
                  className="form-control"
                  value={flatCustomAmount}
                  onChange={(e) => setFlatCustomAmount(Number(e.target.value))}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status Notes (Optional):</label>
                <input
                  type="text"
                  className="form-control"
                  value={flatNotes}
                  onChange={(e) => setFlatNotes(e.target.value)}
                  placeholder="e.g. Paid 1 year in advance via UPI"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setShowFlatModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                >
                  Save Flat Corpus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
