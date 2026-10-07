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
      title: "Breakfast",
      value: meals?.breakfast || 0,
      icon: <Coffee className="w-4 h-4 text-slate-600" />,
    },
    {
      title: "Lunch",
      value: meals?.lunch || 0,
      icon: <Utensils className="w-4 h-4 text-slate-600" />,
    },
    {
      title: "Dinner",
      value: meals?.dinner || 0,
      icon: <UtensilsCrossed className="w-4 h-4 text-slate-600" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, i) => {
        const remaining = Math.max(0, total - card.value);
        const percent = total > 0 ? Math.min(100, Math.round((card.value / total) * 100)) : 0;

        return (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0F172A]">
                  {selectedDay} • {card.title}
                </span>
                <div className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                  {card.icon}
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#0F172A] tracking-tight">
                  {card.value.toLocaleString()}
                </span>
                <span className="text-xs text-[#64748B]">served</span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 space-y-1">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F766E] rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>{percent}% served</span>
                  <span>{remaining} remaining</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
              <span>Capacity: {total} delegates</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HighlightCards;