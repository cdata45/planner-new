import { useState } from "react";
import { useStore } from "../store";
import type { Alarm } from "../types";
import { PERSIAN_WEEKDAYS_SHORT } from "../utils/jalali";
import { CheckIcon, PlusIcon, TrashIcon } from "./Icons";

const TYPES = [
  { v: "reminder", label: "یادآوری عمومی" },
  { v: "habit", label: "عادت" },
  { v: "task", label: "وظیفه" },
] as const;

interface Props {
  onClose: () => void;
}

export function AlarmsModal({ onClose }: Props) {
  const { alarms, addAlarm, deleteAlarm, toggleAlarm, showToast } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("08:30");
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // all days by default
  const [type, setType] = useState<Alarm["type"]>("reminder");
  const [sound, setSound] = useState(true);
  const [vibrate, setVibrate] = useState(true);

  const toggleDay = (d: number) => {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );
  };

  const submit = () => {
    if (!title.trim()) {
      showToast("عنوان آلارم را وارد کنید", "error");
      return;
    }
    if (days.length === 0) {
      showToast("حداقل یک روز انتخاب کنید", "error");
      return;
    }
    addAlarm({
      title: title.trim(),
      time,
      days,
      active: true,
      type,
      linkedId: null,
      sound,
      vibrate,
    });
    setShowForm(false);
    // reset
    setTitle("");
    setTime("08:30");
    setDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const requestNotif = async () => {
    if ("Notification" in window) {
      const p = await Notification.requestPermission();
      showToast(p === "granted" ? "اعلان‌ها فعال شد" : "دسترسی داده نشد", p === "granted" ? "success" : "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[var(--color-bg-secondary)] rounded-t-3xl p-5 animate-slide-up overflow-y-auto"
        style={{ maxHeight: "92vh", paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}
      >
        <div className="w-12 h-1.5 rounded-full bg-[var(--color-border)] mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">آلارم‌ها و یادآوری‌ها</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl bg-[var(--color-accent-primary)] text-white active:scale-[0.985]"
          >
            <PlusIcon className="w-4 h-4" /> {showForm ? "بستن فرم" : "جدید"}
          </button>
        </div>

        {showForm && (
          <div className="card p-4 mb-4 space-y-4">
            <div>
              <div className="text-xs text-[var(--color-text-secondary)] mb-1">عنوان</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="یادآوری ورزش یا مدیتیشن"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-[var(--color-text-secondary)] mb-1">زمان (۲۴ ساعته)</div>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm tabular-fa"
                />
              </div>
              <div>
                <div className="text-xs text-[var(--color-text-secondary)] mb-1">نوع</div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm"
                >
                  {TYPES.map((t) => (
                    <option key={t.v} value={t.v}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="text-xs text-[var(--color-text-secondary)] mb-1.5">روزهای هفته</div>
              <div className="flex flex-wrap gap-1.5">
                {PERSIAN_WEEKDAYS_SHORT.map((label, idx) => {
                  const active = days.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleDay(idx)}
                      className={`px-3 py-1 text-xs rounded-xl border transition ${active ? "bg-[var(--color-accent-primary)] border-[var(--color-accent-primary)] text-white" : "border-[var(--color-border)]"}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} className="accent-[var(--color-accent-primary)]" />
                پخش صدا
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={vibrate} onChange={(e) => setVibrate(e.target.checked)} className="accent-[var(--color-accent-primary)]" />
                لرزش
              </label>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm">انصراف</button>
              <button onClick={submit} className="flex-1 py-2.5 rounded-xl bg-[var(--color-accent-primary)] text-white text-sm font-semibold">ذخیره آلارم</button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-2 mb-4">
          {alarms.length === 0 && (
            <div className="text-center py-6 text-sm text-[var(--color-text-muted)] card">
              هنوز آلارمی تعریف نشده است
            </div>
          )}
          {alarms.map((al) => {
            const dayLabels = al.days.map((d) => PERSIAN_WEEKDAYS_SHORT[d]).join(" ");
            return (
              <div key={al.id} className="card p-3 flex gap-3 items-center">
                <button
                  onClick={() => toggleAlarm(al.id)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition border-2 ${al.active ? "bg-[var(--color-success)] border-[var(--color-success)] text-white" : "border-[var(--color-border)]"}`}
                >
                  {al.active && <CheckIcon className="w-4 h-4" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{al.title}</div>
                  <div className="text-[11px] text-[var(--color-text-secondary)] tabular-fa mt-0.5">
                    {al.time} • {dayLabels} • {TYPES.find((t) => t.v === al.type)?.label}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                    {al.sound ? "🔊" : "🔇"} {al.vibrate ? "📳" : ""}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm("حذف آلارم؟")) deleteAlarm(al.id);
                  }}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-1"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button onClick={requestNotif} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-sm">
            اجازه اعلان مرورگر
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-sm font-semibold">
            بستن
          </button>
        </div>

        <p className="text-[10px] text-center text-[var(--color-text-muted)] mt-4">
          آلارم‌ها هر ۱۵ ثانیه بررسی می‌شوند. مرورگر باید باز باشد.
        </p>
      </div>
    </div>
  );
}
