import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, CheckCircle, Lightbulb, ArrowLeft, Loader2, Sparkles, 
  ChevronRight, BookOpen, Calculator, Terminal, Zap, Brain
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { generateStudyContent } from '../services/geminiService';

import { SubjectId, SYLLABUS } from '../constants/syllabus';

interface StudyToolsProps {
  onBack: () => void;
  initialTool?: ToolType;
  subjectId: SubjectId | null;
}

type ToolType = 'exam' | 'quiz' | 'exercise' | null;

export default function StudyTools({ onBack, initialTool = null, subjectId }: StudyToolsProps) {
  const [activeTool, setActiveTool] = useState<ToolType>(initialTool);
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const subject = SYLLABUS.find(s => s.id === subjectId) || SYLLABUS[0];

  const handleGenerate = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const result = await generateStudyContent(activeTool || 'exercise', topic);
      setContent(result);
    } catch (error) {
      console.error(error);
      setContent('Σφάλμα κατά την παραγωγή. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderToolContent = () => {
    if (activeTool === 'exercise' && topic.includes('SOS')) {
       return (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[
             { title: 'Παράγωγοι, μονοτονία, ακρότατα', cap: 'Κεφάλαιο 2', freq: '95%', years: '2025 • 2024 • 2023' },
             { title: 'Όρια, συνέχεια και Θ.Ε.Τ.', cap: 'Κεφάλαιο 1', freq: '88%', years: '2025 • 2024 • 2022' },
             { title: 'Ολοκληρώματα και εμβαδόν', cap: 'Κεφάλαιο 3', freq: '72%', years: '2024 • 2023 • 2021' },
           ].map((sos, i) => (
             <div key={i} className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/5 rounded-3xl p-8 space-y-6 shadow-sm hover:shadow-xl transition-all group">
               <div className="flex justify-between items-start">
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{subject.name}</span>
                 <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-2 py-1 rounded-md">{sos.freq} συχνότητα</span>
               </div>
               <div>
                  <h4 className="font-black text-xl text-gray-900 dark:text-white italic leading-tight mb-2">{sos.title}</h4>
                  <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">{sos.cap}</p>
               </div>
               <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Εμφανίζεται σχεδόν κάθε χρόνο και ενώνει τεχνικές παραγώγου με αιτιολόγηση.</p>
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Έτη: {sos.years}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-gray-50 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-100 transition-colors">Ζήτα SOS επανάληψη</button>
                    <button className="flex-1 bg-gray-50 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest py-3 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-100 transition-colors">Δες σχετικό θέμα</button>
                  </div>
               </div>
             </div>
           ))}
         </div>
       );
    }

    if (activeTool === 'exercise' && topic.includes('Βιβλίο')) {
      return (
        <div className="flex justify-center py-20">
          <div className="bg-white dark:bg-[#1E293B] rounded-[40px] p-12 border border-gray-100 dark:border-white/5 shadow-2xl max-w-2xl w-full text-center space-y-8">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white italic font-display">Ενότητα Α: Διαδραστικό Εγχειρίδιο - Θεωρία</h3>
            <p className="text-gray-400 font-medium">Μάθημα: {subject.fullName}</p>
            <div className="p-8 border-2 border-dashed border-blue-100 dark:border-white/5 rounded-[32px] space-y-6">
               <h4 className="font-black text-gray-900 dark:text-white italic">Επίσημα Σχολικά Βιβλία</h4>
               <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-4 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                 <BookOpen className="w-6 h-6" /> Σχολικό Βιβλίο (Κύριο)
               </button>
               <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl text-left space-y-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">💡 Χρησιμοποιήστε τα επίσημα βιβλία για όλο το θεωρητικό περιεχόμενο.</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">📚 Το περιεχόμενο προέρχεται από το Υπουργείο Παιδείας.</p>
               </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-24">
                <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
                <div className="text-center">
                    <p className="font-black text-gray-900 dark:text-white text-xl italic font-display tracking-tight">Σχεδιάζω το υλικό σου...</p>
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-[0.2em] animate-pulse">Generating context-aware content</p>
                </div>
            </div>
        ) : content ? (
            <div className="prose prose-indigo dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-black prose-headings:italic prose-headings:font-display prose-p:leading-relaxed animate-in fade-in duration-1000">
                 <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{content}</ReactMarkdown>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-24">
                <Sparkles className="w-16 h-16 text-gray-200 dark:text-white/5" />
                <p className="max-w-xs font-bold text-gray-400 text-sm leading-relaxed">
                    Επίλεξε μία ενότητα παραπάνω για να ξεκινήσουμε την παραγωγή.
                </p>
            </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFBFF] dark:bg-[#0F172A] font-sans">
      <header className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1E293B] backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all font-bold text-xs flex items-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Πίσω στα μαθήματα
          </button>
          <div className="flex flex-col ml-4">
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest leading-none">STUDY CENTER</span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter italic font-display lowercase first-letter:uppercase">
              {activeTool === 'quiz' ? 'Quiz Θεωρίας' : activeTool === 'exercise' ? 'Μεμονωμένες Ασκήσεις' : 'Διαγωνίσματα'}
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-1">Επίλεξε κεφάλαιο για να μεταφερθείς στο αντίστοιχο {activeTool === 'quiz' ? 'quiz' : 'θέμα'}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Cortex 3.1 Pro Enabled</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Smart Quiz / Global Tool Section */}
          <section className="bg-white dark:bg-[#1E293B] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 font-black text-xl text-gray-900 dark:text-white italic">
               <span className="text-2xl">📘</span> {subject.name}
            </h3>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-black/10 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
              <div className="space-y-1">
                <h4 className="font-black text-gray-900 dark:text-white italic">Smart {activeTool === 'quiz' ? 'Quiz' : 'Work'}</h4>
                <p className="text-xs text-gray-400 font-medium max-w-sm">Προτεραιότητα στα πιο αδύναμα κεφάλαιά σου. Αν δεν υπάρχουν stats, γίνεται κανονικό random {activeTool === 'quiz' ? 'quiz' : 'θέμα'}.</p>
              </div>
              <button className="bg-[#10B981] hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs transition-all shadow-lg shadow-emerald-200/20">
                Ξεκίνα Smart {activeTool === 'quiz' ? 'Quiz' : 'Work'}
              </button>
            </div>
          </section>

          {/* Chapters List */}
          <section className="bg-white dark:bg-[#1E293B] rounded-[32px] p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
            <h3 className="font-black text-gray-900 dark:text-white italic">{subject.name}</h3>
            
            <div className="space-y-4">
              {activeTool === 'exercise' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <button onClick={() => setTopic('SOS Θέματα')} className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 font-bold text-xs hover:bg-red-100 transition-all">SOS Θέματα</button>
                  <button onClick={() => setTopic('Διαδραστικό Βιβλίο')} className="bg-blue-50 text-blue-600 p-4 rounded-2xl border border-blue-100 font-bold text-xs hover:bg-blue-100 transition-all">Σχολικό Βιβλίο</button>
                  <button onClick={() => setTopic('Παλαιές Εξετάσεις')} className="bg-amber-50 text-amber-600 p-4 rounded-2xl border border-amber-100 font-bold text-xs hover:bg-amber-100 transition-all">Παλαιές Εξετάσεις</button>
                  <button onClick={() => setTopic('ΟΕΦΕ')} className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl border border-emerald-100 font-bold text-xs hover:bg-emerald-100 transition-all">Θέματα ΟΕΦΕ</button>
                </div>
              )}
              {subject.chapters.map((chapter) => (
                <div 
                  key={chapter.id} 
                  className={`border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden transition-all ${expandedChapter === chapter.id ? 'ring-2 ring-blue-500/20 shadow-lg' : ''}`}
                >
                  <button 
                    onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                    className={`w-full flex items-center justify-between p-6 bg-white dark:bg-[#1E293B] text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-all`}
                  >
                    <div>
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">ΚΕΦΑΛΑΙΟ {chapter.id}</span>
                      <h5 className="font-black text-gray-900 dark:text-white italic">{chapter.title}</h5>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedChapter === chapter.id ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {expandedChapter === chapter.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-gray-50/50 dark:bg-black/10 border-t border-gray-100 dark:border-white/5 overflow-hidden"
                      >
                        <div className="p-8 space-y-6">
                          {chapter.subsections ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {chapter.subsections.map((sub, idx) => (
                                <button 
                                  key={idx}
                                  onClick={() => { setTopic(`${subject.name} ${chapter.title} - ${sub}`); }}
                                  className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-xl text-left hover:border-blue-500 transition-all group"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md">{chapter.id}.{idx+1}</span>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{sub}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex gap-4">
                              <button 
                                onClick={() => setTopic(`${subject.name} ${chapter.title}`)}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-xs"
                              >
                                {activeTool === 'quiz' ? 'Ξεκίνα Quiz' : 'Δείτε Θέματα'}
                              </button>
                            </div>
                          )}

                          {activeTool === 'exam' && (
                            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                              <button onClick={() => setTopic(`${subject.name} ${chapter.title} - Διαγώνισμα 1`)} className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">1ο διαγώνισμα</button>
                              <button onClick={() => setTopic(`${subject.name} ${chapter.title} - Διαγώνισμα 2`)} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">2ο διαγώνισμα</button>
                              <button onClick={() => setTopic(`${subject.name} ${chapter.title} - Διαγώνισμα 3`)} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">3ο διαγώνισμα</button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>

          {/* Conditional Generation Modal/Section */}
          {topic && (
            <section className="bg-white dark:bg-[#1E293B] rounded-[48px] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden mt-12">
               <div className="p-8 md:p-12 bg-gray-50/50 dark:bg-black/10 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="bg-blue-600 p-4 rounded-[24px] shadow-xl shadow-blue-100">
                       <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h4 className="font-black text-3xl text-gray-900 dark:text-white italic font-display tracking-tight">
                            Παραγωγή {topic}
                        </h4>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] mt-1">Cortex AI Precision Engine</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-100"
                    >
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Δημιουργία</span>}
                    </button>
                    <button onClick={() => setTopic('')} className="bg-gray-100 dark:bg-white/5 text-gray-400 px-6 rounded-2xl font-bold hover:bg-gray-200 transition-all">Άκυρο</button>
                  </div>
               </div>

                <div className="p-8 md:p-16 min-h-[500px] bg-white dark:bg-[#1E293B]">
                    {renderToolContent()}
                </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
