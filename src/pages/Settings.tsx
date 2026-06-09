import { useState } from "react";
import { useStore } from "../store";
import { toPersianDigits } from "../utils/jalali";
import { AlarmsModal } from "../components/AlarmsModal";
import { DebugPanel } from "../components/DebugPanel"; // used in JSX below

export function SettingsPage() {
  const { data, updateSettings, resetAll, exportBackup, logs, alarms } = useStore();
  const { settings } = data;

  const [showAlarms, setShowAlarms] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [backupRange, setBackupRange] = useState<number | "all">("all");

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rozanaam-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        localStorage.setItem("rozanaam_v2", JSON.stringify(parsed));
        window.location.reload();
      } catch {
        alert("فایل نامعتبر است");
      }
    };
    reader.readAsText(file);
  };

  const totals = {
    days: Object.keys(data.days).length,
    tasks: data.tasks.length,
    habits: data.habits.length,
    completions: Object.keys(data.completions).length,
  };

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-30 px-4 pt-6 pb-3 bg-[var(--color-bg-primary)]/85 backdrop-blur-xl border-b border-[var(--color-border)]/60">
        <div className="max-w-xl mx-auto">
          <h1 className="text-xl font-bold">تنظیمات</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            شخصی‌سازی تجربه‌ات
          </p>
        </div>
      </header>

      <div className="px-4 mt-4 max-w-xl mx-auto space-y-4">
        {/* Display */}
        <Section title="نمایش">
          <Row label="نمایش رکورد عادت‌ها در خانه">
            <Toggle
              checked={settings.showStreakOnHome}
              onChange={(v) => updateSettings({ showStreakOnHome: v })}
            />
          </Row>
          <Row label="حالت فشرده">
            <Toggle
              checked={settings.compactMode}
              onChange={(v) => updateSettings({ compactMode: v })}
            />
          </Row>
        </Section>

        {/* Data & Time-Range Backup */}
        <Section title="داده‌ها و پشتیبان‌گیری">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <StatBox label="روزها" value={totals.days} />
            <StatBox label="وظایف" value={totals.tasks} />
            <StatBox label="عادت‌ها" value={totals.habits} />
            <StatBox label="ثبت عادت‌ها" value={totals.completions} />
          </div>

          <div className="mb-2">
            <div className="text-xs text-[var(--color-text-secondary)] mb-1">بازه زمانی پشتیبان</div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { v: "all" as const, label: "همه" },
                { v: 7, label: "۷ روز اخیر" },
                { v: 30, label: "۳۰ روز اخیر" },
                { v: 90, label: "۹۰ روز اخیر" },
              ].map((opt) => (
                <button
                  key={String(opt.v)}
                  onClick={() => setBackupRange(opt.v)}
                  className={`px-3 py-1 text-xs rounded-full border transition tabular-fa ${backupRange === opt.v ? "bg-[var(--color-accent-primary)] border-[var(--color-accent-primary)] text-white" : "border-[var(--color-border)]"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => exportBackup(backupRange)}
            className="w-full py-3 rounded-xl bg-[var(--color-accent-primary)] text-white text-sm font-semibold active:scale-[0.985] transition mb-2"
          >
            📥 دریافت پشتیبان (بازه انتخابی)
          </button>

          <button
            onClick={exportData}
            className="w-full py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-bg-hover)] transition mb-2"
          >
            📥 دریافت پشتیبان کامل
          </button>

          <label className="block">
            <input type="file" accept="application/json" onChange={importData} className="hidden" />
            <span className="block text-center w-full py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-bg-hover)] transition cursor-pointer">
              📤 بازیابی پشتیبان
            </span>
          </label>
        </Section>

        {/* Danger */}
        <Section title="منطقه خطر">
          <button
            onClick={() => {
              if (confirm("تمام داده‌ها پاک می‌شود. مطمئنی؟")) resetAll();
            }}
            className="w-full py-3 rounded-xl bg-[var(--color-danger)]/15 border border-[var(--color-danger)]/30 text-[var(--color-danger)] text-sm font-semibold hover:bg-[var(--color-danger)]/25 transition"
          >
            🗑 پاک کردن همه داده‌ها
          </button>
        </Section>

        {/* Alarms */}
        <Section title="آلارم‌ها و یادآوری‌ها">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">مدیریت آلارم‌های روزانه</div>
              <div className="text-xs text-[var(--color-text-muted)] tabular-fa mt-0.5">{toPersianDigits(alarms.length)} آلارم فعال</div>
            </div>
            <button
              onClick={() => setShowAlarms(true)}
              className="px-4 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm font-semibold active:scale-[0.985]"
            >
              مدیریت
            </button>
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-2 leading-relaxed">
            آلارم‌ها با نوتیفیکیشن مرورگر، صدا و لرزش کار می‌کنند (مرورگر باید باز باشد).
          </div>
        </Section>

        {/* Debug / Logs */}
        <Section title="لاگ و ابزار توسعه">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">لاگ‌های خطا و رویدادها</div>
              <div className="text-xs text-[var(--color-text-muted)] tabular-fa mt-0.5">{toPersianDigits(logs.length)} مورد ثبت‌شده</div>
            </div>
            <button
              onClick={() => setShowDebug(true)}
              className="px-4 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm font-semibold active:scale-[0.985]"
            >
              مشاهده لاگ‌ها
            </button>
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)] mt-2">
            برای توسعه‌دهندگان • Long-press روی لوگو در آینده
          </div>
        </Section>

        {/* About */}
        <Section title="درباره">
          <div className="text-center py-4">
            <div className="text-3xl mb-2">🌱</div>
            <div className="font-bold">روزانه‌ام</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1 tabular-fa">
              نسخه {toPersianDigits("2.0.0")}
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-3 leading-relaxed">
              همراه رشد روزانه‌ات.
              <br />
              ساخته شده با ❤️ برای کسانی که هر روز کمی بهتر می‌شوند.
            </p>
          </div>
        </Section>
      </div>

      {/* Modals */}
      {showAlarms && <AlarmsModal onClose={() => setShowAlarms(false)} />}
      {showDebug && <DebugPanel onClose={() => setShowDebug(false)} />}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2 px-1 font-semibold">
        {title}
      </h2>
      <div className="card p-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition ${
        checked ? "bg-[var(--color-accent-primary)]" : "bg-[var(--color-bg-elevated)]"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
          checked ? "right-0.5" : "right-[22px]"
        }`}
      />
    </button>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[var(--color-bg-elevated)]/60 border border-[var(--color-border)] p-3">
      <div className="text-[10px] text-[var(--color-text-muted)]">{label}</div>
      <div className="text-lg font-bold tabular-fa mt-0.5">
        {toPersianDigits(value)}
      </div>
    </div>
  );
}
