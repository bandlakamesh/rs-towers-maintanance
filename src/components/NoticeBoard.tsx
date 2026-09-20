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
  const [postedBy, setPostedBy] = useState('Kamesh (Flat 302 - Root Admin)');
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
    // Reset
    setTitle('');
    setContent('');
  };

  const handleBroadcastWhatsApp = (notice: NoticeItem) => {
    const text = generateWhatsAppNoticeText(notice);
    openWhatsAppShareLink(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-teal-900/60 to-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Apartment Notice Board & Broadcast
            </h2>
            <p className="text-teal-200/80 text-sm mt-0.5">
              Official announcements, water tank cleaning alerts, maintenance payment deadlines, and festival notices
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-bold rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Post New Announcement
          </button>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`p-5 rounded-2xl border transition-all duration-300 shadow-xl ${
              notice.priority === 'Urgent'
                ? 'bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-900 border-red-500/40 hover:border-red-500/70'
                : 'bg-slate-900/70 border-slate-800 hover:border-teal-500/40'
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-3">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                    notice.priority === 'Urgent'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  {notice.priority === 'Urgent' && <AlertCircle className="w-3.5 h-3.5" />}
                  {notice.priority}
                </span>

                <div>
                  <h3 className="text-lg font-bold text-white">{notice.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      {notice.date}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <User className="w-3.5 h-3.5 text-teal-400" />
                      {notice.postedBy}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBroadcastWhatsApp(notice)}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
                  title="Share to RS Towers WhatsApp Group"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  WhatsApp Group
                </button>

                {isAdmin && (
                  <button
                    onClick={() => onDeleteNotice(notice.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl text-slate-200 text-sm whitespace-pre-line leading-relaxed">
              {notice.content}
            </div>
          </div>
        ))}
      </div>

      {/* Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-teal-400" />
              Post Apartment Announcement
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Notice Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="e.g. Tank cleaning scheduled for Sunday"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'Normal' | 'Urgent')}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Urgent">🚨 Urgent (Notice / Payment Alert)</option>
                  <option value="Normal">📌 Normal Information</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Posted By</label>
                <input
                  type="text"
                  value={postedBy}
                  onChange={(e) => setPostedBy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  placeholder="e.g. Kamesh (Flat 302)"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Announcement Details</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 h-28"
                  placeholder="Write message details for flat owners..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/20"
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
