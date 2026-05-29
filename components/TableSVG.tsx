// Билliard ширээний энгийн SVG дүрслэл (background-д ашиглана)
export default function TableSVG({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Ширээний хүрээ */}
      <rect
        x="8"
        y="8"
        width="184"
        height="104"
        rx="12"
        fill="rgba(0,0,0,0.25)"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="3"
      />
      {/* Тоглоомын талбай */}
      <rect
        x="20"
        y="20"
        width="160"
        height="80"
        rx="6"
        fill="rgba(255,255,255,0.06)"
      />
      {/* Бөмбөгнүүд */}
      <circle cx="70" cy="60" r="7" fill="#fde047" />
      <circle cx="86" cy="52" r="7" fill="#f87171" />
      <circle cx="86" cy="68" r="7" fill="#60a5fa" />
      <circle cx="102" cy="44" r="7" fill="#34d399" />
      <circle cx="102" cy="60" r="7" fill="#a78bfa" />
      <circle cx="102" cy="76" r="7" fill="#fb923c" />
      <circle cx="135" cy="60" r="7" fill="#f8fafc" />
    </svg>
  );
}
