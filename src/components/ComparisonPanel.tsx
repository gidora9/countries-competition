import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CountryCPI } from '../data/cpi2024';
import { getFlagUrl } from '../lib/utils';

interface Props {
  countries: CountryCPI[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

export default function ComparisonPanel({ countries, onClose, onRemove }: Props) {
  if (countries.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="w-full mt-6"
      >
        <div className="bg-surface-glass backdrop-blur-3xl border border-brand-glow shadow-[0_0_20px_var(--brand-soft)] rounded-xl overflow-hidden flex flex-col pointer-events-auto">
          
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-surface-hover">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-accent">Traced Nodes</span>
              <span className="text-[9px] uppercase tracking-[0.2em] bg-brand-soft border border-brand-glow text-brand-accent px-1.5 py-0.5 rounded-full shadow-[0_0_8px_var(--brand-glow)]">
                {countries.length}
              </span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-border-soft text-text-secondary hover:text-text-primary rounded-md transition-colors cursor-pointer ml-4">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {countries.map((country, idx) => (
              <div key={country.id} className="relative flex-none w-full bg-surface-canvas border border-border-subtle rounded-xl p-3 flex flex-col group transition-all hover:border-border-strong hover:shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                <button 
                  onClick={() => onRemove(country.id)} 
                  className="absolute top-2 right-2 p-1 bg-surface-hover text-text-tertiary hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
                
                <div className="flex items-center gap-3 mb-3">
                  <img src={getFlagUrl(country.id)} alt="Flag" className="w-8 h-8 rounded-full border border-border-strong object-cover shadow-sm shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-xs font-bold text-text-primary leading-tight truncate w-full" title={country.name}>{country.name}</h4>
                    <span className="text-[8px] uppercase tracking-[0.2em] text-text-tertiary mt-0.5 truncate">{country.regimeType.replace('Democracy', 'Dem.')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-auto text-xs font-mono">
                  <div className="flex justify-between items-center bg-surface-panel p-1 rounded">
                    <span className="text-[9px] uppercase tracking-wider text-text-tertiary font-sans font-bold">Prosp Idx</span>
                    <span className="font-bold text-text-primary">{country.prosperityScore?.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-panel p-1 rounded">
                    <span className="text-[9px] uppercase tracking-wider text-text-tertiary font-sans font-bold">CPI</span>
                    <span className="font-bold text-text-primary">{country.score.toString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-panel p-1 rounded">
                    <span className="text-[9px] uppercase tracking-wider text-text-tertiary font-sans font-bold">GDP</span>
                    <span className="font-bold text-text-primary">${(country.gdpPpp/1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
