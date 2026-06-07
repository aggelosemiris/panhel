import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SYLLABUS, SubjectId } from '../constants/syllabus';
import { X } from 'lucide-react';

interface SubjectSelectorProps {
  onSelect: (subjectId: SubjectId) => void;
  onClose: () => void;
}

export default function SubjectSelector({ onSelect, onClose }: SubjectSelectorProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl relative z-10 p-10"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-4 mb-10">
          <h3 className="text-3xl font-black text-gray-900 font-display italic">Επιλέξτε Μάθημα</h3>
          <p className="text-gray-400 font-medium tracking-tight">Διαλέξτε το μάθημα που θέλετε να δουλέψετε</p>
        </div>

        <div className="space-y-4">
          {SYLLABUS.map((subject) => (
            <button
              key={subject.id}
              onClick={() => onSelect(subject.id)}
              className="w-full bg-white border-2 border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all p-6 rounded-[24px] flex items-center gap-6 group text-left"
            >
              <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">
                {subject.icon === '📐' && <span className="text-blue-500">📐</span>}
                {subject.icon === '💼' && <span className="text-amber-600">💼</span>}
                {subject.icon === '💻' && <span className="text-indigo-600">💻</span>}
              </div>
              <span className="text-xl font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                {subject.fullName}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
