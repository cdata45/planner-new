import type { Alarm, AppData, DayRecord, ErrorLog, HabitTemplate } from "../types";

const STORAGE_KEY = "rozanaam_v2";
const CURRENT_VERSION = 1;

function defaultHabits(): HabitTemplate[] {
  const now = Date.now();
  return [
    {
      id: "h_exercise",
      title: "ورزش روزانه",
      icon: "🏃",
      color: "#7C6AF7",
      category: "health",
      targetCount: 1,
      unit: "بار",
      active: true,
      order: 0,
      createdAt: now,
    },
    {
      id: "h_read",
      title: "مطالعه ۳۰ دقیقه",
      icon: "📚",
      color: "#38B2AC",
      category: "learning",
      targetCount: 1,
      unit: "بار",
      active: true,
      order: 1,
      createdAt: now,
    },
    {
      id: "h_meditate",
      title: "مدیتیشن",
      icon: "🧘",
      color: "#F0B429",
      category: "mindfulness",
      targetCount: 1,
      unit: "بار",
      active: true,
      order: 2,
      createdAt: now,
    },
    {
      id: "h_water",
      title: "نوشیدن آب کافی",
      icon: "💧",
      color: "#4FACFE",
      category: "health",
      targetCount: 8,
      unit: "لیوان",
      active: true,
      order: 3,
      createdAt: now,
    },
  ];
}

export function emptyDayRecord(date: string): DayRecord {
  const now = Date.now();
  return {
    id: date,
    date,
    mood: 0,
    energy: 0,
    positives: [],
    negatives: [],
    gratitude: ["", "", ""],
    feeling: "",
    lesson: "",
    stars: 0,
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}

function defaultData(): AppData {
  return {
    days: {},
    tasks: [],
    habits: defaultHabits(),
    completions: {},
    settings: {
      theme: "dark",
      language: "fa",
      showStreakOnHome: true,
      compactMode: false,
    },
    alarms: [],
    logs: [],
    version: CURRENT_VERSION,
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as AppData;
    // basic shape guard
    if (!parsed.days) parsed.days = {};
    if (!parsed.tasks) parsed.tasks = [];
    if (!parsed.habits || parsed.habits.length === 0)
      parsed.habits = defaultHabits();
    if (!parsed.completions) parsed.completions = {};
    if (!parsed.settings)
      parsed.settings = defaultData().settings;
    if (!parsed.alarms) parsed.alarms = [];
    if (!parsed.logs) parsed.logs = [];
    return parsed;
  } catch (e) {
    console.error("Failed to load data", e);
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
