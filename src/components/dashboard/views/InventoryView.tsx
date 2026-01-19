import { useState, useEffect, useMemo } from 'react';
import { useAppStore, MaintenanceTask, InventoryReport } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ClipboardList, 
  FileText, 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Package,
  ArrowUpRight,
  Plus,
  PieChart as PieIcon,
  Sparkles,
  FileWarning
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import jsPDF from 'jspdf';
import { generateAuditReport } from '@/services/openRouterService';

const MaintenanceInventory = ({ locationFilter }: { locationFilter: string }) => {
  const { maintenanceTasks, updateMaintenanceTaskStatus, addMaintenanceTask, fetchMaintenanceTasks, fetchInventoryReports, structures } = useAppStore();
  const [filter, setFilter] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [openCombo, setOpenCombo] = useState(false);
  
  // Load data on mount
  useEffect(() => {
    fetchMaintenanceTasks();
    fetchInventoryReports();
  }, [fetchMaintenanceTasks, fetchInventoryReports]);

  // New Task State
  const [newTaskItem, setNewTaskItem] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskType, setNewTaskType] = useState('Maintenance');
  const [newTaskPriority, setNewTaskPriority] = useState<MaintenanceTask['priority']>('Medium');

  const filteredTasks = maintenanceTasks.filter(task => {
    const taskLocation = structures.find(s => task.item.includes(s.name))?.location || 'General';
    const matchesFilter = (task.item.toLowerCase().includes(filter.toLowerCase()) || 
    task.id.toLowerCase().includes(filter.toLowerCase()));
    
    // Exact match for location filter (passed from parent)
    const matchesLocation = locationFilter ? taskLocation === locationFilter || (locationFilter === 'General' && !structures.find(s => task.item.includes(s.name))) : true;

    return matchesFilter && matchesLocation &&
    task.status !== 'Pending Review' &&
    !task.item.startsWith('Damage Report') &&
    !task.item.startsWith('Complaint') &&
    !task.item.startsWith('Request');
  });

  const handleAddTask = () => {
    if (!newTaskItem) return;
    
    const newTask: Partial<MaintenanceTask> = {
      item: newTaskItem,
      type: newTaskType,
      status: 'Scheduled',
      due: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // Due inside 7 days
      priority: newTaskPriority,
      assignedToId: newTaskAssignedTo ? Number(newTaskAssignedTo) : undefined
    };

    addMaintenanceTask(newTask);
    setIsAddOpen(false);
    setNewTaskItem('');
    setNewTaskAssignedTo('');
    toast.success('Maintenance task scheduled successfully');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="Search maintenance logs..." 
               className="pl-9" 
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
             />
          </div>
          
          {/* Location Filter moved to Parent View */}
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Schedule Maintenance</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
              <DialogDescription>Create a new maintenance ticket for system assets.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2 flex flex-col">
                <Label>Asset / Item Name</Label>
                <Popover open={openCombo} onOpenChange={setOpenCombo}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombo}
                      className="justify-between"
                    >
                      {newTaskItem
                        ? structures.find((structure) => structure.name === newTaskItem)?.name + ` (${structures.find((s) => s.name === newTaskItem)?.location})`
                        : "Select Asset..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search asset..." />
                      <CommandList>
                        <CommandEmpty>No asset found.</CommandEmpty>
                        <CommandGroup>
                          {structures.map((structure) => (
                            <CommandItem
                              key={structure.id}
                              value={structure.name}
                              onSelect={(currentValue) => {
                                setNewTaskItem(currentValue === newTaskItem ? "" : currentValue);
                                setOpenCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newTaskItem === structure.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {structure.name} <span className="text-muted-foreground ml-2 text-xs">({structure.location})</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={newTaskType} onValueChange={setNewTaskType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Repair">Repair</SelectItem>
                        <SelectItem value="Calibration">Calibration</SelectItem>
                        <SelectItem value="Inspection">Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>
              <div className="space-y-2">
                 <Label>Assign to User ID (Optional)</Label>
                 <Input 
                   type="number" 
                   placeholder="e.g. 2 for Worker" 
                   value={newTaskAssignedTo} 
                   onChange={(e) => setNewTaskAssignedTo(e.target.value)} 
                 />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTask}>Confirm Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Table Area - No visual scrollbar due to global css but scrollable */}
      <div className="rounded-md border bg-white mb-20 overflow-hidden">
        <div className="w-full overflow-auto max-h-[600px]">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b sticky top-0 bg-white shadow-sm z-10">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[100px]">ID</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Item / Asset</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Location</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Due Date</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Priority</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle font-mono text-xs">{task.id}</td>
                  <td className="p-4 align-middle font-medium">{task.item}</td>
                  <td className="p-4 align-middle text-muted-foreground">
                    {structures.find(s => task.item.includes(s.name))?.location || 'General'}
                  </td>
                  <td className="p-4 align-middle">{task.type}</td>
                  <td className="p-4 align-middle">
                    <Badge variant={task.status === 'Completed' ? 'default' : task.status === 'Overdue' ? 'destructive' : 'secondary'} className="capitalize">
                      {task.status}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">{task.due}</td>
                  <td className="p-4 align-middle text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      task.priority === 'High' ? 'bg-red-50 text-red-700' : 
                      task.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 
                      'bg-slate-50 text-slate-700'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                     {task.status !== 'Completed' && (
                        <Button variant="ghost" size="sm" onClick={() => {
                           updateMaintenanceTaskStatus(task.id, 'Completed');
                           toast.success(`Task ${task.id} marked as completed`);
                        }}>
                          Check
                        </Button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ReportsInventory = () => {
    const { inventoryReports, addInventoryReport, structures, maintenanceTasks } = useAppStore();
    const [viewReport, setViewReport] = useState<InventoryReport | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = async () => {
       setIsGenerating(true);
       toast.info('Initiating AI Audit (DeepSeek V3)...');
       
       const fallbackReport = `
# STRUCTURAL INTEGRITY & INVENTORY LOGISTICS REPORT
Date: ${new Date().toLocaleDateString()}

## 1. EXECUTIVE SUMMARY
The infrastructure network is currently operating at nominal capacity. Recent stress tests indicate stable performance across 92% of all sensor nodes. The system is secure and efficient.

## 2. INVENTORY ANALYSIS
- **Total Assets**: ${structures.length + structures.reduce((acc, s) => acc + s.sensors.length, 0) + 24} units active.
- **Cost Efficiency**: Maintenance costs are within budget for Q${Math.floor((new Date().getMonth() + 3) / 3)}.
- **Asset Health**: 98% of sensors are reporting valid data.

## 3. MAINTENANCE & COMPLAINTS
- **Active Tasks**: ${maintenanceTasks.filter(t => t.status !== 'Completed').length} pending.
- **High Priority**: ${maintenanceTasks.filter(t => t.status !== 'Completed' && t.priority === 'High').length} tasks require immediate attention.
- **Complaints**: No critical complaints unresolved.

## 4. DETAILED FINDINGS
- Tower Alpha: All systems nominal. Minor vibration detected in East Wing (within tolerance).
- Bridge Nexus: WARNING status on Mid Span sensor. Immediate inspection recommended.
- Flyover Beta: Stable.

## 5. RECOMMENDATIONS
- Schedule immediate maintenance for Bridge Nexus.
- Continue monitoring vibration trends in Tower Alpha.
- Verify firmware version on all Gateway nodes.
       `;

       try {
           // --- Calculate Analysis Metrics for the AI ---
           const activeMaintenance = maintenanceTasks.filter(t => t.status !== 'Completed').length;
           const highPriorityTasks = maintenanceTasks.filter(t => t.status !== 'Completed' && t.priority === 'High').length;
           const pendingAlerts = maintenanceTasks.filter(t => t.status === 'Overdue').length;
           
           const sensorCount = structures.reduce((acc, s) => acc + s.sensors.length, 0);
           const totalAssets = structures.length + sensorCount + 24;

           const assetDistribution = [
             { name: 'Sensors', value: sensorCount },
             { name: 'Struct. Nodes', value: structures.length },
             { name: 'Gateways', value: Math.ceil(structures.length * 1.2) }, 
             { name: 'Drones', value: 12 }, 
           ];

           // Simulate Cost Data (matching Analysis Tab)
           const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
           const currentQ = Math.floor((new Date().getMonth() + 3) / 3);
           const maintenanceCosts = quarters.map((q, i) => {
               const qIndex = i + 1;
               if (qIndex > currentQ) return { name: q, maintenance: 0, repairs: 0 };
               const completedCount = maintenanceTasks.filter(t => t.status === 'Completed').length;
               const variableCost = completedCount * 150; 
               return { 
                 name: q, 
                 maintenance: 5000 + (variableCost * (Math.random() * 0.5 + 0.8)), 
                 repairs: 2000 + (variableCost * (Math.random() * 0.8 + 0.2)) 
               };
           });

           const analysisMetrics = {
               totalAssets,
               activeMaintenance,
               highPriorityTasks,
               pendingAlerts,
               systemUptime: "99.9%",
               maintenanceCosts,
               assetDistribution
           };

           // Default to fallback
           let reportContent = fallbackReport;
           let isAI = false;
           
           try {
             // Explicitly requesting DeepSeek V3
             const aiCo = await generateAuditReport('deepseek/deepseek-chat', structures, maintenanceTasks, analysisMetrics);
             
             // Verify AI content quality
             if (aiCo && aiCo.length > 200 && !aiCo.includes("No response received") && !aiCo.includes("offline heuristic")) {
                 reportContent = aiCo;
                 isAI = true;
             } else {
                 console.warn("AI response invalid, keeping fallback.");
                 toast.warning("AI Service busy. Using Simulation Report.");
             }
           } catch (genError) {
             console.warn("Generation failed:", genError);
             toast.warning("AI Connection failed. Using Simulation Report.");
           }
           
           const newReport: InventoryReport = {
            id: `R-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
            title: isAI ? 'AI Comprehensive Audit (DeepSeek)' : 'System Audit Report (Simulated)',
            date: new Date().toISOString().split('T')[0],
            size: isAI ? '1.8 MB' : '920 KB',
            author: isAI ? 'Sentinel AI' : 'System Diagnostic',
            content: reportContent
           };
           
           addInventoryReport(newReport);
           if (isAI) {
               toast.success('AI Report generated successfully.');
           } else {
               toast.success('Report generated successfully (Simulation Mode).');
           }

       } catch (error) {
           console.error(error);
           toast.error('Failed to generate report.');
       } finally {
           setIsGenerating(false);
       }
    };

    const handleDownloadPDF = async (report: InventoryReport) => {
      try {
        const doc = new jsPDF();
        
        // --- Enhanced Formatted PDF ---
        
        // 1. Header Area
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("SmartNode-SHM System Report", 14, 15);
        doc.text(`Document ID: ${report.id}`, 150, 15);
        
        // Line Separator
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 18, 196, 18);

        // 2. Title
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(report.title, 14, 30);
        
        // 3. Metadata
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Date Generated: ${report.date}`, 14, 38);
        doc.text(`Author: ${report.author}`, 14, 43);
        
        // 4. Content Body (Smart Parsing)
        let yPos = 55;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 14;
        const lineHeight = 7;
        
        const content = report.content || "No content.";
        const lines = content.split('\n');
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        lines.forEach((line) => {
            // Check Page Break
            if (yPos > pageHeight - 20) {
                doc.addPage();
                yPos = 20;
            }

            const trimmed = line.trim();
            if (!trimmed) {
                yPos += 3; // small gap for empty lines
                return;
            }

            // Headers (# or ##)
            if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
                 doc.setFont("helvetica", "bold");
                 doc.setFontSize(14);
                 doc.setTextColor(23, 23, 23); // Dark Gray
                 const text = trimmed.replace(/^#+\s*/, '');
                 doc.text(text, margin, yPos);
                 yPos += 10;
                 // Reset font
                 doc.setFont("helvetica", "normal");
                 doc.setFontSize(11);
                 doc.setTextColor(0, 0, 0);
            } 
            // Bold Points (**text**) - Basic support (checking valid bold start)
            else if (trimmed.startsWith('**') || trimmed.includes('**')) {
                 // Simple approach: Bold the whole line if it looks like a header/key point
                 // Or separate key: value
                 const parts = trimmed.split('**');
                 let xOffset = margin;
                 
                 parts.forEach((part, index) => {
                     if (index % 2 === 1) { // Inside ** **
                         doc.setFont("helvetica", "bold");
                     } else {
                         doc.setFont("helvetica", "normal");
                     }
                     doc.text(part, xOffset, yPos);
                     xOffset += doc.getTextWidth(part);
                 });
                 yPos += lineHeight;
            } 
            // Bullet Points
            else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                doc.text("• " + trimmed.substring(2), margin + 5, yPos);
                yPos += lineHeight;
            } 
            // Numbered Lists
            else if (/^\d+\.\s/.test(trimmed)) {
                doc.text(trimmed, margin + 5, yPos);
                yPos += lineHeight;
            }
            // Normal Text
            else {
                // Formatting regular paragraphs
                const splitText = doc.splitTextToSize(trimmed, 180);
                doc.text(splitText, margin, yPos);
                yPos += (lineHeight * splitText.length); 
            }
        });
        
        // 5. Footer
        const pageCount = doc.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, 100, 290, { align: 'center' });
            doc.text("CONFIDENTIAL - INTERNAL USE ONLY", 14, 290);
        }

        doc.save(`${report.title.replace(/\s+/g, '_')}.pdf`);
        toast.success(`Report downloaded as Formatted PDF.`);
      } catch (error) {
        toast.error('Failed to download PDF');
        console.error(error);
      }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
             <Card 
               onClick={!isGenerating ? handleGenerateReport : undefined}
               className={`flex items-center justify-center border-dashed border-2 hover:border-primary hover:bg-slate-50 transition-all cursor-pointer min-h-[160px] ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
             >
                <div className="text-center text-muted-foreground p-4">
                    <div className={`w-14 h-14 mx-auto bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mb-3 ${isGenerating ? 'animate-bounce' : ''}`}>
                         {isGenerating ? <Sparkles className="w-7 h-7 animate-pulse" /> : <Plus className="w-7 h-7" />}
                    </div>
                    <p className="text-base font-semibold text-slate-700">{isGenerating ? 'AI Generating Report...' : 'New AI Audit Report'}</p>
                    <p className="text-xs text-slate-500 mt-1">Powered by Llama-3 & SmartNode-SHM Data</p>
                </div>
            </Card>

            {inventoryReports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-all cursor-default group border-slate-200">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="bg-slate-100 p-2 rounded-lg">
                             <FileText className="w-5 h-5 text-slate-600" />
                        </div>
                        {report.content ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">AI Logic</Badge>
                        ) : (
                            <Badge variant="outline" className="font-mono text-xs">{report.id}</Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-md font-bold mb-1 line-clamp-1" title={report.title}>{report.title}</CardTitle>
                        <CardDescription className="text-xs">{report.date} • {report.author}</CardDescription>
                        
                        <div className="my-4 h-[1px] bg-slate-100 w-full"></div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-mono">{report.size}</span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 hover:bg-slate-900 hover:text-white transition-colors" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadPDF(report);
                                }}
                            >
                              <Download className="w-3 h-3 mr-1" /> PDF
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const InventoryAnalysis = ({ locationFilter }: { locationFilter: string }) => {
    const { maintenanceTasks, structures } = useAppStore();
    
    // Filtered Data based on location
    const filteredTasks = useMemo(() => {
        if (!locationFilter) return maintenanceTasks;
        return maintenanceTasks.filter(t => {
            const loc = structures.find(s => t.item.includes(s.name))?.location || 'General';
            return loc === locationFilter;
        });
    }, [maintenanceTasks, structures, locationFilter]);

    const filteredStructures = useMemo(() => {
        if (!locationFilter) return structures;
        return structures.filter(s => s.location === locationFilter);
    }, [structures, locationFilter]);

    // Calculated Metrics
    const activeMaintenance = filteredTasks.filter(t => t.status !== 'Completed').length;
    const highPriorityCount = filteredTasks.filter(t => t.status !== 'Completed' && t.priority === 'High').length;
    const pendingAlerts = filteredTasks.filter(t => t.status === 'Overdue').length;
    
    const totalAssets = useMemo(() => {
      const sensors = filteredStructures.reduce((acc, s) => acc + s.sensors.length, 0);
      return filteredStructures.length + sensors + (locationFilter ? 0 : 24); // +24 misc only for global
    }, [filteredStructures, locationFilter]);

    const assetDistData = useMemo(() => {
       const sensorCount = filteredStructures.reduce((acc, s) => acc + s.sensors.length, 0);
       return [
         { name: 'Sensors', value: sensorCount },
         { name: 'Struct. Nodes', value: filteredStructures.length },
         { name: 'Gateways', value: Math.ceil(filteredStructures.length * 1.2) }, 
         { name: 'Drones', value: locationFilter ? Math.floor(12/3) : 12 }, 
       ];
    }, [filteredStructures, locationFilter]);
    
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

    const costData = useMemo(() => {
        // Procedural generation based on task history to simulate "Real" costs
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        const currentQ = Math.floor((new Date().getMonth() + 3) / 3);
        
        return quarters.map((q, i) => {
           const qIndex = i + 1;
           // Future quarters have 0 cost
           if (qIndex > currentQ) return { name: q, maintenance: 0, repairs: 0 };
           
           // Base costs + variable based on completed tasks
           // This makes the chart "alive" as more tasks are completed
           const completedCount = maintenanceTasks.filter(t => t.status === 'Completed').length;
           const variableCost = completedCount * 150; 
           
           return { 
             name: q, 
             maintenance: 5000 + (variableCost * (Math.random() * 0.5 + 0.8)), 
             repairs: 2000 + (variableCost * (Math.random() * 0.8 + 0.2)) 
           };
        });
    }, [maintenanceTasks]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-20">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAssets.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+4 added this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Maintenance</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{activeMaintenance}</div>
                  <p className="text-xs text-muted-foreground">{highPriorityCount} High Priority</p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">99.9%</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-rose-600">{pendingAlerts}</div>
                  <p className="text-xs text-muted-foreground">Overdue Tasks</p>
                </CardContent>
              </Card>

              {/* Asset Distribution Chart */}
              <Card className="col-span-2">
                  <CardHeader>
                      <CardTitle>Asset Distribution</CardTitle>
                      <CardDescription>Breakdown of inventory items by category</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[250px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                              data={assetDistData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {assetDistData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                         </PieChart>
                       </ResponsiveContainer>
                  </CardContent>
              </Card>
              
               {/* Cost Analysis Chart */}
               <Card className="col-span-2">
                  <CardHeader>
                      <CardTitle>Maintenance Costs</CardTitle>
                      <CardDescription>Quarterly expenditure on repairs and upgrades ($)</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={costData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                          <Tooltip cursor={{ fill: 'transparent' }} />
                          <Legend />
                          <Bar dataKey="maintenance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="repairs" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                  </CardContent>
              </Card>
        </div>
    );
};

export const InventoryView = () => {
  const { maintenanceTasks, updateMaintenanceTaskStatus, structures } = useAppStore();
  const [activeSubTab, setActiveSubTab] = useState('maintenance');
  
  // Lifted State for Global Filter
  const [locationFilter, setLocationFilter] = useState('');
  const [openLocationCombo, setOpenLocationCombo] = useState(false);
  const uniqueLocations = Array.from(new Set(structures.map(s => s.location)));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Inventory & Logistics</h2>
          <p className="text-slate-500">Manage assets, track maintenance, and review system reports.</p>
        </div>
        
        {/* Global Location Filter */}
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-9 px-3 bg-white border-slate-200 text-slate-500 hidden sm:flex">
                <Filter className="w-3 h-3 mr-2" /> Global Filter
            </Badge>
            <Popover open={openLocationCombo} onOpenChange={setOpenLocationCombo}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openLocationCombo}
                className="justify-between w-[200px] bg-white"
              >
                {locationFilter || "All Locations"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search location..." />
                <CommandList>
                  <CommandEmpty>No location found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                        value="All Locations"
                        onSelect={() => {
                          setLocationFilter("");
                          setOpenLocationCombo(false);
                        }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", locationFilter === "" ? "opacity-100" : "opacity-0")} />
                      All Locations
                    </CommandItem>
                    {uniqueLocations.map((loc) => (
                      <CommandItem
                        key={loc}
                        value={loc}
                        onSelect={(currentValue) => {
                          setLocationFilter(currentValue === locationFilter ? "" : currentValue);
                          setOpenLocationCombo(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", locationFilter === loc ? "opacity-100" : "opacity-0")} />
                        {loc}
                      </CommandItem>
                    ))}
                    <CommandItem
                        value="General"
                        onSelect={() => {
                          setLocationFilter("General");
                          setOpenLocationCombo(false);
                        }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", locationFilter === "General" ? "opacity-100" : "opacity-0")} />
                      General
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs defaultValue="maintenance" className="space-y-6" onValueChange={setActiveSubTab}>
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-slate-100 data-[state=active]:text-primary rounded-lg px-4">
             <Wrench className="w-4 h-4 mr-2" /> Maintenance
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-slate-100 data-[state=active]:text-primary rounded-lg px-4">
             <FileText className="w-4 h-4 mr-2" /> Reports
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-slate-100 data-[state=active]:text-primary rounded-lg px-4">
             <BarChart3 className="w-4 h-4 mr-2" /> Analysis
          </TabsTrigger>
          <TabsTrigger value="complaints" className="data-[state=active]:bg-slate-100 data-[state=active]:text-primary rounded-lg px-4">
             <FileWarning className="w-4 h-4 mr-2" /> Complaints
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance">
            <MaintenanceInventory locationFilter={locationFilter} />
        </TabsContent>
        
        <TabsContent value="reports">
            <ReportsInventory />
        </TabsContent>

        <TabsContent value="analysis">
            <InventoryAnalysis locationFilter={locationFilter} />
        </TabsContent>

        <TabsContent value="complaints">
            <div className="space-y-4 mb-20">
                <Card>
                    <CardHeader>
                        <CardTitle>Worker Complaints & Review Queue</CardTitle>
                        <CardDescription>Review pending tasks submitted by workers and address complaints.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="p-4 font-medium">ID</th>
                                        <th className="p-4 font-medium">Issue / Item</th>
                                        <th className="p-4 font-medium">Location</th>
                                        <th className="p-4 font-medium">Type</th>
                                        <th className="p-4 font-medium">Submitted By</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {maintenanceTasks.filter(t => (t.status === 'Pending Review' || t.item.includes('Complaint') || t.item.includes('Damage Report') || t.item.includes('Request')) && 
                                    (!locationFilter || (structures.find(s => t.item.includes(s.name))?.location || 'General') === locationFilter)
                                    ).length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-muted-foreground">No pending reviews, complaints, or requests.</td>
                                        </tr>
                                    ) : (
                                        maintenanceTasks.filter(t => (t.status === 'Pending Review' || t.item.includes('Complaint') || t.item.includes('Damage Report') || t.item.includes('Request')) &&
                                        (!locationFilter || (structures.find(s => t.item.includes(s.name))?.location || 'General') === locationFilter)
                                        ).map((task) => (
                                            <tr key={task.id} className="border-b last:border-0 hover:bg-slate-50">
                                                <td className="p-4 font-mono">{task.id}</td>
                                                <td className="p-4 font-medium">{task.item}</td>
                                                <td className="p-4 text-muted-foreground">
                                                    {structures.find(s => task.item.includes(s.name))?.location || 'Unknown'}
                                                </td>
                                                <td className="p-4">{task.type}</td>
                                                <td className="p-4 text-muted-foreground">{task.assignedToId ? `Worker #${task.assignedToId}` : 'Unknown'}</td>
                                                <td className="p-4">
                                                    <Badge 
                                                        variant={task.status === 'Pending Review' ? 'secondary' : 'outline'} 
                                                        className={task.status === 'Completed' ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"}
                                                    >
                                                        {task.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {task.status === 'Pending Review' && (
                                                        <>

                                                            {(task.item.includes('Damage Report') || task.item.includes('Request') || task.item.includes('Complaint')) ? (
                                                                <Button 
                                                                    size="sm" 
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                                    onClick={() => {
                                                                        // Approve Complaint -> Scheduled Task
                                                                        updateMaintenanceTaskStatus(task.id, 'Scheduled');
                                                                        toast.success('Complaint Approved', { description: 'Task has been scheduled for the worker.' });
                                                                    }}
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                                                </Button>
                                                            ) : (
                                                                <Button 
                                                                    size="sm" 
                                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                    onClick={() => {
                                                                        updateMaintenanceTaskStatus(task.id, 'Completed');
                                                                        toast.success('Task approved and marked completed');
                                                                    }}
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
