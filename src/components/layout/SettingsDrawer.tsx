import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings, Shield, Bell, Wifi, Monitor, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDrawer = ({ open, onOpenChange }: SettingsDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col gap-0" side="right">
        <SheetHeader className="px-6 py-4 border-b border-border bg-muted/30 pt-10">
          <div className="flex items-center gap-3">
             <div className="bg-white p-2 rounded-full border border-slate-200 shadow-sm">
                 <Settings className="w-5 h-5 text-slate-600" />
             </div>
             <div className="text-left">
                 <SheetTitle>System Settings</SheetTitle>
                 <SheetDescription>
                    Configure alerts and preferences
                 </SheetDescription>
             </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Monitor className="w-4 h-4" /> Display
            </h3>
            <div className="space-y-4 rounded-lg border border-slate-200 p-4 bg-white/50">
               <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch id="dark-mode" />
               </div>
               <div className="flex items-center justify-between">
                  <Label htmlFor="compact-mode">Compact Density</Label>
                  <Switch id="compact-mode" />
               </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifications
            </h3>
             <div className="space-y-4 rounded-lg border border-slate-200 p-4 bg-white/50">
               <div className="flex items-center justify-between">
                  <Label htmlFor="crit-alerts">Critical Alerts (SMS)</Label>
                  <Switch id="crit-alerts" checked />
               </div>
               <div className="flex items-center justify-between">
                  <Label htmlFor="warn-alerts">Warning Alerts (Email)</Label>
                  <Switch id="warn-alerts" checked />
               </div>
               <div className="flex items-center justify-between">
                  <Label htmlFor="daily-report">Daily Digest</Label>
                  <Switch id="daily-report" />
               </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Wifi className="w-4 h-4" /> Sensor Network
            </h3>
             <div className="space-y-4 rounded-lg border border-slate-200 p-4 bg-white/50">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="mesh-opt">Mesh Optimization</Label>
                    <p className="text-xs text-slate-500">Auto-heal network topology</p>
                  </div>
                  <Switch id="mesh-opt" checked />
               </div>
               <div className="flex items-center justify-between">
                  <Label htmlFor="low-latency">Low Latency Mode</Label>
                  <Switch id="low-latency" />
               </div>
            </div>
          </div>
          
           <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 flex gap-3">
             <Shield className="w-5 h-5 text-yellow-600 shrink-0" />
             <div className="text-xs text-yellow-800">
               <p className="font-bold mb-1">Demo Mode Active</p>
               <p>Some settings are managed by the administrator and cannot be changed in this session.</p>
             </div>
           </div>

        </div>

        <SheetFooter className="px-6 py-4 border-t border-border bg-white flex flex-row justify-end items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
