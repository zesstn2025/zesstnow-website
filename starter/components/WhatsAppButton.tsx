import { company } from "@/content/site";

/**
 * The floating WhatsApp button, and the reason it exists: for most of these
 * businesses WhatsApp is where the customer already is. A form gets filled by
 * a minority; this gets tapped. It carries a starter message so the shopkeeper
 * can tell at a glance that the enquiry came from the site.
 */
export default function WhatsAppButton() {
  if (!company.whatsapp || company.whatsapp === "CONFIRM") return null;
  const text = encodeURIComponent(`नमस्ते, मैंने आपकी website देखी — ${company.name}।`);
  return (
    <a
      className="wa-fab"
      href={`https://wa.me/91${company.whatsapp}?text=${text}`}
      target="_blank"
      rel="noopener"
    >
      WhatsApp
    </a>
  );
}
