import React, { useState, useEffect } from 'react';
import { CreditCard, Check, X } from 'lucide-react';
import type { MonthMaintenanceRecord, PaymentMode } from '../types';

interface PaymentModalProps {
  record: MonthMaintenanceRecord;
  initialFlatNo?: string;
  onClose: () => void;
  onSavePayment: (flatNo: string, amount: number, paymentMode: PaymentMode, notes: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  record,
  initialFlatNo = '101',
  onClose,
  onSavePayment,
}) => {
  const [selectedFlatNo, setSelectedFlatNo] = useState<string>(initialFlatNo);
  const selectedFlat = record.flatReadings.find((f) => f.flatNo === selectedFlatNo);

  const [amount, setAmount] = useState<number>(selectedFlat ? selectedFlat.roundedValue : 2000);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [notes, setNotes] = useState<string>(selectedFlat?.notes || '');

  useEffect(() => {
    if (selectedFlat) {
      setAmount(selectedFlat.roundedValue);
      setNotes(selectedFlat.notes || '');
    }
  }, [selectedFlatNo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePayment(selectedFlatNo, Number(amount), paymentMode, notes);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0096C7', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CreditCard size={18} /> Record Maintenance Payment
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
            <label>Select Flat Number:</label>
            <select
              className="form-control"
              value={selectedFlatNo}
              onChange={(e) => setSelectedFlatNo(e.target.value)}
            >
              {record.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied).map((f) => (
                <option key={f.flatNo} value={f.flatNo}>
                  Flat #{f.flatNo} - {f.residentName} (Due: ₹{f.roundedValue})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>Amount Paid (₹):</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                min={1}
              />
            </div>

            <div className="form-group">
              <label>Payment Mode:</label>
              <select
                className="form-control"
                value={paymentMode}
                onChange={(e: any) => setPaymentMode(e.target.value)}
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="NetBanking">NetBanking / NEFT</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Resident Notes / Due Pending:</label>
            <input
              type="text"
              className="form-control"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 2000 corpus fund pending"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '18px' }}>
            <button type="button" className="app-btn app-btn-secondary" onClick={onClose} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              Cancel
            </button>
            <button type="submit" className="app-btn app-btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
              <Check size={16} /> Save Payment Record
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
