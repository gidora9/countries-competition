import React, { useMemo, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3-force';
import { motion, AnimatePresence } from 'motion/react';
import { CountryCPI } from '../data/cpi2024';
import { getFlagUrl, lerpColor } from '../lib/utils';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface SimulationNode extends d3.SimulationNodeDatum, CountryCPI {
  x: number;
  y: number;
}

interface GovernanceMapProps {
  data: CountryCPI[];
  searchQuery: string;
}

export const REGIONS = ['All', 'Europe', 'Americas', 'Asia Pacific', 'Middle East', 'Africa'];
export const REGIMES = ['All', 'Full Democracy', 'Flawed Democracy', 'Hybrid Regime', 'Authoritarian'];

interface GovernanceMapProps {
  data: CountryCPI[];
  searchQuery: string;
  activeRegion: string;
  activeRegime: string;
  hoveredRegion: string | null;
  hoveredRegime: string | null;
  groupBy: 'None' | 'Region' | 'Regime';
  yAxis: 'CPI' | 'GDP' | 'Happiness' | 'MeaningfulLife';
  selectedNodeIds?: string[];
  onNodeClick?: (id: string) => void;
  currentYear?: number;
}

const yDomains = {
  CPI: { max: 100, ticks: [100, 80, 60, 40, 20, 0], format: (v: number) => v === 100 ? "100" : v === 0 ? "00" : v },
  GDP: { max: 120000, ticks: [120000, 96000, 72000, 48000, 24000, 0], format: (v: number) => v === 0 ? "$0" : `$${Math.round(v/1000)}k` },
  Happiness: { max: 10, ticks: [10, 8, 6, 4, 2, 0], format: (v: number) => v.toString() },
  MeaningfulLife: { max: 100, ticks: [100, 80, 60, 40, 20, 0], format: (v: number) => `${v}%` }
};

export default function GovernanceMap({ 
  data, 
  searchQuery,
  activeRegion,
  activeRegime,
  hoveredRegion,
  hoveredRegime,
  groupBy,
  yAxis,
  selectedNodeIds = [],
  onNodeClick = () => {},
  currentYear = 2024
}: GovernanceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredNode, setHoveredNode] = useState<SimulationNode | null>(null);

  // Responsive: track if mobile
  const isMobile = dimensions.width < 768 && dimensions.width > 0;

  // Resize observer (Debounced to prevent dense D3 reflows)
  useEffect(() => {
    if (!containerRef.current) return;
    let timeoutId: NodeJS.Timeout;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({ width, height });
      }, 50); // 50ms layout debounce
    });
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  // Track cursor for tooltip (DOM DIRECT NO RERENDER OVERHEAD)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (tooltipRef.current && containerRef.current && dimensions.width > 0) {
        const rect = containerRef.current.getBoundingClientRect();
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;
        
        let targetX = rawX + 20;
        let targetY = rawY + 20;

        if (rawX + 20 + 288 > dimensions.width) targetX = rawX - 300;
        if (rawY + 20 + 150 > dimensions.height) targetY = rawY - 180;

        tooltipRef.current.style.left = `${targetX}px`;
        tooltipRef.current.style.top = `${targetY}px`;
      }
    };
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, dimensions.width, dimensions.height]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredData = useMemo(() => {
    return data.filter(d => 
      (activeRegion === 'All' || d.region === activeRegion) &&
      (activeRegime === 'All' || d.regimeType === activeRegime)
    );
  }, [data, activeRegion, activeRegime]);

  const prevNodesRef = useRef<Map<string, {x: number, y: number}>>(new Map());

  const nodes = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || isMobile) return [];

    const paddingY = 40; // match render padding safely wrapping 40px diameter nodes
    const usableHeight = dimensions.height - paddingY * 2;
    // Base radius increased for larger nodes (40px diameter)
    const radius = 20; 

    // Value fetcher for Y-Axis
    const getYValue = (d: CountryCPI) => {
      if (yAxis === 'CPI') return d.score;
      if (yAxis === 'GDP') return d.gdpPpp;
      if (yAxis === 'Happiness') return d.happiness;
      return d.meaningfulLife;
    };
    
    const domain = yDomains[yAxis];
    
    // Grouping logic for X axis
    const getTargetX = (d: CountryCPI) => {
      if (groupBy === 'Region') {
        const regions = REGIONS.filter(r => r !== 'All'); // 5 regions
        const index = regions.indexOf(d.region);
        if (index === -1) return dimensions.width / 2;
        const columnWidth = dimensions.width / regions.length;
        return (index * columnWidth) + (columnWidth / 2);
      }
      if (groupBy === 'Regime') {
        const regimes = REGIMES.filter(r => r !== 'All'); // 4 regimes
        const index = regimes.indexOf(d.regimeType);
        if (index === -1) return dimensions.width / 2;
        const columnWidth = dimensions.width / regimes.length;
        return (index * columnWidth) + (columnWidth / 2);
      }
      return dimensions.width / 2;
    };
    
    const simulationNodes: SimulationNode[] = filteredData.map((d) => {
      const val = Math.min(getYValue(d), domain.max);
      const targetY = paddingY + usableHeight * (1 - val / domain.max);
      
      // Inherit previous position to avoid hard respawn popping between years
      const prev = prevNodesRef.current.get(d.id);
      
      return {
        ...d,
        x: prev ? prev.x : dimensions.width / 2, 
        y: prev ? prev.y : targetY,
        vy: 0,
        vx: 0,
      };
    });

    const simulation = d3
      .forceSimulation<SimulationNode>(simulationNodes)
      .force(
        'y',
        d3.forceY<SimulationNode>((d) => {
           const val = Math.min(getYValue(d), domain.max);
           return paddingY + usableHeight * (1 - val / domain.max);
        }).strength(1)
      )
      .force(
        'x', 
        d3.forceX<SimulationNode>(getTargetX).strength(groupBy === 'None' ? 0.04 : 0.2) // Stronger X force when grouped
      )
      .force('collide', d3.forceCollide<SimulationNode>(radius + 2).iterations(4))
      .stop();

    // Warm up the simulation
    for (let i = 0; i < 150; ++i) {
      simulation.tick();
    }

    // Save final positions for the next render timeline increment
    const newPrevNodes = new Map();
    simulationNodes.forEach(n => newPrevNodes.set(n.id, { x: n.x, y: n.y }));
    prevNodesRef.current = newPrevNodes;

    return simulationNodes;
  }, [filteredData, dimensions.width, dimensions.height, isMobile, groupBy, yAxis]);

  const domain = yDomains[yAxis];
  const paddingY = 40; // Expand vertical stretch matching D3 math (safe for 40px diameter nodes)
  const usableHeight = dimensions.height - paddingY * 2;

  // Render group labels at the top of the map when grouped
  const renderGroupLabels = () => {
    if (groupBy === 'None' || dimensions.width === 0) return null;
    
    let items: string[] = [];
    if (groupBy === 'Region') items = REGIONS.filter(r => r !== 'All');
    if (groupBy === 'Regime') items = REGIMES.filter(r => r !== 'All');
    
    return (
      <div className="absolute top-6 left-0 w-full flex justify-around pointer-events-none z-10 pl-16 sm:pl-20 pr-4">
        {items.map(item => (
          <div key={item} className="flex-1 flex justify-center">
             <span className="text-[9px] xl:text-[10px] font-bold tracking-[0.2em] uppercase text-text-secondary bg-surface-glass px-4 py-1.5 rounded-full backdrop-blur-md border border-border-subtle whitespace-nowrap overflow-hidden text-ellipsis max-w-[90%] text-center shadow-lg">
               {item}
             </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col" ref={containerRef}>
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(var(--float-offset, -3px)); }
        }
      `}</style>

      {isMobile ? (
        <>
          {/* Mobile labels can be ignored or adapted, we leave data list */}
          <div className="flex-1 w-full overflow-y-auto px-6 py-6 pb-20 custom-scrollbar mt-2 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.04] pointer-events-none overflow-hidden select-none">
              <span className="text-[40vw] font-black tracking-tighter text-text-primary">{currentYear}</span>
            </div>
            
            <div className="flex flex-col gap-3 relative z-10">
            {filteredData
              .filter(d => !normalizedSearch || d.name.toLowerCase().includes(normalizedSearch))
              .sort((a,b) => b.score - a.score)
              .map(country => (
                <div key={country.id} className="flex flex-col p-3 rounded-xl bg-surface-panel border border-border-soft backdrop-blur-md shadow-lg mb-3">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <img src={getFlagUrl(country.id)} alt={country.name} className="w-8 h-8 rounded-full border border-border-subtle object-cover" />
                       <div className="flex flex-col">
                         <span className="text-text-primary font-medium text-sm">{country.name}</span>
                         <span className="text-text-tertiary text-[9px] uppercase tracking-wider">{country.regimeType}</span>
                       </div>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-lg font-bold" style={{ color: lerpColor(country.score) }}>{country.score}</span>
                        <div className="flex items-center gap-1 mt-1">
                          {country.trend === 'Rising' && <TrendingUp className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />}
                          {country.trend === 'Sinking' && <TrendingDown className="w-3 h-3 text-rose-500 dark:text-rose-400" />}
                          {country.trend === 'Stable' && <Minus className="w-3 h-3 text-text-tertiary" />}
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between mx-1 pt-3 mt-3 border-t border-border-subtle">
                    <span className="text-[10px] text-text-tertiary font-mono flex flex-col items-center">
                      <span className="uppercase text-[8px] text-text-secondary opacity-60 mb-1">GDP</span>
                      ${(country.gdpPpp / 1000).toFixed(0)}k
                    </span>
                    <span className="text-[10px] text-text-tertiary font-mono flex flex-col items-center border-l border-border-subtle pl-4">
                      <span className="uppercase text-[8px] text-text-secondary opacity-60 mb-1">Happy</span>
                      {country.happiness.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-text-tertiary font-mono flex flex-col items-center border-l border-border-subtle pl-4">
                      <span className="uppercase text-[8px] text-text-secondary opacity-60 mb-1">Meaning</span>
                      {country.meaningfulLife}%
                    </span>
                  </div>
                </div>
              ))}
            
            {/* Mobile Data Sources */}
            <div className="mt-6 mb-8 p-5 rounded-xl bg-surface-canvas border border-border-soft">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-secondary mb-3">Methodology</h4>
              <p className="text-[8px] text-text-tertiary mb-4 leading-relaxed border-b border-border-subtle pb-3">
                * Data is composite-normalized across peer-reviewed methodologies to minimize distinct bounds bias.
              </p>
              <div className="flex flex-col gap-4 text-[9px] text-text-tertiary font-mono">
                <div>
                  <span className="text-brand-accent opacity-80 uppercase tracking-widest font-bold block mb-1">Corruption & Regime</span>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-relaxed">
                    <a href="https://v-dem.net/" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors duration-200 decoration-border-strong underline-offset-2 hover:underline">V-Dem Institute (v14)</a>
                    <span className="text-border-strong">·</span>
                    <a href="https://info.worldbank.org/governance/wgi/" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors duration-200 decoration-border-strong underline-offset-2 hover:underline">World Bank (WGI)</a>
                    <span className="text-border-strong">·</span>
                    <a href="https://www.transparency.org/en/cpi" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors duration-200 decoration-border-strong underline-offset-2 hover:underline">Transparency Int. (CPI)</a>
                    <span className="text-border-strong">·</span>
                    <a href="https://www.eiu.com/n/campaigns/democracy-index-2023/" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors duration-200 decoration-border-strong underline-offset-2 hover:underline">EIU Index</a>
                  </div>
                </div>
                <div>
                  <span className="text-brand-accent opacity-80 uppercase tracking-widest font-bold block mb-1">Macroeconomics</span>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-relaxed">
                    <a href="https://www.rug.nl/ggdc/productivity/pwt/" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors duration-200 decoration-border-strong underline-offset-2 hover:underline">Penn World Table (10.0)</a>
                    <span className="text-border-strong">·</span>
                    <a href="https://www.imf.org/en/Publications/WEO" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors duration-200 decoration-border-strong underline-offset-2 hover:underline">IMF WEO</a>
                    <span className="text-border-strong">·</span>
                    <a href="https://www.worldbank.org/en/programs/icp" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors duration-200 decoration-border-strong underline-offset-2 hover:underline">World Bank (ICP)</a>
                  </div>
                </div>
                <div>
                  <span className="text-brand-accent opacity-80 uppercase tracking-widest font-bold block mb-1">Wellbeing & Affect</span>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-relaxed">
                    <a href="https://www.worldvaluessurvey.org/" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors duration-200 decoration-border-strong underline-offset-2 hover:underline">World Values Survey (WVS-7)</a>
                    <span className="text-border-strong">·</span>
                    <a href="https://wellbeing.hmc.ox.ac.uk/" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors duration-200 decoration-border-strong underline-offset-2 hover:underline">Oxford Wellbeing</a>
                    <span className="text-border-strong">·</span>
                    <a href="https://news.gallup.com/poll/105226/world-poll-methodology.aspx" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors duration-200 decoration-border-strong underline-offset-2 hover:underline">Gallup Poll</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
      ) : (
        <div className="absolute inset-0 flex">
          
          {/* GIANT YEAR WATERMARK */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden select-none opacity-[0.02] dark:opacity-[0.04]">
            <span className="text-[30vw] font-black tracking-tighter text-text-primary drop-shadow-[0_0_20px_var(--border-strong)] transition-all duration-1000 ease-in-out">
              {currentYear}
            </span>
          </div>

          {renderGroupLabels()}
          {/* Vertical Y-Axis Integrated dynamically to share padding math */}
          <div className="w-16 sm:w-20 shrink-0 h-full border-r border-border-subtle relative z-10 bg-surface-canvas">
             {dimensions.height > 0 && domain.ticks.map((tick, i) => (
               <div 
                 key={tick} 
                 className="absolute w-full flex justify-center -translate-y-1/2 text-[10px] font-mono text-text-tertiary"
                 style={{ top: paddingY + usableHeight * (1 - tick / domain.max) }}
               >
                 <span className={i === Math.floor(domain.ticks.length/2) ? "text-brand-accent font-bold tracking-widest text-xs opacity-80" : ""}>
                   {domain.format(tick)}
                 </span>
               </div>
             ))}
             {dimensions.height > 0 && (
               <>
                 <div className="absolute w-full text-center text-[10px] text-text-tertiary font-mono bottom-4 hidden sm:block uppercase tracking-widest">{yAxis === 'CPI' ? 'Corrupt' : 'Low'}</div>
                 <div className="absolute w-full text-center text-[10px] text-text-tertiary font-mono top-4 hidden sm:block uppercase tracking-widest">{yAxis === 'CPI' ? 'Clean' : 'High'}</div>
               </>
             )}
          </div>

          <div className="flex-1 relative overflow-hidden">
             {/* Background Lines */}
            <div className="absolute inset-0 flex justify-around opacity-10 pointer-events-none border-l border-border-soft pl-4 sm:pl-0">
              <div className="w-px h-full bg-gradient-to-b from-transparent via-text-primary to-transparent"></div>
              <div className="w-px h-full bg-gradient-to-b from-transparent via-text-primary to-transparent"></div>
              <div className="w-px h-full bg-gradient-to-b from-transparent via-text-primary to-transparent"></div>
              <div className="w-px h-full bg-gradient-to-b from-transparent via-text-primary to-transparent"></div>
            </div>

            {/* Threshold Line */}
            {dimensions.height > 0 && (
               <div 
                 className="absolute w-full flex items-center pl-8 opacity-40 z-0 pointer-events-none transition-all duration-1000 ease-in-out"
                 style={{ top: paddingY + usableHeight * 0.5 }}
               >
                 <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-brand-accent to-transparent relative shadow-[0_0_10px_var(--brand-glow)]">
                   <span className="absolute -top-4 right-4 text-[9px] uppercase tracking-[0.2em] text-brand-accent bg-surface-canvas px-3 font-medium border border-brand-soft rounded-full animate-pulse shadow-[0_0_5px_var(--brand-glow)]">
                     Global Median Threshold
                   </span>
                 </div>
               </div>
            )}

          {nodes.map((node) => {
            const isMatched = normalizedSearch && node.name.toLowerCase().includes(normalizedSearch);
            const isUnmatched = normalizedSearch && !isMatched;
            const isHovered = hoveredNode?.id === node.id;
            const isSelected = selectedNodeIds.includes(node.id);
            
            // Highlight checks
            const isRegionHovered = hoveredRegion && hoveredRegion !== 'All' && node.region === hoveredRegion;
            const isRegimeHovered = hoveredRegime && hoveredRegime !== 'All' && node.regimeType === hoveredRegime;
            
            const isUnhoveredRegion = hoveredRegion && hoveredRegion !== 'All' && node.region !== hoveredRegion;
            const isUnhoveredRegime = hoveredRegime && hoveredRegime !== 'All' && node.regimeType !== hoveredRegime;
            
            const isHighlighted = isSelected || isMatched || isHovered || isRegionHovered || isRegimeHovered;
            
            let opacity = 1;
            if (isSelected) opacity = 1;
            else if (isUnmatched) opacity = 0.15;
            else if (hoveredNode && !isHovered && !isMatched) opacity = 0.4;
            else if ((isUnhoveredRegion || isUnhoveredRegime) && !isMatched) opacity = 0.25;

            const yOffset = (node.score % 3) * 2;
            
            let currentScale = 1;
            if (isSelected) currentScale = 1.4;
            else if (isMatched) currentScale = 1.3;
            else if (isHovered) currentScale = 1.5;
            else if (isRegionHovered || isRegimeHovered) currentScale = 1.15;

            let currentShadow = 'none';
            if (isSelected) currentShadow = `0 0 30px ${lerpColor(node.score)}, inset 0 0 15px rgba(255,255,255,0.7)`;
            else if (isMatched) currentShadow = '0 0 20px rgba(0, 242, 255, 0.8)';
            else if (isHovered) currentShadow = `0 0 15px ${lerpColor(node.score)}`;
            else if (isRegionHovered || isRegimeHovered) currentShadow = `0 0 15px ${lerpColor(node.score)}`;
            
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                    opacity, 
                    scale: currentScale,
                    x: node.x - 20, 
                    y: node.y - 20 
                }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                className={`absolute flex items-center justify-center cursor-pointer transition-all duration-500 ${
                  isSelected ? 'z-[60]' : isMatched ? 'z-50' : isHovered ? 'z-40' : (isRegionHovered || isRegimeHovered) ? 'z-30' : 'z-10'
                }`}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onNodeClick(node.id)}
              >
                 <div
                   className="relative"
                   style={{
                     animation: `float-gentle ${4 + (node.score % 3)}s ease-in-out infinite`,
                     '--float-offset': `${-4 + yOffset}px`
                   } as React.CSSProperties}
                 >
                    <div 
                      className={`w-10 h-10 rounded-full overflow-hidden border bg-[#050505] flex items-center justify-center relative transition-colors duration-500
                        ${isSelected ? 'border-white' : isMatched ? 'border-[#00f2ff]' : 'border-white/10'}
                      `}
                      style={{ 
                        borderColor: isSelected ? '#fff' : isMatched ? '#00f2ff' : isHighlighted ? '#fff' : lerpColor(node.score),
                        boxShadow: currentShadow,
                        borderWidth: isHighlighted ? '2px' : '1px',
                        filter: isHighlighted && !isHovered ? 'brightness(1.2)' : 'brightness(1)',
                      }}
                    >
                      <img
                        src={getFlagUrl(node.id)}
                        alt={`${node.name} Flag`}
                        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10 pointer-events-none rounded-full transition-colors">
                         <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)] leading-none tracking-widest">{node.id}</span>
                         {node.trend === 'Rising' && <TrendingUp className="w-3.5 h-3.5 text-[#4ade80] drop-shadow-[0_1px_3px_rgba(0,0,0,1)] mt-[1px] stroke-[3]" />}
                         {node.trend === 'Sinking' && <TrendingDown className="w-3.5 h-3.5 text-[#fb7185] drop-shadow-[0_1px_3px_rgba(0,0,0,1)] mt-[1px] stroke-[3]" />}
                      </div>
                    </div>
                 </div>
              </motion.div>
            );
          })}

          {/* Cursor Tracking Hover Card */}
          <AnimatePresence>
            {hoveredNode && dimensions.width > 0 && (
              <motion.div
                ref={tooltipRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute z-50 pointer-events-none w-72 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-0.5 whitespace-nowrap">{hoveredNode.name}</h3>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest leading-none">{hoveredNode.regimeType}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1 leading-none">Corruption</span>
                    <div 
                      className="text-white px-2 py-1 rounded text-xs font-bold border leading-none"
                      style={{ backgroundColor: `${lerpColor(hoveredNode.score)}33`, borderColor: lerpColor(hoveredNode.score) }}
                    >
                      {hoveredNode.score}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3 mt-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-white/40 uppercase tracking-wider mb-0.5 font-bold">GDP (PPP)</span>
                    <span className="text-xs text-white font-mono">${(hoveredNode.gdpPpp / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex flex-col border-l border-white/10 pl-2">
                    <span className="text-[8px] text-white/40 uppercase tracking-wider mb-0.5 font-bold">Happiness</span>
                    <span className="text-xs text-[#00f2ff] font-mono">{hoveredNode.happiness.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-col border-l border-white/10 pl-2">
                    <span className="text-[8px] text-white/40 uppercase tracking-wider mb-0.5 font-bold">Meaningful</span>
                    <span className="text-xs text-[#4ade80] font-mono">{hoveredNode.meaningfulLife}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-white/10 pt-3 mt-3">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: hoveredNode.trend === 'Rising' ? '#4ade80' : hoveredNode.trend === 'Sinking' ? '#fb7185' : '#a1a1aa' }}
                  ></div>
                  <span 
                    className="text-[10px] uppercase tracking-tighter font-bold"
                    style={{ color: hoveredNode.trend === 'Rising' ? '#4ade80' : hoveredNode.trend === 'Sinking' ? '#fb7185' : '#a1a1aa' }}
                  >
                    {hoveredNode.trend} CPI Trend
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      )}
    </div>
  );
}
