import { useState } from "react";
import TopStats from "./components/TopStats";
import DayTabs from "./components/DayTabs";
import HighlightCards from "./components/HighlightCards";

const Dashboard = () => {
  const [selectedDay, setSelectedDay] = useState("Day 1");

  const allDaysData = {
    "Day 1": {
      badges: { printed: 52, issued: 45 },
      meals: { breakfast: 30, lunch: 50, dinner: 80 },
      kitbags: { given: 80, pending: 38 },
      certificates: { issued: 10, pending: 108 }
    },
    "Day 2": {
      badges: { printed: 40, issued: 30 },
      meals: { breakfast: 20, lunch: 40, dinner: 60 },
      kitbags: { given: 60, pending: 20 },
      certificates: { issued: 15, pending: 90 }
    },
    "Day 3": {
      badges: { printed: 60, issued: 50 },
      meals: { breakfast: 35, lunch: 55, dinner: 75 },
      kitbags: { given: 90, pending: 28 },
      certificates: { issued: 30, pending: 88 }
    },
    "Day 4": {
      badges: { printed: 48, issued: 40 },
      meals: { breakfast: 25, lunch: 45, dinner: 70 },
      kitbags: { given: 70, pending: 48 },
      certificates: { issued: 20, pending: 98 }
    },
    "Day 5": {
      badges: { printed: 76, issued: 39 },
      meals: { breakfast: 98, lunch: 87, dinner: 65 },
      kitbags: { given: 12, pending: 34 },
      certificates: { issued: 20, pending: 78 }
    },
  };

  const activeDayData = (allDaysData as any)[selectedDay] || allDaysData["Day 1"];

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Conference Operations Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">Live monitoring for event logistics, materials, and daily attendance.</p>
        </div>

        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-2 w-fit">
          <span className="text-sm text-slate-600 font-medium">Event Status</span>
          <span className="text-emerald-600 font-semibold text-sm">● LIVE</span>
        </div>
      </div>

      {/* 4 PRIMARY METRIC CARDS (Delegates, Badges, Certificates, Kit Bags) */}
      <TopStats data={activeDayData} totalDelegates={118} />

      {/* DAY SELECTOR TABS */}
      <DayTabs
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
      />

      {/* MEAL ATTENDANCE HIGHLIGHTS (Breakfast, Lunch, Dinner) */}
      <HighlightCards
        meals={activeDayData.meals}
        total={118}
        selectedDay={selectedDay}
      />
    </div>
  );
};

export default Dashboard;