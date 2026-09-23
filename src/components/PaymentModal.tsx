import React, { useState, useEffect } from 'react';
import { CreditCard, Check, X, Copy, QrCode, ExternalLink, Send, CheckCircle2 } from 'lucide-react';
import type { MonthMaintenanceRecord, PaymentMode } from '../types';

interface PaymentModalProps {
  record: MonthMaintenanceRecord;
  initialFlatNo?: string;
  isAdmin?: boolean;
  onClose: () => void;
  onSavePayment: (flatNo: string, amount: number, paymentMode: PaymentMode, notes: string) => void;
  treasurerUpiId?: string;
  treasurerPhone?: string;
  treasurerName?: string;
  onUpdateTreasurerSettings?: (upiId: string, phone: string, name: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  record,
  initialFlatNo = '101',
  isAdmin = false,
  onClose,
  onSavePayment,
  treasurerUpiId = '9963275455@upi',
  treasurerPhone = '9963275455',
  treasurerName = 'Bobby (Flat 101 - Maintenance Lead)',
  onUpdateTreasurerSettings,
}) => {
  const [selectedFlatNo, setSelectedFlatNo] = useState<string>(initialFlatNo);
  const selectedFlat = record.flatReadings.find((f) => f.flatNo === selectedFlatNo);

  const totalDue = selectedFlat ? selectedFlat.roundedValue : 0;
  const paidAmount = selectedFlat ? selectedFlat.paidAmount : 0;
  const remainingDue = Math.max(0, totalDue - paidAmount);
  const isFullyPaid = (selectedFlat?.status === 'Received' || remainingDue === 0) && totalDue > 0;

  const [amount, setAmount] = useState<number>(remainingDue > 0 ? remainingDue : totalDue);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [notes, setNotes] = useState<string>(selectedFlat?.notes || '');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  
  // Inline Treasurer UPI Editing State
  const [isEditingUpi, setIsEditingUpi] = useState<boolean>(false);
  const [editUpiInput, setEditUpiInput] = useState<string>(treasurerUpiId);
  const [editPhoneInput, setEditPhoneInput] = useState<string>(treasurerPhone);
  const [editNameInput, setEditNameInput] = useState<string>(treasurerName);
  const [showAdminEditForm, setShowAdminEditForm] = useState<boolean>(false);

  const bobbyUpiId = treasurerUpiId;
  const bobbyPhone = treasurerPhone;
  const bobbyName = treasurerName;

  useEffect(() => {
    if (selectedFlat) {
      const rem = Math.max(0, selectedFlat.roundedValue - selectedFlat.paidAmount);
      setAmount(rem > 0 ? rem : selectedFlat.roundedValue);
      setNotes(selectedFlat.notes || '');
    }
  }, [selectedFlatNo]);

  const payAmount = remainingDue > 0 ? remainingDue : totalDue;
  const upiUri = `upi://pay?pa=${bobbyUpiId}&pn=${encodeURIComponent('Bobby RS Towers')}&am=${payAmount}&cu=INR&tn=${encodeURIComponent(`Flat ${selectedFlatNo} Maintenance Dues`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(bobbyUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSendWhatsAppReceipt = () => {
    let text = '';
    if (isFullyPaid) {
      text = `✅ *RS TOWERS MAINTENANCE RECEIPT CONFIRMATION*\n\n📅 *Period*: ${record.monthTitle}\n🏠 *Flat*: *#${selectedFlatNo} - ${selectedFlat?.residentName || 'Resident'}*\n💰 *Amount Paid*: *₹${(paidAmount || totalDue).toLocaleString('en-IN')}*\n📌 *Status*: *PAID IN FULL*\n${notes ? `📝 *Note*: ${notes}\n` : ''}\nThank you! 🙏`;
    } else {
      text = `Hi ${bobbyName},\nI have transferred *₹${amount.toLocaleString('en-IN')}* via UPI for *Flat #${selectedFlatNo}* (${selectedFlat?.residentName || 'Resident'}) for ${record.monthTitle}.\n\nPlease check and confirm payment. Thanks!`;
    }
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
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: isFullyPaid ? '#059669' : '#0096C7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isFullyPaid ? <CheckCircle2 size={20} color="#059669" /> : <CreditCard size={20} color="#0096C7" />}
            {isFullyPaid ? `Maintenance Receipt — Flat #${selectedFlatNo}` : `Pay Dues to Bobby (Flat 101)`}
          </h3>
          <button
            onClick={onClose}
            style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Flat Selector & Status Header Banner */}
        <div style={{
          background: isFullyPaid
            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            : 'linear-gradient(135deg, #0E5A73 0%, #189AB4 100%)',
          color: '#FFFFFF',
          borderRadius: '14px',
          padding: '16px 18px',
          marginBottom: '18px',
          boxShadow: isFullyPaid ? '0 4px 14px rgba(5, 150, 105, 0.25)' : '0 4px 14px rgba(14, 90, 115, 0.2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.76rem', color: isFullyPaid ? '#A7F3D0' : '#BAE6FD', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                {isFullyPaid ? '✅ PAYMENT CONFIRMED' : 'FLAT MAINTENANCE DUES'}
              </span>
              <h4 style={{ margin: '2px 0 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                Flat #{selectedFlatNo} — {selectedFlat?.residentName || 'Resident'}
              </h4>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.74rem', color: '#FFD166', fontWeight: 700 }}>
                {isFullyPaid ? 'Total Paid' : remainingDue < totalDue ? 'Remaining Due' : 'Total Due'}
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#FFFFFF' }}>
                ₹{(isFullyPaid ? paidAmount || totalDue : remainingDue).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* --- SCENARIO A: ALREADY PAID CONFIRMATION VIEW --- */}
        {isFullyPaid ? (
          <div>
            <div style={{
              background: '#ECFDF5',
              border: '1.5px solid #6EE7B7',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '18px',
              textAlign: 'center',
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#D1FAE5', border: '2px solid #34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <CheckCircle2 size={26} color="#059669" />
              </div>

              <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#065F46' }}>
                Maintenance Dues Fully Paid!
              </h4>

              <p style={{ margin: '0 0 14px 0', fontSize: '0.84rem', color: '#047857', lineHeight: 1.45 }}>
                Payment of <strong>₹{(paidAmount || totalDue).toLocaleString('en-IN')}</strong> for <strong>{record.monthTitle}</strong> has been received and confirmed by Bobby (Flat 101 - Maintenance Lead).
              </p>

              {notes && (
                <div style={{ background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '8px 12px', fontSize: '0.82rem', color: '#065F46', display: 'inline-block', fontWeight: 600 }}>
                  📝 Note: {notes}
                </div>
              )}

              <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleSendWhatsAppReceipt}
                  style={{
                    background: '#25D366',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)',
                  }}
                >
                  <Send size={15} /> Share Receipt Confirmation on WhatsApp
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowAdminEditForm(!showAdminEditForm)}
                    style={{
                      background: '#F1F5F9',
                      color: '#475569',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {showAdminEditForm ? 'Hide Edit Form' : '✏️ Admin Edit Record'}
                  </button>
                )}
              </div>
            </div>

            {/* Admin Override Form (Hidden by default for paid flats) */}
            {isAdmin && showAdminEditForm && (
              <form onSubmit={handleSubmit} style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 800, color: '#334155' }}>
                  ✏️ Admin Edit Payment Record
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
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" className="app-btn app-btn-secondary" onClick={onClose} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                    Close
                  </button>
                  <button type="submit" className="app-btn app-btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                    <Check size={16} /> Save Changes
                  </button>
                </div>
              </form>
            )}

            {!showAdminEditForm && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button type="button" className="app-btn app-btn-secondary" onClick={onClose} style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                  Done
                </button>
              </div>
            )}
          </div>
        ) : (
          /* --- SCENARIO B: UNPAID / PENDING PAYMENT FLOW --- */
          <div>
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
                    Scan to Pay ₹{payAmount}
                  </span>
                </div>

                {/* Payee Info & Copy UPI Actions */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontSize: '0.82rem', color: '#0369A1', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Recipient: <strong>{bobbyName}</strong></span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsEditingUpi(!isEditingUpi)}
                        style={{ background: 'none', border: 'none', color: '#0284C7', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 800, textDecoration: 'underline' }}
                      >
                        {isEditingUpi ? 'Close Edit' : '✏️ Edit UPI'}
                      </button>
                    )}
                  </div>

                  {/* Inline Edit Form for Admins */}
                  {isEditingUpi && (
                    <div style={{ background: '#F0F9FF', border: '1.5px solid #7DD3FC', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0369A1', marginBottom: '6px' }}>
                        💳 Edit Treasurer UPI & Phone (Live Sync):
                      </div>
                      <input
                        type="text"
                        value={editUpiInput}
                        onChange={(e) => setEditUpiInput(e.target.value)}
                        placeholder="UPI ID (e.g. 9963275455@upi)"
                        style={{ width: '100%', padding: '6px 8px', fontSize: '0.82rem', borderRadius: '6px', border: '1px solid #CBD5E1', marginBottom: '6px' }}
                      />
                      <input
                        type="text"
                        value={editPhoneInput}
                        onChange={(e) => setEditPhoneInput(e.target.value)}
                        placeholder="Mobile (e.g. 9963275455)"
                        style={{ width: '100%', padding: '6px 8px', fontSize: '0.82rem', borderRadius: '6px', border: '1px solid #CBD5E1', marginBottom: '6px' }}
                      />
                      <input
                        type="text"
                        value={editNameInput}
                        onChange={(e) => setEditNameInput(e.target.value)}
                        placeholder="Name (e.g. Bobby - Flat 101)"
                        style={{ width: '100%', padding: '6px 8px', fontSize: '0.82rem', borderRadius: '6px', border: '1px solid #CBD5E1', marginBottom: '8px' }}
                      />
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => setIsEditingUpi(false)}
                          style={{ padding: '4px 10px', fontSize: '0.74rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateTreasurerSettings?.(editUpiInput, editPhoneInput, editNameInput);
                            setIsEditingUpi(false);
                          }}
                          style={{ padding: '4px 12px', fontSize: '0.74rem', borderRadius: '6px', border: 'none', background: '#0284C7', color: '#FFFFFF', fontWeight: 700 }}
                        >
                          Save UPI
                        </button>
                      </div>
                    </div>
                  )}

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
                    style={{ padding: '6px 8px', fontSize: '0.82rem', background: !isAdmin ? '#F1F5F9' : '#FFFFFF' }}
                    value={selectedFlatNo}
                    onChange={(e) => setSelectedFlatNo(e.target.value)}
                    disabled={!isAdmin}
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
        )}

      </div>
    </div>
  );
};

