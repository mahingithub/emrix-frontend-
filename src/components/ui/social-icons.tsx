// Brand glyphs (lucide no longer ships these).
type IconProps = { className?: string };

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5h2.53l.38-2.94H13.5V8.69c0-.85.24-1.43 1.46-1.43h1.56V4.63a21 21 0 0 0-2.27-.12c-2.25 0-3.79 1.37-3.79 3.9v2.15H7.92v2.94h2.54V21h3.04Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function TiktokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.6c.27 0 .53.04.78.12V9.77a5.7 5.7 0 0 0-.78-.05A5.69 5.69 0 1 0 15.54 15.4V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.29 4.29 0 0 1-3.24-1.48Z" />
    </svg>
  );
}

export function MessengerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.5C6.62 2.5 2.5 6.44 2.5 11.77c0 2.79 1.14 5.2 3 6.87.16.14.25.34.26.55l.05 1.7a.76.76 0 0 0 1.07.67l1.9-.84a.76.76 0 0 1 .5-.04c.87.24 1.8.37 2.72.37 5.38 0 9.5-3.94 9.5-9.28S17.38 2.5 12 2.5Zm5.7 7.1-2.79 4.43a1.42 1.42 0 0 1-2.06.38l-2.22-1.66a.57.57 0 0 0-.69 0l-3 2.28c-.4.3-.92-.17-.65-.6l2.79-4.42a1.42 1.42 0 0 1 2.06-.38l2.22 1.66c.2.15.48.15.69 0l3-2.28c.4-.3.92.18.65.6Z" />
    </svg>
  );
}
