import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { placeholderPages, siteNavigation, type PlaceholderPath } from "@/data/site-navigation";

interface PlaceholderPageProps {
  params: Promise<{ slug: string[] }>;
}

function getPage(slug: string[]) {
  const path = `/${slug.join("/")}` as PlaceholderPath;
  return { path, content: placeholderPages[path] };
}

export function generateStaticParams() {
  return Object.keys(placeholderPages).map((path) => ({ slug: path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: PlaceholderPageProps): Promise<Metadata> {
  const { content } = getPage((await params).slug);
  if (!content) return {};
  return { title: content[0], description: content[2] };
}

export default async function PlaceholderPage({ params }: PlaceholderPageProps) {
  const { path, content } = getPage((await params).slug);
  if (!content) notFound();
  const [title, , description] = content;
  const isSitemap = path === "/sitemap";

  return (
    <>
      <PageHero
        title={title}
        subtitle={description}
        breadcrumb={[{ label: "Home", href: "/" }, { label: title, href: path }]}
      />
      <Section>
        <Container size={isSitemap ? "default" : "reading"}>
          {isSitemap ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {siteNavigation.map((item) => (
                <section key={item.label}>
                  <Link href={item.href} className="font-display text-h4 text-institutional hover:text-forest">{item.label}</Link>
                  {item.children && (
                    <ul className="mt-4 space-y-3">
                      {item.children.map((child) => (
                        <li key={`${child.href}-${child.label}`}><Link href={child.href} className="text-sm text-muted-foreground hover:text-institutional">{child.label}</Link></li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-panel border border-border bg-surface p-7 shadow-card sm:p-10">
              <span className="grid h-12 w-12 place-items-center rounded-control bg-gold-subtle text-gold-strong"><Clock3 className="h-6 w-6" /></span>
              <p className="mt-6 text-meta uppercase text-gold-strong">Content in preparation</p>
              <h2 className="mt-2 font-display text-h3 text-institutional">A lightweight route is in place.</h2>
              <p className="mt-4 text-body text-muted-foreground">This page prevents a dead end while its verified institutional content and service details are reviewed. No unconfirmed claims have been added.</p>
              <Link href="/contact" className={`${buttonVariants({ variant: "secondary" })} mt-7`}>
                Contact RECCU-CAM <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
