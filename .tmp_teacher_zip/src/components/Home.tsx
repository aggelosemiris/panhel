import React from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles, GraduationCap, ArrowRight, CheckCircle2, ShieldCheck, Zap, Laptop, BookOpen, MessageCircle } from 'lucide-react';

interface HomeProps {
  onStart: () => void;
}

export default function Home({ onStart }: HomeProps) {
  return (
    <div id="home-page" className="min-h-screen bg-[#FDFEFE] text-[#111827] font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#3B82F6] h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <span className="font-bold text-xl">Ψ</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest leading-none">ΨΗΦΙΑΚΟ ΦΡΟΝΤΙΣΤΗΡΙΟ+</span>
            <span className="text-xl font-black tracking-tight font-display italic">Panhel<span className="text-blue-600">AI</span></span>
          </div>
        </div>
        <button 
          onClick={onStart}
          className="bg-[#111827] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 uppercase tracking-widest"
        >
          Είσοδος
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 pt-24 pb-40 flex flex-col items-center text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 bg-blue-50 border border-blue-100 px-5 py-2 rounded-full mb-10 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
          <span className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em]">Cortex AI Engine v3.1 Precision</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-10 max-w-5xl font-display italic"
        >
          Η απόλυτη εμπειρία <br/><span className="text-blue-600">Προετοιμασίας.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mb-16 font-medium leading-relaxed"
        >
          Η πιο εξελιγμένη AI πλατφόρμα για το <span className="text-gray-900 font-bold">4ο Πεδίο</span>. 
          Εξειδικευμένοι αλγόριθμοι για ΑΟΘ, ΑΕΠΠ και Μαθηματικά Προσανατολισμού που σκέφτονται όπως ο καθηγητής σου.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
        >
          <button 
            onClick={onStart}
            className="bg-[#3B82F6] text-white px-12 py-6 rounded-[32px] font-black text-xl hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-200 group"
          >
            Ξεκίνα Τώρα
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-24 border-y border-gray-50">
        <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                {[
                    { label: 'ΕΝΤΟΣ ΥΛΗΣ', value: '100%' },
                    { label: 'ΑΚΡΙΒΕΙΑ AI', value: '99.9%' },
                    { label: 'ΔΙΑΘΕΣΙΜΟΤΗΤΑ', value: '24/7' },
                    { label: 'ΕΠΙΤΥΧΙΑ', value: 'TOP' }
                ].map((stat, i) => (
                    <div key={i} className="space-y-1">
                        <p className="text-5xl font-black text-gray-900 font-display italic tracking-tighter">{stat.value}</p>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* High-End Features Grid */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-8 space-y-24">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.4em]">FEATURES</h2>
            <h3 className="text-5xl font-black text-gray-900 tracking-tight font-display italic leading-none">Γιατί το PanhelAI είναι διαφορετικό.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { title: 'Cortex Engine', desc: 'Χρησιμοποιούμε Gemni 3.1 Pro και Claude 3.5 για την παραγωγή του πιο ποιοτικού ακαδημαϊκού περιεχομένου.', icon: Zap },
                { title: 'Interactive Learning', desc: 'Διαδραστικά βιβλία και κουίζ που προσαρμόζονται στο επίπεδο των γνώσεων σου.', icon: BookOpen },
                { title: 'Exam Simulation', desc: 'Πλήρης προσομοίωση των Πανελληνίων με θέματα Α, Β, Γ, Δ και αναλυτικές λύσεις.', icon: Laptop },
                { title: 'Direct Mentor', desc: 'Σου δίνει reasoning και όχι απλά απαντήσεις, βοηθώντας σε να καταλάβεις το "γιατί".', icon: MessageCircle },
                { title: 'Updated Syllabus', desc: 'Αυστηρά ακολουθούμενη ύλη 2026, χωρίς περιττό υλικό ή παρωχημένες ασκήσεις.', icon: ShieldCheck },
                { title: 'Fast & Reliable', desc: 'Αστραπιαίες απαντήσεις και δημιουργία υλικού σε δευτερόλεπτα.', icon: Sparkles }
            ].map((feature, i) => (
                <div key={i} className="bg-white p-10 rounded-[40px] border border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all space-y-6">
                    <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600">
                        <feature.icon className="w-7 h-7" />
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 italic font-display">{feature.title}</h4>
                    <p className="text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 border-t border-gray-50 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
             <div className="flex items-center gap-3">
                <div className="bg-[#3B82F6] h-8 w-8 rounded-lg flex items-center justify-center text-white">
                   <span className="font-bold text-sm">Ψ</span>
                </div>
                <span className="font-black text-xl italic font-display">PanhelAI</span>
             </div>
             <p className="text-gray-400 text-sm font-medium">Built for Excellence in 4th Field Preparation.</p>
          </div>
          <div className="flex gap-12 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-gray-100 text-center">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">© 2026 panhelai.ai • all rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
