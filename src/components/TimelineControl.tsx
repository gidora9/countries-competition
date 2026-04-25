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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-auto">
      <div className="bg-surface-glass backdrop-blur-xl border border-border-subtle shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-full px-6 py-3 flex items-center gap-6">
        
        <button 
          onClick={onTogglePlay}
          className="w-10 h-10 shrink-0 rounded-full bg-brand-soft hover:bg-brand-glow border border-brand-accent text-brand-accent flex items-center justify-center transition-all hover:scale-105 shadow-[0_0_15px_var(--brand-glow)]"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <div className="flex flex-col gap-1 w-[280px] sm:w-[400px]">
          <div className="flex justify-between items-center px-1">
             <span className="text-[10px] font-mono text-text-secondary tracking-widest">2014</span>
             <span className="text-[14px] font-black tracking-widest text-text-primary">{currentYear}</span>
             <span className="text-[10px] font-mono text-text-secondary tracking-widest">2024</span>
          </div>
          <input 
            type="range"
            min="2014"
            max="2024"
            step="1"
            value={currentYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="w-full h-1 bg-border-strong rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[var(--brand-accent)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--brand-glow)]"
          />
        </div>

      </div>
    </div>
  );
}
