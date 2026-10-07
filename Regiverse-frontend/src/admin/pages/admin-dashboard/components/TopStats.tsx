import React from "react";
import { Users, CheckCircle, Printer, Package, Award } from "lucide-react";

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
      title: "Total Registrations",
      value: total,
      subtext: "Total registered delegates",
      icon: <Users className="w-4 h-4 text-slate-600" />,
    },
    {
      title: "Checked In",
      value: checkedIn,
      subtext: `${checkInRate}% attendance rate`,
      icon: <CheckCircle className="w-4 h-4 text-[#0F766E]" />,
    },
    {
      title: "Badges Printed",
      value: printed,
      subtext: `${printRate}% printed (${total - printed} pending)`,
      icon: <Printer className="w-4 h-4 text-slate-600" />,
    },
    {
      title: "Kitbags Distributed",
      value: kitbagCollected,
      subtext: `${kitbagRate}% collected (${total - kitbagCollected} remaining)`,
      icon: <Package className="w-4 h-4 text-slate-600" />,
    },
    {
      title: "Certificates Issued",
      value: certificateGiven,
      subtext: `${certRate}% delivered`,
      icon: <Award className="w-4 h-4 text-slate-600" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((item, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-[#64748B]">
              {item.title}
            </span>
            <div className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
              {item.icon}
            </div>
          </div>

          <div className="mt-3">
            {isLoading ? (
              <div className="h-7 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
                {item.value.toLocaleString()}
              </div>
            )}
            <p className="text-[11px] text-[#64748B] mt-1">
              {item.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopStats;