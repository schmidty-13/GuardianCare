const SUBCARRIERS = 52;
const ROWS = 4;
const COLS = 13; // 52 subcarriers

function amplitudeToHex(amp: number, min: number, max: number): string {
  if (max <= min) return '#e8f0fe';
  const t = (amp - min) / (max - min);
  const r = Math.round(30 + (1 - t) * 198);
  const g = Math.round(100 + (1 - t) * 120);
  const b = Math.round(230 + (1 - t) * 25);
  return `rgb(${r},${g},${b})`;
}

interface CSIHeatmapProps {
  amplitudes: number[];
  title?: string;
}

export function CSIHeatmap({ amplitudes, title = 'CSI amplitude (52 subcarriers)' }: CSIHeatmapProps) {
  const hasData = amplitudes.length === SUBCARRIERS;
  const displayMin = hasData ? Math.min(...amplitudes) : 0;
  const displayMax = hasData ? Math.max(...amplitudes) : 0;

  return (
    <section className="panel csi-heatmap">
      <header className="panel-header">
        <h2 className="panel-title">{title}</h2>
        {hasData && (
          <span className="panel-meta">
            Range: {displayMin.toFixed(1)} – {displayMax.toFixed(1)}
          </span>
        )}
      </header>
      <div className="heatmap-wrapper">
        <div
          className="heatmap-grid"
          role="img"
          aria-label="CSI amplitude heatmap, 52 subcarriers"
        >
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const i = r * COLS + c;
              if (i >= SUBCARRIERS) return null;
              const val = amplitudes[i] ?? 0;
              const color = amplitudeToHex(val, displayMin, displayMax || 1);
              return (
                <div
                  key={`${r}-${c}`}
                  className="heatmap-cell"
                  style={{ backgroundColor: color }}
                  title={`Subcarrier ${i + 1}: ${val.toFixed(2)}`}
                />
              );
            })
          )}
        </div>
        <div className="heatmap-legend">
          <span>Low</span>
          <div className="heatmap-legend-bar" />
          <span>High</span>
        </div>
      </div>
    </section>
  );
}
