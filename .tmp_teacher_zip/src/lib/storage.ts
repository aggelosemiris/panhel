import { ChatMessage } from "../services/geminiService";

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

const STORAGE_KEY = "panhellenic_teacher_chats";

export const saveSessions = (sessions: ChatSession[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const loadSessions = (): ChatSession[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse sessions", e);
    return [];
  }
};

export const createNewSession = (): ChatSession => ({
  id: crypto.randomUUID(),
  title: "Νέα Συνομιλία",
  messages: [],
  updatedAt: Date.now(),
});
