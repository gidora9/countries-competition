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

          <div className="p-3 flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
            {countries.map((country, idx) => (
              <div key={country.id} className="relative flex-none w-full bg-surface-canvas border border-border-subtle rounded-lg p-2.5 flex items-center justify-between group transition-all hover:border-border-strong hover:shadow-sm">
                
                <div className="flex items-center gap-3 w-full pr-4 overflow-hidden">
                  <img src={getFlagUrl(country.id)} alt="Flag" className="w-6 h-6 rounded-full border border-border-strong object-cover shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-text-primary truncate" title={country.name}>{country.name}</h4>
                    <span className="text-[9px] uppercase tracking-wider text-text-tertiary truncate">Prosp: {country.prosperityScore?.toFixed(0)} | CPI: {country.score}</span>
                  </div>
                </div>

                <button 
                  onClick={() => onRemove(country.id)} 
                  className="shrink-0 p-1 bg-surface-hover text-text-tertiary hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
