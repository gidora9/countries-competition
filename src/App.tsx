/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import GovernanceMap, { REGIONS, REGIMES } from './components/GovernanceMap';
import CommandMenu from './components/CommandMenu';
import ComparisonPanel from './components/ComparisonPanel';
import TimelineControl from './components/TimelineControl';
import ThemeToggle from './components/ThemeToggle';
import { cpiData, CountryCPI } from './data/cpi2024';
import { generateDecade } from './lib/historyEngine';
import { motion } from 'motion/react';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [activeRegime, setActiveRegime] = useState('All');
  const [hoveredRegime, setHoveredRegime] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'None' | 'Region' | 'Regime'>('None');
  const [yAxis, setYAxis] = useState<'CPI' | 'GDP' | 'Happiness' | 'MeaningfulLife'>('CPI');

  // COMPARISON STATE
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);

  // LIVE DATA SYNC
  const [liveData, setLiveData] = useState<CountryCPI[]>(cpiData);
  const [isWbLinked, setIsWbLinked] = useState(false);

  // TIMELINE STATE
  const [historicalData, setHistoricalData] = useState<Record<number, CountryCPI[]>>({});
  const [currentYear, setCurrentYear] = useState(2024);
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
          if (prev >= 2024) {
            setIsPlaying(false);
            return 2024;
          }
          return prev + 1;
        });
      }, 1500); // 1.5 seconds per year for fluid swarm physics
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
           const syncedDataset = cpiData.map(country => {
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
      if (prev.length >= 2) return [prev[1], id];
      // Append the new selection
      return [...prev, id];
    });
  };

  const currentData = historicalData[currentYear] || liveData;

  const selectedNodes = currentData.filter(d => selectedCountryIds.includes(d.id));

  return (
    <div className="w-full min-h-[100dvh] h-[100dvh] bg-surface-canvas text-text-primary font-sans relative overflow-hidden flex flex-col lg:flex-row selection:bg-brand-soft">
      
      {/* MOBILE HEADER (Visible < lg) */}
      <header className="lg:hidden h-16 sm:h-20 shrink-0 border-b border-border-subtle flex items-center justify-between px-4 sm:px-6 z-20 bg-surface-canvas">
        <div className="flex flex-col">
          <h1 className="text-[10px] sm:text-[11px] tracking-[0.3em] text-brand-accent font-semibold uppercase opacity-90">Behavioral Governance</h1>
          <span className="text-xl sm:text-2xl font-light tracking-tighter text-text-primary">Identity Map</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <CommandMenu onSearch={setSearchQuery} />
        </div>
      </header>

      {/* DESKTOP LEFT SIDEBAR (Visible >= lg) */}
      <aside className="hidden lg:flex w-72 xl:w-[22rem] shrink-0 h-full border-r border-border-subtle flex-col justify-between p-6 xl:p-8 z-20 bg-surface-panel shadow-2xl relative overflow-y-auto custom-scrollbar">
        <div className="w-full absolute top-0 left-0 h-40 bg-gradient-to-b from-[var(--brand-soft)] to-transparent pointer-events-none"></div>
        
        <div className="flex flex-col relative z-10 w-full mb-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-[10px] xl:text-[11px] tracking-[0.3em] text-brand-accent font-semibold uppercase opacity-90 mb-2 leading-relaxed">
                Behavioral<br/>Governance Map
              </h1>
              <span className="text-3xl xl:text-4xl font-light tracking-tighter text-text-primary block leading-none">
                Identity &<br/>Corruption
              </span>
              <span className="text-text-tertiary text-sm mt-3 block font-mono">/ {currentYear}</span>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="w-full mb-8">
            <CommandMenu onSearch={setSearchQuery} />
          </div>

          {/* UNIFIED FILTERS */}
          <div className="flex flex-col gap-6 w-full flex-1">
            
            {/* Visual Layout Tool */}
            <div>
              <h3 className="text-text-tertiary text-[10px] font-bold tracking-[0.2em] uppercase mb-3 ml-1 flex items-center justify-between">
                <span>Vertical Data (Y)</span>
                {yAxis !== 'CPI' && <span className="text-brand-accent animate-pulse text-[8px] opacity-70">ACTIVE</span>}
              </h3>
              <div className="flex flex-col gap-2">
                 <div className="flex gap-2">
                   <button onClick={() => setYAxis('CPI')} className={`flex-1 py-1.5 rounded text-[9px] uppercase font-bold tracking-wider transition-all border ${yAxis === 'CPI' ? 'border-brand-accent bg-brand-soft text-brand-accent' : 'border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border-strong'}`}>Corruption</button>
                   <button onClick={() => setYAxis('GDP')} className={`flex-1 py-1.5 rounded text-[9px] uppercase font-bold tracking-wider transition-all border ${yAxis === 'GDP' ? 'border-brand-accent bg-brand-soft text-brand-accent' : 'border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border-strong'}`}>GDP (PPP)</button>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => setYAxis('Happiness')} className={`flex-1 py-1.5 rounded text-[9px] uppercase font-bold tracking-wider transition-all border ${yAxis === 'Happiness' ? 'border-brand-accent bg-brand-soft text-brand-accent' : 'border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border-strong'}`}>Happiness</button>
                   <button onClick={() => setYAxis('MeaningfulLife')} className={`flex-1 py-1.5 rounded text-[9px] uppercase font-bold tracking-wider transition-all border ${yAxis === 'MeaningfulLife' ? 'border-brand-accent bg-brand-soft text-brand-accent' : 'border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border-strong'}`}>Meaningful</button>
                 </div>
              </div>
            </div>

            <div>
              <h3 className="text-text-tertiary text-[10px] font-bold tracking-[0.2em] uppercase mb-3 ml-1 flex items-center justify-between">
                <span>Horizontal Spread (X)</span>
                {groupBy !== 'None' && <span className="text-brand-accent animate-pulse text-[8px] opacity-70">ACTIVE</span>}
              </h3>
              <div className="flex gap-2">
                 <button onClick={() => setGroupBy('None')} className={`flex-1 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all border ${groupBy === 'None' ? 'border-brand-accent bg-brand-soft text-brand-accent' : 'border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border-strong'}`}>Unified</button>
                 <button onClick={() => setGroupBy('Region')} className={`flex-1 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all border ${groupBy === 'Region' ? 'border-brand-accent bg-brand-soft text-brand-accent' : 'border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border-strong'}`}>By Region</button>
                 <button onClick={() => setGroupBy('Regime')} className={`flex-1 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all border ${groupBy === 'Regime' ? 'border-brand-accent bg-brand-soft text-brand-accent' : 'border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border-strong'}`}>By System</button>
              </div>
            </div>

            <div>
              <h3 className="text-text-tertiary text-[10px] font-bold tracking-[0.2em] uppercase mb-3 ml-1 flex items-center justify-between">
                <span>Geographic Region</span>
                {activeRegion !== 'All' && <span className="text-brand-accent text-[8px] opacity-80">FILTERED</span>}
              </h3>
              <div className="flex flex-col gap-1.5">
                {REGIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setActiveRegion(r)}
                    onMouseEnter={() => setHoveredRegion(r)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className={`px-3 py-1.5 w-full text-left rounded-md text-[11px] tracking-wider uppercase transition-all duration-300 border font-medium hover:scale-[1.02]
                      ${activeRegion === r 
                        ? 'border-brand-accent bg-brand-soft text-brand-accent glow-selected' 
                        : hoveredRegion === r
                        ? 'border-border-strong bg-surface-hover text-text-primary'
                        : 'border-border-soft bg-surface-canvas text-text-tertiary hover:text-text-primary hover:bg-surface-hover'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-text-tertiary text-[10px] font-bold tracking-[0.2em] uppercase mb-3 ml-1 flex items-center justify-between">
                <span>Governance System</span>
                {activeRegime !== 'All' && <span className="text-brand-accent text-[8px] opacity-80">FILTERED</span>}
              </h3>
              <div className="flex flex-col gap-1.5">
                {REGIMES.map(r => (
                  <button
                    key={r}
                    onClick={() => setActiveRegime(r)}
                    onMouseEnter={() => setHoveredRegime(r)}
                    onMouseLeave={() => setHoveredRegime(null)}
                    className={`px-3 py-1.5 w-full text-left rounded-md text-[11px] tracking-wider uppercase transition-all duration-300 border font-medium hover:scale-[1.02]
                      ${activeRegime === r 
                        ? 'border-brand-accent bg-brand-soft text-brand-accent glow-selected' 
                        : hoveredRegime === r
                        ? 'border-border-strong bg-surface-hover text-text-primary'
                        : 'border-border-soft bg-surface-canvas text-text-tertiary hover:text-text-primary hover:bg-surface-hover'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-secondary mb-2">Methodology</h4>
            <p className="text-[8px] text-text-tertiary mb-4 leading-relaxed border-b border-border-soft pb-3">
              * Data is composite-normalized across peer-reviewed methodologies to minimize distinct bounds bias.
            </p>
            <div className="flex flex-col gap-3 text-[9px] text-text-tertiary font-mono">
              <div>
                <span className="text-brand-accent uppercase tracking-widest font-bold block mb-1 opacity-60">Corruption & Regime</span>
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
                <span className="text-brand-accent uppercase tracking-widest font-bold block mb-1 opacity-60">Macroeconomics</span>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-relaxed">
                  <a href="https://www.rug.nl/ggdc/productivity/pwt/" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors duration-200 decoration-border-strong underline-offset-2 hover:underline">Penn World Table (10.0)</a>
                  <span className="text-border-strong">·</span>
                  <a href="https://www.imf.org/en/Publications/WEO" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors duration-200 decoration-border-strong underline-offset-2 hover:underline">IMF WEO</a>
                  <span className="text-border-strong">·</span>
                  <a href="https://www.worldbank.org/en/programs/icp" target="_blank" rel="noreferrer" className="hover:text-text-primary transition-colors duration-200 decoration-border-strong underline-offset-2 hover:underline">World Bank (ICP)</a>
                </div>
              </div>
              <div>
                <span className="text-brand-accent uppercase tracking-widest font-bold block mb-1 opacity-60">Wellbeing & Affect</span>
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
          <div className="flex flex-col gap-1.5 text-[9px] uppercase tracking-[0.3em] text-text-tertiary font-mono mt-4 border-t border-border-soft pt-4">
            <p className="flex justify-between items-center w-full"><span>Status: Deployed · {liveData.length} Nodes</span></p>
            {isWbLinked && <p className="text-brand-accent mt-1 flex items-center gap-2 opacity-80"><span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span> LIVE API: WB.GDP.PCAP </p>}
          </div>
          <div className="flex items-center gap-3 relative z-10 pt-4 mt-2 w-full">
            <div className={`w-2 h-2 rounded-full ${isWbLinked ? 'bg-brand-accent shadow-[0_0_10px_var(--brand-glow)]' : 'bg-[#4ade80] shadow-[0_0_10px_#4ade80]'} animate-pulse`}></div>
            <span className={`text-[10px] ${isWbLinked ? 'text-brand-accent' : 'text-[#4ade80]'} font-mono uppercase tracking-widest opacity-80`}>MULTI-AXIS / 0° ROT</span>
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
              if (currentYear === 2024) setCurrentYear(2014); // Rewind logic
              setIsPlaying(!isPlaying);
            }}
          />

          <ComparisonPanel 
            countries={selectedNodes}
            onClose={() => setSelectedCountryIds([])}
            onRemove={(id) => setSelectedCountryIds(prev => prev.filter(c => c !== id))}
          />
        </div>
      </main>
    </div>
  );
}
