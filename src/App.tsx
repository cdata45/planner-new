import { useEffect, useState } from "react";
import { StoreProvider } from "./store";
import { BottomNav, type Page } from "./components/BottomNav";
import { Toasts } from "./components/Toasts";
import { DailyPage } from "./pages/Daily";
import { HabitsPage } from "./pages/Habits";
import { TasksPage } from "./pages/Tasks";
import { StatsPage } from "./pages/Stats";
import { SettingsPage } from "./pages/Settings";

function AppShell() {
  const [page, setPage] = useState<Page>("daily");

  // smooth scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [page]);

  return (
    <div className="min-h-screen text-[var(--color-text-primary)]">
      <main className="relative" key={page}>
        <div className="animate-fade-up">
          {page === "daily" && <DailyPage />}
          {page === "habits" && <HabitsPage />}
          {page === "tasks" && <TasksPage />}
          {page === "stats" && <StatsPage />}
          {page === "settings" && <SettingsPage />}
        </div>
      </main>
      <BottomNav active={page} onChange={setPage} />
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
