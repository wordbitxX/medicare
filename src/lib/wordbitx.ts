// Canonical WordbitX Software Company branding & contact details.
// This demo platform is a commercial WordbitX product — every public
// contact/branding surface should point here for "build a clinic website"
// inquiries.

export const WORDBITX = {
  companyName: "WordbitX Software Company",
  website: "https://wordbitxtech.com",
  phone: "+92 325 1888841",
  phoneHref: "tel:+923251888841",
  whatsapp: "923251888841",
  whatsappHref: "https://wa.me/923251888841",
  email: "info@wordbitxtech.com",
  emailHref: "mailto:info@wordbitxtech.com",
  headOffice: "Lahore, Pakistan",
  tagline: "Custom Software · Websites · Mobile Apps · AI · SEO & Digital Growth",
};

// A pre-filled WhatsApp message for anyone who wants this exact system
// built for their own clinic/hospital.
export function getWordbitxProjectMessage(clinicName?: string): string {
  const greeting = clinicName ? `the ${clinicName} demo website` : "this healthcare demo website";
  return `Hello WordbitX, I saw ${greeting} and would like a similar clinic/hospital website, booking system and admin CRM built for my business.`;
}

export function getWordbitxWhatsAppLink(clinicName?: string): string {
  const text = encodeURIComponent(getWordbitxProjectMessage(clinicName));
  return `${WORDBITX.whatsappHref}?text=${text}`;
}
