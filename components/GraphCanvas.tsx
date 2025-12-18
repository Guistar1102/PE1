
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphLink, NodeType } from '../types';
import { NODE_COLORS } from '../constants';

interface GraphCanvasProps {
  data: GraphData;
  onNodeClick: (node: GraphNode) => void;
  width?: number;
  height?: number;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({ data, onNodeClick, width = 800, height = 600 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  // 使用 ref 存储上一次的节点坐标，实现平滑过渡
  const nodePositionsRef = useRef<Map<string, { x: number, y: number }>>(new Map());

  const getNodeColor = (type: string) => {
    return NODE_COLORS[type as NodeType] || NODE_COLORS.UNKNOWN;
  };

  useEffect(() => {
    if (!svgRef.current || !width || !height) return;

    // 1. 数据预处理：如果节点已存在，则继承之前的坐标，防止“脱节”和“炸开”
    const nodes = data.nodes.map(d => {
      const prevPos = nodePositionsRef.current.get(d.id);
      return {
        ...d,
        x: prevPos?.x ?? d.x,
        y: prevPos?.y ?? d.y
      } as GraphNode;
    });

    // 复制连线数据，防止 D3 修改原始 state 对象
    const links = data.links.map(d => ({ ...d } as GraphLink));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // 2. 初始化力导向物理引擎
    const simulation = d3.forceSimulation<GraphNode, GraphLink>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(45));

    // 3. 关键修复：强制执行一次同步计算，确保在第一帧渲染前 source/target 已解析为对象
    for (let i = 0; i < 30; ++i) simulation.tick();

    // 绘制连线
    const link = g.append("g")
      .attr("stroke", "#4b5563")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    // 关系文字
    const linkLabel = g.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .text(d => d.label)
      .attr("font-size", "10px")
      .attr("fill", "#9ca3af")
      .attr("text-anchor", "middle")
      .attr("dy", -5);

    // 绘制节点
    const node = g.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll<SVGCircleElement, GraphNode>("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 20)
      .attr("fill", d => d.color || getNodeColor(d.type))
      .attr("cursor", "pointer")
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    node.on('click', (event, d) => {
      event.stopPropagation();
      onNodeClick(d);
    });

    // 节点文字
    const label = g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("dy", 32)
      .text(d => d.label)
      .attr("font-size", "12px")
      .attr("fill", "#e5e7eb")
      .attr("text-anchor", "middle")
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.8)");

    // 更新位置的 Tick 函数
    simulation.on("tick", () => {
      // 记录当前坐标以便下次继承
      nodes.forEach(n => {
        if (n.x && n.y) nodePositionsRef.current.set(n.id, { x: n.x, y: n.y });
      });

      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      linkLabel
        .attr("x", d => ((d.source as any).x + (d.target as any).x) / 2)
        .attr("y", d => ((d.source as any).y + (d.target as any).y) / 2);

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);
      
      label
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [data, width, height, onNodeClick]);

  return (
    <div className="w-full h-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-2xl relative">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        className="w-full h-full"
      />
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-black/50 p-2 rounded pointer-events-none">
        按住左键拖动节点 • 滚轮缩放 • 点击节点查看详情
      </div>
    </div>
  );
};

export default GraphCanvas;
