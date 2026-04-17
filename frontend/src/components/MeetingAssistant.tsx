import { useState, useEffect } from 'react';
import { Mic, FileText, Users, Clock, CheckCircle, AlertCircle, Calendar, ChevronRight, Play, Square } from 'lucide-react';

interface ActionItem {
  task: string;
  assignee: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

interface Decision {
  topic: string;
  decision: string;
  stakeholders: string[];
}

interface MeetingSummary {
  title: string;
  duration: number;
  participants: string[];
  decisions: Decision[];
  action_items: ActionItem[];
  key_points: string[];
}

export function MeetingAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  const [meetingHistory, setMeetingHistory] = useState<any[]>([]);

  useEffect(() => {
    loadMeetingHistory();
  }, []);

  const loadMeetingHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/meetings/history');
      const data = await response.json();
      if (data.success) {
        setMeetingHistory(data.meetings);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording with mock data
    setTimeout(() => {
      setTranscript(`张三：我们今天讨论一下 Q4 的产品规划。
李四：我觉得应该优先做移动端优化，用户体验太差了。
王五：同意，但是也要兼顾 Web 端的性能，不能顾此失彼。
张三：最终确定，Q4 重点做移动端，Web 端做基础优化。移动端投入 70% 资源。
李四：我来负责移动端的方案设计，下周三前提交初稿。
王五：我来跟进 Web 端的性能优化，月底前完成首页加载速度提升。
张三：好的，我来整理 Q4 OKR 并同步给团队，本周五前完成。
李四：注意，移动端用户体验是当前最大痛点，需要在 11 月底前完成 MVP 版本。
王五：明白，我们会抓紧时间的。`);
    }, 2000);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/meetings/mock');
      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to analyze:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'medium': return <Clock className="w-4 h-4 text-amber-400" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Meeting Assistant</h2>
            <p className="text-sm text-slate-400">AI-powered meeting notes & action items</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('record')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === 'record' 
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Record
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === 'history' 
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === 'record' ? (
        <>
          {/* Recording Section */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            {!summary ? (
              <div className="text-center py-12">
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={loading}
                  className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-indigo-500 hover:bg-indigo-600'
                  } disabled:opacity-50`}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
                <p className="text-lg text-white mb-2">
                  {isRecording ? 'Recording...' : loading ? 'Analyzing...' : 'Tap to Record'}
                </p>
                <p className="text-sm text-slate-400">
                  {isRecording 
                    ? 'Click stop when meeting ends' 
                    : 'Record your meeting and get AI summary'}
                </p>
                
                {isRecording && transcript && (
                  <div className="mt-6 text-left bg-slate-950 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="text-sm text-slate-300 whitespace-pre-line">{transcript}</p>
                  </div>
                )}
                
                {loading && (
                  <div className="mt-6 flex justify-center">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Meeting Info */}
                <div className="flex items-center gap-6 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">{summary.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">{summary.participants.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">{summary.action_items.length} action items</span>
                  </div>
                </div>

                {/* Decisions */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Decisions
                  </h3>
                  <div className="space-y-2">
                    {summary.decisions.map((decision, idx) => (
                      <div key={idx} className="bg-slate-950/50 rounded-lg p-3">
                        <p className="text-sm font-medium text-white">{decision.topic}</p>
                        <p className="text-sm text-slate-400">{decision.decision}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Items */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Action Items
                  </h3>
                  <div className="space-y-2">
                    {summary.action_items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-slate-950/50 rounded-lg p-3">
                        {getPriorityIcon(item.priority)}
                        <div className="flex-1">
                          <p className="text-sm text-white">{item.task}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                              {item.assignee}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {item.deadline}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Points */}
                {summary.key_points.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Key Points</h3>
                    <ul className="space-y-1">
                      {summary.key_points.map((point, idx) => (
                        <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-indigo-400 mt-1">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => { setSummary(null); setTranscript(''); }}
                  className="w-full py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  New Recording
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* History Tab */
        <div className="space-y-3">
          {meetingHistory.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Mic className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{meeting.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{meeting.date}</span>
                      <span>•</span>
                      <span>{meeting.duration} min</span>
                      <span>•</span>
                      <span>{meeting.participants} participants</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">
                    {meeting.action_items_count} actions
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
