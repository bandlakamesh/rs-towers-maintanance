import React, { useState } from 'react';
import type { NoticeItem } from '../types';
import { Megaphone, Plus, Share2, AlertCircle, Calendar, User, Trash2 } from 'lucide-react';
import { generateWhatsAppNoticeText, openWhatsAppShareLink } from '../utils/whatsappFormatter';

interface NoticeBoardProps {
  notices: NoticeItem[];
  isAdmin: boolean;
  onAddNotice: (newNotice: NoticeItem) => void;
  onDeleteNotice: (noticeId: string) => void;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({
  notices,
  isAdmin,
  onAddNotice,
  onDeleteNotice,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postedBy, setPostedBy] = useState('Bobby (Flat 101 - Maintenance In-Charge)');
  const [priority, setPriority] = useState<'Normal' | 'Urgent'>('Urgent');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newNotice: NoticeItem = {
      id: 'n-' + Date.now(),
      title,
      content,
      date: new Date().toISOString().split('T')[0],
      postedBy,
      priority,
    };

    onAddNotice(newNotice);
    setShowAddModal(false);
    setTitle('');
    setContent('');
  };

  const handleBroadcastWhatsApp = (notice: NoticeItem) => {
    const text = generateWhatsAppNoticeText(notice);
    openWhatsAppShareLink(text);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      
      {/* Header Banner Card */}
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
            <Megaphone size={24} color="#FFD166" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Apartment Notice Board & Broadcast
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#E0F2FE' }}>
              Official maintenance notices, payment deadlines, lift AMC alerts & tank cleaning schedules
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="app-btn"
            style={{
              background: '#FFD166',
              color: '#0E5A73',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            <Plus size={16} /> Post New Announcement
          </button>
        )}
      </div>

      {/* Announcements Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {notices.map((notice) => {
          const isUrgent = notice.priority === 'Urgent';

          return (
            <div
              key={notice.id}
              className="app-card"
              style={{
                borderLeft: isUrgent ? '6px solid #DC2626' : '6px solid #0096C7',
                background: isUrgent ? '#FEF2F2' : '#FFFFFF',
                padding: '20px',
              }}
            >
              {/* Notice Title Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: isUrgent ? '#FEE2E2' : '#E0F7FA',
                      color: isUrgent ? '#DC2626' : '#0077B6',
                      border: isUrgent ? '1px solid #FCA5A5' : '1px solid #48CAE4',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      {isUrgent && <AlertCircle size={12} />} {notice.priority}
                    </span>

                    <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} color="#0096C7" /> {notice.date}
                    </span>

                    <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} color="#0096C7" /> {notice.postedBy}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {notice.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleBroadcastWhatsApp(notice)}
                    className="app-btn app-btn-whatsapp"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    title="Share to RS Towers WhatsApp Group"
                  >
                    <Share2 size={14} /> WhatsApp Group
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => onDeleteNotice(notice.id)}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '6px' }}
                      title="Delete Notice"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

              </div>

              {/* Notice Details Content */}
              <div style={{
                background: isUrgent ? 'rgba(255, 255, 255, 0.8)' : '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px 16px',
                fontSize: '0.9rem',
                color: '#1E293B',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
              }}>
                {notice.content}
              </div>

            </div>
          );
        })}
      </div>

      {/* Post Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0096C7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={20} /> Post Apartment Announcement
            </h3>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Announcement Title:</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tank cleaning scheduled for Sunday"
                  required
                />
              </div>

              <div className="form-group">
                <label>Priority Level:</label>
                <select
                  className="form-control"
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                >
                  <option value="Urgent">🚨 Urgent (Payment / Notice Alert)</option>
                  <option value="Normal">📌 Normal Information</option>
                </select>
              </div>

              <div className="form-group">
                <label>Posted By:</label>
                <input
                  type="text"
                  className="form-control"
                  value={postedBy}
                  onChange={(e) => setPostedBy(e.target.value)}
                  placeholder="e.g. Bobby (Flat 101)"
                />
              </div>

              <div className="form-group">
                <label>Announcement Content:</label>
                <textarea
                  className="form-control"
                  style={{ height: '110px', resize: 'vertical' }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write message details for flat owners..."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '18px' }}>
                <button
                  type="button"
                  className="app-btn app-btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="app-btn app-btn-primary"
                >
                  Post Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
