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
  const badgesIssued = data?.badges?.issued ?? 45;
  const certificatesIssued = data?.certificates?.issued ?? 10;
  const kitbagsDelivered = data?.kitbags?.given ?? 80;

  const stats = [
    {
      title: "Total Delegates",
      value: totalDelegates,
      subtitle: "Registered delegates",
      icon: <Users size={20} />,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
      progress: null
    },
    {
      title: "Badges Issued",
      value: badgesIssued,
      subtitle: `${Math.max(0, totalDelegates - badgesIssued)} pending`,
      icon: <BadgeCheck size={20} />,
      bg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      progress: Math.round((badgesIssued / totalDelegates) * 100)
    },
    {
      title: "Certificates Issued",
      value: certificatesIssued,
      subtitle: `${Math.max(0, totalDelegates - certificatesIssued)} pending`,
      icon: <Award size={20} />,
      bg: "bg-amber-100",
      iconColor: "text-amber-600",
      progress: Math.round((certificatesIssued / totalDelegates) * 100)
    },
    {
      title: "Kit Bags Delivered",
      value: kitbagsDelivered,
      subtitle: `${Math.max(0, totalDelegates - kitbagsDelivered)} pending`,
      icon: <Package size={20} />,
      bg: "bg-purple-100",
      iconColor: "text-purple-600",
      progress: Math.round((kitbagsDelivered / totalDelegates) * 100)
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((item, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{item.title}</p>
              <h2 className="text-2xl font-bold mt-1 text-slate-900">{item.value}</h2>
            </div>
            <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${item.bg}`}>
              <span className={item.iconColor}>{item.icon}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{item.subtitle}</span>
            {item.progress !== null && (
              <span className="font-semibold text-slate-700">{item.progress}% issued</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopStats;