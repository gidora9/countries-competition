import React, { useMemo, useState, useEffect, useRef, memo, useCallback } from 'react';
import * as d3 from 'd3-force';
import { motion, AnimatePresence } from 'motion/react';
import { CountryCPI } from '../data/cpi2024';
import { getFlagUrl, lerpColor } from '../lib/utils';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface SimulationNode extends d3.SimulationNodeDatum, CountryCPI {
  x: number;
  y: number;
}

interface MapNodeProps {
  node: SimulationNode;
  radius: number;
  isMatched: boolean | '' | 0 | undefined;
  isUnmatched: boolean | '' | 0 | undefined;
  isHovered: boolean;
  isSelected: boolean;
  isRegionHovered: boolean | '' | 0 | undefined;
  isRegimeHovered: boolean | '' | 0 | undefined;
  isUnhoveredRegion: boolean | '' | 0 | undefined;
  isUnhoveredRegime: boolean | '' | 0 | undefined;
  hasSelection: boolean;
  isPlaying: boolean;
  onMouseEnter: (node: SimulationNode) => void;
  onMouseLeave: () => void;
  onClick: (id: string) => void;
}

const MapNode = memo(({
  node, radius, isMatched, isUnmatched, isHovered, isSelected, 
  isRegionHovered, isRegimeHovered, isUnhoveredRegion, isUnhoveredRegime, 
  hasSelection, isPlaying, onMouseEnter, onMouseLeave, onClick
}: MapNodeProps) => {
  const isHighlighted = isSelected || isMatched || isHovered || isRegionHovered || isRegimeHovered;
  
  let opacity = 1;
  let grayscale = false;
  
  if (isSelected) opacity = 1;
  else if (isUnmatched) { opacity = 0.1; grayscale = true; }
  else if (hasSelection && !isSelected) { opacity = 0.45; grayscale = true; }
  else if (!isHovered && !isMatched && (isUnhoveredRegion || isUnhoveredRegime)) opacity = 0.15;
  else if (!isHovered && !isMatched && (opacity === 1)) opacity = 0.8; // Default fade for non-highlighted

  const yOffset = (node.score % 3) * 2;
  
  let currentScale = 1;
  if (isSelected) currentScale = 1.4;
  else if (isMatched) currentScale = 1.3;
  else if (isHovered) currentScale = 1.5;
  else if (isRegionHovered || isRegimeHovered) currentScale = 1.15;
  else if (hasSelection && !isSelected) currentScale = 0.6; // slightly less than selected, but make them visible (0.6 instead of 0.7)

  const colorVal = node.prosperityScore || node.score;

  const [pulseDir, setPulseDir] = useState<'Up'|'Down'|null>(null);
  const prevValRef = useRef(colorVal);

  useEffect(() => {
     if (colorVal === prevValRef.current) return;
     const diff = colorVal - prevValRef.current;
     if (Math.abs(diff) >= 2.0 && isPlaying) {
        setPulseDir(diff > 0 ? 'Up' : 'Down');
        const t = setTimeout(() => setPulseDir(null), 1000);
        prevValRef.current = colorVal;
        return () => clearTimeout(t);
     } else {
        prevValRef.current = colorVal;
        setPulseDir(null);
     }
  }, [colorVal, isPlaying]);

  let currentShadow = 'none';
  if (isSelected) currentShadow = `0 0 30px ${lerpColor(colorVal)}, inset 0 0 15px rgba(255,255,255,0.7)`;
  else if (isMatched) currentShadow = '0 0 20px rgba(0, 242, 255, 0.8)';
  else if (isHovered) currentShadow = `0 0 15px ${lerpColor(colorVal)}`;
  else if (isRegionHovered || isRegimeHovered) currentShadow = `0 0 15px ${lerpColor(colorVal)}`;
  
  // Natural, fluid transitions
  const trans = {
    duration: isPlaying ? 0.8 : 0.6,
    type: "spring" as const,
    bounce: isPlaying ? 0.3 : 0.2
  };

  return (
    <motion.div
      initial={false}
      animate={{ 
          opacity, 
          scale: currentScale,
          x: node.x - radius, 
          y: node.y - radius 
      }}
      transition={trans}
      className={`absolute flex items-center justify-center cursor-pointer z-10 ${
        isSelected ? '!z-[60]' : isMatched ? '!z-50' : isHovered ? '!z-40' : (isRegionHovered || isRegimeHovered) ? '!z-30' : ''
      } ${grayscale ? 'grayscale brightness-75' : ''}`}
      onMouseEnter={() => onMouseEnter(node)}
      onMouseLeave={onMouseLeave}
      onClick={() => onClick(node.id)}
    >
       <div className="relative">
          <div 
            className={`rounded-full overflow-hidden border bg-[#050505] flex items-center justify-center relative transition-colors duration-500
              ${isSelected ? 'border-white' : isMatched ? 'border-[#00f2ff]' : 'border-white/10'}
            `}
            style={{ 
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
              borderColor: isSelected ? '#fff' : isMatched ? '#00f2ff' : isHighlighted ? '#fff' : lerpColor(colorVal),
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
            <div className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10 pointer-events-none rounded-full transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
               <span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)] leading-none tracking-widest">{node.id}</span>
            </div>
            {/* Standalone Pulse Indicator - Just the arrow! */}
            <div className={`absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-300 ${pulseDir && !isHovered ? 'opacity-100' : 'opacity-0'}`}>
               {pulseDir === 'Up' && <TrendingUp className="w-5 h-5 text-[#4ade80] drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] stroke-[4]" />}
               {pulseDir === 'Down' && <TrendingDown className="w-5 h-5 text-[#fb7185] drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] stroke-[4]" />}
            </div>
          </div>
       </div>
    </motion.div>
  );
});

