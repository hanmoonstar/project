import { useState, useEffect } from 'react';
import { Play, Plus, Settings, Clock, Loader2, CheckCircle, XCircle, Mail, Brain, Send, ArrowRight, Workflow as WorkflowIcon } from 'lucide-react';
import { workflowAPI } from '../api/client';

interface ExecutionNode {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  actions: Record<string, unknown>[];
  is_active: boolean;
  created_at: string;
}

export function WorkflowList() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [executingWorkflow, setExecutingWorkflow] = useState<Workflow | null>(null);
  const [executionNodes, setExecutionNodes] = useState<ExecutionNode[]>([]);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const data = await workflowAPI.list();
      console.log('Loaded workflows:', data);
      
      // Map database workflow to frontend format
      const mappedWorkflows = data.map((w: any) => ({
        id: w.id?.toString() || w.id,
        name: w.name,
        description: w.description,
        trigger_type: w.trigger_type,
        trigger_config: w.trigger_config || {},
        actions: w.actions || [],
        is_active: w.is_active,
        created_at: w.created_at
      }));
      
      // If no workflows in DB, show mock data
      if (mappedWorkflows.length === 0) {
        setWorkflows([
          {
            id: '1',
            name: 'Morning Digest',
            description: 'Daily summary of important emails at 9 AM',
            trigger_type: 'schedule',
            trigger_config: { cron: '0 9 * * *' },
            actions: [
              { type: 'fetch_emails', filter: 'unread' },
              { type: 'summarize', model: 'gpt-4' },
              { type: 'send_digest', destination: 'email' }
            ],
            is_active: true,
            created_at: '2024-03-01T10:00:00'
          }
        ]);
        setMessage('');
      } else {
        setWorkflows(mappedWorkflows);
        setMessage(`✅ 已加载 ${mappedWorkflows.length} 个工作流`);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
      setMessage('⚠️ Using mock data - API not available');
      setWorkflows([
        {
          id: '1',
          name: 'Morning Digest (Mock)',
          description: 'Daily summary of important emails at 9 AM',
          trigger_type: 'schedule',
          trigger_config: { cron: '0 9 * * *' },
          actions: [
            { type: 'fetch_emails', filter: 'unread' },
            { type: 'summarize', model: 'gpt-4' },
            { type: 'send_digest', destination: 'email' }
          ],
          is_active: true,
          created_at: '2024-03-01T10:00:00'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Reload workflows when component becomes visible
  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleExecute = async (workflow: Workflow) => {
    setExecuting(workflow.id);
    setExecutingWorkflow(workflow);
    setExecutionStatus('running');
    setMessage('');
    
    // Build execution nodes from workflow actions
    const nodes: ExecutionNode[] = [
      { id: 'trigger', name: '触发工作流', icon: <Clock className="w-4 h-4" />, status: 'running' }
    ];
    
    workflow.actions?.forEach((action: any, index: number) => {
      const actionType = action.type as string;
      const actionConfig: Record<string, { name: string; icon: React.ReactNode }> = {
        fetch_emails: { name: '获取邮件', icon: <Mail className="w-4 h-4" /> },
        summarize: { name: 'AI 摘要', icon: <Brain className="w-4 h-4" /> },
        send_digest: { name: '发送报告', icon: <Send className="w-4 h-4" /> },
        mark_priority: { name: '标记优先级', icon: <CheckCircle className="w-4 h-4" /> },
        forward: { name: '转发邮件', icon: <Send className="w-4 h-4" /> },
        create_task: { name: '创建任务', icon: <CheckCircle className="w-4 h-4" /> },
      };
      const config = actionConfig[actionType] || { name: actionType, icon: <Play className="w-4 h-4" /> };
      nodes.push({ id: `action-${index}`, name: config.name, icon: config.icon, status: 'pending' });
    });
    
    setExecutionNodes(nodes);
    
    // Simulate step-by-step execution
    for (let i = 0; i < nodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setExecutionNodes(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: 'completed', output: getNodeOutput(updated[i].name) };
        if (i < prev.length - 1) {
          updated[i + 1] = { ...updated[i + 1], status: 'running' };
        }
        return updated;
      });
    }
    
    try {
      const result = await workflowAPI.execute(parseInt(workflow.id));
      setExecutionStatus('completed');
      setMessage(`✅ ${workflow.name} 执行完成！`);
    } catch (error) {
      setExecutionStatus('failed');
      setMessage(`❌ 执行失败: ${error}`);
    } finally {
      setExecuting(null);
      setTimeout(() => {
        setExecutingWorkflow(null);
        setExecutionNodes([]);
        setExecutionStatus('idle');
      }, 3000);
    }
  };

  const getNodeOutput = (name: string): string => {
    const outputs: Record<string, string> = {
      '触发工作流': '条件满足',
      '获取邮件': '获取 5 封邮件',
      'AI 摘要': '生成摘要完成',
      '发送报告': '已发送',
      '标记优先级': '标记完成',
      '转发邮件': '转发成功',
      '创建任务': '任务已创建',
    };
    return outputs[name] || '完成';
  };

  const handleDelete = (workflowId: string) => {
    if (confirm('Delete this workflow?')) {
      setWorkflows(workflows.filter(w => w.id !== workflowId));
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <WorkflowIcon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Workflows</h2>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Execution Progress */}
      {executingWorkflow && executionNodes.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">{executingWorkflow.name}</h3>
            <span className={`text-xs px-2.5 py-1 rounded-full ${
              executionStatus === 'running' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              executionStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {executionStatus === 'running' ? 'Running' :
               executionStatus === 'completed' ? 'Done' : 'Failed'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {executionNodes.map((node, index) => (
              <div key={node.id} className="flex items-center gap-2 flex-shrink-0">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  node.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  node.status === 'running' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse' :
                  'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  {node.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                   node.status === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                   <div className="w-4 h-4 rounded-full border-2 border-slate-600" />}
                  <span className="font-medium whitespace-nowrap">{node.name}</span>
                </div>
                {index < executionNodes.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {message && (
        <div className={`p-4 rounded-xl ${message.includes('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : message.includes('❌') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
          {message}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    workflow.is_active 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {workflow.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-slate-400 mb-4">{workflow.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span className="capitalize">{workflow.trigger_type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="w-4 h-4" />
                    <span>{workflow.actions.length} actions</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleExecute(workflow)}
                  disabled={executing === workflow.id}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
                >
                  {executing === workflow.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {executing === workflow.id ? 'Running...' : 'Run'}
                </button>
                <button
                  onClick={() => handleDelete(workflow.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
