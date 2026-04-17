import { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { inboxAPI } from '../api/client';

interface EmailMessage {
  id: string;
  source: string;
  sender: string;
  subject: string;
  preview: string;
  priority: string;
  received_at: string;
  is_read: boolean;
}

interface InboxSummary {
  total_unread: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  sources: Record<string, number>;
}

export function Inbox() {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [summary, setSummary] = useState<InboxSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch emails from API
        const emailsData = await inboxAPI.getEmails();
        setEmails(emailsData);

        // Fetch summary from API
        const summaryData = await inboxAPI.getSummary();
        setSummary(summaryData);
      } catch (error) {
        console.error('Error fetching inbox data:', error);
        // Fallback to mock data if API fails
        setEmails([
          {
            id: '1',
            source: 'email',
            sender: 'boss@company.com',
            subject: 'Q1 Report Due',
            preview: 'Please submit the Q1 report by Friday. We need to review it before the board meeting next week.',
            priority: 'high',
            received_at: '2024-03-03T09:00:00',
            is_read: false
          },
          {
            id: '2',
            source: 'email',
            sender: 'client@example.com',
            subject: 'Project Update',
            preview: 'Can we schedule a call to discuss the latest milestones? I have some feedback on the current deliverables.',
            priority: 'medium',
            received_at: '2024-03-03T08:30:00',
            is_read: false
          },
          {
            id: '3',
            source: 'email',
            sender: 'newsletter@tech.com',
            subject: 'Weekly Tech Digest',
            preview: 'This week in tech: AI breakthroughs, new framework releases, and upcoming conferences...',
            priority: 'low',
            received_at: '2024-03-03T07:00:00',
            is_read: true
          }
        ]);

        setSummary({
          total_unread: 12,
          high_priority: 3,
          medium_priority: 5,
          low_priority: 4,
          sources: { email: 8, dingtalk: 3, calendar: 1 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-green-500';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-800">{summary.total_unread}</div>
            <div className="text-sm text-gray-500">Unread</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
            <div className="text-2xl font-bold text-red-600">{summary.high_priority}</div>
            <div className="text-sm text-red-500">High Priority</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{summary.medium_priority}</div>
            <div className="text-sm text-yellow-500">Medium Priority</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
            <div className="text-2xl font-bold text-green-600">{summary.low_priority}</div>
            <div className="text-sm text-green-500">Low Priority</div>
          </div>
        </div>
      )}

      {/* Email List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Unified Inbox
          </h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Mark all as read
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {emails.map((email) => (
            <div
              key={email.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${getPriorityClass(email.priority)} ${!email.is_read ? 'font-semibold' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600">{email.sender}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(email.received_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <h3 className={`text-base ${!email.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {email.subject}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{email.preview}</p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  {getPriorityIcon(email.priority)}
                  {!email.is_read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
