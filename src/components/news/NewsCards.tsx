import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import {
  formatNewsDate,
  getNewsCategory,
  type PublishedNewsArticle,
  type PublishedNewsEvent,
} from "@/data/news";

export function NewsCard({ article }: { article: PublishedNewsArticle }) {
  const category = getNewsCategory(article.category);

  return (
    <Card padding="default" className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="primary">{category?.label ?? article.category}</Badge>
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {formatNewsDate(article.publishedAt)}
        </span>
      </div>
      <h3 className="mt-5 font-display text-h4 text-institutional">{article.title}</h3>
      <p className="mt-3 flex-1 text-body text-muted-foreground">{article.summary}</p>
      <Link href={`/news/${article.slug}`} className="mt-6 inline-flex w-fit items-center gap-2 rounded-sm text-sm font-semibold text-forest hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
        Read article <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}

export function EventCard({ event }: { event: PublishedNewsEvent }) {
  const category = getNewsCategory(event.category);

  return (
    <Card padding="default" className="flex h-full flex-col border-primary-200">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="accent">{category?.label ?? event.category}</Badge>
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          {formatNewsDate(event.startDate)}
        </span>
      </div>
      <h3 className="mt-5 font-display text-h4 text-institutional">{event.title}</h3>
      <p className="mt-3 flex-1 text-body text-muted-foreground">{event.summary}</p>
      {event.location && (
        <p className="mt-4 inline-flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {event.location}
        </p>
      )}
      <Link href={`/news/${event.slug}`} className="mt-6 inline-flex w-fit items-center gap-2 rounded-sm text-sm font-semibold text-forest hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
        View event details <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}
