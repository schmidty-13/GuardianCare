import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const MAX_POINTS = 120;
const NORMAL_BPM_MIN = 12;
const NORMAL_BPM_MAX = 20;

interface DataPoint {
  time: string;
  bpm: number;
  index: number;
}

interface BreathingRateChartProps {
  history: { bpm: number; timestamp: number }[];
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function BreathingRateChart({ history }: BreathingRateChartProps) {
  const data: DataPoint[] = useMemo(() => {
    const slice = history.slice(-MAX_POINTS);
    return slice.map((h, i) => ({
      time: formatTime(h.timestamp),
      bpm: h.bpm,
      index: i,
    }));
  }, [history]);

  return (
    <section className="panel breathing-chart">
      <header className="panel-header">
        <h2 className="panel-title">BREATHING RATE (BPM)</h2>
        <span className="panel-meta">
          {NORMAL_BPM_MIN}–{NORMAL_BPM_MAX} BPM normal
        </span>
      </header>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E9F0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#0A2540' }}
              interval="preserveStartEnd"
              tickFormatter={(t) => t.slice(-8)}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 10, fill: '#0A2540' }}
              width={28}
              tickFormatter={(v) => String(v)}
            />
            <Tooltip
              contentStyle={{ fontSize: 11, border: '1px solid #E5E9F0', background: '#fff' }}
              labelFormatter={(label, payload) => (payload?.[0]?.payload?.time ?? label) as string}
              formatter={(value) => [`${value != null ? value : '—'} BPM`, 'Breathing rate']}
            />
            <ReferenceLine y={NORMAL_BPM_MIN} stroke="#1F4E79" strokeDasharray="2 2" strokeOpacity={0.5} />
            <ReferenceLine y={NORMAL_BPM_MAX} stroke="#1F4E79" strokeDasharray="2 2" strokeOpacity={0.5} />
            <Line
              type="monotone"
              dataKey="bpm"
              stroke="#1F4E79"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              name="BPM"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
