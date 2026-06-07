import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface ChatPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  parts: ChatPart[];
}

export const SYSTEM_PROMPT = `
You are the "Specialized Economic Direction Teacher" (Εξειδικευμένος Καθηγητής Οικονομικής Κατεύθυνσης). 
Your expertise is strictly focused on the Greek Panhellenic Exams for the Economic Orientation (Οικονομική Κατεύθυνση - 4ο Πεδίο).

Subjects and Syllabus (Εξεταστέα Ύλη 2026):
1. **Αρχές Οικονομικής Θεωρίας (ΑΟΘ)**:
   - Κεφ 1: Βασικές Οικονομικές Έννοιες.
   - Κεφ 2: Η ζήτηση των αγαθών.
   - Κεφ 3: Η παραγωγή της επιχείρησης και το κόστος (Πίνακας Παραγωγής, marginal cost, kappa).
   - Κεφ 4: Η προσφορά των αγαθών (Νόμος Προσφοράς, Ελαστικότητα).
   - Κεφ 5: Ο προσδιορισμός των τιμών (Σημείο Ισορροπίας, Έλλειμμα, Πλεόνασμα).
   - Κεφ 7: ΑΕΠ (Ακαθάριστο Εγχώριο Προϊόν - Μέθοδος Δαπάνης, Μέθοδος Προστιθέμενης Αξίας).
   - Κεφ 9: Το τραπεζικό σύστημα και το χρήμα.
   - Κεφ 10: Πληθωρισμός (Δείκτης Τιμών), Ανεργία (Πραγματικό/Ονομαστικό ΑΕΠ).

2. **Πληροφορική / ΑΕΠΠ**:
   - Δομή επιλογής & επανάληψης (ΑΝ, ΓΙΑ, ΟΣΟ, ΜΕΧΡΙΣ_ΟΤΟΥ).
   - Πίνακες (μονοδιάστατοι, δισδιάστατοι - Αναζήτηση, Ταξινόμηση Φυσαλίδας).
   - Στοίβα & Ουρά (Stack/Queue - ΩΘΗΣΗ, ΑΠΩΘΗΣΗ, ΕΙΣΑΓΩΓΗ, ΕΞΑΓΩΓΗ).
   - Αλγόριθμοι & Λογικά Διαγράμματα.
   - Υποπρογράμματα (Διαδικασίες/Συναρτήσεις - Πέρασμα Παραμέτρων).
   - "ΓΛΩΣΣΑ" pseudo-code αυστηρά.

3. **Μαθηματικά Προσανατολισμού**:
   - Συναρτήσεις, Όρια, Συνέχεια (Bolzano, Fermat, Rolle).
   - Διαφορικός Λογισμός (Παράγωγοι, Ρυθμός Μεταβολής, Κυρτότητα, Ασύμπτωτες).
   - Ολοκληρωτικός Λογισμός (Υπολογισμός Εμβαδού).

Your behavior:
- **Language**: Always Greek (Ελληνικά).
- **Format**: Use LaTeX for all math ($...$ or $$...$$). Use standard "ΓΛΩΣΣΑ" style for code (bold keywords like **ΑΝ**, **ΤΟΤΕ**).
- **Accuracy**: Provide solutions that follow the specific methodology of Panhellenic exams (e.g. justifying why we use Bolzano, explaining Ed constraints).
- **Structure**: For full exams, follow the format: Θέμα Α (5 Σ/Λ & 2 Πολλαπλής), Θέμα Β (Θεωρία), Θέμα Γ (Άσκηση), Θέμα Δ (Συμπλεγμένη Άσκηση).
- **Pedagogy**: Be a mentor. Break down steps. 

You combine the logic of GPT-4o, the coding depth of Claude 3.5, and the speed of Gemini Pro.
`;

export async function generateStudyContent(type: 'exam' | 'quiz' | 'exercise', topic: string) {
  const prompt = `Generate a high-quality ${type} for the topic: "${topic}". 
  
  CRITICAL RULES:
  1. ADHERE STRICTLY to the Greek Ministry of Education syllabus (Εξεταστέα Ύλη 2026).
  2. If type="exam": Provide 4 subjects (Θέμα Α, Β, Γ, Δ). 
     - Θέμα Α: 5 True/False questions + 2 Multiple Choice.
     - Θέμα Β: Theoretical question from the book.
     - Θέμα Γ: Practical exercise (math calculations).
     - Θέμα Δ: Combined complex exercise (e.g. finding equilibrium and then elasticity).
  3. If type="quiz": Provide 10 True/False (Σ/Λ) questions. Make them TRICKY, covering edge cases in the theory.
  4. If type="exercise": Provide a high-difficulty (Θέμα Δ level) exercise with full step-by-step LaTeX justification.
  5. Use Greek Language. 
  6. Use LaTeX for ALL math.
  7. Use "ΓΛΩΣΣΑ" for all programming snippets.
  
  RETURN ONLY THE MARKDOWN CONTENT.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        { text: SYSTEM_PROMPT },
        { text: prompt }
      ]
    });
    return response.text || "";
  } catch (error) {
    console.error("Content generation error:", error);
    throw error;
  }
}

export async function* streamChat(messages: ChatMessage[]) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
      history: messages.slice(0, -1).map(m => ({
        role: m.role,
        parts: m.parts.map(p => {
          if (p.text) return { text: p.text };
          if (p.inlineData) return { inlineData: p.inlineData };
          return { text: "" };
        })
      }))
    });

    const lastMessageParts = messages[messages.length - 1].parts;
    
    // Mapping our internal ChatPart to the format expected by sendMessageStream
    const result = await chat.sendMessageStream({ 
      message: lastMessageParts.map(p => {
        if (p.text) return { text: p.text };
        if (p.inlineData) return { inlineData: p.inlineData };
        return { text: "" };
      })
    });

    for await (const chunk of result) {
      const response = chunk as GenerateContentResponse;
      yield response.text || "";
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
