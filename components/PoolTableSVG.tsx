// Реалистик билliard ширээ (ногоон фетр, ёроол, цөмнүүд, бөмбөгнүүд)
export default function PoolTableSVG({
  className = "",
  felt = "#15803d",
}: {
  className?: string;
  felt?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 180"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Модон хүрээ */}
      <rect x="6" y="6" width="308" height="168" rx="18" fill="#3b2417" />
      <rect x="6" y="6" width="308" height="168" rx="18" fill="none" stroke="#1f1209" strokeWidth="3" />
      {/* Фетр талбай */}
      <rect x="26" y="24" width="268" height="132" rx="8" fill={felt} />
      <rect x="26" y="24" width="268" height="132" rx="8" fill="url(#sheen)" />
      {/* Цөмнүүд */}
      {[
        [26, 24], [160, 20], [294, 24], [26, 156], [160, 160], [294, 156],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill="#0c0c0c" />
      ))}
      {/* Бөмбөгний гурвалжин */}
      <g>
        <circle cx="120" cy="90" r="7" fill="#fde047" />
        <circle cx="134" cy="82" r="7" fill="#ef4444" />
        <circle cx="134" cy="98" r="7" fill="#3b82f6" />
        <circle cx="148" cy="74" r="7" fill="#a855f7" />
        <circle cx="148" cy="90" r="7" fill="#f97316" />
        <circle cx="148" cy="106" r="7" fill="#22c55e" />
        <circle cx="162" cy="90" r="7" fill="#0f172a" stroke="#fff" strokeWidth="1" />
      </g>
      {/* Цагаан бөмбөг */}
      <circle cx="80" cy="90" r="7" fill="#f8fafc" />
      <defs>
        <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
