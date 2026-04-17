import { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Info, Trash2, Settings } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadMockNotifications();
    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        addRandomNotification();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const loadMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Workflow Completed',
        message: 'Morning Digest executed successfully. Processed 5 emails.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'error',
        title: 'Workflow Failed',
        message: 'Weekly Report failed due to API timeout. Please check your connection.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false
      },
      {
        id: '3',
        type: 'info',
        title: 'New Template Available',
        message: 'Check out the new "Meeting Prep" template in the marketplace.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: true
      },
      {
        id: '4',
        type: 'warning',
        title: 'High Priority Email',
        message: 'You have 3 urgent emails that need your attention.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        read: true
      }
    ];
    setNotifications(mockNotifications);
  };

  const addRandomNotification = () => {
    const types: Notification['type'][] = ['success', 'info'];
    const type = types[Math.floor(Math.random() * types.length)];
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      title: type === 'success' ? 'Workflow Completed' : 'System Update',
      message: type === 'success' 
        ? 'Your workflow executed successfully.' 
        : 'New features are now available.',
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <Bell className="w-5 h-5 text-amber-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'error': return 'bg-red-500/10 border-red-500/20';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed right-4 top-20 w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[500px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  title="Mark all as read"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={clearAll}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`flex items-start gap-3 p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-slate-800/30' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${getBgColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                        <span className="text-xs text-slate-500">{formatTime(notification.timestamp)}</span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/50">
              <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
                Notification Settings
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
