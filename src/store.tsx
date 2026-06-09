import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Alarm,
  AppData,
  DayRecord,
  ErrorLog,
  HabitCompletion,
  HabitTemplate,
  Settings,
  Task,
} from "./types";
import { emptyDayRecord, loadData, saveData, uid } from "./utils/storage";
import {
  addDaysToJalali,
  jalaliKey,
  jalaliWeekday,
  parseKey,
  todayJalali,
  todayKey,
} from "./utils/jalali";

interface ToastMsg {
  id: string;
  text: string;
  tone?: "success" | "error" | "info";
}

interface Store {
  data: AppData;
  selectedDate: string;
  setSelectedDate: (key: string) => void;
  shiftDate: (offset: number) => void;

  getDay: (date: string) => DayRecord;
  updateDay: (date: string, patch: Partial<DayRecord>) => void;

  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  tasksForDate: (date: string) => Task[];

  addHabit: (h: Omit<HabitTemplate, "id" | "createdAt" | "order">) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  incrementHabit: (habitId: string, date: string, delta: number) => void;
  getCompletion: (habitId: string, date: string) => HabitCompletion;
  habitStreak: (habitId: string) => { current: number; best: number };

  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;

  // Alarms
  alarms: Alarm[];
  addAlarm: (a: Omit<Alarm, "id" | "lastTriggered">) => void;
  updateAlarm: (id: string, patch: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;

  // Logs
  logs: ErrorLog[];
  addLog: (log: Omit<ErrorLog, "id" | "timestamp">) => void;
  clearLogs: () => void;

  // Backup
  exportBackup: (rangeDays?: number | "all") => void;

  toasts: ToastMsg[];
  showToast: (text: string, tone?: ToastMsg["tone"]) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [selectedDate, setSelectedDate] = useState<string>(() => todayKey());
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const saveTimer = useRef<number | null>(null);

  // Debounced save
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveData(data);
    }, 400);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [data]);

  const showToast = useCallback(
    (text: string, tone: ToastMsg["tone"] = "success") => {
      const id = uid("t");
      setToasts((prev) => [...prev, { id, text, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2200);
    },
    [],
  );

  const shiftDate = useCallback(
    (offset: number) => {
      const j = parseKey(selectedDate);
      const newJ = addDaysToJalali(j, offset);
      setSelectedDate(jalaliKey(newJ));
    },
    [selectedDate],
  );

  const getDay = useCallback(
    (date: string): DayRecord => {
      return data.days[date] || emptyDayRecord(date);
    },
    [data.days],
  );

  const updateDay = useCallback((date: string, patch: Partial<DayRecord>) => {
    setData((prev) => {
      const existing = prev.days[date] || emptyDayRecord(date);
      const updated: DayRecord = {
        ...existing,
        ...patch,
        updatedAt: Date.now(),
      };
      return { ...prev, days: { ...prev.days, [date]: updated } };
    });
  }, []);

  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt">) => {
      const newTask: Task = {
        ...task,
        id: uid("task"),
        createdAt: Date.now(),
      };
      setData((prev) => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
      showToast("وظیفه اضافه شد");
    },
    [showToast],
  );

  const toggleTask = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? Date.now() : null,
            }
          : t,
      ),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const tasksForDate = useCallback(
    (date: string): Task[] => {
      return data.tasks
        .filter((t) => t.date === date)
        .sort((a, b) => Number(a.completed) - Number(b.completed));
    },
    [data.tasks],
  );

  const addHabit = useCallback(
    (h: Omit<HabitTemplate, "id" | "createdAt" | "order">) => {
      const newHabit: HabitTemplate = {
        ...h,
        id: uid("h"),
        createdAt: Date.now(),
        order: data.habits.length,
      };
      setData((prev) => ({ ...prev, habits: [...prev.habits, newHabit] }));
      showToast("عادت جدید ساخته شد");
    },
    [data.habits.length, showToast],
  );

  const deleteHabit = useCallback((id: string) => {
    setData((prev) => {
      const newCompletions = { ...prev.completions };
      Object.keys(newCompletions).forEach((k) => {
        if (newCompletions[k].habitId === id) delete newCompletions[k];
      });
      return {
        ...prev,
        habits: prev.habits.filter((h) => h.id !== id),
        completions: newCompletions,
      };
    });
  }, []);

  const getCompletion = useCallback(
    (habitId: string, date: string): HabitCompletion => {
      const key = `${habitId}_${date}`;
      return (
        data.completions[key] || {
          id: key,
          habitId,
          date,
          count: 0,
          completedAt: null,
        }
      );
    },
    [data.completions],
  );

  const setCompletionInternal = (
    habitId: string,
    date: string,
    count: number,
  ) => {
    setData((prev) => {
      const key = `${habitId}_${date}`;
      const habit = prev.habits.find((h) => h.id === habitId);
      const target = habit?.targetCount ?? 1;
      const safeCount = Math.max(0, Math.min(count, target));
      const completion: HabitCompletion = {
        id: key,
        habitId,
        date,
        count: safeCount,
        completedAt: safeCount >= target ? Date.now() : null,
      };
      return {
        ...prev,
        completions: { ...prev.completions, [key]: completion },
      };
    });
  };

  const toggleHabitCompletion = useCallback(
    (habitId: string, date: string) => {
      const habit = data.habits.find((h) => h.id === habitId);
      if (!habit) return;
      const current = getCompletion(habitId, date);
      const newCount = current.count >= habit.targetCount ? 0 : habit.targetCount;
      setCompletionInternal(habitId, date, newCount);
    },
    [data.habits, getCompletion],
  );

  const incrementHabit = useCallback(
    (habitId: string, date: string, delta: number) => {
      const current = getCompletion(habitId, date);
      setCompletionInternal(habitId, date, current.count + delta);
    },
    [getCompletion],
  );

  const habitStreak = useCallback(
    (habitId: string) => {
      const habit = data.habits.find((h) => h.id === habitId);
      if (!habit) return { current: 0, best: 0 };

      // Walk backwards from today to find current streak
      let current = 0;
      let cursor = parseKey(todayKey());
      while (true) {
        const key = jalaliKey(cursor);
        const c = data.completions[`${habitId}_${key}`];
        if (c && c.count >= habit.targetCount) {
          current++;
          cursor = addDaysToJalali(cursor, -1);
        } else {
          break;
        }
      }

      // Best streak: scan all completions
      const completed = Object.values(data.completions)
        .filter((c) => c.habitId === habitId && c.count >= habit.targetCount)
        .map((c) => c.date)
        .sort();

      let best = 0;
      let run = 0;
      let prev: string | null = null;
      for (const d of completed) {
        if (prev) {
          const nextOfPrev = jalaliKey(addDaysToJalali(parseKey(prev), 1));
          if (d === nextOfPrev) {
            run++;
          } else {
            best = Math.max(best, run);
            run = 1;
          }
        } else {
          run = 1;
        }
        prev = d;
      }
      best = Math.max(best, run, current);
      return { current, best };
    },
    [data.habits, data.completions],
  );

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem("rozanaam_v2");
    window.location.reload();
  }, []);

  // Alarms & Logs exposed from data
  const alarms = data.alarms;
  const logs = data.logs;

  // --- ALARMS CRUD ---
  const addAlarm = useCallback((a: Omit<Alarm, "id" | "lastTriggered">) => {
    const newAlarm: Alarm = { ...a, id: uid("alarm") };
    setData((prev) => ({ ...prev, alarms: [...prev.alarms, newAlarm] }));
    showToast("آلارم جدید ثبت شد");
  }, [showToast]);

  const updateAlarm = useCallback((id: string, patch: Partial<Alarm>) => {
    setData((prev) => ({
      ...prev,
      alarms: prev.alarms.map((al) => (al.id === id ? { ...al, ...patch } : al)),
    }));
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    setData((prev) => ({ ...prev, alarms: prev.alarms.filter((a) => a.id !== id) }));
  }, []);

  const toggleAlarm = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      alarms: prev.alarms.map((a) =>
        a.id === id ? { ...a, active: !a.active } : a,
      ),
    }));
  }, []);

  // --- LOGS ---
  const addLog = useCallback((log: Omit<ErrorLog, "id" | "timestamp">) => {
    const entry: ErrorLog = {
      ...log,
      id: uid("log"),
      timestamp: Date.now(),
    };
    setData((prev) => ({ ...prev, logs: [entry, ...prev.logs].slice(0, 200) }));
  }, []);

  const clearLogs = useCallback(() => {
    setData((prev) => ({ ...prev, logs: [] }));
    showToast("لاگ‌ها پاک شدند");
  }, [showToast]);

  // --- BACKUP WITH TIME RANGE ---
  const exportBackup = useCallback((rangeDays: number | "all" = "all") => {
    const now = Date.now();
    let cutoff = 0;
    if (rangeDays !== "all") {
      cutoff = now - rangeDays * 24 * 60 * 60 * 1000;
    }

    const filteredDays: Record<string, DayRecord> = {};
    Object.entries(data.days).forEach(([k, d]) => {
      if (rangeDays === "all" || d.updatedAt >= cutoff) {
        filteredDays[k] = d;
      }
    });

    const filteredTasks = data.tasks.filter((t) =>
      rangeDays === "all" || t.createdAt >= cutoff,
    );

    const filteredCompletions: Record<string, HabitCompletion> = {};
    Object.entries(data.completions).forEach(([k, c]) => {
      if (rangeDays === "all") {
        filteredCompletions[k] = c;
      } else {
        // approximate using the date string if present
        filteredCompletions[k] = c;
      }
    });

    const backup = {
      ...data,
      days: filteredDays,
      tasks: filteredTasks,
      completions: filteredCompletions,
      exportedAt: now,
      range: rangeDays,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const rangeLabel = rangeDays === "all" ? "all" : `${rangeDays}d`;
    a.href = url;
    a.download = `rozanaam-backup-${rangeLabel}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("پشتیبان دانلود شد");
  }, [data, showToast]);

  // --- ALARM TRIGGER ---
  const triggerAlarm = useCallback(
    (alarm: Alarm) => {
      const nowTs = Date.now();
      // prevent repeat within the same minute
      if (
        alarm.lastTriggered &&
        Math.floor(alarm.lastTriggered / 60000) === Math.floor(nowTs / 60000)
      ) {
        return;
      }

      showToast(`🔔 ${alarm.title}`, "info");

      // Browser Notification
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            new Notification("روزانه‌ام", {
              body: alarm.title,
              tag: alarm.id,
            });
          } catch {}
        } else if (Notification.permission === "default") {
          Notification.requestPermission();
        }
      }

      // Sound
      if (alarm.sound) {
        playChime();
      }

      // Vibrate
      if (alarm.vibrate && "vibrate" in navigator) {
        try {
          navigator.vibrate([180, 70, 180]);
        } catch {}
      }

      // Update lastTriggered
      setData((prev) => ({
        ...prev,
        alarms: prev.alarms.map((al) =>
          al.id === alarm.id ? { ...al, lastTriggered: nowTs } : al,
        ),
      }));

      addLog({
        level: "info",
        source: "alarm",
        message: `Alarm triggered: ${alarm.title}`,
      });
    },
    [showToast, addLog],
  );

  // Web Audio simple chime
  const playChime = () => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.value = 932;
      filter.type = "lowpass";
      filter.frequency.value = 1400;

      gain.gain.value = 0.28;

      const t0 = audioCtx.currentTime;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t0);
      gain.gain.linearRampToValueAtTime(0.0001, t0 + 0.85);
      osc.stop(t0 + 0.95);
    } catch {}
  };

  // Alarm polling — checks every 15 seconds
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;

      const j = todayJalali();
      const currentWd = jalaliWeekday(j); // 0=شنبه

      data.alarms.forEach((alarm) => {
        if (!alarm.active) return;
        if (!alarm.days.includes(currentWd)) return;
        if (alarm.time !== currentTime) return;
        triggerAlarm(alarm);
      });
    }, 15000);

    return () => clearInterval(id);
  }, [data.alarms, triggerAlarm]);

  const value: Store = useMemo(
    () => ({
      data,
      selectedDate,
      setSelectedDate,
      shiftDate,
      getDay,
      updateDay,
      addTask,
      toggleTask,
      deleteTask,
      updateTask,
      tasksForDate,
      addHabit,
      deleteHabit,
      toggleHabitCompletion,
      incrementHabit,
      getCompletion,
      habitStreak,
      updateSettings,
      resetAll,

      alarms,
      addAlarm,
      updateAlarm,
      deleteAlarm,
      toggleAlarm,

      logs,
      addLog,
      clearLogs,

      exportBackup,

      toasts,
      showToast,
    }),
    [
      data,
      selectedDate,
      shiftDate,
      getDay,
      updateDay,
      addTask,
      toggleTask,
      deleteTask,
      updateTask,
      tasksForDate,
      addHabit,
      deleteHabit,
      toggleHabitCompletion,
      incrementHabit,
      getCompletion,
      habitStreak,
      updateSettings,
      resetAll,
      alarms,
      addAlarm,
      updateAlarm,
      deleteAlarm,
      toggleAlarm,
      logs,
      addLog,
      clearLogs,
      exportBackup,
      toasts,
      showToast,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
