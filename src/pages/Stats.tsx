import { useMemo } from "react";
import { useStore } from "../store";
import {
  addDaysToJalali,
  jalaliKey,
  parseKey,
  PERSIAN_WEEKDAYS_SHORT,
  todayKey,
  toPersianDigits,
} from "../utils/jalali";
import { FlameIcon, StarIcon } from "../components/Icons";

export function StatsPage() {
  const { data, getCompletion } = useStore();

  const todayK = todayKey();
  const last30 = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) =>
      jalaliKey(addDaysToJalali(parseKey(todayK), -29 + i)),
    );
  }, [todayK]);

  const last7 = last30.slice(-7);

  // Mood line chart (last 7 days)
  const moodData = last7.map((d) => {
    const day = data.days[d];
    return { date: d, value: day?.mood || 0 };
  });

  // Habits completion heatmap
  const habitCompletionMap: Record<string, number> = {};
  last30.forEach((d) => {
    let total = 0;
    let done = 0;
    data.habits.forEach((h) => {
      total++;
      const c = getCompletion(h.id, d);
      if (c.count >= h.targetCount) done++;
    });
    habitCompletionMap[d] = total > 0 ? done / total : 0;
  });

  // Totals
  const totalDays = Object.keys(data.days).length;
  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter((t) => t.completed).length;
  const avgMood =
    Object.values(data.days)
      .filter((d) => d.mood > 0)
      .reduce((acc, d) => acc + d.mood, 0) /
    Math.max(1, Object.values(data.days).filter((d) => d.mood > 0).length);
  const avgEnergy =
    Object.values(data.days)
      .filter((d) => d.energy > 0)
      .reduce((acc, d) => acc + d.energy, 0) /
    Math.max(1, Object.values(data.days).filter((d) => d.energy > 0).length);

  const totalStars = Object.values(data.days).reduce((acc, d) => acc + d.stars, 0);

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-30 px-4 pt-6 pb-3 bg-[var(--color-bg-primary)]/85 backdrop-blur-xl border-b border-[var(--color-border)]/60">
        <div className="max-w-xl mx-auto">
          <h1 className="text-xl font-bold">آمار و تحلیل</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            نگاهی به مسیر رشدت
          </p>
        </div>
      </header>

      <div className="px-4 mt-4 max-w-xl mx-auto space-y-4">
        {/* Quick stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="📓"
            label="روزهای ثبت‌شده"
            value={toPersianDigits(totalDays)}
            color="#7C6AF7"
          />
          <StatCard
            icon="✓"
            label="وظایف کامل"
            value={`${toPersianDigits(completedTasks)} / ${toPersianDigits(totalTasks)}`}
            color="#26DE81"
          />
          <StatCard
            icon="😊"
            label="میانگین حال"
            value={avgMood ? toPersianDigits(avgMood.toFixed(1)) : "—"}
            color="#F06292"
          />
          <StatCard
            icon="⚡"
            label="میانگین انرژی"
            value={avgEnergy ? toPersianDigits(avgEnergy.toFixed(1)) : "—"}
            color="#F0B429"
          />
        </div>

        {/* Mood Line Chart */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">روند خلق و خو</h3>
            <span className="text-[11px] text-[var(--color-text-muted)]">۷ روز گذشته</span>
          </div>
          <MoodChart data={moodData} />
        </div>

        {/* Habits Heatmap */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">پایداری در عادت‌ها</h3>
            <span className="text-[11px] text-[var(--color-text-muted)]">۳۰ روز گذشته</span>
          </div>
          <Heatmap days={last30} values={habitCompletionMap} />
          <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-[var(--color-text-muted)]">
            <span>کم</span>
            <div className="flex gap-1">
              {[0.1, 0.3, 0.5, 0.75, 1].map((v) => (
                <div
                  key={v}
                  className="w-3 h-3 rounded"
                  style={{ background: heatColor(v) }}
                />
              ))}
            </div>
            <span>زیاد</span>
          </div>
        </div>

        {/* Habits leaderboard */}
        <div className="card p-4">
          <h3 className="font-bold text-sm mb-3">عادت‌های برتر</h3>
          <div className="space-y-2">
            {data.habits.length === 0 && (
              <p className="text-xs text-[var(--color-text-muted)] text-center py-4">
                هنوز عادتی نداری
              </p>
            )}
            {data.habits.map((h) => {
              const count30 = last30.filter((d) => {
                const c = getCompletion(h.id, d);
                return c.count >= h.targetCount;
              }).length;
              const pct = (count30 / 30) * 100;
              return (
                <div key={h.id} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${h.color}25`, color: h.color }}
                  >
                    {h.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate">{h.title}</span>
                      <span className="tabular-fa text-[var(--color-text-muted)]">
                        {toPersianDigits(count30)}/{toPersianDigits(30)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: h.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stars summary */}
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-gold)]/20 text-[var(--color-accent-gold)] flex items-center justify-center">
            <StarIcon filled className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-[var(--color-text-secondary)]">جمع ستاره‌های ثبت‌شده</div>
            <div className="text-2xl font-bold tabular-fa">{toPersianDigits(totalStars)}</div>
          </div>
          <div className="text-[var(--color-accent-gold)]">
            <FlameIcon className="w-7 h-7" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="card p-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2"
        style={{ background: `${color}25` }}
      >
        {icon}
      </div>
      <div className="text-[11px] text-[var(--color-text-secondary)]">{label}</div>
      <div className="text-xl font-bold tabular-fa mt-0.5">{value}</div>
    </div>
  );
}

function MoodChart({ data }: { data: { date: string; value: number }[] }) {
  const W = 320;
  const H = 140;
  const PAD = 24;
  const max = 5;

  const points = data.map((d, i) => {
    const x = PAD + (i * (W - PAD * 2)) / Math.max(1, data.length - 1);
    const y = H - PAD - (d.value / max) * (H - PAD * 2);
    return { x, y, value: d.value, date: d.date };
  });

  const path = points
    .filter((p) => p.value > 0)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = path
    ? `${path} L ${points[points.length - 1].x} ${H - PAD} L ${points[0].x} ${H - PAD} Z`
    : "";

  return (
    <div className="mt-3 -mx-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C6AF7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7C6AF7" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid lines */}
        {[1, 2, 3, 4, 5].map((v) => {
          const y = H - PAD - (v / max) * (H - PAD * 2);
          return (
            <line
              key={v}
              x1={PAD}
              x2={W - PAD}
              y1={y}
              y2={y}
              stroke="#2a2a38"
              strokeDasharray="2 4"
              strokeWidth="0.5"
            />
          );
        })}

        {/* area */}
        {areaPath && <path d={areaPath} fill="url(#moodGrad)" />}

        {/* line */}
        {path && (
          <path d={path} fill="none" stroke="#7C6AF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* dots */}
        {points.map((p, i) =>
          p.value > 0 ? (
            <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#7C6AF7" stroke="#0F0F13" strokeWidth="2" />
          ) : null,
        )}

        {/* x labels */}
        {points.map((p, i) => {
          const jd = parseKey(p.date);
          const wd = (new Date().getDay() + 1 - (points.length - 1 - i)) % 7;
          return (
            <text
              key={i}
              x={p.x}
              y={H - 6}
              textAnchor="middle"
              fill="#55546A"
              fontSize="9"
              style={{ fontFamily: "Vazirmatn" }}
            >
              {PERSIAN_WEEKDAYS_SHORT[((wd % 7) + 7) % 7]}
              {" "}
              {toPersianDigits(jd.jd)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function heatColor(v: number): string {
  if (v <= 0) return "#22222e";
  if (v < 0.25) return "rgba(124,106,247,0.25)";
  if (v < 0.5) return "rgba(124,106,247,0.45)";
  if (v < 0.75) return "rgba(124,106,247,0.7)";
  return "rgba(124,106,247,1)";
}

function Heatmap({
  days,
  values,
}: {
  days: string[];
  values: Record<string, number>;
}) {
  // arrange as 5 weeks x 7 days
  const cols = Math.ceil(days.length / 7);
  return (
    <div className="mt-3 grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, ci) => (
        <div key={ci} className="grid grid-rows-7 gap-1">
          {Array.from({ length: 7 }).map((_, ri) => {
            const idx = ci * 7 + ri;
            const d = days[idx];
            if (!d) return <div key={ri} className="aspect-square" />;
            const v = values[d] || 0;
            return (
              <div
                key={ri}
                className="aspect-square rounded"
                style={{ background: heatColor(v) }}
                title={`${d}: ${Math.round(v * 100)}%`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
