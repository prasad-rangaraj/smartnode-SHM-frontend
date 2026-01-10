import { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { useAppStore } from '@/store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { StructureCard } from '@/features/dashboard/components/StructureCard';
import { QrCode, LogOut, CheckCircle2, Circle, Clock, AlertTriangle, ScanLine, X, ChevronRight, Bot, History, FileWarning, ListTodo } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatBot } from '@/features/ai/ChatBot';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const MaintenanceWorker = () => {
  const navigate = useNavigate();
  const { user, logout, maintenanceTasks, updateMaintenanceTaskStatus, fetchMaintenanceTasks, toggleChat, isChatOpen, structures, addMaintenanceTask } = useAppStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [foundStructure, setFoundStructure] = useState<any>(null);

  // Report Form State
  const [reportType, setReportType] = useState('damage');
  const [selectedStructure, setSelectedStructure] = useState('');
  const [reportDesc, setReportDesc] = useState('');

  const handleReportSubmit = () => {
    if (!selectedStructure || !reportDesc) {
        toast.error('Please fill in all fields');
        return;
    }

    addMaintenanceTask({
        item: `${reportType === 'damage' ? 'Damage Report' : reportType === 'complaint' ? 'Complaint' : 'Request'}: ${selectedStructure}`,
        type: reportType === 'damage' ? 'Repair' : 'Inspection',
        status: 'Pending Review', // Set to Pending Review so Admin sees it first
        priority: reportType === 'damage' ? 'High' : 'Medium',
        due: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        assignedToId: user?.id
    });

    toast.success('Report submitted successfully');
    setReportDesc('');
    setSelectedStructure('');
  };

  // Load Tasks
  useEffect(() => {
    if (user?.id) {
        fetchMaintenanceTasks(user.id);
    }
  }, [user, fetchMaintenanceTasks]);

  // Auth Guard
  useEffect(() => {
    if (!user || !user.email.startsWith('worker@')) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startScan = () => {
    setIsScanning(true);
    setScannedData(null);
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'Overdue': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default: return <Circle className="w-5 h-5 text-slate-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      {/* Mobile Header */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-30 shadow-lg">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm border-2 border-white/20">
                  MW
               </div>
               <div>
                  <h1 className="font-bold text-lg leading-tight">SmartNode Ops</h1>
                  <p className="text-xs text-slate-400">Field Unit #8842</p>
               </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-white hover:bg-white/10">
               <LogOut className="w-5 h-5" />
            </Button>
         </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6 max-w-md mx-auto">
         
         {/* Action Card */}
         {/* Action Card - Compact */}
         <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
             <div className="flex items-center justify-between mb-4">
                <div>
                   <h2 className="text-lg font-bold">Asset Scanner</h2>
                   <p className="text-blue-100 text-xs opacity-90">Scan QR codes for diagnostics.</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                   <QrCode className="w-5 h-5 text-white" />
                </div>
             </div>
             <Button onClick={startScan} className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold h-10 shadow-sm border-0 text-sm">
                Start Scanner
             </Button>
         </div>

         {/* Tabs Navigation */}
         <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-100 mb-6">
               <TabsTrigger value="tasks" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
                  <ListTodo className="w-4 h-4 mr-2" /> Tasks
               </TabsTrigger>
               <TabsTrigger value="history" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
                  <History className="w-4 h-4 mr-2" /> History
               </TabsTrigger>
               <TabsTrigger value="requests" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700">
                  <FileWarning className="w-4 h-4 mr-2" /> Complaints
               </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4">
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-800 text-lg">Assigned Tasks</h3>
                    <Badge variant="outline" className="bg-white">{maintenanceTasks.filter(t => t.status !== 'Completed' && t.status !== 'Pending Review').length} Pending</Badge>
                 </div>
                 
                 <div className="space-y-3">
                    {maintenanceTasks.filter(t => t.status !== 'Completed' && t.status !== 'Pending Review').map((task) => (
                       <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm active:scale-[0.98] transition-transform">
                          <div className="flex items-start justify-between mb-2">
                             <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                                {task.priority} Priority
                             </div>
                             {getStatusIcon(task.status)}
                          </div>
                          <h4 className="font-bold text-slate-800 mb-1">{task.item}</h4>
                          <p className="text-sm text-slate-500 mb-3">{task.type}</p>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                             <span className="text-xs font-medium text-slate-400">Due: {task.due}</span>
                             <div className="flex items-center text-blue-600 text-xs font-bold">
                                Details <ChevronRight className="w-3 h-3 ml-1" />
                             </div>
                          </div>
                          {/* Quick Complete Action */}
                          <div className="mt-3 pt-2">
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100"
                                onClick={() => {
                                   if (task.item.startsWith('Complaint') || task.item.startsWith('Damage Report') || task.item.startsWith('Request')) {
                                       updateMaintenanceTaskStatus(task.id, 'Completed');
                                       toast.success('Complaint resolved and marked completed');
                                   } else {
                                       updateMaintenanceTaskStatus(task.id, 'Pending Review');
                                       toast.success('Task submitted for Admin review');
                                   }
                                }} 
                             >
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Completed
                             </Button>
                          </div>
                       </div>
                    ))}
                    {maintenanceTasks.filter(t => t.status !== 'Completed').length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No pending tasks</p>
                        </div>
                    )}
                 </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-800 text-lg">Past Logs</h3>
                    <Badge variant="secondary" className="bg-slate-100">{maintenanceTasks.filter(t => t.status === 'Completed' || t.status === 'Pending Review').length} entries</Badge>
                 </div>
                 <div className="space-y-3">
                    {maintenanceTasks.filter(t => t.status === 'Completed' || t.status === 'Pending Review').map((task) => (
                       <div key={task.id} className={`p-4 rounded-xl border opacity-90 ${task.status === 'Pending Review' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex items-center justify-between mb-2">
                             <h4 className={`font-bold ${task.status === 'Completed' ? 'text-slate-700 line-through' : 'text-slate-800'}`}>{task.item}</h4>
                             <Badge variant="outline" className={task.status === 'Completed' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                                {task.status === 'Completed' ? 'Done' : 'In Review'}
                             </Badge>
                          </div>
                          <p className="text-xs text-slate-400 mb-1">Updated: {new Date().toLocaleDateString()}</p>
                       </div>
                    ))}
                 </div>
            </TabsContent>

            <TabsContent value="requests">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-600">
                             <FileWarning className="w-5 h-5" />
                         </div>
                         <div>
                             <h3 className="font-bold text-slate-800">Raise Complaint / Request</h3>
                             <p className="text-xs text-slate-500">Log damage or request maintenance.</p>
                         </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Issue Type</Label>
                            <Select value={reportType} onValueChange={setReportType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="damage">Sensor Damage</SelectItem>
                                    <SelectItem value="complaint">Complaint / Issue</SelectItem>
                                    <SelectItem value="request">New Component Request</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                             <Label>Location / Structure</Label>
                             <Select value={selectedStructure} onValueChange={setSelectedStructure}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Structure" />
                                </SelectTrigger>
                                <SelectContent>
                                    {structures.map(s => (
                                        <SelectItem key={s.id} value={s.name}>{s.name} ({s.location})</SelectItem>
                                    ))}
                                    <SelectItem value="General">General / Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea 
                                placeholder="Describe the damage or request details..." 
                                value={reportDesc}
                                onChange={(e) => setReportDesc(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>

                        <Button onClick={handleReportSubmit} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                            Submit Report
                        </Button>
                    </div>
                </div>
            </TabsContent>

         </Tabs>
      </div>

      {/* Mock QR Scanner Overlay */}
      <Dialog open={isScanning} onOpenChange={setIsScanning}>
         <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-0 text-white h-[100dvh] sm:h-[600px] flex flex-col items-center justify-center">
             <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                 {isScanning && (
                     <div className="w-full h-full">
                        <QrReader
                            onResult={(result, error) => {
                                if (!!result) {
                                    const text = result?.getText();
                                    // 1. Try to find the structure in our local store
                                    const found = structures.find(s => s.id === text || s.name === text);
                                    
                                    if (found) {
                                        setScannedData(found.id);
                                        setFoundStructure(found); // Show Details Modal
                                        toast.success(`Asset Identified: ${found.name}`);
                                        setIsScanning(false);
                                        // Auto-select for report
                                        setSelectedStructure(found.name);
                                    } else {
                                        // 2. Fallback for demo: if user scans random text, just show it
                                        toast.error(`Unknown Asset ID: ${text}`);
                                        // Don't close scanner, let them try again
                                    }
                                }
                            }}
                            constraints={{ facingMode: 'environment' }}
                            containerStyle={{ height: '100%', width: '100%' }}
                            videoContainerStyle={{ height: '100%', width: '100%' }}
                            videoStyle={{ height: '100%', objectFit: 'cover' }}
                        />
                        {/* Overlay Frame */}
                        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                            <div className="w-64 h-64 border-2 border-white/50 rounded-lg flex items-center justify-center relative">
                                <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 border-b-blue-500 opacity-50 animate-pulse"></div>
                                <div className="animate-pulse w-full h-0.5 bg-red-500 shadow-[0_0_10px_red]"></div>
                                <div className="absolute top-2 left-0 w-full text-center text-xs text-white/70 font-mono">
                                    ALIGN QR CODE
                                </div>
                            </div>
                        </div>
                     </div>
                 )}
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
                    onClick={() => setIsScanning(false)}
                 >
                    <X className="w-8 h-8" />
                 </Button>
             </div>
         </DialogContent>
      </Dialog>

      {/* Scanned Asset Details Modal */}
      <Dialog open={!!foundStructure} onOpenChange={(open) => !open && setFoundStructure(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none">
             {foundStructure && (
                <div className="relative">
                     <StructureCard 
                        id={foundStructure.id}
                        name={foundStructure.name}
                        type={foundStructure.type}
                        health={foundStructure.health}
                        sensors={foundStructure.sensors}
                        location={foundStructure.location}
                        gatewayConnectivity={foundStructure.gatewayConnectivity}
                        isSelected={true}
                        onSelect={() => {}} 
                        onViewDetails={() => {
                            setFoundStructure(null);
                            // Auto-select for report
                        }}
                     />
                     <Button 
                        size="sm"
                        className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/30 text-slate-800 backdrop-blur-md border border-white/20"
                        onClick={() => setFoundStructure(null)}
                     >
                        <X className="w-4 h-4" />
                     </Button>
                     
                     <div className="absolute -bottom-4 left-0 right-0 p-4 transform translate-y-full">
                         <Button className="w-full bg-slate-900 shadow-xl" onClick={() => setFoundStructure(null)}>
                             Proceed to Report
                         </Button>
                     </div>
                </div>
             )}
        </DialogContent>
      </Dialog>

      {/* AI Chat Button */}
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 p-4 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-2xl z-40 transition-all hover:scale-105 active:scale-95 group"
        >
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
          <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Chat Component */}
      <ChatBot />
    </div>
  );
};

export default MaintenanceWorker;
