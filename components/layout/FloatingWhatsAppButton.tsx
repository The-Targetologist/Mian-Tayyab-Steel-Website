import { WhatsAppIcon } from "@/components/ui/icons";

interface FloatingWhatsAppButtonProps {
  whatsappNumber: string;
  isPlaceholder: boolean;
}

// Fixed bottom-right, visible on every page — same placement/behavior as
// the reference site's floating WhatsApp icon. wa.me requires digits only
// (no "+", spaces, or dashes), so the stored/placeholder number is
// normalized here rather than requiring admins to enter it pre-formatted.
export function FloatingWhatsAppButton({ whatsappNumber, isPlaceholder }: FloatingWhatsAppButtonProps) {
  const digitsOnly = whatsappNumber.replace(/\D/g, "");

  return (
    <a
      href={`https://wa.me/${digitsOnly}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      title={isPlaceholder ? "Placeholder WhatsApp number — update in Site Settings" : undefined}
      className="fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-fast hover:scale-105"
    >
      <WhatsAppIcon width={28} height={28} />
    </a>
  );
}
