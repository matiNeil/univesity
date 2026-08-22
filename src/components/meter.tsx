export function Meter({
  label,
  value,
  total,
  valueLabel,
  tone = "accent",
}: {
  label: string;
  value: number;
  total: number;
  valueLabel: string;
  tone?: "accent" | "good";
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const fill = tone === "good" ? "bg-chart-good" : "bg-chart-accent";
  const track = tone === "good" ? "bg-chart-good-track" : "bg-chart-accent-track";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{valueLabel}</span>
      </div>
      <div className={`h-2 w-full overflow-hidden rounded-full ${track}`}>
        <div
          className={`h-full rounded-full ${fill} transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