MapNode.displayName = 'MapNode';

interface GovernanceMapProps {
  data: CountryCPI[];
  searchQuery: string;
}

export const REGIONS = ['All', 'Europe', 'Americas', 'Asia Pacific', 'Middle East', 'Africa'];
export const REGIMES = ['All', 'Full Democracy', 'Flawed Democracy', 'Hybrid Regime', 'Authoritarian'];

import { YAxisMetric } from '../App';

interface GovernanceMapProps {
  data: CountryCPI[];
  searchQuery: string;
  activeRegion: string;
  activeRegime: string;
  hoveredRegion: string | null;
  hoveredRegime: string | null;
  groupBy: 'None' | 'Region' | 'Regime';
  yAxis: YAxisMetric;
  selectedNodeIds?: string[];
  onNodeClick?: (id: string) => void;
  currentYear?: number;
  isPlaying?: boolean;
  forceMobileView?: boolean;
}

const yDomains: Record<YAxisMetric, { min: number, max: number, ticks: number[], format: (v: number) => string }> = {
  ProsperityScore: { min: 20, max: 90, ticks: [90, 76, 62, 48, 34, 20], format: (v: number) => v.toFixed(0) },
  CPI: { min: 0, max: 100, ticks: [100, 80, 60, 40, 20, 0], format: (v: number) => v === 100 ? "100" : v === 0 ? "00" : v.toString() },
  GDP: { min: 0, max: 120000, ticks: [120000, 96000, 72000, 48000, 24000, 0], format: (v: number) => v === 0 ? "$0" : `$${Math.round(v/1000)}k` },
  Happiness: { min: 0, max: 10, ticks: [10, 8, 6, 4, 2, 0], format: (v: number) => v.toString() },
  MeaningfulLife: { min: 0, max: 100, ticks: [100, 80, 60, 40, 20, 0], format: (v: number) => `${v}%` },
  Inflation: { min: 0, max: 50, ticks: [50, 40, 30, 20, 10, 0], format: (v: number) => `${Math.round(v)}%` },
  Unemployment: { min: 0, max: 30, ticks: [30, 24, 18, 12, 6, 0], format: (v: number) => `${Math.round(v)}%` },
  Education: { min: 0, max: 100, ticks: [100, 80, 60, 40, 20, 0], format: (v: number) => Math.round(v).toString() },
  LifeExpectancy: { min: 20, max: 90, ticks: [90, 76, 62, 48, 34, 20], format: (v: number) => Math.round(v).toString() },
  PressFreedom: { min: 0, max: 100, ticks: [100, 80, 60, 40, 20, 0], format: (v: number) => Math.round(v).toString() },
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
  currentYear = 2024,
  isPlaying = false,
  forceMobileView = false
}: GovernanceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredNode, setHoveredNode] = useState<SimulationNode | null>(null);

  // Value fetcher for Y-Axis
  const getYValue = (d: CountryCPI) => {
    switch (yAxis) {
      case 'ProsperityScore': return d.prosperityScore || 0;
      case 'CPI': return d.score;
      case 'GDP': return d.gdpPpp;
      case 'Happiness': return d.happiness;
      case 'MeaningfulLife': return d.meaningfulLife;
      case 'Inflation': return d.inflation || 0;
      case 'Unemployment': return d.unemployment || 0;
      case 'Education': return d.education || 0;
      case 'LifeExpectancy': return d.lifeExpectancy || 0;
      case 'PressFreedom': return d.pressFreedom || 0;
      default: return d.score;
    }
  };

  const thresholds = useMemo(() => {
    if (data.length === 0) return { top5: 0, median: 0, bottom5: 0 };
    const sorted = [...data].map(d => getYValue(d)).sort((a,b) => a - b);
    return {
      top5: sorted[Math.floor(sorted.length * 0.95)],
      median: sorted[Math.floor(sorted.length / 2)],
      bottom5: sorted[Math.floor(sorted.length * 0.05)],
    };
  }, [data, yAxis]);

  // Responsive: track if mobile
  // We use window.innerWidth instead of container dimensions since the map container is smaller than viewport due to the sidebar
  const [isMobileWindow, setIsMobileWindow] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobileWindow(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = forceMobileView || isMobileWindow;

  const handleNodeMouseEnter = useCallback((node: SimulationNode) => {
    setHoveredNode(node);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  const handleNodeClickBounded = useCallback((id: string) => {
    onNodeClick(id);
  }, [onNodeClick]);
  useEffect(() => {
    if (!containerRef.current) return;
    let frameId: number;
    let timeoutId: NodeJS.Timeout;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      
      // Fast path for initial layout
      if (dimensions.width === 0) {
        setDimensions({ width, height });
        return;
      }

      timeoutId = setTimeout(() => {
        frameId = requestAnimationFrame(() => {
          setDimensions({ width, height });
        });
      }, 100); // 100ms layout debounce for less reflow during resize
    });
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [dimensions.width]); // Need initial dependency for fast path check

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
  const trailsRef = useRef<Record<string, {x: number, y: number, year: number}[]>>({});

  const getDynamicRadius = () => {
    if (dimensions.width === 0 || dimensions.height === 0 || filteredData.length === 0) return 20;
    const area = dimensions.width * dimensions.height;
    // Calculate size that fits nicely into the viewport area
    let idealRadius = Math.sqrt(area / (filteredData.length * 4.5)) / 2;
    if (groupBy !== 'None') {
       idealRadius *= 0.65;
    }
    return Math.max(12, Math.min(36, idealRadius));
  };
  const dynamicRadius = getDynamicRadius();

  const domain = yDomains[yAxis];
  const paddingY = 40;
  const usableHeight = dimensions.height - paddingY * 2;
  const invertedAxis = ['Inflation', 'Unemployment'].includes(yAxis);

  const getRatio = useCallback((val: number) => {
    let ratio = (val - domain.min) / (domain.max - domain.min);
    // clamp ratio to 0-1
    ratio = Math.max(0, Math.min(1, ratio));
    if (invertedAxis) ratio = 1 - ratio;
    return ratio;
  }, [domain.max, domain.min, invertedAxis]);

  const nodes = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || isMobile) return [];

    const radius = dynamicRadius; 
 

    // Grouping logic for X axis
    const plotWidth = dimensions.width - 80; // 80px reserved for the left Y-axis
    
    const getTargetX = (d: CountryCPI) => {
      if (groupBy === 'Region') {
        const regions = REGIONS.filter(r => r !== 'All'); // 5 regions
        const index = regions.indexOf(d.region);
        if (index === -1) return plotWidth / 2;
        const columnWidth = plotWidth / regions.length;
        return (index * columnWidth) + (columnWidth / 2);
      }
      if (groupBy === 'Regime') {
        const regimes = REGIMES.filter(r => r !== 'All'); // 4 regimes
        const index = regimes.indexOf(d.regimeType);
        if (index === -1) return plotWidth / 2;
        const columnWidth = plotWidth / regimes.length;
        return (index * columnWidth) + (columnWidth / 2);
      }
      return plotWidth / 2;
    };
    
    const getYPos = (d: CountryCPI) => {
       const val = Math.min(getYValue(d), domain.max);
       const ratio = getRatio(val);
       return paddingY + usableHeight * (1 - ratio);
    };

    const simulationNodes: SimulationNode[] = filteredData.map((d) => {
      const targetY = getYPos(d);
      
      // Inherit previous position to avoid hard respawn popping between years
      const prev = prevNodesRef.current.get(d.id);
      
      return {
        ...d,
        x: prev ? prev.x : plotWidth / 2, 
        y: prev ? prev.y : targetY,
        vy: 0,
        vx: 0,
      };
    });

    const simulation = d3
      .forceSimulation<SimulationNode>(simulationNodes)
      .force(
        'y',
        d3.forceY<SimulationNode>((d) => getYPos(d)).strength(1)
      )
      .force(
        'x', 
        d3.forceX<SimulationNode>(getTargetX).strength(groupBy === 'None' ? 0.015 : 0.2) // Much weaker X force so they fill the screen
      )
      .force('charge', d3.forceManyBody().strength(groupBy === 'None' ? -15 : -30))
      .force('collide', d3.forceCollide<SimulationNode>(radius + 3).iterations(4))
      .stop();

    // Warm up the simulation
    for (let i = 0; i < 150; ++i) {
      simulation.tick();
    }
    
    // Constrain nodes strictly into bounds after simulation
    simulationNodes.forEach(n => {
      n.x = Math.max(radius + 5, Math.min(plotWidth - radius - 5, n.x));
      n.y = Math.max(radius, Math.min(usableHeight - radius, n.y));
    });

    // Save final positions for the next render timeline increment
    const newPrevNodes = new Map();
    simulationNodes.forEach(n => newPrevNodes.set(n.id, { x: n.x, y: n.y }));
    prevNodesRef.current = newPrevNodes;

    // UPDATE TRAILS
    if (currentYear && selectedNodeIds) {
      selectedNodeIds.forEach(id => {
         const node = simulationNodes.find(n => n.id === id);
         if (!node) return;
         if (!trailsRef.current[id]) trailsRef.current[id] = [];
         
         const trail = trailsRef.current[id];
         const last = trail[trail.length - 1];
         if (!last || last.year !== currentYear) {
            trail.push({x: node.x, y: node.y, year: currentYear});
         } else {
            last.x = node.x;
            last.y = node.y;
         }
      });
      // cleanup unselected
      Object.keys(trailsRef.current).forEach(id => {
         if (!selectedNodeIds.includes(id)) delete trailsRef.current[id];
      });
    }

    return simulationNodes;
  }, [filteredData, dimensions.width, dimensions.height, isMobile, groupBy, yAxis, currentYear, selectedNodeIds, dynamicRadius, getRatio, usableHeight]);

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
          <div className="flex-1 w-full overflow-y-auto px-4 py-6 pb-24 custom-scrollbar mt-2 relative">
            <div 
              className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none overflow-hidden select-none fixed"
            >
              <span className="text-[40vw] font-black tracking-tighter text-text-primary">{currentYear}</span>
            </div>
            
            <div className="flex flex-col gap-1 relative z-10 w-full mt-2">
              <AnimatePresence>
                {filteredData
                  .filter(d => !normalizedSearch || d.name.toLowerCase().includes(normalizedSearch))
                  .sort((a,b) => (getYValue(b) || 0) - (getYValue(a) || 0))
                  .slice(0, 50)
                  .map((country, index) => {
                    const value = getYValue(country);
                    const MaxVal = yDomains[yAxis].max;
                    const percent = Math.min(100, Math.max(0, (value / MaxVal) * 100));
                    
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        key={country.id} 
                        className="relative flex items-center p-1 rounded-full bg-white/[0.03] dark:bg-white/[0.02] border border-white/5 backdrop-blur-md overflow-hidden"
                      >
                        <div 
                          className="absolute top-0 left-0 h-full bg-brand-soft/20 pointer-events-none transition-all duration-1000 ease-linear origin-left"
                          style={{ width: `${percent}%` }}
                        >
                           <div className="absolute top-0 right-0 w-[2px] h-full bg-brand-accent/50 shadow-[0_0_8px_var(--brand-glow)]" />
                        </div>
                        
                        <div className="flex items-center justify-between relative z-10 w-full pl-2 pr-3">
                           <div className="flex items-center gap-2">
                             <span className="text-[8px] font-mono text-text-tertiary w-3 text-right shrink-0 opacity-50">{index + 1}.</span>
                             <img src={getFlagUrl(country.id)} alt={country.name} className="w-4 h-4 rounded-full border border-border-subtle object-cover shrink-0 opacity-90" />
                             <span className="text-text-primary font-medium text-[9px] tracking-wide truncate max-w-[140px] drop-shadow-md">{country.name}</span>
                           </div>
                           <div className="flex items-center shrink-0">
                              <span className="text-[10px] font-bold font-mono tracking-tighter drop-shadow-md" style={{ color: lerpColor(country.prosperityScore || country.score) }}>
                                 {yDomains[yAxis].format(value)}
                              </span>
                           </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
            
            {/* End Mobile Race */}
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex">
          
          {/* GIANT YEAR WATERMARK (Partially Masked) */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden select-none opacity-[0.05] dark:opacity-[0.08]"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)'
            }}
          >
            <span className="text-[30vw] font-black tracking-tighter text-text-primary drop-shadow-[0_0_20px_var(--border-strong)] transition-all duration-1000 ease-in-out">
              {currentYear}
            </span>
          </div>

          {renderGroupLabels()}
          {/* Vertical Y-Axis Integrated dynamically to share padding math */}
          <div className="w-16 sm:w-20 shrink-0 h-full border-r border-border-subtle relative z-10 bg-surface-canvas flex flex-col justify-center">
             {dimensions.height > 0 && domain.ticks.map((tick, i) => (
               <div 
                 key={tick} 
                 className="absolute w-full flex justify-center -translate-y-1/2 text-[10px] font-mono text-text-tertiary"
                 style={{ top: paddingY + usableHeight * (1 - getRatio(tick)) }}
               >
                 <span className={i === Math.floor(domain.ticks.length/2) ? "text-brand-accent font-bold tracking-widest text-xs opacity-80" : ""}>
                   {domain.format(tick)}
                 </span>
               </div>
             ))}
             {dimensions.height > 0 && (
               <>
                 <div className="absolute w-full text-center text-[10px] text-text-tertiary font-mono bottom-4 hidden sm:block uppercase tracking-widest opacity-60">{yAxis === 'CPI' ? 'Corrupt' : invertedAxis ? 'Bad' : 'Low'}</div>
                 <div className="absolute w-full text-center text-[10px] text-text-tertiary font-mono top-4 hidden sm:block uppercase tracking-widest opacity-60">{yAxis === 'CPI' ? 'Clean' : invertedAxis ? 'Good' : 'High'}</div>
               </>
             )}
          </div>

          <div className="flex-1 relative overflow-hidden">
             {/* Background Lines and Ambient Glow */}
            <div className="absolute inset-0 flex justify-around opacity-15 pointer-events-none border-l border-border-soft pl-4 sm:pl-0">
              <div className="w-px h-full bg-gradient-to-b from-transparent via-text-tertiary to-transparent relative"></div>
              <div className="w-px h-full bg-gradient-to-b from-transparent via-text-tertiary to-transparent relative"></div>
              <div className="w-px h-full bg-gradient-to-b from-transparent via-text-tertiary to-transparent relative"></div>
              <div className="w-px h-full bg-gradient-to-b from-transparent via-text-tertiary to-transparent relative"></div>
            </div>
            
            {/* Ambient Radial Mesh Gradient Behind Map */}
            <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10" style={{
              background: 'radial-gradient(circle at 50% 50%, var(--color-brand-accent) 0%, transparent 60%)',
              mixBlendMode: 'screen',
              filter: 'blur(100px)'
            }} />

            {/* Threshold Lines */}
            {dimensions.height > 0 && (
               <>
                 <div className="absolute w-[80%] left-[10%] flex items-center opacity-40 z-0 pointer-events-none transition-all duration-1000 ease-in-out" style={{ top: paddingY + usableHeight * (1 - getRatio(thresholds.top5)) }}>
                   <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#4ade80] to-transparent relative">
                     <span className="absolute -top-4 right-4 text-[9px] uppercase tracking-[0.2em] text-[#4ade80] bg-surface-canvas px-3 font-medium border border-[#4ade80]/30 rounded-full">95TH PERCENTILE</span>
                   </div>
                 </div>
                 <div className="absolute w-1/2 left-1/4 flex items-center opacity-40 z-0 pointer-events-none transition-all duration-1000 ease-in-out" style={{ top: paddingY + usableHeight * (1 - getRatio(thresholds.median)) }}>
                   <div className="flex-1 h-[2px] bg-brand-accent/30 relative shadow-[0_0_10px_var(--brand-glow)]">
                     <span className="absolute left-1/2 -top-4 -translate-x-1/2 text-[9px] uppercase tracking-[0.2em] text-brand-accent bg-surface-canvas px-3 font-medium border border-brand-soft rounded-full shadow-[0_0_5px_var(--brand-glow)] whitespace-nowrap">
                       Global Median
                     </span>
                   </div>
                 </div>
                 <div className="absolute w-[80%] left-[10%] flex items-center opacity-40 z-0 pointer-events-none transition-all duration-1000 ease-in-out" style={{ top: paddingY + usableHeight * (1 - getRatio(thresholds.bottom5)) }}>
                   <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#fb7185] to-transparent relative">
                     <span className="absolute -top-4 right-4 text-[9px] uppercase tracking-[0.2em] text-[#fb7185] bg-surface-canvas px-3 font-medium border border-[#fb7185]/30 rounded-full">5TH PERCENTILE</span>
                   </div>
                 </div>
               </>
            )}

          {/* TRAILS LAYER (Tracking Selected Nodes) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
             {Object.entries(trailsRef.current).map(([id, rawTrail]) => {
                const trail = rawTrail as {x: number, y: number, year: number}[];
                if (trail.length < 2) return null;
                const pathData = trail.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');
                
                // Get node color for trail
                const nodeData = data.find(d => d.id === id);
                const color = nodeData ? lerpColor(nodeData.prosperityScore || nodeData.score) : '#00f2ff';
                
                return (
                  <path 
                     key={`trail-${id}`} 
                     d={pathData} 
                     fill="none" 
                     stroke={color} 
                     strokeWidth="3" 
                     strokeDasharray="6 6"
                     strokeLinecap="round"
                     strokeLinejoin="round" 
                     opacity="0.5"
                     className="transition-all duration-1000 ease-linear drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                  />
                );
             })}
          </svg>

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
            
            const hasSelection = selectedNodeIds.length > 0;
            
            return (
              <MapNode
                key={node.id}
                node={node}
                radius={dynamicRadius}
                isMatched={isMatched}
                isUnmatched={isUnmatched}
                isHovered={isHovered}
                isSelected={isSelected}
                isRegionHovered={isRegionHovered}
                isRegimeHovered={isRegimeHovered}
                isUnhoveredRegion={isUnhoveredRegion}
                isUnhoveredRegime={isUnhoveredRegime}
                hasSelection={hasSelection}
                isPlaying={isPlaying}
                onMouseEnter={handleNodeMouseEnter}
                onMouseLeave={handleNodeMouseLeave}
                onClick={handleNodeClickBounded}
              />
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
                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest mb-1 leading-none">Prosperity</span>
                    <div 
                      className="text-white px-2 py-1 rounded text-xs font-bold border leading-none bg-[#00f2ff]/20 border-[#00f2ff]"
                    >
                      {Math.round(hoveredNode.prosperityScore || 0)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3 mt-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-white/40 uppercase tracking-wider mb-0.5 font-bold">GDP (PPP)</span>
                    <span className="text-xs text-white font-mono">${Math.round(hoveredNode.gdpPpp / 1000)}k</span>
                  </div>
                  <div className="flex flex-col border-l border-white/10 pl-2">
                    <span className="text-[8px] text-white/40 uppercase tracking-wider mb-0.5 font-bold">CPI</span>
                    <span className="text-xs text-[#00f2ff] font-mono">{hoveredNode.score}</span>
                  </div>
                  <div className="flex flex-col border-l border-white/10 pl-2">
                    <span className="text-[8px] text-white/40 uppercase tracking-wider mb-0.5 font-bold">Inflation</span>
                    <span className="text-xs text-[#4ade80] font-mono">{Math.round(hoveredNode.inflation || 0)}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-white/10 pt-3 mt-3">
                  {hoveredNode.trend === 'Rising' && <TrendingUp className="w-3.5 h-3.5 text-[#4ade80]" />}
                  {hoveredNode.trend === 'Sinking' && <TrendingDown className="w-3.5 h-3.5 text-[#fb7185]" />}
                  {hoveredNode.trend === 'Stable' && <Minus className="w-3.5 h-3.5 text-white/50" />}
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
