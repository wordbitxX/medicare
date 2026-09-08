export function cleanWhatsAppNumber(number: string): string {
  // Strip spaces, dashes, parentheses, and plus sign
  const cleaned = (number || "+923251888841").replace(/[^0-9]/g, "");
  return cleaned;
}

export function buildWhatsAppLink(number: string, message: string): string {
  const cleaned = cleanWhatsAppNumber(number);
  const text = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${text}`;
}

export const defaultWhatsAppMessages = {
  chat: (clinicName: string) =>
    `Hello ${clinicName}! I would like to inquire about your medical services and doctor consultation timings.`,
  book: (clinicName: string, service?: string, doctor?: string) =>
    `Hello ${clinicName}! I would like to book an appointment${service ? ` for ${service}` : ""}${doctor ? ` with ${doctor}` : ""}. Please share available slots.`,
  askAboutAppointment: (clinicName: string, appointmentCode?: string) =>
    `Hello ${clinicName}! I have a question regarding my appointment${appointmentCode ? ` (Booking Ref: ${appointmentCode})` : ""}. Could you please assist me?`,
  confirmation: (clinicName: string, code: string, doctor: string, date: string, time: string) =>
    `Hello ${clinicName}! I have successfully booked appointment *${code}* with *${doctor}* on *${date}* at *${time}*. Please confirm my slot. Thank you!`,
  costInquiry: (clinicName: string, service: string) =>
    `Hello ${clinicName}! What is the current consultation or procedure fee for ${service}?`,
};
