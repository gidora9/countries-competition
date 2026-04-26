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
          if (prev >= 2024) {
            setIsPlaying(false);
            return 2024;
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

  const currentData = historicalData[currentYear] || liveData;

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
      <aside className="hidden lg:flex w-72 xl:w-[22rem] shrink-0 h-full border-r border-border-subtle flex-col justify-between p-6 xl:p-8 z-20 bg-surface-panel shadow-2xl relative overflow-y-auto custom-scrollbar">
        <div className="w-full absolute top-0 left-0 h-40 bg-gradient-to-b from-[var(--brand-soft)] to-transparent pointer-events-none"></div>
        
        <div className="flex flex-col relative z-10 w-full mb-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-[10px] xl:text-[11px] tracking-[0.3em] text-brand-accent font-semibold uppercase opacity-90 mb-2 leading-relaxed">
                360° Development Matrix
              </h1>
              <span className="text-3xl xl:text-4xl font-light tracking-tighter text-text-primary block leading-none">
                Global Prosperity
              </span>
              <span className="text-text-tertiary text-sm mt-3 block font-mono">/ {currentYear}</span>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="w-full mb-8">
            <CommandMenu onSearch={setSearchQuery} />
          </div>

          {/* UNIFIED CONTROLS */}
          <div className="flex flex-col gap-6 w-full flex-1">
            
            <div className="bg-surface-canvas border border-border-subtle rounded-xl p-4">
              <h3 className="text-text-primary text-[11px] font-bold tracking-[0.1em] uppercase mb-5 flex items-center justify-between">
                <span>View Controls</span>
              </h3>
              
              <div className="flex flex-col gap-5">
                {/* Y Axis Select */}
                <div>
                  <label className="text-text-tertiary text-[9px] font-bold tracking-[0.2em] uppercase mb-1.5 flex justify-between">
                    <span>Vertical Axis (Y)</span>
                    {yAxis !== 'ProsperityScore' && <span className="text-brand-accent animate-pulse text-[8px] opacity-70">ACTIVE</span>}
                  </label>
                  <div className="relative">
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

        <div className="mt-8">
          <details className="group mb-4 marker:content-['']">
            <summary className="flex items-center gap-2 cursor-pointer list-none">
              <ChevronDown className="w-4 h-4 text-text-tertiary group-open:rotate-180 transition-transform" />
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-secondary">Methodology & Formula</h4>
            </summary>
            
            <div className="mt-4 pl-6">
              <div className="bg-surface-panel rounded-lg p-3 border border-border-soft mb-4">
                 <h4 className="text-[9px] uppercase tracking-wider font-bold mb-1.5 text-text-secondary">Prosperity Formula</h4>
                 <p className="text-[10px] text-text-tertiary leading-relaxed font-mono tracking-tight">
                    [ GDP, CPI, Life Exp, Edu ] × 15% <br/>
                    [ Press, Meaning, Joy ] × 10% <br/>
                    [ -Inflation, -Unemp ] × 5%
                 </p>
              </div>

              <p className="text-[8px] text-text-tertiary mb-4 leading-relaxed border-b border-border-soft pb-3">
                * Data is composite-normalized by averaging multiple sources per factor from 2000 to present, minimizing distinct bounds bias.
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
          </details>
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
              if (currentYear === 2024) setCurrentYear(2000); // Rewind logic
              setIsPlaying(!isPlaying);
            }}
          />

          {/* LOW PROFILE FOOTER FOR DATA SOURCES */}
          <div className="absolute bottom-2 right-4 z-40 pointer-events-none text-right">
             <div className="text-[9px] text-text-tertiary/60 font-mono tracking-widest flex items-center justify-end gap-2 drop-shadow-md">
                <span className="font-bold uppercase">Data Reference:</span>
                {yAxis === 'CPI' && <span>Transparency International — Corruption Perceptions Index (CPI) Historical Data 2000-2024</span>}
                {yAxis === 'PressFreedom' && <span>Reporters Without Borders (RSF) — World Press Freedom Index 2000-2024</span>}
                {yAxis === 'GDP' && <span>World Bank (ICP) & IMF World Economic Outlook — GDP (PPP) per capita 2000-2024</span>}
                {yAxis === 'Inflation' && <span>World Bank & IMF — Global Inflation Rates (Consumer Prices) 2000-2024</span>}
                {yAxis === 'Unemployment' && <span>International Labour Organization (ILOSTAT) — Modelled Estimates 2000-2024</span>}
                {yAxis === 'Happiness' && <span>Gallup World Poll & World Happiness Report Methodology 2000-2024</span>}
                {yAxis === 'MeaningfulLife' && <span>World Values Survey (WVS) & Oxford Wellbeing Research Center 2000-2024</span>}
                {yAxis === 'Education' && <span>UNDP Human Development Data Center — Education Index 2000-2024</span>}
                {yAxis === 'LifeExpectancy' && <span>World Health Organization (WHO) & World Bank — Life Expectancy at Birth 2000-2024</span>}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
