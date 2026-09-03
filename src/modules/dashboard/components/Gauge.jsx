import React from 'react';

const MIN_TEMP = -20;
const MAX_TEMP = 5;
const RANGE = MAX_TEMP - MIN_TEMP;

// normal_freezers: <= -16°C (Green)
// warning_freezers: > -16°C AND <= -12°C (Yellow)
// critical_freezers: > -12°C (Red)
// inactive_freezers: No data for 5 minutes (Gray)
function tempArcColor(temp) {
  if (temp <= -16) return '#22C55E';    // Normal - Green
  if (temp > -16 && temp <= -12) return '#EAB308';  // Warning - Yellow
  if (temp > -12) return '#EF4444';     // Critical - Red
  return '#22C55E'; // fallback
}

function getColorByStatus(temp, status) {
  if (status && status.toLowerCase() === 'inactive') {
    return '#9CA3AF'; // Gray color for Inactive
  }
  return tempArcColor(temp);
}

export function Gauge({ temperature, size = 72, status = null }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = Math.PI * radius;
  const pct = Math.max(0, Math.min(1, (temperature - MIN_TEMP) / RANGE));
  const dash = circumference * pct;
  
  const color = status ? getColorByStatus(temperature, status) : tempArcColor(temperature);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size / 2 + 4 }}>
      <svg width={size} height={size / 2 + 4} viewBox={`0 0 ${size} ${size / 2 + 4}`}>
        {/* Background arc */}
        <path
          d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke="#eef0f3"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.8s ease-out, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute bottom-0 text-center w-full">
        <span className="text-sm font-bold text-[#1a2332] tabular-nums">{temperature.toFixed(1)}°</span>
      </div>
    </div>
  );
}

export default Gauge;