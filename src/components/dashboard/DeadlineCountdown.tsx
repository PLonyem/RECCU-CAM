"use client";

import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Deadline {
  name: string;
  date: string; // ISO yyyy-mm-dd
}

// Hardcoded for now, per the request — a real deadlines table/admin UI is
// a separate feature to build later, not guessed at here.
const DEADLINES: Deadline[] = [
  { name: "Q3 COBAC Report Due", date: "2026-09-30" },
];

// How far back the progress bar's "0%" point sits from each deadline. The
// spec calls for a progress bar but never defines what "elapsed" is
// measured from — there's no assignment/period-start date on a Deadline to
// anchor it to, so this is a fixed, generic reporting-period length used
// uniformly rather than inventing a specific unstated start date per item.
const LOOKBACK_DAYS = 90;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysRemaining(dateStr: string, today: Date): number {
  const deadline = new Date(`${dateStr}T00:00:00`);
  return Math.ceil((deadline.getTime() - today.getTime()) / MS_PER_DAY);
}

function urgencyColor(days: number): { text: string; bar: string } {
  if (days < 10) return { text: "text-red-600", bar: "bg-red-500" };
  if (days <= 30) return { text: "text-amber-600", bar: "bg-amber-500" };
  return { text: "text-primary-600", bar: "bg-primary-500" };
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function DeadlineCountdown() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = DEADLINES.filter((d) => daysRemaining(d.date, today) >= 0).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const primary = upcoming[0];
  const secondary = upcoming[1];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold text-lg text-gray-900">Upcoming Deadline</h2>
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>

      {!primary ? (
        <p className="mt-4 text-gray-400 text-sm">No upcoming deadlines.</p>
      ) : (
        <>
          {(() => {
            const days = daysRemaining(primary.date, today);
            const colors = urgencyColor(days);
            const elapsedPercent = Math.min(
              100,
              Math.max(0, ((LOOKBACK_DAYS - days) / LOOKBACK_DAYS) * 100)
            );

            return (
              <div className="mt-4">
                <p className="font-display text-xl font-bold text-gray-900">{primary.name}</p>
                <p className="text-gray-500 mt-0.5">{formatDate(primary.date)}</p>

                <p className={cn("text-3xl font-bold mt-3", colors.text)}>
                  {days === 0 ? "Due today" : `${days} day${days === 1 ? "" : "s"} remaining`}
                </p>

                <div className="h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
                  <div
                    className={cn("h-2 rounded-full transition-[width] duration-500 ease-out", colors.bar)}
                    style={{ width: `${elapsedPercent}%` }}
                  />
                </div>

                {secondary && (
                  <p className="text-sm text-gray-400 mt-4">
                    Next after that: {formatDate(secondary.date)}
                  </p>
                )}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
