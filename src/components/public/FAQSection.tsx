"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, Search, MessageCircle } from "lucide-react";
import { FaqType, ClinicSettingsType } from "@/types";
import { buildWhatsAppLink, defaultWhatsAppMessages } from "@/lib/whatsapp";

interface FAQSectionProps {
  faqs: FaqType[];
  settings: ClinicSettingsType;
}

export default function FAQSection({ faqs, settings }: FAQSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const waFaqLink = buildWhatsAppLink(
    settings.whatsapp,
    `Hello ${settings.clinicName}! I have a clinical question not answered in your website FAQ. Could you please assist me?`
  );

  return (
    <section id="faqs" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Got Questions? We Have Answers.
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Everything you need to know about appointment booking, insurance panels, OPD hours,
            and clinic procedures.
          </p>

          {/* Search Box */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search questions (e.g. insurance, parking, fees)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs py-2.5 pl-10 pr-4 bg-white border border-slate-300 rounded-2xl shadow-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category Filter */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-teal-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 mt-1">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              No matching questions found. Ask our front-desk directly on WhatsApp below!
            </div>
          )}
        </div>

        {/* Still have questions WhatsApp Card */}
        <div className="mt-10 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <MessageCircle className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Still have a question?
              </h4>
              <p className="text-[11px] text-slate-600">
                Our front desk coordinators are online on WhatsApp right now.
              </p>
            </div>
          </div>

          <a
            href={waFaqLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 shrink-0 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
