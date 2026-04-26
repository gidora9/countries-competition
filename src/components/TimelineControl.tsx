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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-auto w-[90%] max-w-[500px]">
      <div className="bg-surface-glass backdrop-blur-xl border border-border-subtle shadow-[0_0_40px_rgba(0,0,0,0.3)] dark:shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-full px-6 py-4 flex items-center gap-6 w-full">
        
        <button 
          onClick={onTogglePlay}
          className="w-12 h-12 shrink-0 rounded-full bg-brand-soft hover:bg-brand-glow border border-brand-accent text-brand-accent flex items-center justify-center transition-all hover:scale-105 shadow-[0_0_15px_var(--brand-glow)]"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <div className="flex flex-col gap-2 flex-1 w-full">
          <div className="flex justify-between items-center px-1">
             <span className="text-[11px] font-mono text-text-secondary tracking-widest font-bold">2000</span>
             <span className="text-xl font-black tracking-widest text-text-primary">{currentYear}</span>
             <span className="text-[11px] font-mono text-text-secondary tracking-widest font-bold">2024</span>
          </div>
          <input 
            type="range"
            min="2000"
            max="2024"
            step="1"
            value={currentYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-border-strong rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--brand-accent)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_15px_var(--brand-glow)] hover:h-2 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
