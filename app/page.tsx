import { MonthPickerTab } from "@/components/home/MonthPickerTab";
import TransactionManager from "@/components/home/TransactionManager";
import { CalendarProvider } from "@/contexts/CalendarContext";

export default function HomePage() {
  return (
    <CalendarProvider>
      <div className="max-h-screen bg-background flex flex-col">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 flex-1 w-full flex flex-col">
          <hr className="border-muted" />
          <MonthPickerTab />
          <div className="w-full flex-1">
            <TransactionManager />
          </div>
        </main>
      </div>
    </CalendarProvider>
  );
}
