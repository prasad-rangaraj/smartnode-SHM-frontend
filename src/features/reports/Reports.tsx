import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Filter, Calendar, Bot, Sparkles, Loader2, CheckCircle2, X, Zap, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateAuditReport, MODELS } from '@/services/openRouterService';

interface SavedReport {
    id: string;
    title: string;
    date: string;
    type: 'PDF' | 'TXT' | 'CSV';
    content: string;
    status: 'Approved' | 'Review' | 'Draft';
    size: string;
}

export const Reports = () => {
  const { structures } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0); 
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportFocus, setReportFocus] = useState<'detail' | 'critical' | 'average'>('detail');
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id); // Default model
  const reportRef = useRef<HTMLDivElement>(null);

  // Load reports from local storage
  useEffect(() => {
      const saved = localStorage.getItem('sms_reports');
      if (saved) {
          setSavedReports(JSON.parse(saved));
      } else {
          // Default data if empty
          setSavedReports([
            { id: '1', title: "Monthly Safety Audit", date: "2024-10-01", type: "PDF", content: "Legacy content", status: "Approved", size: "2.4 MB" },
            { id: '2', title: "Emergency Incident Log", date: "2024-09-28", type: "CSV", content: "Legacy content", status: "Review", size: "128 KB" },
          ]);
      }
  }, []);

  // Save to local storage whenever reports change
  useEffect(() => {
      localStorage.setItem('sms_reports', JSON.stringify(savedReports));
  }, [savedReports]);

  const generationSteps = [
    "Analyzing structure telemetry...",
    "Correlating sensor anomalies...",
    "Synthesizing maintenance insights...",
    "Drafting compliance summary...",
    "Finalizing document..."
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStep(0);
    setGeneratedReport(null);
    setError(null);
    
    // Animation Loop (Visual Only)
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < generationSteps.length) setGenerationStep(step);
    }, 1500);

    try {
        const reportContent = await generateAuditReport(selectedModelId, structures);
        
        clearInterval(interval);
        setGenerationStep(generationSteps.length);
        setGeneratedReport(reportContent);
        setIsGenerating(false);

    } catch (e: any) {
        clearInterval(interval);
        console.error("Report Generation Error:", e);
        const errorMessage = e?.message || e?.toString() || "Failed to connect to AI server";
        setError(errorMessage);
        setIsGenerating(false);
    }
  };

  // Save report when generation finishes
  const saveGeneratedReport = () => {
      if (!generatedReport) return;
      const newReport: SavedReport = {
          id: Date.now().toString(),
          title: `${reportFocus.charAt(0).toUpperCase() + reportFocus.slice(1)} Report - ${selectedDate}`,
          date: selectedDate,
          type: "PDF",
          content: generatedReport,
          status: "Draft",
          size: "~1.2 MB"
      };
      setSavedReports([newReport, ...savedReports]);
      setShowGenerator(false); // Close generator to show list
  };

  const deleteReport = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSavedReports(savedReports.filter(r => r.id !== id));
  };

  const handleDownloadPDF = async (content?: string, title: string = "report") => {
      if (reportRef.current && !content) {
          try {
              // Create a clone of the report element
              const original = reportRef.current;
              const clone = original.cloneNode(true) as HTMLElement;
              
              // Style the clone to ensure full capture
              clone.style.width = '800px'; // Fixed width for consistent PDF scale
              clone.style.height = 'auto';
              clone.style.maxHeight = 'none';
              clone.style.overflow = 'visible';
              clone.style.position = 'absolute';
              clone.style.top = '-9999px';
              clone.style.left = '-9999px';
              clone.style.backgroundColor = 'white';
              document.body.appendChild(clone);

              // Capture the clone
              const canvas = await html2canvas(clone, {
                  scale: 2, // Higher quality
                  useCORS: true,
                  logging: false,
                  windowWidth: 850
              });

              document.body.removeChild(clone);

              // Generate PDF
              const imgData = canvas.toDataURL('image/png');
              const pdf = new jsPDF('p', 'mm', 'a4');
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = pdf.internal.pageSize.getHeight();
              
              const margin = 12; // 12mm margin on sides
              const imgWidth = pdfWidth - (margin * 2);
              const imgHeight = (canvas.height * imgWidth) / canvas.width;
              
              // Refined Loop for Side Margins
              let heightLeft = imgHeight;
              let position = 0;

              pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
              heightLeft -= pdfHeight;

              while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
              }

              pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
          } catch (err) {
              console.error("PDF Gen Error:", err);
          }
      } else if (content) {
         // Generate simple PDF from text (fallback for list items)
         const pdf = new jsPDF();
         const splitText = pdf.splitTextToSize(content, 180);
         pdf.text(splitText, 10, 10);
         pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
      }
  };

  return (
    <div className="space-y-6 relative min-h-[500px]">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <FileText className="w-6 h-6 text-slate-700" />
             Structural Audit Reports
           </h2>
           <p className="text-slate-500">Generated compliance and safety assessment documents.</p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
             <Filter className="w-4 h-4 text-slate-500" />
             <select 
               value={reportFocus}
               onChange={(e) => setReportFocus(e.target.value as any)}
               className="text-sm font-medium text-slate-600 bg-transparent border-none focus:outline-none cursor-pointer"
             >
               <option value="detail">Detailed Report</option>
               <option value="critical">Critical Only</option>
               <option value="average">Daily Average</option>
             </select>
           </div>
           
           <div className="flex items-center gap-2 bg-primary text-white rounded-lg px-2 py-1 shadow-sm">
             <Calendar className="w-4 h-4" />
             <input 
               type="date" 
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
               className="text-sm font-medium bg-transparent border-none focus:outline-none text-white w-[110px] [color-scheme:dark]"
             />
           </div>
        </div>
      </div>

      {showGenerator ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Bot className="w-6 h-6 text-emerald-400" />
                  AI Report Generator
                </h3>
                <p className="text-slate-400 text-sm mt-1">Multi-Model Analysis Engine</p>
              </div>
              <button onClick={() => setShowGenerator(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
           </div>

           <div className="p-8">
              {!generatedReport && !isGenerating && (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Sparkles className="w-8 h-8" />
                   </div>
                   <h4 className="text-lg font-bold text-slate-800 mb-2">Ready to Generate</h4>
                   <p className="text-slate-500 max-w-md mx-auto mb-6">
                     Focusing analysis on {structures.length} structures. 
                     Select an AI model to process the telemetry data.
                   </p>

                   {/* Model Selector */}
                   <div className="max-w-xs mx-auto mb-8">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Analysis Model</label>
                      <select 
                         value={selectedModelId}
                         onChange={(e) => setSelectedModelId(e.target.value)}
                         className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                         {MODELS.map(m => (
                             <option key={m.id} value={m.id}>{m.name}</option>
                         ))}
                      </select>
                   </div>
                   
                   {error && (
                       <div className="max-w-md mx-auto mb-6 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-200">
                           {error}
                       </div>
                   )}

                   <button 
                     onClick={handleGenerate}
                     disabled={isGenerating}
                     className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                     Generate Report
                   </button>
                </div>
              )}

              {isGenerating && !generatedReport && (
                <div className="max-w-md mx-auto py-12">
                   <div className="space-y-4">
                      {generationSteps.map((s, i) => (
                        <div key={i} className={`flex items-center gap-3 transition-all ${
                          i === generationStep ? 'text-blue-600 scale-105 font-bold' : 
                          i < generationStep ? 'text-emerald-500' : 'text-slate-300'
                        }`}>
                           {i < generationStep ? (
                             <CheckCircle2 className="w-5 h-5" />
                           ) : i === generationStep ? (
                             <Loader2 className="w-5 h-5 animate-spin" />
                           ) : (
                             <div className="w-5 h-5 rounded-full border border-slate-200"></div>
                           )}
                           <span>{s}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {generatedReport && (
                 <div className="grid grid-cols-3 gap-8">
                    <div ref={reportRef} className="col-span-2 bg-slate-50 p-6 rounded-lg border border-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-700 max-h-[600px] overflow-auto">
                       <div className="prose prose-sm max-w-none break-words dark:prose-invert">
                           <ReactMarkdown 
                               remarkPlugins={[remarkGfm]}
                               components={{
                                   p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                   ul: ({node, ...props}) => <ul className="list-disc list-inside pl-5 mb-2 space-y-1" {...props} />,
                                   ol: ({node, ...props}) => <ol className="list-decimal list-inside pl-5 mb-2 space-y-1" {...props} />,
                                   li: ({node, ...props}) => <li className="!list-item pl-1 marker:text-slate-400 !mb-0.5" {...props} />,
                                   table: ({node, ...props}) => <div className="overflow-x-auto my-2 rounded-lg border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-xs" {...props} /></div>,
                                   thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                                   th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider" {...props} />,
                                   td: ({node, ...props}) => <td className="px-3 py-2 whitespace-nowrap border-t border-slate-100" {...props} />,
                                   strong: ({node, ...props}) => <span className="font-bold text-slate-900" {...props} />,
                                   code: ({node, ...props}) => <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-pink-600" {...props} />,
                               }}
                           >
                               {generatedReport}
                           </ReactMarkdown>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 mt-0.5" />
                          <div>
                            <div className="font-bold">Compliance Verified</div>
                            <div className="text-xs mt-1 opacity-80">Report meets ISO-9001 standards.</div>
                          </div>
                       </div>
                       
                       <button 
                        onClick={() => handleDownloadPDF(undefined, "new_audit_report")}
                        className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                       >
                         <Download className="w-4 h-4" /> Download PDF
                       </button>

                       <button 
                        onClick={saveGeneratedReport}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                       >
                         <FileText className="w-4 h-4" /> Save to History
                       </button>
                    </div>
                 </div>
              )}
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {savedReports.map((report) => (
            <div key={report.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden" onClick={() => {
                setGeneratedReport(report.content);
                setShowGenerator(true);
            }}>
              <div className="absolute top-0 right-0 px-3 py-1 bg-slate-50 rounded-bl-xl border-l border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                {report.type}
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors text-sm truncate">{report.title}</h3>
              <p className="text-xs text-slate-500 mb-4">Generated: {report.date} • {report.size}</p>
              <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    report.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                    report.status === 'Review' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {report.status}
                  </span>
                  <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownloadPDF(report.content, report.title); }}
                        className="text-slate-400 hover:text-primary p-1 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => deleteReport(report.id, e)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
              </div>
            </div>
          ))}
          
          <div 
            onClick={() => setShowGenerator(true)}
            className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-primary/50 hover:bg-slate-50/50 hover:text-primary transition-all cursor-pointer group min-h-[200px]"
          >
             <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
               <Bot className="w-6 h-6" />
             </div>
             <span className="text-sm font-medium">Generate AI Report</span>
          </div>
        </div>
      )}
    </div>
  );
};
