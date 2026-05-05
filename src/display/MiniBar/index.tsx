export interface MiniBarProps {
  data: number[];
  labels?: string[];
  height?: number;
  barColor?: string;
}

export function MiniBar({
  data,
  labels,
  height = 100,
  barColor = "var(--amber)",
}: MiniBarProps) {
  const max = Math.max(...data);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height }}>
      {data.map((v, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: bar-by-position rendering; index is the stable key
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            height: "100%",
            justifyContent: "flex-end",
          }}
        >
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              color: "var(--ink-3)",
              fontWeight: 600,
            }}
          >
            {v}
          </span>
          <div
            style={{
              width: "100%",
              maxWidth: 32,
              borderRadius: "4px 4px 0 0",
              height: `${(v / max) * 70}%`,
              minHeight: 4,
              background: barColor,
              opacity: 0.8,
              transition: "height 0.4s ease-out",
            }}
          />
          {labels && (
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 8,
                color: "var(--ink-4)",
              }}
            >
              {labels[i]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
