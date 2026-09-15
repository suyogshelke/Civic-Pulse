import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { tooltipStyle } from './chartTheme';
import { STATUS_META } from '../../utils/constants';

const VARIANT_HEX = {
  secondary: '#6c757d', info: '#0fb3a6', primary: '#1552a3',
  warning: '#f4a02c', success: '#198754', dark: '#0f2540', danger: '#dc3545',
};

/** Donut of complaints by status, coloured to match the status badges. */
export default function StatusDonut({ data, height = 300 }) {
  const coloured = data.map((d) => ({
    ...d,
    fill: VARIANT_HEX[STATUS_META[d.key]?.variant] || '#6c757d',
    name: STATUS_META[d.key]?.label || d.name,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={coloured} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
          {coloured.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
