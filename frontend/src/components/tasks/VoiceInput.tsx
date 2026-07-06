'use client';

import { useState, useEffect, useRef } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const { addTask } = useTaskStore();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        // Instantly create a high-priority task from the voice transcript
        addTask({ 
          title: transcript, 
          priority: 'HIGH', 
          status: 'TODO', 
          tags: ['voice-generated'] 
        });
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [addTask]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  if (!recognitionRef.current) return null; // Hide if browser doesn't support it

  return (
    <button 
      onClick={toggleListening}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition shadow-lg ${
        isListening ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {isListening ? <Mic size={18} /> : <MicOff size={18} />}
      {isListening ? 'Listening...' : 'Dictate Task'}
    </button>
  );
}
