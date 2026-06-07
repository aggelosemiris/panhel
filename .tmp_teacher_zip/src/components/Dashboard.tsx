import React from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, FileText, CheckCircle, BookOpen, 
  Settings, User, Bell, LogOut, ArrowRight, Brain, Zap, Sparkles,
  Trophy, GraduationCap, LayoutGrid, Clock, ClipboardList, BookMarked,
  BarChart3, FileSignature, HelpCircle
} from 'lucide-react';

interface DashboardProps {
  onSelectTool: (tool: 'chat' | 'exam' | 'quiz' | 'exercise') => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
  onOpenMenu: () => void;
}

export default function Dashboard({ onSelectTool, onLogout, onToggleTheme, darkMode, onOpenMenu }: DashboardProps) {
  const mainUnits = [
    {
      id: 'chat',
      title: 'Cortex AI Engine',
      desc: 'Ο πιο δυνατός τρόπος να λύνεις απορίες, να παίρνεις reasoning και να δουλεύεις ύλη σαν να έχεις καθηγητή δίπλα σου.',
      icon: LayoutGrid,
      badge: 'ELITE',
      color: 'blue',
      tool: 'chat'
    },
    {
      id: 'quiz',
      title: 'Quiz Θεωρίας',
      desc: 'Έλεγχος κατανόησης ανά μάθημα και κεφάλαιο με score και καθαρό feedback.',
      icon: GraduationCap,
      badge: 'QUIZ',
      color: 'blue',
      tool: 'quiz'
    },
    {
      id: 'sos',
      title: 'SOS Θέματα',
      desc: 'Τα πιο κρίσιμα μοτίβα των τελευταίων ετών μαζεμένα για γρήγορη επανάληψη.',
      icon: Sparkles,
      badge: 'MUST',
      color: 'blue',
      tool: 'exercise'
    },
    {
      id: 'book',
      title: 'Διαδραστικό Βιβλίο',
      desc: 'Θεωρία, κεφάλαια και οργανωμένη μελέτη μέσα σε μία ενιαία εμπειρία.',
      icon: BookOpen,
      badge: 'CORE',
      color: 'blue',
      tool: 'chat'
    }
  ];

  const secondaryTools = [
    { id: 'exam', name: 'Διαγωνίσματα', desc: 'Εξάσκηση ανά κεφάλαιο, difficulty tiers και έτοιμη πορεία μελέτης.', icon: FileSignature, badge: 'TESTS', tool: 'exam' },
    { id: 'old', name: 'Παλαιές Εξετάσεις', desc: 'Πανελλήνιες και ΟΕΦΕ σε καθαρό PDF viewer για σοβαρή επανάληψη.', icon: Clock, badge: 'PDF', tool: 'exercise' },
    { id: 'gen', name: 'Generator', desc: 'Φτιάξε δικό σου διαγώνισμα.', icon: Settings, tool: 'exam' },
    { id: 'stats', name: 'Στατιστικά', desc: 'Προφίλ μαθητή και επίδοση.', icon: Trophy, tool: 'chat' },
    { id: 'tf', name: 'Σωστό / Λάθος', desc: 'Γρήγορη θεωρητική επανάληψη.', icon: GraduationCap, tool: 'quiz' },
    { id: 'ex', name: 'Μεμονωμένες Ασκήσεις', desc: 'Μεμονωμένες ασκήσεις από κάθε ξεχωριστό κεφάλαιο.', icon: FileText, tool: 'exercise' },
    { id: 'oefe', name: 'ΟΕΦΕ', desc: 'Παλαιότερα θέματα ΟΕΦΕ.', icon: Clock, tool: 'exercise' }
  ];

  return (
    <div id="dashboard-view" className="min-h-screen bg-[#FDFEFE] dark:bg-[#0F172A] flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-[#1E293B] px-8 py-4 flex justify-between items-center border-b border-gray-100 dark:border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenMenu}
            className="bg-[#3B82F6] h-10 w-10 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-100 hover:scale-110 transition-all cursor-pointer"
          >
            <span className="font-bold text-lg">Ψ</span>
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest leading-none">ΨΗΦΙΑΚΟ ΦΡΟΝΤΙΣΤΗΡΙΟ+</span>
            <span className="text-lg font-black text-gray-900 dark:text-white leading-tight">Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={onToggleTheme}
            className="h-10 w-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 transition-all"
          >
            {darkMode ? <Zap className="w-5 h-5 text-yellow-400" /> : <Clock className="w-5 h-5" />}
          </button>
          <button onClick={onLogout} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest">Logout</button>
          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
             <User className="w-4 h-4" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-8 space-y-12 pb-24">
        
        {/* Course Plan Card */}
        <section className="relative bg-[#1A2E26] rounded-[48px] p-10 overflow-hidden shadow-2xl shadow-emerald-900/10">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
            <div className="space-y-6 max-w-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">ΠΛΑΤΦΟΡΜΑ ΠΡΟΕΤΟΙΜΑΣΙΑΣ</span>
                </div>
                <h1 className="text-6xl font-black text-white tracking-tighter leading-none font-display">Το Πλάνο σου</h1>
                <p className="text-white/60 text-lg font-medium leading-relaxed italic">
                    Γεια σου aggelossss. Συνέχισε από εκεί που σταμάτησες και κράτα ρυθμό με ξεκάθαρη εικόνα προόδου.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
              {[
                { label: 'ΣΥΝΟΛΙΚΗ ΑΚΡΙΒΕΙΑ', value: '0%', color: 'white' },
                { label: 'ΑΠΑΝΤΗΜΕΝΕΣ ΕΡΩΤΗΣΕΙΣ', value: '0', color: 'white' },
                { label: 'STUDY STREAK', value: '12', sub: 'ημέρες', color: 'white' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/90 backdrop-blur-xl rounded-[32px] p-8 text-center min-w-[140px] flex flex-col justify-center gap-1 shadow-xl">
                  <p className="text-4xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-sm font-black text-gray-900 uppercase leading-tight">{stat.sub}</p>
                  <div className="mt-2 h-px w-8 bg-gray-200 mx-auto"></div>
                  <p className="text-[8px] font-black text-gray-400 mt-2 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects Progress */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Μαθηματικά', progress: 45, color: 'bg-blue-500' },
            { name: 'ΑΟΘ', progress: 72, color: 'bg-emerald-500' },
            { name: 'ΑΕΠΠ', progress: 58, color: 'bg-indigo-500' }
          ].map((sub, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="font-black text-gray-700 italic">{sub.name}</span>
                <span className="font-black text-gray-900">{sub.progress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                <div className={`h-full ${sub.color} rounded-full`} style={{ width: `${sub.progress}%` }}></div>
              </div>
            </div>
          ))}
        </section>

        {/* Main Sections */}
        <section className="space-y-8">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">ΚΥΡΙΕΣ ΕΝΟΤΗΤΕΣ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainUnits.map((unit) => (
              <motion.button
                key={unit.id}
                whileHover={{ y: -8 }}
                onClick={() => onSelectTool(unit.tool as any)}
                className={`bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-left flex flex-col items-start gap-8 group`}
              >
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full tracking-widest">{unit.badge}</span>
                   <div className="bg-blue-50/50 p-2.5 rounded-xl text-blue-600">
                     <unit.icon className="w-5 h-5" />
                   </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-gray-900 italic font-display">{unit.title}</h3>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">{unit.desc}</p>
                </div>

                <div className="mt-6 text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:gap-4 flex items-center transition-all">
                  ΕΙΣΟΔΟΣ &gt;
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Auxiliary Tools */}
        <section className="space-y-8">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">ΒΟΗΘΗΤΙΚΑ ΕΡΓΑΛΕΙΑ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secondaryTools.map((tool) => (
              <motion.button
                key={tool.id}
                whileHover={{ y: -4 }}
                onClick={() => onSelectTool(tool.tool as any)}
                className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all text-left flex items-center gap-6"
              >
                <div className="bg-gray-50 h-16 w-16 rounded-3xl flex items-center justify-center text-gray-400 border border-gray-100/50">
                  <tool.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                     <h4 className="font-black text-gray-900 italic">{tool.name}</h4>
                     {tool.badge && <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{tool.badge}</span>}
                  </div>
                  <p className="text-xs text-gray-400 font-medium">{tool.desc}</p>
                  <div className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-2">ΕΙΣΟΔΟΣ &gt;</div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Tip Bar */}
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 flex items-center gap-4 text-white shadow-xl shadow-blue-200">
           <Zap className="w-6 h-6 text-yellow-300" />
           <p className="font-bold text-sm">
             <span className="font-black mr-2">Συμβουλή:</span>
             Αν είσαι στην αρχή, ξεκίνα από θεωρία και μετά κάνε ένα Quiz Θεωρίας τουλάχιστον μία φορά την εβδομάδα.
           </p>
        </section>

      </main>
    </div>
  );
}
