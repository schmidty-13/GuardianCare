import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MAX_POINTS = 120;

const SUBCARRIER_COLORS = ["#1F4E79", "#2E86AB", "#A23B72", "#F18F01"];

const DEFAULT_INDICES = [0, 17, 34, 51];

interface CSIAmplitudeChartProps {
  history: { timestamp: number; amplitudes: number[] }[];
  subcarrierIndices?: number[];
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function CSIAmplitudeChart({
  history,
  subcarrierIndices = DEFAULT_INDICES,
}: CSIAmplitudeChartProps) {
  const data = useMemo(() => {
    const slice = history.slice(-MAX_POINTS);
    return slice.map((h) => {
      const point: Record<string, number | string> = {
        time: formatTime(h.timestamp),
      };
      for (const idx of subcarrierIndices) {
        point[`sc${idx}`] = h.amplitudes[idx] ?? 0;
      }
      return point;
    });
  }, [history, subcarrierIndices]);

  return (
    <section className="panel csi-amplitude-chart">
      <header className="panel-header">
        <h2 className="panel-title">CSI SUBCARRIER AMPLITUDE</h2>
        <span className="panel-meta">
          SC {subcarrierIndices.map((i) => i + 1).join(", ")}
        </span>
      </header>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: 8, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--grid-stroke, #E5E9F0)"
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "var(--text-primary, #0A2540)" }}
              interval="preserveStartEnd"
              tickFormatter={(t: string) => t.slice(-8)}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 10, fill: "var(--text-primary, #0A2540)" }}
              width={36}
              tickFormatter={(v: number) => String(Math.round(v))}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                border: "1px solid var(--grid-stroke, #E5E9F0)",
                background: "var(--panel-bg, #fff)",
                borderRadius: 6,
              }}
              labelFormatter={(label: string) => label}
              formatter={(value: number, name: string) => [
                value != null ? value.toFixed(1) : "—",
                `SC ${parseInt(name.replace("sc", "")) + 1}`,
              ]}
            />
            <Legend
              iconType="line"
              iconSize={10}
              wrapperStyle={{ fontSize: 10 }}
              formatter={(value: string) =>
                `SC ${parseInt(value.replace("sc", "")) + 1}`
              }
            />
            {subcarrierIndices.map((idx, i) => (
              <Line
                key={idx}
                type="monotone"
                dataKey={`sc${idx}`}
                stroke={SUBCARRIER_COLORS[i % SUBCARRIER_COLORS.length]}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                name={`sc${idx}`}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
