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
  isPlaying?: boolean;
  currentTime?: number;
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
  isPlaying = false,
  currentTime = 0
}: GovernanceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<number>(currentTime);
  currentTimeRef.current = currentTime;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<SimulationNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  // Nodes used for rendering (throttled updates from the running simulation)
  const [renderNodes, setRenderNodes] = useState<SimulationNode[]>([]);
  // Refs to hold live simulation and node models without causing re-renders
  const simRef = useRef<d3.Simulation<SimulationNode, undefined> | null>(null);
  const nodesRef = useRef<SimulationNode[]>([]);
  const tickingRef = useRef(false);
  // Display positions for smooth interpolation (lerp) toward D3 targets
  const displayRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  // Preserve previous node positions to avoid jumps between re-renders
  const prevPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Responsive: track if mobile
  const isMobile = dimensions.width < 768 && dimensions.width > 0;

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Track cursor for tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredData = useMemo(() => {
    return data.filter(d => 
      (activeRegion === 'All' || d.region === activeRegion) &&
      (activeRegime === 'All' || d.regimeType === activeRegime)
    );
  }, [data, activeRegion, activeRegime]);

    // -- D3 Simulation setup and RAF-driven render updates --
    useEffect(() => {
      if (dimensions.width === 0 || dimensions.height === 0 || isMobile) {
        nodesRef.current = [];
        setRenderNodes([]);
        return;
      }

      const paddingY = 40;
      const usableHeight = dimensions.height - paddingY * 2;
      const radius = 24;

      // prepare sorted data
      const sortedData = [...filteredData].sort((a, b) => b.population - a.population);

      const getYValue = (d: CountryCPI) => {
        if (yAxis === 'CPI') return d.score;
        if (yAxis === 'GDP') return d.gdpPpp;
        if (yAxis === 'Happiness') return d.happiness;
        return d.meaningfulLife;
      };

      // Time-adjusted value using sine oscillation (matches App.tsx behavior)
      const getTimeAdjustedValue = (d: CountryCPI, time: number) => {
        let baseScore;
        if (yAxis === 'CPI') {
          baseScore = d.scoreHistory ? d.scoreHistory[Math.floor(time)] || d.score : d.score;
        } else if (yAxis === 'GDP') {
          baseScore = d.gdpHistory ? d.gdpHistory[Math.floor(time)] || d.gdpPpp : d.gdpPpp;
        } else if (yAxis === 'Happiness') {
          baseScore = d.happinessHistory ? d.happinessHistory[Math.floor(time)] || d.happiness : d.happiness;
        } else if (yAxis === 'MeaningfulLife') {
          baseScore = d.meaningfulLifeHistory ? d.meaningfulLifeHistory[Math.floor(time)] || d.meaningfulLife : d.meaningfulLife;
        } else {
          baseScore = yAxis === 'Happiness' ? d.happiness : d.meaningfulLife;
        }
        const oscillation = Math.sin(time * 0.1 + d.id.charCodeAt(0)) * 0.3;
        const trend = Math.sin(time * 0.05 + d.id.charCodeAt(1)) * 0.2;
        if (yAxis === 'CPI') return Math.max(0, Math.min(100, baseScore + (oscillation + trend) * 20));
        if (yAxis === 'GDP') return Math.max(0, baseScore + (oscillation + trend) * baseScore * 0.1);
        if (yAxis === 'Happiness') return Math.max(0, Math.min(10, baseScore + (oscillation + trend) * 2));
        return Math.max(0, Math.min(100, baseScore + (oscillation + trend) * 10));
      };

      const domain = yDomains[yAxis];

      const getTargetX = (d: CountryCPI) => {
        if (groupBy === 'Region') {
          const regions = REGIONS.filter(r => r !== 'All');
          const index = regions.indexOf(d.region);
          if (index === -1) return dimensions.width / 2;
          const columnWidth = dimensions.width / regions.length;
          return (index * columnWidth) + (columnWidth / 2);
        }
        if (groupBy === 'Regime') {
          const regimes = REGIMES.filter(r => r !== 'All');
          const index = regimes.indexOf(d.regimeType);
          if (index === -1) return dimensions.width / 2;
          const columnWidth = dimensions.width / regimes.length;
          return (index * columnWidth) + (columnWidth / 2);
        }
        return dimensions.width / 2;
      };

      // Build or update nodesRef
      const newNodes: SimulationNode[] = sortedData.map((d, index) => {
        const prev = prevPositionsRef.current.get(d.id);
        const startX = prev ? prev.x : (index / sortedData.length) * dimensions.width;
        const startY = prev ? prev.y : paddingY + 50;
        return { ...d, x: startX, y: startY, vx: 0, vy: 0 };
      });

      nodesRef.current = newNodes;

      const yForce = d3.forceY<SimulationNode>((d) => {
        const minYear = 2000;
        const maxYear = new Date().getFullYear();
        const raw = currentTimeRef.current || minYear;
        const timeNormalized = ((raw - minYear) / (maxYear - minYear)) * 100;
        const val = Math.min(getTimeAdjustedValue(d, timeNormalized), domain.max);
        return paddingY + usableHeight * (1 - val / domain.max);
      }).strength(0.8);

      const xForce = d3.forceX<SimulationNode>(getTargetX).strength(groupBy === 'None' ? 0.05 : 0.2);

      if (!simRef.current) {
        simRef.current = d3.forceSimulation<SimulationNode>(nodesRef.current)
          .force('y', yForce)
          .force('x', xForce)
          .force('collide', d3.forceCollide<SimulationNode>(radius + 2).iterations(2))
          .alphaDecay(0.03)
          .on('tick', () => {
            if (!tickingRef.current) {
              tickingRef.current = true;
              requestAnimationFrame(() => {
                // Interpolate display positions toward simulation targets
                nodesRef.current.forEach(n => {
                  const prev = displayRef.current.get(n.id) || { x: n.x, y: n.y };
                  const nx = prev.x + (n.x - prev.x) * 0.22;
                  const ny = prev.y + (n.y - prev.y) * 0.22;
                  displayRef.current.set(n.id, { x: nx, y: ny });
                });
                // Build renderable nodes using interpolated positions
                setRenderNodes(nodesRef.current.map(n => ({ ...n, x: displayRef.current.get(n.id)!.x, y: displayRef.current.get(n.id)!.y })));
                tickingRef.current = false;
              });
            }
          });
      } else {
        simRef.current.nodes(nodesRef.current);
        simRef.current.force('y', yForce);
        simRef.current.force('x', xForce);
        simRef.current.alpha(0.9).restart();
      }

      // run a few ticks quickly to settle a bit
      for (let i = 0; i < 60; i++) simRef.current?.tick();
      // initialize display positions if empty
      nodesRef.current.forEach(n => {
        if (!displayRef.current.has(n.id)) displayRef.current.set(n.id, { x: n.x, y: n.y });
      });
      setRenderNodes(nodesRef.current.map(n => ({ ...n, x: displayRef.current.get(n.id)!.x, y: displayRef.current.get(n.id)!.y })));

      // Save positions for next render
      nodesRef.current.forEach(n => prevPositionsRef.current.set(n.id, { x: n.x, y: n.y }));

      return () => {
        // stop simulation listeners to avoid leaks
        if (simRef.current) {
          simRef.current.on('tick', null);
        }
      };
    }, [filteredData, dimensions.width, dimensions.height, isMobile, groupBy, yAxis]);

  useEffect(() => {
    if (!simRef.current) return;
    simRef.current.alpha(0.9).restart();
  }, [currentTime, isPlaying]);

  const domain = yDomains[yAxis];
  const paddingY = 40; // Expand vertical stretch matching D3 math (safe for 48px diameter nodes)
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
             <span className="text-[9px] xl:text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 bg-[#050505]/80 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[90%] text-center">
               {item}
             </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col" ref={containerRef}>
      
      {isMobile ? (
        <>
          {/* Mobile labels can be ignored or adapted, we leave data list */}
          <div className="flex-1 w-full overflow-y-auto px-6 py-6 pb-20 custom-scrollbar mt-2">
            <div className="flex flex-col gap-3">
            {filteredData
              .filter(d => !normalizedSearch || d.name.toLowerCase().includes(normalizedSearch))
              .sort((a,b) => b.score - a.score)
              .map(country => (
                <div key={country.id} className="flex flex-col p-3 rounded-xl bg-[#0a0a0a]/50 border border-white/5 backdrop-blur-md shadow-lg mb-3">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <img src={getFlagUrl(country.id)} alt={country.name} className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                       <div className="flex flex-col">
                         <span className="text-white/90 font-medium text-sm">{country.name}</span>
                         <span className="text-white/40 text-[9px] uppercase tracking-wider">{country.regimeType}</span>
                       </div>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-lg font-bold" style={{ color: lerpColor(country.score) }}>{country.score}</span>
                        <div className="flex items-center gap-1 mt-1">
                          {country.trend === 'Rising' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                          {country.trend === 'Sinking' && <TrendingDown className="w-3 h-3 text-rose-400" />}
                          {country.trend === 'Stable' && <Minus className="w-3 h-3 text-white/30" />}
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between mx-1 pt-3 mt-3 border-t border-white/5">
                    <span className="text-[10px] text-white/40 font-mono flex flex-col items-center">
                      <span className="uppercase text-[8px] text-white/20 mb-1">GDP</span>
                      ${(country.gdpPpp / 1000).toFixed(0)}k
                    </span>
                    <span className="text-[10px] text-white/40 font-mono flex flex-col items-center border-l border-white/5 pl-4">
                      <span className="uppercase text-[8px] text-white/20 mb-1">Happy</span>
                      {country.happiness.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono flex flex-col items-center border-l border-white/5 pl-4">
                      <span className="uppercase text-[8px] text-white/20 mb-1">Meaning</span>
                      {country.meaningfulLife}%
                    </span>
                  </div>
                </div>
              ))}
            
            {/* Mobile Data Sources */}
            <div className="mt-6 mb-8 p-5 rounded-xl bg-[#050505]/80 border border-white/5">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-3">Methodology</h4>
              <p className="text-[8px] text-white/40 mb-4 leading-relaxed border-b border-white/5 pb-3">
                * Data is composite-normalized across peer-reviewed methodologies to minimize distinct bounds bias.
              </p>
              <div className="flex flex-col gap-4 text-[9px] text-white/30 font-mono">
                <div>
                  <span className="text-[#00f2ff]/60 uppercase tracking-widest font-bold block mb-1">Corruption & Regime</span>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-relaxed">
                    <a href="https://v-dem.net/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200 decoration-white/20 underline-offset-2 hover:underline">V-Dem Institute (v14)</a>
                    <span className="text-white/10">·</span>
                    <a href="https://info.worldbank.org/governance/wgi/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200 decoration-white/20 underline-offset-2 hover:underline">World Bank (WGI)</a>
                    <span className="text-white/10">·</span>
                    <a href="https://www.transparency.org/en/cpi" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200 decoration-white/20 underline-offset-2 hover:underline">Transparency Int. (CPI)</a>
                    <span className="text-white/10">·</span>
                    <a href="https://www.eiu.com/n/campaigns/democracy-index-2023/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200 decoration-white/20 underline-offset-2 hover:underline">EIU Index</a>
                  </div>
                </div>
                <div>
                  <span className="text-[#00f2ff]/60 uppercase tracking-widest font-bold block mb-1">Macroeconomics</span>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-relaxed">
                    <a href="https://www.rug.nl/ggdc/productivity/pwt/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200 decoration-white/20 underline-offset-2 hover:underline">Penn World Table (10.0)</a>
                    <span className="text-white/10">·</span>
                    <a href="https://www.imf.org/en/Publications/WEO" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200 decoration-white/20 underline-offset-2 hover:underline">IMF WEO</a>
                    <span className="text-white/10">·</span>
                    <a href="https://www.worldbank.org/en/programs/icp" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200 decoration-white/20 underline-offset-2 hover:underline">World Bank (ICP)</a>
                  </div>
                </div>
                <div>
                  <span className="text-[#00f2ff]/60 uppercase tracking-widest font-bold block mb-1">Wellbeing & Affect</span>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-relaxed">
                    <a href="https://www.worldvaluessurvey.org/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200 decoration-white/20 underline-offset-2 hover:underline">World Values Survey (WVS-7)</a>
                    <span className="text-white/10">·</span>
                    <a href="https://wellbeing.hmc.ox.ac.uk/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200 decoration-white/20 underline-offset-2 hover:underline">Oxford Wellbeing</a>
                    <span className="text-white/10">·</span>
                    <a href="https://news.gallup.com/poll/105226/world-poll-methodology.aspx" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200 decoration-white/20 underline-offset-2 hover:underline">Gallup Poll</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
      ) : (
        <div className="absolute inset-0 flex">
          {renderGroupLabels()}
          {/* Vertical Y-Axis Integrated dynamically to share padding math */}
          <div className="w-16 sm:w-20 shrink-0 h-full border-r border-white/5 relative z-10 bg-[#050505]">
             {dimensions.height > 0 && domain.ticks.map((tick, i) => (
               <div 
                 key={tick} 
                 className="absolute w-full flex justify-center -translate-y-1/2 text-[10px] font-mono text-white/40"
                 style={{ top: paddingY + usableHeight * (1 - tick / domain.max) }}
               >
                 <span className={i === Math.floor(domain.ticks.length/2) ? "text-[#00f2ff]/60 font-bold tracking-widest text-xs" : ""}>
                   {domain.format(tick)}
                 </span>
               </div>
             ))}
             {dimensions.height > 0 && (
               <>
                 <div className="absolute w-full text-center text-[10px] text-white/20 font-mono bottom-4 hidden sm:block uppercase tracking-widest">{yAxis === 'CPI' ? 'Corrupt' : 'Low'}</div>
                 <div className="absolute w-full text-center text-[10px] text-white/20 font-mono top-4 hidden sm:block uppercase tracking-widest">{yAxis === 'CPI' ? 'Clean' : 'High'}</div>
               </>
             )}
          </div>

          <div className="flex-1 relative overflow-hidden">
             {/* Background Lines */}
            <div className="absolute inset-0 flex justify-around opacity-10 pointer-events-none border-l border-white/5 pl-4 sm:pl-0">
              <div className="w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
              <div className="w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
              <div className="w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
              <div className="w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            </div>

            {/* Threshold Line */}
            {dimensions.height > 0 && (
               <div 
                 className="absolute w-full flex items-center pl-8 opacity-40 z-0 pointer-events-none transition-all duration-700"
                 style={{ top: paddingY + usableHeight * 0.5 }}
               >
                 <div className="flex-1 h-px border-b border-white border-dashed relative">
                   <span className="absolute -top-4 right-4 text-[9px] uppercase tracking-[0.2em] text-white/40 bg-[#050505] px-3 font-medium">
                     Global Median Threshold
                   </span>
                 </div>
               </div>
            )}

          {renderNodes.map((node, index) => {
            const isMatched = normalizedSearch && node.name.toLowerCase().includes(normalizedSearch);
            const isUnmatched = normalizedSearch && !isMatched;
            const isHovered = hoveredNode?.id === node.id;
            
            // Highlight checks
            const isRegionHovered = hoveredRegion && hoveredRegion !== 'All' && node.region === hoveredRegion;
            const isRegimeHovered = hoveredRegime && hoveredRegime !== 'All' && node.regimeType === hoveredRegime;
            
            const isUnhoveredRegion = hoveredRegion && hoveredRegion !== 'All' && node.region !== hoveredRegion;
            const isUnhoveredRegime = hoveredRegime && hoveredRegime !== 'All' && node.regimeType !== hoveredRegime;
            
            const isHighlighted = isMatched || isHovered || isRegionHovered || isRegimeHovered;
            
            let opacity = 1;
            if (isUnmatched) opacity = 0.15;
            else if (hoveredNode && !isHovered && !isMatched) opacity = 0.4;
            else if ((isUnhoveredRegion || isUnhoveredRegime) && !isMatched) opacity = 0.25;

            let currentScale = 1;
            if (isMatched) currentScale = 1.3;
            else if (isHovered) currentScale = 1.5;
            else if (isRegionHovered || isRegimeHovered) currentScale = 1.15;

            let currentShadow = 'none';
            if (isMatched) currentShadow = '0 0 20px rgba(0, 242, 255, 0.8)';
            else if (isHovered) currentShadow = `0 0 15px ${lerpColor(node.score)}`;
            else if (isRegionHovered || isRegimeHovered) currentShadow = `0 0 15px ${lerpColor(node.score)}`;
            
            return (
              <motion.div
                key={node.id}
                initial={hasAnimated ? {
                  opacity,
                  scale: currentScale,
                  x: node.x - 24,
                  y: node.y - 24
                } : {
                  opacity: 0,
                  scale: 0,
                  x: node.x - 24,
                  y: 50
                }}
                animate={{
                  opacity,
                  scale: currentScale,
                  x: node.x - 24,
                  y: node.y - 24
                }}
                transition={hasAnimated ? {
                  type: 'spring',
                  // Use stiffness/damping for predictable spring behaviour instead of duration
                  stiffness: isPlaying ? 80 : 160,
                  damping: isPlaying ? 22 : 36,
                  // small bounce for liveliness but avoid large overshoot
                  bounce: isPlaying ? 0.18 : 0.12
                } : {
                  // Initial drop uses a slower spring with visible stagger
                  type: 'spring',
                  stiffness: 120,
                  damping: 14,
                  bounce: 0.35,
                  delay: (index * 0.06)
                }}
                onAnimationComplete={() => {
                  if (!hasAnimated && index === renderNodes.length - 1) {
                    setHasAnimated(true);
                  }
                }}
                className={`absolute flex items-center justify-center cursor-pointer transition-all duration-500 ${
                  isMatched ? 'z-50' : isHovered ? 'z-40' : (isRegionHovered || isRegimeHovered) ? 'z-30' : 'z-10'
                }`}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                 <motion.div
                   animate={isPlaying ? { y: 0 } : { y: [0, -3, 0] }}
                   transition={{ 
                     duration: 4.2, 
                     repeat: isPlaying ? 0 : Infinity, 
                     ease: "easeInOut",
                     bounce: 0.12
                   }}
                   whileHover={{ 
                     y: [0, -8, 0],
                     transition: { duration: 0.8, ease: "easeOut", bounce: 0.5 }
                   }}
                   whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
                   className="relative"
                 >
                    <div 
                      className={`w-12 h-12 rounded-full overflow-hidden border bg-[#050505] flex items-center justify-center relative
                        ${isMatched ? 'border-[#00f2ff]' : 'border-white/10'}
                      `}
                      style={{ 
                        borderColor: isMatched ? '#00f2ff' : isHighlighted ? '#fff' : lerpColor(node.score),
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
                      <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center z-10 pointer-events-none rounded-full transition-colors">
                         <span className="text-[11px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)] leading-none tracking-widest">{node.id}</span>
                         {node.trend === 'Rising' && <TrendingUp className="w-4 h-4 text-[#4ade80] drop-shadow-[0_1px_3px_rgba(0,0,0,1)] mt-[1px] stroke-[3]" />}
                         {node.trend === 'Sinking' && <TrendingDown className="w-4 h-4 text-[#fb7185] drop-shadow-[0_1px_3px_rgba(0,0,0,1)] mt-[1px] stroke-[3]" />}
                      </div>
                    </div>
                 </motion.div>
              </motion.div>
            );
          })}

          {/* Cursor Tracking Hover Card */}
          <AnimatePresence>
            {hoveredNode && dimensions.width > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute z-50 pointer-events-none w-72 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl"
                style={{
                  left: mousePos.x + 20 + 288 > dimensions.width ? mousePos.x - 300 : mousePos.x + 20,
                  top: mousePos.y + 20 + 150 > dimensions.height ? mousePos.y - 180 : mousePos.y + 20,
                }}
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
