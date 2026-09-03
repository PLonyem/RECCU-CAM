import type { Metadata } from "next";
import { CalendarDays, Newspaper, Tags } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { EventCard, NewsCard } from "@/components/news/NewsCards";
import { Card, Container, EmptyState, Section, SectionHeader } from "@/components/ui";
import {
  featuredNews,
  latestNews,
  newsCategories,
  upcomingEvents,
} from "@/data/news";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "News and Events",
  description: "Verified RECCU-CAM news, institutional updates, announcements, and confirmed events.",
  path: "/news",
});

export default function NewsPage() {
  return (
    <>
      <PageIntro
        eyebrow="News & Events"
        title="Updates with accountable sources."
        description="The RECCU-CAM newsroom is the dedicated home for approved network news, announcements, affiliate updates, partnerships, and confirmed events."
      />

      <Section spacing="compact" className="border-b border-border">
        <Container>
          <SectionHeader
            eyebrow="Categories"
            title="Follow the areas relevant to your institution."
            subtitle="The public newsroom supports six editorial categories. Categories remain visible even when no approved item is currently available."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newsCategories.map((category) => (
              <Card key={category.slug} padding="compact" variant="outlined" className="h-full">
                <Tags className="h-5 w-5 text-forest" aria-hidden="true" />
                <h3 className="mt-3 font-display text-lg font-semibold text-institutional">{category.label}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{category.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <SectionHeader
            eyebrow="Featured news"
            title="Selected institutional stories."
            subtitle="Only approved, source-verified stories can appear as featured content."
          />
          {featuredNews.length > 0 ? (
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {featuredNews.map((article) => <NewsCard key={article.id} article={article} />)}
            </div>
          ) : (
            <EmptyState
              className="mt-10"
              icon={Newspaper}
              title="No featured stories are currently published"
              description="A story will appear here only after its source, publication status, and public details have been approved."
            />
          )}
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Latest news"
            title="Recent verified updates."
            subtitle="Article cards link to complete public detail pages when approved content is available."
          />
          {latestNews.length > 0 ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {latestNews.map((article) => <NewsCard key={article.id} article={article} />)}
            </div>
          ) : (
            <EmptyState
              className="mt-10"
              icon={Newspaper}
              title="No verified news is currently published"
              description="Unverified legacy articles and administrative drafts are not presented as RECCU-CAM news."
            />
          )}
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <SectionHeader
            eyebrow="Upcoming events"
            title="Confirmed dates and event details."
            subtitle="Event cards display only dates, locations, and detail links that have been verified for public release."
          />
          {upcomingEvents.length > 0 ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <EmptyState
              className="mt-10"
              icon={CalendarDays}
              title="No upcoming events are currently confirmed"
              description="Dates are never inferred. Confirmed AGMs, training activities, and institutional events will appear here after approval."
            />
          )}
        </Container>
      </Section>
    </>
  );
}
