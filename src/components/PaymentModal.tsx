import React, { useState, useEffect } from 'react';
import { CreditCard, Check, X, Copy, QrCode, ExternalLink, Send } from 'lucide-react';
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
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  const bobbyUpiId = '9963275455@upi';
  const bobbyPhone = '9963275455';

  useEffect(() => {
    if (selectedFlat) {
      setAmount(selectedFlat.roundedValue);
      setNotes(selectedFlat.notes || '');
    }
  }, [selectedFlatNo]);

  const upiUri = `upi://pay?pa=${bobbyUpiId}&pn=${encodeURIComponent('Bobby RS Towers')}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Flat ${selectedFlatNo} Maintenance Dues`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(bobbyUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSendWhatsAppReceipt = () => {
    const text = `Hi Bobby (Flat 101),\nI have transferred *₹${amount.toLocaleString('en-IN')}* via UPI for *Flat #${selectedFlatNo}* (${selectedFlat?.residentName || 'Resident'}) for ${record.monthTitle}.\n\nPlease check and confirm payment. Thanks!`;
    const waUrl = `https://wa.me/91${bobbyPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePayment(selectedFlatNo, Number(amount), paymentMode, notes);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0096C7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="#0096C7" /> Pay Dues to Bobby (Flat 101)
          </h3>
          <button
            onClick={onClose}
            style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Flat Selector & Amount Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0E5A73 0%, #189AB4 100%)',
          color: '#FFFFFF',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '16px',
          boxShadow: '0 4px 12px rgba(14, 90, 115, 0.2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#BAE6FD', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Flat Payment Dues</span>
              <h4 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                Flat #{selectedFlatNo} — {selectedFlat?.residentName || 'Resident'}
              </h4>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#FFD166', fontWeight: 700 }}>Total Rounded Due</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>
                ₹{amount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Instant UPI Pay Card & QR Code Box */}
        <div style={{
          background: '#F0F9FF',
          border: '1.5px solid #7DD3FC',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '18px',
        }}>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0369A1', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <QrCode size={16} /> 📲 Instant UPI Payment (GPay / PhonePe / Paytm / BHIM)
          </h5>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Scannable UPI QR Code */}
            <div style={{
              background: '#FFFFFF',
              padding: '8px',
              borderRadius: '10px',
              border: '1px solid #BAE6FD',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <img
                src={qrCodeUrl}
                alt="Bobby UPI QR Code"
                style={{ width: '130px', height: '130px', display: 'block', borderRadius: '4px' }}
              />
              <span style={{ fontSize: '0.68rem', color: '#0284C7', fontWeight: 700, display: 'block', marginTop: '4px' }}>
                Scan to Pay ₹{amount}
              </span>
            </div>

            {/* Payee Info & Copy UPI Actions */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '0.82rem', color: '#0369A1', marginBottom: '6px' }}>
                Recipient: <strong>Bobby (Flat 101 - Maintenance Lead)</strong>
              </div>

              {/* UPI ID Pill with 1-Click Copy */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#FFFFFF',
                border: '1px solid #38BDF8',
                borderRadius: '8px',
                padding: '6px 10px',
                marginBottom: '10px',
              }}>
                <code style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>{bobbyUpiId}</code>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  style={{
                    background: copiedUpi ? '#10B981' : '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {copiedUpi ? <Check size={12} /> : <Copy size={12} />}
                  {copiedUpi ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Action Buttons for Mobile Direct App Launch & WhatsApp */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <a
                  href={upiUri}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  <ExternalLink size={14} /> Open Mobile UPI App (GPay/PhonePe)
                </a>

                <button
                  type="button"
                  onClick={handleSendWhatsAppReceipt}
                  style={{
                    background: '#25D366',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={13} /> Send Receipt Screenshot to Bobby on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Record Payment Form */}
        <form onSubmit={handleSubmit} style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
          <h5 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 800, color: '#334155' }}>
            📝 Record & Save Payment Entry
          </h5>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.76rem' }}>Flat Number:</label>
              <select
                className="form-control"
                style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                value={selectedFlatNo}
                onChange={(e) => setSelectedFlatNo(e.target.value)}
              >
                {record.flatReadings.filter((f) => f.flatNo !== 'WM' && f.isOccupied).map((f) => (
                  <option key={f.flatNo} value={f.flatNo}>
                    Flat #{f.flatNo} ({f.residentName})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.76rem' }}>Amount Paid (₹):</label>
              <input
                type="number"
                className="form-control"
                style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                min={1}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '0.76rem' }}>Payment Mode:</label>
              <select
                className="form-control"
                style={{ padding: '6px 8px', fontSize: '0.82rem' }}
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

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.76rem' }}>Notes / Payment Ref:</label>
            <input
              type="text"
              className="form-control"
              style={{ padding: '6px 8px', fontSize: '0.82rem' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via GPay Ref #4938210"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="app-btn app-btn-secondary" onClick={onClose} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              Close
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

