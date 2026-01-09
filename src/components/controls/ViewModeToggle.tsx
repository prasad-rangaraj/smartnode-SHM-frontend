import { useState } from 'react';

type ViewMode = 'overview' | 'heatmap' | 'neural';

interface ViewModeToggleProps {
  onModeChange?: (mode: ViewMode) => void;
}

export const ViewModeToggle = ({ onModeChange }: ViewModeToggleProps) => {
  const [activeMode, setActiveMode] = useState<ViewMode>('overview');

  const modes: { id: ViewMode; label: string; icon: JSX.Element }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'heatmap',
      label: 'Stress Field',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
    },
    {
      id: 'neural',
      label: 'Neural',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  const handleModeChange = (mode: ViewMode) => {
    setActiveMode(mode);
    onModeChange?.(mode);
  };

  return (
    <div className="fixed top-8 right-8 z-40">
      <div className="glass-panel rounded-2xl p-1.5 flex gap-1">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200
              ${activeMode === mode.id 
                ? 'bg-primary text-primary-foreground shadow-glow-health' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
          >
            {mode.icon}
            <span className="font-display text-sm font-medium">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
