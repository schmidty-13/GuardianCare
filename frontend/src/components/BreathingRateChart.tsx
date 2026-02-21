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
  /** Recent BPM readings, newest last */
  history: { bpm: number; timestamp: number }[];
  title?: string;
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function BreathingRateChart({ history, title = 'Breathing rate (BPM)' }: BreathingRateChartProps) {
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
        <h2 className="panel-title">{title}</h2>
        <span className="panel-meta">
          Normal range: {NORMAL_BPM_MIN}–{NORMAL_BPM_MAX} BPM
        </span>
      </header>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#555' }}
              interval="preserveStartEnd"
              tickFormatter={(t) => t.slice(-8)}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#555' }}
              width={32}
              tickFormatter={(v) => String(v)}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, border: '1px solid #ddd' }}
              labelFormatter={(label, payload) => (payload?.[0]?.payload?.time ?? label) as string}
              formatter={(value) => [`${value != null ? value : '—'} BPM`, 'Breathing rate']}
            />
            <ReferenceLine y={NORMAL_BPM_MIN} stroke="#81c784" strokeDasharray="2 2" />
            <ReferenceLine y={NORMAL_BPM_MAX} stroke="#81c784" strokeDasharray="2 2" />
            <Line
              type="monotone"
              dataKey="bpm"
              stroke="#1976d2"
              strokeWidth={2}
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
