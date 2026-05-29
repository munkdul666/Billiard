// Реалистик billiard ширээ — модон хүрээ, цөм, очир, бөмбөгний жагсаалт
export default function PoolTableSVG({
  className = "",
  felt = "#1f7a44",
}: {
  className?: string;
  felt?: string;
}) {
  return (
    <svg
      viewBox="0 0 320 190"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a3a22" />
          <stop offset="50%" stopColor="#3d2616" />
          <stop offset="100%" stopColor="#24150b" />
        </linearGradient>
        <radialGradient id="feltGrad" cx="50%" cy="42%" r="75%">
          <stop offset="0%" stopColor={felt} />
          <stop offset="100%" stopColor="#0c4a28" />
        </radialGradient>
        <radialGradient id="ballShine" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Модон хүрээ */}
      <rect x="2" y="2" width="316" height="186" rx="22" fill="url(#wood)" />
      <rect x="2" y="2" width="316" height="186" rx="22" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />

      {/* Очир тэмдэгүүд (sights) */}
      <g fill="rgba(255,255,255,0.5)">
        {[80, 160, 240].map((x) => (
          <circle key={`t${x}`} cx={x} cy="13" r="2" />
        ))}
        {[80, 160, 240].map((x) => (
          <circle key={`b${x}`} cx={x} cy="177" r="2" />
        ))}
        <circle cx="13" cy="95" r="2" />
        <circle cx="307" cy="95" r="2" />
      </g>

      {/* Фетр */}
      <rect x="24" y="24" width="272" height="142" rx="10" fill="url(#feltGrad)" />
      {/* дотоод сүүдэр */}
      <rect x="24" y="24" width="272" height="142" rx="10" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="6" />

      {/* Цөмнүүд */}
      {[
        [30, 30], [160, 26], [290, 30],
        [30, 160], [160, 164], [290, 160],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="11" fill="#000" />
          <circle cx={cx} cy={cy} r="11" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        </g>
      ))}

      {/* Цагаан бөмбөг */}
      <g>
        <circle cx="92" cy="95" r="8" fill="#f5f5f0" />
        <circle cx="92" cy="95" r="8" fill="url(#ballShine)" />
      </g>

      {/* Бөмбөгний гурвалжин */}
      {[
        [188, 95, "#fde047"],
        [202, 86, "#ef4444"],
        [202, 104, "#3b82f6"],
        [216, 77, "#a855f7"],
        [216, 95, "#f97316"],
        [216, 113, "#22c55e"],
        [230, 68, "#0ea5e9"],
        [230, 86, "#dc2626"],
        [230, 104, "#1e293b"],
        [230, 122, "#eab308"],
      ].map(([cx, cy, c], i) => (
        <g key={i}>
          <circle cx={cx as number} cy={cy as number} r="8" fill={c as string} />
          <circle cx={cx as number} cy={cy as number} r="8" fill="url(#ballShine)" />
        </g>
      ))}
    </svg>
  );
}
