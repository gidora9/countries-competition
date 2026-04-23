import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

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
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-white/5 border border-white/10 rounded-full px-5 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="text-white/40 text-[10px] tracking-widest">[ ⌘ K ]</span>
          <span className="text-sm text-white/60">Search countries...</span>
        </button>
      ) : (
        <div className="absolute right-0 top-0 flex items-center gap-3 px-4 py-2 bg-[#0a0a0a] border border-[#00f2ff]/30 shadow-[0_0_20px_rgba(0,242,255,0.1)] rounded-full transition-all min-w-[250px]">
          <Search className="w-4 h-4 text-[#00f2ff]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a country name..."
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-white/30 min-w-0"
            value={query}
            onChange={handleChange}
            onBlur={() => {
              if (!query) setIsOpen(false);
            }}
          />
          <button 
            onClick={() => { setIsOpen(false); setQuery(''); onSearch(''); }}
            className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/50 text-xs"
          >
            X
          </button>
        </div>
      )}
    </div>
  );
}
