import { useState } from 'react';
import { Sparkles, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { nlpAPI } from '../api/client';

interface ParsedWorkflow {
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: Record<string, any>;
  actions: Array<{ type: string; config: Record<string, any> }>;
}

export function NaturalLanguageCreator() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ParsedWorkflow | null>(null);
  const [explanation, setExplanation] = useState('');
  const [message, setMessage] = useState('');
  const [created, setCreated] = useState(false);

  const examples = [
    "每天早上9点，把未读邮件总结发给我",
    "收到老板邮件时，自动标记为高优先级",
    "每周五下午6点，汇总本周工作进度",
    "收到带'发票'的邮件，转发给财务并创建待办",
    "每天下班前，检查是否有紧急邮件未回复",
  ];

  const handlePreview = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const result = await nlpAPI.preview(input);
      setPreview(result.config);
      setExplanation(result.explanation);
      setCreated(false);
    } catch (error) {
      setMessage('❌ 解析失败，请尝试其他描述方式');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    
    try {
      const result = await nlpAPI.createWorkflow(input);
      setMessage(`✅ 工作流 "${result.workflow.name}" 创建成功！`);
      setCreated(true);
      setPreview(null);
      setExplanation('');
      setInput('');
    } catch (error) {
      setMessage('❌ 创建工作流失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Create Workflow</h2>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例如：每天早上9点，把未读邮件总结发给我..."
            className="w-full h-32 p-4 pr-12 bg-slate-950 border border-slate-700 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-lg text-white placeholder-slate-500 transition-all"
          />
          <div className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center text-xs">💡</span>
            <span>描述时间、条件和动作</span>
          </div>
          <button
            onClick={handlePreview}
            disabled={loading || !input.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {loading ? 'Processing...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Examples */}
      {!preview && !message && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Try these examples:</h3>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setInput(example)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">解析结果预览</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="font-semibold text-white mb-1">{preview.name}</h4>
              <p className="text-slate-400 text-sm">{preview.description}</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <pre className="text-sm text-blue-400 whitespace-pre-wrap font-mono">
                {explanation}
              </pre>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Configuration:</h4>
              <pre className="text-xs text-slate-400 overflow-auto">
                {JSON.stringify(preview, null, 2)}
              </pre>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {loading ? '创建中...' : '确认创建工作流'}
            </button>
            <button
              onClick={() => { setPreview(null); setExplanation(''); }}
              className="px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
            >
              重新输入
            </button>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-800' 
            : message.includes('❌') 
              ? 'bg-red-100 text-red-800' 
              : 'bg-blue-100 text-blue-800'
        }`}>
          {message.includes('✅') ? (
            <CheckCircle className="w-5 h-5" />
          ) : message.includes('❌') ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Loader2 className="w-5 h-5 animate-spin" />
          )}
          {message}
        </div>
      )}

      {/* Success Actions */}
      {created && (
        <div className="flex gap-3">
          <button
            onClick={() => setCreated(false)}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            创建另一个工作流
          </button>
          <button
            onClick={() => {
              // Use parent navigation if available
              const event = new CustomEvent('changeTab', { detail: 'workflows' });
              window.dispatchEvent(event);
            }}
            className="flex-1 px-6 py-3 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors"
          >
            查看所有工作流
          </button>
        </div>
      )}
    </div>
  );
}
