import React from "react";
import { Calendar } from "lucide-react";

interface Props {
  selectedDay: string;
  setSelectedDay: (day: string) => void;
}

export const DayTabs: React.FC<Props> = ({ selectedDay, setSelectedDay }) => {
  const days = Array.from({ length: 5 }, (_, i) => `Day ${i + 1}`);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="flex items-center gap-2 pl-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Calendar className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Conference Schedule Day:
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {days.map((day) => {
          const isActive = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 select-none ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DayTabs;