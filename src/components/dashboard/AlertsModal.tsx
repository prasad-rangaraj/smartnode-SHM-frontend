import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, AlertCircle, Info, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  structureName: string;
  sensorName: string;
  timestamp: Date;
}

interface AlertsModalProps {
  alerts: Alert[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export const AlertsModal = ({ alerts, open, onOpenChange, onDismiss, onClearAll }: AlertsModalProps) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-critical" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getAlertClass = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-critical/5 border-l-4 border-critical';
      case 'warning':
        return 'bg-warning/5 border-l-4 border-warning';
      default:
        return 'bg-primary/5 border-l-4 border-primary';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded-full border border-border">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                 <DialogTitle className="text-xl">System Alerts</DialogTitle>
                 <DialogDescription>
                    {alerts.length} active notification{alerts.length !== 1 ? 's' : ''} requiring attention
                 </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative min-h-[300px]">
           {alerts.length > 0 ? (
             <ScrollArea className="h-full w-full">
               <div className="flex flex-col p-6 gap-3">
                 {alerts.map((alert) => (
                   <div 
                     key={alert.id}
                     className={`rounded-md p-4 border border-t-0 border-r-0 border-b-0 shadow-sm ${getAlertClass(alert.type)} bg-card transition-all hover:bg-muted/50`}
                   >
                     <div className="flex items-start gap-3">
                       <div className="mt-0.5">
                         {getAlertIcon(alert.type)}
                       </div>
                       
                       <div className="flex-1 min-w-0">
                         <div className="flex items-start justify-between gap-4">
                           <div>
                             <h4 className="font-semibold text-sm text-foreground">{alert.title}</h4>
                             <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                           </div>
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0 -mt-1 -mr-1"
                             onClick={() => onDismiss(alert.id)}
                           >
                             <X className="w-4 h-4" />
                           </Button>
                         </div>
                         
                         <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-background rounded border border-border/50">
                             <span className="font-medium text-foreground">{alert.structureName}</span>
                             <span>•</span>
                             <span>{alert.sensorName}</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <Clock className="w-3 h-3" />
                             {formatTime(alert.timestamp)}
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </ScrollArea>
           ) : (
             <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-foreground">All Clear</h3>
                <p className="max-w-xs mx-auto mt-1">There are no active system alerts at the moment.</p>
             </div>
           )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {alerts.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={onClearAll}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
