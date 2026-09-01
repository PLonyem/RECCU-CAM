import { Container, LoadingSkeleton, Section } from "@/components/ui";

export default function SiteLoading() {
  return (
    <>
      <div className="bg-institutional py-16 sm:py-20">
        <Container>
          <LoadingSkeleton className="max-w-2xl [&_*]:bg-white/15" lines={3} />
        </Container>
      </div>
      <Section>
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="rounded-card border border-border bg-surface p-card shadow-card">
                <LoadingSkeleton lines={4} />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
