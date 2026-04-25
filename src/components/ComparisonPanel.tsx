import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { CountryCPI } from '../data/cpi2024';
import { getFlagUrl } from '../lib/utils';

interface Props {
  countries: CountryCPI[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

export default function ComparisonPanel({ countries, onClose, onRemove }: Props) {
  if (countries.length === 0) return null;

  const MetricRow = ({ label, val1, val2, format }: any) => {
    const diff = val1 - val2;
    // Higher is better for all our core metrics (CPI, GDP, Happiness, Meaning)
    const color1 = diff === 0 ? 'text-text-secondary' : diff > 0 ? 'text-[#4ade80] dark:drop-shadow-[0_0_8px_rgba(74,222,128,0.4)] drop-shadow-[0_0_8px_rgba(74,222,128,0.2)]' : 'text-text-tertiary';
    const color2 = diff === 0 ? 'text-text-secondary' : diff < 0 ? 'text-[#4ade80] dark:drop-shadow-[0_0_8px_rgba(74,222,128,0.4)] drop-shadow-[0_0_8px_rgba(74,222,128,0.2)]' : 'text-text-tertiary';
    
    return (
      <div className="flex items-center justify-between py-2 border-b border-border-soft text-sm font-mono">
        <div className={`flex-1 text-right pr-4 font-bold ${color1}`}>{format(val1)}</div>
        <div className="w-1/3 text-center text-[9px] uppercase tracking-[0.2em] text-text-secondary">{label}</div>
        <div className={`flex-1 text-left pl-4 font-bold ${color2}`}>{format(val2)}</div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="absolute bottom-24 left-4 right-4 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:w-[800px] z-[60]"
      >
        <div className="bg-surface-glass backdrop-blur-3xl border border-brand-glow shadow-[0_0_40px_var(--brand-soft)] rounded-2xl overflow-hidden flex flex-col pointer-events-auto">
          
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-surface-hover">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-accent">Data Comparison Engine</span>
            <button onClick={onClose} className="p-1 hover:bg-border-soft text-text-secondary hover:text-text-primary rounded-md transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 sm:p-6 pt-5">
            {countries.length === 1 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <img src={getFlagUrl(countries[0].id)} alt="Flag" className="w-12 h-12 rounded-full border border-border-strong mb-3 object-cover shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                <h3 className="text-lg font-medium text-text-primary mb-1 tracking-tight">{countries[0].name} Locked in Buffer</h3>
                <p className="text-xs font-mono tracking-widest uppercase text-brand-accent opacity-80 animate-pulse mt-2">Select a second node from the map to benchmark...</p>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  
                  {/* Country 1 */}
                  <div className="flex flex-col items-center gap-3 flex-1 relative group">
                    <button onClick={() => onRemove(countries[0].id)} className="absolute top-0 left-0 p-1 bg-rose-500/10 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-500/20 rounded-full transition-all cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                    <img src={getFlagUrl(countries[0].id)} alt="Flag" className="w-14 h-14 rounded-full border-2 border-border-strong object-cover shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform" />
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-text-primary leading-tight mb-1.5">{countries[0].name}</h4>
                      <span className="text-[9px] uppercase tracking-[0.2em] text-brand-accent bg-brand-soft border border-brand-glow px-2 py-0.5 rounded-full">{countries[0].regimeType}</span>
                    </div>
                  </div>

                  <div className="text-text-tertiary font-bold text-xl tracking-tighter px-4">VS</div>

                  {/* Country 2 */}
                  <div className="flex flex-col items-center gap-3 flex-1 relative group">
                    <button onClick={() => onRemove(countries[1].id)} className="absolute top-0 right-0 p-1 bg-rose-500/10 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-500/20 rounded-full transition-all cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                    <img src={getFlagUrl(countries[1].id)} alt="Flag" className="w-14 h-14 rounded-full border-2 border-border-strong object-cover shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform" />
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-text-primary leading-tight mb-1.5">{countries[1].name}</h4>
                      <span className="text-[9px] uppercase tracking-[0.2em] text-brand-accent bg-brand-soft border border-brand-glow px-2 py-0.5 rounded-full">{countries[1].regimeType}</span>
                    </div>
                  </div>

                </div>

                <div className="flex flex-col border-t border-border-subtle pt-3">
                   <MetricRow label="Clean Governance CPI" val1={countries[0].score} val2={countries[1].score} format={(v: number) => v.toString()} />
                   <MetricRow label="Macro GDP (PPP)" val1={countries[0].gdpPpp} val2={countries[1].gdpPpp} format={(v: number) => `$${(v/1000).toFixed(1)}k`} />
                   <MetricRow label="Subjective Happiness" val1={countries[0].happiness} val2={countries[1].happiness} format={(v: number) => v.toFixed(1)} />
                   <MetricRow label="Meaningful Life" val1={countries[0].meaningfulLife} val2={countries[1].meaningfulLife} format={(v: number) => `${v.toFixed(1)}%`} />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
