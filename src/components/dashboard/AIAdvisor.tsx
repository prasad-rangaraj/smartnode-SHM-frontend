import { Bot, Sparkles, AlertTriangle, TrendingUp, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface AIAdvisorProps {
  message: string;
  isActive: boolean;
  isThinking: boolean;
  messageType: 'info' | 'warning' | 'critical' | 'prediction';
  onGenerateReport?: () => void;
  onViewPredictions?: () => void;
  onAskAI?: () => void;
}

export const AIAdvisor = ({ 
  message, 
  isActive, 
  isThinking, 
  messageType,
  onGenerateReport,
  onViewPredictions,
  onAskAI
}: AIAdvisorProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if ((messageType === 'warning' || messageType === 'critical') && message) {
      toast({
        title: "Structure Warning",
        description: message,
        variant: "destructive",
      });
    }
  }, [messageType, message, toast]);

  const handleStatusClick = () => {
    if (message) {
      toast({
        title: "Structure Status",
        description: message,
        variant: messageType === 'critical' || messageType === 'warning' ? "destructive" : "default",
      });
    }
  };

  const getTypeStyles = () => {
    switch (messageType) {
      case 'critical':
        return 'border-critical bg-critical/5';
      case 'warning':
        return 'border-warning bg-warning/5';
      case 'prediction':
        return 'border-neural bg-neural/5';
      default:
        return 'border-primary bg-primary/5';
    }
  };

  const getIcon = () => {
    switch (messageType) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-critical" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'prediction':
        return <TrendingUp className="w-5 h-5 text-neural" />;
      default:
        return <MessageSquare className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="gov-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-primary text-primary-foreground flex items-center gap-3">
        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm">AI Infrastructure Advisor</h3>
        </div>
        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
          isActive ? 'bg-stable/20 text-stable' : 'bg-primary-foreground/20 text-primary-foreground/70'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isActive ? 'bg-stable animate-pulse' : 'bg-primary-foreground/50'
          }`} />
          {isActive ? 'Analyzing' : 'Standby'}
        </div>
      </div>

      {/* Message Area */}
      <div className="p-4">
        {isThinking ? (
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-muted-foreground">Analyzing sensor data...</span>
          </div>
        ) : message ? (
          <div 
            onClick={handleStatusClick}
            className={`p-4 rounded-sm border-l-4 ${getTypeStyles()} cursor-pointer hover:opacity-90 transition-opacity`}
          >
            <div className="flex items-start gap-3">
              {getIcon()}
              <div className="flex-1">
                <p className="text-sm text-foreground leading-relaxed">{message}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Monitoring system health. Insights will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 bg-muted/30 border-t border-border flex items-center gap-2">
        <button 
          onClick={onGenerateReport}
          className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors"
        >
          Generate Report
        </button>
        <button 
          onClick={onViewPredictions}
          className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-sm hover:bg-secondary/80 transition-colors"
        >
          View Predictions
        </button>
        <button 
          onClick={onAskAI}
          className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-sm hover:bg-secondary/80 transition-colors"
        >
          Ask AI
        </button>
      </div>
    </div>
  );
};
