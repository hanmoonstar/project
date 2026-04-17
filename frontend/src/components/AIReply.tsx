import { useState, useEffect } from 'react';
import { MessageSquare, Copy, Check, RefreshCw, Send, Sparkles } from 'lucide-react';

interface Reply {
  subject: string;
  body: string;
  tone: string;
  confidence: number;
  key_points: string[];
}

interface Email {
  id: string;
  sender: string;
  subject: string;
  body: string;
}

export function AIReply() {
  const [email, setEmail] = useState<Email | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [editingReply, setEditingReply] = useState<Reply | null>(null);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/reply/mock-reply');
      const data = await response.json();
      if (data.success) {
        setEmail(data.email);
        setReplies(data.replies);
      }
    } catch (error) {
      console.error('Failed to load reply data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentReply = replies.find(r => r.tone === selectedTone) || replies[0];

  const handleCopy = () => {
    if (currentReply) {
      navigator.clipboard.writeText(editingReply?.body || currentReply.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = async () => {
    if (!email) return;
    setRegenerating(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/reply/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tone: selectedTone })
      });
      const data = await response.json();
      if (data.success) {
        setReplies(prev => prev.map(r => r.tone === selectedTone ? data.reply : r));
        setEditingReply(null);
      }
    } catch (error) {
      console.error('Failed to regenerate:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const handleEdit = (field: 'subject' | 'body', value: string) => {
    if (currentReply) {
      setEditingReply({
        ...(editingReply || currentReply),
        [field]: value
      });
    }
  };

  const tones = [
    { id: 'professional', label: 'Professional', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: 'friendly', label: 'Friendly', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { id: 'concise', label: 'Concise', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">AI Reply</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Email */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            Original Email
          </h3>
          {email && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">From</p>
                <p className="text-sm text-white">{email.sender}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Subject</p>
                <p className="text-sm text-white font-medium">{email.subject}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Content</p>
                <p className="text-sm text-slate-300 leading-relaxed">{email.body}</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Generated Reply */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              AI Generated Reply
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Copy"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={loadMockData}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tone Selector */}
          <div className="flex gap-2 mb-4">
            {tones.map(tone => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  selectedTone === tone.id
                    ? tone.color
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                {tone.label}
              </button>
            ))}
          </div>

          {currentReply && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-500">Subject</p>
                  <span className="text-xs text-slate-600">Editable</span>
                </div>
                <input
                  type="text"
                  value={editingReply?.subject ?? currentReply.subject}
                  onChange={(e) => handleEdit('subject', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-500">Body</p>
                  <span className="text-xs text-slate-600">Editable</span>
                </div>
                <textarea
                  value={editingReply?.body ?? currentReply.body}
                  onChange={(e) => handleEdit('body', e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-pink-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  {currentReply.key_points.map((point, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded">
                      {point}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-slate-500">
                  Confidence: {Math.round(currentReply.confidence * 100)}%
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {regenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Regenerate
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-400 hover:to-rose-500 transition-all shadow-lg shadow-pink-500/20">
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
