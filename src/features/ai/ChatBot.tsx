import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Send, Bot, X, Minimize2, Loader2, Globe, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { streamOpenRouterMessage, MODELS, OpenRouterMessage, createOpenRouterSystemPrompt } from '@/services/openRouterService';

export const ChatBot = () => {
    const { isChatOpen, toggleChat, structures, user } = useAppStore();
    const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);
    
    // Chat State
    const [messages, setMessages] = useState<OpenRouterMessage[]>([
        {
            role: 'assistant',
            content: "Sentinel AI Online. Telemetry systems active. How can I assist you with the facility today?",
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isChatOpen]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: OpenRouterMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const currentModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];
            
            // Build Context
            const systemPrompt = createOpenRouterSystemPrompt(structures);
            const fullHistory: OpenRouterMessage[] = [
                { role: 'system', content: systemPrompt },
                ...messages.filter(m => m.role !== 'system'), // filter existing system msgs if any
                userMsg
            ];

            const responseText = await streamOpenRouterMessage(currentModel.key, fullHistory, currentModel.id);
            
            setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
        } catch (err: any) {
            console.error("Chat Error:", err);
            setError(err.message || "Failed to connect to AI service.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend(input);
    };

    return (
        <AnimatePresence>
            {isChatOpen && (
                <motion.div 
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 w-full sm:w-[450px] h-full bg-white sm:rounded-l-2xl shadow-2xl border-l border-slate-200 z-[100] flex flex-col overflow-hidden font-sans"
                >
                    {/* Header */}
                    <div className="p-4 bg-violet-700 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-white/10 border-white/20">
                                <Globe className="w-4 h-4 text-violet-200" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Sentinel AI</h3>
                                <p className="text-[10px] text-white/70 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    {MODELS.find(m => m.id === selectedModelId)?.name || 'AI Assistant'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={toggleChat} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><Minimize2 className="w-4 h-4" /></button>
                            <button onClick={toggleChat} className="p-1.5 hover:bg-rose-500 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-violet-100'}`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4 text-blue-600" /> : <Bot className="w-4 h-4 text-violet-600" />}
                                </div>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                                    <div className="prose prose-sm max-w-none break-words dark:prose-invert">
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                                li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                                                table: ({node, ...props}) => <div className="overflow-x-auto my-2 rounded-lg border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-xs" {...props} /></div>,
                                                thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                                                th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider" {...props} />,
                                                td: ({node, ...props}) => <td className="px-3 py-2 whitespace-nowrap border-t border-slate-100" {...props} />,
                                                strong: ({node, ...props}) => <span className="font-bold text-slate-900" {...props} />,
                                                code: ({node, ...props}) => <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-pink-600" {...props} />,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>
                                <div className="text-xs text-slate-400 flex items-center">Generating response...</div>
                            </div>
                        )}
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center gap-2">
                                <span className="font-bold">Error:</span> {error}
                                <button onClick={() => setMessages(prev => prev.slice(0, -1))} className="ml-auto underline">Undo</button>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-200">
                         {/* Suggestions */}
                         {!isLoading && (
                            <div className="flex gap-2 mb-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                {(user?.email === 'worker@smartnode.io' ? [
                                    { label: "📋 My Tasks", prompt: "Summarize my pending maintenance tasks and their due dates." },
                                    { label: "🔧 Repair Guide", prompt: "How do I recalibrate a vibration sensor manually?" },
                                    { label: "⚠️ Safety", prompt: "What are the safety protocols for working at height on towers?" },
                                    { label: "📝 Draft Report", prompt: "Help me write a damage report for a corroded bridge cable." }
                                ] : [
                                    { label: "📊 Structure Status", prompt: "Give me a table summary of all structures with their health status and sensor count." },
                                    { label: "🚨 Critical Risks", prompt: "Which structures are in critical condition and what are the specific risks?" },
                                    { label: "📝 Maintenance Plan", prompt: "Draft a maintenance protocol based on current telemetry data." },
                                    { label: "📄 Generate Report", prompt: "Generate a full structural status report including executive summary." }
                                ]).map((s, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleSend(s.prompt)}
                                        className="text-[10px] whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-full border border-slate-200 transition-colors"
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                         )}

                         {/* Model Selector */}
                         <select 
                            value={selectedModelId} onChange={(e) => setSelectedModelId(e.target.value)}
                            className="w-full text-[10px] text-slate-500 font-bold mb-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 outline-none"
                        >
                            {MODELS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>

                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <input 
                                value={input} 
                                onChange={(e) => setInput(e.target.value)} 
                                placeholder="Type your message..." 
                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                            <button type="submit" disabled={!input.trim() || isLoading} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
