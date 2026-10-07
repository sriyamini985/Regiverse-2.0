import { Users, BadgeCheck, Award, Package } from "lucide-react";

interface TopStatsProps {
  totalDelegates?: number;
  data?: {
    badges?: { printed: number; issued: number };
    kitbags?: { given: number; pending: number };
    certificates?: { issued: number; pending: number };
  };
}

const TopStats = ({ totalDelegates = 118, data }: TopStatsProps) => {
  const stats = [
    {
      title: "Total Delegates",
      value: totalDelegates,
      icon: <Users size={20} />,
      bg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Badges Issued",
      value: data?.badges?.issued ?? 45,
      icon: <BadgeCheck size={20} />,
      bg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Certificates Issued",
      value: data?.certificates?.issued ?? 10,
      icon: <Award size={20} />,
      bg: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    {
      title: "Kit Bags Delivered",
      value: data?.kitbags?.given ?? 80,
      icon: <Package size={20} />,
      bg: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex items-center gap-4 hover:shadow-sm transition"
        >
          {/* ICON */}
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-xl ${item.bg}`}
          >
            <span className={item.iconColor}>{item.icon}</span>
          </div>

          {/* TEXT */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{item.title}</p>
            <h2 className="text-2xl font-bold mt-0.5 text-slate-900">
              {item.value}
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopStats;