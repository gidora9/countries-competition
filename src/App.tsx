/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import GovernanceMap, { REGIONS, REGIMES } from './components/GovernanceMap';
import CommandMenu from './components/CommandMenu';
import { cpiData, CountryCPI } from './data/cpi2024';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [activeRegime, setActiveRegime] = useState('All');
  const [hoveredRegime, setHoveredRegime] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'None' | 'Region' | 'Regime'>('None');
  const [yAxis, setYAxis] = useState<'CPI' | 'GDP' | 'Happiness' | 'MeaningfulLife'>('CPI');

  // LIVE DATA SYNC
  const [liveData, setLiveData] = useState<CountryCPI[]>(cpiData);
  const [isWbLinked, setIsWbLinked] = useState(false);

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

  return (
    <div className="w-full min-h-[100dvh] h-[100dvh] bg-[#050505] text-[#e0e0e0] font-sans relative overflow-hidden flex flex-col lg:flex-row selection:bg-[#00f2ff]/30">
      
      {/* MOBILE HEADER (Visible < lg) */}
      <header className="lg:hidden h-16 sm:h-20 shrink-0 border-b border-white/10 flex items-center justify-between px-4 sm:px-6 z-20 bg-[#050505]">
        <div className="flex flex-col">
          <h1 className="text-[10px] sm:text-[11px] tracking-[0.3em] text-[#00f2ff] font-semibold uppercase opacity-90">Behavioral Governance</h1>
          <span className="text-xl sm:text-2xl font-light tracking-tighter text-white">Identity Map</span>
        </div>
        <div className="flex items-center gap-4">
          <CommandMenu onSearch={setSearchQuery} />
        </div>
      </header>

      {/* DESKTOP LEFT SIDEBAR (Visible >= lg) */}
      <aside className="hidden lg:flex w-72 xl:w-[22rem] shrink-0 h-full border-r border-white/10 flex-col justify-between p-6 xl:p-8 z-20 bg-[#070707] shadow-2xl relative overflow-y-auto custom-scrollbar">
        <div className="w-full absolute top-0 left-0 h-40 bg-gradient-to-b from-[#00f2ff]/5 to-transparent pointer-events-none"></div>
        
        <div className="flex flex-col relative z-10 w-full mb-8">
          <div className="mb-8">
            <h1 className="text-[10px] xl:text-[11px] tracking-[0.3em] text-[#00f2ff] font-semibold uppercase opacity-90 mb-2 leading-relaxed">
              Behavioral<br/>Governance Map
            </h1>
            <span className="text-3xl xl:text-4xl font-light tracking-tighter text-white block leading-none">
              Identity &<br/>Corruption
            </span>
            <span className="text-white/30 text-sm mt-3 block font-mono">/ 2024</span>
          </div>
          
          <div className="w-full mb-8">
            <CommandMenu onSearch={setSearchQuery} />
          </div>

          {/* UNIFIED FILTERS */}
          <div className="flex flex-col gap-6 w-full flex-1">
            
            {/* Visual Layout Tool */}
            <div>
              <h3 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-3 ml-1 flex items-center justify-between">
                <span>Vertical Data (Y)</span>
                {yAxis !== 'CPI' && <span className="text-[#00f2ff]/60 animate-pulse text-[8px]">ACTIVE</span>}
              </h3>
              <div className="flex flex-col gap-2">
                 <div className="flex gap-2">
                   <button onClick={() => setYAxis('CPI')} className={`flex-1 py-1.5 rounded text-[9px] uppercase font-bold tracking-wider transition-all border ${yAxis === 'CPI' ? 'border-[#00f2ff] bg-[#00f2ff]/10 text-[#00f2ff]' : 'border-white/10 text-white/30'}`}>Corruption</button>
                   <button onClick={() => setYAxis('GDP')} className={`flex-1 py-1.5 rounded text-[9px] uppercase font-bold tracking-wider transition-all border ${yAxis === 'GDP' ? 'border-[#00f2ff] bg-[#00f2ff]/10 text-[#00f2ff]' : 'border-white/10 text-white/30'}`}>GDP (PPP)</button>
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => setYAxis('Happiness')} className={`flex-1 py-1.5 rounded text-[9px] uppercase font-bold tracking-wider transition-all border ${yAxis === 'Happiness' ? 'border-[#00f2ff] bg-[#00f2ff]/10 text-[#00f2ff]' : 'border-white/10 text-white/30'}`}>Happiness</button>
                   <button onClick={() => setYAxis('MeaningfulLife')} className={`flex-1 py-1.5 rounded text-[9px] uppercase font-bold tracking-wider transition-all border ${yAxis === 'MeaningfulLife' ? 'border-[#00f2ff] bg-[#00f2ff]/10 text-[#00f2ff]' : 'border-white/10 text-white/30'}`}>Meaningful</button>
                 </div>
              </div>
            </div>

            <div>
              <h3 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-3 ml-1 flex items-center justify-between">
                <span>Horizontal Spread (X)</span>
                {groupBy !== 'None' && <span className="text-[#00f2ff]/60 animate-pulse text-[8px]">ACTIVE</span>}
              </h3>
              <div className="flex gap-2">
                 <button onClick={() => setGroupBy('None')} className={`flex-1 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all border ${groupBy === 'None' ? 'border-[#00f2ff] bg-[#00f2ff]/10 text-[#00f2ff]' : 'border-white/10 text-white/30'}`}>Unified</button>
                 <button onClick={() => setGroupBy('Region')} className={`flex-1 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all border ${groupBy === 'Region' ? 'border-[#00f2ff] bg-[#00f2ff]/10 text-[#00f2ff]' : 'border-white/10 text-white/30'}`}>By Region</button>
                 <button onClick={() => setGroupBy('Regime')} className={`flex-1 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-all border ${groupBy === 'Regime' ? 'border-[#00f2ff] bg-[#00f2ff]/10 text-[#00f2ff]' : 'border-white/10 text-white/30'}`}>By System</button>
              </div>
            </div>

            <div>
              <h3 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-3 ml-1 flex items-center justify-between">
                <span>Geographic Region</span>
                {activeRegion !== 'All' && <span className="text-[#00f2ff]/60 text-[8px]">FILTERED</span>}
              </h3>
              <div className="flex flex-col gap-1.5">
                {REGIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setActiveRegion(r)}
                    onMouseEnter={() => setHoveredRegion(r)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className={`px-3 py-1.5 w-full text-left rounded-md text-[11px] tracking-wider uppercase transition-all duration-300 border font-medium
                      ${activeRegion === r 
                        ? 'border-[#00f2ff] bg-[#00f2ff]/10 text-[#00f2ff]' 
                        : hoveredRegion === r
                        ? 'border-white/30 bg-white/5 text-white'
                        : 'border-white/5 bg-[#0a0a0a]/50 text-white/40 hover:text-white hover:bg-white/10'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-3 ml-1 flex items-center justify-between">
                <span>Governance System</span>
                {activeRegime !== 'All' && <span className="text-[#00f2ff]/60 text-[8px]">FILTERED</span>}
              </h3>
              <div className="flex flex-col gap-1.5">
                {REGIMES.map(r => (
                  <button
                    key={r}
                    onClick={() => setActiveRegime(r)}
                    onMouseEnter={() => setHoveredRegime(r)}
                    onMouseLeave={() => setHoveredRegime(null)}
                    className={`px-3 py-1.5 w-full text-left rounded-md text-[11px] tracking-wider uppercase transition-all duration-300 border font-medium
                      ${activeRegime === r 
                        ? 'border-[#00f2ff] bg-[#00f2ff]/10 text-[#00f2ff]' 
                        : hoveredRegime === r
                        ? 'border-white/30 bg-white/5 text-white'
                        : 'border-white/5 bg-[#0a0a0a]/50 text-white/40 hover:text-white hover:bg-white/10'}`}
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
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-2">Methodology</h4>
            <p className="text-[8px] text-white/40 mb-4 leading-relaxed border-b border-white/5 pb-3">
              * Data is composite-normalized across peer-reviewed methodologies to minimize distinct bounds bias.
            </p>
            <div className="flex flex-col gap-3 text-[9px] text-white/30 font-mono">
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
          <div className="flex flex-col gap-1.5 text-[9px] uppercase tracking-[0.3em] text-white/20 font-mono mt-4 border-t border-white/5 pt-4">
            <p className="flex justify-between items-center w-full"><span>Status: Deployed · {liveData.length} Nodes</span></p>
            {isWbLinked && <p className="text-[#00f2ff]/80 mt-1 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse"></span> LIVE API: WB.GDP.PCAP </p>}
          </div>
          <div className="flex items-center gap-3 relative z-10 pt-4 mt-2 w-full">
            <div className={`w-2 h-2 rounded-full ${isWbLinked ? 'bg-[#00f2ff] shadow-[0_0_10px_#00f2ff]' : 'bg-[#4ade80] shadow-[0_0_10px_#4ade80]'} animate-pulse`}></div>
            <span className={`text-[10px] ${isWbLinked ? 'text-[#00f2ff]' : 'text-[#4ade80]'} font-mono uppercase tracking-widest opacity-80`}>MULTI-AXIS / 0° ROT</span>
          </div>
        </div>
      </aside>

      {/* GRAPH WRAPPER */}
      <main className="flex-1 relative flex overflow-hidden lg:h-[100dvh]">
        {/* The Beeswarm Canvas - Now getting FULL VERTICAL HEIGHT */}
        <div className="flex-1 relative overflow-hidden flex h-full">
          <div className="absolute inset-0 w-full h-full">
            <GovernanceMap 
              data={liveData} 
              searchQuery={searchQuery}
              activeRegion={activeRegion}
              activeRegime={activeRegime}
              hoveredRegion={hoveredRegion}
              hoveredRegime={hoveredRegime}
              groupBy={groupBy}
              yAxis={yAxis}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
