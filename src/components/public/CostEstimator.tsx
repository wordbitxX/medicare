"use client";

import React, { useState } from "react";
import { Calculator, Check, MessageCircle, Calendar, Sparkles, ShieldCheck, Tag } from "lucide-react";
import { ServiceType, ClinicSettingsType } from "@/types";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface CostEstimatorProps {
  services: ServiceType[];
  settings: ClinicSettingsType;
  onOpenBooking: () => void;
}

export default function CostEstimator({
  services,
  settings,
  onOpenBooking,
}: CostEstimatorProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([
    services[0]?.id || 1,
    services[2]?.id || 3,
  ]);

  const toggleService = (id: number) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return;
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedServices = services.filter((s) => selectedIds.includes(s.id));
  const subtotalCost = selectedServices.reduce((acc, curr) => acc + curr.price, 0);

  // Apply bundled combo benefit if 3+ items selected
  const hasComboDiscount = selectedIds.length >= 3;
  const comboDiscountAmount = hasComboDiscount ? Math.round(subtotalCost * 0.1) : 0;
  const finalEstimatedCost = subtotalCost - comboDiscountAmount;

  const selectedNames = selectedServices
    .map((s) => `${s.name} (PKR ${s.price.toLocaleString()})`)
    .join(", ");

  const waEstimatorLink = buildWhatsAppLink(
    settings.whatsapp,
    `Hello ${settings.clinicName}! I used your online Cost Estimator for: ${selectedNames}. Estimated Total: PKR ${finalEstimatedCost.toLocaleString()}${hasComboDiscount ? " (includes 10% multi-service combo courtesy)" : ""}. Please let me know available slots.`
  );

  return (
    <section id="calculator" className="py-16 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-3">
            <Calculator className="w-3.5 h-3.5 text-teal-600" />
            <span>100% Transparent Pakistani Rupee (PKR) Billing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Interactive Treatment Cost Estimator
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Select treatments to calculate an accurate upfront fee estimate. No hidden hospital
            fees. Direct cash, card, or cashless insurance claims supported.
          </p>
        </div>

        {/* Calculator Master Card */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Calculation Summary Card */}
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-28">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Treatment Quote Summary
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                    {selectedIds.length} Treatment{selectedIds.length > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Selected List in Quote */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
                  {selectedServices.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-slate-300">
                      <span className="truncate mr-2 font-medium">{s.name}</span>
                      <span className="font-semibold text-white whitespace-nowrap">
                        PKR {s.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Standard Subtotal:</span>
                    <span>PKR {subtotalCost.toLocaleString()}</span>
                  </div>

                  {hasComboDiscount && (
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                      <span>Multi-Treatment Courtesy (10%):</span>
                      <span>- PKR {comboDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-700">
                    <span className="text-sm font-bold text-white">Estimated Payable:</span>
                    <span className="text-2xl sm:text-3xl font-black text-teal-400">
                      PKR {finalEstimatedCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Combo Benefit Alert */}
                {selectedIds.length < 3 ? (
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-amber-300 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 shrink-0" />
                    <span>Select 1 more service to unlock 10% multi-service courtesy!</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>10% Multi-service courtesy applied to this quotation.</span>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={onOpenBooking}
                    className="flex-1 py-3 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Selected</span>
                  </button>

                  <a
                    href={waEstimatorLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Get WhatsApp Quote</span>
                  </a>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed px-1">
                * Note: Final clinical billing may adjust if comprehensive diagnostic lab work or
                specialized medications are advised by the attending consultant doctor during
                in-person examination.
              </div>
            </div>

            {/* Right: Service Selectors List */}
            <div className="lg:col-span-7">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                Click any service to toggle into your estimate:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                {services.map((service) => {
                  const isSelected = selectedIds.includes(service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? "bg-teal-950/60 border-teal-500 text-white ring-1 ring-teal-500"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-3 mr-2">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                            isSelected
                              ? "bg-teal-500 border-teal-500 text-slate-950"
                              : "border-slate-600 bg-slate-950"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="font-bold block text-white line-clamp-1">
                            {service.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {service.category} • {service.durationMinutes} mins
                          </span>
                        </div>
                      </div>

                      <span className="font-extrabold text-teal-300 whitespace-nowrap text-right">
                        PKR {service.price.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
