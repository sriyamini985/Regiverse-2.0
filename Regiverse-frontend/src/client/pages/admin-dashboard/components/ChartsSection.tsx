import BadgesBarChart from "./charts/BadgesBarChart";
import KitBagChart from "./charts/KitBagChart";
import CertificatesChart from "./charts/CertificatesChart";

interface ChartsSectionProps {
  data: {
    badges: { printed: number; issued: number };
    kitbags: { given: number; pending: number };
    certificates: { issued: number; pending: number };
  };
}

const ChartsSection = ({ data }: ChartsSectionProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-700 tracking-wide uppercase">
        Distribution Breakdown
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BadgesBarChart data={data.badges} />
        <KitBagChart data={data.kitbags} />
        <CertificatesChart data={data.certificates} />
      </div>
    </div>
  );
};

export default ChartsSection;
