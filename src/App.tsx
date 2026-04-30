/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import GovernanceMap, { REGIONS, REGIMES } from './components/GovernanceMap';
import CommandMenu from './components/CommandMenu';
import ComparisonPanel from './components/ComparisonPanel';
import TimelineControl from './components/TimelineControl';
import ThemeToggle from './components/ThemeToggle';
import { enrichedCpiData, CountryCPI } from './data/cpi2024';
import { generateDecade } from './lib/historyEngine';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export type YAxisMetric = 'ProsperityScore' | 'CPI' | 'GDP' | 'Happiness' | 'MeaningfulLife' | 'Inflation' | 'Unemployment' | 'Education' | 'LifeExpectancy' | 'PressFreedom';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [activeRegime, setActiveRegime] = useState('All');
  const [hoveredRegime, setHoveredRegime] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'None' | 'Region' | 'Regime'>('None');
  const [yAxis, setYAxis] = useState<YAxisMetric>('ProsperityScore');
  const [viewMode, setViewMode] = useState<'Monitor' | 'Mobile'>('Mobile');

  // COMPARISON STATE
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);

  // LIVE DATA SYNC
  const [liveData, setLiveData] = useState<CountryCPI[]>(enrichedCpiData);
  const [isWbLinked, setIsWbLinked] = useState(false);

  // TIMELINE STATE
  const [historicalData, setHistoricalData] = useState<Record<number, CountryCPI[]>>({});
  const [currentYear, setCurrentYear] = useState(2000);
  const [isPlaying, setIsPlaying] = useState(false);

  // Regenerate history when live dataset shifts (e.g., WB Sync completes)
  useEffect(() => {
    setHistoricalData(generateDecade(liveData));
  }, [liveData]);

  // Cinematic Playback Loop
  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setCurrentYear(prev => {
          if (prev >= 2026) {
            setIsPlaying(false);
            return 2026;
          }
          return prev + 1;
        });
      }, 1000); // 1 second per year for fluid race interpolation
      return () => clearInterval(timer);
    }
  }, [isPlaying]);

  useEffect(() => {
    async function syncWorldBankData() {
      try {
        const res = await fetch('https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.PP.CD?format=json&date=2022&per_page=300');
        const data = await res.json();
        
        if (data && data[1]) {
           const wbRecords = data[1];
           
           // Create a merged dataset overriding our synthetic static GDP with REAL World Bank data.
           const syncedDataset = enrichedCpiData.map(country => {
              const match = wbRecords.find((r: any) => r.country.id === country.id || r.countryiso3code?.startsWith(country.id));
              if (match && match.value) {
                return { ...country, gdpPpp: match.value };
              }
              return country;
           });
           
           setLiveData(syncedDataset);
           setIsWbLinked(true);
        }
      } catch (err) {
        console.error("World Bank API integration error:", err);
      }
    }
    syncWorldBankData();
  }, []);

  const handleNodeClick = (id: string) => {
    setSelectedCountryIds(prev => {
      // Toggle off if already selected
      if (prev.includes(id)) return prev.filter(c => c !== id);
      // Rolling FIFO selection strategy (drops the oldest, pushes the new one)
      if (prev.length >= 5) return [...prev.slice(1), id];
      // Append the new selection
      return [...prev, id];
    });
  };

  const currentData = useMemo(() => {
    let base = historicalData[currentYear] || liveData;
    
    if (viewMode === 'Mobile') {
      const topN = 50;
      const getValue = (d: CountryCPI) => {
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
      
      const isReversed = yAxis === 'Inflation' || yAxis === 'Unemployment';
      const sorted = [...base].sort((a, b) => isReversed ? getValue(a) - getValue(b) : getValue(b) - getValue(a));
      base = sorted.slice(0, topN);
    }
    return base;
  }, [historicalData, currentYear, liveData, viewMode, yAxis]);

  const selectedNodes = currentData.filter(d => selectedCountryIds.includes(d.id));

  return (
    <div className="w-full min-h-[100dvh] h-[100dvh] bg-surface-canvas text-text-primary font-sans relative overflow-hidden flex flex-col lg:flex-row selection:bg-brand-soft">
      
      {/* MOBILE HEADER (Visible < lg) */}
      <header className="lg:hidden h-16 sm:h-20 shrink-0 border-b border-border-subtle flex items-center justify-between px-4 sm:px-6 z-20 bg-surface-canvas">
        <div className="flex flex-col">
          <h1 className="text-[10px] sm:text-[11px] tracking-[0.3em] text-brand-accent font-semibold uppercase opacity-90">360° Development Matrix</h1>
          <span className="text-xl sm:text-2xl font-light tracking-tighter text-text-primary">Global Prosperity</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <CommandMenu onSearch={setSearchQuery} />
        </div>
      </header>

      {/* DESKTOP LEFT SIDEBAR (Visible >= lg) */}
      <aside className="hidden lg:flex w-80 xl:w-[24rem] shrink-0 h-full border-r border-border-subtle flex-col justify-between p-6 xl:p-8 z-20 bg-[var(--surface-base)] shadow-2xl relative overflow-auto custom-scrollbar">
        <div className="w-full absolute top-0 left-0 h-40 bg-gradient-to-b from-[var(--brand-soft)] to-transparent pointer-events-none opacity-50"></div>
        
        <div className="flex flex-col relative z-10 w-full mb-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-[10px] xl:text-[11px] tracking-[0.3em] text-brand-accent font-semibold uppercase opacity-90 mb-2 leading-relaxed">
                360° Development Matrix
              </h1>
              <span className="text-3xl xl:text-4xl font-light tracking-tighter text-text-primary block leading-none">
                Global Prosperity
              </span>
              <div className="mt-4 inline-flex items-center gap-2 bg-brand-soft/20 border border-brand-accent/20 px-3 py-1.5 rounded-lg shadow-sm">
                <span className="text-brand-accent uppercase tracking-widest text-[9px] font-bold">Year</span>
                <span className="text-xl font-bold font-mono text-text-primary leading-none">{currentYear}</span>
              </div>
            </div>
            <ThemeToggle />
          </div>


          {/* UNIFIED CONTROLS */}
          <div className="flex flex-col gap-6 w-full flex-1">
            
            <div className="bg-surface-canvas border border-border-subtle rounded-xl p-4 relative overflow-hidden">
              <h3 className="text-text-primary text-[11px] font-bold tracking-[0.1em] uppercase mb-5 flex items-center justify-between z-10 relative">
                <span>View Controls</span>
              </h3>
              
              <div className="absolute right-[-20px] top-[-20px] text-[100px] font-black text-text-primary opacity-[0.03] select-none pointer-events-none">
                {currentYear}
              </div>
              
              <div className="flex flex-col gap-5 z-10 relative">
                {/* Y Axis Select */}
                <div>
                  <label className="text-text-tertiary text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5 flex justify-between">
                    <span>Vertical Axis (Y) Element</span>
                    {yAxis !== 'ProsperityScore' && <span className="text-brand-accent animate-pulse text-[8px] opacity-70">ACTIVE</span>}
                  </label>
                  <div className="relative mb-3">
                    <select 
                      value={yAxis} 
                      onChange={(e) => setYAxis(e.target.value as any)}
                      className="w-full appearance-none bg-surface-panel border border-border-soft rounded-md px-3 py-2 text-[11px] uppercase tracking-wider font-medium text-text-secondary hover:text-text-primary hover:border-border-strong focus:outline-none focus:border-brand-accent transition-colors cursor-pointer"
                    >
                      <optgroup label="Main Metrics">
                        <option value="ProsperityScore">Prosperity Index</option>
                      </optgroup>
                      <optgroup label="Governance Data">
                        <option value="CPI">Corruption Index</option>
                        <option value="PressFreedom">Press Freedom</option>
                      </optgroup>
                      <optgroup label="Economic Data">
                        <option value="GDP">GDP PPP Per Capita</option>
                        <option value="Inflation">Inflation Rate</option>
                        <option value="Unemployment">Unemployment Rate</option>
                      </optgroup>
                      <optgroup label="Social Data">
                        <option value="Happiness">Happiness Index</option>
                        <option value="MeaningfulLife">Meaningful Life</option>
                        <option value="Education">Education Index</option>
                        <option value="LifeExpectancy">Life Expectancy</option>
                      </optgroup>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
                  </div>
                  
                  {/* Dynamic Metric Information */}
                  <div className="bg-surface-panel rounded-lg p-3 border border-border-soft text-[10px] leading-relaxed">
                    {yAxis === 'ProsperityScore' && (
                      <div className="flex flex-col gap-2">
                        <div><strong className="text-brand-accent">Formula:</strong> Composite Weighted Mean</div>
                        <div className="text-text-tertiary font-mono pt-1 pb-1">
                          15% <a href="https://data.worldbank.org/indicator/NY.GDP.PCAP.PP.CD" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2">GDP(PPP)</a><br/>
                          15% <a href="https://www.transparency.org/en/cpi" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2">CPI</a><br/>
                          15% <a href="https://data.worldbank.org/indicator/SP.DYN.LE00.IN" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2">Life Exp</a><br/>
                          15% <a href="https://hdr.undp.org/data-center" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2">Education</a><br/>
                          10% <a href="https://rsf.org/en/index" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2">Press Frdm</a><br/>
                          10% <a href="https://www.worldvaluessurvey.org/" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2">Meaning</a><br/>
                          10% <a href="https://worldhappiness.report/" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2">Happiness</a><br/>
                          5% <span className="opacity-75">max(0, 100 - 3 * <a href="https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2">Inflation</a>)</span><br/>
                          5% <span className="opacity-75">max(0, 100 - 5 * <a href="https://ilostat.ilo.org/" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2">Unemployment</a>)</span>
                        </div>
                        <div className="text-text-tertiary opacity-80 text-[9px]">
                          Values normalized (0-100) before weighting.
                        </div>
                      </div>
                    )}
                    {yAxis === 'CPI' && (
                      <div className="flex flex-col gap-1">
                        <div><strong className="text-brand-accent">Source:</strong> <a href="https://www.transparency.org/en/cpi" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2 tracking-wide">Transparency International</a></div>
                        <div className="text-text-tertiary mt-1">Scale of 0 (Highly Corrupt) to 100 (Very Clean). Reflects perceived levels of public sector corruption.</div>
                      </div>
                    )}
                    {yAxis === 'GDP' && (
                      <div className="flex flex-col gap-1">
                        <div><strong className="text-brand-accent">Source:</strong> <a href="https://data.worldbank.org/indicator/NY.GDP.PCAP.PP.CD" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2 tracking-wide">World Bank</a></div>
                        <div className="text-text-tertiary">GDP per capita based on purchasing power parity (PPP) in current international dollars.</div>
                      </div>
                    )}
                    {yAxis === 'Inflation' && (
                      <div className="flex flex-col gap-1">
                        <div><strong className="text-brand-accent">Source:</strong> <a href="https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2 tracking-wide">World Bank</a></div>
                        <div className="text-text-tertiary">Inflation, consumer prices (annual %). Shown inverted (higher is worse).</div>
                      </div>
                    )}
                    {yAxis === 'Unemployment' && (
                      <div className="flex flex-col gap-1">
                        <div><strong className="text-brand-accent">Source:</strong> <a href="https://ilostat.ilo.org/" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2 tracking-wide">ILOSTAT</a></div>
                        <div className="text-text-tertiary mt-1">Unemployment, total (% of total labor force). Modeled estimates. Shown inverted on graph.</div>
                      </div>
                    )}
                    {yAxis === 'Happiness' && (
                      <div className="flex flex-col gap-1">
                        <div><strong className="text-brand-accent">Source:</strong> <a href="https://worldhappiness.report/" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2 tracking-wide">Gallup World Poll</a></div>
                        <div className="text-text-tertiary mt-1">National average response to the Cantril ladder question (0-10 scale) representing perceived life satisfaction.</div>
                      </div>
                    )}
                    {yAxis === 'MeaningfulLife' && (
                      <div className="flex flex-col gap-1">
                        <div><strong className="text-brand-accent">Source:</strong> <a href="https://www.worldvaluessurvey.org/" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2 tracking-wide">World Values Survey</a></div>
                        <div className="text-text-tertiary mt-1">Percentage of population indicating subjective feelings of meaning and purpose in their daily life.</div>
                      </div>
                    )}
                    {yAxis === 'Education' && (
                      <div className="flex flex-col gap-1">
                        <div><strong className="text-brand-accent">Source:</strong> <a href="https://hdr.undp.org/data-center" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2 tracking-wide">UNDP Human Development</a></div>
                        <div className="text-text-tertiary mt-1">Education Index derived by combining mean years of schooling for adults with expected years of schooling for children.</div>
                      </div>
                    )}
                    {yAxis === 'LifeExpectancy' && (
                      <div className="flex flex-col gap-1">
                        <div><strong className="text-brand-accent">Source:</strong> <a href="https://data.worldbank.org/indicator/SP.DYN.LE00.IN" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2 tracking-wide">World Bank</a></div>
                        <div className="text-text-tertiary">Life expectancy at birth (years). Tracks the overall average lifespan of a newborn.</div>
                      </div>
                    )}
                    {yAxis === 'PressFreedom' && (
                      <div className="flex flex-col gap-1">
                        <div><strong className="text-brand-accent">Source:</strong> <a href="https://rsf.org/en/index" target="_blank" rel="noreferrer" className="text-text-primary hover:underline underline-offset-2 tracking-wide">Reporters Without Borders</a></div>
                        <div className="text-text-tertiary mt-1">World Press Freedom Index score (0-100 scale, higher is better).</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* View Mode Filter */}
                <div>
                  <label className="text-text-tertiary text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5 flex justify-between">
                    <span>View Mode</span>
                  </label>
                  <div className="flex bg-surface-panel p-1 rounded-lg border border-border-soft">
                    {['Monitor', 'Mobile'].map(val => (
                      <button
                        key={val}
                        onClick={() => setViewMode(val as any)}
                        className={`flex-1 py-1.5 text-[9px] uppercase font-bold tracking-widest rounded-md transition-all ${
                          viewMode === val
                            ? 'bg-brand-soft text-brand-accent shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                            : 'text-text-tertiary hover:text-text-primary'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* X Axis Select */}
                <div>
                  <label className="text-text-tertiary text-[9px] font-bold tracking-[0.2em] uppercase mb-2 flex justify-between">
                    <span>Horizontal Spread (X)</span>
                    {groupBy !== 'None' && <span className="text-brand-accent animate-pulse text-[8px] opacity-70">ACTIVE</span>}
                  </label>
                  <div className="flex bg-surface-panel p-1 rounded-lg border border-border-soft">
                    {[
                      { value: 'None', label: 'Global' },
                      { value: 'Region', label: 'Region' },
                      { value: 'Regime', label: 'Regime' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setGroupBy(opt.value as any)}
                        className={`flex-1 py-1.5 text-[9px] uppercase font-bold tracking-widest rounded-md transition-all ${
                          groupBy === opt.value
                            ? 'bg-brand-soft text-brand-accent shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                            : 'text-text-tertiary hover:text-text-primary'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <ComparisonPanel 
            countries={selectedNodes}
            onClose={() => setSelectedCountryIds([])}
            onRemove={(id) => setSelectedCountryIds(prev => prev.filter(c => c !== id))}
          />
        </div>

        <div className="mt-8 flex flex-col gap-6">
          <div className="w-full">
            <CommandMenu onSearch={setSearchQuery} />
          </div>
          <div className="flex flex-col gap-1 text-[8px] uppercase tracking-[0.2em] text-text-tertiary/40 font-mono mt-auto border-t border-border-soft/30 pt-3 relative z-10 w-full mb-1">
            <p className="flex justify-between items-center w-full"><span>Status: Deployed · {liveData.length} Nodes</span></p>
            {isWbLinked && <p className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-text-tertiary/50"></span> LIVE API: WB.GDP.PCAP </p>}
            <p className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-[#4ade80]/50"></span> MULTI-AXIS / 0° ROT</p>
          </div>
        </div>
      </aside>

      {/* GRAPH WRAPPER */}
      <main className="flex-1 relative flex overflow-hidden lg:h-[100dvh]">
        {/* The Beeswarm Canvas - Now getting FULL VERTICAL HEIGHT */}
        <div className="flex-1 relative overflow-hidden flex h-full">
          <div className="absolute inset-0 w-full h-full">
            <GovernanceMap 
              data={currentData} 
              searchQuery={searchQuery}
              activeRegion={activeRegion}
              activeRegime={activeRegime}
              hoveredRegion={hoveredRegion}
              hoveredRegime={hoveredRegime}
              groupBy={groupBy}
              yAxis={yAxis}
              selectedNodeIds={selectedCountryIds}
              onNodeClick={handleNodeClick}
              currentYear={currentYear}
              isPlaying={isPlaying}
              forceMobileView={viewMode === 'Mobile'}
            />
          </div>
          
          {/* TIMELINE UI SCRUBBER */}
          <TimelineControl 
            currentYear={currentYear}
            isPlaying={isPlaying}
            onYearChange={(y) => {
              setCurrentYear(y);
              setIsPlaying(false); // Manual scrub halts playback
            }}
            onTogglePlay={() => {
              if (currentYear === 2026) setCurrentYear(2000); // Rewind logic
              setIsPlaying(!isPlaying);
            }}
          />

          {/* LOW PROFILE FOOTER FOR DATA SOURCES */}
          <div className="absolute bottom-2 right-4 z-40 pointer-events-none text-right">
             <div className="text-[9px] text-text-tertiary/60 font-mono tracking-widest flex items-center justify-end gap-2 drop-shadow-md opacity-40">
                <span className="uppercase">Interactive Visual Explorer • 2000-2026</span>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
