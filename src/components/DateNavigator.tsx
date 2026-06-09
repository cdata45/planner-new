import { useState } from "react";
import { useStore } from "../store";
import {
  PERSIAN_MONTHS,
  PERSIAN_WEEKDAYS_SHORT,
  addDaysToJalali,
  compareJalali,
  formatJalaliLong,
  isSameJalali,
  jalaliDaysInMonth,
  jalaliKey,
  jalaliWeekday,
  parseKey,
  todayJalali,
  toPersianDigits,
} from "../utils/jalali";
import { CalendarIcon, ChevronLeft, ChevronRight } from "./Icons";

export function DateNavigator() {
  const { selectedDate, setSelectedDate, shiftDate, data } = useStore();
  const [open, setOpen] = useState(false);

  const j = parseKey(selectedDate);
  const today = todayJalali();
  const isToday = isSameJalali(j, today);
  const isFuture = compareJalali(j, today) > 0;

  const handleGoToday = () => setSelectedDate(jalaliKey(today));

  return (
    <div className="sticky top-0 z-30 px-4 pt-4 pb-3 bg-[var(--color-bg-primary)]/85 backdrop-blur-xl border-b border-[var(--color-border)]/60">
      <div className="flex items-center gap-2">
        <button
          onClick={() => shiftDate(-1)}
          className="w-10 h-10 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition active:scale-95"
          aria-label="روز قبل"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] transition text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-[15px] font-semibold tabular-fa">
              {formatJalaliLong(j)}
            </span>
          </div>
          <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            {isToday ? "امروز" : isFuture ? "برنامه‌ریزی آینده" : "ویرایش تاریخچه"}
          </div>
        </button>

        <button
          onClick={() => shiftDate(1)}
          className="w-10 h-10 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition active:scale-95"
          aria-label="روز بعد"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition active:scale-95 ${
            open
              ? "bg-[var(--color-accent-primary)] text-white"
              : "bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
          }`}
          aria-label="تقویم"
        >
          <CalendarIcon className="w-5 h-5" />
        </button>
      </div>

      {!isToday && (
        <button
          onClick={handleGoToday}
          className="mt-2 mx-auto block text-xs text-[var(--color-accent-primary)] hover:underline"
        >
          بازگشت به امروز
        </button>
      )}

      {open && (
        <MonthCalendar
          year={j.jy}
          month={j.jm}
          selected={j}
          datesWithData={Object.keys(data.days)}
          onPick={(k) => {
            setSelectedDate(k);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function MonthCalendar({
  year,
  month,
  selected,
  datesWithData,
  onPick,
}: {
  year: number;
  month: number;
  selected: { jy: number; jm: number; jd: number };
  datesWithData: string[];
  onPick: (key: string) => void;
}) {
  const [curY, setCurY] = useState(year);
  const [curM, setCurM] = useState(month);

  const daysInMonth = jalaliDaysInMonth(curY, curM);
  const firstDayWeekday = jalaliWeekday({ jy: curY, jm: curM, jd: 1 });
  const cells: ({ day: number; key: string } | null)[] = [];
  for (let i = 0; i < firstDayWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${curY}-${String(curM).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, key });
  }

  const today = todayJalali();
  const dataSet = new Set(datesWithData);

  const prevMonth = () => {
    if (curM === 1) {
      setCurY(curY - 1);
      setCurM(12);
    } else setCurM(curM - 1);
  };
  const nextMonth = () => {
    if (curM === 12) {
      setCurY(curY + 1);
      setCurM(1);
    } else setCurM(curM + 1);
  };

  return (
    <div className="mt-3 animate-fade-up card p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-lg hover:bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-text-secondary)]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="font-semibold tabular-fa">
          {PERSIAN_MONTHS[curM - 1]} {toPersianDigits(curY)}
        </div>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-lg hover:bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-text-secondary)]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {PERSIAN_WEEKDAYS_SHORT.map((w) => (
          <div
            key={w}
            className="text-center text-[11px] text-[var(--color-text-muted)] py-1"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c) return <div key={i} />;
          const isSelected =
            selected.jy === curY && selected.jm === curM && selected.jd === c.day;
          const isToday2 =
            today.jy === curY && today.jm === curM && today.jd === c.day;
          const hasData = dataSet.has(c.key);
          return (
            <button
              key={c.key}
              onClick={() => onPick(c.key)}
              className={`aspect-square rounded-lg text-sm tabular-fa flex flex-col items-center justify-center relative transition ${
                isSelected
                  ? "bg-[var(--color-accent-primary)] text-white font-bold"
                  : isToday2
                    ? "bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] font-semibold"
                    : "hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
              }`}
            >
              <span>{toPersianDigits(c.day)}</span>
              {hasData && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--color-accent-teal)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// re-export not needed; explicit imports above
void addDaysToJalali;
