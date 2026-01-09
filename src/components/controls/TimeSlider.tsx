import { useState } from 'react';

interface TimeSliderProps {
  onTimeChange?: (time: number) => void;
}

export const TimeSlider = ({ onTimeChange }: TimeSliderProps) => {
  const [currentTime, setCurrentTime] = useState(100); // Percentage
  const [isPlaying, setIsPlaying] = useState(false);

  const timeLabels = ['24h ago', '12h ago', '6h ago', '3h ago', '1h ago', 'Now'];

  const handleTimeChange = (value: number) => {
    setCurrentTime(value);
    onTimeChange?.(value);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
      <div className="glass-panel px-6 py-4 rounded-2xl min-w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-xs font-medium text-muted-foreground">
            Time Dimension
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 
              flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <div className="flex gap-0.5">
                <div className="w-1 h-3 bg-primary rounded-full" />
                <div className="w-1 h-3 bg-primary rounded-full" />
              </div>
            ) : (
              <div className="w-0 h-0 border-l-[6px] border-l-primary border-y-[4px] border-y-transparent ml-0.5" />
            )}
          </button>
        </div>

        {/* Slider Track */}
        <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
          {/* Progress */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-stable rounded-full"
            style={{ width: `${currentTime}%` }}
          />

          {/* Event markers */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-warning"
            style={{ left: '35%' }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent"
            style={{ left: '62%' }}
          />

          {/* Slider input */}
          <input
            type="range"
            min="0"
            max="100"
            value={currentTime}
            onChange={(e) => handleTimeChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white 
              border-2 border-primary shadow-lg pointer-events-none transition-all"
            style={{ left: `calc(${currentTime}% - 8px)` }}
          />
        </div>

        {/* Time Labels */}
        <div className="flex justify-between mt-2">
          {timeLabels.map((label, i) => (
            <span
              key={label}
              className={`text-xs transition-colors ${
                i === timeLabels.length - 1 && currentTime > 90
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
