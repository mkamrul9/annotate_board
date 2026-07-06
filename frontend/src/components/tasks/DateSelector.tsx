'use client';

import { useTaskStore } from '@/store/useTaskStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, subDays, format, parseISO } from 'date-fns';

export default function DateSelector() {
  const { selectedDate, setSelectedDate } = useTaskStore();

  const handlePrevDay = () => {
    setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  };

  return (
    <div className="flex items-center space-x-4 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
      <button onClick={handlePrevDay} className="p-2 hover:bg-slate-800 rounded-md transition text-slate-400 hover:text-white">
        <ChevronLeft size={20} />
      </button>
      <input 
        type="date" 
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="bg-transparent text-white outline-none font-medium [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
      />
      <button onClick={handleNextDay} className="p-2 hover:bg-slate-800 rounded-md transition text-slate-400 hover:text-white">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
