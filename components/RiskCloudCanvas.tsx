
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface CloudParams {
  id: string;
  name: string;
  Ex: number; // Expectation (期望)
  En: number; // Entropy (熵)
  He: number; // Hyper-entropy (超熵)
  color: string;
  drops?: number; // Number of drops to generate
  visible?: boolean; // Whether to render this cloud
}

interface RiskCloudCanvasProps {
  clouds: CloudParams[];
  width?: number;
  height?: number;
}

// Box-Muller transform for normal distribution
const randn_bm = (mean: number, stdDev: number): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
};

// Forward Cloud Generator Algorithm
const generateCloudDrops = (ex: number, en: number, he: number, count: number) => {
  const drops: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    // 1. Generate En' based on Normal(En, He^2)
    const en_prime = randn_bm(en, he);
    
    // 2. Generate x based on Normal(Ex, en_prime^2)
    const x = randn_bm(ex, Math.abs(en_prime)); // abs to avoid negative stdDev issues
    
    // 3. Calculate certainty degree y
    // y = exp( - (x - Ex)^2 / (2 * en_prime^2) )
    const numerator = -Math.pow(x - ex, 2);
    const denominator = 2 * Math.pow(en_prime, 2);
    let y = Math.exp(numerator / denominator);
    
    // Clamp y to [0,1] just in case
    y = Math.max(0, Math.min(1, y));

    drops.push({ x, y });
  }
  return drops;
};

const RiskCloudCanvas: React.FC<RiskCloudCanvasProps> = ({ clouds, width = 800, height = 600 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!svgRef.current || !canvasRef.current) return;

    // Margins
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    // const innerWidth = width - margin.left - margin.right; // Unused
    // const innerHeight = height - margin.top - margin.bottom; // Unused

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear SVG

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Handle High DPI displays for Canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    
    // Enable transparency for density effect
    ctx.globalAlpha = 0.6;

    // X Axis Scale (Score usually 0-100)
    const xMin = 0;
    const xMax = 100;
    
    const xScale = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([margin.left, width - margin.right]);

    // Y Axis Scale (Membership 0-1)
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);

    // Draw Axes (SVG)
    const g = svg.append("g");

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .attr("color", "#9ca3af") // Tailwind gray-400
      .call(g => g.select(".domain").attr("stroke", "#4b5563"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#4b5563"))
      .call(g => g.selectAll("text").attr("fill", "#9ca3af").attr("font-size", "12px"));

    // X Axis Label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("fill", "#e5e7eb")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("评价分值 / 风险值 (Ex)");

    // Y Axis
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .attr("color", "#9ca3af")
      .call(g => g.select(".domain").attr("stroke", "#4b5563"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#4b5563"))
      .call(g => g.selectAll("text").attr("fill", "#9ca3af").attr("font-size", "12px"));

    // Y Axis Label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("fill", "#e5e7eb")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("隶属度 (Membership)");

    // Draw Grids
    g.append("g")
      .attr("class", "grid")
      .attr("stroke", "#374151") // gray-700
      .attr("stroke-opacity", 0.3)
      .attr("stroke-dasharray", "4,4")
      .selectAll("line")
      .data(xScale.ticks(10))
      .enter().append("line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom);

    // Render Clouds on Canvas
    clouds.forEach(cloud => {
      // Check visibility (default to true if undefined)
      if (cloud.visible === false) return;

      const dropCount = cloud.drops || 2000;
      const drops = generateCloudDrops(cloud.Ex, cloud.En, cloud.He, dropCount);
      
      ctx.fillStyle = cloud.color;
      // Use simpler drawing for performance
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const cx = xScale(d.x);
        const cy = yScale(d.y);

        // Skip drawing if out of bounds
        if (cx < margin.left || cx > width - margin.right) continue;

        ctx.beginPath();
        // Small radius for "mist" effect
        ctx.arc(cx, cy, 1.5, 0, 2 * Math.PI); 
        ctx.fill();
      }
    });

  }, [clouds, width, height]);

  // Filter only visible clouds for the legend
  const visibleClouds = clouds.filter(c => c.visible !== false);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* Canvas Layer for Dots */}
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0"
      />
      {/* SVG Layer for Axes/Labels */}
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
      />
      
      <div className="absolute top-4 right-4 bg-black/70 p-3 rounded border border-slate-700 backdrop-blur-sm z-20 max-w-xs pointer-events-none">
         <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase">云模型图例</h4>
         <div className="space-y-2">
            {visibleClouds.map(c => (
              <div key={c.id} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></div>
                <div className="flex-1 text-slate-300 truncate">{c.name}</div>
                <div className="text-slate-500 font-mono text-[10px] whitespace-nowrap">
                   Ex:{c.Ex} En:{c.En}
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default RiskCloudCanvas;
