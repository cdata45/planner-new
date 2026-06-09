export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type Priority = "low" | "medium" | "high" | "urgent";

export interface DayRecord {
  id: string; // "1403-09-15"
  date: string;
  mood: MoodLevel | 0;
  energy: MoodLevel | 0;
  positives: string[];
  negatives: string[];
  gratitude: [string, string, string];
  feeling: string;
  lesson: string;
  stars: number; // 0-5
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  date: string;
  title: string;
  priority: Priority;
  completed: boolean;
  completedAt: number | null;
  tags: string[];
  estimatedMinutes: number | null;
  createdAt: number;
}

export interface HabitTemplate {
  id: string;
  title: string;
  icon: string;
  color: string;
  category: string;
  targetCount: number;
  unit: string;
  active: boolean;
  order: number;
  createdAt: number;
}

export interface HabitCompletion {
  id: string; // habitId_date
  habitId: string;
  date: string;
  count: number;
  completedAt: number | null;
}

export interface Settings {
  theme: "dark" | "light";
  language: "fa" | "en";
  showStreakOnHome: boolean;
  compactMode: boolean;
}

export interface AppData {
  days: Record<string, DayRecord>;
  tasks: Task[];
  habits: HabitTemplate[];
  completions: Record<string, HabitCompletion>;
  settings: Settings;
  alarms: Alarm[];
  logs: ErrorLog[];
  version: number;
}

export interface Alarm {
  id: string;
  title: string;
  time: string; // "HH:MM"
  days: number[]; // 0 = شنبه ... 6 = جمعه
  active: boolean;
  type: "reminder" | "habit" | "task";
  linkedId: string | null;
  sound: boolean;
  vibrate: boolean;
  lastTriggered?: number;
}

export interface ErrorLog {
  id: string;
  timestamp: number;
  level: "error" | "warn" | "info";
  source: string;
  message: string;
  context?: Record<string, unknown>;
}
