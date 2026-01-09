import { useState, useEffect } from 'react';

interface AIAssistantProps {
  message?: string;
  isActive?: boolean;
  isThinking?: boolean;
  messageType?: 'info' | 'warning' | 'critical' | 'prediction';
}

export const AIAssistant = ({ 
  message, 
  isActive = false, 
  isThinking = false,
  messageType = 'info' 
}: AIAssistantProps) => {
  const [displayMessage, setDisplayMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (message && isActive && !isThinking) {
      setIsTyping(true);
      let index = 0;
      setDisplayMessage('');
      
      const interval = setInterval(() => {
        if (index < message.length) {
          setDisplayMessage((prev) => prev + message[index]);
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 20);

      return () => clearInterval(interval);
    } else if (isThinking) {
      setDisplayMessage('');
    }
  }, [message, isActive, isThinking]);

  const messageColors = {
    info: 'from-primary/10 to-stable/10 border-primary/20',
    warning: 'from-warning/10 to-accent/10 border-warning/30',
    critical: 'from-critical/10 to-accent/10 border-critical/30',
    prediction: 'from-neural/10 to-primary/10 border-neural/30',
  };

  const orbColors = {
    info: 'from-primary to-stable',
    warning: 'from-warning to-accent',
    critical: 'from-critical to-accent',
    prediction: 'from-neural to-primary',
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* AI Message Bubble */}
      {isActive && (displayMessage || isThinking) && (
        <div
          className={`absolute bottom-20 right-0 w-96 glass-panel rounded-2xl p-5
            animate-scale-in origin-bottom-right border
            bg-gradient-to-br ${messageColors[messageType]}`}
        >
          {/* Message Type Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${orbColors[messageType]}`} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {messageType === 'prediction' ? 'AI Prediction' : `${messageType} Alert`}
            </span>
          </div>

          {isThinking ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-muted-foreground">Analyzing patterns...</span>
            </div>
          ) : (
            <p className="font-body text-sm text-foreground leading-relaxed">
              {displayMessage}
              {isTyping && <span className="inline-block w-0.5 h-4 ml-0.5 bg-primary animate-pulse" />}
            </p>
          )}
        </div>
      )}

      {/* AI Orb */}
      <div className="relative">
        {/* Outer glow rings */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700
            ${isActive ? 'scale-[2] opacity-20' : 'scale-100 opacity-0'}
            bg-gradient-to-br ${orbColors[messageType]}`}
        />
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500
            ${isActive ? 'scale-[1.5] opacity-30' : 'scale-100 opacity-0'}
            bg-gradient-to-br ${orbColors[messageType]}`}
        />
        
        {/* Main orb */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`relative w-16 h-16 rounded-full cursor-pointer
            flex items-center justify-center transition-all duration-300
            bg-gradient-to-br ${orbColors[messageType]}
            shadow-lg hover:scale-110
            ${isActive ? 'scale-110' : ''}`}
          style={{
            boxShadow: isActive 
              ? '0 0 40px -5px hsla(175, 65%, 40%, 0.5)' 
              : '0 0 20px -5px hsla(175, 65%, 40%, 0.3)',
          }}
        >
          {/* Inner light */}
          <div className="w-5 h-5 rounded-full bg-white/70 blur-sm" />
          
          {/* Pulse rings when active */}
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />
              <div
                className="absolute inset-0 rounded-full border border-white/10 animate-ping"
                style={{ animationDelay: '0.5s' }}
              />
            </>
          )}
        </button>

        {/* Label */}
        <div
          className={`absolute -left-20 top-1/2 -translate-y-1/2 whitespace-nowrap
            transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
        >
          <span className="text-xs font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded-full">
            AI Active
          </span>
        </div>
      </div>
    </div>
  );
};
