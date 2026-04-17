import { useState, useEffect } from 'react';
import { 
  Play, CheckCircle, XCircle, Loader2, ArrowRight, 
  Mail, Brain, Send, Clock, RefreshCw, Zap, ChevronDown
} from 'lucide-react';
import { workflowAPI } from '../api/client';

interface Workflow {
  id: number;
  name: string;
  description: string;
  trigger_type: string;
  actions: any[];
}

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'output';
  name: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: number;
  output?: string;
}

interface WorkflowExecution {
  id: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed';
  nodes: WorkflowNode[];
  startTime: string;
  endTime?: string;
}

export function WorkflowVisualizer() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await workflowAPI.list();
      setWorkflows(data);
      if (data.length > 0) {
        setSelectedWorkflow(data[0]);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildNodesFromWorkflow = (workflow: Workflow): WorkflowNode[] => {
    const nodes: WorkflowNode[] = [
      {
        id: 'trigger',
        type: 'trigger',
        name: workflow.trigger_type === 'schedule' ? '定时触发' : '邮件触发',
        icon: <Clock className="w-5 h-5" />,
        status: 'pending',
      }
    ];

    workflow.actions?.forEach((action, index) => {
      const actionConfig: Record<string, { name: string; icon: React.ReactNode }> = {
        fetch_emails: { name: '获取邮件', icon: <Mail className="w-5 h-5" /> },
        summarize: { name: 'AI 智能摘要', icon: <Brain className="w-5 h-5" /> },
        send_digest: { name: '发送摘要报告', icon: <Send className="w-5 h-5" /> },
        mark_priority: { name: '标记优先级', icon: <Zap className="w-5 h-5" /> },
        forward: { name: '转发邮件', icon: <Send className="w-5 h-5" /> },
        create_task: { name: '创建任务', icon: <CheckCircle className="w-5 h-5" /> },
      };

      const config = actionConfig[action.type] || { name: action.type, icon: <Zap className="w-5 h-5" /> };
      
      nodes.push({
        id: `action-${index}`,
        type: 'action',
        name: config.name,
        icon: config.icon,
        status: 'pending',
      });
    });

    return nodes;
  };

  const startExecution = async () => {
    if (!selectedWorkflow) return;
    
    setIsExecuting(true);
    
    const nodes = buildNodesFromWorkflow(selectedWorkflow);
    
    const newExecution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      workflowName: selectedWorkflow.name,
      status: 'running',
      startTime: new Date().toISOString(),
      nodes: nodes.map((n, i) => i === 0 ? { ...n, status: 'running', startTime: new Date().toISOString() } : n)
    };
    
    setExecution(newExecution);
    
    // Execute each node with delay
    for (let i = 0; i < nodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setExecution(prev => {
        if (!prev) return null;
        const updatedNodes = [...prev.nodes];
        
        // Complete current node
        updatedNodes[i] = {
          ...updatedNodes[i],
          status: 'completed',
          endTime: new Date().toISOString(),
          duration: Number((Math.random() * 2 + 0.5).toFixed(1)),
          output: generateNodeOutput(updatedNodes[i].name)
        };
        
        // Start next node
        if (i < nodes.length - 1) {
          updatedNodes[i + 1] = {
            ...updatedNodes[i + 1],
            status: 'running',
            startTime: new Date().toISOString()
          };
        }
        
        return { ...prev, nodes: updatedNodes };
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setExecution(prev => prev ? {
      ...prev,
      status: 'completed',
      endTime: new Date().toISOString()
    } : null);
    
    setIsExecuting(false);
  };

  const generateNodeOutput = (nodeName: string): string => {
    const outputs: Record<string, string[]> = {
      '定时触发': ['每天 9:00 触发', '每周一 8:00 触发', '已满足触发条件'],
      '邮件触发': ['收到新邮件', '检测到关键词', '发件人匹配'],
      '获取邮件': ['获取到 5 封未读邮件', '获取到 3 封重要邮件', '获取到 12 封邮件'],
      'AI 智能摘要': ['生成摘要：Q1 财报...', '生成摘要：项目进度...', '生成摘要：客户反馈...'],
      '发送摘要报告': ['摘要已发送至邮箱', '报告已生成', '通知已发送'],
      '标记优先级': ['标记 2 封为高优先级', '自动分类完成', '优先级更新成功'],
      '转发邮件': ['已转发给相关人员', '邮件已分发', '转发完成'],
      '创建任务': ['创建 3 个待办事项', '任务已添加到日历', '待办已同步'],
    };
    
    const possibleOutputs = outputs[nodeName] || ['执行成功'];
    return possibleOutputs[Math.floor(Math.random() * possibleOutputs.length)];
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-500';
      case 'running': return 'bg-blue-500 border-blue-500 animate-pulse';
      case 'failed': return 'bg-red-500 border-red-500';
      default: return 'bg-gray-200 border-gray-300';
    }
  };

  const getNodeIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-white" />;
      case 'running': return <Loader2 className="w-5 h-5 text-white animate-spin" />;
      case 'failed': return <XCircle className="w-5 h-5 text-white" />;
      default: return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      {/* Compact Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">工作流执行可视化</h2>
            <p className="text-sm text-gray-500">实时查看工作流执行过程</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Workflow Selector */}
          <div className="relative">
            <select
              value={selectedWorkflow?.id || ''}
              onChange={(e) => {
                const wf = workflows.find(w => w.id.toString() === e.target.value);
                setSelectedWorkflow(wf || null);
                setExecution(null);
              }}
              disabled={isExecuting}
              className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50"
            >
              {workflows.map(wf => (
                <option key={wf.id} value={wf.id}>{wf.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          <button
            onClick={startExecution}
            disabled={isExecuting || !selectedWorkflow}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
          >
            {isExecuting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 执行中...</>
            ) : (
              <><Play className="w-4 h-4" /> 执行工作流</>
            )}
          </button>
        </div>
      </div>

      {execution ? (
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Execution Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{execution.workflowName}</h3>
              <p className="text-sm text-gray-500">
                执行 ID: {execution.id} • 
                {execution.status === 'running' ? ' 执行中...' : 
                 execution.status === 'completed' ? ' 执行完成' : ' 执行失败'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              execution.status === 'completed' ? 'bg-green-100 text-green-700' :
              execution.status === 'running' ? 'bg-blue-100 text-blue-700' :
              'bg-red-100 text-red-700'
            }`}>
              {execution.status === 'completed' ? '✓ 成功' :
               execution.status === 'running' ? '⟳ 运行中' : '✗ 失败'}
            </div>
          </div>

          {/* Flow Visualization */}
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200" />
            
            <div className="space-y-6">
              {execution.nodes.map((node, index) => (
                <div key={node.id} className="relative flex items-start gap-4">
                  {/* Node Circle */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${getNodeColor(node.status)}`}>
                    {getNodeIcon(node.status)}
                  </div>
                  
                  {/* Node Content */}
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{node.icon}</span>
                        <span className="font-medium text-gray-900">{node.name}</span>
                      </div>
                      {node.duration && (
                        <span className="text-xs text-gray-400">{node.duration}s</span>
                      )}
                    </div>
                    
                    {node.output && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-sm text-gray-600">
                        {node.output}
                      </div>
                    )}
                    
                    {node.status === 'running' && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>正在执行...</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Arrow to next node */}
                  {index < execution.nodes.length - 1 && (
                    <div className="absolute left-5 top-14">
                      <ArrowRight className="w-3 h-3 text-gray-300 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Execution Summary */}
          {execution.status === 'completed' && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">执行成功</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                共 {execution.nodes.length} 个节点，总耗时 {((new Date(execution.endTime!).getTime() - new Date(execution.startTime).getTime()) / 1000).toFixed(1)} 秒
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">开始执行工作流</h3>
          <p className="text-gray-500 mb-4">点击上方按钮查看工作流执行过程的实时可视化</p>
          
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mt-8">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600">触发器</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <Mail className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600">获取数据</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <Brain className="w-6 h-6 text-pink-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600">AI 处理</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <Send className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-xs text-gray-600">输出结果</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
