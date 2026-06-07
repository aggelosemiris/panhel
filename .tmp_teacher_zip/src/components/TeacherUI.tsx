import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, User, Bot, Sparkles, Loader2, Brain, BookOpen, Clock, 
  Menu, X, Plus, Trash2, Paperclip, FileText, Image as ImageIcon, MessageSquare,
  GraduationCap, ArrowLeft, Sun, Moon, Settings
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { streamChat, ChatMessage, ChatPart } from '../services/geminiService';
import { ChatSession, loadSessions, saveSessions, createNewSession } from '../lib/storage';
import StudyTools from './StudyTools';

interface AttachedFile {
  id: string;
  name: string;
  base64: string;
  mimeType: string;
  preview: string;
}

import { SubjectId, SYLLABUS } from '../constants/syllabus';

interface TeacherUIProps {
  onBack?: () => void;
  subjectId: SubjectId | null;
  onToggleTheme?: () => void;
  darkMode?: boolean;
}

export default function TeacherUI({ onBack, subjectId, onToggleTheme, darkMode }: TeacherUIProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const subject = SYLLABUS.find(s => s.id === subjectId);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [view, setView] = useState<'chat' | 'tools'>('chat');
  
  const [isDragging, setIsDragging] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const processFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = (ev.target?.result as string).split(',')[1];
        const preview = ev.target?.result as string;
        
        setAttachedFiles(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          base64,
          mimeType: file.type,
          preview: file.type.startsWith('image/') ? preview : ''
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Reset states when switching sessions
  useEffect(() => {
    // Abort previous stream if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setCurrentResponse('');
    setInput('');
    setAttachedFiles([]);
  }, [activeSessionId]);

  // Load sessions on mount
  useEffect(() => {
    const loaded = loadSessions();
    if (loaded.length > 0) {
      setSessions(loaded);
      // If last session was long ago, start a new one? 
      // User requested: "every time he comes back after a long time, take him to a new chat"
      // Let's check how long. Say 4 hours.
      const lastSession = loaded.sort((a, b) => b.updatedAt - a.updatedAt)[0];
      const now = Date.now();
      const fourHours = 4 * 60 * 60 * 1000;
      
      if (now - lastSession.updatedAt > fourHours) {
        const newSess = createNewSession();
        setSessions([newSess, ...loaded]);
        setActiveSessionId(newSess.id);
      } else {
        setActiveSessionId(lastSession.id);
      }
    } else {
      const newSess = createNewSession();
      setSessions([newSess]);
      setActiveSessionId(newSess.id);
    }
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
    }
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentResponse, attachedFiles]);

  const handleNewChat = () => {
    const newSess = createNewSession();
    setSessions(prev => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
    setSidebarOpen(false);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    
    if (updated.length === 0) {
      const newSess = createNewSession();
      setSessions([newSess]);
      setActiveSessionId(newSess.id);
    } else {
      setSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (isLoading || (!input.trim() && attachedFiles.length === 0) || !activeSessionId) return;

    const currentInput = input;
    const currentFiles = [...attachedFiles];

    setIsLoading(true);
    setInput('');
    setAttachedFiles([]);
    setCurrentResponse('');

    const parts: ChatPart[] = [];
    if (currentInput.trim()) parts.push({ text: currentInput });
    currentFiles.forEach(f => {
      parts.push({ inlineData: { mimeType: f.mimeType, data: f.base64 } });
    });

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', parts };
    const targetSessionId = activeSessionId;

    setSessions(prev => {
      const activeSess = prev.find(s => s.id === targetSessionId);
      if (!activeSess) return prev;

      let newTitle = activeSess.title;
      if (activeSess.messages.length === 0 && currentInput.trim()) {
        newTitle = currentInput.substring(0, 30) + (currentInput.length > 30 ? "..." : "");
      }

      return prev.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            title: newTitle,
            messages: [...s.messages, userMessage],
            updatedAt: Date.now()
          };
        }
        return s;
      });
    });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Use the local messages to ensure consistency
      const currentMessages = [...messages, userMessage];
      let fullResponse = '';
      
      const stream = streamChat(currentMessages);
      for await (const chunk of stream) {
        if (abortController.signal.aborted) return;
        fullResponse += chunk;
        setCurrentResponse(fullResponse);
      }

      if (abortController.signal.aborted) return;

      setSessions(prev => prev.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            messages: [...s.messages, { id: crypto.randomUUID(), role: 'model', parts: [{ text: fullResponse }] }],
            updatedAt: Date.now()
          };
        }
        return s;
      }));
      setCurrentResponse('');
    } catch (error) {
      if (abortController.signal.aborted) return;
      console.error("Chat Error:", error);
      setSessions(prev => prev.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            messages: [...s.messages, { id: crypto.randomUUID(), role: 'model', parts: [{ text: "Λυπάμαι, παρουσιάστηκε ένα σφάλμα. Παρακαλώ δοκιμάστε ξανά." }] }],
            updatedAt: Date.now()
          };
        }
        return s;
      }));
    } finally {
      if (!abortController?.signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  const getMessageText = (message: ChatMessage) => {
    return message.parts.filter(p => p.text).map(p => p.text).join('\n') || "";
  };

  const getMessageImages = (message: ChatMessage) => {
    return message.parts.filter(p => p.inlineData && p.inlineData.mimeType.startsWith('image/'));
  };

  return (
    <div id="teacher-app" className="flex h-screen bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        id="chat-sidebar"
        className={`fixed md:relative z-50 w-72 h-full bg-[#111827] text-white flex flex-col transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          <button 
            onClick={handleNewChat}
            className="flex items-center gap-3 w-full p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors mb-4 group shrink-0"
          >
            <Plus className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm">Νέα Συνομιλία</span>
          </button>

          <button 
            onClick={() => { setView('tools'); setSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full p-4 rounded-xl transition-colors mb-6 group shrink-0 ${
              view === 'tools' ? 'bg-indigo-600 text-white' : 'border border-white/10 text-indigo-300 hover:bg-white/5'
            }`}
          >
            <GraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm">Study Center</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest px-2 mb-2">Ιστορικό</p>
            {sessions.map(s => (
              <div 
                key={s.id}
                onClick={() => {
                  setActiveSessionId(s.id);
                  setSidebarOpen(false);
                }}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                  activeSessionId === s.id ? 'bg-indigo-600/20 text-indigo-100 ring-1 ring-indigo-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${activeSessionId === s.id ? 'text-indigo-400' : 'text-gray-600'}`} />
                  <span className="text-sm truncate pr-2">{s.title}</span>
                </div>
                <button 
                  onClick={(e) => deleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{subject?.name || 'Επιλέξτε Μάθημα'}</p>
                <p className="text-[10px] text-gray-500">Premium AI Mentor</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full relative min-w-0">
        <AnimatePresence mode="wait">
          {view === 'tools' ? (
            <motion.div 
              key="tools"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <StudyTools onBack={() => setView('chat')} subjectId={subjectId} />
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
        {/* Header */}
        <header className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            {onBack ? (
              <button 
                onClick={onBack}
                className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors group"
              >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <div className="bg-indigo-600 p-2 rounded-lg hidden md:block">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="truncate">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate flex items-center gap-2">
                {activeSession?.title || `Καθηγητής ${subject?.name || 'AI'}`}
                {subject && <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">{subject.name}</span>}
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tighter leading-none mt-0.5">Cortex AI Precision Tutor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-1 hidden sm:block"></div>
            
            <div className="hidden sm:flex items-center gap-1 bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded-full border border-green-100 dark:border-green-500/20">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase">Online</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main 
          ref={scrollRef} 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 overflow-y-auto px-4 py-8 custom-scrollbar relative transition-colors ${
            isDragging ? 'bg-indigo-50/50' : ''
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-indigo-500/10 pointer-events-none">
              <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border-2 border-dashed border-indigo-400 animate-in zoom-in-95">
                <Paperclip className="w-12 h-12 text-indigo-500 animate-bounce" />
                <p className="text-xl font-bold text-indigo-700">Αφήστε τα αρχεία εδώ</p>
              </div>
            </div>
          )}
          <div className="max-w-4xl mx-auto space-y-8">
            <AnimatePresence initial={false}>
              {messages.length === 0 && (
                <motion.div 
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 space-y-12"
                >
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                    <div className="relative bg-white p-6 rounded-3xl shadow-2xl border border-indigo-50 flex items-center justify-center">
                      <Sparkles className="w-16 h-16 text-indigo-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                      Καλώς ήρθες στο μάθημα <br/><span className="text-indigo-600 dark:text-indigo-400">{subject?.fullName || 'σου'}</span>
                    </h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                      Είμαι ο προσωπικός σου μέντορας για το μάθημα: <span className="font-bold">{subject?.name}</span>. Ρώτησέ με οτιδήποτε για τη θεωρία ή τις ασκήσεις.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(subject?.chapters.slice(0, 4).map((chapter, i) => (
                      <button 
                        key={i}
                        onClick={() => setInput(`Θέλω να ξεκινήσω επανάληψη στο κεφάλαιο: ${chapter.title}`)}
                        className="p-5 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all text-left group"
                      >
                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{chapter.title}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Ενότητα {chapter.id}</p>
                      </button>
                    )) || [
                      { t: "Υπολόγισε Ed & Es", d: "Ασκήσεις ΑΟΘ" },
                      { t: "Αλγόριθμος Ταξινόμησης", d: "ΑΕΠΠ / Πληροφορική" },
                      { t: "Ολοκληρώματα & Όρια", d: "Μαθηματικά" },
                      { t: "Ανάλυση Γραφήματος", d: "Ανέβασε φωτογραφία" }
                    ].map((card, i) => (
                      <button 
                        key={i}
                        onClick={() => setInput(card.t)}
                        className="p-5 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left group"
                      >
                        <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600">{card.t}</p>
                        <p className="text-xs text-gray-400 mt-1">{card.d}</p>
                      </button>
                    )))}
                  </div>
                </motion.div>
              )}

              {messages.map((message, index) => {
                const text = getMessageText(message);
                const images = getMessageImages(message);
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[90%] md:max-w-[80%] gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                        message.role === 'user' ? 'bg-gray-800' : 'bg-indigo-600'
                      }`}>
                        {message.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex flex-col gap-2">
                        {images.length > 0 && (
                          <div className="flex gap-2 flex-wrap mb-1">
                            {images.map((img, i) => (
                              <img 
                                key={i} 
                                src={`data:${img.inlineData?.mimeType};base64,${img.inlineData?.data}`} 
                                alt="Uploaded" 
                                className="w-48 h-48 object-cover rounded-xl border border-gray-200 shadow-sm"
                              />
                            ))}
                          </div>
                        )}
                        <div className={`rounded-2xl px-6 py-4 shadow-sm ${
                          message.role === 'user' 
                            ? 'bg-white text-gray-800 rounded-tr-none border border-gray-200' 
                            : 'bg-white text-gray-800 rounded-tl-none border border-indigo-100'
                        }`}>
                          <div className="prose prose-sm max-w-none prose-slate prose-headings:text-gray-900 prose-p:leading-relaxed overflow-x-auto">
                            <ReactMarkdown 
                              remarkPlugins={[remarkMath]} 
                              rehypePlugins={[rehypeKatex]}
                            >
                              {text}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {(isLoading || currentResponse) && (
                <motion.div
                  key="loading-indicator"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex max-w-[90%] md:max-w-[80%] gap-4">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white text-gray-900 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm border border-indigo-100 min-h-[56px] flex flex-col justify-center relative overflow-hidden">
                      {currentResponse ? (
                        <div className="prose prose-sm max-w-none prose-slate overflow-x-auto">
                          <ReactMarkdown 
                            remarkPlugins={[remarkMath]} 
                            rehypePlugins={[rehypeKatex]}
                          >
                            {currentResponse}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-indigo-600 italic">
                          <div className="flex gap-1">
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></motion.div>
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></motion.div>
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></motion.div>
                          </div>
                          <span className="text-xs font-bold tracking-widest">ΣΚΕΦΤΟΜΑΙ...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Input Bar */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto p-4 flex flex-col gap-3">
            {/* File Previews */}
            {attachedFiles.length > 0 && (
              <div className="flex gap-2 flex-wrap pb-2 animate-in slide-in-from-bottom-2">
                {attachedFiles.map(file => (
                  <div key={file.id} className="relative group shrink-0">
                    {file.preview ? (
                      <img src={file.preview} className="w-14 h-14 object-cover rounded-xl border border-gray-200 shadow-sm" alt="Preview"/>
                    ) : (
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 shadow-sm">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="absolute -top-1 -right-1 bg-gray-900 text-white p-0.5 rounded-full hover:bg-red-500 transition-colors shadow-lg"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center p-1">
                      <p className="text-[8px] text-white font-bold truncate max-w-full">{file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition-all h-12 w-12 flex items-center justify-center shrink-0"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                multiple 
                accept="image/*,application/pdf"
              />

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Πληκτρολόγησε ερώτηση ή ανέβασε αρχείο..."
                rows={1}
                className="flex-1 max-h-48 py-3 px-2 bg-transparent border-none focus:ring-0 text-sm md:text-base resize-none custom-scrollbar min-h-[48px]"
                style={{ height: 'auto', minHeight: '48px' }}
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                className="h-12 w-12 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-gray-300 disabled:shadow-none transition-all flex items-center justify-center shrink-0 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
          <div className="px-4 pb-2 text-[8px] text-center text-gray-400 font-bold uppercase tracking-widest space-x-2">
            <span>Powered by Gemini 3.1 Pro &reg;</span>
            <span className="text-gray-200">|</span>
            <span>4ο Πεδίο - High Precision Mode activated</span>
          </div>
        </div>
      </motion.div>
      )}
      </AnimatePresence>
    </div>
  </div>
);
}
