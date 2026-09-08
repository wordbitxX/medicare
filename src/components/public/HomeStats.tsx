import React from "react";

const stats = [
  { label: "Consultants on panel", value: "85+" },
  { label: "Clinical specialties", value: "26" },
  { label: "OPD shifts", value: "3" },
  { label: "Patient rating", value: "4.9★" },
];

export default function HomeStats() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/60 shadow-sm md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-4 py-7 text-center ${
                index < stats.length - 1 ? "md:border-r md:border-slate-200" : ""
              } ${index < 2 ? "border-b border-slate-200 md:border-b-0" : ""}`}
            >
              <div className="text-2xl font-black tracking-tight text-[#0A2540] md:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
