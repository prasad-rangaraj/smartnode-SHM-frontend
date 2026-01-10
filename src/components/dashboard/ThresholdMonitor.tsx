import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldAlert } from "lucide-react";

export const ThresholdMonitor = () => {
    const { structures } = useAppStore();
    const [criticalAlert, setCriticalAlert] = useState<{
        structureName: string;
        sensorName: string;
        value: number;
        threshold: number;
        type: string;
    } | null>(null);

    const [snoozeUntil, setSnoozeUntil] = useState<number>(0);

    useEffect(() => {
        // Check snooze timer
        if (Date.now() < snoozeUntil) return;

        // Thresholds
        const THRESHOLDS = {
            vibration: 80, // Hz
            strain: 600,   // µε
            temperature: 45 // °C
        };

        // Scan for new critical values
        for (const structure of structures) {
            for (const sensor of structure.sensors) {
                const threshold = THRESHOLDS[sensor.type as keyof typeof THRESHOLDS] || 100;
                
                // If value exceeds threshold AND we haven't already alerted for this specific instance recently (implied simple logic)
                if (sensor.value > threshold) {
                    // Only show if not already showing another one
                    if (!criticalAlert) {
                        setCriticalAlert({
                            structureName: structure.name,
                            sensorName: sensor.name,
                            value: sensor.value,
                            threshold: threshold,
                            type: sensor.type
                        });
                    }
                }
            }
        }
    }, [structures, criticalAlert, snoozeUntil]);

    if (!criticalAlert) return null;

    return (
        <Dialog open={!!criticalAlert} onOpenChange={() => setCriticalAlert(null)}>
            <DialogContent className="border-rose-500 border-2 bg-rose-50 z-[99999]">
                <DialogHeader>
                    <div className="flex items-center gap-3 text-rose-600 mb-2">
                         <div className="p-2 bg-rose-100 rounded-full">
                            <ShieldAlert className="w-6 h-6 animate-pulse" />
                         </div>
                         <DialogTitle className="text-xl font-bold uppercase tracking-wider">
                            Critical Threshold Exception
                         </DialogTitle>
                    </div>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-rose-100">
                        <div className="text-sm text-slate-500 font-bold uppercase mb-1">Asset Location</div>
                        <div className="text-lg font-bold text-slate-800">{criticalAlert.structureName}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-rose-100">
                             <div className="text-sm text-slate-500 font-bold uppercase mb-1">Sensor ID</div>
                             <div className="text-md font-mono font-bold text-slate-800">{criticalAlert.sensorName}</div>
                        </div>
                        <div className="bg-rose-100 p-4 rounded-lg shadow-sm border border-rose-200">
                             <div className="text-sm text-rose-700 font-bold uppercase mb-1">Current Reading</div>
                             <div className="text-2xl font-mono font-black text-rose-600">
                                {criticalAlert.value.toFixed(1)} <span className="text-sm font-bold opacity-70">
                                    {criticalAlert.type === 'vibration' ? 'Hz' : criticalAlert.type === 'strain' ? 'µε' : '°C'}
                                </span>
                             </div>
                             <div className="text-xs text-rose-800 font-bold mt-1">Exceeds Limit: {criticalAlert.threshold}</div>
                        </div>
                    </div>
                    
                    <DialogDescription className="text-rose-800 font-medium bg-rose-100/50 p-3 rounded text-sm">
                        WARNING: Structural integrity may be compromised. Immediate inspection is required as per safety regulations ISO-10816.
                    </DialogDescription>
                </div>

                <DialogFooter className="gap-2 sm:justify-start">
                    <Button 
                        variant="destructive" 
                        onClick={() => {
                            setSnoozeUntil(Date.now() + 5 * 60 * 1000); // Snooze for 5 minutes
                            setCriticalAlert(null);
                        }}
                        className="w-full bg-rose-600 hover:bg-rose-700 font-bold shadow-lg shadow-rose-200"
                    >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Acknowledge (Snooze 5m)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
