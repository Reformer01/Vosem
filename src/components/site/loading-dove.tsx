export default function LoadingDove({ className = "size-10", label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className={`loading-dove ${className}`}>
      <svg viewBox="0 0 64 48" fill="currentColor" aria-hidden="true" className="size-full">
        <path className="dove-wing-left" d="M30 24C24 12 13 8 4 11c8 3 13 9 16 17z" />
        <path className="dove-wing-right" d="M35 23c6-12 17-16 26-13-8 3-13 9-16 17z" />
        <path d="M11 31c6 7 22 9 34 1 6-4 11-11 13-18-5 6-11 8-17 8-8-7-20-8-29-1-4 2-6 6-5 10z" />
        <circle cx="54" cy="16" r="3.5" />
        <path d="M58 15l6 2-6 2z" />
      </svg>
    </span>
  );
}
