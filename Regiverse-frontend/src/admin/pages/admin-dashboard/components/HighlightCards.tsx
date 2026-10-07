import React from "react";
import { Coffee, Utensils, UtensilsCrossed } from "lucide-react";

interface HighlightCardsProps {
  meals: {
    breakfast?: number;
    lunch?: number;
    dinner?: number;
  };
  total: number;
  selectedDay: string;
}

export const HighlightCards: React.FC<HighlightCardsProps> = ({
  meals,
  total,
  selectedDay,
}) => {
  const cards = [
    {
      title: "Breakfast Service",
      value: meals?.breakfast || 0,
      icon: <Coffee className="w-5 h-5 text-amber-600" />,
      accentBg: "bg-amber-50 border-amber-100",
      barColor: "bg-amber-500",
    },
    {
      title: "Lunch Service",
      value: meals?.lunch || 0,
      icon: <Utensils className="w-5 h-5 text-blue-600" />,
      accentBg: "bg-blue-50 border-blue-100",
      barColor: "bg-blue-600",
    },
    {
      title: "Dinner Service",
      value: meals?.dinner || 0,
      icon: <UtensilsCrossed className="w-5 h-5 text-emerald-600" />,
      accentBg: "bg-emerald-50 border-emerald-100",
      barColor: "bg-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, i) => {
        const remaining = Math.max(0, total - card.value);
        const percent = total > 0 ? Math.min(100, Math.round((card.value / total) * 100)) : 0;

        return (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {selectedDay} • {card.title}
                </span>
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${card.accentBg}`}
                >
                  {card.icon}
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {card.value.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Served
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">
                    Distribution Progress
                  </span>
                  <span className="font-bold text-slate-900">{percent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${card.barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Attended
                </p>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  {card.value}
                </p>
              </div>
              <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Remaining
                </p>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  {remaining}
                </p>
              </div>
              <div className="bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Cap
                </p>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  {total}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HighlightCards;