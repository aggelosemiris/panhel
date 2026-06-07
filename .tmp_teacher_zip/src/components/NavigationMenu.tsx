import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, BookOpen, Clock, FileSignature, GraduationCap, 
  HelpCircle, LayoutGrid, LogOut, MessageSquare, Settings, X 
} from 'lucide-react';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: any) => void;
  onLogout: () => void;
  userName: string;
}

export default function NavigationMenu({ isOpen, onClose, onNavigate, onLogout, userName }: NavigationMenuProps) {
  const menuItems = [
    { label: 'Dashboard', icon: LayoutGrid, view: 'dashboard' },
    { label: 'Θεωρία', icon: BookOpen, view: 'chat' },
    { label: 'Διαγωνίσματα', icon: FileSignature, view: 'exam' },
    { label: 'Generator', icon: Settings, view: 'exam' },
    { label: 'SOS Θέματα', icon: HelpCircle, view: 'exercise' },
    { label: 'Μεμονωμένες Ασκήσεις', icon: FileSignature, view: 'exercise' },
    { label: 'Στατιστικά', icon: BarChart3, view: 'dashboard' },
    { label: 'Cortex AI', icon: MessageSquare, view: 'chat' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[110]"
          />
          <motion.div 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed left-6 top-6 bottom-6 w-80 bg-[#1e293b] rounded-[32px] z-[120] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="p-8 flex justify-between items-center border-b border-white/5">
              <h3 className="text-white font-black text-xl italic font-display">Πλοήγηση</h3>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => { onNavigate(item.view); onClose(); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
                    idx === 5 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-white/5 bg-black/10">
              <div className="px-6 py-4">
                <p className="text-white font-black text-sm">{userName}</p>
              </div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 transition-colors"
              >
                Αποσύνδεση
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
