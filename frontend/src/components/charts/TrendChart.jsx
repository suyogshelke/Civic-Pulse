import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AXIS, GRID, tooltipStyle } from './chartTheme';

/** Submitted vs resolved over the last six months. */
export default function TrendChart({ data, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1552a3" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#1552a3" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gRes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0fb3a6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#0fb3a6" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#1552a3" strokeWidth={2.5} fill="url(#gSub)" />
        <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#0fb3a6" strokeWidth={2.5} fill="url(#gRes)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
