import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommandMenuProps {
  onSearch: (q: string) => void;
}

export default function CommandMenu({ onSearch }: CommandMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        onSearch('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onSearch]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  return (
    <div className="relative z-50">
      <AnimatePresence mode="wait">
      {!isOpen ? (
        <motion.button 
          key="closed"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-surface-hover border border-border-soft rounded-full px-5 py-2 flex items-center gap-3 hover:bg-brand-soft hover:border-brand-glow transition-all cursor-pointer hover:scale-[1.02] shadow-[0_0_0_transparent] hover:shadow-[0_0_15px_var(--brand-glow)] group"
        >
          <span className="text-text-tertiary text-[10px] tracking-widest group-hover:text-brand-accent transition-colors">[ ⌘ K ]</span>
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Search countries...</span>
        </motion.button>
      ) : (
        <motion.div 
          key="open"
          initial={{ opacity: 0, width: 200 }}
          animate={{ opacity: 1, width: 300 }}
          exit={{ opacity: 0, width: 200 }}
          className="absolute right-0 top-0 flex items-center gap-3 px-4 py-2 bg-surface-panel border border-brand-accent shadow-[0_0_20px_var(--brand-glow)] rounded-full transition-all min-w-[250px]"
        >
          <Search className="w-4 h-4 text-brand-accent animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a country name..."
            className="flex-1 bg-transparent border-none outline-none text-text-primary font-mono text-sm placeholder:text-text-tertiary min-w-0"
            value={query}
            onChange={handleChange}
            onBlur={() => {
              if (!query) setIsOpen(false);
            }}
          />
          <button 
            onClick={() => { setIsOpen(false); setQuery(''); onSearch(''); }}
            className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-border-strong hover:bg-brand-accent hover:text-surface-panel text-text-secondary text-xs transition-colors"
          >
            X
          </button>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
