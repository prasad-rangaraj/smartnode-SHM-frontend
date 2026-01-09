interface Structure {
  id: string;
  name: string;
  type: 'building' | 'bridge' | 'flyover';
  health: 'stable' | 'warning' | 'critical';
  sensors: { health: 'stable' | 'warning' | 'critical' }[];
}

interface HealthOverviewProps {
  structures: Structure[];
  systemHealth: number;
  selectedStructure: string | null;
  onStructureSelect?: (id: string) => void;
}

export const HealthOverview = ({ 
  structures, 
  systemHealth,
  selectedStructure,
  onStructureSelect 
}: HealthOverviewProps) => {
  const getHealthGradient = (health: 'stable' | 'warning' | 'critical') => {
    switch (health) {
      case 'stable':
        return 'from-stable/20 to-primary/10';
      case 'warning':
        return 'from-warning/25 to-accent/15';
      case 'critical':
        return 'from-critical/25 to-accent/15';
    }
  };

  const getHealthDot = (health: 'stable' | 'warning' | 'critical') => {
    switch (health) {
      case 'stable':
        return 'bg-stable';
      case 'warning':
        return 'bg-warning';
      case 'critical':
        return 'bg-critical animate-pulse';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'from-stable to-primary';
    if (health >= 60) return 'from-warning to-accent';
    return 'from-critical to-accent';
  };

  const getSensorCounts = (structure: Structure) => {
    const stable = structure.sensors.filter(s => s.health === 'stable').length;
    const warning = structure.sensors.filter(s => s.health === 'warning').length;
    const critical = structure.sensors.filter(s => s.health === 'critical').length;
    return { stable, warning, critical, total: structure.sensors.length };
  };

  return (
    <div className="fixed top-8 left-8 z-40">
      <div className="glass-panel rounded-3xl p-6 w-80">
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-stable 
            flex items-center justify-center shadow-glow-health">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-foreground">
              Structural Nervous System
            </h2>
            <p className="text-xs text-muted-foreground">
              {structures.length} structures • {structures.reduce((a, s) => a + s.sensors.length, 0)} sensors
            </p>
          </div>
        </div>

        {/* System Health Bar */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-secondary/80 to-muted/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-muted-foreground">System Health</span>
            <span className={`font-display text-2xl font-bold 
              ${systemHealth >= 80 ? 'text-stable' : systemHealth >= 60 ? 'text-warning' : 'text-critical'}`}>
              {systemHealth.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-background/50 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getHealthColor(systemHealth)} rounded-full transition-all duration-500`}
              style={{ width: `${systemHealth}%` }}
            />
          </div>
        </div>

        {/* Back Button when structure is selected */}
        {selectedStructure && (
          <button
            onClick={() => onStructureSelect?.('')}
            className="w-full mb-4 p-3 rounded-xl bg-secondary hover:bg-muted 
              flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium text-muted-foreground">Back to Overview</span>
          </button>
        )}

        {/* Structure List */}
        <div className="space-y-2">
          {structures.map((structure) => {
            const counts = getSensorCounts(structure);
            const isSelected = selectedStructure === structure.id;
            
            return (
              <button
                key={structure.id}
                onClick={() => onStructureSelect?.(structure.id)}
                className={`w-full p-4 rounded-2xl bg-gradient-to-r ${getHealthGradient(structure.health)}
                  hover:scale-[1.02] transition-all duration-200 text-left group
                  ${isSelected ? 'ring-2 ring-primary/50 scale-[1.02]' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${getHealthDot(structure.health)}`} />
                    <span className="font-display text-sm font-semibold text-foreground">
                      {structure.name}
                    </span>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-muted-foreground transition-all duration-200
                      ${isSelected ? 'rotate-90 text-primary' : 'group-hover:translate-x-0.5'}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                {/* Sensor Status Bars */}
                <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-background/30">
                  <div 
                    className="bg-stable rounded-full transition-all"
                    style={{ width: `${(counts.stable / counts.total) * 100}%` }}
                  />
                  <div 
                    className="bg-warning rounded-full transition-all"
                    style={{ width: `${(counts.warning / counts.total) * 100}%` }}
                  />
                  <div 
                    className="bg-critical rounded-full transition-all"
                    style={{ width: `${(counts.critical / counts.total) * 100}%` }}
                  />
                </div>
                
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="capitalize">{structure.type}</span>
                  <span>•</span>
                  <span>{counts.total} sensors</span>
                  {counts.warning > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-warning font-medium">{counts.warning} warning</span>
                    </>
                  )}
                  {counts.critical > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-critical font-medium">{counts.critical} critical</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Indicator */}
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-stable animate-pulse" />
            <span className="text-xs text-muted-foreground">Live Monitoring</span>
          </div>
          <span className="text-xs text-muted-foreground">Updated 2s ago</span>
        </div>
      </div>
    </div>
  );
};
