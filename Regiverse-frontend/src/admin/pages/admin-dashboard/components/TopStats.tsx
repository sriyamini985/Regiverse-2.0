import React from "react";
import { Users, CheckCircle, Award, Package, Printer } from "lucide-react";

interface TopStatsProps {
  total: number;
  checkedIn: number;
  printed: number;
  certificateGiven: number;
  kitbagCollected: number;
  isLoading?: boolean;
}

export const TopStats: React.FC<TopStatsProps> = ({
  total = 0,
  checkedIn = 0,
  printed = 0,
  certificateGiven = 0,
  kitbagCollected = 0,
  isLoading = false,
}) => {
  const checkInRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
  const printRate = total > 0 ? Math.round((printed / total) * 100) : 0;
  const kitbagRate = total > 0 ? Math.round((kitbagCollected / total) * 100) : 0;
  const certRate = total > 0 ? Math.round((certificateGiven / total) * 100) : 0;

  const stats = [
    {
      title: "Total Delegates",
      value: total,
      subtext: "Total Registered in Workspace",
      badge: `${total} Records`,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <Users className="w-5 h-5" />,
      iconBox: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Checked In (Entry)",
      value: checkedIn,
      subtext: `${checkInRate}% Overall Attendance`,
      badge: `${checkInRate}% Rate`,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle className="w-5 h-5" />,
      iconBox: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "Badges Printed",
      value: printed,
      subtext: `${printRate}% Badges Issued`,
      badge: `${total - printed} Pending`,
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: <Printer className="w-5 h-5" />,
      iconBox: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      title: "Kit Bags Distributed",
      value: kitbagCollected,
      subtext: `${kitbagRate}% Bags Claimed`,
      badge: `${total - kitbagCollected} Remaining`,
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      icon: <Package className="w-5 h-5" />,
      iconBox: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      title: "Certificates Issued",
      value: certificateGiven,
      subtext: `${certRate}% Claim Rate`,
      badge: `${certificateGiven} Delivered`,
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      icon: <Award className="w-5 h-5" />,
      iconBox: "bg-purple-50 text-purple-600 border-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((item, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {item.title}
              </span>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {item.value.toLocaleString()}
                </div>
              )}
            </div>

            <div
              className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${item.iconBox}`}
            >
              {item.icon}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px] font-medium truncate">
              {item.subtext}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${item.badgeColor}`}
            >
              {item.badge}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopStats;