"use client";

import React, { useState } from "react";
import { Star, MessageSquarePlus, CheckCircle2, X, User, ThumbsUp, Sparkles } from "lucide-react";
import { ReviewType } from "@/types";

interface ReviewsSectionProps {
  initialReviews: ReviewType[];
}

export default function ReviewsSection({ initialReviews }: ReviewsSectionProps) {
  const [reviewsList, setReviewsList] = useState<ReviewType[]>(initialReviews);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [patientName, setPatientName] = useState("");
  const [treatment, setTreatment] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [city, setCity] = useState("Lahore");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !comment.trim() || !treatment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          rating,
          treatment,
          doctorName,
          comment,
          city,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Thank you! Your verified review has been submitted.");
        setReviewsList([data.review, ...reviewsList]);
        setTimeout(() => {
          setModalOpen(false);
          setSuccessMsg("");
          setPatientName("");
          setTreatment("");
          setComment("");
        }, 1800);
      }
    } catch (err) {
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-900 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Patient Stories</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              What Our Patients Say
            </h2>
            <p className="mt-2 text-slate-600 text-sm max-w-xl">
              Over 25,000 satisfied patients across Lahore, Karachi, and Islamabad trust our
              clinical care and ethical medical standards.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all shrink-0"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Patient Review</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewsList.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Stars and Treatment */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full">
                    {rev.treatment}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{rev.patientName}</h4>
                  {rev.doctorName && (
                    <span className="text-[11px] text-slate-500 block">
                      Consultant: {rev.doctorName}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {rev.city || "Lahore"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Write a Patient Review</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              {successMsg ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center flex items-center justify-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Your Name / Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Mahmood"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Treatment / Service *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dental Scaling, HydraFacial"
                        value={treatment}
                        onChange={(e) => setTreatment(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Attending Doctor (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Farhan Malik"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="font-bold text-slate-700 ml-2">{rating} out of 5</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Your Clinical Experience & Feedback *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Share details about your visit, wait time, doctor guidance, and results..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
