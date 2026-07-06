'use client';

import { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Mic, MicOff, Loader2 } from 'lucide-react';

export default function VoiceInput() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { addTask } = useTaskStore();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return; // Browser doesn't support it

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript.trim();
      if (transcript) {
        addTask({
          title: transcript,
          priority: 'HIGH',
          status: 'TODO',
          tags: ['voice-generated'],
        });
      }
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setIsSupported(true); // Only show the button when we know it works
  }, [addTask]);

  // Guard: don't render anything until client-side check is done
  if (!isSupported) return null;

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  return (
    <button
      onClick={toggleListening}
      title={isListening ? 'Stop listening' : 'Dictate a task via voice'}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
        isListening
          ? 'bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      {isListening ? <Mic size={16} /> : <MicOff size={16} />}
      {isListening ? 'Listening…' : 'Dictate'}
    </button>
  );
}
