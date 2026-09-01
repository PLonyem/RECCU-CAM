"use client";

import { CalendarDays, ChevronLeft, ChevronRight, List, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import {
  formatTrainingDateRange,
  getTrainingCategory,
  registrationStatusLabels,
  type TrainingProgram,
} from "@/data/training-programs";

interface TrainingCalendarProps {
  events: readonly TrainingProgram[];
}

type CalendarView = "calendar" | "list";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TrainingCalendar({ events }: TrainingCalendarProps) {
  const [view, setView] = useState<CalendarView>("calendar");
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const firstDate = events.find((event) => event.startDate)?.startDate;
    if (firstDate) {
      const [year, month] = firstDate.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, 1));
    }
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });

  const monthKey = `${visibleMonth.getUTCFullYear()}-${String(visibleMonth.getUTCMonth() + 1).padStart(2, "0")}`;
  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(visibleMonth);
  const monthEvents = useMemo(
    () => events.filter((event) => event.startDate?.startsWith(monthKey)),
    [events, monthKey],
  );
  const days = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);

  function changeMonth(offset: number) {
    setVisibleMonth(
      (current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + offset, 1)),
    );
  }

  function goToCurrentMonth() {
    const now = new Date();
    setVisibleMonth(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  }

  return (
    <div>
      <Card padding="default" className="shadow-raised">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-meta uppercase text-gold-strong">Training month</p>
            <h2 className="mt-1 font-display text-h3 text-institutional" aria-live="polite">{monthLabel}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="icon" variant="secondary" onClick={() => changeMonth(-1)} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={goToCurrentMonth}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Current month
            </Button>
            <Button type="button" size="icon" variant="secondary" onClick={() => changeMonth(1)} aria-label="Next month">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <div className="mt-5 hidden border-t border-border pt-5 md:flex md:justify-end">
          <div className="inline-flex rounded-control border border-border bg-muted p-1" aria-label="Calendar view">
            <button
              type="button"
              onClick={() => setView("calendar")}
              aria-pressed={view === "calendar"}
              className="inline-flex min-h-9 items-center gap-2 rounded-control px-3 text-sm font-semibold text-muted-foreground transition-colors aria-pressed:bg-surface aria-pressed:text-institutional aria-pressed:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> Calendar
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className="inline-flex min-h-9 items-center gap-2 rounded-control px-3 text-sm font-semibold text-muted-foreground transition-colors aria-pressed:bg-surface aria-pressed:text-institutional aria-pressed:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            >
              <List className="h-4 w-4" aria-hidden="true" /> List
            </button>
          </div>
        </div>
      </Card>

      <div className="mt-6 hidden md:block">
        {view === "calendar" ? (
          <CalendarGrid days={days} events={monthEvents} month={visibleMonth.getUTCMonth()} />
        ) : (
          <EventList events={monthEvents} monthLabel={monthLabel} />
        )}
      </div>

      <div className="mt-6 md:hidden">
        <div className="mb-4 flex items-center gap-2">
          <List className="h-4 w-4 text-forest" aria-hidden="true" />
          <h2 className="font-display text-h4 text-institutional">Schedule list</h2>
        </div>
        <EventList events={monthEvents} monthLabel={monthLabel} />
      </div>
    </div>
  );
}

interface CalendarDay {
  date: Date;
  key: string;
  dayNumber: number;
}

function buildMonthDays(month: Date): CalendarDay[] {
  const first = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const gridStart = new Date(first);
  gridStart.setUTCDate(first.getUTCDate() - first.getUTCDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + index);
    return {
      date,
      key: date.toISOString().slice(0, 10),
      dayNumber: date.getUTCDate(),
    };
  });
}

function CalendarGrid({ days, events, month }: { days: CalendarDay[]; events: readonly TrainingProgram[]; month: number }) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card" role="grid" aria-label="Training calendar">
      <div className="grid grid-cols-7 border-b border-border bg-muted" role="row">
        {weekdays.map((weekday) => (
          <div key={weekday} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground" role="columnheader">
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = events.filter((event) => event.startDate === day.key);
          const inMonth = day.date.getUTCMonth() === month;
          return (
            <div
              key={day.key}
              role="gridcell"
              className={`min-h-28 border-b border-r border-border p-2 ${inMonth ? "bg-surface" : "bg-muted/50"}`}
            >
              <span className={`text-xs font-semibold ${inMonth ? "text-foreground" : "text-muted-foreground/60"}`}>
                {day.dayNumber}
              </span>
              <div className="mt-2 space-y-2">
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/vtime/programs/${event.slug}`}
                    className="block rounded-control bg-primary-50 p-2 text-xs font-semibold leading-4 text-institutional hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                  >
                    {event.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {events.length === 0 && (
        <p className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
          No verified cohorts are scheduled in this month.
        </p>
      )}
    </div>
  );
}

function EventList({ events, monthLabel }: { events: readonly TrainingProgram[]; monthLabel: string }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title={`No verified training in ${monthLabel}`}
        description="Dates, facilitators, locations, format, and capacity will appear after RECCU-CAM confirms a cohort."
        action={
          <Button asChild variant="secondary">
            <Link href="/vtime/programs">Browse program outlines</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const category = getTrainingCategory(event.category);
        return (
          <Card key={event.id} padding="default" className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                {category && <Badge variant="primary">{category.title}</Badge>}
                <Badge variant="success">{registrationStatusLabels[event.registrationStatus]}</Badge>
              </div>
              <h3 className="mt-4 font-display text-h4 text-institutional">{event.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatTrainingDateRange(event.startDate, event.endDate)}
                {event.location ? ` · ${event.location}` : ""}
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href={`/vtime/programs/${event.slug}`}>View program</Link>
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
