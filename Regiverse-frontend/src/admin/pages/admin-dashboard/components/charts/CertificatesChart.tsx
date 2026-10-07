import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#10b981", "#e2e8f0"];

interface CertificatesChartProps {
  data: {
    issued?: number;
    given?: number;
    pending?: number;
  };
}

const CertificatesChart: React.FC<CertificatesChartProps> = ({ data }) => {
  const issued = data?.issued ?? data?.given ?? 0;
  const pending = data?.pending ?? 0;

  const chartData = [
    { name: "Delivered", value: issued },
    { name: "Pending", value: pending },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs h-[280px] flex flex-col items-center justify-between">
      <div className="w-full flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Certificates
        </h3>
        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
          {issued} Issued
        </span>
      </div>

      <div className="w-full h-[180px] flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 text-xs font-medium text-slate-500 mt-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          Delivered ({issued})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          Pending ({pending})
        </span>
      </div>
    </div>
  );
};

export default CertificatesChart;