import React from 'react';
import { Play, Pause } from 'lucide-react';

interface Props {
  currentYear: number;
  isPlaying: boolean;
  onYearChange: (val: number) => void;
  onTogglePlay: () => void;
}

export default function TimelineControl({ currentYear, isPlaying, onYearChange, onTogglePlay }: Props) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-auto w-[98%] max-w-[1200px]">
      <div className="bg-surface-glass backdrop-blur-xl border border-border-subtle shadow-[0_0_40px_rgba(0,0,0,0.3)] dark:shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-full px-6 py-2 flex items-center gap-6 w-full">
        
        <button 
          onClick={onTogglePlay}
          className="w-8 h-8 shrink-0 rounded-full bg-brand-soft hover:bg-brand-glow border border-brand-accent text-brand-accent flex items-center justify-center transition-all hover:scale-105 shadow-[0_0_15px_var(--brand-glow)]"
        >
          {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
        </button>

        <div className="flex flex-col gap-1.5 flex-1 w-full">
          <div className="flex justify-between items-center px-1">
             <span className="text-[10px] font-mono text-text-secondary tracking-widest font-bold">2000</span>
             <span className="text-lg font-black tracking-widest text-text-primary leading-none">{currentYear}</span>
             <span className="text-[10px] font-mono text-text-secondary tracking-widest font-bold">2026</span>
          </div>
          <input 
            type="range"
            min="2000"
            max="2026"
            step="1"
            value={currentYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="w-full h-1 bg-border-strong rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[var(--brand-accent)] [&::-webkit-slider-thumb]:rounded-full hover:h-1.5 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
