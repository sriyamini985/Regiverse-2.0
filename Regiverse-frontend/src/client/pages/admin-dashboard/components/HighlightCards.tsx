const HighlightCards = ({ meals, total, selectedDay }: any) => {
  const cards = [
    { title: "Breakfast", value: meals.breakfast, color: "from-red-400 to-red-500" },
    { title: "Lunch", value: meals.lunch, color: "from-indigo-500 to-blue-600" },
    { title: "Dinner", value: meals.dinner, color: "from-orange-400 to-orange-500" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, i) => {
        const remaining = Math.max(0, total - card.value);
        const percentage = total > 0 ? Math.round((card.value / total) * 100) : 0;

        return (
          <div
            key={i}
            className={`rounded-2xl p-6 text-white shadow-md bg-gradient-to-br ${card.color} flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between text-sm opacity-90">
                <span className="font-semibold">{selectedDay} • {card.title}</span>
                <span className="bg-white/25 px-2.5 py-0.5 rounded-full text-xs font-bold">{percentage}% Attended</span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tight">{card.value}</span>
                <span className="text-sm opacity-85">delegates attended</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-white/20 flex justify-between text-xs font-medium">
              <span>Remaining: <strong>{remaining}</strong></span>
              <span>Total Roster: <strong>{total}</strong></span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HighlightCards;