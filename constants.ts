
import { NodeType, GraphData } from './types';

export const NODE_COLORS: Record<NodeType, string> = {
  [NodeType.PIPE]: '#3b82f6',     // Blue-500
  [NodeType.VALVE]: '#ef4444',    // Red-500
  [NodeType.STATION]: '#eab308',  // Yellow-500
  [NodeType.FITTING]: '#10b981',  // Emerald-500
  [NodeType.RISK]: '#f97316',     // Orange-500
  [NodeType.LOCATION]: '#8b5cf6', // Violet-500
  [NodeType.PERSON]: '#ec4899',   // Pink-500
  [NodeType.DOCUMENT]: '#64748b', // Slate-500
  [NodeType.UNKNOWN]: '#9ca3af',  // Gray-400
};

export const NODE_LABELS_ZH: Record<NodeType, string> = {
  [NodeType.PIPE]: '管道/本体',
  [NodeType.VALVE]: '阀门/装置',
  [NodeType.STATION]: '场站/辅助设施',
  [NodeType.FITTING]: '管件/结构',
  [NodeType.RISK]: '风险/异常',
  [NodeType.LOCATION]: '环境/位置',
  [NodeType.PERSON]: '人员/机构',
  [NodeType.DOCUMENT]: '数据/文档',
  [NodeType.UNKNOWN]: '其他',
};

