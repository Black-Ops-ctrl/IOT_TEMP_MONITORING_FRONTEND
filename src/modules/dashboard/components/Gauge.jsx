import React from 'react';

// Thresholds (logic same): normal <= -16 | warning -16..-12 | critical > -12
// Visual layout: green 40% | yellow 20% | red 40% (reference image jaisa)
const T_MIN = -30, T_G = -16, T_Y = -12, T_MAX = 5;
const P_G = 0.40, P_Y = 0.60;

function tempToPct(t) {
  const c = Math.max(T_MIN, Math.min(T_MAX, t));
  if (c <= T_G) return ((c - T_MIN) / (T_G - T_MIN)) * P_G;
  if (c <= T_Y) return P_G + ((c - T_G) / (T_Y - T_G)) * (P_Y - P_G);
  return P_Y + ((c - T_Y) / (T_MAX - T_Y)) * (1 - P_Y);
}

function polar(cx, cy, r, pct) {
  const a = Math.PI * (1 - pct);
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}

function arcPath(cx, cy, r, p0, p1) {
  const [x0, y0] = polar(cx, cy, r, p0);
  const [x1, y1] = polar(cx, cy, r, p1);
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
}

export function Gauge({ temperature, size = 72, status = null }) {
  const isInactive = status && status.toLowerCase() === 'inactive';

  const w = size;
  const stroke = size * 0.115;
  const r = (w - stroke) / 2 - 1;
  const cx = w / 2;
  const cy = r + stroke / 2 + 2;      // arc ka center
  const svgH = cy + size * 0.09;      // hub ke liye thodi jagah

  const pct = tempToPct(temperature);
  const needleAngle = -90 + pct * 180;
  const needleLen = r - stroke * 1.1; // arc ke andar hi rahe

  const uid = React.useId();
  const dim = isInactive ? 0.35 : 1;

  return (
    <div className="inline-flex flex-col items-center" style={{ width: w }}>
      <svg width={w} height={svgH} viewBox={`0 0 ${w} ${svgH}`} style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <linearGradient id={`needle-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4b5563" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
          <radialGradient id={`hub-${uid}`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="55%" stopColor="#374151" />
            <stop offset="100%" stopColor="#111827" />
          </radialGradient>
        </defs>

        <path d={arcPath(cx, cy + 1.5, r, 0, 1)} fill="none" stroke="rgba(0,0,0,0.10)"
              strokeWidth={stroke} strokeLinecap="round" />

        <g opacity={dim} style={{ transition: 'opacity 0.4s ease' }}>
          <path d={arcPath(cx, cy, r, 0, P_G)} fill="none" stroke="#22C55E"
                strokeWidth={stroke} strokeLinecap="round" />
          <path d={arcPath(cx, cy, r, P_G, P_Y)} fill="none" stroke="#EAB308"
                strokeWidth={stroke} />
          <path d={arcPath(cx, cy, r, P_Y, 1)} fill="none" stroke="#EF4444"
                strokeWidth={stroke} strokeLinecap="round" />
          <path d={arcPath(cx, cy - 0.8, r + stroke * 0.22, 0.04, 0.96)} fill="none"
                stroke="rgba(255,255,255,0.35)" strokeWidth={stroke * 0.18} strokeLinecap="round" />
        </g>

        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((p) => {
          const [x0, y0] = polar(cx, cy, r - stroke * 0.8, p);
          const [x1, y1] = polar(cx, cy, r - stroke * 1.3, p);
          return <line key={p} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#9CA3AF" strokeWidth={1} />;
        })}

        <g style={{
              transform: `rotate(${isInactive ? -90 : needleAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: 'transform 1s cubic-bezier(0.34, 1.4, 0.64, 1)',
            }}>
          <path d={`M ${cx - size * 0.026} ${cy} L ${cx} ${cy - needleLen} L ${cx + size * 0.026} ${cy} Z`}
                fill={`url(#needle-${uid})`} />
        </g>

        <circle cx={cx} cy={cy} r={size * 0.07} fill={`url(#hub-${uid})`} />
        <circle cx={cx} cy={cy} r={size * 0.026} fill="#e5e7eb" />
      </svg>

      <span className="text-sm font-bold tabular-nums leading-none mt-1"
            style={{ color: isInactive ? '#9CA3AF' : '#1a2332' }}>
        {temperature.toFixed(1)}°
      </span>
    </div>
  );
}

export default Gauge;