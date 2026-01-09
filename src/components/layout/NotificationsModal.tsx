import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Bell, Info, CheckCircle2, AlertTriangle, AlertCircle, Calendar, FileText, Settings, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Notification {
  id: string;
  type: 'alert' | 'update' | 'info' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
}

interface NotificationsModalProps {
  notifications: Notification[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationsModal = ({ notifications, open, onOpenChange, onDismiss, onClearAll }: NotificationsModalProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'update':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'system':
        return <Settings className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgClass = (type: string) => {
     switch (type) {
        case 'alert': return 'bg-warning/5';
        case 'update': return 'bg-blue-50';
        case 'system': return 'bg-purple-50';
        default: return 'bg-gray-50';
     }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
             <div className="bg-white p-2 rounded-full border border-slate-200 shadow-sm">
                 <Bell className="w-5 h-5 text-slate-600" />
             </div>
             <div>
                 <DialogTitle>Notifications</DialogTitle>
                 <DialogDescription>
                    Recent network activity and updates
                 </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative min-h-[300px] bg-slate-50/50">
           {notifications.length > 0 ? (
             <ScrollArea className="h-full w-full">
               <div className="flex flex-col p-4 gap-3">
                 {notifications.map((note) => (
                   <div 
                     key={note.id}
                     className={`relative group bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all ${!note.read ? 'border-l-4 border-l-primary' : ''}`}
                   >
                     <div className="flex items-start gap-3">
                       <div className={`p-2 rounded-full shrink-0 ${getBgClass(note.type)}`}>
                         {getIcon(note.type)}
                       </div>
                       
                       <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start">
                             <h4 className={`text-sm font-semibold text-slate-900 ${!note.read ? 'font-bold' : ''}`}>
                               {note.title}
                             </h4>
                             <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                               {formatTime(note.timestamp)}
                             </span>
                         </div>
                         <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                           {note.message}
                         </p>
                       </div>
                     </div>
                     
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         onDismiss(note.id);
                       }}
                       className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 transition-all"
                     >
                       <X className="w-3 h-3" />
                     </button>
                   </div>
                 ))}
               </div>
             </ScrollArea>
           ) : (
             <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-300">
                  <Bell className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-sm font-medium text-slate-900">No new notifications</h3>
                <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
             </div>
           )}
        </div>

        <DialogFooter className="px-6 py-3 border-t border-border bg-white flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">
               {notifications.length} Unread
            </span>
            <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                  Done
                </Button>
                {notifications.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onClearAll}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
