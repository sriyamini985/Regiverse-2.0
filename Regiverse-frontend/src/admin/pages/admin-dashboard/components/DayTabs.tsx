import React from "react";

interface Props {
  selectedDay: string;
  setSelectedDay: (day: string) => void;
}

export const DayTabs: React.FC<Props> = ({ selectedDay, setSelectedDay }) => {
  const days = Array.from({ length: 5 }, (_, i) => `Day ${i + 1}`);

  return (
    <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
      <span className="text-xs font-medium text-[#64748B] mr-2">Schedule:</span>
      {days.map((day) => {
        const isActive = selectedDay === day;
        return (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors select-none ${
              isActive
                ? "bg-[#0F172A] text-white"
                : "bg-white text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 border border-[#E2E8F0]"
            }`}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
};

export default DayTabs;