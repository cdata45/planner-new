import type { ComponentType, SVGProps } from "react";
import {
  HomeIcon,
  HabitsIcon,
  TasksIcon,
  StatsIcon,
  SettingsIcon,
} from "./Icons";

export type Page = "daily" | "habits" | "tasks" | "stats" | "settings";

const items: {
  key: Page;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { key: "daily", label: "روزانه", Icon: HomeIcon },
  { key: "habits", label: "عادت‌ها", Icon: HabitsIcon },
  { key: "tasks", label: "وظایف", Icon: TasksIcon },
  { key: "stats", label: "آمار", Icon: StatsIcon },
  { key: "settings", label: "تنظیمات", Icon: SettingsIcon },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: Page;
  onChange: (p: Page) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 glass border-t border-[var(--color-border)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-xl flex items-stretch justify-around px-2 py-2">
        {items.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="relative flex-1 min-w-[48px] min-h-[56px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-200"
            >
              {isActive && (
                <span className="absolute inset-x-3 top-1 h-0.5 rounded-full bg-[var(--color-accent-primary)]" />
              )}
              <Icon
                className={`w-6 h-6 transition-all duration-200 ${
                  isActive
                    ? "text-[var(--color-accent-primary)] -translate-y-0.5 scale-110"
                    : "text-[var(--color-text-secondary)]"
                }`}
              />
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isActive
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
