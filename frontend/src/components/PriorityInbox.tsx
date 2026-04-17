import { useState, useEffect } from 'react';
import { 
  AlertTriangle, Clock, CheckCircle, ArrowDown, 
  Zap, BarChart3, Mail, User, Sparkles, Loader2
} from 'lucide-react';

interface EmailAnalysis {
  email_id: string;
  score: number;
  category: 'urgent' | 'important' | 'normal' | 'low';
  reasoning: string;
  factors: {
    sender_importance: number;
    content_urgency: number;
    action_required: number;
    time_sensitivity: number;
  };
  suggested_action: string;
  estimated_response_time: string;
}

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  received_at: string;
}

export function PriorityInbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [analyses, setAnalyses] = useState<EmailAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  useEffect(() => {
    loadPriorityData();
  }, []);

  const loadPriorityData = async () => {
    try {
      // Try to fetch from API
      const response = await fetch('http://localhost:8000/api/v1/priority/mock-analysis');
      const data = await response.json();
      if (data.success) {
        setEmails(data.emails);
        setAnalyses(data.analyses);
      } else {
        // Fallback to mock data if API fails
        loadMockData();
      }
    } catch (error) {
      console.error('Failed to load priority data:', error);
      // Fallback to mock data if API fails
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock data for fallback
    const mockEmails = [
      {
        id: '1',
        sender: 'boss@company.com',
        subject: 'Q1 Report Due',
        preview: 'Please submit the Q1 report by Friday. We need to review it before the board meeting next week.',
        received_at: '2024-03-03T09:00:00'
      },
      {
        id: '2',
        sender: 'client@example.com',
        subject: 'Project Update',
        preview: 'Can we schedule a call to discuss the latest milestones? I have some feedback on the current deliverables.',
        received_at: '2024-03-03T08:30:00'
      },
      {
        id: '3',
        sender: 'newsletter@tech.com',
        subject: 'Weekly Tech Digest',
        preview: 'This week in tech: AI breakthroughs, new framework releases, and upcoming conferences...',
        received_at: '2024-03-03T07:00:00'
      }
    ];

    const mockAnalyses = [
      {
        email_id: '1',
        score: 85,
        category: 'urgent',
        reasoning: '来自老板的邮件，内容包含截止日期，需要立即行动',
        factors: {
          sender_importance: 95,
          content_urgency: 90,
          action_required: 85,
          time_sensitivity: 80
        },
        suggested_action: 'reply',
        estimated_response_time: 'immediate'
      },
      {
        email_id: '2',
        score: 65,
        category: 'important',
        reasoning: '来自客户的邮件，需要安排会议讨论项目进展',
        factors: {
          sender_importance: 80,
          content_urgency: 60,
          action_required: 70,
          time_sensitivity: 65
        },
        suggested_action: 'read',
        estimated_response_time: 'today'
      },
      {
        email_id: '3',
        score: 25,
        category: 'low',
        reasoning: '新闻通讯，不需要立即行动',
        factors: {
          sender_importance: 30,
          content_urgency: 10,
          action_required: 5,
          time_sensitivity: 15
        },
        suggested_action: 'ignore',
        estimated_response_time: 'none'
      }
    ];

    setEmails(mockEmails);
    setAnalyses(mockAnalyses);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urgent': return 'from-red-500 to-orange-500';
      case 'important': return 'from-orange-400 to-yellow-400';
      case 'normal': return 'from-blue-400 to-cyan-400';
      case 'low': return 'from-gray-400 to-gray-300';
      default: return 'from-gray-400 to-gray-300';
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'urgent': return 'bg-red-50 border-red-200';
      case 'important': return 'bg-orange-50 border-orange-200';
      case 'normal': return 'bg-blue-50 border-blue-200';
      case 'low': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'important': return <Zap className="w-5 h-5 text-orange-500" />;
      case 'normal': return <Mail className="w-5 h-5 text-blue-500" />;
      case 'low': return <ArrowDown className="w-5 h-5 text-gray-400" />;
      default: return <Mail className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'reply': return '立即回复';
      case 'read': return '需要阅读';
      case 'delegate': return '可以委派';
      case 'ignore': return '可忽略';
      default: return '查看';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">AI 分析邮件优先级中...</span>
      </div>
    );
  }

  const selectedAnalysis = analyses.find(a => a.email_id === selectedEmail);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Priority Inbox</h2>
        </div>
        <button 
          onClick={loadPriorityData}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Loader2 className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              邮件列表
            </h3>
            <div className="flex gap-2 text-sm">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>紧急</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span>重要</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span>普通</span>
            </div>
          </div>

          {emails.map((email, index) => {
            const analysis = analyses[index];
            if (!analysis) return null;

            return (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                  selectedEmail === email.id 
                    ? 'border-blue-500 shadow-lg' 
                    : getCategoryBg(analysis.category)
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Score Circle */}
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getCategoryColor(analysis.category)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {analysis.score}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryIcon(analysis.category)}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${
                        analysis.category === 'urgent' ? 'bg-red-100 text-red-700' :
                        analysis.category === 'important' ? 'bg-orange-100 text-orange-700' :
                        analysis.category === 'normal' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {analysis.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(email.received_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 truncate">{email.subject}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />
                      {email.sender}
                    </p>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{email.preview}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`text-xs px-2 py-1 rounded-lg ${
                        analysis.suggested_action === 'reply' ? 'bg-red-100 text-red-700 font-medium' :
                        analysis.suggested_action === 'read' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {getActionText(analysis.suggested_action)}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {analysis.estimated_response_time === 'immediate' ? '立即处理' :
                         analysis.estimated_response_time === 'today' ? '今天处理' :
                         analysis.estimated_response_time === 'this_week' ? '本周处理' : '无需处理'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analysis Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            AI 分析详情
          </h3>

          {selectedAnalysis ? (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getCategoryColor(selectedAnalysis.category)} text-white text-2xl font-bold shadow-lg mb-2`}>
                  {selectedAnalysis.score}
                </div>
                <p className="text-sm text-gray-500">优先级评分</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">分析理由</p>
                  <p className="text-gray-800 font-medium">{selectedAnalysis.reasoning}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-500">评分维度</p>
                  
                  <FactorBar 
                    label="发件人重要性"
                    value={selectedAnalysis.factors.sender_importance}
                    color="bg-purple-500"
                  />
                  <FactorBar 
                    label="内容紧急程度"
                    value={selectedAnalysis.factors.content_urgency}
                    color="bg-red-500"
                  />
                  <FactorBar 
                    label="需要行动"
                    value={selectedAnalysis.factors.action_required}
                    color="bg-orange-500"
                  />
                  <FactorBar 
                    label="时间敏感度"
                    value={selectedAnalysis.factors.time_sensitivity}
                    color="bg-blue-500"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">建议操作</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-800">
                      {getActionText(selectedAnalysis.suggested_action)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>点击邮件查看 AI 分析详情</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
            <h4 className="font-semibold mb-3">今日邮件统计</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-2xl font-bold">{analyses.filter(a => a.category === 'urgent').length}</p>
                <p className="text-xs text-indigo-100">紧急邮件</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-2xl font-bold">{analyses.filter(a => a.category === 'important').length}</p>
                <p className="text-xs text-indigo-100">重要邮件</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 col-span-2">
                <p className="text-2xl font-bold">
                  {Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)}
                </p>
                <p className="text-xs text-indigo-100">平均优先级</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FactorBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
