
import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  Settings, 
  Save, 
  Trash2, 
  Search, 
  Database,
  LayoutTemplate,
  PlusCircle,
  Link2,
  FileJson,
  MousePointer2,
  Activity,
  BarChart3,
  Eye,
  EyeOff,
  Cloud,
  Edit2,
  Palette
} from 'lucide-react';
import GraphCanvas from './components/GraphCanvas';
import RiskCloudCanvas, { CloudParams } from './components/RiskCloudCanvas';
import { GraphData, GraphNode, NodeType } from './types';
import { INITIAL_DATA, NODE_LABELS_ZH, NODE_COLORS, GRAPH_TEMPLATES } from './constants';

type ViewMode = 'graph' | 'risk';

// Initial Risk Clouds
const INITIAL_RISK_CLOUDS: CloudParams[] = [
  { id: 'std_low', name: '标准-低风险(优)', Ex: 90, En: 3, He: 0.1, color: '#10b981', drops: 1000, visible: true },
  { id: 'std_med', name: '标准-中风险(良)', Ex: 75, En: 5, He: 0.3, color: '#eab308', drops: 1000, visible: true },
  { id: 'std_high', name: '标准-高风险(差)', Ex: 40, En: 10, He: 1, color: '#ef4444', drops: 1000, visible: true },
  { id: 'current_1', name: '当前管道腐蚀评价', Ex: 82, En: 4, He: 0.5, color: '#3b82f6', drops: 2000, visible: true },
];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  // --- Graph State ---
  const [graphData, setGraphData] = useState<GraphData>(INITIAL_DATA);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [activeTab, setActiveTab] = useState<'node' | 'link'>('node');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<NodeType>(NodeType.PIPE);
  const [newLinkSource, setNewLinkSource] = useState('');
  const [newLinkTarget, setNewLinkTarget] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('demo');

  // --- Risk Cloud State ---
  const [riskClouds, setRiskClouds] = useState<CloudParams[]>(INITIAL_RISK_CLOUDS);
  const [selectedCloudId, setSelectedCloudId] = useState<string>(INITIAL_RISK_CLOUDS[3].id);

  // --- Layout State ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Graph Management Functions ---

  const handleLoadTemplate = () => {
    const template = GRAPH_TEMPLATES[selectedTemplate];
    if (template) {
      const newData = JSON.parse(JSON.stringify(template));
      setGraphData(newData);
      setSelectedNode(null);
      showNotification(`已加载 "${selectedTemplate}" 模组数据`, 'success');
    }
  };

  const handleAddNode = () => {
    if (!newNodeLabel.trim()) {
      showNotification("请输入节点名称", 'error');
      return;
    }
    const newNode: GraphNode = {
      id: `manual_${Date.now()}`,
      label: newNodeLabel,
      type: newNodeType,
      properties: {},
      x: dimensions.width / 2 + (Math.random() - 0.5) * 50,
      y: dimensions.height / 2 + (Math.random() - 0.5) * 50
    };

    setGraphData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    
    setNewNodeLabel('');
    showNotification("节点已添加", 'success');
  };

  const handleAddLink = () => {
    if (!newLinkSource || !newLinkTarget) {
      showNotification("请选择起始和目标节点", 'error');
      return;
    }
    if (newLinkSource === newLinkTarget) {
      showNotification("不能连接自身", 'error');
      return;
    }
    if (!newLinkLabel.trim()) {
      showNotification("请输入关系描述", 'error');
      return;
    }

    const exists = graphData.links.some(l => 
      (typeof l.source === 'string' ? l.source : (l.source as GraphNode).id) === newLinkSource &&
      (typeof l.target === 'string' ? l.target : (l.target as GraphNode).id) === newLinkTarget
    );

    if (exists) {
      showNotification("关系已存在", 'error');
      return;
    }

    const newLink = {
      source: newLinkSource,
      target: newLinkTarget,
      label: newLinkLabel
    };

    setGraphData(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));

    setNewLinkLabel('');
    showNotification("关系已添加", 'success');
  };

  const handleDeleteNode = (nodeId: string) => {
    setGraphData(prev => {
      const newNodes = prev.nodes.filter(n => n.id !== nodeId);
      const newLinks = prev.links.filter(l => {
        const sourceId = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
        const targetId = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
        return sourceId !== nodeId && targetId !== nodeId;
      });
      return { nodes: newNodes, links: newLinks };
    });
    setSelectedNode(null);
    showNotification("节点已删除", 'success');
  };

  const handleUpdateNodeColor = (nodeId: string, color: string) => {
    setGraphData(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, color } : n)
    }));
    // 同时更新当前选中的节点状态以便立即看到效果
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, color });
    }
  };

  const handleClearGraph = () => {
    if (window.confirm("确定要清空画布吗？未保存的数据将丢失。")) {
      setGraphData({ nodes: [], links: [] });
      setSelectedNode(null);
    }
  };

  const handleSaveLocal = () => {
    localStorage.setItem('gas_pe_graph_data', JSON.stringify(graphData));
    showNotification("图谱已保存至本地缓存", 'success');
  };

  const handleLoadLocal = () => {
    const saved = localStorage.getItem('gas_pe_graph_data');
    if (saved) {
      try {
        setGraphData(JSON.parse(saved));
        showNotification("已加载本地图谱数据", 'success');
      } catch (e) {
        showNotification("加载数据损坏", 'error');
      }
    } else {
      showNotification("本地无存档", 'error');
    }
  };

  const exportJSON = () => {
    const exportData = {
       ...graphData,
       links: graphData.links.map(l => ({
         source: typeof l.source === 'string' ? l.source : (l.source as GraphNode).id,
         target: typeof l.target === 'string' ? l.target : (l.target as GraphNode).id,
         label: l.label
       }))
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "gas_pipeline_graph.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- Risk Cloud Helper Functions ---

  const handleAddCloud = () => {
    const newCloud: CloudParams = {
      id: `cloud_${Date.now()}`,
      name: '新评估模型',
      Ex: 50,
      En: 5,
      He: 0.5,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      drops: 1500,
      visible: true
    };
    setRiskClouds([...riskClouds, newCloud]);
    setSelectedCloudId(newCloud.id);
    showNotification('已添加新云模型', 'success');
  };

  const handleDeleteCloud = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (riskClouds.length <= 1) {
      showNotification('至少保留一个模型', 'error');
      return;
    }
    if (window.confirm('确定删除该模型吗？')) {
      const newClouds = riskClouds.filter(c => c.id !== id);
      setRiskClouds(newClouds);
      if (selectedCloudId === id) {
        setSelectedCloudId(newClouds[0].id);
      }
      showNotification('模型已删除', 'success');
    }
  };

  const handleUpdateCloud = (id: string, updates: Partial<CloudParams>) => {
    setRiskClouds(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const toggleCloudVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRiskClouds(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const selectedCloud = riskClouds.find(c => c.id === selectedCloudId);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col overflow-hidden relative z-10 flex-shrink-0`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
          <Network className="text-blue-500" />
          <h1 className="font-bold text-lg text-slate-100 whitespace-nowrap">燃气PE管道系统</h1>
        </div>
        
        {/* Module Switcher Tabs */}
        <div className="flex border-b border-slate-800">
          <button 
            onClick={() => setViewMode('graph')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${viewMode === 'graph' ? 'bg-slate-900 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300 bg-slate-950'}`}
          >
            <Network size={16} /> 知识图谱
          </button>
          <button 
            onClick={() => setViewMode('risk')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${viewMode === 'risk' ? 'bg-slate-900 text-purple-400 border-b-2 border-purple-500' : 'text-slate-500 hover:text-slate-300 bg-slate-950'}`}
          >
            <Activity size={16} /> 风险评价
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* --- GRAPH MODE SIDEBAR --- */}
          {viewMode === 'graph' && (
            <>
              {/* Module Selection */}
              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <LayoutTemplate size={14} /> 模组/场景选择
                </h2>
                <div className="flex gap-2">
                  <select 
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 text-sm rounded px-3 py-2 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="demo">默认演示数据</option>
                    <option value="inspection_focus">全面检验重点模组</option>
                    <option value="empty">空白画布</option>
                  </select>
                  <button 
                    onClick={handleLoadTemplate}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    加载
                  </button>
                </div>
              </div>

              {/* Manual Editor */}
              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <MousePointer2 size={14} /> 手动编辑
                </h2>
                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                  <div className="flex border-b border-slate-800">
                    <button 
                        onClick={() => setActiveTab('node')}
                        className={`flex-1 py-2 text-sm flex items-center justify-center gap-2 ${activeTab === 'node' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <PlusCircle size={14} /> 添加节点
                    </button>
                    <button 
                        onClick={() => setActiveTab('link')}
                        className={`flex-1 py-2 text-sm flex items-center justify-center gap-2 ${activeTab === 'link' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Link2 size={14} /> 添加关系
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {activeTab === 'node' ? (
                      <>
                        <div>
                          <label className="text-xs text-slate-500 block mb-1">节点名称</label>
                          <input 
                            type="text" 
                            value={newNodeLabel}
                            onChange={(e) => setNewNodeLabel(e.target.value)}
                            placeholder="例如：主干管01"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 block mb-1">节点类型</label>
                          <select 
                            value={newNodeType}
                            onChange={(e) => setNewNodeType(e.target.value as NodeType)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                          >
                            {Object.entries(NODE_LABELS_ZH).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <button 
                          onClick={handleAddNode}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded text-sm mt-2 transition-colors"
                        >
                          添加节点
                        </button>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-xs text-slate-500 block mb-1">起始节点</label>
                          <select 
                            value={newLinkSource}
                            onChange={(e) => setNewLinkSource(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="">-- 选择起点 --</option>
                            {graphData.nodes.map(n => (
                              <option key={n.id} value={n.id}>{n.label} ({NODE_LABELS_ZH[n.type]})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 block mb-1">目标节点</label>
                          <select 
                            value={newLinkTarget}
                            onChange={(e) => setNewLinkTarget(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="">-- 选择终点 --</option>
                            {graphData.nodes.map(n => (
                              <option key={n.id} value={n.id}>{n.label} ({NODE_LABELS_ZH[n.type]})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 block mb-1">关系描述</label>
                          <input 
                            type="text" 
                            value={newLinkLabel}
                            onChange={(e) => setNewLinkLabel(e.target.value)}
                            placeholder="例如：连接、包含、流向"
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <button 
                          onClick={handleAddLink}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded text-sm mt-2 transition-colors"
                        >
                          添加关系
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Node Info Panel */}
              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Search size={14} /> 选中节点详情
                </h2>
                {selectedNode ? (
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 relative group">
                    <button 
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      className="absolute top-2 right-2 text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="删除节点"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: selectedNode.color || NODE_COLORS[selectedNode.type] }}
                      />
                      <span className="font-bold text-lg">{selectedNode.label}</span>
                    </div>
                    <div className="text-xs text-slate-400 mb-2 font-mono break-all">{selectedNode.id}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-slate-700/50 pb-1">
                        <span className="text-slate-400">类型:</span>
                        <span className="text-slate-200">{NODE_LABELS_ZH[selectedNode.type]}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-700/50 pb-1 items-center">
                        <span className="text-slate-400 flex items-center gap-1"><Palette size={12}/> 颜色:</span>
                        <input 
                          type="color" 
                          value={selectedNode.color || NODE_COLORS[selectedNode.type]} 
                          onChange={(e) => handleUpdateNodeColor(selectedNode.id, e.target.value)}
                          className="h-6 w-10 bg-slate-800 border border-slate-700 rounded cursor-pointer"
                        />
                      </div>
                      {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 ? (
                        Object.entries(selectedNode.properties).map(([key, val]) => (
                          <div key={key} className="flex justify-between border-b border-slate-700/50 pb-1 last:border-0">
                            <span className="text-slate-400 capitalize">{key}:</span>
                            <span className="text-slate-200 text-right">{String(val)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-600 py-1">暂无额外属性</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic text-center py-4 bg-slate-900 rounded border border-slate-800 border-dashed">
                    点击画布中的节点查看详情
                  </div>
                )}
              </div>
            </>
          )}

          {/* --- RISK MODE SIDEBAR --- */}
          {viewMode === 'risk' && (
            <div className="space-y-6">
              
              {/* Cloud Model List */}
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Cloud size={14} /> 云模型列表
                    </h2>
                    <button 
                      onClick={handleAddCloud}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <PlusCircle size={12} /> 新建
                    </button>
                 </div>
                 
                 <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {riskClouds.map(cloud => (
                      <div 
                        key={cloud.id} 
                        onClick={() => setSelectedCloudId(cloud.id)}
                        className={`group flex items-center gap-2 p-2 rounded cursor-pointer border transition-all ${selectedCloudId === cloud.id ? 'bg-slate-800 border-blue-500' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                      >
                         <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cloud.color }}></div>
                         <div className={`flex-1 text-sm truncate ${selectedCloudId === cloud.id ? 'text-white' : 'text-slate-400'}`}>
                           {cloud.name}
                         </div>
                         
                         {/* Action Buttons */}
                         <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                            <button 
                              onClick={(e) => toggleCloudVisibility(cloud.id, e)}
                              className="p-1 hover:text-blue-400 text-slate-500 transition-colors"
                              title="显示/隐藏"
                            >
                              {cloud.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button 
                              onClick={(e) => handleDeleteCloud(cloud.id, e)}
                              className="p-1 hover:text-red-400 text-slate-500 transition-colors"
                              title="删除"
                            >
                              <Trash2 size={14} />
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Cloud Parameters Editor */}
              {selectedCloud ? (
                <div className="space-y-3">
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Edit2 size={14} /> 编辑模型参数
                  </h2>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
                      
                      {/* Name & Color */}
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-slate-500 block mb-1">名称</label>
                          <input 
                            type="text"
                            value={selectedCloud.name}
                            onChange={(e) => handleUpdateCloud(selectedCloud.id, { name: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 block mb-1">颜色</label>
                          <input 
                            type="color"
                            value={selectedCloud.color}
                            onChange={(e) => handleUpdateCloud(selectedCloud.id, { color: e.target.value })}
                            className="h-7 w-10 bg-slate-800 border border-slate-700 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                      
                      {/* Ex */}
                      <div>
                        <label className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>期望值 (Ex)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" min="0" max="100" step="0.5"
                            value={selectedCloud.Ex}
                            onChange={(e) => handleUpdateCloud(selectedCloud.id, { Ex: parseFloat(e.target.value) })}
                            className="flex-1 accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <input 
                            type="number" 
                            min="0" max="100" step="0.1"
                            value={selectedCloud.Ex}
                            onChange={(e) => handleUpdateCloud(selectedCloud.id, { Ex: parseFloat(e.target.value) })}
                            className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-right text-blue-300 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="text-[10px] text-slate-600 mt-1">反映评价结果的中心值</div>
                      </div>

                      {/* En */}
                      <div>
                        <label className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>熵 (En)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" min="0" max="20" step="0.1"
                            value={selectedCloud.En}
                            onChange={(e) => handleUpdateCloud(selectedCloud.id, { En: parseFloat(e.target.value) })}
                            className="flex-1 accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <input 
                            type="number" 
                            min="0" max="50" step="0.1"
                            value={selectedCloud.En}
                            onChange={(e) => handleUpdateCloud(selectedCloud.id, { En: parseFloat(e.target.value) })}
                            className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-right text-blue-300 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="text-[10px] text-slate-600 mt-1">反映结果的离散程度(模糊性)</div>
                      </div>

                      {/* He */}
                      <div>
                        <label className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>超熵 (He)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" min="0" max="5" step="0.05"
                            value={selectedCloud.He}
                            onChange={(e) => handleUpdateCloud(selectedCloud.id, { He: parseFloat(e.target.value) })}
                            className="flex-1 accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <input 
                            type="number" 
                            min="0" max="10" step="0.01"
                            value={selectedCloud.He}
                            onChange={(e) => handleUpdateCloud(selectedCloud.id, { He: parseFloat(e.target.value) })}
                            className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-xs text-right text-blue-300 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="text-[10px] text-slate-600 mt-1">反映熵的不确定性(云滴厚度)</div>
                      </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm text-slate-500 py-10 bg-slate-900 border border-slate-800 rounded-lg border-dashed">
                  请从列表选择一个模型进行编辑
                </div>
              )}

              <div className="p-3 bg-slate-800/50 rounded text-xs text-slate-400 leading-relaxed border border-slate-700/50">
                <p className="mb-1 font-bold text-slate-300">云模型解释：</p>
                云模型通过Ex(期望)、En(熵)、He(超熵)三个数值将定性概念转化为定量图形。您可以自由添加、删除或调整这些模型以对比不同评价结果。
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions (Graph only) */}
        {viewMode === 'graph' && (
          <div className="p-4 border-t border-slate-800 grid grid-cols-3 gap-2">
            <button onClick={handleSaveLocal} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 flex justify-center items-center gap-1 text-xs" title="保存到本地">
              <Save size={16} /> 保存
            </button>
            <button onClick={handleLoadLocal} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 flex justify-center items-center gap-1 text-xs" title="加载本地存档">
              <Database size={16} /> 读取
            </button>
            <button onClick={exportJSON} className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 flex justify-center items-center gap-1 text-xs" title="导出JSON">
              <FileJson size={16} /> 导出
            </button>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Toolbar */}
        <div className="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
            >
              <Settings size={20} />
            </button>
            {!sidebarOpen && (
              <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                 {viewMode === 'graph' ? <Network size={16}/> : <Activity size={16}/>}
                 PE管道图谱系统
              </span>
            )}
            <span className="text-sm text-slate-500 border-l border-slate-700 pl-3 ml-1">
              {viewMode === 'graph' ? '知识图谱视图' : '风险评价视图 (云模型)'}
            </span>
          </div>

          <div className="flex items-center gap-4">
             {viewMode === 'graph' ? (
               <>
                <div className="text-sm text-slate-400 hidden md:block">
                  节点: <span className="text-slate-100 font-mono">{graphData.nodes.length}</span> | 
                  关系: <span className="text-slate-100 font-mono">{graphData.links.length}</span>
                </div>
                <div className="h-4 w-px bg-slate-700 hidden md:block"></div>
                <button 
                    onClick={handleClearGraph}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-sm transition-colors border border-red-500/20"
                >
                  <Trash2 size={14} /> 清空
                </button>
               </>
             ) : (
                <div className="text-sm text-slate-400 flex items-center gap-2">
                   <div className="text-xs text-slate-500">当前显示模型数: <span className="text-slate-300 font-mono">{riskClouds.filter(c => c.visible !== false).length}</span></div>
                </div>
             )}
          </div>
        </div>

        {/* Content Container */}
        <div ref={containerRef} className="flex-1 bg-black relative overflow-hidden">
           {viewMode === 'graph' ? (
             <GraphCanvas 
               data={graphData} 
               width={dimensions.width}
               height={dimensions.height}
               onNodeClick={setSelectedNode}
             />
           ) : (
             <RiskCloudCanvas 
               clouds={riskClouds}
               width={dimensions.width}
               height={dimensions.height}
             />
           )}
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={`absolute top-20 right-8 px-4 py-3 rounded shadow-lg border z-50 animate-fade-in-down ${
            notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-700 text-emerald-100' : 'bg-red-900/90 border-red-700 text-red-100'
          }`}>
             {notification.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