// 扩充后的演示数据 (60+ 节点)
export const INITIAL_DATA: GraphData = {
  nodes: [
    // 核心根节点
    { id: 'root', label: 'PE管道全生命周期数据', type: NodeType.DOCUMENT },
    
    // 一级目录 (依据PDF)
    { id: 'cat1', label: '基础数据', type: NodeType.DOCUMENT },
    { id: 'cat2', label: '生产数据', type: NodeType.DOCUMENT },
    { id: 'cat3', label: '安装数据', type: NodeType.DOCUMENT },
    { id: 'cat4', label: '运营数据', type: NodeType.DOCUMENT },

    // 基础数据子项 (PDF P1, P9)
    { id: 'n1_1', label: '本体数据', type: NodeType.PIPE },
    { id: 'n1_2', label: '管材性能', type: NodeType.PIPE },
    { id: 'n1_3', label: '管道性能', type: NodeType.PIPE },
    { id: 'n1_4', label: '合格证', type: NodeType.DOCUMENT },
    { id: 'n1_5', label: '质保书', type: NodeType.DOCUMENT },
    { id: 'n1_6', label: '管道壁厚', type: NodeType.FITTING },
    { id: 'n1_7', label: '材料等级', type: NodeType.PIPE },
    { id: 'n1_8', label: '公称直径', type: NodeType.FITTING },
    { id: 'n1_9', label: '静液压强度', type: NodeType.PIPE },

    // 生产数据子项 (PDF P1, P2, P10)
    { id: 'n2_1', label: '管道特性', type: NodeType.PIPE },
    { id: 'n2_2', label: '设计数据', type: NodeType.DOCUMENT },
    { id: 'n2_3', label: '施工数据', type: NodeType.DOCUMENT },
    { id: 'n2_4', label: '操作工艺', type: NodeType.DOCUMENT },
    { id: 'n2_5', label: '安全装置', type: NodeType.VALVE },
    { id: 'n2_6', label: '设计压力', type: NodeType.RISK },
    { id: 'n2_7', label: '设计温度', type: NodeType.LOCATION },
    { id: 'n2_8', label: '走向图', type: NodeType.DOCUMENT },
    { id: 'n2_9', label: '计算书', type: NodeType.DOCUMENT },
    { id: 'n2_10', label: '强度试验记录', type: NodeType.DOCUMENT },

    // 安装数据子项 (PDF P2-P5, P11-P12)
    { id: 'n3_1', label: '敷设环境', type: NodeType.LOCATION },
    { id: 'n3_2', label: '土壤环境', type: NodeType.LOCATION },
    { id: 'n3_3', label: '空气环境', type: NodeType.LOCATION },
    { id: 'n3_4', label: '周边环境', type: NodeType.LOCATION },
    { id: 'n3_5', label: '腐蚀检测', type: NodeType.RISK },
    { id: 'n3_6', label: '保护措施', type: NodeType.VALVE },
    { id: 'n3_7', label: '地面活动', type: NodeType.LOCATION },
    { id: 'n3_8', label: '外观检查', type: NodeType.RISK },
    { id: 'n3_9', label: '跨越/穿越', type: NodeType.LOCATION },
    { id: 'n3_10', label: '埋深数据', type: NodeType.LOCATION },
    { id: 'n3_11', label: '凝水缸', type: NodeType.STATION },
    { id: 'n3_12', label: '标志/围栏', type: NodeType.FITTING },
    { id: 'n3_13', label: '直流干扰', type: NodeType.RISK },
    { id: 'n3_14', label: '土壤电阻率', type: NodeType.LOCATION },

    // 运营数据子项 (PDF P5-P8, P13-P16)
    { id: 'n4_1', label: '焊接参数', type: NodeType.PIPE },
    { id: 'n4_2', label: '全面检验', type: NodeType.DOCUMENT },
    { id: 'n4_3', label: '检测数据', type: NodeType.DOCUMENT },
    { id: 'n4_4', label: '投用记录', type: NodeType.DOCUMENT },
    { id: 'n4_5', label: '异常记录', type: NodeType.RISK },
    { id: 'n4_6', label: '监测记录', type: NodeType.DOCUMENT },
    { id: 'n4_7', label: '气质记录', type: NodeType.DOCUMENT },
    { id: 'n4_8', label: '操作记录', type: NodeType.DOCUMENT },
    { id: 'n4_9', label: '焊接评定', type: NodeType.PERSON },
    { id: 'n4_10', label: '测厚记录', type: NodeType.DOCUMENT },
    { id: 'n4_11', label: '入土/出土点', type: NodeType.LOCATION },
    { id: 'n4_12', label: '阳极电位', type: NodeType.RISK },
    { id: 'n4_13', label: '隐患缺陷', type: NodeType.RISK },
    { id: 'n4_14', label: '事故案例', type: NodeType.DOCUMENT },
    { id: 'n4_15', label: '巡线记录', type: NodeType.PERSON },
    { id: 'n4_16', label: '使用登记证', type: NodeType.DOCUMENT },

    // 关联实体 (补充)
    { id: 'e1', label: '管网管理处', type: NodeType.PERSON },
    { id: 'e2', label: 'PE100管材', type: NodeType.PIPE },
    { id: 'e3', label: '焊接工张某', type: NodeType.PERSON },
    { id: 'e4', label: '滨海调压箱', type: NodeType.STATION },
    { id: 'e5', label: '腐蚀穿孔', type: NodeType.RISK },
  ],
  links: [
    // 根目录关联
    { source: 'root', target: 'cat1', label: '包含' },
    { source: 'root', target: 'cat2', label: '包含' },
    { source: 'root', target: 'cat3', label: '包含' },
    { source: 'root', target: 'cat4', label: '包含' },

    // 基础数据关联
    { source: 'cat1', target: 'n1_1', label: '归档' },
    { source: 'cat1', target: 'n1_2', label: '归档' },
    { source: 'cat1', target: 'n1_4', label: '归档' },
    { source: 'n1_1', target: 'n1_6', label: '属性' },
    { source: 'n1_1', target: 'n1_8', label: '属性' },
    { source: 'n1_2', target: 'n1_7', label: '定义' },
    { source: 'n1_2', target: 'n1_9', label: '测试项' },
    { source: 'n1_4', target: 'n1_5', label: '关联' },

    // 生产数据关联
    { source: 'cat2', target: 'n2_1', label: '管理' },
    { source: 'cat2', target: 'n2_2', label: '管理' },
    { source: 'cat2', target: 'n2_3', label: '管理' },
    { source: 'n2_2', target: 'n2_6', label: '规定' },
    { source: 'n2_2', target: 'n2_7', label: '规定' },
    { source: 'n2_2', target: 'n2_8', label: '包含' },
    { source: 'n2_3', target: 'n2_10', label: '产生' },

    // 安装数据关联
    { source: 'cat3', target: 'n3_1', label: '核查' },
    { source: 'cat3', target: 'n3_6', label: '核查' },
    { source: 'n3_1', target: 'n3_2', label: '包含' },
    { source: 'n3_1', target: 'n3_3', label: '包含' },
    { source: 'n3_1', target: 'n3_4', label: '包含' },
    { source: 'n3_1', target: 'n3_7', label: '包含' },
    { source: 'n3_2', target: 'n3_5', label: '影响' },
    { source: 'n3_2', target: 'n3_14', label: '指标' },
    { source: 'n3_5', target: 'n3_13', label: '检测项' },
    { source: 'n3_9', target: 'n3_10', label: '限制' },
    { source: 'n3_11', target: 'n3_10', label: '位于' },

    // 运营数据关联
    { source: 'cat4', target: 'n4_2', label: '记录' },
    { source: 'cat4', target: 'n4_4', label: '记录' },
    { source: 'cat4', target: 'n4_5', label: '记录' },
    { source: 'n4_1', target: 'n4_9', label: '依据' },
    { source: 'n4_2', target: 'n4_10', label: '含' },
    { source: 'n4_3', target: 'n4_12', label: '指标' },
    { source: 'n4_5', target: 'n4_13', label: '导致' },
    { source: 'n4_13', target: 'n4_14', label: '演变为' },
    { source: 'n4_15', target: 'n4_5', label: '发现' },

    // 跨模块复杂关联 (体现图谱深度)
    { source: 'e1', target: 'root', label: '主管' },
    { source: 'e3', target: 'n4_1', label: '执行' },
    { source: 'e3', target: 'n4_9', label: '资格审查' },
    { source: 'e2', target: 'n1_1', label: '材质实例' },
    { source: 'e4', target: 'n2_5', label: '安装有' },
    { source: 'n3_5', target: 'n4_13', label: '评估依据' },
    { source: 'n2_6', target: 'n4_8', label: '运行基准' },
    { source: 'n3_14', target: 'n4_12', label: '相关因素' },
    { source: 'n4_11', target: 'n3_1', label: '空间描述' },
    { source: 'e5', target: 'n4_13', label: '实例' },
    { source: 'n3_13', target: 'n4_5', label: '异常源' }
  ]
};

export const GRAPH_TEMPLATES: Record<string, GraphData> = {
  "demo": INITIAL_DATA,
  "inspection_focus": {
    nodes: [
      { id: 'if1', label: '定期检验计划', type: NodeType.DOCUMENT },
      { id: 'if2', label: '全面检验数据', type: NodeType.DOCUMENT },
      { id: 'if3', label: '宏观检查', type: NodeType.RISK },
      { id: 'if4', label: '测厚记录', type: NodeType.DOCUMENT },
      { id: 'if5', label: '焊接缺陷', type: NodeType.RISK },
      { id: 'if6', label: '管道本体', type: NodeType.PIPE },
    ],
    links: [
      { source: 'if1', target: 'if2', label: '生成' },
      { source: 'if2', target: 'if3', label: '包含' },
      { source: 'if2', target: 'if4', label: '包含' },
      { source: 'if3', target: 'if5', label: '发现' },
      { source: 'if6', target: 'if2', label: '被检验对象' },
    ]
  },
  "empty": {
    nodes: [],
    links: []
  }
};
